sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/incture/util/common",
	"sap/ui/model/json/JSONModel"
], function(Controller, common, JSONModel) {

	return Controller.extend("com.incture.controller.App", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf view.Details
	*/
		onInit: function() {
			var that = this;
			//Sowndharya
			var oView = this.getView();
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			var oLoggedInModel = new JSONModel();
			oLoggedInModel.loadData("/tscm/umeUser/loggedIn");
			oLoggedInModel.attachRequestCompleted(function(oEvent){
				oView.setBusy(false);
				if(oEvent.getParameter("success")){
					var oData = oEvent.getSource().getData();
					oView.setModel(oLoggedInModel, "UserDetails");
				 } else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
		},
		/**
		 * Method is called when user starts searching in the SearchField.
		 * @param: event - search event.
		 */
		onSuggest: function (event) {
			var value = event.getParameter("suggestValue");
			var oSearchField = this.byId("searchField");
			var filters = [];
			if (value) {
				filters = [new sap.ui.model.Filter([
                               new sap.ui.model.Filter("desc", function(sDes) {
                                    return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                                   })
                           ])];
			}

			oSearchField.getBinding("suggestionItems").filter(filters);
			oSearchField.suggest();
		},
		
		/**
		 * Method is called when user selects a element from SearchField only.
		 */
		onSearch: function(event) {
			var item = event.getParameter("suggestionItem");
			if (item) {
				sap.m.MessageToast.show("search for: " + item.getText());
			}
		},
		
		/**
		 * UserPreference fragment is called and shown to user. 
		 * To change the user information, please change UserPreference.fragment.xml
		 */
		
		onUserPress: function(oEvent) {
			 var oView = this.getView();
	         var oDialog = oView.byId("userDialog");
	         // create dialog lazily
	         if (!oDialog) {
	            // create dialog via fragment factory
	            oDialog = sap.ui.xmlfragment(oView.getId(), "com.incture.view.userPreference", this);
	            oView.addDependent(oDialog);
	         }
	         oDialog.openBy(oEvent.getSource());
		},
		
		onLogOut: function(){
			var oLogOutModel =  new sap.ui.model.json.JSONModel();
			var url = "/tscm/LoginServlet?redirectUrl=logout";
			oLogOutModel.loadData(url);
			oLogOutModel.attachRequestCompleted(function(oEvent) {
				if (oEvent.getParameter("success")) {
					location.hash="";
					location.reload();
				} else {
					if(location.search){
					location.search="";
					window.refresh();
					}
					else{
						location.hash="";
						location.reload();
					}
					
				}
			});
		},
		
		/**
		 * Used to show  the master page on click of menu button.
		 * DO NOT CHANGE.
		 */
		onShowMaster: function(oEvent) {
			var oSplitApp = this.getView().byId('idSplitApp');
			if(oSplitApp.isMasterShown()) {
				oSplitApp.hideMaster();
			} else {
				oSplitApp.showMaster();
				this._router.navTo("master");
			}
		},
		
		/*
		 * Function is called when user clicks on the notification icon
		 * To change NotificationPanel, please change NotificationPanel.fragment.xml
		 */
		handleNotifications: function(oEvent) {
			 var oView = this.getView();
	         var oDialog = oView.byId("inctureMDNotifications");
	         // create dialog lazily
	         if (!oDialog) {
	            // create dialog via fragment factory
	            oDialog = sap.ui.xmlfragment(oView.getId(), "com.incture.view.notificationPanel", this);
	            oView.addDependent(oDialog);
	         }
	         oDialog.openBy(oEvent.getSource());
		},

	/**
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
			if (jQuery.sap.getUriParameters().get("taskId")) {
				// this.busy.open();
				//this.taskInstanceId = jQuery.sap.getUriParameters().get("taskId");
				this._router.getTargets().display("approval");
				//this.getBPMContextData(this.taskInstanceId);
			}
		},

	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	* @memberOf view.Details
	*/
//		onExit: function() {
	//
//		}

	});
});
