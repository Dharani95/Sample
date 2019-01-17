sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"com/incture/util/common"
], function(Controller, JSONModel, MessageToast, common) {
	"use strict";

	return Controller.extend("com.incture.controller.matchedResources", {
		onInit: function() {
			var that = this;
			var oEmpModel = new JSONModel();
			this.oEmpModel=oEmpModel;
			this.oEmpModel.getData().empArray=[];
			this.ownerComponent = this.getOwnerComponent();
			this._router = this.ownerComponent.getRouter();
			var RLSModel=this.getView().getModel("RLSModel");
			var oResponseRlsData= new sap.ui.model.json.JSONModel();
			this.getView().setModel(oResponseRlsData, "oResponseRlsData");
			this._router.getRoute("matchedRsrc").attachPatternMatched(this._routePatternMatched, this);
			var oLoggedInModel = new JSONModel();
			oLoggedInModel.loadData("/tscm/umeUser/loggedIn");
			oLoggedInModel.attachRequestCompleted(function(oEvent){
				that.getView().setBusy(false);
				if(oEvent.getParameter("success")){
					var oData = oEvent.getSource().getData();
					that.getView().setModel(oLoggedInModel, "LoggedUser");
				 } else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
			
		},
		_routePatternMatched: function(oEvent){
			var oView = this.getView();
			var oTable = oView.byId("idResourceSrchTbl");
			if(oTable != undefined){
				oTable.removeSelections(true);
			}
			
			
		},
		
		onBack:function(oEvent){
			
			var ResourceMatched=this.getView().getModel("ResourceMatched");
			this.oEmpModel.getData().empArray=[];
			/*this.map=ResourceMatched.getData().RLSDetails.entry;*/
			this.onClear();
			this.getOwnerComponent().getRouter().navTo("assignResources");
			
		},
		
		statusFormatter: function(sVal){
			if(!sVal) return;
			switch(sVal) {
				case "Exact": 
					return "Ex";
				case "Exact+1": 
					return "E+1";
				case "Exact-1": 
					return "E-1";
				case "Partial+1": 
					return "P+1";
				case "Partial-1": 
					return "P-1";
				case "Under-Utilized":
					return "UU";
			}
		},
		
		stateFormatter: function(sVal){
			if(!sVal) return;
			if(sVal === "Exact"){
				return "Success";
			} else if(sVal==="Exact+1") {
				return "Error";
			}
			else{
				return "Warning";
			}
		},
		
		onNamedRsrcSelect:function(oEvent){
			var oView =  this.getView();
			if (!this.oNamedRsrcDialog) {
				this.oNamedRsrcDialog = sap.ui.xmlfragment(oView.getId(),
						"com.incture.view.selectNamedResource", this);
				oView.addDependent(this.oNamedRsrcDialog);
			}
			oView.byId("idEmpId").setValue("");
			oView.byId("idEmpName").setValue("");
			this.ownerComponent.getModel("NamedResource").setData();
			this.oNamedRsrcDialog.open();
		},
		
		onSuggestionItemSelect:function(oEvent){
			var oView = this.getView();
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var sControlBindPath = oSelectedItem.getBindingInfo("text").binding.sPath;
			var oBindingContext = oSelectedItem.getBindingContext("EmpSuggestion");
			var oEmpSuggestModel = oBindingContext.oModel;
			var sPath = oBindingContext.sPath;
			var oSelectedContext = oEmpSuggestModel.getProperty(sPath);
			if(sControlBindPath === "name"){
				oView.byId("idEmpId").setValue(oSelectedContext.id);
			} else {
				oView.byId("idEmpName").setValue(oSelectedContext.name);
			}
		},
		
		onCancel:function(oEvent){
			this.oNamedRsrcDialog.close();
		},
		onAllocationChange:function(oEvent){
			
			var oView=this.getView();
			var dataIndex=oEvent.getSource().getBindingContext("ResourceMatched").sPath.split("/")[2];
			var ResourceMatched=oView.getModel("ResourceMatched");
			var data=ResourceMatched.getData().listAllocationDto[dataIndex];
			var availablePercent=Number(data.availablePercent);
			var primarySkills=data.primarySkills;
			var grade=data.subGrade;
			var weekNo=Number(data.weekNo);
			var allocationPercentage=Number(data.allocationPercentage);
			var empId=data.empId;
			var allocationType=data.allocationType;
			var gradeMap=ResourceMatched.getData().RLSDetails.entry;
			if (!(gradeMap instanceof Array)) {
   			  	gradeMap = [gradeMap];
			}
			this.map=gradeMap;
			//For getting the total allocation of the resource for Exact, Exact+1 and Exact-1 case.
			var totalAllocation=this.SearchEmpAllocation(empId,weekNo);
			var currAvail=availablePercent-totalAllocation;
			//Get the index of the Employee in the employee Model
			var empIndexInData=this.SearchEmpOnAllocationType(empId,weekNo,allocationType);
			//When the Resource is already fully occupied
			
			
			// Updation case where u will update in both model and map value
			if(empIndexInData!=-1)  // Updation case where u will update in both model and map value
			{
				var empData=this.oEmpModel.getData().empArray;
				var oldallocationPercent=Number(empData[empIndexInData].allocationPercentage); // Get old allocation
				var oldavaibility=Number(empData[empIndexInData].availablePercent); // Get Availability
				grade=this.getGrade(grade,allocationType); 
				var gradeSkill=grade+","+primarySkills; // Make a Primary Key to Search in the map 
				/*For Updation case the old allocation Percent will minus */
				currAvail=  currAvail+oldallocationPercent;
				totalAllocation=totalAllocation-oldallocationPercent;
				if(availablePercent==(totalAllocation+oldallocationPercent) && allocationPercentage>oldallocationPercent){
					 
					common.errorDialog("The Resource cannot have allocation % more than Availability % i.e "+oldallocationPercent+"%.");
					data.allocationPercentage=oldallocationPercent.toString();
					ResourceMatched.refresh(true);
					return;
				}
				else if(allocationPercentage>currAvail){
						if(totalAllocation=="0")
						{
							common.errorDialog("The Resource cannot have allocation % more than Availability % i.e "+currAvail+"%.");
						}
						else{
							common.errorDialog("You have allocated the resource "+totalAllocation+"%.Now ,it is "+currAvail+"% Available");
						}
						data.allocationPercentage=oldallocationPercent.toString();
						ResourceMatched.refresh(true);
						return;
				}
				
				
				for(var index in this.map)
				{
					       var mapKey = index;//This is the map's key.
					      
					       if(gradeSkill==this.map[mapKey].key)//This is the value part for the map's key.
					       {
					    	   var weekdetails=this.map[mapKey].value;
					    	   if (!(weekdetails.listString instanceof Array)) {
				    			  weekdetails.listString = [weekdetails.listString];
				    		  }
					    	   var weekPd=Number(weekdetails.listString[weekNo]);
							   break;
								  
					       }
	
				}
				//If user try to allocate more than the requirement
				var wholeRequirement=weekPd+oldallocationPercent;
				/*Check the available % and calculate it from the data in employee table by subtracting the Old available % and Old allocation % */
				if(allocationPercentage>wholeRequirement){
					var ExtraPd=allocationPercentage-wholeRequirement;
					common.errorDialog("You are trying to allocate "+ExtraPd+"% Extra Resource against the requested RLS");
					data.allocationPercentage=oldallocationPercent.toString();
					ResourceMatched.refresh(true);
					return;

				}
				/*The case When the change Allocation in greater than old allocation */
				if(oldallocationPercent<allocationPercentage){
					
					
					 /*Update data in the map */
					 var diff=allocationPercentage-oldallocationPercent;
					 var newWeekPd=oldallocationPercent+weekPd;
					 if(weekPd<diff)
					 {
						 	common.errorDialog("The Resource cannot be allocated because it is "+newWeekPd+"% available");
							data.allocationPercentage=oldallocationPercent.toString();
							ResourceMatched.refresh(true);
							return;
					 }
					 weekPd=weekPd-diff;
					 weekdetails.listString[weekNo]=weekPd.toString();
					 
					 
					 /*Update data in the employee model */
					 var empDataArray=this.oEmpModel.getData().empArray;
					 
					 for(var i=0;i<empDataArray.length;i++)
					 {
							if(empDataArray[i].empId==empId && empDataArray[i].weekNo==weekNo)
							{
								
								var allocationInNumber=Number(empDataArray[i].allocationPercentage);
								allocationInNumber+=diff;
								empDataArray[i].allocationPercentage=allocationInNumber.toString();
								break;
							}
					 }
					 var weekPlus=weekNo+1;
					 if(weekPd=="0")
							common.successDialog("Your Requirement is fulfilled for "+primarySkills+" "+grade+" in week"+" W"+weekPlus, this.DoNthg.bind(this));

				}
				else if(oldallocationPercent>allocationPercentage){
					
					for(var index in this.map)
					{
					       var mapKey = index;//This is the map's key.
					      
					       if(gradeSkill==this.map[mapKey].key)//This is the value part for the map's key.
					       {
					    	   var weekdetails=this.map[mapKey].value;
					    	   if (!(weekdetails.listString instanceof Array)) {
				    			  weekdetails.listString = [weekdetails.listString];
				    		  }
					    	   var weekPd=Number(weekdetails.listString[weekNo]);
							   break;
								  
					       }
	
					 }
					 /*Update data in the map */
					 var diff=oldallocationPercent-allocationPercentage;
					 var WholeWeekPd=oldallocationPercent+weekPd;
					 /*Previous requirement change*/
					 /*if(weekPd<diff)
					 {
						 	common.errorDialog("The Resource cannot can not be allocated because it is "+WholeWeekPd+"% available");
							data.allocationPercentage="";
							ResourceMatched.refresh(true);
							return;
					 }*/
					 weekPd=weekPd+diff;
					 weekdetails.listString[weekNo]=weekPd.toString();
					 
					 /*Update data in the employee model */
					 var empDataArray=this.oEmpModel.getData().empArray;
					 
					 for(var i=0;i<empDataArray.length;i++)
					 {
							if(empDataArray[i].empId==empId && empDataArray[i].weekNo==weekNo)
							{
								var allocationInNumber=Number(empDataArray[i].allocationPercentage);
								allocationInNumber-=diff;
								empDataArray[i].allocationPercentage=allocationInNumber.toString();
								break;
							}
					 }
				}
			}
			else{ // else Create a new entry in the model, where you will just subtract the values from the map value.
				
				
				var empIndexWithoutUpdate=this.SearchEmpOnWeekNempId(empId,weekNo);
				
				
				if(empIndexWithoutUpdate!=-1)
				{
					
					if(allocationPercentage>currAvail){
						common.errorDialog("You have allocated the resource "+totalAllocation+"%.Now ,it is "+currAvail+"% Available");
						data.allocationPercentage="";
						ResourceMatched.refresh(true);
						return;
					}
					/*If new record is going to be create in the employee model. */
					/*Create a record ,push in model and update the available PDs in map */
					grade=this.getGrade(grade,allocationType);
					var gradeSkill=grade+","+primarySkills;
					
					
					for(var index in this.map)
					{
					       var mapKey = index;//This is the map's key.
					      
					       if(gradeSkill==this.map[mapKey].key)//This is the value part for the map's key.
					       {
					    	   var weekdetails=this.map[mapKey].value;
					    	   if (!(weekdetails.listString instanceof Array)) {
				    			  weekdetails.listString = [weekdetails.listString];
				    		  }
					    	   var weekPd=Number(weekdetails.listString[weekNo]);
							   break;
								  
					       }
	
					 }
					
					if(weekPd<allocationPercentage){
						if(weekPd==0)
						{
							common.errorDialog("Your can't allocate more resources as your requirement is fulfilled.");
						}
						else{
							common.errorDialog("Your requirement is "+weekPd+"%.Please allocate under the range.");
						}
						
						data.allocationPercentage="";
						ResourceMatched.refresh(true);
						return;
					}
					else{
						weekPd=weekPd-allocationPercentage;
						weekdetails.listString[weekNo]=weekPd.toString();
						var tempData=jQuery.extend(true, {}, data);
						this.oEmpModel.getData().empArray.push(tempData);
						
						var weekPlus=weekNo+1;
						if(weekPd=="0")
							common.successDialog("Your Requirement is fulfilled for "+primarySkills+" "+grade+" in week"+" W"+weekPlus, this.DoNthg.bind(this));
						
						
						/*For Showing the Remaining availability % of employee */
 						/*if(weekPd=="0" && currAvail==allocationPercentage){
							common.successDialog("Your Requirement is fulfilled for "+primarySkills+" "+grade+" in week"+" W"+weekPlus+" and Resource is Fully Utilized for week"+" W"+weekPlus, this.DoNthg.bind(this));
						
						}

						else if(weekPd=="0"){
							common.successDialog("Your Requirement is fulfilled for "+primarySkills+" "+grade+" in week"+" W"+weekPlus, this.DoNthg.bind(this));
						}
						else if(currAvail==allocationPercentage){
							common.successDialog("Current Resource is Fully Utilized for week"+" W"+weekPlus+".", this.DoNthg.bind(this));
						
						}*/
					}
					
				}
				/*If allocation % is greater than availble % */
				else{ 
					if(allocationPercentage>availablePercent){
						common.errorDialog("The Resource cannot have allocation % more than Availability % i.e "+availablePercent+"%.");
						data.allocationPercentage="";
						ResourceMatched.refresh(true);
						return;
					}
					/*If new record is going to be create in the employee model. */
					/*Create a record ,push in model and update the available PDs in map */
					grade=this.getGrade(grade,allocationType);
					var gradeSkill=grade+","+primarySkills;
					
					
					for(var index in this.map)
					{
					       var mapKey = index;//This is the map's key.
					      
					       if(gradeSkill==this.map[mapKey].key)//This is the value part for the map's key.
					       {
					    	   var weekdetails=this.map[mapKey].value;
					    	   if (!(weekdetails.listString instanceof Array)) {
				    			  weekdetails.listString = [weekdetails.listString];
				    		  }
					    	   var weekPd=Number(weekdetails.listString[weekNo]);
							   break;
								  
					       }
	
					 }
					
					if(weekPd<allocationPercentage){
						if(weekPd==0)
						{
							common.errorDialog("Your requirement is FulFilled.Please Don't try for more resources");
						}
						else{
							common.errorDialog("Your remaining requirement is "+weekPd+"%.Please allocate under the range.");
						}
						
						data.allocationPercentage="";
						ResourceMatched.refresh(true);
						return;
					}
					else{
						weekPd=weekPd-allocationPercentage;
						weekdetails.listString[weekNo]=weekPd.toString();
						var tempData=jQuery.extend(true, {}, data);
						this.oEmpModel.getData().empArray.push(tempData);
						
						var weekPlus=weekNo+1;
						if(weekPd=="0")
							common.successDialog("Your Requirement is fulfilled for "+primarySkills+" "+grade+" in week"+" W"+weekPlus, this.DoNthg.bind(this));
						
						/*For Showing the Remaining availability % of employee */
						/*if(weekPd=="0" && allocationPercentage==availablePercent){
							common.successDialog("Your Requirement is fulfilled for "+primarySkills+" "+grade+" in week"+" W"+weekPlus+" and Resource is Fully Utilized for week"+" W"+weekPlus, this.DoNthg.bind(this));
						
						}

						else if(weekPd=="0"){
							common.successDialog("Your Requirement is fulfilled for "+primarySkills+" "+grade+" in week"+" W"+weekPlus, this.DoNthg.bind(this));
						}
						else if(allocationPercentage==availablePercent){
							common.successDialog("Current Resource is Fully Utilized for week"+" W"+weekPlus+".", this.DoNthg.bind(this));
						
						}*/
					}
				}
				
			}
		},
		getGrade: function(grade,allocationType){
			
			var arrOfGrade=["G0","G1.1","G1.2","G1.3","G2.1","G2.2","G3.1","G3.2","G3.3","G3.4"];
			var index;
			
			if(allocationType=="Exact"){
				return grade;
			}
			else{
				
				for(var i=0;i<arrOfGrade.length;i++)
				{
						if(arrOfGrade[i]==grade){
							index=i;
							break;
						}
				}
				if(index!=0 && allocationType=="Exact+1")
				{
					index--;
				}
				else if((index!=arrOfGrade.length)&& allocationType=="Exact-1")
				{
					index++;
				}
				
				return arrOfGrade[index];
			}
			
		},
		SearchEmpOnAllocationType:function(empId,weekNo,allocationType){
			
			var oView = this.getView();
			var empData=this.oEmpModel.getData().empArray;
			for(var i=0;i<empData.length;i++)
			{
				if(empData[i].empId==empId && empData[i].weekNo==weekNo && empData[i].allocationType==allocationType)
				{
					return i;
				}
			}
			return -1;
			
		},
		SearchEmpOnWeekNempId:function(empId,weekNo){
			var oView = this.getView();
			var empData=this.oEmpModel.getData().empArray;
			for(var i=0;i<empData.length;i++)
			{
				if(empData[i].empId==empId && empData[i].weekNo==weekNo )
				{
					return i;
				}
			}
			return -1;
			
		},
		SearchEmpAllocation:function(empId,weekNo){
			var oView = this.getView();
			var empExact=0;
			var empExactPlus=0;
			var empExactMinus=0;
			var empData=this.oEmpModel.getData().empArray;
			var total;
			
			for(var i=0;i<empData.length;i++)
			{
				if(empData[i].empId==empId && empData[i].weekNo==weekNo && empData[i].allocationType=="Exact")
				{
					empExact=Number(empData[i].allocationPercentage);
				}
				if(empData[i].empId==empId && empData[i].weekNo==weekNo && empData[i].allocationType=="Exact-1")
				{
					empExactMinus=Number(empData[i].allocationPercentage);
				}
				if(empData[i].empId==empId && empData[i].weekNo==weekNo && empData[i].allocationType=="Exact+1")
				{
					empExactPlus=Number(empData[i].allocationPercentage);
				}
			}
			
			total=empExact+empExactPlus+empExactMinus;
			return total;
			
		},
		
		DoNthg:function(oEvent){
			
		},
		
		
		onEmpChange:function(oEvent){
			var that = this;
			var oValue = oEvent.getParameter("suggestValue");
			var oSuggestionModel = this.ownerComponent.getModel("EmpSuggestion");
			var oModel = new JSONModel();
			this.getView().setBusy(true);
			oModel.loadData("/tscm/Allocation/getEmployeeIdAndName/"+oValue);
			oModel.attachRequestCompleted(function(oEvent){
				that.getView().setBusy(false);
				if(oEvent.getParameter("success")){
					var aData = oEvent.getSource().getData();
					if (!(aData.idAndNameDto instanceof Array)) {
		    			  aData.idAndNameDto = [aData.idAndNameDto];
		    		  }
					oSuggestionModel.setSizeLimit(aData.idAndNameDto.length);
					oSuggestionModel.setData(aData);
					oSuggestionModel.refresh();
				 } else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
		},
		
		onResourceSelect:function(oEvent){
			var oView = this.getView();
			var oData = this.ownerComponent.getModel("NamedResource").getData();
			if(!oData){
				MessageToast.show("No resource found to select");
				return;
			}
			var sPrimarySkills = oData.listAllocationDto[0].primarySkills;
			if(!this.checkPrimarySkill(sPrimarySkills)){
				common.errorDialog("The primary skills of the resource selected is not matching with the RLS requirement");
				return;
			};
			if(this.checkResourceExist(oData.listAllocationDto[0])){
				common.errorDialog("Resource already exists");
				return;
			}
			common.confirmationDialog("Do you want to select this resource", this.pushSelectedResource.bind(this));
		},
		
		checkResourceExist:function(data){
			var sEmpName = data.empName;
			var aData = this.ownerComponent.getModel("ResourceMatched").getData().allocationDto;
			var key = "empName";
			return aData.some(function(obj){
		        return key in obj && obj[key] === sEmpName;
		    });
		},
		
		pushSelectedResource:function(action){
			if(action === "OK"){
				var oView = this.getView();
				var oData = this.ownerComponent.getModel("NamedResource").getData();
				var oRsrcMatchedModel = this.ownerComponent.getModel("ResourceMatched");
				var oRsrcModelData = jQuery.extend(true, {}, oRsrcMatchedModel.getData());
				oRsrcMatchedModel.setData();
				oView.byId("idResourceSrchTbl").unbindItems();
				if(oData.isNull === "false"){
					var oCurrObj = oData.listAllocationDto[0];
					oCurrObj.is_Selected = "true";
					oCurrObj.requestStatus = "Approval Pending";
					oCurrObj.projectCode = this.ownerComponent.getModel().getData().ProjectDetails.ProjectId;
					oRsrcModelData.allocationDto.push(oCurrObj);
					var oSorter = new sap.ui.model.Sorter({path: 'primarySkills', 
										descending: true, 
										group: true
									});
					var oItemTemplate = oView.byId("idTemplate");
					oView.byId("idResourceSrchTbl").bindItems({path: "ResourceMatched>/allocationDto", template: oItemTemplate, 
									sorter: oSorter});
					oRsrcMatchedModel.setData(oRsrcModelData);
					oRsrcMatchedModel.refresh(true);
				}
				this.onCancel();
			}
		},
		
		checkPrimarySkill:function(selctedPrimarySkill){
			var oRlsModelData = this.ownerComponent.getModel("RLSModel").getData();
			var canContinue = false;
			oRlsModelData.forEach(function(item, i){
				if(item.primarySkills === selctedPrimarySkill){
					canContinue = true;
				}
			});
			return canContinue;
		},
		
		onEmpSearch:function(oEvent){
			var oView = this.getView();
			var sEmpId = oView.byId("idEmpId").getValue();
			var sEmpName = oView.byId("idEmpName").getValue();
			if(!sEmpId && !sEmpName){
				return MessageToast.show("Search criteria cannot be empty");
			}
			var obj={"empId": sEmpId,
					 "empName": sEmpName
					} 
			var url ="/tscm/Allocation/getAllocationByFields";// url change
			this.getView().setBusy(true);
			common.postData(url, JSON.stringify(obj), this.fnEmpSearchCompleted.bind(this));
		},
		
		fnEmpSearchCompleted:function(oEvent){
			this.getView().setBusy(false);
			var oNamedRsrcModel = this.ownerComponent.getModel("NamedResource");
			if(oEvent.getParameter("success")){
				var data = oEvent.getSource().getData();
				if(data.isNull === "false"){
					if(!(data.listAllocationDto instanceof Array)) {
						data.listAllocationDto = [data.listAllocationDto];
					}
				}
				oNamedRsrcModel.setData(data);
			 } else {
				 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
			 }
		},
		
		onSubmit: function(oEvent){
			var oView = this.getView();
			var oTable = oView.byId("idResDataTable");
			var tableDto=oTable.getModel("ResourceMatched").getData().listAllocationDto;
			var aDtoData = [];
			tableDto.filter(function(obj, i, arr){
                            if(obj.selectedItem === true){
                            	aDtoData.push(obj);
                            }
            });
			
			this.aDtoData=aDtoData;
			if(this.aDtoData==""){
				common.errorDialog("Please select some record before proceeding.");
				return;
			}
			
			for(var i=0;i<this.aDtoData.length;i++)
			{
				var tdata=this.aDtoData[i];
				
				if(tdata.empName == "NoData"){
					common.errorDialog("You have selected some record having no data.");
					return;
				}
				else if(tdata.allocationPercentage==undefined ||tdata.allocationPercentage==""||tdata.allocationPercentage=="0"){
					if(tdata.allocationPercentage=="0")
					{
						common.errorDialog("Allocation % of the selected Record can't be 0");
					}
					else{
						common.errorDialog("You have selected some record having no allocation percentage.");
					}
					
					return;
				}
				else if(tdata.selectedItem===undefined || tdata.selectedItem==false){
					common.errorDialog("Please select some row before proceeding");
					return;
				}
				tdata.billPercent=tdata.allocationPercentage;
				tdata.utilizationPercent=tdata.allocationPercentage;
				
			}
			
			var copieddata=this.getOwnerComponent().getModel("oFlagModel").getData().RLSDetails;
			if (!(copieddata.entry instanceof Array)) {
   			  	copieddata.entry = [copieddata.entry];
			}
			var url="/tscm/Allocation/getRemainingPDs";
			var obj= {"listAllocationDto": this.aDtoData,
					   "RLSDetails":copieddata};
			common.postData(url,JSON.stringify(obj), this.fnGetRlsData.bind(this));
		},
		fnGetRlsData:function(oEvent){
			
				this.getView().setBusy(false);
				var that=this;
				var oResponseRlsData=this.getView().getModel("oResponseRlsData");
				if(oEvent.getParameter("success")){
					var data=oEvent.getSource().getData();
					if (!(data.resourceDto instanceof Array)) {
   			  			data.resourceDto = [data.resourceDto];
					}
					var map=data.resourceDto;//your map defined here
					map.forEach(function(item, i){
			    		  item.serialNo = i + 1;
			    		  var aSubItems;
			    		  if(item.weeks){
			    		  if (!(item.weeks instanceof Array)) {
			    			  aSubItems = [item.weeks];
			    			  item.weeks=[item.weeks];
			    		  } else {
			    			  aSubItems = item.weeks;
			    		  }
			    		  aSubItems.forEach(function(subItem, j){
			    			  var index=j+1;
			    			  item["W"+index] = subItem.value;
			    		  });
			    		  }
			    	  });
					oResponseRlsData.setData(map);
					that.openFragment();
			      } 
					else {
			    	  common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
			      }
			
		},
		submitSelectedResources:function(action){
			if(action === "OK"){
				var that = this;
				var oView = this.getView();
				var oTable = oView.byId("idResDataTable");
				var arr=[];
				var ResourceMatched=oView.getModel("ResourceMatched");
				var gradeMap=ResourceMatched.getData().RLSDetails.entry;
				var oPrjctDetailsModel = this.ownerComponent.getModel().getData().ProjectDetails;
				/*var aSelectedItems = oTable.getSelectedIndices();*/
				for(var i=0;i<this.aDtoData.length;i++)
				{
					var tdata=this.aDtoData[i];
					tdata.is_Selected = "true";
					tdata.requestStatus = "Approval Pending";
					tdata.allocationStatus = "Planned";
					tdata.billPercent=tdata.allocationPercentage;
					tdata.utilizationPercent=tdata.allocationPercentage;
					tdata.projectCode=editableModel.oData.projectCode;
					tdata.projectName=editableModel.oData.projectName;
					if(tdata.availableFrom && tdata.availableTo){
						tdata.actualStartDate = tdata.availableFrom;
						tdata.rollOffDate = tdata.availableTo;
					} else {
						tdata.actualStartDate = oPrjctDetailsModel.ProjectStrtDate + "T00:00:00";
						tdata.rollOffDate = oPrjctDetailsModel.ProjectEndDate  + "T00:00:00";
					}
					arr.push(tdata);
				}
				this.aDtoData=arr;
				var obj = {"allocationDto": this.aDtoData};
				var url = "/tscm/Allocation/createAllocations";
				this.getView().setBusy(true);
				common.postData(url, JSON.stringify(obj), this.fnSubmitResourcesCompleted.bind(this));
			}
		},
		
		fnSubmitResourcesCompleted1: function(oEvent){
			
		},
		
		checkExactMinusType:function(){
			this.aDtoData.some(function(item){
				var sAllocType = item.allocationType;
				if(sAllocType === "Exact-1"){
					return true;
				}
			});
		},
		
		checkExactPlusType:function(){
			this.aDtoData.some(function(item){
				var sAllocType = item.allocationType;
				if(sAllocType === "Exact+1"){
					return true;
				}
			});
		},
		
		onSelectionChange:function(oEvent){
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext("ResourceMatched");
			var oModel = oBindingContext.getModel();
			var sPath = oBindingContext.sPath;
			var oPrjctDetailsModel = this.ownerComponent.getModel().getData().ProjectDetails;
			var oCurrContext = oModel.getProperty(sPath);
			if(oEvent.getParameter("selected")){
				oCurrContext.is_Selected = "true";
				oCurrContext.requestStatus = "Approval Pending";
				oCurrContext.projectCode = oPrjctDetailsModel.ProjectId;
			} else {
				oCurrContext.is_Selected = "false";
				oCurrContext.requestStatus = "";
				oCurrContext.projectCode = "";
			}
		},
		onClear: function(oEvent){
			
			var oView = this.getView();
			
			oView.byId("Input1").setValue("");
			oView.byId("Input2").setValue("");
			oView.byId("Input3").setValue("");
			oView.byId("Input4").setValue("");
			oView.byId("Input5").setValue("");
			oView.byId("Input7").setValue("");
			oView.byId("Input8").setValue("");
			oView.byId("Input9").setValue("");
			oView.byId("Input10").setValue("");
			oView.byId("Input11").setValue("");
			oView.byId("Input12").setValue("");
			oView.byId("Input13").setValue("");
			oView.byId("Input14").setValue("");
			oView.byId("Input15").setValue("");
			oView.byId("Input16").setValue("");
			this.onTblSearch(oEvent);
			
		},
		openFragment:  function(oEvent) {
			if(!this.PMSubmissionFragment){
				
				this.PMSubmissionFragment=sap.ui.xmlfragment('com.incture.view.PMSubmissionFragment',this);
			}
			this.getView().addDependent(this.PMSubmissionFragment);
			this.PMSubmissionFragment.open();	
			this.fnRlsDataCompleted();
		},
		fnRlsDataCompleted:function(oEvent){
			this.getView().setBusy(false);
			var oResponseRlsData=this.getView().getModel("oResponseRlsData");
			var len=oResponseRlsData.getData()["0"].weeks.length
		    this.addTableColumns(len);
			orlsModelCopy.setData(data.rlsDtoList);
		     
		},

		addTableColumns:function(data){
			
			var oTable = sap.ui.getCore().byId("idPlanResourceTbl");
			if(data === 0){
				oTable.unbindRows();
				return;
			}
			oTable.removeAllColumns();
			oTable.addColumn(new sap.ui.table.Column({
				width: "4rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>SNo}"}),
				template: new sap.m.Text({text:"{oResponseRlsData>serialNo}"})
			}));
			oTable.addColumn(new sap.ui.table.Column({
				width: "6rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>SubGrade}"}),
				template: new sap.m.Text({text:"{oResponseRlsData>subGrade}"})
			}));
			
			oTable.addColumn(new sap.ui.table.Column({
				width: "11rem",
				resizable: false,
				label: new sap.m.Label({text: "{i18n>PrimarySkills}"}),
				template: new sap.m.Text({text:"{oResponseRlsData>primarySkills}"})
			}));
			
			for(var i=1; i<= data; i++){
				oTable.addColumn(new sap.ui.table.Column({
					width: "3rem",
					resizable: false,
					label: new sap.m.Label({text: "W"+i}),
					template: new sap.m.Text({text:"{oResponseRlsData>W"+i+"}"})
				}));
			}
			oTable.bindRows("oResponseRlsData>/");
		},
		onFragSubmitButton:function(oEvent){
			var that = this;
			var oView = this.getView();
			var loggedInModel=oView.getModel("LoggedUser");
			var oData=loggedInModel.getData();
					var pmID = oData.uniqueName;
					var pmName=oData.displayName;
				
			var oTable = oView.byId("idResDataTable");
			var arr=[];
			this.onFragCancelButton();
			var ResourceMatched=oView.getModel("ResourceMatched");
			var gradeMap=ResourceMatched.getData().RLSDetails.entry;
			var oPrjctDetailsModel = this.ownerComponent.getModel().getData().ProjectDetails;
			for(var i=0;i<this.aDtoData.length;i++)
			{
				var tdata=this.aDtoData[i];
				tdata.is_Selected = "true";
				tdata.requestStatus = "Approval Pending";
				tdata.allocationStatus = "Planned";
				tdata.projectManagerId  = pmID;
				tdata.projectManager  = pmName;
				tdata.billPercent=tdata.allocationPercentage;
				tdata.utilizationPercent=tdata.allocationPercentage;
				tdata.projectCode=editableModel.oData.projectCode;
				tdata.projectName=editableModel.oData.projectName;
				if(tdata.availableFrom && tdata.availableTo){
					tdata.actualStartDate = tdata.availableFrom;
					tdata.rollOffDate = tdata.availableTo;
				} else {
					tdata.actualStartDate = oPrjctDetailsModel.ProjectStrtDate + "T00:00:00";
					tdata.rollOffDate = oPrjctDetailsModel.ProjectEndDate  + "T00:00:00";
				}
				arr.push(tdata);
			}
			this.aDtoData=arr;
			var obj = {"allocationDto": this.aDtoData};
			var url = "/tscm/Allocation/createAllocations";
			this.getView().setBusy(true);
			common.postData(url, JSON.stringify(obj), this.fnSubmitResourcesCompleted.bind(this));
		},
		fnSubmitResourcesCompleted: function(oEvent){
			var oView = this.getView();
			oView.setBusy(false);
			if(oEvent.getParameter("success")){
				var sLoggedInId = oView.getModel("LoggedUser").getData().uniqueName;
				var data = oEvent.getSource().getData();
				this.demandId=data.demandId;//Fix for printing demandId in msg box.
				//Fix for sending exaact as exact
				var sAllocType;
				this.successMsg = data.message;
				if(data.success === "true"){
					this.aDtoData.some(function(item){
						sAllocType = item.allocationType;
					});
					var tUrl="/bpmodata/startprocess.svc/oneapp.incture.com/cw_tscm~bpmres/RES_APPR_PROCESS/StartData"
					var token=this.getCSRF(tUrl);
					var oProjectDetailsData = this.ownerComponent.getModel().getData().ProjectDetails;
					var oModeldata=editableModel.getData();
					var oParam = {
						"ProcessStartEvent": {
							"::StartPrc":{
								"allocationWsdl": {
										"projManagerId": sLoggedInId,
										"demandId": data.demandId,
										"allocationType":sAllocType,
										"projectCode":oModeldata.projectCode,
										"projectName":oModeldata.projectName,
										"projStartDate":oProjectDetailsData.ProjectStrtDate + "T00:00:00",
										"projEndDate":oProjectDetailsData.ProjectEndDate + "T00:00:00"
								}
							}
						}
					};
					common.startBPMProcess(oParam,token, this.ownerComponent, this.fnSuccess.bind(this), this.fnError.bind(this));
				} else {
					this.onFragCancelButton();
					common.errorDialog(data.message);
				}
			 } else {
				 this.onFragCancelButton();
				 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
			 }
				var oView = this.getView();
				oView.setBusy(false);
				if(oEvent.getParameter("success")){
				var oRlsModel = this.ownerComponent.getModel("RLSModel");
				var obj = {
				"demandId":  this.demandId,
				"rlsSheet":rlsSaveModel.oData.base64string
				};
				var url="/tscm/RLS/createRLS";
				var oHeader={"Content-Type":"application/json; charset=utf-8"};
				var oModel = new JSONModel();
				var data=JSON.stringify(obj);
				oModel.loadData(url, data, true, "POST", false, false,oHeader);

			}
		},
		
		fnSuccess: function(data, res){
			
			common.successDialog("Resources submitted for approval.The demand ID is "+this.demandId, this.onSuccess.bind(this));
		},
		
		fnError: function(err){
			this.onFragCancelButton();
			common.errorDialog(err.response.statusText + "\nPlease contact your system administrator");
		},
		fnbase64Failure:function(err){
			this.onFragCancelButton();
			common.errorDialog(err.response.statusText + "\nPlease contact your system administrator");
		},
		
		onSuccess:function(action){
			if(action === "OK"){
				
				common.clearProjectDetails(this.ownerComponent);
				this.ownerComponent.getModel("ResourceMatched").setData();
				this.getView().byId("idResDataTable").clearSelection(true);
				this.onBack();
			}
		},
		onFragCancelButton:function(oEvent){
			
			if(!this.PMSubmissionFragment){
				
				this.PMSubmissionFragment=sap.ui.xmlfragment('com.incture.view.PMSubmissionFragment',this);
			}
			this.getView().addDependent(this.PMSubmissionFragment);
			this.PMSubmissionFragment.close();	
			
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
		
		onTblSearch : function(oEvent) {
			
			
			var filters = [];
			var oView = this.getView();
			var value1=oView.byId("Input1").getValue();
			var value2=oView.byId("Input2").getValue();
			var value3=oView.byId("Input3").getValue();
			var value4=oView.byId("Input4").getValue();
			var value5=oView.byId("Input5").getValue();
			var value6=oView.byId("Input6").getValue();
			var value7=oView.byId("Input7").getValue();
			var value8=oView.byId("Input8").getValue();
			var value9=oView.byId("Input9").getValue();
			var value10=oView.byId("Input10").getValue();
			var value11=oView.byId("Input11").getValue();
			var value12=oView.byId("Input12").getValue();
			var value13=oView.byId("Input13").getValue();
			var value14=oView.byId("Input14").getValue();
			var value15=oView.byId("Input15").getValue();
			var value16=oView.byId("Input16").getValue();
			var value17=oView.byId("Input17").getValue();
			

			
			if(value1!=""){
				var oFilter1 = new sap.ui.model.Filter("empId","Contains",value1);
				 filters.push(oFilter1);
			}
			if(value2!=""){
				var oFilter2 = new sap.ui.model.Filter("empName","Contains",value2);
				 filters.push(oFilter2);
			}
			if(value3!=""){
				var oFilter3 = new sap.ui.model.Filter("subGrade","Contains",value3);
				 filters.push(oFilter3);
			}
			if(value4!=""){
				var oFilter4 = new sap.ui.model.Filter("primarySkills","Contains",value4);
				 filters.push(oFilter4);
			}
			if(value5!=""){
				var oFilter5 = new sap.ui.model.Filter("billPercent","Contains",value5);
				 filters.push(oFilter5);
			}
			if(value6!=""){
				var oFilter6 = new sap.ui.model.Filter("utilizationPercent","Contains",value6);
				 filters.push(oFilter6);
			}
			
			if(value7!=""){
				var oFilter7 = new sap.ui.model.Filter("availablePercent","Contains",value7);
				 filters.push(oFilter7);
			}
			
			if(value8!=""){
				var oFilter8 = new sap.ui.model.Filter("allocationPercentage","Contains",value8);
				 filters.push(oFilter8);
			}
			
			if(value9!=""){
				var oFilter9 = new sap.ui.model.Filter("stringAvailableFrom","Contains",value9);
				 filters.push(oFilter9);
			}
			if(value10!=""){
				var oFilter10 = new sap.ui.model.Filter("stringAvailableTo","Contains",value10);
				 filters.push(oFilter10);
			}
			if(value11!=""){
				var oFilter11 = new sap.ui.model.Filter("secondarySkill","Contains",value11);
				 filters.push(oFilter11);
			}
			if(value12!=""){
				var oFilter12 = new sap.ui.model.Filter("businessUnit","Contains",value12);
				 filters.push(oFilter12);
			}
			if(value13!=""){
				var oFilter13 = new sap.ui.model.Filter("offshore","Contains",value13);
				 filters.push(oFilter13);
			}
			if(value14!=""){
				var oFilter14 = new sap.ui.model.Filter("peopleManagerName","Contains",value14);
				 filters.push(oFilter14);
			}
			if(value15!=""){
				var oFilter15 = new sap.ui.model.Filter("designation","Contains",value15);
				 filters.push(oFilter15);
			}
			if(value16!=""){
				var oFilter16 = new sap.ui.model.Filter("emailId","Contains",value16);
				 filters.push(oFilter16);
			}
			if(value17!=""){
				var oFilter17 = new sap.ui.model.Filter("dmName","Contains",value17);
				 filters.push(oFilter17);
			}
			var ResourceMatched=this.getOwnerComponent().getModel("ResourceMatched");
			ResourceMatched.refresh(true);
			
			var tableId = oView.byId("idResDataTable");
			tableId.getBinding("rows").filter(filters,sap.ui.model.FilterType.Application);
				
			}
	});
});