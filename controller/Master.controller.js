sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/tnt/NavigationListItem",
	"com/incture/util/common",
	"com/incture/util/formatter"
], function(Controller, NavigationListItem,common,formatter) {
		jQuery.sap.require("sap.ui.core.util.Export")
	jQuery.sap.require("sap.ui.core.util.ExportTypeCSV")
	return Controller.extend("com.incture.controller.Master", {
		
		
	/**
	* Called when a controller is instantiated and its View controls (if available) are already created.
	* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	* @memberOf view.Details
	*/
		onInit: function() {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("master").attachPatternMatched(this._routePatternMatched, this);
			
			/** DO NOT Change this method call **/
			this._fnAttachPressEventToPanels();
			
			
			
			var that=this;
			
			var SidePanelModel= new sap.ui.model.json.JSONModel();
			var oView=this.getView();
			oView.setModel(SidePanelModel,"SidePanelModel");
			var oLoggedInUserModel = new sap.ui.model.json.JSONModel();
			oLoggedInUserModel.loadData("/tscm/umeUser/loggedIn");
			oLoggedInUserModel.attachRequestCompleted(function(oEvent){
				oView.setBusy(false);
				if(oEvent.getParameter("success")){
					var oData = oEvent.getSource().getData();
					var userID = oData.uniqueName.toUpperCase();
					var userRole=oData.role;
					if((userRole == "RM")||(userRole == "DM")||(userRole == "FM"))
					{
						that.getView().byId("idDownload").setVisible(true);
						
					}
					var url = "/tscm/Role/getRoles/"+userID;
					SidePanelModel.loadData(url,true,"GET",false,false);
					SidePanelModel.attachRequestCompleted(function(oEvent) {
						var SidePanelData=that.getView().getModel("SidePanelModel").getData();
						if(SidePanelData){
							if (!(SidePanelData.roleMappingDto instanceof Array)) {
								SidePanelData.roleMappingDto = [ SidePanelData.roleMappingDto ];
							}
							for(var i=0;i<SidePanelData.roleMappingDto.length;i++){
								if (SidePanelData.roleMappingDto[i].listRole){
									if (!(SidePanelData.roleMappingDto[i].listRole instanceof Array)) {
										SidePanelData.roleMappingDto[i].listRole = [SidePanelData.roleMappingDto[i].listRole]
									}
								}
							}
							that.getView().getModel("SidePanelModel").refresh();
						}
					});
					
					SidePanelModel.attachRequestFailed(function(oEvent) {
						
					});
				 } else {
					 common.errorDialog(oEvent.getParameter("errorobject").statusText + "\nPlease contact your system administrator");
				 }
			});
			
				//that.getView().byId("idDownload").addStyleClass("downloadButtonClass")	 
				 

			//var that=this
			//var aData = that.ownerComponent.getModel("SidePanelModel").getData().roleMappingDto;
			//sidePanelModel.setData(aData);
			//this.getOwnerComponent().getModel("SidePanelModel");
		
		
			/*var aData = this.ownerComponent.getModel("SidePanelModel").getData().masterList;*/
		},
		
		

		_routePatternMatched: function(oEvent) {
			
		},
		
		
		/** Method is used to make the Panels expandable or not by checking, 	
		 * if the Subitems( list items) are present or not. Modify carefully.
		 */
		isExpandable: function(oNode) {
			if (oNode) {
				if(oNode.length > 0) {
					return true;
				} else {
					return false;
				}
			}
			return false;
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
		 * Private method. MODIFY CAREFULLY.
		 * Method is fired on click on the panels. 
		 * Check if made to see if list items are present. 
		 * If list items are present, set expand true or false 
		 * else navigate to details page.
		 */
		_fnAttachPressEventToPanels: function() {
			var oPanel = this.byId('inctureMDMasterPanel');
			var that = this;
			oPanel.attachBrowserEvent("click", function() {
				var oPanel = this.getParent();
				var oList = oPanel.getContent()[0];
				var oItems = oList.getItems();
				// Expand or collapse based on list items length
				if (oItems.length > 0) {
					if (oPanel.getExpanded()) {
						oPanel.setExpanded(false);
					} else {
						oPanel.setExpanded(true);
					}
						
				} else {
					
					/**
					 * Navigation Part. CHANGE ROuting here.
					 */
					
					var oBindingContext = oPanel.getBindingContext("SidePanelModel");
					var sText = oBindingContext.getProperty("name");
					that._router.navTo("details", {
						data: sText
					});
				}
				
				//Resetting of Classes.
				var oVBox = that.byId('inctureMDMasterVBox');
				var oVBoxItems = oVBox.getItems();
				for(var i=0; i < oVBoxItems.length; i++) {
					oVBoxItems[i].removeStyleClass("inctureMDMasterPanelSolidClass");
					var oList = oVBoxItems[i].getContent()[0];
					oList.removeSelections(true);
				}
				oPanel.addStyleClass('inctureMDMasterPanelSolidClass');
			});
		},
		
		/**
		 * Used to remove the previous selection of list items present in Panels.
		 * DO NOT MODIFY.
		 */
		
		_fnRemoveParentPanelSelect: function(oEvent) {
			
				var oVBox = this.byId('inctureMDMasterVBox');
				var oVBoxItems = oVBox.getItems();
				for(var i=0; i < oVBoxItems.length; i++) {
					oVBoxItems[i].removeStyleClass("inctureMDMasterPanelSolidClass");
					var oList = oVBoxItems[i].getContent()[0];
					if (oList.getSelectedItem() && (oList.getSelectedItem().getId() !== oEvent.getParameter('listItem').getId())) {
						oList.removeSelections(true);
					} 
					
				}
		},
		
		
		/**
		 * Navigate to Details on click of list items
		 */
		onItemPress: function(oEvent) {
			//DO not remove the below function call.
			this._fnRemoveParentPanelSelect(oEvent);
			
			// ROuting changes can be done here.
			var oBindingContext = oEvent.getParameter('listItem').getBindingContext("SidePanelModel");
			
			var sText = oBindingContext.getProperty("key");
			
			this._router.navTo(sText);
		},
		/*onDataExport : sap.m.Table.prototype.exportData|| function(oEvent) {
		var that = this;
		var oModel = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oModel, "Downloaded_Data_model");
		that.exportCSV();
		
		var TotalAllocationTblItems = this.getView().byId("invStockReportTbl").getItems();

		if (TotalAllocationTblItems.length > 0) {
		
		* var message = "A background job has been triggered to
		* download the required records in csv format. Once
		* completed, the file will be downloaded automatically.";
		* exportCSVMessageBox(message);
		

		var vendorCode = localStorage.getItem("vendorCode");
		var oProxyModel = this.getView().getModel("oProxyModel");
		
		* var mdata=this.getView().getModel("oModel").getData();
		* this.getmodel("oProxyModel").setData(mData);
		
		// var oUrlParams = "$filter=Vendor eq '" + vendorCode + "'
		// and VendMat eq '" + this.venMatId + "' and Plant eq '" +
		// this.plant + "' and Material eq '" + this.matId + "' and
		// Upcs eq '" + this.upc + "'";
		that.exportCSV();
		// oModel.read( function(oData){
		
		*  }, function(oError){ var readError =
		* jQuery.parseXML(oError.response.body); var getMessage =
		* readError.querySelector("message").textContent;
		* toastMessage(getMessage); });
		
		} else {
		var message = "No data available to download";
		toastMessage(message);
		}

		},*/
onDownloadAllocations:function(oEvent){
	common.confirmationDialog("Are you sure you want to download the total allocations?", this.exportCSV.bind(this));

},
		exportCSV : function(action) {
			if(action=="OK"){
			var that=this;
			var oModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oModel, "oModel");
			oModel.loadData("/tscm/Allocation/getAllAllocations",null,true);
			//-----------------------------------------------------------------------------------------------------
			oModel.attachRequestCompleted(function(oEvent){
				if (oEvent.getParameter("success")) {
					debugger;
					var data=oEvent.getSource().getData();
					var oExcelModel = new sap.ui.model.json.JSONModel();
					that.getView().setModel(oExcelModel, "oExcelModel");
					oExcelModel.setData(data);
					var oExport = new sap.ui.core.util.Export({

						// Type that will be used to generate the content. Own ExportType's
						// can be created to support other formats
					exportType : new sap.ui.core.util.ExportTypeCSV({
					separatorChar : ","
					}),

						// Pass in the model created above
						
					models : that.getView().getModel("oExcelModel"),
//						// binding information for the rows aggregation
					rows : {
					path : "/allocationDto"
					},

						// column definitions with column name and binding info for the
						// content

					columns : [ {
					name : "Emp Type",
					template: {
                        content: {
                            parts: ["modeOfEmp"]
                        }
                    }
					
					}, {
						name : "Employee ID",
						template: {
                            content: {
                                parts: ["empId"]
                            }
                        }
						
						}, {
						name : "Employee Name",
						  template: {
	                            content: {
	                                parts: ["empName"]
	                            }
	                        }
						}, {
						name : "Date Of Joining",
						template: {
                            content: {
                                parts: ["dateOfJoining"]
                            }
                        }
						}, {
						name : "PEX",
						template: {
                            content: {
                                parts: ["projectExp"]
                            }
                        }
						}, {
						name : "TEX",
						template: {
                            content: {
                                parts: ["totalExp"]
                            }
                        }
						},
						 {
							name : "People Manager",
							template: {
	                            content: {
	                                parts: ["peopleManagerName"]
	                            }
	                        }
							},
							{
								name : "Designation",
								template: {
		                            content: {
		                                parts: ["designation"]
		                            }
		                        }
								},
								{
									name : "Grade",
									template: {
			                            content: {
			                                parts: ["grade"]
			                            }
			                        }
									},
									{
										name : "Sub-Grade",
										template: {
				                            content: {
				                                parts: ["subGrade"]
				                            }
				                        }
										},
										{
											name : "Business Unit",
											template: {
					                            content: {
					                                parts: ["businessUnit"]
					                            }
					                        }
											},
											{
												name : "Location",
												template: {
						                            content: {
						                                parts: ["location"]
						                            }
						                        }
												},
												{
													name : "Primary Skill set",
													template: {
							                            content: {
							                                parts: ["primarySkills"]
							                            }
							                        }
													},
													{
														name : "Secondary Skill Set",
														template: {
								                            content: {
								                                parts: ["secondarySkills"]
								                            }
								                        }
														},
														{
															name : "Region",
															template: {
									                            content: {
									                                parts: ["region"]
									                            }
									                        }
															},
															{
																name : "Onsite/Offshore",
																template: {
										                            content: {
										                                parts: ["offshore"]
										                            }
										                        }
																},
																{
																	name : "Project Manager",
																	template: {
											                            content: {
											                                parts: ["projectManager"]
											                            }
											                        }
																	},
																	{
																		name : "Account Code",
																		template: {
												                            content: {
												                                parts: ["accountCode"]
												                            }
												                        }
																		},
																		{
																			name : "Account Name",
																			template: {
													                            content: {
													                                parts: ["accountName"]
													                            }
													                        }
																			},
																			{
																				name : "Project Code",
																				template: {
														                            content: {
														                                parts: ["projectCode"]
														                            }
														                        }
																				},
																				{
																					name : "Project Name",
																					template: {
															                            content: {
															                                parts: ["projectName"]
															                            }
															                        }
																					},
																					{
																						name : "Actual Start Date",
																						template: {
																                            content: {
																                                parts: ["actualStartDate"]
																                            }
																                        }
																						},
																						{
																							name : "Roll Off Date",
																							template: {
																	                            content: {
																	                                parts: ["rollOffDate"]
																	                            }
																	                        }
																							},
																							{
																								name : "Bill %",
																								template: {
																		                            content: {
																		                                parts: ["billPercent"]
																		                            }
																		                        }
																								},
																								{
																									name : "Utilization %",
																									template: {
																			                            content: {
																			                                parts: ["utilizationPercent"]
																			                            }
																			                        }
																									},
																									{
																										name : "Allocation Status",
																										template: {
																				                            content: {
																				                                parts: ["allocationStatus"]
																				                            }
																				                        }
																										},
																										{
																											name : "PDs",
																											template: {
																					                            content: {
																					                                parts: ["personDays"]
																					                            }
																					                        }
																											},
																											{
																												name : "Remarks",
																												template: {
																						                            content: {
																						                                parts: ["remarks"]
																						                            }
																						                        }
																												},
																												{
																													name : "Email IDs",
																													template: {
																							                            content: {
																							                                parts: ["emailId"]
																							                            }
																							                        }
																													},
																													{
																														name : "Contact No",
																														template: {
																								                            content: {
																								                                parts: ["contactNo"]
																								                            }
																								                        }
																														},
																													{
																														name : "Employment Status",
																														template: {
																								                            content: {
																								                                parts: ["employmentStatus"]
																								                            }
																								                        }
																														},
																														{
																															name : "Project Role",
																															template: {
																									                            content: {
																									                                parts: ["projectRole"]
																									                            }
																									                        }
																															},
																															{
																																name : "People Manager ID",
																																template: {
																										                            content: {
																										                                parts: ["peopleManagerId"]
																										                            }
																										                        }
																																},
																																{
																																	name : "DM",
																																	template: {
																											                            content: {
																											                                parts: ["dmName"]
																											                            }
																											                        }
																																	}
						
						]
						});
				//
//						// download exported file
					oExport.saveFile("Allocation-Details");
					/*oExport.generate().done(function(sContent) {
					var link = document.createElement('a');
					link.addEventListener('click', function(ev) {
					link.href = "data:text/csv;charset=utf-8," + escape(sContent);
					link.download = "Inventory-Report-Details.csv";
					}, false);
					link.click();
					}).always(function() {
					that.destroy();
					});*/
				
				}
				});
			oModel.attachRequestFailed(function(oError){
				debugger;
				sap.m.MessageBox.show(oError.getParameter("statusCode") + ":" + oError.getParameter("statusText"), {
				icon : sap.m.MessageBox.Icon.ERROR,
				title : oBundle.getText("ERROR_TEXT"),
				actions : [ sap.m.MessageBox.Action.OK ],
				onClose : null,
				details : oError
				});
				});
				//-------------------------------------------------------------------------------------
//			oModel.attachRequestCompleted(function(oEvent){
//				
//				var data=oEvent.getSource().getData();
//			})
			//this.getView().setModel(oModel, "oModel");
		}

		}


		
	/**
	* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	* @memberOf view.Details
	*/
//		onExit: function() {
	//
//		}
		
		

	});
});
