
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"com/incture/util/common",
	"sap/ui/model/json/JSONModel"
], function(Controller,MessageBox,MessageToast,common,JSONModel) {

	return Controller.extend("com.incture.controller.UpdateResMgmtTable", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf view.Details
	*/
		onInit: function() {
			var that = this;
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			var oView = this.getView();
			this.oTable = oView.byId("idResDataTable");
			
			
			//Fix for TSCT-86
			this.getView().byId("idDatePicker").attachBrowserEvent("click", function(oEvent) {
				if (oEvent.target.id.search("icon") === -1) {
					var id = "#" + oEvent.target.id;
					$(id).attr("readonly", true);
					var iconId = "#" + oEvent.target.id.split("-inner")[0] + "-icon";
					$(iconId).trigger("click");
				}
			}); 
			//Fix for TSCT-86
			this.getView().byId("idRollOffDate").attachBrowserEvent("click", function(oEvent) {
				if (oEvent.target.id.search("icon") === -1) {
					var id = "#" + oEvent.target.id;
					$(id).attr("readonly", true);
					var iconId = "#" + oEvent.target.id.split("-inner")[0] + "-icon";
					$(iconId).trigger("click");
				}
			}); 
			var oSearchModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oSearchModel,"oSearchModel");
			
			var oResMgmtModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oResMgmtModel,"oResMgmtModel");		
			this.oTable.setModel(oResMgmtModel);

			//Attaching an event to Details page so developer can easily perform required activities
			this._router.getRoute("updateResMgmtTable").attachPatternMatched(this._routePatternMatched, this);	
			var oLoadDetailsModel = new sap.ui.model.json.JSONModel();               
			oView.setModel(oLoadDetailsModel,"oLoadDetailsModel");
			
			//Bug fix for Task-89
			var empId = oView.byId("empID");
			var employeeName =  oView.byId("empName");
			var projectCode =  oView.byId("idProjCode");
			var projectName = oView.byId("prname");
			var location = oView.byId("idLoc");
			var projectManager =  oView.byId("idProjManagerInput");

			
			common.onSAPEnter(empId, this);
			common.onSAPEnter(employeeName, this);
			//common.onSAPEnter(projectCode, this);
			//common.onSAPEnter(projectName, this);
			common.onSAPEnter(location, this);
			common.onSAPEnter(projectManager, this);
			//end of Bug fix for Task-89
	
			this.fetchAccountNames();
		/*	var oLoggedInModel = new JSONModel();
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
			});*/
		},
		

		onHandleSuggest : function(oEvent) {
			var that = this;
			var oView = this.getView();
			var name = oEvent.getSource().getValue();
			var id = oEvent.mParameters.id.split("-")[2];
			var getInput = oEvent.getSource();
			var oLoadDetailsModel = this.getView().getModel("oLoadDetailsModel");
			var oloadModel = new sap.ui.model.json.JSONModel();
			if (id == "idProjManagerInput") {
				oloadModel.loadData("/tscm/ProjectCode/getAllProjectManager/"+ name);
				oloadModel.attachRequestCompleted(function(oEvent) {
					oView.setBusy(false);
							if (oEvent.getParameter("success")) {
								var oData = oEvent.getSource().getData();
								if (!(oData.idAndNameDto instanceof Array)) {
									oData.idAndNameDto = [ oData.idAndNameDto ];
								}
								oLoadDetailsModel.setData(oData);
								oLoadDetailsModel.refresh();
								getInput.bindAggregation("suggestionItems",
												{
													path : "oLoadDetailsModel>/idAndNameDto",
													template : new sap.ui.core.ListItem(
															{
																text : "{oLoadDetailsModel>name}"
															})
												});

							} else {
								common.errorDialog(oEvent.getParameter("errorobject").statusText+ "\{nPlease contact your system administrator");
							}
						});
			}

			else if (id == "prname") {
				oloadModel.loadData("/tscm/ProjectCode/getProjectCodeAndName/"+ name);
				oloadModel.attachRequestCompleted(function(oEvent) {
					oView.setBusy(false);
							if (oEvent.getParameter("success")) {
								var oData = oEvent.getSource().getData();
								if (!(oData.idAndNameDto instanceof Array)) {
									oData.idAndNameDto = [ oData.idAndNameDto ];
								}
								oLoadDetailsModel.setData(oData);
								oLoadDetailsModel.refresh();
								getInput.bindAggregation("suggestionItems",
												{
													path : "oLoadDetailsModel>/idAndNameDto",
													template : new sap.ui.core.ListItem(
															{
																text : "{oLoadDetailsModel>name}"
															})
												});

							} else {
								common.errorDialog(oEvent.getParameter("errorobject").statusText+ "\{nPlease contact your system administrator");
							}
						});
			}


			else if (id == "idProjCode") {
				oloadModel.loadData("/tscm/ProjectCode/getProjectCodeAndName/"+ name);
				oloadModel.attachRequestCompleted(function(oEvent) {
					oView.setBusy(false);
							if (oEvent.getParameter("success")) {
								var oData = oEvent.getSource().getData();
								if (!(oData.idAndNameDto instanceof Array)) {
									oData.idAndNameDto = [ oData.idAndNameDto ];
								}
								oLoadDetailsModel.setData(oData);
								oLoadDetailsModel.refresh();
								getInput.bindAggregation("suggestionItems",
												{
													path : "oLoadDetailsModel>/idAndNameDto",
													template : new sap.ui.core.ListItem(
															{
																text : "{oLoadDetailsModel>id}"
															})
												});

							} else {
								common.errorDialog(oEvent.getParameter("errorobject").statusText+ "\{nPlease contact your system administrator");
							}
						});
			}
			
			
			else  {
				oloadModel.loadData("/tscm/Allocation/getEmployeeIdAndName/"+ name);
				oloadModel.attachRequestCompleted(function(oEvent) {
					oView.setBusy(false);
							if (oEvent.getParameter("success")) {
								var oData = oEvent.getSource().getData();
								if (!(oData.idAndNameDto instanceof Array)) {
									oData.idAndNameDto = [ oData.idAndNameDto ];
								}
								oLoadDetailsModel.setData(oData);
								oLoadDetailsModel.refresh();
								getInput.bindAggregation("suggestionItems",
												{
													path : "oLoadDetailsModel>/idAndNameDto",
													template : new sap.ui.core.ListItem(
															{
																text : "{oLoadDetailsModel>id}"
															})
												});

							} else {
								common.errorDialog(oEvent.getParameter("errorobject").statusText+ "\{nPlease contact your system administrator");
							}
						});
			}


		},
		
		
		onEdit: function(oevent){
			var oView= this.getView();
			this.aProductCollection = jQuery.extend(true, [], this.getView().getModel("oResMgmtModel").getProperty("/listAllocationDto"));
			oView.byId("editButton").setVisible(false);
			//Commented based on Demo comment
		//	oView.byId("createButton").setVisible(false);
			oView.byId("cancelButton").setVisible(true);
			oView.byId("submitButton").setVisible(true);		
			var oResMgmtModel=oView.getModel("oResMgmtModel");      
			oResMgmtModel.getData().editable=true;    
			oResMgmtModel.refresh();
		},

		
		_routePatternMatched:function(){
			
			//changes for TSCT 97 
			var oView= this.getView();
			var oResMgmtModel = oView.getModel("oResMgmtModel");
			var oTable = oView.byId("idResDataTable");
			oResMgmtModel.setProperty("/listAllocationDto", []);
			
			oResMgmtModel.refresh(true);
			oTable.setModel(oResMgmtModel);
			oView.byId("cancelButton").setVisible(false);
			oView.byId("editButton").setVisible(true);
			//Commented based on Demo comment
			//oView.byId("createButton").setVisible(true);
			oView.byId("submitButton").setVisible(false);
			this.onClear();	
		},
		
		
		onCancel: function() {
			// On click of Cancel button
			var that=this;
			MessageBox.show("Are you sure you want to Cancel?",
			" ","Cancel",[MessageBox.Action.OK, MessageBox.Action.CANCEL],
			function(oEvent){
			if(oEvent==="CANCEL"){
			//If Cancel button is pressed
			}
			else if(oEvent==="OK"){
			//If OK button is pressed.
			var oResMgmtModel = that.getView().getModel("oResMgmtModel");
			var oTable = that.getView().byId("idResDataTable");
			var oView = that.getView();
			//Visibility of buttons
			oView.byId("cancelButton").setVisible(false);
			oView.byId("editButton").setVisible(true);
			//Commented based on Demo comment
			//oView.byId("createButton").setVisible(true);
			oView.byId("submitButton").setVisible(false);
			oResMgmtModel.setProperty("/listAllocationDto", that.aProductCollection);
			oResMgmtModel.getData().editable = false;
			oResMgmtModel.getData().createFlag = false;
			oResMgmtModel.refresh(true);
			oTable.setModel(oResMgmtModel);
			}
			},
			MessageBox.Action.OK);
			    },

		onSearch:function(){ 
			var that = this;
			var oView = this.getView();
			var oSearchModel = this.getView().getModel("oSearchModel");
			var oSearchData =  oSearchModel.getData();
			var oTableDataModel = this.getView().byId("idResDataTable").getModel();
			var oSearchResModel =  new sap.ui.model.json.JSONModel();
			var evtSourceData;
			var url;
			
			
			var projName = oView.byId("idProjectidAndName").getSelectedKey().split("-")[1];
			var projCode = oView.byId("idProjectidAndName").getSelectedKey().split("-")[0];
			var accName = oView.byId("idAccountNameUpd").getSelectedKey()
			
			
			//changes made for TSCT 98 
		/*	if (oSearchModel.getData().employeeNamevalueState == "Error"  ||oSearchModel.getData().empIdvalueState == "Error" ||
				oSearchModel.getData().projectManagervalueState == "Error" || oSearchModel.getData().locationvalueState == "Error" ||
				oSearchModel.getData().projectCodevalueState == "Error"	)*/
			if (oSearchModel.getData().employeeNamevalueState == "Error"  ||oSearchModel.getData().empIdvalueState == "Error" ||
					 oSearchModel.getData().locationvalueState == "Error" 
					)
				{
					MessageToast.show("Please enter valid data for the search fields ");
					return ;
				}
			var obj={
					"empId":oSearchData.empId == undefined?"":oSearchData.empId,
					"empName":oSearchData.employeeName == undefined?"":oSearchData.employeeName,
					"projectCode":projCode == undefined?"":projCode,
					"projectManager":oSearchData.projectManager == undefined?"":oSearchData.projectManager,
					"location":oSearchData.location == undefined?"":oSearchData.location,
					"projectName":projName == undefined?"": projName,
					"accountName": accName == undefined?"":accName
				} 

			var oHeader = {
			"Content-Type" : "application/json; charset=utf-8"
			};
			
			//Fix for Defect TSCT -80 
			oView.byId("cancelButton").setVisible(false);
			oView.byId("submitButton").setVisible(false);
			oView.byId("editButton").setVisible(true);
			//Commented based on Demo comment
			//oView.byId("createButton").setVisible(true);
			
			url = "/tscm/Allocation/getAllocationByFields";
			oSearchResModel.loadData(url, JSON.stringify(obj), true, "POST", false, false,oHeader);
			
			this.oTable = this.getView().byId("idResDataTable");

			oSearchResModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					evtSourceData = oEvent.getSource().getData();
					if (evtSourceData.isNull === "false"){
					 if (!(evtSourceData.listAllocationDto instanceof Array)) {
						 evtSourceData.listAllocationDto = [evtSourceData.listAllocationDto];
						 
						 }
					}
					else{
						evtSourceData.listAllocationDto =[];
						}
					evtSourceData.editable = false;
					evtSourceData.createFlag = false;
					oTableDataModel.setData(evtSourceData)
					oTableDataModel.refresh();
					this.oTable.setModel(oTableDataModel);

				}
				else{
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				}
			});
			oSearchResModel.attachRequestFailed(function(oEvent) {
				 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
			});

		},
		onClear:function(oEvent){
			var oView = this.getView();
			var oSearchModel = oView.getModel("oSearchModel");
			var oSearchData = oSearchModel.getData();
			oSearchData.empId = "";
			oSearchData.employeeName = "";
			oSearchData.projectCode = "";
			oSearchData.projectName = "";
			oSearchData.projectManager = "";
	        oSearchData.location = "";
			oView.byId("idAccountNameUpd").setSelectedKey("")
			oView.byId("idProjectidAndName").setSelectedKey("")
	    	oSearchModel.getData().employeeNamevalueState = "None";
			oSearchModel.getData().empIdvalueState = "None";
			oSearchModel.getData().projectManagervalueState = "None";
			oSearchModel.getData().locationvalueState = "None";
			oSearchModel.getData().projectCodevalueState = "None";
			oSearchModel.refresh(true); 
			oSearchModel.refresh(true);
		},
		
		onSubmit:function(){
			
			var oResMgmtModel = this.getView().getModel("oResMgmtModel");
			var oSearchResModel = new sap.ui.model.json.JSONModel();
			var data ;
			var that=this;
			var oView = this.getView();
			var oHeader = {
					"Content-Type" : "application/json; charset=utf-8"
					};
			 var url = "/tscm/Allocation/updateMultipleAllocations";
			 
			/*if(oResMgmtModel.getData().createFlag == true)
					{*/
						//check for validate
						if(this.validateTableData()==false)
						return;
						
					//}
		/*	else{
				for (var i=0; i<oResMgmtModel.getData().listAllocationDto.length;i++){
					if()
				}
			}*/
			 	
			 //setting the flag to false to make the row non editable
				oResMgmtModel.getData().listAllocationDto[0].nonEditable="false";
				oResMgmtModel.refresh();
				var obj=this.getView().byId("idResDataTable").getModel().getData().listAllocationDto;
			 
				oView.byId("cancelButton").setVisible(false);
				oView.byId("editButton").setVisible(true);
				//Commented based on Demo comment
				//oView.byId("createButton").setVisible(true);
				oView.byId("submitButton").setVisible(false);
			// this.rebindTable(this.oReadOnlyTemplate, "Navigation");
				
				var submittedData={
						"isNull": false,
						"listAllocationDto":obj
						}
				
		
			MessageBox.success("Do You want to Submit the request", {
				icon: sap.m.MessageBox.Icon.INFORMATION,
				title: "Submit",
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				onClose: jQuery.proxy(function(oAction) {
				if (oAction === "OK") {
					that.getView().setBusy(true);
					 oSearchResModel.loadData(url, JSON.stringify(submittedData), true, "POST", false, false,oHeader);
					 oSearchResModel.attachRequestCompleted(function(oEvent) {
					if (oEvent.getParameter("success")) {	
						data = oEvent.getSource().getData();
						var message = data.message;
						that.getView().setBusy(false);
						MessageBox.success(message);
						
					}
					});
					 oSearchResModel.attachRequestFailed(function(oEvent) {
						 that.getView().setBusy(false);
						 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\n Unable to submit data to backend ");
					});

				}else if (oAction === "CANCEL"){
						oResMgmtModel.setProperty("/listAllocationDto", this.aProductCollection);
						oResMgmtModel.refresh();
						oView.byId("cancelButton").setVisible(false);
						oView.byId("editButton").setVisible(true);
						//Commented based on Demo comment
						//oView.byId("createButton").setVisible(true);
						oView.byId("submitButton").setVisible(false);
				
					}
				}, this)
				});
				oResMgmtModel.getData().editable = false;    
				oResMgmtModel.getData().createFlag = false;    
				oResMgmtModel.refresh();
		},
		onNavButtonPress: function(oEvent) {	
			if (window.history.length > 0) {
				window.history.back();
			}
			this._router.navTo("detail",{
				data: ""
			});
		},
		
		filterResults: function(oEvent) {
			   var aFilters = [];
			   var sQuery = "";
				if (oEvent) {
					sQuery = oEvent.getSource().getValue();
				}
			    var filterArry = [];
			    //added offshore field for bug fix -154
			    //added Additional filters as per UAT demo comments
			    var metaModel = ["empId", "empName","projectName","designation","subGrade","location","projectManager","projectCode","offshore","allocationStatus",
			                     "peopleManagerName","dmName","primarySkills","accountName","accountCode"];
			    if (sQuery && sQuery.length > 0) {
			    		for ( var i = 0; i < metaModel.length; i++) {
			    			var bindingName = metaModel[i];
			    			filterArry.push(new sap.ui.model.Filter(bindingName, sap.ui.model.FilterOperator.Contains, sQuery));
			    		}
						
			      var filter = new sap.ui.model.Filter(filterArry, false);
			      aFilters.push(filter);
			    }
			    // update list binding
			    var reqListTable = this.getView().byId("idResDataTable");
				var binding = reqListTable.getBinding("rows");
			    binding.filter(aFilters, "Application");
		   },
		   
		  updateStartDate:function(oEvent)
		   {
			   var oResMgmtModel = this.getView().getModel("oResMgmtModel");
			   var sPath=oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
			   var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
			   oModelData.actualStartDate = com.incture.util.formatter.fn_formatDate(oEvent.getSource().getValue());
				//COmpare date For changing allocation status 
			   //Added for bug fix 189
				 var selStartDateMonth = new Date(oModelData.actualStartDate).getMonth();
				 var currDateMonth = new Date().getMonth();
			   // changes for TSCT 115
				var currDate = new Date().setHours(0,0,0,0) ;
			
				var newStartDate = new Date(oModelData.actualStartDate).setHours(0,0,0,0) ;
				var rollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0) ;
				var oldDate = this.aProductCollection[sPath.split("/")[2]].actualStartDate;
				
				if(new Date(oldDate) < currDate && new Date(oldDate).getMonth()<currDateMonth){
							oModelData.actualStartDate = oldDate;
							oEvent.getSource().setValue(com.incture.util.formatter.fn_formatDate(oldDate))
							var message = "The allocation start date of previously dated records cannot be changed";
							common.errorDialog(message);
							oResMgmtModel.refresh();
							return;
						}
						else if(newStartDate < currDate && selStartDateMonth < currDateMonth) {
							MessageToast.show("Allocation start date cannot be lesser than current month")
							oModelData.tabAllocStrtDatevalueState= "Error" 
							oResMgmtModel.refresh();
							return;
					}
						
				
				if (newStartDate>rollOffDate){
					MessageToast.show("Allocation Start date cannot be greater than Roll Off Date")
					oModelData.tabAllocStrtDatevalueState="Error" ;
					oResMgmtModel.refresh(true);
				}
			
				else{
					oModelData.tabAllocStrtDatevalueState ="None" ;
					oModelData.tabRollOffvalueState = "None" ;
				if (currDate >= newStartDate  && currDate <= rollOffDate ){
					oModelData.allocationStatus="Allocated"
						oResMgmtModel.refresh();	
				}
				if (currDate > rollOffDate ){
					oModelData.allocationStatus = "Rolled Off"
						oResMgmtModel.refresh();	
				}
				if (currDate < newStartDate  ){
					oModelData.allocationStatus = "Planned"
						oResMgmtModel.refresh();	
				}
				}
				
				oResMgmtModel.refresh();
		   },

		   updateRollOffDate:function(oEvent){
			   var oResMgmtModel = this.getView().getModel("oResMgmtModel");
			   var sPath = oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
				var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
				oModelData.rollOffDate = com.incture.util.formatter.fn_formatDate(oEvent.getSource().getValue());
				var currDate = new Date().setHours(0,0,0,0) ;
				  //Added for bug fix 189
				 var selRollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0);
				 var selRollOffDateMonth = new Date(oModelData.rollOffDate).getMonth();
				//COmpare date For changing allocation status 
				   // changes for TSCT 115
				var currDate = new Date().setHours(0,0,0,0);
				 var currDateMonth = new Date().getMonth();
				
				 
			
				var newRollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0);//
				var actualStartDate = new Date(oModelData.actualStartDate).setHours(0,0,0,0);
				
				var oldDate = this.aProductCollection[sPath.split("/")[2]].rollOffDate;
				
				if(new Date(oldDate) < currDate && new Date(oldDate).getMonth()<currDateMonth){
						oModelData.rollOffDate = oldDate;
						oEvent.getSource().setValue(com.incture.util.formatter.fn_formatDate(oldDate))
						var message = "The roll off date of previously dated records cannot be changed";
						common.errorDialog(message);
						oResMgmtModel.refresh();
						return;
					}
					else if(selRollOffDate < currDate && selRollOffDateMonth < currDateMonth) {
						MessageToast.show("Roll off date cannot be lesser than current month")
						oModelData.tabRollOffvalueState= "Error" 
						oResMgmtModel.refresh();
						return;
				}
				
				if(newRollOffDate< actualStartDate){
					MessageToast.show(" Roll Off Date  cannot be less than Allocation Start Date")
					oModelData.tabRollOffvalueState ="Error" 
						oResMgmtModel.refresh(true);
				}
				
		
				else{
					oModelData.tabRollOffvalueState = "None" ;
					oModelData.tabAllocStrtDatevalueState ="None" ;
				if (currDate >= actualStartDate  && currDate <= newRollOffDate ){
					oModelData.allocationStatus = "Allocated"
						oResMgmtModel.refresh();	
				}
				if (currDate > newRollOffDate ){
					oModelData.allocationStatus = "Rolled Off"
						oResMgmtModel.refresh();	
				}
				if (currDate < actualStartDate  ){
					oModelData.allocationStatus = "Planned"
						oResMgmtModel.refresh();	
				}
				
				if(newRollOffDate< actualStartDate){
					MessageToast.show(" Roll Off Date  cannot be less than Allocation Start Date")
				}
				}
				
				oResMgmtModel.refresh();
		   },
		   
			onCreate: function (oEvent) {
				var oView = this.getView()
				this.aProductCollection = jQuery.extend(true, [], this.getView().getModel("oResMgmtModel").getProperty("/listAllocationDto"));
				var oResMgmtModel = this.getView().getModel("oResMgmtModel");
				oResMgmtModel.getProperty("/listAllocationDto").unshift({
					"empId" : "",
					"empName" : "",
					"projectCode" : "",
					"projectName" : "",
					"actualStartDate" : "",
					"rollOffDate" : "",
					"billPercent" : "",
					"utilizationPercent" : "",
					"designation" : "",
					"subGrade" : "",
					"location" : "",
					"offshore" : "",
					"projectManager" : "",
					"softLockStartDate" : "",
					"softLockEndDate" : "",
					"allocationStatus" : ""
		
				});
				//oResMgmtModel.getData().listAllocationDto[0].nonEditable="true"
				oResMgmtModel.getData().createFlag = true;
				oResMgmtModel.getData().listAllocationDto[0].nonEditable = "true"
				oResMgmtModel.refresh();
				
				//set visibility of buttons
				oView.byId("cancelButton").setVisible(true);
				oView.byId("editButton").setVisible(false);
				//Commented based on Demo comment
				//oView.byId("createButton").setVisible(false);
				oView.byId("submitButton").setVisible(true);
			},
			
			
				
				onSuggestionItemSelect:function(oEvent){
					var oView = this.getView();
					var oSelectedItem = oEvent.getParameter("selectedItem");
					var sControlBindPath = oSelectedItem.getBindingInfo("text").binding.sPath;
					var oBindingContext = oSelectedItem.getBindingContext("oLoadDetailsModel");
					var oEmpSuggestModel = oBindingContext.oModel;
					var sPath = oBindingContext.sPath;
					var oSelectedContext = oEmpSuggestModel.getProperty(sPath);
					//Changes for TSCT-75
					oView.byId("idProjCode").setValue(oSelectedContext.id);			
				},
				
			//added for TSCT 85 TSCT 98 
			onChange:function(oEvent){
				var oSearchModel= this.getView().getModel("oSearchModel");
				var value=oEvent.getSource().getValue();
				var id=oEvent.getParameters().id.split("-")[2];
				if(value==""){
					oSearchModel.getData().employeeNamevalueState = "None";
					oSearchModel.getData().empIdvalueState = "None";
					oSearchModel.getData().projectManagervalueState = "None";
					oSearchModel.getData().locationvalueState = "None";
					oSearchModel.getData().projectCodevalueState = "None";
					oSearchModel.refresh(true); 
					return;
				}
					switch (id)
					{
					case "empName":
					if(!common.validateText(value)){
						sap.m.MessageToast.show("Enter valid Name");
						oSearchModel.getData().employeeNamevalueState = "Error";
						oSearchModel.refresh(true); 
					}
					else{
						oSearchModel.getData().employeeNamevalueState = "None";
						oSearchModel.refresh(true);
						//oEvent.getSource().setValue(value);
					}
					 
					break;
					case "idProjManagerInput":
					if(!common.validateText(value)){
					sap.m.MessageToast.show("Enter valid Project Manager name");
					oSearchModel.getData().projectManagervalueState = "Error";
					oSearchModel.refresh(true); 
					 }
					 else {
					oSearchModel.getData().projectManagervalueState = "None";
					oSearchModel.refresh(true);
					oEvent.getSource().setValue(value);
					}
					break;
					case "idLoc":
					if(!common.validateText(value)){
					sap.m.MessageToast.show("Enter valid work  location");
					oSearchModel.getData().locationvalueState = "Error";
					oSearchModel.refresh(true); 
					}
					else{
					oSearchModel.getData().locationvalueState = "None";
					oSearchModel.refresh(true);
					oEvent.getSource().setValue(value);
					}
					break;
					case "empID":
					if(!common.validateAlphanumeric(value)){
					sap.m.MessageToast.show("Enter valid Employee ID");
					oSearchModel.getData().empIdvalueState = "Error";
					  oSearchModel.refresh(true); 
					}
					else{
					oSearchModel.getData().empIdvalueState = "None";
					oSearchModel.refresh(true); 
					}
					break;
					case "idProjCode":
					if(!common.validateAlphanumeric(value)){
					sap.m.MessageToast.show("Enter valid Project Code");
					oSearchModel.getData().projectCodevalueState = "Error";
					  oSearchModel.refresh(true); 
					}
					else{
					oSearchModel.getData().projectCodevalueState = "None";
					oSearchModel.refresh(true); 
					}
					      break; 
					 default:
						break;
					      
					}
					},
					
			onChangeTab:function(oEvent){
				var oResMgmtModel = this.getView().getModel("oResMgmtModel");
				//var oResMgmtModelData= this.getView().getModel("oResMgmtModel").getData().
				 var sPath = oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
				var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
				var value = oEvent.getSource().getValue();
				var name = oEvent.getSource().getName();
				var sfieldName;
				var message="Enter valid value for ";
				//var id=oEvent.getParameters().id.split("-")[2];
				
				switch (name)
				{
					case "tabEmpID": 
					case "tabProjCode":
					case "tabaccountCode":
					if(!common.validateAlphanumeric(value)){
						
						if (name==="tabEmpID"){
							sfieldName= "Employee ID" ;
							message = message+ sfieldName;
							sap.m.MessageToast.show(message);
							oModelData.tabEmpIdvalueState = "Error";
							oResMgmtModel.refresh(true);
						}
						else if (name==="tabProjCode"){
							sfieldName= "Project Code" ;
							message = message+ sfieldName;
							sap.m.MessageToast.show(message);
							oModelData.tabProjCodevalueState = "Error";
							oResMgmtModel.refresh(true);	
						}
						else if (name=="tabaccountCode"){
							sfieldName= "Account Code" ;
							message = message+ sfieldName;
							sap.m.MessageToast.show(message);
							oModelData.tabAccCodevalueState = "Error";
							oResMgmtModel.refresh(true);
						}
						
					}
					else{
						if (name==="tabEmpID"){
							
							oModelData.tabEmpIdvalueState = "None";
							oResMgmtModel.refresh(true);
						}
						else if (name==="tabProjCode"){
							oModelData.tabProjCodevalueState = "None";
							oResMgmtModel.refresh(true);	
						}
						else if (name==="tabaccountCode"){
							oModelData.tabAccCodevalueState = "None";
							oResMgmtModel.refresh(true);	
						}
						
						
					}
					 
					break;
					
					case "tabEmpName":
					case "tabDesignation":
					case "tabWorkLocation":
					case "tabOnshoreVal":
					case "tabProjManager":
					case "tabAccName":
					
						if(!common.validateText(value)){
							if (name==="tabEmpName"){
								sfieldName= "Employee Name" ;
								message = message+ sfieldName;
								sap.m.MessageToast.show(message);
								oModelData.tabEmpnamevalueState = "Error";
								oResMgmtModel.refresh(true);
							}
							else if (name==="tabDesignation"){
								sfieldName= "Designation" ;
								message = message+ sfieldName;
								sap.m.MessageToast.show(message);
								oModelData.tabDesigvalueState = "Error";
								oResMgmtModel.refresh(true);
							}
							else if (name==="tabWorkLocation"){
								sfieldName= "Work Location" ;
								message = message+ sfieldName;
								sap.m.MessageToast.show(message);
								oModelData.tabLocationvalueState = "Error";
								oResMgmtModel.refresh(true);
							}
							else if (name==="tabOnshoreVal"){
								sfieldName= "Onshore/Offsite" ;
								message = message+ sfieldName;
								sap.m.MessageToast.show(message);
								oModelData.taboffShorevalueState = "Error";
								oResMgmtModel.refresh(true);
							}
							else if (name==="tabProjManager"){
								sfieldName= "Project Manager" ;
								message = message+ sfieldName;
								sap.m.MessageToast.show(message);
								oModelData.tabProjMgrNamevalueState = "Error";
								oResMgmtModel.refresh(true);
							}
							else if (name==="tabAccName"){
								sfieldName= "Account Name" ;
								message = message+ sfieldName;
								sap.m.MessageToast.show(message);
								oModelData.tabAccNamevalueState = "Error";
								oResMgmtModel.refresh(true);
							}
				       }
						else {
								if (name==="tabEmpName"){
									/*if(value===""){
										sap.m.MessageToast.show("Please enter Employee name . It is mandatory value");
										oModelData.tabEmpnamevalueState = "Error";
										oResMgmtModel.refresh(true);
										return;
									}*/
									oModelData.tabEmpnamevalueState = "None";
									oResMgmtModel.refresh(true);
								}
								else if (name==="tabDesignation"){
									oModelData.tabDesigvalueState = "None";
									oResMgmtModel.refresh(true);
								}
								else if (name==="tabWorkLocation"){
									oModelData.tabLocationvalueState = "None";
									oResMgmtModel.refresh(true);
								}
								else if (name==="tabOnshoreVal"){
									oModelData.taboffShorevalueState = "None";
									oResMgmtModel.refresh(true);
								}
								else if (name==="tabProjManager"){
									oModelData.tabProjMgrNamevalueState = "None";
									oResMgmtModel.refresh(true);
								}
								else if (name==="tabAccName"){
									oModelData.tabAccNamevalueState = "None";
									oResMgmtModel.refresh(true);
								}
							
							}
						break;
					}
				
				
			},
			//Changes made for def 118 
			validateTableData:function(oevent){
				var oResMgmtModel = this.getView().getModel("oResMgmtModel");
				var oResMgmtModelData = oResMgmtModel.getData().listAllocationDto[0];
			
				//For Create scenario
					if(oResMgmtModel.getData().createFlag == true)
					{
						if((oResMgmtModelData.empId==="" || oResMgmtModelData.empId=== undefined )||
								(oResMgmtModelData.empName==="" || oResMgmtModelData.empName=== undefined )||
								(oResMgmtModelData.projectCode==="" || oResMgmtModelData.projectCode=== undefined )||
								(oResMgmtModelData.actualStartDate==="" || oResMgmtModelData.actualStartDate=== undefined )||
								(oResMgmtModelData.rollOffDate==="" || oResMgmtModelData.rollOffDate=== undefined )||
								(oResMgmtModelData.billPercent==="" || oResMgmtModelData.billPercent=== undefined )||
								(oResMgmtModelData.utilizationPercent==="" || oResMgmtModelData.utilizationPercent=== undefined )
						)
							{
								sap.m.MessageToast.show("Please enter the mandatory fields (Employee Id , Employee Name , Project Code , allocation Start Date  , Roll Off Date , Utilization % and Bill % )");
								return false;
							}
						
					
						else if(oResMgmtModelData.tabEmpIdvalueState=="Error" || oResMgmtModelData.tabProjCodevalueState=="Error" ||oResMgmtModelData.tabAccCodevalueState=="Error"||
								oResMgmtModelData.tabEmpnamevalueState=="Error"|| oResMgmtModelData.tabDesigvalueState=="Error" ||  oResMgmtModelData.tabLocationvalueState=="Error"||
								oResMgmtModelData.taboffShorevalueState=="Error"|| oResMgmtModelData.tabProjMgrNamevalueState=="Error" || oResMgmtModelData.tabAccNamevalueState=="Error" ||
									oResMgmtModelData.tabRollOffvalueState=="Error"|| oResMgmtModelData.tabAllocStrtDatevalueState=="Error" 
						){
							sap.m.MessageToast.show("Please enter the valid values for incorrect fields");
							return false;
							
						}
					}
					else 
						{
							var len=oResMgmtModel.getData().listAllocationDto.length;
							var aTableRecords=oResMgmtModel.getData().listAllocationDto;
							for (var i =0 ; i<len;i++){
								if((aTableRecords[i].actualStartDate==="" || aTableRecords[i].actualStartDate=== undefined )||
										(aTableRecords[i].rollOffDate==="" || aTableRecords[i].rollOffDate=== undefined )||
										(aTableRecords[i].billPercent==="" || aTableRecords[i].billPercent=== undefined )||
										(aTableRecords[i].utilizationPercent==="" || aTableRecords[i].utilizationPercent=== undefined )
								)
									{
										sap.m.MessageToast.show("Please enter the mandatory fields (Allocation Start Date  , Roll Off Date , Utilization % and Bill % )");
										return false;
									}
								else if( aTableRecords[i].tabRollOffvalueState=="Error"|| aTableRecords[i].tabAllocStrtDatevalueState=="Error" ){
									sap.m.MessageToast.show("Please enter the valid values for incorrect fields");
									return false;
									
								}
								
							}
							
						}
					
					return true;
					
				
			},
			//Change done for TSCT 137
			onChangeBillpercent:function(oEvent){
				  var that=this;
				  var oResMgmtModel = this.getView().getModel("oResMgmtModel");
				  var sPath = oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
				  var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
				  var serialId = oModelData.serialId;
				  var selEmpId = oModelData.empId;
				  var selActualStrtDate = new Date(oModelData.actualStartDate).setHours(0,0,0,0);
				  var selRollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0);
				  //Added for bug fix 189
				  var selRollOffDateMonth = new Date(oModelData.rollOffDate).getMonth();
				  var billPercent = oModelData.billPercent;;
				  var allResultsModel = this.getOwnerComponent().getModel("oRMTableResults");
				  var empData ;
				  var tempArr = [];
				  var obj={
							"empId":"",
							"empName":"",
							"projectCode":"",
							"projectManager":"",
							"location":"",
							"projectName":""
						}
					var oHeader = {
							"Content-Type" : "application/json; charset=utf-8"
							};
				  var totalBillPercent= parseInt(billPercent);
				  
				  //Added for TSCT 158 
				  
				  var oldBillPercent = this.aProductCollection[sPath.split("/")[2]].billPercent;
				  var currDate = new Date().setHours(0,0,0,0);
				  var currDateMonth = new Date().getMonth();
				  // //Added for bug fix 189--to allow dates starting from current month 
				
				  if(selRollOffDate < currDate && selRollOffDateMonth < currDateMonth){
						var message = "The bill percent of previously dated records cannot be changed";
						common.errorDialog(message);
						oModelData.billPercent = oldBillPercent;
						oResMgmtModel.refresh();
						return;
				  }
				  /* end of TSCT 158 fix  */
					
					var url = "/tscm/Allocation/getAllocationByFields";
				    var s;
				    if(allResultsModel.getData().listAllocationDto==undefined){
				    allResultsModel.loadData(url, JSON.stringify(obj), true, "POST", false, false,oHeader);
				    allResultsModel.attachRequestCompleted(function(oEvent) {
						if (oEvent.getParameter("success")) {
							evtSourceData = oEvent.getSource().getData();
						    empData = evtSourceData.listAllocationDto;
						    that.calculateBillPercent(empData,selActualStrtDate,selRollOffDate,totalBillPercent,selEmpId,serialId,oModelData,sPath);
				
						}
						else{
							 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
						}
					});
				    }
					
				    else{
					    	empData = allResultsModel.getData().listAllocationDto;
					    	this.calculateBillPercent(empData,selActualStrtDate,selRollOffDate,totalBillPercent,selEmpId,serialId,oModelData,sPath);
				    }
			},
			
			calculateBillPercent: function(empData,selActualStrtDate,selRollOffDate,totalBillPercent,selEmpId,serialId,oModelData,sPath){
				 var oResMgmtModel = this.getView().getModel("oResMgmtModel");
				var tempArr=[];
				var tempArrResModel=[];
				var oResMgmtModelData = oResMgmtModel.getData().listAllocationDto;
			
				
				///Added to get the updated values fromm the table 
				for(var key in empData){
					if(empData[key].empId == selEmpId && empData[key].serialId != serialId){
						tempArr.push(empData[key])
					}
				
				}
				for(var key in oResMgmtModelData){
					if(oResMgmtModelData[key].empId == selEmpId && oResMgmtModelData[key].serialId != serialId){
						tempArrResModel.push(oResMgmtModelData[key])
					}
				}
				
				for (var i = 0 ; i<tempArr.length;i++){
					tempArr[i].actualStartDate = tempArrResModel[i].actualStartDate;
					tempArr[i].rollOffDate = tempArrResModel[i].rollOffDate;
					tempArr[i].billPercent = tempArrResModel[i].billPercent == ""?0 :tempArrResModel[i].billPercent;
				}
				
		  	///end of Added to get the updated values fromm the table 
				
				tempArr.forEach( function(s) { 
				     // ... do something with s ...
					
					if( ((new Date(s.actualStartDate).setHours(0,0,0,0)  ==  selActualStrtDate && (new Date(s.rollOffDate).setHours(0,0,0,0)) ==  selRollOffDate )||
							(selActualStrtDate>= new Date(s.actualStartDate).setHours(0,0,0,0)  &&
									selActualStrtDate <= (new Date(s.rollOffDate).setHours(0,0,0,0)) ) ||
									(selActualStrtDate<= new Date(s.actualStartDate).setHours(0,0,0,0)  &&
											selRollOffDate >= (new Date(s.rollOffDate).setHours(0,0,0,0)) ) ||
									(selRollOffDate>= new Date(s.actualStartDate).setHours(0,0,0,0)  &&
											selRollOffDate <= (new Date(s.rollOffDate).setHours(0,0,0,0))))){
						totalBillPercent += parseInt(s.billPercent);
					
					}
			
				} );
			if (totalBillPercent>100)
				{
				var message = "The billing percent of the employee exceeds 100 . Please enter a valid value";
				//TSCT -155 fix 
				common.errorDialog(message)
			//	sap.m.MessageToast.show("The billing percent of the employee exceeds 100 . Please enter a valid value");
				 oModelData.billPercent="";
				 oResMgmtModel.refresh();

				}
			},
			
			onChangeUtilpercent: function(oEvent){
				  //Added for TSCT 158 
				  var oResMgmtModel = this.getView().getModel("oResMgmtModel");
				  var sPath = oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
				  var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
				  
				  var selRollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0);
				  //Added for bug fix 189
				  var selRollOffDateMonth = new Date(oModelData.rollOffDate).getMonth();
				  
				  
				  var oldUtilPercent = this.aProductCollection[sPath.split("/")[2]].utilizationPercent;
				  var currDate = new Date().setHours(0,0,0,0);
				  var currDateMonth = new Date().getMonth();
				  // //Added for bug fix 189--to allow dates starting from current month 
				  if(selRollOffDate < currDate && selRollOffDateMonth < currDateMonth){
						var message = "The utilisation percent of previously dated records cannot be changed";
						common.errorDialog(message);
						oModelData.utilizationPercent = oldUtilPercent;
						oResMgmtModel.refresh();
						return;
				  }
				  /* end of TSCT 158 fix  */
			},
			
			//Added for UAT RM changes 
			
			fetchAccountNames:function(){
				var oView = this.getView();
				var oModel = new JSONModel();
				oModel.loadData("/tscm/ProjectCode/getAllAccountNames");
				oModel.attachRequestCompleted(function(oEvent){
					oView.setBusy(false);
					if(oEvent.getParameter("success")){
						var data = oModel.getData();
						if (!(data.idAndNameDto instanceof Array)) {
							data.idAndNameDto = [data.idAndNameDto];
				    	}
						oView.setModel(oModel,"AccountDetails");
						
						
					 } else {
						 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
					 }
				});
			},
			
			onAccountNameChange:function(oEvent){
				this.getView().byId("idProjectidAndName").setEnabled(true);
				var oSource = oEvent.getSource();
				if(oSource.getSelectedKey()){
				oSource.removeStyleClass("SelectError");
				}
				var oBindingContext = oEvent.getParameter("selectedItem").getBindingContext("AccountDetails");
				var sPath = oBindingContext.sPath;
				var oCurrContext = oBindingContext.getModel().getProperty(sPath);
				this.getView().byId("idAccountNameUpd").setValue(oCurrContext.name);
				this.fetchProjectCodes(oCurrContext.name);
				},
				
			fetchProjectCodes:function(id){
					var oView = this.getView();
					var oModel = new JSONModel();
					var url="/tscm/ProjectCode/getProjectByAccount/"+id;
					
					oModel.loadData(url);
					oModel.attachRequestCompleted(function(oEvent){
						oView.setBusy(false);
						if(oEvent.getParameter("success")){
							var data = oModel.getData();
							if (!(data.idAndNameDto instanceof Array)) {
								data.idAndNameDto = [data.idAndNameDto];
					    	}
							oView.setModel(oModel,"ProjectDetails");
							oModel.refresh();
							
						 } else {
							 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
						 }
					});
				},
				
				//Added for UAT RM changes -- Ends
				
				
	/**
	 * //idProjectidAndName
	* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	* (NOT before the first rendering! onInit() is used for that one!).
	* @memberOf view.Details
	*/
//		onBeforeRendering: function() {
	//
//		},

	/**
	* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	* This hook is the same one that SAPUI5 controls get after being rendered.
	* @memberOf view.Details
	*/
		onAfterRendering: function() {
			$(".clearButtonClass").children().css("border-color","#bb0000");
		},

	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	* @memberOf view.Details
	*/
onExit: function() {
	
		console.log("in exit")
	}


});
})
