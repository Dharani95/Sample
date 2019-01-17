sap.ui.define([
				"sap/ui/core/mvc/Controller",
				"sap/ui/model/json/JSONModel",
				"sap/m/MessageToast",
				"com/incture/util/common",
				"sap/ui/model/Filter",
				"sap/ui/model/FilterOperator"
				], function(Controller, JSONModel, MessageToast, common,Filter,FilterOperator) {
"use strict";

return Controller.extend("com.incture.controller.crfApproval", {
		onInit: function() {
			
			var ApprovalModel= new JSONModel();
			this.getView().setModel(ApprovalModel,"ApprovalModel");
			
			var ApprovalModelList= new JSONModel();
			this.getView().setModel(ApprovalModelList,"ApprovalModelList");
			
			var i18n = new sap.ui.model.resource.ResourceModel({bundleUrl:"i18n/i18n.properties"});
			this.getView().setModel(i18n,"i18n");
			
			var oCommentsModel= new JSONModel();
			this.getView().setModel(oCommentsModel,"oCommentsModel");
			if (jQuery.sap.getUriParameters().get("taskId")) {
				this.taskInstanceId = jQuery.sap.getUriParameters().get("taskId");
				this.getBPMContextData(this.taskInstanceId);
			}
			
		},
		
		getBPMContextData:function(taskId){
			var that = this;
			var oApprovalModel = this.getView().getModel("ApprovalModel");
			var oBPMProcessModel = new sap.ui.model.odata.ODataModel("/bpmodata/taskdata.svc/"+taskId,true);
			var sUrl = "/InputData('"+taskId+"')/DT_CRFMail";
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
			var oModelData = this.getView().getModel("ApprovalModel").getData();
			var checkDemand=oModelData.demandId;
			var oListModel = this.getView().getModel("ApprovalModelList");
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
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
		},
		
		disableFormatter:function(allocationType,approvalStatus,dmApprovalStatus){
			var oApprovalModelData = this.getView().getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
				if(sTaskName=="DM"&&approvalStatus=="false"){
					return false;
				}			
				if(sTaskName=="DM"&&allocationType=="Exact"){
					return false;
				}
				if(sTaskName=="FM"&&dmApprovalStatus=="false"){
					return false;
				}			
				if(sTaskName=="FM"&&allocationType!="Exact+1"){
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
		
		onApprovalPush:function(oEvent){
			var oEve=oEvent;
			var that=this;
			var oApprovalModelData = that.getView().getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			that.sEvtText = oEvent.getSource().getSelectedButton().getText();
			that.selectedRowData = oEvent.getSource().getBindingContext("ApprovalModelList").getObject();
			var status=that.selectedRowData.allocationType;
			if(sTaskName=="FM"){
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
					that.selectedRowData.allocationStatus = "Rejected";
					that.selectedRowData.requestStatus = "Rejected";
				}
			}
		}
		},
		
		dmApprovalPush:function(oEvent){
			
			var that=this;
			var oApprovalModelData = that.getView().getModel("ApprovalModel").getData();
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
					var comments=that.getView().byId("comments").getValue();
					that.selectedRowData.comments = comments;
					that.nonCheckableRecords.push(that.selectedRowData);

				} else {
					//Exact-1 and Rejected.
					that.selectedRowData.is_Selected = "false";
					that.selectedRowData.requestStatus = "Rejected";
					that.selectedRowData.dmApproval="false";
					var comments=that.getView().byId("comments").getValue();
					that.selectedRowData.comments = comments;
					that.nonCheckableRecords.push(that.selectedRowData);
				}
				
			}
			if(status=="Exact+1"){
				if(that.sEvtText === "Approve"){
					that.selectedRowData.dmApproval="true";
				that.nonCheckableRecords.push(that.selectedRowData);
				}
				else{
					that.selectedRowData.is_Selected = "false";
					that.selectedRowData.requestStatus = "Rejected";
					that.selectedRowData.dmApproval="false";
					that.nonCheckableRecords.push(that.selectedRowData);
				}
			}
		},
		
		fmApprovalPush:function(oEvent){
			
			var that=this;
			var oApprovalModelData = that.getView().getModel("ApprovalModel").getData();
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
					var comments=that.getView().byId("comments").getValue();
					that.selectedRowData.comments = comments;
					that.fmNonCheckableRecords.push(that.selectedRowData);

				} else {
					//Exact+1 and Rejected.
					that.selectedRowData.is_Selected = "false";
					that.selectedRowData.requestStatus = "Rejected";
					that.selectedRowData.fmApproval="false";
					var comments=that.getView().byId("comments").getValue();
					that.selectedRowData.comments = comments;
					that.fmNonCheckableRecords.push(that.selectedRowData);
				}
				
			}
			
			
		},
		//Bug fix for TSCT-141
		onApproveReject:function(oEvent){
			var aParams=this.getView().getModel("ApprovalModelList").getData().allocationDto;
			

			for (var i = 0; i<aParams.length; i++) {
				if ((aParams[i].allocationStatus)=="Rejected") {
					if(!aParams[i].commentValue || aParams[i].commentValue == "") {
						MessageToast.show("Comments are Mandatory on Rejection");
						return false;
					}
				}
			}
			
			this.sEvtText = oEvent.getSource().getText();
			common.confirmationDialog("Are you sure you want to " + this.sEvtText, this.onApproveRejectConfirm.bind(this));
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
			var oApprovalModelData = this.getView().getModel("ApprovalModel").getData();
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
					"DT_CRFMail":{
						"isApproved":that.tVal
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
				//Bug fix for TSCT-149
				location.search="";
				location.refresh();
			}
		},
		
		submitAllocation: function(){
			var that = this;
			var oModelData = that.getView().getModel("ApprovalModelList").getData();
			var oApprovalModelData = that.getView().getModel("ApprovalModel").getData();
			var sTaskName = oApprovalModelData.taskName;
			var aParams = [];
			aParams=this.getView().getModel("ApprovalModelList").getData().allocationDto;
			var obj = {
					"allocationDto":aParams	};
			var sUrl = "/tscm/Allocation/updateCrfAllocations";
			that.getView().setBusy(true);
			common.postData(sUrl, JSON.stringify(obj), that.fnSubmitResourcesCompleted.bind(that));
		},
		
		/* Start of Message Pop Over changes */
		onMessageAddition:function(oEvent){
		var that=this;
		var oView = this.getView();
		        var oDialog = oView.byId("inctureMDComments");
		        var oApprovalModelData = this.getView().getModel("ApprovalModel").getData();
		var sTaskName = oApprovalModelData.taskName;
		var selectedPath = oEvent.getSource().getBindingContext("ApprovalModelList").sPath.split("/")[2];
		var selRecord = oEvent.getSource().getBindingContext("ApprovalModelList").oModel.getData().allocationDto[selectedPath];
		var commentList={};
		      /*  var commentList= {
		        "notifications": [{
		        "msg" :"You have received $1000. Total balance is $1000",
		        "commentor":"Commented by RM",
		        "icon":"sap-icon://fa/creditCard"
		        },
		        {
		        "msg" :"Aresnal has won the FA cup beating Chelase 3-0",
		        "commentor":"20 May 2017 01:00s",
		        "icon":"sap-icon://fa/trophy"
		        },
		        {
		        "msg" :"Aresnal has won the FA cup beating Chelase 3-0",
		        "commentor":"20 May 2017 01:00s",
		        "icon":"sap-icon://fa/trophy"
		        }
		        ]
		        }*/
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
		        var oModel = that.getView().getModel("oCommentsModel")
		        oModel.setData(commentList);
		        
		        // create dialog lazily
		        if (!oDialog) {
		           // create dialog via fragment factory
		           oDialog = sap.ui.xmlfragment(oView.getId(), "com.incture.view.comments", this);
		           oView.addDependent(oDialog);
		        }
		        oDialog.openBy(oEvent.getSource());
		        this.index = oEvent.getSource().getBindingContext("ApprovalModelList").sPath.split("/")[2];
		},
		onPost:function(oEvent){
		var oApprovalModelData = this.getView().getModel("ApprovalModel").getData();
		var sTaskName = oApprovalModelData.taskName;
		var sValue = oEvent.getParameter("value");
		var allocationDto = this.getView().getModel("ApprovalModelList").getData().allocationDto;
		allocationDto[this.index].commentValue = sValue;
		this.getView().getModel("ApprovalModelList").refresh();
		var oModel = this.getView().getModel("oCommentsModel");
		 var oModelData = oModel.getData().notifications;
		     var oApprovalModelTableData = this.getView().getModel("ApprovalModelList").getData().allocationDto;
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
		 this.getView().getModel("ApprovalModelList").refresh();
		 var oFeedItem = this.getView().byId("feedInputId");
		// oFeedItem.setEnabled(false);
		 //Save data to specific row in model
		}
		/* End of Message Pop Over changes */
	});
});