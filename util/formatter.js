jQuery.sap.declare("com.incture.util.formatter");

com.incture.util.formatter = {
	/** This function calculates the no of list items to be shown on Panel. 
	 * If no list items are present it automatically hides the number
	 */
	fnMD_DisplayChildCount : function(oNode) {

		/*  this.removeStyleClass("inctureMDTxtClrWhite inctureMDBadge");
		  if (oNode) {
			  if (oNode.length > 0 ) {
				  this.addStyleClass("inctureMDTxtClrWhite inctureMDBadge");
				  return oNode.length;
			  } else {
				  return "";
			  }
		  } else {
			  return "";
		  }*/

	},

	fn_formatDate : function(value) {
		jQuery.sap.require("sap.ui.core.format.DateFormat");
		if (value) {
			if (typeof value == "string") {
				if (value.includes("-")) {
					value = value.split("T")[0];
					value = value.split("-");
					value = value[1] + "/" + value[2] + "/" + value[0];
				}
			}
			var dateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern : "yyyy-MM-dd"
			});
			return dateFormat.format(new Date(value));
		} else {
			return  "" ;
		}
	},

	fn_offShoreCheck : function(value) {
		if (value === "true")
			return "OffShore";
		//Changed for TSCT 102 
		else if(value === "false")
			return "Onsite";
	},

	fn_editabilityCheck : function(value) {
		if (value === "true")
			return true;
		else
			return false;
	},

	formatDateAvailableFrom : function(sVal) {
		if (!sVal) return;
		var sParsedDate = new Date(sVal);
		var dateFormat = sap.ui.core.format.DateFormat.getInstance({
			pattern : "MMM d, y"
		});
		this.getBindingContext("ResourceMatched").getObject().stringAvailableFrom = dateFormat.format(sParsedDate);
		return dateFormat.format(sParsedDate);
	},
	formatDateAvailableTo : function(sVal) {
		if (!sVal) return;
		var sParsedDate = new Date(sVal);
		var dateFormat = sap.ui.core.format.DateFormat.getInstance({
			pattern : "MMM d, y"
		});
		this.getBindingContext("ResourceMatched").getObject().stringAvailableTo = dateFormat.format(sParsedDate);
		return dateFormat.format(sParsedDate);
	},
	formatDate : function(sVal) {
		
		if (!sVal) return;
		var sParsedDate = new Date(sVal);
		var dateFormat = sap.ui.core.format.DateFormat.getInstance({
			pattern : "MMM d, y"
		});
		return dateFormat.format(sParsedDate);
	},
	fn_empNameFormatter:function(eName){
		var id = this.getParent().sId;
		
	
	
		
		setTimeout(function() {$("#"+id+"-fixed").addClass("nodataText");}, 100);
		
		setTimeout(function() {$("#"+id+"-fixed").removeClass("nodataText");}, 100);
		
		
		if(eName){
			if(eName==='NoData'){
				
				setTimeout(function() {$("#"+id+"-fixed").addClass("nodataText");}, 100);
				
				return "NO RECORD FOUND";
			}
			
		}
		
		return eName;
		

	}
	
};