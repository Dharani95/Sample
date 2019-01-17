sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"com/incture/util/common",
	"sap/ui/core/routing/History"
], function(Controller, JSONModel, MessageToast, common, History) {

	return Controller.extend("com.incture.controller.PMEntry", {
		onInit: function() {
			var that = this;
			this.ownerComponent = this.getOwnerComponent();
			this._router = this.ownerComponent.getRouter();
			this._router.getRoute("assignResources").attachPatternMatched(this._routePatternMatched, this);
			//var sLoggedInId = this.ownerComponent.getModel("LoggedInUser").getData().uniqueName;
			//this.fetchProjectCodes(sLoggedInId);
			var oLoggedInModel = new JSONModel();
			oLoggedInModel.loadData("/tscm/umeUser/loggedIn");
			oLoggedInModel.attachRequestCompleted(function(oEvent){
				that.getView().setBusy(false);
				if(oEvent.getParameter("success")){
					that.oData = oEvent.getSource().getData();
					that.fetchAccountNames(that.oData.uniqueName);
					//that.fetchProjectCodes(that.oData.uniqueName);
				 } else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
		},
		
		fetchAccountNames:function(id){
			var oView = this.getView();
			var oModel = new JSONModel();
			oModel.loadData("/tscm/ProjectCode/getAccountNames/"+id);
			oModel.attachRequestCompleted(function(oEvent){
				oView.setBusy(false);
				if(oEvent.getParameter("success")){
					var data = oModel.getData();
					if (!(data.idAndNameDto instanceof Array)) {
						data.idAndNameDto = [data.idAndNameDto];
			    	}
					oView.setModel(oModel,"AccountDetails");
					oView.getModel("AccountDetails").refresh();
					
				 } else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
		},
		
		fetchProjectCodes:function(id){
			var oView = this.getView();
			var oModel = new JSONModel();
			var url="/tscm/ProjectCode/fetchAllProjectCodes?accountName="+id+"&projManagerId="+this.oData.uniqueName;
			
			oModel.loadData(url);
			oModel.attachRequestCompleted(function(oEvent){
				oView.setBusy(false);
				if(oEvent.getParameter("success")){
					var data = oModel.getData();
					if (!(data.idAndNameDto instanceof Array)) {
						data.idAndNameDto = [data.idAndNameDto];
			    	}
					oView.setModel(oModel,"ProjectDetails");
					oView.getModel("ProjectDetails").refresh();
				 } else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
		},
		
		_routePatternMatched: function(oEvent){
			var oView = this.getView();
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			if(sPreviousHash !== "matchedResources") {
				var oTable = oView.byId("idPlanResourceTbl");
				if(oTable != undefined){
					oTable.removeAllColumns();
					common.clearProjectDetails(this.ownerComponent);
				}
			}
		},
		
		onSearch:function(oEvent){
			var oView = this.getView();
			var pCode=oView.byId("idProject").getSelectedKey().split("-")[0];
			var checkPName=oView.byId("idProject").getSelectedKey().split("-")[2];
			if(checkPName==undefined){
				var pName=oView.byId("idProject").getSelectedKey().split("-")[1];
			}
			else{
			var pName=oView.byId("idProject").getSelectedKey().split("-")[1]+oView.byId("idProject").getSelectedKey().split("-")[2];
			}
			this.jData = {
					"projectCode" :pCode,
					"projectName" : pName
					};
				editableModel = new sap.ui.model.json.JSONModel(this.jData);
			var inputs = [ oView.byId("idStartDate"),
			              oView.byId("idEndDate"),
			              oView.byId("idRlsUploader")
			             ];
			var canContinue = true;
			jQuery.each(inputs, function (i, input) {
			if (!input.getValue()) {
			input.setValueState("Error");
			canContinue = false;
			}
			});
			var oProject=oView.byId("idProject").getSelectedKey().split("-")[0];
			//var oProject = oView.byId("idProject").split("-")[0];
			
			if(!oProject){
			oProject.addStyleClass("SelectError");
			canContinue = false;
			}
			if(canContinue) {
			var mParameter = {};
			mParameter.projStartDate = this.getView().byId("idStartDate").getValue() + "T00:00:00";
			mParameter.projEndDate = this.getView().byId("idEndDate").getValue() + "T00:00:00";
			mParameter.resourceDtoList = this.getView().getModel("RLSData").getData().rlsDtoList;
			this.getView().setBusy(true);
			var url = "/tscm/Allocation/searchResources";
			common.postData(url, JSON.stringify(mParameter), this.fnDemandSearchCompleted.bind(this));
			} else {
			MessageToast.show("Please fill in all the mandatory fields");
			}
			},

		fnDemandSearchCompleted:function(oEvent){
			this.getView().setBusy(false);
			if(oEvent.getParameter("success")){
				var data = oEvent.getSource().getData();
				//Bug fix for TSCT-145
				if(data.isNull=="false"){
					MessageToast.show("RLS Dates do not match the required dates");
				} else{
				if(data){
				if (!(data.listAllocationDto instanceof Array)) {
					data.listAllocationDto = [data.listAllocationDto];
		    	}
				}
				this.ownerComponent.getModel("ResourceMatched").setData(data);
				var copyData=jQuery.extend(true, {},data);
				this.getOwnerComponent().getModel("oFlagModel").setData(copyData);
				this.ownerComponent.getRouter().navTo("matchedRsrc");
				
				}
				
				
			 } 
			else {
				 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				}
		},
		
		onClear:function(oEvent){
			common.clearProjectDetails(this.ownerComponent);
		},
		
		
		onAccountNameChange:function(oEvent){
			this.getView().byId("idProject").setEnabled(true);
			var oSource = oEvent.getSource();
			if(oSource.getSelectedKey()){
			oSource.removeStyleClass("SelectError");
			}
			var oBindingContext = oEvent.getParameter("selectedItem").getBindingContext("AccountDetails");
			var sPath = oBindingContext.sPath;
			var oCurrContext = oBindingContext.getModel().getProperty(sPath);
			this.getView().byId("idAccountName").setValue(oCurrContext.name);
			this.fetchProjectCodes(oCurrContext.name);
			},
		/*
		onProjectNameChange:function(oEvent){
			var oSource = oEvent.getSource();
			if(oSource.getSelectedKey()){
			oSource.removeStyleClass("SelectError");
			}
			var oBindingContext = oEvent.getParameter("selectedItem").getBindingContext("ProjectDetails");
			var sPath = oBindingContext.sPath;
			var oCurrContext = oBindingContext.getModel().getProperty(sPath);
			this.getView().byId("idProjectCode").setValue(oCurrContext.projectCode);
			},*/

		
		//Auto-population of Project Name.
		/*onProjectCodeChange:function(oEvent){
			var oSource = oEvent.getSource();
			if(oSource.getSelectedKey()){
				oSource.removeStyleClass("SelectError");
			}
			var oBindingContext = oEvent.getParameter("selectedItem").getBindingContext("ProjectDetails");
			var sPath = oBindingContext.sPath;
			var oCurrContext = oBindingContext.getModel().getProperty(sPath);
			this.getView().byId("idProjectName").setValue(oCurrContext.projectName);
		},*/
		
		/*onAfterRendering:function(){
			var jData = {
					"projectCode" : this.getView().byId("idProject").getSelectedKey(), };
				editableModel = new sap.ui.model.json.JSONModel(jData);
		},*/
		onUpload: function(oEvent){
			var oFileUploader = this.getView().byId("idRlsUploader");
			if(!oFileUploader.getValue()){
				MessageToast.show("Please select file to upload");
				return;
			}
			var url = "/tscm/RLS/readUploadExcel" ;
			this.getView().setBusy(true);
			common.postData(url, this.uploadParameters, this.fnRlsDataCompleted.bind(this));
		},
		
		fnRlsDataCompleted:function(oEvent){
			this.getView().setBusy(false);
			var oRlsModel = this.ownerComponent.getModel("RLSModel");
			var oModel = oEvent.getSource();
			
			var oModelCopy = this.ownerComponent.getModel("oModelCopy");
			var dataCopy=oModel.getData();
			oModelCopy.setData(dataCopy);
			this.getView().setModel(oModel, "RLSData");
			if(oEvent.getParameter("success")){
				  this.getView().setModel(oModel, "RLSData");
		    	  var data = jQuery.extend(true, {},oModel.getData());
		    	  this.addTableColumns(parseInt(oModel.getData().noOfWeeks));
		    	  if (!(data.rlsDtoList instanceof Array)) {
	    			  data.rlsDtoList = [data.rlsDtoList];
		    	  } 
		    	  data.rlsDtoList.forEach(function(item, i){
		    		  item.serialNo = i + 1;
		    		  var aSubItems;
		    		  if(item.weeks){
		    		  if (!(item.weeks instanceof Array)) {
		    			  aSubItems = [item.weeks];
		    		  } else {
		    			  aSubItems = item.weeks;
		    		  }
		    		  aSubItems.forEach(function(subItem, j){
		    			  item["W"+subItem.weekNo] = subItem.value;
		    		  });
		    		  }
		    	  });
		    	  oRlsModel.setData(data.rlsDtoList);
		      } else {
		    	  common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
		      }
		},

		addTableColumns:function(data){
			var oView = this.getView();
			var oTable = oView.byId("idPlanResourceTbl");
			if(data === 0){
				oTable.unbindRows();
				return;
			}
			oTable.removeAllColumns();
			oTable.addColumn(new sap.ui.table.Column({
				width: "4rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>SNo}"}),
				template: new sap.m.Text({text:"{RLSModel>serialNo}"})
			}));
			oTable.addColumn(new sap.ui.table.Column({
				width: "6rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>SubGrade}"}),
				template: new sap.m.Text({text:"{RLSModel>subGrade}"})
			}));
			
			oTable.addColumn(new sap.ui.table.Column({
				width: "11rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>PrimarySkills}"}),
				template: new sap.m.Text({text:"{RLSModel>primarySkills}"})
			}));
			oTable.addColumn(new sap.ui.table.Column({
				width: "11rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>ONSHORE_OFFSITE}"}),
				template: new sap.m.Text({text:"{RLSModel>offshore}"})
			}));
			for(var i=1; i<= data; i++){
				oTable.addColumn(new sap.ui.table.Column({
					width: "3rem",
					resizable: false,
					label: new sap.m.Label({text: "W"+i}),
					template: new sap.m.Text({text:"{RLSModel>W"+i+"}"})
				}));
			}
			oTable.bindRows("RLSModel>/");
		},
		
		onStartDateChange : function(oEvent) {
			var oView = this.getView();
			var oStartDate = oEvent.getSource();
			var oEndDate = oView.byId("idEndDate");
			var sStartDateVal = oStartDate.getDateValue();
			if(!sStartDateVal){
				oStartDate.setValueState("None");
				oEndDate.setValue("");
				return;
			}
			var sEndDateVal = oEndDate.getDateValue();
			if(oEvent.getParameter("valid")) {
				oStartDate.setValueState("None");
				var date = new Date();
				date.setDate(date.getDate() - 1);
				if(sStartDateVal < date){
					MessageToast.show("Start Date cannot be earlier than today");
					oStartDate.setValueState("Error")
					oStartDate.setValue("");
				} else if(sEndDateVal){
					if(sStartDateVal > sEndDateVal){
						MessageToast.show("Start Date cannot be greater than end date");
						oStartDate.setValueState("Error")
						oStartDate.setValue("");
					}
				}else {
					/*Start of TSCM-151 Bug Fix*/
					if(sStartDateVal.getDay()!=1){				
						oStartDate.setValueState("Error")
						oStartDate.setValue("");
						MessageToast.show("Start Date should be Monday");
						return;
					}
					/*End of TSCM-151 Bug Fix */
				}
			} else {
				oStartDate.setValueState("Error");
			}
		},
		
		onEndDateChange : function(oEvent) {
			var oView = this.getView();
			var oEndDate = oEvent.getSource();
			if(oEvent.getParameter("valid")) {
				oEndDate.setValueState("None");
			} else {
				oEndDate.setValueState("Error")
				return;
			}
			var sStartDateVal = oView.byId("idStartDate").getDateValue();
			if(!sStartDateVal){
				MessageToast.show("Start Date cannot be empty");
				oEndDate.setValue("");
				return;
			}
			var sEndDateVal = oEndDate.getDateValue();
			if(!sEndDateVal || !sStartDateVal){
				return;
			}
			if(sEndDateVal < sStartDateVal) {
				MessageToast.show("End date cannot be earlier than Start date");
				oEndDate.setDateValue(null);
				oEndDate.setValueState("Error");
			}
		},
		
		onValueChange:function(oEvent){
			var that = this,
			    sFileName = oEvent.getParameter("newValue");
			if(!sFileName){
				MessageToast.show("Please select a file to upload");
			} else {
				oEvent.getSource().setValueState("None");
			}
			var fileList = oEvent.oSource.oFileUpload.files[0];  
			var reader = new FileReader();
			reader.onload = function(event) {
				 var s = event.target.result;
				 var base64 = s.substr(s.lastIndexOf(','));
				 base64 = base64.split(",")[1];
				 that.uploadParameters =  base64;
				 var base64string=	 {
						 "base64string":base64
					 }
				 rlsSaveModel = new sap.ui.model.json.JSONModel(base64string);
				 
			};
			if (fileList) {
				reader.readAsDataURL(fileList); 
			}			
		},
		
		handleTypeMissmatch:function(oEvent){
			var aFileTypes = oEvent.getSource().getFileType();
			jQuery.each(aFileTypes, function(key, value) {aFileTypes[key] = "*." +  value});
			var sSupportedFileTypes = aFileTypes.join(", ");
			MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
				" is not supported. Choose one of the following types: " + sSupportedFileTypes, {
				duration:4000,
				width:"25em"
			});
		}
		
	});
});



