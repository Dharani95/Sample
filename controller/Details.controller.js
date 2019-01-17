sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {

	return Controller.extend("com.incture.controller.Details", {

	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf view.Details
	*/
		
		
		onInit: function() { 
			
			var that=this;
			
			var SidePanelModel= new sap.ui.model.json.JSONModel();
			var oView=this.getView();
			var pmTile = this.getView().byId("idProjectMgt");
			var rmTile = this.getView().byId("idResourceMgt" );
			var inboxTile = this.getView().byId("idInbox");
			var crfTile = this.getView().byId("idCrf");
			oView.setModel(SidePanelModel,"SidePanelModel");
			var oLoggedInUserModel = new sap.ui.model.json.JSONModel();
			oLoggedInUserModel.loadData("/tscm/umeUser/loggedIn");
			oLoggedInUserModel.attachRequestCompleted(function(oEvent){
				oView.setBusy(false);
				if(oEvent.getParameter("success")){
					var oData = oEvent.getSource().getData();
					var userID = oData.role;
					
					
				/*	
					if(userID == "PM")
					{
						SidePanelModel.ProjectMgt=true;
						SidePanelModel.ResourceMgt=false;
						SidePanelModel.inbx=false;
						SidePanelModel.refresh(true);
						
					}
					else if(userID == "FM"){
						SidePanelModel.ProjectMgt=false;
						SidePanelModel.ResourceMgt=false;
						SidePanelModel.inbx=true;
						SidePanelModel.refresh(true);
						
					}
					else if(userID == "RM"){
						SidePanelModel.ProjectMgt=false;
						SidePanelModel.ResourceMgt=true;
						SidePanelModel.inbx=true;
						SidePanelModel.refresh(true);
						
					}
					else if(userID == "DM"){
						SidePanelModel.ProjectMgt=false;
						SidePanelModel.ResourceMgt=false;
						SidePanelModel.inbx=true;
						SidePanelModel.refresh(true);
						
					}
					else {
						
					}*/
				
					if(userID == "PM")
					{
						pmTile.setVisible(true);
						crfTile.setVisible(true);
						
					}
					else if(userID == "FM"){
						inboxTile.setVisible(true);
						
					}
					else if(userID == "RM"){
						rmTile.setVisible(true);
						inboxTile.setVisible(true);
						
					}
					else if(userID == "DM"){
						inboxTile.setVisible(true);
					}
					else {
						
					}
				
					/*var url = "/tscm/Role/getRoles/"+userID;
					SidePanelModel.loadData(url,true,"GET",false,false);
					SidePanelModel.attachRequestCompleted(function(oEvent) {
						var SidePanelData=that.getView().getModel("SidePanelModel").getData();
						
							that.getView().getModel("SidePanelModel").refresh();
						
					});
					
					SidePanelModel.attachRequestCompleted(function(oEvent) {
						
					});*/
				}
				
				else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
			
			
		},
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onNavTo: function(oEvent) {
			
				var name = oEvent.getSource().getHeader();
				if(name == "Resource Management"){
					this.getRouter().navTo("updateResMgmtTable");	 
				}
				else if (name == "Project Management"){
					this.getRouter().navTo("assignResources");	 
				}
				else if (name == "Change Request Form"){
					this.getRouter().navTo("ChangeRequestForm");	 
				}
				else {
					this.getRouter().navTo("Inbox");	 
				} 
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
