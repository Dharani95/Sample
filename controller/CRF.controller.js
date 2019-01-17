sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"com/incture/util/common"
], function(Controller,MessageBox,MessageToast,common) {
	"use strict";

	return Controller.extend("com.incture.controller.CRF",{
	
		onInit: function() {
				var that=this;
				var oView = this.getView();
				this.ownerComponent = this.getOwnerComponent();
				this._router = this.ownerComponent.getRouter();
				this.oTable = oView.byId("idResDataTable");
				this.oTable.setModel(oResMgmtModel);
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
				var crfModel = new sap.ui.model.json.JSONModel();
				this.getView().setModel(crfModel, "crfModel");	
				/*Model for Suggestion */
				var oLoadDetailsModel= new sap.ui.model.json.JSONModel();
				this.getView().setModel(oLoadDetailsModel, "oLoadDetailsModel");
				/*Model for project codes in select */
				var accountNameModel= new sap.ui.model.json.JSONModel();
				this.getView().setModel(accountNameModel, "accountNameModel");
				var oResMgmtModel= new sap.ui.model.json.JSONModel();
				this.getView().setModel(oResMgmtModel, "oResMgmtModel");
				
				var ProjectCodeModel= new sap.ui.model.json.JSONModel();
				this.getView().setModel(ProjectCodeModel, "ProjectCodeModel");	
				
				var empIdModel=new sap.ui.model.json.JSONModel();
				this.getView().setModel(empIdModel, "empIdModel");	
				
				var oLoggedInModel = new sap.ui.model.json.JSONModel();
				oLoggedInModel.loadData("/tscm/umeUser/loggedIn",true,'GET',false,false);
				oLoggedInModel.attachRequestCompleted(function(oEvent){
				if(oEvent.getParameter("success")){
						var oData = oEvent.getSource().getData();
						that.fetchAccountName(oData.uniqueName);
						crfModel.getData().EmpReq=oData.uniqueName;
						crfModel.refresh();
					} else {
							 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
					}
				});
				
				//oResMgmtModel.getData().editable=true; 
				oResMgmtModel.refresh(true);
				this._router.getRoute("ChangeRequestForm").attachPatternMatched(this._routePatternMatched, this);
				var i18model = new sap.ui.model.resource.ResourceModel({
					bundleName : "sap.sample.i18n.i18n"
				});
				this.getView().setModel(i18model, "i18model");
				/*this.createFlag=0;*/
		
	},
	
	
	
		_routePatternMatched:function(oEvent){
			
				var oView = this.getView();
				var oResMgmtModel = oView.getModel("oResMgmtModel");
				var accountNameModel=oView.getModel("accountNameModel");
				var crfModel=oView.getModel("crfModel");
				var oTable = oView.byId("idResDataTable");
				oResMgmtModel.setProperty("/allocationDto", []);
				oResMgmtModel.getData().nonEditable="false";
				oResMgmtModel.refresh(true);
				oTable.setModel(oResMgmtModel);
				crfModel.getData().AccountName=""
				oView.byId("cancelButton").setVisible(true);
				oView.byId("cancelButton").setVisible(false);
				oView.byId("submitButton").setVisible(true);
				var ProjectCodeModel= oView.getModel("ProjectCodeModel");
				var empIdModel=oView.getModel("empIdModel");
				ProjectCodeModel.setData(null);
				accountNameModel.setData(null);
				this.fetchAccountName(crfModel.getData().EmpReq);
				empIdModel.setData(null);
				ProjectCodeModel.refresh();
				crfModel.refresh(true);
				empIdModel.refresh();
	},

		fetchAccountName:function(id){
				var oView = this.getView();
				var accountNameModel =  oView.getModel("accountNameModel");
				accountNameModel.loadData("/tscm/ProjectCode/getAccountNames/"+id,true,'GET',false,false);
				accountNameModel.attachRequestCompleted(function(oEvent){
					oView.setBusy(false);
					if(oEvent.getParameter("success")){
						var data = accountNameModel.getData();
						if (!(data.idAndNameDto instanceof Array)) {
							data.idAndNameDto = [data.idAndNameDto];
						}
						oView.setModel(accountNameModel, "accountNameModel");
						
					 } else {
						 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
					 }
				});
	},
		onCommentChange:function(oEvent){
			
			var that=this;
			  var oResMgmtModel = this.getView().getModel("oResMgmtModel");
			  var sPath = oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
			  var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
			  var selRollOffDateMonth = new Date(oModelData.rollOffDate).getMonth();
			  var selActualStrtDate = new Date(oModelData.actualStartDate).setHours(0,0,0,0);
			  var selRollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0);
			  var oldcomment = this.aProductCollection[sPath.split("/")[2]].pmComment;
			  var currDate = new Date().setHours(0,0,0,0);
			  var currDateMonth = new Date().getMonth();
			  /*TSCT -189 Bug fix */
			  if(selRollOffDate < currDate && selRollOffDateMonth < currDateMonth){
					var message = "The Comment of previously dated records cannot be changed";
					this.flag=0;
					common.errorDialog(message);
					if(oldcomment==undefined){
						oModelData.pmComment = "";
					}
					else{
						oModelData.pmComment = oldcomment;
					}
					
					oResMgmtModel.refresh();
					return;
			  }
			  oModelData.tabpmcommentvalueState ="None";
			  oResMgmtModel.refresh();
			
		},
	
		onAccountNameChange: function(oEvent){
			
				var oView = this.getView();
				var crfModel=oView.getModel("crfModel");
				var accountName=crfModel.getData().AccountName;
				var ProjectCodeModel = oView.getModel("ProjectCodeModel");
				oView.byId("idProjectCode").setEnabled(true);
				oView.byId("idEmpId").setEnabled(false);
				crfModel.getData().ProjectCode="";
				crfModel.getData().empId="";
				crfModel.refresh();
				ProjectCodeModel.loadData("/tscm/ProjectCode/fetchAllProjectCodes?accountName="+accountName+"&projManagerId="+crfModel.getData().EmpReq,true,'GET',false,false);
				ProjectCodeModel.attachRequestCompleted(function(oEvent){
					oView.setBusy(false);
					if(oEvent.getParameter("success")){
						var data = ProjectCodeModel.getData();
						if (!(data.idAndNameDto instanceof Array)) {
							data.idAndNameDto = [data.idAndNameDto];
						}
						oView.setModel(ProjectCodeModel, "ProjectCodeModel");
						ProjectCodeModel.refresh();
					 } else {
						 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
					 }
				});
		
	},
		onProjectCodeChange: function(oEvent){
		
				var oView = this.getView();
				var crfModel=oView.getModel("crfModel");
				crfModel.getData().empId="";
				crfModel.refresh();
				crfModel.getData().ProjectName="";
				oView.byId("idEmpId").setEnabled(true);
				var len=crfModel.getData().ProjectCode.split("-").length;

				for(var i=0;i<len-1;i++)
				{
					crfModel.getData().ProjectName+=crfModel.getData().ProjectCode.split("-")[i];
					
				}
				var ProjectCode=crfModel.getData().ProjectCode.split("-")[len-1];
				crfModel.getData().ProjectCode=ProjectCode;
				var empIdModel = oView.getModel("empIdModel");
				empIdModel.loadData("/tscm/Allocation/getEmployeeByProjectCode/"+ProjectCode,true,'GET',false,false);
				empIdModel.attachRequestCompleted(function(oEvent){
					oView.setBusy(false);
					if(oEvent.getParameter("success")){
						var data = empIdModel.getData();
						if (!(data.idAndNameDto instanceof Array)) {
							data.idAndNameDto = [data.idAndNameDto];
						}
						oView.setModel(empIdModel, "empIdModel");
						empIdModel.refresh();
					 } else {
						 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
					 }
				});
	},
	
	
		onClear: function(){
		
				var crfModel=this.getView().getModel("crfModel");
				crfModel.getData().AccountName="";
				crfModel.getData().ProjectCode="";
				crfModel.getData().empId="";
				var oView = this.getView();
				oView.byId("editButton").setEnabled(false);
				oView.byId("createButton").setEnabled(false);
				
				var oResMgmtModel = oView.getModel("oResMgmtModel");
				var crfModel=oView.getModel("crfModel");
				var oTable = oView.byId("idResDataTable");
				oResMgmtModel.setProperty("/allocationDto", []);
				oResMgmtModel.getData().nonEditable="false";
				oResMgmtModel.refresh(true);
				oTable.setModel(oResMgmtModel);
				oView.byId("editButton").setVisible(true);
				oView.byId("submitButton").setVisible(true);
				oView.byId("cancelButton").setVisible(false);
				oView.byId("idProjectCode").setEnabled(false);
				oView.byId("idEmpId").setEnabled(false);
				var oModel= new sap.ui.model.json.JSONModel();
				oView.setModel(oModel, "accountNameModel");
				this.fetchAccountName(crfModel.getData().EmpReq);
				crfModel.refresh();
		
	},
		onSearch: function(oEvent){
				var oView = this.getView();
				var crfModel=oView.getModel("crfModel");
				var acntName=crfModel.getData().AccountName;
				var empId=crfModel.getData().empId;
				oView.byId("editButton").setVisible(true);
				var projectCode=crfModel.getData().ProjectCode;
				if(acntName=="" || empId==""  ||projectCode==""||empId==undefined || projectCode==undefined ||acntName==undefined)
				{
					sap.m.MessageToast.show("Please provide the required details");
				}else{
						oView.byId("editButton").setEnabled(true);
						oView.byId("createButton").setEnabled(true);
						var oResMgmtModel=oView.getModel("oResMgmtModel");
						var oModel=new sap.ui.model.json.JSONModel();
						oModel.loadData("/tscm/Allocation/getAllocationByProjectCodeAndEmployeeId?projectCode="+projectCode+"&employeeId="+empId,true,'GET',false,false);
						oModel.attachRequestCompleted(function(oEvent){
						oView.setBusy(false);
						if(oEvent.getParameter("success")){
							var resultData=oEvent.getSource().getData();
							
							
							if (!(resultData.allocationDto instanceof Array)) {
								resultData.allocationDto = [ resultData.allocationDto ];
							}
							oResMgmtModel.setData(resultData);
							oResMgmtModel.getData().editable = false;
							oResMgmtModel.getData().createFlag = false;
							oResMgmtModel.refresh(true);
							
							
						 } else {
							 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
						 }
					});
				}
				
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
				oView.byId("submitButton").setVisible(true);
				oResMgmtModel.setProperty("/allocationDto", that.aProductCollection);
				oResMgmtModel.getData().editable = false;
				oResMgmtModel.getData().createFlag = false;
				oResMgmtModel.refresh(true);
				oTable.setModel(oResMgmtModel);
				}
				},
				MessageBox.Action.OK);
				    },
				    
		onCreate: function (oEvent) {
				var oView = this.getView();
				
				var oResMgmtModel = this.getView().getModel("oResMgmtModel");
				var len=oResMgmtModel.getData().allocationDto.length;
				var today=new Date();
				/*this.createFlag=1;*/
				if(today.getDate()<10)
				{
					var tdate="0"+today.getDate();
				}
				var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+tdate;
				var oData=oResMgmtModel.getData().allocationDto[len-1];
				oResMgmtModel.getProperty("/allocationDto").unshift({
						
					"accountCode" : oData.accountCode,
					"accountName" : oData.accountName,
					"actualStartDate" : date,
					"allocationStatus" : "",
					"billPercent" : "",
					"businessUnit" : oData.businessUnit,
					"dateOfJoining" : oData.dateOfJoining,
					"designation" :  oData.designation,
					"emailId" : oData.emailId,
					"empId" : oData.empId,
					"empName" : oData.empName,
					"employmentStatus" : oData.employmentStatus,
					"grade" : oData.grade,
					"location" : oData.location,
					"modeOfEmp" : oData.modeOfEmp,
					"offshore" : oData.offshore,
					"peopleManagerId":oData.peopleManagerId,
					"peopleManagerName":oData.peopleManagerName,
					"personDays":oData.personDays,
					"primarySkills":oData.primarySkills,
					"projectCode":oData.projectCode,
					"projectExp":oData.projectExp,
					"projectManager":oData.projectManager,
					"projectName":oData.projectName,
					"region":oData.region,
					"remarks":oData.remarks,
					"rollOffDate":date,
					"secondarySkills":oData.secondarySkills,
					"subGrade":oData.subGrade,
					"totalExp":oData.totalExp,
					"utilizationPercent":""
					});
				
				oResMgmtModel.getData().createFlag = false;
				oResMgmtModel.getData().editable=true; 
				this.aProductCollection = jQuery.extend(true, [], this.getView().getModel("oResMgmtModel").getProperty("/allocationDto"));
				oResMgmtModel.refresh(true);
				//set visibility of buttons
				oView.byId("cancelButton").setVisible(true);
						
			},		    				   
		   
		fnsubmitSelected: function(action){
				
				if(action === "OK"){
				var crfModel=this.getView().getModel("crfModel");
				var mParameter = {};
				var projManagerId=crfModel.getData().EmpReq;
				var projectCode=crfModel.getData().ProjectCode;
				var empId=crfModel.getData().employeeResource;
				var reason=crfModel.getData().reasonForChange;
				var sdate=crfModel.getData().StartDate;
				var edate=crfModel.getData().RollOffDate;
				mParameter.employeeId = empId;
				mParameter.projectCode = projectCode;
				mParameter.projManagerId = projManagerId;
				mParameter.allocationPercent=crfModel.getData().ChangeAllocation;
				mParameter.billPercent=crfModel.getData().changeBilling;
				mParameter.actualStartDate=crfModel.getData().StartDate+"T00:00:00";
				mParameter.rollOffDate=crfModel.getData().RollOffDate+"T00:00:00";
				mParameter.reason=reason;
				this.getView().setBusy(true);
				var url = "/tscm/CRF/sendMail";		
				common.postData(url, JSON.stringify(mParameter), this.fnSubmitSelectedCallback.bind(this));
				}	
	},
		fnSubmitSelectedCallback:function(oEvent){
				this.getView().setBusy(false);
				if(oEvent.getParameter("success")){
					var data = oEvent.getSource().getData();
					if(data.success="true"){
						common.successDialog(data.message,this.fnSuccessMessage.bind(this));
						this.onClear();
					}
				}	
				  else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
	},
	
		fnSuccessMessage : function(oEvent){
			//Nothing is to be done in this callback
	},
	
		onChange:function(oEvent){
		
				var crfModel= this.getView().getModel("crfModel");
				var value=oEvent.getSource().getValue();
				var id=oEvent.getParameters().id.split("-")[2];
				if(value==""){
					crfModel.getData().projectCodevalueState = "None";
					crfModel.getData().employeeCodeResvalueState = "None";
					crfModel.getData().changeInAllocationvalueState = "None";
					crfModel.getData().changeInBillingvalueState = "None";
					crfModel.getData().reasonForChangevalueState = "None";
					crfModel.refresh(true); 
					return;
				}
					switch (id)
					{
					case "projectCode":
						var sVal = value.replace(/[^a-zA-Z0-9 ]/g, "");
						oEvent.getSource().setValue(sVal);
						break;
					case "employeeCodeRes":
						var sVal = value.replace(/[^a-zA-Z0-9 ]/g, "");
						oEvent.getSource().setValue(sVal);
						break;
						
					case "changeInAllocation":
						if(!common.validateNumeric(value)){
						sap.m.MessageToast.show("Enter valid Change in Allocation %");
						crfModel.getData().changeInAllocationvalueState = "Error";
						crfModel.refresh(true); 
						}
						else{
							crfModel.getData().changeInAllocationvalueState = "None";
							crfModel.refresh(true); 
						}
						break;
						
					case "changeInBilling":
						if(!common.validateNumeric(value)){
						sap.m.MessageToast.show("Enter valid Change in Billing %");
						crfModel.getData().changeInBillingvalueState = "Error";
						crfModel.refresh(true); 
						}
						else{
							crfModel.getData().changeInBillingvalueState = "None";
							crfModel.refresh(true); 
						}
						break;	
					case "reasonForChange":
						if(!common.validateText(value)){
						sap.m.MessageToast.show("Enter valid Reason for Change");
						crfModel.getData().reasonForChangevalueState = "Error";
						crfModel.refresh(true); 
						}
						else{
							crfModel.getData().reasonForChangevalueState = "None";
							crfModel.refresh(true); 
						}
						break;	
					
					 default:
						break;
					      
					}
			},
			
			   onLiveChange:function(oEvent)
			   {
				   
				   var value=oEvent.getSource().getValue();
				   var sVal = value.replace(/[^0-9 ]/g, "");
				   this.flag=1;
				   if(this.flag==0)
				   {
					   return;
				   }
				   if(value<0 || value>100)
				   {
					   MessageToast.show("Please enter between the range 0-100");
					   sVal="";
				   }
				   oEvent.getSource().setValue(sVal);
			   },
			 /*Modification for Suggestion items*/
			   onHandleSuggest : function(oEvent) {
					var that = this;
					var oView = this.getView();
					var name = oEvent.getSource().getValue();
					var id = oEvent.mParameters.id.split("-")[2];
					var getInput = oEvent.getSource();
					var oLoadDetailsModel = this.getView().getModel("oLoadDetailsModel");
					var oloadModel = new sap.ui.model.json.JSONModel();
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
										//common.errorDialog(oEvent.getParameter("errorobject").statusText+ "\{nPlease contact your system administrator");
									}
								});
					
				},
				onEdit: function(oevent){
					
					var oView= this.getView();
					this.aProductCollection = jQuery.extend(true, [], this.getView().getModel("oResMgmtModel").getProperty("/allocationDto"));
					oView.byId("editButton").setVisible(false);
					oView.byId("cancelButton").setVisible(true);
					oView.byId("submitButton").setVisible(true);		
					var oResMgmtModel=oView.getModel("oResMgmtModel");      
					oResMgmtModel.getData().editable=true;    
					oResMgmtModel.refresh();
				},
			   
				onSubmit:function(){
					var oResMgmtModel = this.getView().getModel("oResMgmtModel");
					var oSearchResModel = new sap.ui.model.json.JSONModel();
					var data ;
					var that=this;
					var oView = this.getView();
					 if(this.validateTableData()==false)
							 return;
					 //setting the flag to false to make the row non editable
						oResMgmtModel.getData().allocationDto[0].nonEditable="false";
						oResMgmtModel.refresh();
						var obj=this.getView().byId("idResDataTable").getModel().getData().allocationDto;
						this.aDtoData ={"allocationDto":obj};
						oView.byId("cancelButton").setVisible(false);
						MessageBox.success("Do you want to Submit the request", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Submit",
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						onClose: jQuery.proxy(function(oAction) {
						if (oAction === "OK") {
							
							var that = this;
							var crfModel=this.getView().getModel("crfModel");
							var arr=[];
							oView.byId("editButton").setVisible(true);
							var oPrjctDetailsModel = this.ownerComponent.getModel().getData().ProjectDetails;
							for(var i=0;i<this.aDtoData.allocationDto.length;i++)
							{
								var tdata=this.aDtoData.allocationDto[i];
								tdata.is_Selected = "true";
								tdata.requestStatus = "Approval Pending";
								tdata.allocationStatus = "Planned";
								arr.push(tdata);
							}
							
							this.aDtoData=arr;
							var obj = {"allocationDto": this.aDtoData};
							var url = "/tscm/Allocation/createCrfAllocations";
							this.getView().setBusy(true);
							common.postData(url, JSON.stringify(obj), this.fnSubmitResourcesCompleted.bind(this));
							oResMgmtModel.getData().editable = false;  
							oResMgmtModel.refresh();
						}else if (oAction === "CANCEL"){
							this.getView().byId("cancelButton").setVisible(true);
							oResMgmtModel.getData().editable = true; 
							oResMgmtModel.refresh();
							}
						}, this)
						});
						oResMgmtModel.getData().createFlag = false;    
						oResMgmtModel.refresh();
				},
				fnSubmitResourcesCompleted: function(oEvent){
					var oView = this.getView();
					var that=this;
					oView.setBusy(false);
					if(oEvent.getParameter("success")){
						var data = oEvent.getSource().getData();
						this.demandId=data.demandId;//Fix for printing demandId in msg box.
						//Fix for sending exaact as exact
						var sAllocType;
						this.successMsg = data.message;
						if(data.success === "true"){
							this.aDtoData.some(function(item){
								sAllocType = item.allocationType;
							});
							var crfModel=this.getView().getModel("crfModel");
							var turl="/bpmodata/startprocess.svc/oneapp.incture.com/cw_tscm~cw_tscm~crf~bpm/CRF_APPR_PRC/StartData";
							var token=this.getCSRF(turl);
							var oParam = {
								"ProcessStartEvent": {
									"::StartPrc":{
										"crfWsdl": {
												"projManagerId": crfModel.getData().EmpReq,
												"demandId":this.demandId,
												"projectCode":crfModel.getData().ProjectCode,
												"projectName":crfModel.getData().ProjectName,
												"Role":"RM" 
										}
									}
								}
							};
							common.startBPMProcessCRF(oParam,token,this.ownerComponent, this.fnSuccess.bind(this), this.fnError.bind(this));
						} else {
							common.errorDialog(data.message);
						}
					 } else {
						 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
					 }
				},
				
				fnSuccess: function(data, res){
					common.successDialog("Resources submitted for approval.The demand ID is "+this.demandId, this.onSuccess.bind(this));
				},
				
				fnError: function(err){
					common.errorDialog(err.response.statusText + "\nPlease contact your system administrator");
				},
				
				onSuccess:function(action){
					if(action === "OK"){
						this.onClear();
					}
				},
				
				getCSRF: function(strUrl){
					var token;
					$.ajax({
					          url: strUrl,
					          method: "GET",
					          async: false,
					          headers: {
					              "X-CSRF-Token": "Fetch"
					          },
					          success: function(result, xhr, data) {
					              token = data.getResponseHeader("X-CSRF-Token");
					          },
					          error: function(result,xhr,data)
					          {
					          token = result.getResponseHeader("x-csrf-token");
					          }
					      });
					      return token;
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
				   onChangeBillpercent:function(oEvent){
					     var that=this;
						  var oResMgmtModel = this.getView().getModel("oResMgmtModel");
						  var sPath = oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
						  var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
						  var selRollOffDateMonth = new Date(oModelData.rollOffDate).getMonth();
						  var selActualStrtDate = new Date(oModelData.actualStartDate).setHours(0,0,0,0);
						  var selRollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0);
						  var billPercent = oModelData.billPercent;;
						  var allResultsModel = this.getOwnerComponent().getModel("oRMTableResults");
						  var empData ;
						  var oldBillPercent;
						  
						  oldBillPercent = this.aProductCollection[sPath.split("/")[2]].billPercent;
						  var currDate = new Date().setHours(0,0,0,0);
						  var currDateMonth = new Date().getMonth();
						  /*TSCT -189 Bug fix */
						  if(selRollOffDate < currDate && selRollOffDateMonth < currDateMonth){
								var message = "The bill percent of previously dated records cannot be changed";
								this.flag=0;
								common.errorDialog(message);
								
								oModelData.billPercent = oldBillPercent;
								oResMgmtModel.refresh();
								return;
						  }
						 /*  end of TSCT 158 fix */ 
						  if(billPercent>100 || billPercent<1 ){
						  		var message = "Please Enter the Bill percent between 0-100";
						  		if(oldBillPercent==0){
									oModelData.billPercent = "";
								}
						  		else{
						  			oModelData.billPercent = oldBillPercent;
						  		}
								common.errorDialog(message);
								oResMgmtModel.refresh();
								return
						  }
							
						    
						    
					},
					validateTableData:function(oevent){
						var oResMgmtModel = this.getView().getModel("oResMgmtModel");
						var oResMgmtModelData = oResMgmtModel.getData().allocationDto[0];
						var len=oResMgmtModel.getData().allocationDto.length;
						var aTableRecords=oResMgmtModel.getData().allocationDto;
						for (var i =0 ; i<len;i++){
							
							var selRollOffDate = new Date(aTableRecords[i].rollOffDate).setHours(0,0,0,0);
							var currDate = new Date().setHours(0,0,0,0);
							var selRollOffDateMonth = new Date(aTableRecords[i].rollOffDate).getMonth();
							var currDateMonth = new Date().getMonth();
							
							
							if((aTableRecords[i].actualStartDate==="" || aTableRecords[i].actualStartDate=== undefined )||
									(aTableRecords[i].rollOffDate==="" || aTableRecords[i].rollOffDate=== undefined )||
									(aTableRecords[i].billPercent==="" || aTableRecords[i].billPercent=== undefined )||
									(aTableRecords[i].utilizationPercent==="" || aTableRecords[i].utilizationPercent=== undefined )
									
							)
							{
								sap.m.MessageToast.show("Please enter the mandatory fields (Allocation Start Date  , Roll Off Date , Utilization % , Bill % and Comment )");
								return false;
							}
										else if( aTableRecords[i].tabRollOffvalueState=="Error"|| aTableRecords[i].tabAllocStrtDatevalueState=="Error" ){
											sap.m.MessageToast.show("Please enter the valid values for incorrect fields");
											return false;
											
										}
										
							
							  /*TSCT -189 Bug fix */
										else if(!(selRollOffDate < currDate && selRollOffDateMonth < currDateMonth)){
								
												if(aTableRecords[i].pmComment===""||aTableRecords[i].pmComment===undefined){
													var message = "The Comment of current date records cannot be empty.";
													
													common.errorDialog(message);
													aTableRecords[i].tabpmcommentvalueState ="Error";
													oResMgmtModel.refresh();
													return false;
												}
								
											}
										
						}
						return true;
					},
					onChangeUtilpercent: function(oEvent){
						  //Added for TSCT 158 
						  var oResMgmtModel = this.getView().getModel("oResMgmtModel");
						  var sPath = oEvent.getSource().getBindingContext('oResMgmtModel').getPath();
						  var oModelData = oEvent.getSource().getBindingContext('oResMgmtModel').getModel().getProperty(sPath);
						  var selRollOffDate = new Date(oModelData.rollOffDate).setHours(0,0,0,0);
						  /*TSCT 189 Bug fix*/
						  var selRollOffDateMonth = new Date(oModelData.rollOffDate).getMonth();
						  var oldUtilPercent = this.aProductCollection[sPath.split("/")[2]].utilizationPercent;
						  /*TSCT 189 Bug fix */
						  var currDate = new Date().setHours(0,0,0,0);
						  var currDateMonth = new Date().getMonth();
						  if(selRollOffDate < currDate && selRollOffDateMonth < currDateMonth){
								var message = "The utilisation percent of previously dated records cannot be changed";
								common.errorDialog(message);
								oModelData.utilizationPercent = oldUtilPercent;
								oResMgmtModel.refresh();
								return;
						  }
					},
					onNavButtonPress : function(oEvent){
						this.getOwnerComponent().getRouter().navTo("assignResources");
					}
	
/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf simpleform.view1
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf simpleform.view1
*/
	/*onAfterRendering: function() {
		var that=this;
		that.getView().byId("HBox1").setAlignItems("End");

	},
*/

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf simpleform.view1
*/
			
	});

});