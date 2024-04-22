//@ui5-bundle queryragui/Component-preload.js
jQuery.sap.registerPreloadedModules({
"version":"2.0",
"modules":{
	"queryragui/Component.js":function(){sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","queryragui/model/models"],function(e,i,t){"use strict";return e.extend("queryragui.Component",{metadata:{manifest:"json"},init:function(){e.prototype.init.apply(this,arguments);this.getRouter().initialize();this.setModel(t.createDeviceModel(),"device")}})});
},
	"queryragui/controller/App.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller"],function(n){"use strict";return n.extend("queryragui.controller.App",{onInit:function(){}})});
},
	"queryragui/controller/InitialRightScreen.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel"],function(e,t){"use strict";return e.extend("queryragui.controller.InitialRightScreen",{onInit:function(){const e=new t;e.setData({conversationId:"",messageId:"",message_time:"",user_id:"",user_query:"",chatHistory:[],isBusy:false,enableTextArea:true});this.getView().setModel(e,"chatModel");this.getUserInfo();this.oOwnerComponent=this.getOwnerComponent();this.oRouter=this.oOwnerComponent.getRouter();this.oRouter.getRoute("home").attachPatternMatched(this.onRouteMatched,this)},getUserInfo:function(){const e=this.getBaseURL()+"/user-api/currentUser";var s=new t;var o={firstname:"Dummy",lastname:"User",email:"dummy.user@com",name:"dummy.user@com",displayName:"Dummy User (dummy.user@com)"};s.loadData(e);s.dataLoaded().then(()=>{console.log(s.getData());if(!s.getData().email){s.setData(o)}this.getView().setModel(s,"userInfo")}).catch(()=>{s.setData(o);this.getView().setModel(s,"userInfo")})},getBaseURL:function(){var e=this.getOwnerComponent().getManifestEntry("/sap.app/id");var t=e.replaceAll(".","/");var s=jQuery.sap.getModulePath(t);return s},onRouteMatched(e){this.clearChatHistory()},clearChatHistory:function(){const e=this.getView().getModel("chatModel");const t="/chatHistory";const s=[];e.setProperty(t,s)},onSendMessage:function(e){this.setBusy(true);this.setEnableTextArea(false);const t=e.getParameter("value");const s=e.getSource();const o=this.getOwnerComponent().getRouter();this.setUserQuestionInToChatMessage(t);const n=this.getView().getModel("chatModel");const r=n.getProperty("/conversationId");const a=JSON.stringify({conversationId:r,messageId:n.getProperty("/messageId"),message_time:n.getProperty("/message_time"),user_id:n.getProperty("/user_id"),user_query:n.getProperty("/user_query")});this.sendMessage(a).then(e=>{this.setBackendResponseInToChatMessage(e);setTimeout(()=>{o.navTo("conversation",{conversationID:r})},1e3)}).catch(e=>{console.log(e)}).finally(()=>{this.setBusy(false);this.setEnableTextArea(true)})},sendMessage:function(e){return new Promise((t,s)=>{$.ajax({url:this.getBaseURL()+"/odata/v4/chat/getChatRagResponse",type:"POST",contentType:"application/json",async:true,data:e,success:function(e,o,n){console.log(n);if(n.status===200||n.status===201){t(n.responseJSON)}else{s(n.responseJSON)}},error:function(e,t){if(e){if(e.responseJSON){const t=e.responseJSON.message||e.responseJSON.status_msg;s(t)}else{s(e.responseText)}}else{s(t)}}})})},setBackendResponseInToChatMessage(e){const t=this.getView().getModel("chatModel");const s=t.getProperty("/conversationId");const o={conversationId:s,messageId:self.crypto.randomUUID(),message_time:new Date(e.messageTime),content:e.content,user_id:"",user_role:e.role,icon_path:"sap-icon://da-2",initials:""};const n="/chatHistory";const r=t.getProperty(n);r.push(o);t.setProperty(n,r)},setBusy:function(e){const t="/isBusy";this.getView().getModel("chatModel").setProperty(t,e)},setEnableTextArea:function(e){const t="/enableTextArea";this.getView().getModel("chatModel").setProperty(t,e)},setUserQuestionInToChatMessage(e){const t=this.getView().getModel("chatModel");const s=this.getView().getModel("userInfo");t.setProperty("/conversationId",self.crypto.randomUUID());t.setProperty("/messageId",self.crypto.randomUUID());t.setProperty("/message_time",(new Date).toISOString());t.setProperty("/user_query",e);t.setProperty("/user_id",s.getProperty("/email"));const o={conversationId:t.getProperty("/conversationId"),messageId:t.getProperty("/messageId"),message_time:new Date(t.getProperty("/message_time")),content:e,user_id:t.getProperty("/user_id"),user_role:"You",icon_path:"",initials:s.getProperty("/firstname").charAt(0)+s.getProperty("/lastname").charAt(0)};const n="/chatHistory";const r=t.getProperty(n);r.push(o);t.setProperty(n,r)},onListUpdateFinished:function(e){const t=e.getSource().getItems();if(t.length===0){return}t[t.length-1].focus()}})});
},
	"queryragui/controller/LeftScreen.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/upload/UploadSetwithTable","sap/m/upload/UploadSetwithTableItem","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/MessageToast","sap/ui/model/json/JSONModel","sap/m/MessageBox"],function(e,t,n,o,s,i,a,l){"use strict";return e.extend("queryragui.controller.LeftScreen",{onInit:function(){this.getUserInfo();this.oOwnerComponent=this.getOwnerComponent();this.oRouter=this.oOwnerComponent.getRouter();this.oRouter.getRoute("home").attachPatternMatched(this.onRouteMatched,this);this.oRouter.getRoute("conversation").attachPatternMatched(this.onRouteMatched,this)},onRouteMatched(e){this.getView().byId("leftScreenChatList").getBinding("items").refresh()},onConversationPress:function(e){const t=e.getParameter("listItem");const n=t.getBindingContext().getProperty("cID");const o=this.getOwnerComponent().getRouter();o.navTo("conversation",{conversationID:n})},onHandleConversationDelete:function(e){const t=e.getParameter("listItem");const n=t.getBindingContext().getProperty("cID");const o=t.getBindingContext().getProperty("title").toString();const s=this.getOwnerComponent().getRouter();const a=s.getHashChanger().getHash();const r=s.getRouteInfoByHash(a);l.warning(`This will delete ${o}`,{icon:l.Icon.WARNING,actions:["Remove",l.Action.CANCEL],emphasizedAction:"Remove",styleClass:"sapMUSTRemovePopoverContainer",initialFocus:l.Action.CANCEL,onClose:e=>{if(e!=="Remove"){return}this.requestConversationDelete(n).then(e=>{i.show(`Conversation successfully deleted.`);if(r.name!=="home"){this.oRouter.navTo("home")}else{this.getView().byId("leftScreenChatList").getBinding("items").refresh()}}).catch(e=>{console.log(e);i.show(`Conversation deletion failed.`)})}})},requestConversationDelete:function(e){const t={url:this.getBaseURL()+`/odata/v4/chat/Conversation(${e})`,method:"DELETE",headers:{"Content-type":"application/json"}};return new Promise((e,n)=>{$.ajax(t).done((t,n,o)=>{e(t)}).fail(e=>{n(e)})})},onCreateNewChat:function(e){const t=this.getOwnerComponent().getRouter();t.navTo("home")},onUploadFileBtnSelect:function(e){this.fileUploadFragment??=this.loadFragment({name:"queryragui.view.FileUploading"});this.fileUploadFragment.then(e=>e.open())},onCloseUploadFileFragment:function(){this.byId("fileUploadFragment").close()},onManageFileBtnSelect:function(){this.fileManagementFragment??=this.loadFragment({name:"queryragui.view.FileManagement"});this.fileManagementFragment.then(e=>e.open())},onCloseManageFileFragment:function(){this.byId("fileManagementFragment").close()},onAfterItemAdded:function(e){console.log(e);const t=e.getParameter("item");this.createEntity(t).then(e=>{this.uploadContent(t,e)}).catch(e=>{console.log(e)})},onUploadCompleted:function(e){var t=this.byId("uploadSet");t.removeAllIncompleteItems();t.getBinding("items").refresh()},createEntity:function(e){const t={ID:self.crypto.randomUUID(),mediaType:e.getMediaType(),fileName:e.getFileName(),size:e.getFileObject().size.toString()};const n={url:this.getBaseURL()+"/odata/v4/embedding-storage/Files",method:"POST",headers:{"Content-type":"application/json"},data:JSON.stringify(t)};return new Promise((e,t)=>{$.ajax(n).done((t,n,o)=>{e(t.ID)}).fail(e=>{t(e)})})},uploadContent:function(e,t){var n=this.getBaseURL()+`/odata/v4/embedding-storage/Files(${t})/content`;e.setUploadUrl(n);var o=this.byId("uploadSet");o.setHttpRequestMethod("PUT");o.uploadItem(e)},onSelectionChange:function(e){const t=e.getSource();const n=t.getSelectedItems();const o=this.byId("downloadSelectedButton");const s=this.byId("deleteSelectedButton");if(n.length>0){o.setEnabled(true);s.setEnabled(true)}else{o.setEnabled(false);s.setEnabled(false)}},getIconSrc:function(e,n){return t.getIconForFileType(e,n)},getFileSizeWithUnits:function(e){return t.getFileSizeWithUnits(e)},onFileNameSearch:function(e){const t=[];const n=e.getSource().getValue();if(n&&n.length>0){const e=new o("fileName",s.Contains,n);t.push(e)}const i=this.byId("uploadSetWithTable");const a=i.getBinding("items");a.filter(t,"Application")},onDownloadFiles:function(e){const t=this.byId("uploadSetWithTable");const n=t.getSelectedItem();const o=n.mAggregations;const s=o.cells[1].getProperty("text");const i=n.getProperty("fileName");this.requestFileDownload(s).then(e=>{var t=window.URL.createObjectURL(e);var n=document.createElement("a");n.href=t;n.setAttribute("download",i);document.body.appendChild(n);n.click();document.body.removeChild(n)}).catch(e=>{console.log(e)})},requestFileDownload:function(e){const t={url:this.getBaseURL()+`/odata/v4/embedding-storage/Files(${e})/content`,method:"GET",xhrFields:{responseType:"blob"}};return new Promise((e,n)=>{$.ajax(t).done((t,n,o)=>{e(t)}).fail(e=>{n(e)})})},onGenerateVectorBtnClick:function(e){let t=e.getSource();let o=null;while(t&&!(t instanceof n)){t=t.getParent()}if(t instanceof n){o=t}const s=o.mAggregations;const a=s.cells[1].getProperty("text");this.byId("fileManagementFragment").setBusy(true);this.requestEmbeddingGeneration(a).then(e=>{this.byId("fileManagementFragment").setBusy(false);i.show("Embeddings generation completed successfully.")}).catch(e=>{this.byId("fileManagementFragment").setBusy(false);i.show("Embeddings generation failed, please try again.")})},requestEmbeddingGeneration:function(e){const t=JSON.stringify({uuid:e.toString()});return new Promise((e,n)=>{$.ajax({url:this.getBaseURL()+"/odata/v4/embedding-storage/storeEmbeddings",type:"POST",contentType:"application/json",async:true,data:t,success:function(t,o,s){console.log("Success: "+s);if(s.status===200||s.status===201){e(s.responseJSON)}else{n(s.responseJSON)}},error:function(e,t){console.log("Fail: "+e);if(e){if(e.responseJSON){const t=e.responseJSON.message||e.responseJSON.status_msg;n(t)}else{n(e.responseText)}}else{n(t)}}})})},onBeforeOpenContextMenu:function(e){this.byId("uploadSetWithTable").getBinding("items").refresh()},beforeFileManagementDialogOpen:function(e){this.byId("uploadSetWithTable").getBinding("items").refresh()},onDeleteFiles:function(e){this.byId("fileManagementFragment").setBusy(true);const t=this.byId("uploadSetWithTable");const n=t.getSelectedItem();const o=n.mAggregations;const s=o.cells[1].getProperty("text");const a=n.getProperty("fileName");this.requestFileDelete(s).then(e=>{this.byId("fileManagementFragment").setBusy(false);this.byId("uploadSetWithTable").getBinding("items").refresh();this.byId("uploadSet").getBinding("items").refresh();const t=this.byId("downloadSelectedButton");const n=this.byId("deleteSelectedButton");t.setEnabled(false);n.setEnabled(false);i.show(`File ${a} with ID ${s} successfully deleted`)}).catch(e=>{console.log(e.message);this.byId("fileManagementFragment").setBusy(false);i.show(`File ${a} with ID ${s} deletion failed`)})},requestFileDelete:function(e){const t={url:this.getBaseURL()+`/odata/v4/embedding-storage/Files(${e})`,method:"DELETE"};return new Promise((e,n)=>{$.ajax(t).done((t,n,o)=>{e(t)}).fail(e=>{n(e)})})},onDeleteEmbedding:function(e){this.byId("fileManagementFragment").setBusy(true);this.requestEmbeddingDelete().then(e=>{this.byId("fileManagementFragment").setBusy(false);i.show(`All embeddings successfully deleted.`)}).catch(e=>{console.log(e.message);this.byId("fileManagementFragment").setBusy(false);i.show(`Embeddings deletion failed.`)})},requestEmbeddingDelete:function(){const e={url:this.getBaseURL()+"/odata/v4/embedding-storage/deleteEmbeddings()",method:"GET"};return new Promise((t,n)=>{$.ajax(e).done((e,n,o)=>{t(e)}).fail(e=>{n(e)})})},getUserInfo:function(){const e=this.getBaseURL()+"/user-api/currentUser";var t=new a;var n={firstname:"Dummy",lastname:"User",email:"dummy.user@com",name:"dummy.user@com",displayName:"Dummy User (dummy.user@com)"};t.loadData(e);t.dataLoaded().then(()=>{console.log(t.getData());if(!t.getData().email){t.setData(n)}this.getView().setModel(t,"userInfo")}).catch(()=>{t.setData(n);this.getView().setModel(t,"userInfo")})},getBaseURL:function(){var e=this.getOwnerComponent().getManifestEntry("/sap.app/id");var t=e.replaceAll(".","/");var n=jQuery.sap.getModulePath(t);return n}})});
},
	"queryragui/controller/OfficalRightScreen.controller.js":function(){sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel"],function(e,t){"use strict";return e.extend("queryragui.controller.OfficalRightScreen",{onInit:function(){const e=new t;e.setData({conversationId:"",messageId:"",message_time:"",user_id:"",user_query:"",chatHistory:[],isBusy:false,enableTextArea:true});this.getView().setModel(e,"chatModel");this.getUserInfo();this.oOwnerComponent=this.getOwnerComponent();this.oRouter=this.oOwnerComponent.getRouter();this.oRouter.getRoute("conversation").attachPatternMatched(this.onRouteMatched,this)},getUserInfo:function(){const e=this.getBaseURL()+"/user-api/currentUser";var s=new t;var o={firstname:"Dummy",lastname:"User",email:"dummy.user@com",name:"dummy.user@com",displayName:"Dummy User (dummy.user@com)"};s.loadData(e);s.dataLoaded().then(()=>{console.log(s.getData());if(!s.getData().email){s.setData(o)}this.getView().setModel(s,"userInfo")}).catch(()=>{s.setData(o);this.getView().setModel(s,"userInfo")})},getBaseURL:function(){var e=this.getOwnerComponent().getManifestEntry("/sap.app/id");var t=e.replaceAll(".","/");var s=jQuery.sap.getModulePath(t);return s},onRouteMatched(e){this.clearChatHistory();const{conversationID:t}=e.getParameter("arguments");this.getView().bindElement({path:`/Conversation(${t})`});this.loadConversationHistory(t)},clearChatHistory:function(){const e=this.getView().getModel("chatModel");const t="/chatHistory";const s=[];e.setProperty(t,s)},loadConversationHistory(e){const s=this.getBaseURL()+`/odata/v4/chat/Conversation(${e})/to_messages`;var o=new t;o.loadData(s);o.dataLoaded().then(()=>{this.setConversationHistory(o.getData())})},setConversationHistory(e){const t=this.getView().getModel("userInfo");const s=this.getView().getModel("chatModel");const o="/chatHistory";const n=s.getProperty(o);for(const s of e.value){const e={conversationId:s.cID_cID,messageId:s.mID,message_time:new Date(s.creation_time),content:s.content,user_id:"",user_role:s.role==="assistant"?"assistant ":"You",icon_path:s.role==="assistant"?"sap-icon://da-2":"",initials:s.role==="assistant"?"":t.getProperty("/firstname").charAt(0)+t.getProperty("/lastname").charAt(0)};n.push(e)}s.setProperty(o,n)},onSendMessage:function(e){this.setBusy(true);this.setEnableTextArea(false);const t=e.getParameter("value");const s=e.getSource();this.setUserQuestionInToChatMessage(t);const o=this.getView().getModel("chatModel");const n=o.getProperty("/conversationId");const a=JSON.stringify({conversationId:n,messageId:o.getProperty("/messageId"),message_time:o.getProperty("/message_time"),user_id:o.getProperty("/user_id"),user_query:o.getProperty("/user_query")});this.sendMessage(a).then(e=>{this.setBackendResponseInToChatMessage(e)}).catch(e=>{console.log(e)}).finally(()=>{this.setBusy(false);this.setEnableTextArea(true)})},setBusy:function(e){const t="/isBusy";this.getView().getModel("chatModel").setProperty(t,e)},setEnableTextArea:function(e){const t="/enableTextArea";this.getView().getModel("chatModel").setProperty(t,e)},setUserQuestionInToChatMessage(e){const t=this.getView().getModel("chatModel");const s="/chatHistory";const o=t.getProperty(s);const n=o[0].conversationId;const a=this.getView().getModel("userInfo");t.setProperty("/conversationId",n);t.setProperty("/messageId",self.crypto.randomUUID());t.setProperty("/message_time",(new Date).toISOString());t.setProperty("/user_query",e);t.setProperty("/user_id",a.getProperty("/email"));const r={conversationId:t.getProperty("/conversationId"),messageId:t.getProperty("/messageId"),message_time:new Date(t.getProperty("/message_time")),content:e,user_id:t.getProperty("/user_id"),user_role:"You",icon_path:"",initials:a.getProperty("/firstname").charAt(0)+a.getProperty("/lastname").charAt(0)};o.push(r);t.setProperty(s,o)},sendMessage:function(e){return new Promise((t,s)=>{$.ajax({url:this.getBaseURL()+"/odata/v4/chat/getChatRagResponse",type:"POST",contentType:"application/json",async:true,data:e,success:function(e,o,n){console.log(n);if(n.status===200||n.status===201){t(n.responseJSON)}else{s(n.responseJSON)}},error:function(e,t){if(e){if(e.responseJSON){const t=e.responseJSON.message||e.responseJSON.status_msg;s(t)}else{s(e.responseText)}}else{s(t)}}})})},setBackendResponseInToChatMessage(e){const t=this.getView().getModel("chatModel");const s=t.getProperty("/conversationId");const o={conversationId:s,messageId:self.crypto.randomUUID(),message_time:new Date(e.messageTime),content:e.content,user_id:"",user_role:e.role,icon_path:"sap-icon://da-2",initials:""};const n="/chatHistory";const a=t.getProperty(n);a.push(o);t.setProperty(n,a)}})});
},
	"queryragui/i18n/i18n.properties":'# This is the resource bundle for queryragui\r\n\r\n#Texts for manifest.json\r\n\r\n#XTIT: Application name\r\nappTitle=Chat Demo of CAP LLM Plugin\r\n\r\n#YDES: Application description\r\nappDescription=An SAP Fiori application.\r\n#XTIT: Main view title\r\ntitle=Chat Demo of CAP LLM Plugin\r\n\r\nflpTitle=Query RAG Demo\r\n\r\nflpSubtitle=Powered by Gen AI Hub and HANA Cloud Vector Engine',
	"queryragui/manifest.json":'{"_version":"1.59.0","sap.app":{"id":"queryragui","type":"application","i18n":"i18n/i18n.properties","applicationVersion":{"version":"0.0.1"},"title":"{{appTitle}}","description":"{{appDescription}}","resources":"resources.json","sourceTemplate":{"id":"@sap/generator-fiori:basic","version":"1.12.4","toolsId":"2f10dee8-63c3-46f0-a270-d704153ff59a"},"dataSources":{"mainService":{"uri":"odata/v4/chat/","type":"OData","settings":{"annotations":[],"odataVersion":"4.0"}},"fileService":{"uri":"odata/v4/embedding-storage/","type":"OData","settings":{"annotations":[],"odataVersion":"4.0"}}},"crossNavigation":{"inbounds":{"Chat-Display":{"semanticObject":"Chat","action":"Display","title":"{{flpTitle}}","subTitle":"{{flpSubtitle}}","signature":{"parameters":{},"additionalParameters":"allowed"}}}}},"sap.ui":{"technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":true,"dependencies":{"minUI5Version":"1.120.9","libs":{"sap.m":{},"sap.ui.core":{},"sap.f":{},"sap.suite.ui.generic.template":{},"sap.ui.comp":{},"sap.ui.generic.app":{},"sap.ui.table":{},"sap.ushell":{},"sap.ui.unified":{}}},"contentDensities":{"compact":true,"cozy":true},"models":{"i18n":{"type":"sap.ui.model.resource.ResourceModel","settings":{"bundleName":"queryragui.i18n.i18n"}},"":{"dataSource":"mainService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}},"files":{"dataSource":"fileService","preload":true,"settings":{"synchronizationMode":"None","operationMode":"Server","autoExpandSelect":true,"earlyRequests":true}}},"resources":{"css":[{"uri":"css/style.css"}]},"rootView":{"viewName":"queryragui.view.App","type":"XML","async":true,"id":"App"},"routing":{"config":{"routerClass":"sap.f.routing.Router","viewType":"XML","async":true,"viewPath":"queryragui.view","controlId":"flexibleColumnLayout","transition":"slide"},"routes":[{"pattern":"","name":"home","target":["leftScreen","initialRightScreen"],"layout":"TwoColumnsMidExpanded"},{"pattern":"conversation/{conversationID}","name":"conversation","target":["leftScreen","officalRightScreen"],"layout":"TwoColumnsMidExpanded"}],"targets":{"leftScreen":{"viewId":"lefeScreenPage","viewName":"LeftScreen","controlAggregation":"beginColumnPages"},"initialRightScreen":{"viewId":"initialRightScreen","viewName":"InitialRightScreen","controlAggregation":"midColumnPages"},"officalRightScreen":{"viewId":"officalRightScreen","viewName":"OfficalRightScreen","controlAggregation":"midColumnPages"}}}},"sap.cloud":{"public":true,"service":"query.rag.app2"}}',
	"queryragui/model/models.js":function(){sap.ui.define(["sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,n){"use strict";return{createDeviceModel:function(){var i=new e(n);i.setDefaultBindingMode("OneWay");return i}}});
},
	"queryragui/view/App.view.xml":'<mvc:View \r\n    controllerName="queryragui.controller.App"\r\n    xmlns:f="sap.f" \r\n    xmlns:html="http://www.w3.org/1999/xhtml"\r\n    xmlns:mvc="sap.ui.core.mvc"\r\n    xmlns="sap.m"\r\n    displayBlock="true"><App id="app"><f:FlexibleColumnLayout id="flexibleColumnLayout" backgroundDesign="Solid"></f:FlexibleColumnLayout></App></mvc:View>\r\n',
	"queryragui/view/FileManagement.fragment.xml":'<core:FragmentDefinition \r\n    xmlns:mvc="sap.ui.core.mvc"\r\n    xmlns:m="sap.m"\r\n    xmlns:core="sap.ui.core"\r\n    xmlns="sap.m.upload"><m:Dialog \r\n        id="fileManagementFragment"\r\n        title="Manage Files"\r\n        resizable="true"\r\n        draggable="true"\r\n        beforeOpen=".beforeFileManagementDialogOpen"><UploadSetwithTable\r\n            id="uploadSetWithTable"\r\n            class="sapUiSmallMargin"\r\n            sticky="ColumnHeaders,HeaderToolbar"\r\n            mode="SingleSelectLeft"\r\n            growing="true"\r\n            growingThreshold="5"\r\n            growingScrollToLoad="true"\r\n            width="auto"\r\n            fixedLayout="false"\r\n            uploadEnabled="false"\r\n            uploadButtonInvisible="true"\r\n            items="{ \r\n                path:\'files>/Files\',\r\n                parameters: {\r\n                    $orderby: \'createdAt desc\'\r\n\t\t\t    },\r\n\t\t\t    templateShareable: false\r\n            }"\r\n            selectionChange=".onSelectionChange"\r\n            beforeOpenContextMenu=".onBeforeOpenContextMenu"><headerToolbar><m:OverflowToolbar \r\n                    id="overflowToolBar"><m:Title\r\n                        id="overflowToolBarTitle"\r\n                        text="Files"\r\n                        level="H2"/><m:SearchField\r\n                        id="overflowToolBarSearchField"\r\n                        width="20%"\r\n                        liveChange=".onFileNameSearch"><m:layoutData><m:OverflowToolbarLayoutData\r\n                                id="overflowToolBarLayOut"\r\n                                priority="NeverOverflow"\r\n                            /></m:layoutData></m:SearchField><m:ToolbarSpacer id="overflowToolBarSpacer"/><m:Button\r\n                        id="downloadSelectedButton"\r\n                        text="Download"\r\n                        enabled="false"\r\n                        press=".onDownloadFiles"/><m:Button\r\n                        id="deleteSelectedButton"\r\n                        text="Delete"\r\n                        enabled="false"\r\n                        press=".onDeleteFiles"/><m:Button\r\n                        id="deleteEmbeddingSelectedButton"\r\n                        text="Delete Embeddings"\r\n                        enabled="true"\r\n                        press=".onDeleteEmbedding"/></m:OverflowToolbar></headerToolbar><columns><Column id="fileName" importance="High"><header><m:Label id="labelForFileName" text="File Name" /></header></Column><Column id="id"><header><m:Label id="labelForID" text="ID" /></header></Column><Column id="status"><header><m:Label id="labelForStatus" text="Status" /></header></Column><Column id="fileSize"><header><m:Label id="labelForFileSize" text="File Size" /></header></Column><Column id="actionButton" importance="High" ><header><m:Label id="labelForActionButton" text="Generate Embeddings" /></header></Column></columns><items><UploadSetwithTableItem\r\n                    id="uploadSetwithTableItems"\r\n                    fileName="{files>fileName}"\r\n                    mediaType="{files>mediaType}"\r\n                    fileSize="{files>size}"><cells><m:HBox id="hboxForFileName"><core:Icon\r\n                                id="FileNameIcon"\r\n                                src="{parts: [\'files>mediaType\', \'files>fileName\'], formatter: \'.getIconSrc\' }"\r\n                                color="white"\r\n                                visible="true"\r\n                                class="sapMUSTItemImage sapMUSTItemIcon"\r\n                            /><m:VBox id="vboxForFileName" class="sapUiTinyMargin sapUiSmallMarginBegin"><m:Text id="fileNameText"  text="{files>fileName}" class="sapUiTinyMarginTop" /></m:VBox></m:HBox><m:Text id="fileIDText" text="{files>ID}" /><m:Text id="fileStatusText"  text="Completed" /><m:Text id="fileSizeText"\r\n                            text="{path: \'files>size\', formatter: \'.getFileSizeWithUnits\'}"\r\n                        /><m:Button\r\n                            id="trainingButton"\r\n                            class="sapUiTinyMarginBegin"\r\n                            type="Transparent"\r\n                            icon="sap-icon://begin"\r\n                            press=".onGenerateVectorBtnClick"\r\n                        /></cells></UploadSetwithTableItem></items></UploadSetwithTable><m:beginButton><m:Button\r\n                id="fileManagementFragCloseBtn"\r\n                text="Close"\r\n                press=".onCloseManageFileFragment"/></m:beginButton></m:Dialog></core:FragmentDefinition>',
	"queryragui/view/FileUploading.fragment.xml":'<core:FragmentDefinition \r\n    xmlns:mvc="sap.ui.core.mvc"\r\n    xmlns:m="sap.m"\r\n    xmlns:core="sap.ui.core"\r\n    xmlns="sap.m.upload"\r\n><m:Dialog\r\n    id="fileUploadFragment"\r\n    title="Upload Files"><UploadSet \r\n        id="uploadSet"\r\n        instantUpload="false"\r\n        uploadEnabled="true"\r\n        showIcons="true"\r\n        terminationEnabled="true"\r\n        maxFileNameLength="30"\r\n        maxFileSize="200"\r\n        fileTypes="pdf"\r\n        mediaTypes="application/pdf"\r\n        afterItemAdded=".onAfterItemAdded"\r\n        uploadCompleted=".onUploadCompleted"\r\n        mode="None"\t\r\n        items="{ \r\n            path:\'files>/Files\',\r\n            parameters: {\r\n                $orderby: \'createdAt desc\'\r\n\t\t\t},\r\n\t\t\ttemplateShareable: false\r\n         }"><items><UploadSetItem \r\n                id="uploadSetItems"\r\n                fileName="{files>fileName}"\r\n                mediaType="{files>mediaType}"\r\n                enabledEdit="false"\r\n                visibleEdit="false"\r\n                enabledRemove="false"\r\n                visibleRemove="false"\r\n                ><m:ObjectAttribute\r\n                    id="uploadSetItemAttribute1" \r\n                    title="Uploaded By"\r\n\t\t\t\t\ttext="{files>createdBy}"\r\n\t\t\t\t\tactive="false"/><m:ObjectAttribute\r\n                    id="uploadSetItemAttribute2" \r\n\t\t\t\t\ttitle="Uploaded on"\r\n\t\t\t\t\ttext="{files>createdAt}"\r\n\t\t\t\t\tactive="false"/><m:ObjectAttribute\r\n                    id="uploadSetItemAttribute3" \r\n\t\t\t\t\ttitle="File Size"\r\n\t\t\t\t\ttext="{files>size}"\r\n\t\t\t\t\tactive="false"/></UploadSetItem></items></UploadSet><m:beginButton><m:Button\r\n            id="closeBtn"\r\n            text="Close"\r\n            press=".onCloseUploadFileFragment"/></m:beginButton></m:Dialog></core:FragmentDefinition>',
	"queryragui/view/InitialRightScreen.view.xml":'<mvc:View \r\n    controllerName="queryragui.controller.InitialRightScreen"\r\n    xmlns="sap.m"\r\n    xmlns:mvc="sap.ui.core.mvc"\r\n    xmlns:f="sap.f"\r\n\tdisplayBlock="true"\r\n\theight="100%"\r\n\tbusyIndicatorDelay="0"><Page \r\n        id="initialRightScreen"\r\n        showFooter="true"\r\n        showHeader="false"\r\n        floatingFooter="true"\r\n        class="sapUiResponsivePadding--content sapUiResponsivePadding--footer sapUiResponsivePadding--floatingFooter"><VBox id="initialRightScreenVBox"><List \r\n                    id="initialRightScreenVBoxList"\r\n                    showSeparators="Inner"\r\n                    noDataText="How can I help you today ?"\r\n                    updateFinished=".onListUpdateFinished"\r\n                    items="{chatModel>/chatHistory/}"\r\n                    busy="{chatModel>/isBusy}"><FeedListItem \r\n                        id="initialRightScreenListItem"\r\n                        info="{chatModel>user_role}"\r\n                        text="{chatModel>content}"\r\n                        timestamp="{chatModel>message_time}"\r\n                        icon="{chatModel>icon_path}"\r\n                        iconInitials="{chatModel>initials}"\r\n                        showIcon="true"></FeedListItem></List></VBox><footer><OverflowToolbar\r\n                id="initialRightScreenOverflowToolbar"\r\n                width="100%"\r\n                height="auto"\r\n                ><FeedInput\r\n                    id="initialFeedInput"\r\n                    showIcon="false"\r\n                    placeholder="Enter your message...."\r\n                    growing="true"\r\n                    post=".onSendMessage"\r\n                    enabled="{chatModel>/enableTextArea}"\r\n                ></FeedInput></OverflowToolbar></footer></Page></mvc:View>',
	"queryragui/view/LeftScreen.view.xml":'<mvc:View xmlns:tnt="sap.tnt"\r\n    controllerName="queryragui.controller.LeftScreen"\r\n    xmlns:mvc="sap.ui.core.mvc"\r\n    xmlns="sap.f"\r\n    xmlns:m="sap.m"\r\n    height="100%"\r\n    displayBlock="true"\r\n><m:Page\r\n        id="lefeScreenPage"\r\n        showHeader="false"\r\n        showFooter="false"><m:content><m:OverflowToolbar \r\n                id="leftScreenOverflowToolBar"\r\n                height="3rem"><m:Title\r\n                    id="leftScreenToolBarTitle"\r\n                    text="Chats"\r\n                /><m:ToolbarSpacer id="leftScreenToolBarSpacer" /><m:Button\r\n                    id="leftScreenToolBarButton"\r\n                    icon="sap-icon://add"\r\n                    text="New chat"\r\n                    press=".onCreateNewChat"\r\n                /></m:OverflowToolbar><m:ScrollContainer\r\n                id="leftScreenScrollContainer"\r\n                vertical="true"\r\n                height="80%"\r\n                focusable="true"><m:List\r\n                    id="leftScreenChatList"\r\n                    growing="true"\r\n                    growingThreshold="15"\r\n                    growingScrollToLoad="true"\r\n                    noDataText="No chat history available"\r\n                    enableBusyIndicator="true"\r\n                    items="{\r\n                            path:\'/Conversation\',\r\n                            sorter:{\r\n                                path:\'last_update_time\',\r\n                                descending: true\r\n                            }\r\n                        }"\r\n                    itemPress=".onConversationPress"\r\n                    mode="Delete"\r\n                    delete=".onHandleConversationDelete"\r\n                    ><m:StandardListItem\r\n                        id="_IDGenStandardListItem1"\r\n                        type="Navigation"\r\n                        title="{= ${title}.length > 0 ? ${title} : \'Local Testing\'}"\r\n                        description="{userID} | {creation_time}"\r\n                    /></m:List></m:ScrollContainer><tnt:NavigationList \r\n                id="leftScreenNavigationList"><tnt:NavigationListItem\r\n                    id="leftScreenFileUploadBtn" \r\n                    icon="sap-icon://upload"\r\n                    text="Upload Files"\r\n                    select=".onUploadFileBtnSelect"/><tnt:NavigationListItem\r\n                    id="leftScreenManageFilesBtn" \r\n                    icon="sap-icon://collections-management"\r\n                    text="Manage Files" \r\n                    select=".onManageFileBtnSelect"/></tnt:NavigationList></m:content></m:Page></mvc:View>\r\n',
	"queryragui/view/OfficalRightScreen.view.xml":'<mvc:View\r\n    controllerName="queryragui.controller.OfficalRightScreen"\r\n    xmlns="sap.m"\r\n    xmlns:mvc="sap.ui.core.mvc"\r\n    xmlns:f="sap.f"\r\n\tdisplayBlock="true"\r\n\theight="100%"\r\n\tbusyIndicatorDelay="0"><Page \r\n            id="initialRightScreen"\r\n            showFooter="true"\r\n            showHeader="false"\r\n            floatingFooter="true"\r\n            class="sapUiResponsivePadding--content sapUiResponsivePadding--footer sapUiResponsivePadding--floatingFooter"><VBox \r\n                id="officialRightScreenVBox"><List \r\n                    id="officialRightScreenVBoxList"\r\n                    showNoData="false"\r\n                    showSeparators="Inner"\r\n                    items="{\r\n                        path:\'chatModel>/chatHistory/\',\r\n                        sorter:{\r\n                            path:\'message_time\',\r\n                            descending: false\r\n                        }\r\n                    }"\r\n                    busy="{chatModel>/isBusy}"><FeedListItem \r\n                        id="_IDGenFeedListItem1"\r\n                        class="feedListItem"\r\n                        convertLinksToAnchorTags="All"\r\n                        info="{chatModel>user_role}"\r\n                        text="{chatModel>content}"\r\n                        timestamp="{chatModel>message_time}"\r\n                        icon="{chatModel>icon_path}"\r\n                        iconInitials="{chatModel>initials}"\r\n                        showIcon="true"></FeedListItem></List></VBox><footer><OverflowToolbar\r\n                id="officialRightScreenOverflowToolbar"\r\n                width="100%"\r\n                height="auto"\r\n                ><FeedInput\r\n                    id="officialFeedInput"\r\n                    showIcon="false"\r\n                    placeholder="Enter your message...."\r\n                    growing="true"\r\n                    post=".onSendMessage"\r\n                    enabled="{chatModel>/enableTextArea}"\r\n                ></FeedInput></OverflowToolbar></footer></Page></mvc:View>'
}});
