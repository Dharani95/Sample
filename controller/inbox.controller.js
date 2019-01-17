sap.ui.define([
	"sap/ui/core/mvc/Controller",
], function(Controller) {
	"use strict";

	return Controller.extend("com.incture.controller.inbox", {
		onInit: function() {
//			this.ownerComponent = this.getOwnerComponent();
//			this._router = this.ownerComponent.getRouter();
//			this._router.getRoute("matchedRsrc").attachPatternMatched(this._routePatternMatched, this);
		},
		
		_routePatternMatched: function(oEvent){
			
		}
	});
});