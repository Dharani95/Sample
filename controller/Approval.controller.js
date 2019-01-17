sap.ui.define([
				"sap/ui/core/mvc/Controller",
				"sap/ui/model/json/JSONModel",
				"sap/m/MessageToast",
				"com/incture/util/common",
				"sap/ui/model/Filter",
				"sap/ui/model/FilterOperator"
				], function(Controller, JSONModel, MessageToast, common,Filter,FilterOperator) {
"use strict";

return Controller.extend("com.incture.controller.Approval", {
		onInit: function() {
			this.ownerComponent = this.getOwnerComponent();
			this._router = this.ownerComponent.getRouter();
			if (jQuery.sap.getUriParameters().get("taskId")) {
				this.taskInstanceId = jQuery.sap.getUriParameters().get("taskId");
				this.getBPMContextData(this.taskInstanceId);
			}

		},
		
		getBPMContextData:function(taskId){
			var that = this;
			var oApprovalModel = this.ownerComponent.getModel("ApprovalModel");
			var oBPMProcessModel = new sap.ui.model.odata.ODataModel("/bpmodata/taskdata.svc/"+taskId,true);
			var sUrl = "/InputData('"+taskId+"')/DT_Allocation";
			this.getView().setBusy(true);
			oBPMProcessModel.read(sUrl, null, null, false, 
					function(data, res){
						that.getView().setBusy(false);
						oApprovalModel.setData(data);
						that.getResourceList();
					},
					function(err){
						that.getView().setBusy(false);
						common.errorDialog(err.response.statusText + "\nPlease contact your system administrator");
					}
			);
		},
		
		getResourceList:function(){
			var that = this;
			var oModelData = this.ownerComponent.getModel("ApprovalModel").getData();
			var oListModel = this.ownerComponent.getModel("ApprovalModelList");
			var sUrl = "/tscm/Allocation/getAllocationByProjectCode?projectCode="+oModelData.projectCode+"&demandId="+oModelData.demandId;
			var sTaskName = oModelData.taskName;
			var oModel = new JSONModel();
			oModel.loadData(sUrl);
			oModel.attachRequestCompleted(function(oEvent){
				that.getView().setBusy(false);
				if(oEvent.getParameter("success")){
					that.aData = oEvent.getSource().getData();
					
					if (!(that.aData.allocationDto instanceof Array)) {
		    			  that.aData.allocationDto = [that.aData.allocationDto];
		    		}
					oListModel.setData(that.aData);
					oListModel.refresh(true);
					} 
				else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
			
			
			
		},
		
		disableFormatter:function(allocationType,approvalStatus,dmApprovalStatus){
			var oApprovalModelData = this.ownerComponent.getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
						if(sTaskName=="DM"&&(approvalStatus=="false")){
					return false;
				}			
				if(sTaskName=="DM"&&allocationType=="Exact"){
					return false;
				}
				if(sTaskName=="Finance"&&((dmApprovalStatus=="false")||dmApprovalStatus==undefined)){
					return false;
				}			
				if(sTaskName=="Finance"&&allocationType!="Exact+1"){
					return false;
				}
				return true;
		},
		
		
		
		stateFormatter: function(sVal){
			if(!sVal) return;
			if(sVal === "Exact"){
				return "Success";
			} else if(sVal==="Exact-1") {
				return "Warning";
			}
			else{
				return "Error";
			}
		},
		
		
		onRlsDisplay:function(oEvent){
			var oEve=oEvent;
		var oView =  this.getView();
		if (!this.oRlsDisplayDialog) {
			this.oRlsDisplayDialog = sap.ui.xmlfragment(oView.getId(),
					"com.incture.view.rlsDisplay", this);
			oView.addDependent(this.oRlsDisplayDialog);
		}
		this.fnRlsDataCompleted(oEve);
		this.oRlsDisplayDialog.open();
	},
		
		fnRlsDataCompleted:function(oEvent){
			 var that=this;
			var oRlsDisplayModel = this.ownerComponent.getModel("RLSDisplayModel");
			var oModelData = this.ownerComponent.getModel("ApprovalModel").getData();
			var url = "/tscm/RLS/getRLS/"+oModelData.demandId ;
			that.getView().setBusy(true);
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.loadData(url,null,true);
				oModel.attachRequestCompleted(function(oEvent){
				if(oEvent.getParameter("success")){
		    	  var data = jQuery.extend(true, {},oModel.getData());
		    	  that.addTableColumns(parseInt(oModel.getData().noOfWeeks));
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
		    	  oRlsDisplayModel.setData(data.rlsDtoList);
		      } 
				
				else {
		    	  common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
		      }
	});
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
				template: new sap.m.Text({text:"{RLSDisplayModel>serialNo}"})
			}));
			oTable.addColumn(new sap.ui.table.Column({
				width: "6rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>SubGrade}"}),
				template: new sap.m.Text({text:"{RLSDisplayModel>subGrade}"})
			}));
			
			oTable.addColumn(new sap.ui.table.Column({
				width: "11rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>PrimarySkills}"}),
				template: new sap.m.Text({text:"{RLSDisplayModel>primarySkills}"})
			}));
			oTable.addColumn(new sap.ui.table.Column({
				width: "11rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>ONSHORE_OFFSITE}"}),
				template: new sap.m.Text({text:"{RLSDisplayModel>offshore}"})
			}));
			for(var i=1; i<= data; i++){
				oTable.addColumn(new sap.ui.table.Column({
					width: "3rem",
					resizable: false,
					label: new sap.m.Label({text: "W"+i}),
					template: new sap.m.Text({text:"{RLSDisplayModel>W"+i+"}"})
				}));
			}
			oTable.bindRows("RLSDisplayModel>/");
		},
		
		onClose:function(oEvent){
			this.oRlsDisplayDialog.close();
			this.getView().setBusy(false);
		},
		
		onApprovalPush:function(oEvent){
			var oEve=oEvent;
			var that=this;
			 that.checkSelection=true
			 
			var oApprovalModelData = that.ownerComponent.getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			that.sEvtText = oEvent.getSource().getSelectedButton().getText();
			that.selectedRowData = oEvent.getSource().getBindingContext("ApprovalModelList").getObject();
			var status=that.selectedRowData.allocationType;
			if(sTaskName=="Finance"){
				that.fmApprovalPush(oEve);
			}
			if(sTaskName=="DM"){
				that.dmApprovalPush(oEve);
			}
			if(sTaskName=="RM"){
			if((sTaskName=="RM")&&(status=="Exact")){
			if(that.sEvtText === "Approve"){
				that.selectedRowData.is_Selected = "true";
				that.selectedRowData.requestStatus = "Approved";
				that.selectedRowData.allocationStatus = "Allocated";
				that.selectedRowData.rmApproval="true";
				
			} else {
				
				
				that.selectedRowData.is_Selected = "false";
				that.selectedRowData.requestStatus = "Rejected";
				that.selectedRowData.rmApproval="false";
				that.selectedRowData.allocationStatus = "Rejected";
			
			}
			}
			else{
				if(that.sEvtText === "Approve"){
					that.selectedRowData.rmApproval="true";
					that.selectedRowData.requestStatus = "Approved";
					that.selectedRowData.allocationStatus = "Allocated";
					}
				else{
					that.selectedRowData.rmApproval="false";
					that.selectedRowData.is_Selected = "false";
					that.selectedRowData.allocationStatus = "Rejected";
					that.selectedRowData.requestStatus = "Rejected";
				}
			}
		}
		},
		
		dmApprovalPush:function(oEvent){
			
			var that=this;
			var oApprovalModelData = that.ownerComponent.getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			that.sEvtText = oEvent.getSource().getSelectedButton().getText();
			that.selectedRowData = oEvent.getSource().getBindingContext("ApprovalModelList").getObject();
			var status=that.selectedRowData.allocationType;
			if(status=="Exact-1"){
				
				if(that.sEvtText === "Approve"){
					//Exact-1 and Approved
					that.selectedRowData.is_Selected = "true";
					that.selectedRowData.requestStatus = "Approved";
					that.selectedRowData.allocationStatus = "Allocated";
					that.selectedRowData.dmApproval="true";
					
				} else {
					//Exact-1 and Rejected.
					that.selectedRowData.is_Selected = "false";
					that.selectedRowData.allocationStatus = "Rejected";

					that.selectedRowData.requestStatus = "Rejected";
					that.selectedRowData.dmApproval="false";
				}
				
			}
			if(status=="Exact+1"){
				if(that.sEvtText === "Approve"){
					that.selectedRowData.dmApproval="true";
				//that.nonCheckableRecords.push(that.selectedRowData);
				}
				else{
					that.selectedRowData.is_Selected = "false";
					that.selectedRowData.allocationStatus = "Rejected";
					that.selectedRowData.requestStatus = "Rejected";
					that.selectedRowData.dmApproval="false";
					}
			}
		},
		
		fmApprovalPush:function(oEvent){
			
			var that=this;
			var oApprovalModelData = that.ownerComponent.getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			that.sEvtText = oEvent.getSource().getSelectedButton().getText();
			that.selectedRowData = oEvent.getSource().getBindingContext("ApprovalModelList").getObject();
			var status=that.selectedRowData.allocationType;
			
				if(status=="Exact+1"){
				
				if(that.sEvtText === "Approve"){
					//Exact+1 and Approved
					that.selectedRowData.is_Selected = "true";
					that.selectedRowData.requestStatus = "Approved";
					that.selectedRowData.allocationStatus = "Allocated";
					that.selectedRowData.fmApproval="true";
					} 
				else {
					//Exact+1 and Rejected.
					that.selectedRowData.is_Selected = "false";
					that.selectedRowData.requestStatus = "Rejected";
					that.selectedRowData.allocationStatus = "Rejected";
					that.selectedRowData.fmApproval="false";
					
				}
				
			}
			
			
		},
		//Bug fix for TSCT-141
		onApproveReject:function(oEvent){
			var oApprovalModelData = this.ownerComponent.getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			var aParams=this.getView().getModel("ApprovalModelList").getData().allocationDto;
			if(sTaskName=="RM")
			{
				for (var i = 0; i<aParams.length; i++) {
					if ((aParams[i].allocationStatus)=="Rejected") {
						if(!aParams[i].commentValue || aParams[i].commentValue == "") {
							MessageToast.show("Comments are Mandatory on Rejection");
							return false;
							}
						}
						if ((aParams[i].requestStatus)=="Approval Pending") {
							MessageToast.show("Please approve or reject all the records");
							return false;
							}
					}
			}
			//----
			if(sTaskName=="DM")
				{
			for (var i = 0; i<aParams.length; i++) {
					if ((aParams[i].dmApproval)=="false") {
						if(!aParams[i].commentValue || aParams[i].commentValue == "") {
							MessageToast.show("Comments are Mandatory on Rejection");
							return false;
						}
					}
					var approvalStatus = (sTaskName=="DM" ? aParams[i].rmApproval :( sTaskName=="Finance" ?aParams[i].dmApproval: ""));
					if((approvalStatus=="true" && aParams[i].allocationType!="Exact")&&(aParams[i].selectedIndex==-1)) {
						MessageToast.show("Please approve or reject all the records");
						return false;
					}
				}
				
			}
			//-------
			if(sTaskName=="Finance")
				{
				for (var i = 0; i<aParams.length; i++) {
					if ((aParams[i].fmApproval)=="false") {
						if(!aParams[i].commentValue || aParams[i].commentValue == "") {
							MessageToast.show("Comments are Mandatory on Rejection");
							return false;
							}
						}
						var approvalStatus = (sTaskName=="DM" ? aParams[i].rmApproval :( sTaskName=="Finance" ?aParams[i].dmApproval: ""));
						if((approvalStatus=="true" && aParams[i].allocationType=="Exact+1")&&(aParams[i].selectedIndex==-1)) {
							MessageToast.show("Please approve or reject all the records");
							return false;
						}
					
					}
					
				}
				//----
			
			if(!(this.checkSelection)){
				MessageToast.show("Please approve or reject all the records");
			}else{
			
			this.sEvtText = oEvent.getSource().getText();
			common.confirmationDialog("Are you sure you want to " + this.sEvtText, this.onApproveRejectConfirm.bind(this));
			}
			},

		
		onApproveRejectConfirm:function(action){
				if(action==="OK") {
					var that = this;
					this.selectedRowData;
					var sVal;
					if(this.sEvtText === "Submit"){
						sVal = true;
					} else {
						sVal = false;
					}
					this.getView().setBusy(true);
					var oClaimModel = new sap.ui.model.odata.ODataModel("/bpmodata/tasks.svc");
					oClaimModel.attachMetadataLoaded(function(oEvent){
						that.fnClaimService(oClaimModel, sVal); 
					});
				}		
			
		},
		//End of Bug Fix for TSCT-141
		fnClaimService: function(oClaimModel, sVal){
			var that = this;
			oClaimModel.create("/Claim?InstanceID='"+that.taskInstanceId+"'", "", null,
					function(data, res){
						that.getView().setBusy(false);
						that.completeTask(sVal);
					},
					function(err){
						that.getView().setBusy(false);
						common.errorDialog(err.response.statusText + "\nPlease contact your system administrator");
					}
			);
		},
		
		completeTask: function(val){
			var that = this;
			var oCompleteProcess =  new sap.ui.model.odata.ODataModel("/bpmodata/taskdata.svc/"+ this.taskInstanceId, true);
			oCompleteProcess.attachMetadataLoaded(function(oEvent){
				that.fnCompleteService(oCompleteProcess, val);
			});
		}, 
		
		fnCompleteService: function(oCompleteProcess, val) {
			
			var that = this;
			that.tVal=val;
			var oApprovalModelData = this.ownerComponent.getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			var dParams=[];
			dParams=this.getView().getModel("ApprovalModelList").getData().allocationDto;

			var obj = {
					"taskName":sTaskName,
					"listAllocationDto":dParams
					};
						var sUrl = "/tscm/Allocation/getAllocationType";
			this.getView().setBusy(true);
			common.postData(sUrl, JSON.stringify(obj), this.fnAttachRequestCompleted.bind(this));

			},
		
		fnAttachRequestCompleted: function(oEvent){
			var that=this;
			that.getView().setBusy(false);
			if(oEvent.getParameter("errorobject").statusCode === 200){
				 that.allocData=oEvent.getParameter("errorobject").responseText;
			}
			
			var data = {
					"DT_Allocation":{
						"isApproved":that.tVal,
						"allocationType":that.allocData
					}
				};
			var oCompleteProcess1 =  new sap.ui.model.odata.ODataModel("/bpmodata/taskdata.svc/"+ that.taskInstanceId, true);

		oCompleteProcess1.create("/OutputData", data, null, 
				function(data, res){
					that.getView().setBusy(false);
					that.taskInstanceId = "";
						that.submitAllocation();
				}, 
				function(err){
					that.getView().setBusy(false);
					common.errorDialog(err.response.statusText + "\nPlease contact your system administrator");
				}
		)
		},
		
		fnSubmitResourcesCompleted: function(oEvent){
			if(oEvent.getSource().getData().success=="true"){
				common.successDialog("Resources Submitted Successfully", this.onSuccess.bind(this));
			}
			else{
				common.errorDialog(oEvent.getSource().getData().message + "\nPlease contact your system administrator");
			}
		},
		
		onSuccess:function(action){
			if(action === "OK"){
				this._router.navTo("Inbox");
				//Bug fix for TSCT-149
				location.search="";
				location.refresh();
			}
		},
	
		
		submitAllocation: function(){
			var that = this;
			var oModelData = that.ownerComponent.getModel("ApprovalModelList").getData();
			var oApprovalModelData = that.ownerComponent.getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			var aParams = [];
			aParams=this.getView().getModel("ApprovalModelList").getData().allocationDto;
			//-----------------------------------------------------------------------
				if(sTaskName === "Finance"||that.allocData=="Exact"){
					var isFinalApproval=true;
				}
				else{
					var isFinalApproval=false;

				}
			//-----------------------------------------
			var obj = {
					"isNull": isFinalApproval,
					"listAllocationDto":aParams	};
			var sUrl = "/tscm/Allocation/updateMultipleAllocations";
			that.getView().setBusy(true);
			common.postData(sUrl, JSON.stringify(obj), that.fnSubmitResourcesCompleted.bind(that));
		},
		/* Start of Message Pop Over changes */
		
		onMessageAddition:function(oEvent){
		var that=this;
		var oView = this.getView();
		        var oDialog = oView.byId("inctureMDComments");
		        var oTableModel = this.ownerComponent.getModel("ApprovalModelList")
		        var oApprovalModelData = this.ownerComponent.getModel("ApprovalModel").getData();
		var sTaskName = oApprovalModelData.taskName;
		var selectedPath = oEvent.getSource().getBindingContext("ApprovalModelList").sPath.split("/")[2];
		var selRecord = oEvent.getSource().getBindingContext("ApprovalModelList").oModel.getData().allocationDto[selectedPath];
		var commentList={};
		        commentList.notifications=[];
		        if(selRecord.rmComment!==undefined)
		        {
		            var obj={
		            "role":"RM",
		                "msg" :selRecord.rmComment,
		           "commentor":"Commented by RM"}
		            commentList.notifications.push(obj);
		        }
		        
		         if(selRecord.pmComment!==undefined)
		        {
		        var obj={
		        "role":"PM",
		                "msg" :selRecord.pmComment,
		           "commentor":"Commented by PM"}
		            commentList.notifications.push(obj);
		        }
		         if(selRecord.dmComment!==undefined)
		        {
		        var obj={
		        "role":"DM",
		                "msg" :selRecord.dmComment,
		           "commentor":"Commented by DM"}
		            commentList.notifications.push(obj);
		        }
		         if(selRecord.fmComment!==undefined)
		        {
		        var obj={
		        "role":"Finance",
		                "msg" :selRecord.fmComment,
		           "commentor":"Commented by FM"}
		            commentList.notifications.push(obj);
		        }
		      //  var selObj={"selIndex":selectedPath}
		      //  commentList.notifications.push(selObj); 
		         commentList.selIndex= selectedPath;
		        var oModel = that.ownerComponent.getModel("oCommentsModel")
		        oModel.setData(commentList);
		        
		        // create dialog lazily
		        if (!oDialog) {
		           // create dialog via fragment factory
		           oDialog = sap.ui.xmlfragment(oView.getId(), "com.incture.view.comments", this);
		           oView.addDependent(oDialog);
		        }
		        oDialog.openBy(oEvent.getSource());
		        this.index = oEvent.getSource().getBindingContext("ApprovalModelList").sPath.split("/")[2];
		        
		        var approvalStatus = (sTaskName=="DM" ? selRecord.rmApproval :( sTaskName=="Finance" ?selRecord.dmApproval: ""));
		        
		        if(sTaskName=="DM"&&(approvalStatus=="false")){
		        	oModel.getData().enableFlag=false;
		        	oModel.refresh();
				}			
				if(sTaskName=="DM"&& selRecord.allocationType=="Exact"){
					oModel.getData().enableFlag=false;
					oModel.refresh();
				}
				if(sTaskName=="Finance"&&((approvalStatus=="false"))){
					oModel.getData().enableFlag=false;
					oModel.refresh();
				}			
				if(sTaskName=="Finance"&& selRecord.allocationType!="Exact+1"){
					oModel.getData().enableFlag=false;
					oModel.refresh();
				}
				var oFeedItem = this.getView().byId("feedInputId");
				oFeedItem.setValue("");
		},
		
		onPost:function(oEvent){
		var oApprovalModelData = this.ownerComponent.getModel("ApprovalModel").getData();
		var sTaskName = oApprovalModelData.taskName;
		var sValue = oEvent.getParameter("value");
		var allocationDto = this.ownerComponent.getModel("ApprovalModelList").getData().allocationDto;
		allocationDto[this.index].commentValue = sValue;
		this.ownerComponent.getModel("ApprovalModelList").refresh();
		var oModel = this.ownerComponent.getModel("oCommentsModel");
		 var oModelData = oModel.getData().notifications;
		     var oApprovalModelTableData = this.ownerComponent.getModel("ApprovalModelList").getData().allocationDto;
		     var selIndex = oModel.getData().selIndex;
		     //feedInputId
		 switch(sTaskName){
		  
		 case "RM":
		 var obj={
				 	"role":"RM",
		            "msg" :sValue,
		           "commentor":"Commented by RM"}
		 oApprovalModelTableData[selIndex].rmComment= sValue;
		 break;
		 case "DM":
		 var obj={
				 	"role":"DM",
		           "msg" :sValue,
		           "commentor":"Commented by DM"}
		 oApprovalModelTableData[selIndex].dmComment= sValue;
		 break;
		 case "Finance":
		 var obj={
				 	"role":"Finance",
		            "msg" :sValue,
		           "commentor":"Commented by FM"}
		 oApprovalModelTableData[selIndex].fmComment= sValue;
		 break;
		 case "PM":
		 var obj={
		            "role":"PM",
		             "msg" :sValue,
		           "commentor":"Commented by PM"}
		 oApprovalModelTableData[selIndex].pmComment= sValue;
		 break;
		default:
			break;
		 }
		 
		 for (var i in oModelData) {
			 if(oModelData[i].role==sTaskName){
				 oModelData.splice(i,1);
			 }
		}
		 oModelData.push(obj);
		 
		 oModel.refresh();
		 this.ownerComponent.getModel("ApprovalModelList").refresh();
		 var oFeedItem = this.getView().byId("feedInputId");
	     this.checkComments=true;
		}
		/* End of Message Pop Over changes */
			});
});