jQuery.sap.declare('com.incture.Component');
sap.ui.define([
               'sap/ui/core/UIComponent',
               'sap/ui/core/IconPool',
               'com/incture/util/common'
               ], function (UIComponent, IconPool, common) {
	UIComponent.extend('com.incture.Component',{
		metadata: {
			manifest: "json"
		},
		
		init: function () {
			
			UIComponent.prototype.init.apply(this, arguments);
			// initialize the router
			this.getRouter().initialize();
			//set the device model
			this.setModel(common.createDeviceModel(), "device");
	        
	        IconPool.addIcon("tachometer", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f0e4"
	        });
	        
	        IconPool.addIcon("user", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f007"
	        });
	        
	        IconPool.addIcon("creditCard", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f09d"
	        });
	        
	        IconPool.addIcon("trophy", "fa", {
	        	fontFamily:"FontAwesome",
	        	content:"f091"
	        });
		},
		
		destroy: function () {
			
		}
	});
});