sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/Device",
	"sap/m/MessageBox"
], function(JSONModel, ODataModel, Device, MessageBox) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		
		confirmationDialog: function(msg, callBack) {
			MessageBox.confirm(msg, {
			    title: "Confirm",                                    
			    onClose: callBack,                                    
			    textDirection: sap.ui.core.TextDirection.Inherit     
			});
		},
		
		errorDialog: function(msg){
			MessageBox.error(msg, {
				title: "Error",                                      
				textDirection: sap.ui.core.TextDirection.Inherit     
		 });
		},
		
		successDialog: function(msg, callBack){
			MessageBox.success(msg, {
			    title: "Success",                                    // default
			    onClose: callBack,                                        // default
			    textDirection: sap.ui.core.TextDirection.Inherit     // default
			    });
		},
		
		postData: function(url, data, callBack){
			var oHeader={"Content-Type":"application/json; charset=utf-8"};
			var oModel = new JSONModel();
			oModel.loadData(url, data, true, "POST", false, false,oHeader);
			oModel.attachRequestCompleted(callBack);
		},
		
		getData : function(url, data, successCallBack,failCallback){
			var oHeader={"Content-Type":"application/json; charset=utf-8"};
			var oModel = new JSONModel();
			oModel.loadData(url, data, true, "GET", false, false,oHeader);
			oModel.attachRequestCompleted(callBack);
			oModel.attachRequestFailed(failCallback);
		},
		
		clearProjectDetails: function(ownerComponent){
			var oModel = ownerComponent.getModel();
			var oPMView = ownerComponent._oViews._oViews['com.incture.view.PMEntry'];
			oModel.setProperty("/ProjectDetails/Project", "");
			
			oPMView.byId("idAccountName").removeStyleClass("SelectError");
			oPMView.byId("idAccountName").setSelectedKey("");
			oPMView.byId("idProject").setSelectedKey("");
			oModel.setProperty("/ProjectDetails/ProjectId", "");
			oModel.setProperty("/ProjectDetails/ProjectStrtDate", "");
			oModel.setProperty("/ProjectDetails/ProjectStrtDateValState", "None");
			oModel.setProperty("/ProjectDetails/ProjectEndDate", "");
			oModel.setProperty("/ProjectDetails/ProjectEndDateValState", "None");
			oModel.setProperty("/ProjectDetails/RlsUploader", "");
			oModel.setProperty("/ProjectDetails/RlsUploaderValState", "None");
			ownerComponent.getModel("RLSModel").setData();
		},
		
		startBPMProcess:function(data,token,ownerComponent, success, error){
			var oBPMModel = ownerComponent.getModel("BPMProcessModel");
			var mHeaders =  {"x-csrf-token": token};
			oBPMModel.setHeaders(mHeaders);
			oBPMModel.create("/StartData", data, null, success, error);
		},
		startBPMProcessCRF:function(data,token,ownerComponent, success, error){
			var oBPMModel = ownerComponent.getModel("BPMProcessModelCRF");
			var mHeaders =  {"x-csrf-token": token};
			oBPMModel.setHeaders(mHeaders);
			oBPMModel.create("/StartData",data, null,success, error);
		},
		
		//added for TSCT 85	
		validateAlphanumeric:function (input) {
		    var regEx = /^[a-zA-Z0-9]+$/;
		    if (!input.match(regEx)) {
		        return false;
		    } else {
		        return true;
		    }
		},
		
		//Bug fix for Task-89
		onSAPEnter: function(inputField, that){            
  			inputField.onsapenter = (function(oEvent) {
  								var that = this;
      							that.onSearch();
  						   }).bind(that);
      	},
		

		validateText:function (input) {
		    var regEx = /^[a-zA-Z ]+$/;
		    if (!input.match(regEx)) {
		        return false;
		    } else {
		        return true;
		    }
		},
		
		validateNumeric:function (input) {
		    var regEx = /^[0-9]+(\.[0-9]{1,2})?$/;
		    if (!input.match(regEx)) {
		        return false;
		    } else {
		        return true;
		    }
		}
	};
});