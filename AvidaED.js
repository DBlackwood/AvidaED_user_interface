define.amd.jQuery = true;
require([
  "dijit/dijit",
  "dojo/parser",
  "dojo/_base/declare",
  "dojo/query",
  "dojo/NodeList-traverse",
  "maqetta/space",
  "maqetta/AppStates",
  "dijit/Dialog",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dijit/MenuBar",
  "dijit/PopupMenuBarItem",
  "dijit/MenuItem",
  "dijit/Menu",
  "dijit/form/Button",
  "dijit/TitlePane",
  "dojo/dnd/Source",
  "dojo/dnd/Manager",
  "dojo/dnd/Selector",
  "dojo/dnd/Target",
  "dojo/dom-geometry",
  "dojo/dom-style",
  "dojo/dom",
  "dojo/aspect",
  "dojo/on", 
  "dijit/registry",
  "dijit/form/Select",
  "dijit/form/HorizontalSlider",
  "dijit/form/HorizontalRule",
  "dijit/form/HorizontalRuleLabels",
  "dijit/form/RadioButton",
  "dijit/form/ToggleButton",
  "dijit/form/NumberSpinner",
  "dijit/form/ComboButton",
  "dijit/form/DropDownButton",
  "dijit/form/ComboBox",
  "dijit/form/Textarea",
  "dojox/charting/Chart", 
  "dojox/charting/axis2d/Default", 
  "dojox/charting/plot2d/Lines",
  "dojox/charting/plot2d/Grid", 
  "dojox/charting/action2d/MouseZoomAndPan",
//  "dojox/charting/Theme",
  "dojox/charting/themes/Wetland",
  "dojo/ready",
  "jquery",
  "jquery-ui",
  "dojo/domReady!"
  ], function(dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
              BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu, 
              Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom,
              aspect, on, registry, Select,
              HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
              DropDownButton, ComboBox, Textarea, Chart, Default, Lines, Grid, MouseZoomAndPan, Wetland, ready, $, jqueryui){

    parser.parse();
    var uiWorker = new Worker('ui-test.js');

    //process message from web worker
    uiWorker.onmessage = function(ee){
      var msg = ee.data;  //passed as object rather than string so JSON.parse is not needed.
      switch(msg.Key){
        case 'RunPause':
          if (true != msg["Success"]) {
            console.log("Error: ", msg);  // msg failed
            runStopFn();  //flip state back since the message failed to get to Avida
          }
          break;
        case 'Reset':
          if (true != msg["Success"]) { console.log("Reset failed: ", msg)};
          break;
        case 'OrgTrace': //reset values and call organism tracing routines. 
          traceObj = msg;
          cycle = 0;
          dijit.byId("orgCycle").set("value", 0);
          cycleSlider.set("maximum", traceObj.length-1);
          cycleSlider.set("discreteValues", traceObj.length);
          updateOrgTrace(traceObj, cycle);
          break;
        case 'PopulationStats':
          updatePopStats(msg);
          //doPopMap();  //Call to update grid colors;
          break;
        case 'PopMap':
          //updatePopMap(msg);
          break;
        default:
          console.log('UnknownRequest: ', msg);
          break;
      }
    }
    
    //uiWorker function to get color data for the grid
    function doPopMap() {
      var str = ""; 
      switch(dijit.byId("colorMode").value) {
        case 'Fitness': 
          str = 'last_fitness';
          break;
        case 'Gestation Time':
          str = 'last_gestation_time';
          break
        case 'Metabolic Rate':
          str = 'Metabolic Rate';
          break;
        case 'Ancestor Organism':
          str = 'clade';
          break;
        default:
          str = "error";
          console.log('unknown dimension for color map');
          break
      }
      if ('error' != str) {
        var request = {
          'Key':'PopMap', 
          'Mode': str
        }
       uiWorker.postMessage(request);
      }
    }

    // Resize window helpers -------------------------------------------
    // called from script in html file as well as below
    BrowserResizeEventHandler=function(){
      if ("block"==domStyle.get("analysisBlock","display")){AnaChartFn();};
      if ("block"==domStyle.get("populationBlock","display")){popChartFn();DrawGridSetup();};
      if ("block"==domStyle.get("organismBlock","display")){
        var height = ($("#rightDetail").innerHeight()-375)/2;
        document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById("ExecuteAbout").style.height = height+"px";
        document.getElementById("ExecuteJust").style.width = "100%";  
        document.getElementById("ExecuteAbout").style.width = "100%";
        if (undefined != traceObj) { 
          updateOrgTrace(traceObj, cycle);
        }; 
      } 
    }

    ready(function(){
      aspect.after(registry.byId("gridHolder"), "resize", function(){BrowserResizeEventHandler()});
      aspect.after(registry.byId("popChartHolder"), "resize", function(){BrowserResizeEventHandler()});
      aspect.after(registry.byId("organismCanvasHolder"), "resize", function(){BrowserResizeEventHandler()});
    });

    var oldwidth = 0;
    aspect.after(registry.byId("popRight"), "resize", function(){
      if (registry.byId("popRight").domNode.style.width != oldwidth) {
        oldwidth = registry.byId("popRight").domNode.style.width;
        var str = registry.byId("popRight").domNode.style.width;
        registry.byId("selectOrganPane").domNode.style.width=Math.round((Number(str.substr(0,str.length-2))-50)*0.45)+"px"
        registry.byId("mainBC").layout();  
      }
    });
          
    // Drop down menu buttons ------------------------------------------
    
    HardwareDialog = new Dialog({
      title: "Avida : A Guided Tour of an Ancestor and its Hardware",
      id: "HardwareDialog",
      href: "cpu_tour.html"
      //hide: function() {HardwareDialog.destroy()}
      //style: "width: 600px; height: 400px"
    });
    
    domStyle.set(HardwareDialog.containerNode, {
      position: 'relative'
    });
    
    dijit.byId("Hardware").on("Click", function(){ 
      if (!HardwareDialog) {
        HardwareDialog = new Dialog({
          title: "Avida : A Guided Tour of an Ancestor and its Hardware",
          id: "HardwareDialog",
          href: "cpu_tour.html"
          //hide: function() {HardwareDialog.destroy()}
          //style: "width: 600px; height: 400px"
        });
      }
      console.log(HardwareDialog);
      HardwareDialog.show();
    });

    //initialize globals needed to hold Organism Trace Data
    var traceObj; 
    var cycle=0;

    // main button scripts-------------------------------------------
    
    //The style display: none cannnot be used in the html during the initial load as the dijits won't work right
    //visibility:hidden can be used, but it leaves the white space and just does not display dijits. 
    //So all areas are loaded, then the mainBoxSwap is called to set display to none after the load on all but 
    //the default option.
    //mainBoxSwap("organismBlock");
    mainBoxSwap("populationBlock");
    dijit.byId("setupBlock").set("style", "display: none;");
    
    //this section gets rid of scroll bars, but then page no longer resizes correctly
/*    var popNewHt = $("#blockHolder").height()-10;
    dijit.byId("populationBlock").set("style", "height: "+ popNewHt +"px");
    dijit.byId("popBC").set("style", "height: "+ popNewHt+"px");
    
    var mapNewHt = $("#mapBlockHold").height()-10;
    dijit.byId("mapBlock").set("style", "height: "+ mapNewHt +"px");
    //mapNewHt = mapNewHt - 5;
    dijit.byId("mapBC").set("style", "height: "+ mapNewHt +"px;");
*/
    function mainBoxSwap(showBlock){
      //console.log("in mainBoxSwap");
      dijit.byId("populationBlock").set("style", "display: none;");
      dijit.byId("organismBlock").set("style", "display: none;");
      dijit.byId("analysisBlock").set("style", "display: none;");
      dijit.byId("testBlock").set("style", "display: none;");       //take testBlock out completely later 
      dijit.byId(showBlock).set("style", "display: block; visibility: visible;");
      dijit.byId(showBlock).resize();
      
      //disable menu options. they will be enabled when relevant canvas is drawn
      dijit.byId("mnFzOffspring").attr("disabled", true);
      dijit.byId("mnOffspringTrace").attr("disabled", true);
    };
  
    // Buttons that call MainBoxSwap 
    document.getElementById("populationButton").onclick = function(){
      console.log('in populationButton');
      mainBoxSwap("populationBlock"); 
      DrawGridSetup();
    }
    
    document.getElementById("organismButton").onclick = function(){
      console.log('in organismButton');
      mainBoxSwap("organismBlock");
      console.log('after mainBoxSwap');
      OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
      OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
      var height = ($("#rightDetail").innerHeight()-375)/2;
      document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height+"px";
      document.getElementById("ExecuteJust").style.width = "100%";  
      document.getElementById("ExecuteAbout").style.width = "100%";
      if (undefined != traceObj) {
        console.log('traceObj.len', traceObj.length);
        updateOrgTrace(traceObj, cycle);
      }
      console.log('after orgTrace');
    }
    document.getElementById("analysisButton").onclick = function(){ mainBoxSwap("analysisBlock"); }
    //Take testBlock out completely later
    //document.getElementById("testButton").onclick = function(){ mainBoxSwap("testBlock"); }

    /* ********************************************************************** */
    /* Dojo Drag N Drop Freezer ***********************************************/
    /* ********************************************************************** */
    
    dojo.declare("AcceptOneItemSource", dndSource, {
      checkAcceptance : function(source, nodes) {
        if (this.node.children.length >= 1) {
           return false;
        }
        return this.inherited(arguments);
      }
    });

    var freezeConfigure = new dndSource("freezeConfigureNode", {accept: ["conDish"], copyOnly: true, singular: true, selfAccept: false});
    freezeConfigure.insertNodes(false, [
      { data: "@default",      type: ["conDish"]},
      { data: "s20m.2Nand",    type: ["conDish"]},
      { data: "s30m.2Not",     type: ["conDish"]}
    ]);
    var freezeOrgan = new dndSource("freezeOrganNode", {accept: ["organism"], copyOnly: true, singular: true , selfAccept: false});
    freezeOrgan.insertNodes(false, [
      { data: "@ancestor",   type: ["organism"]},
      { data: "bravo",       type: ["organism"]},
      { data: "charlie",     type: ["organism"]},
      { data: "delta",       type: ["organism"]},
      { data: "echo",        type: ["organism"]},
      { data: "foxtrot",     type: ["organism"]},
      { data: "golf",        type: ["organism"]}
    ]);
    
    var freezePopDish = new dndSource("freezePopDishNode", {accept: ["popDish"], singular: true, copyOnly: true, selfAccept: false});
    freezePopDish.insertNodes(false, [
      { data: "@example",       type: ["popDish"]},
      { data: "m2w30u1000nand", type: ["popDish"]},
      { data: "m2w30u1000not",  type: ["popDish"]}
    ]);
    var organismIcon = new dndTarget("organismIcon", {accept: ["organism"], selfAccept: false});
    var AncestorBox = new dndSource("AncestorBoxNode", {accept: ["organism"], selfAccept: false});
    //Have not made final decision about which div the dnd will connect to
    //var gridBoxNode = "gridBoxNode";  //the div around the grid
    var gridBoxNode = "gridCanvas";   //the actual canvas object
    var gridBox = new dndTarget(gridBoxNode, {accept: ["organism"]}); 
    
    var trash = new dndSource("trashNode", {accept: ['conDish', 'organism', 'popDish'], singular: true});
      
    var ConfigCurrent = new dndSource("ConfigCurrentNode", {accept: ["conDish"], singular:true, copyOnly: true, selfAccept: false}); 
    ConfigCurrent.insertNodes(false, [{ data: "@default",      type: ["conDish"]}]);
    
    //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
    var OrganCurrent = new dndSource("OrganCurrentNode", {accept: ["organism"], singular: true, copyOnly: true, selfAccept: false});
    var OrganCanvas = new dndSource("organismCanvas", {accept: ["organism"], singular: true, selfAccept: false});
     //Targets only accept object, source can do both
    var graphPop1 = new dndTarget("graphPop1Node", {accept: ["popDish"], singular: true}); 
    var graphPop2 = new dndTarget("graphPop2Node", {accept: ["popDish"], singular: true});
    var graphPop3 = new dndTarget("graphPop3Node", {accept: ["popDish"], singular: true});

    // General Drag and Drop (DnD) functions --------------------------------------
    //http://stackoverflow.com/questions/1134572/dojo-is-there-an-event-after-drag-drop-finished
    //Puts the contents of the source in a object (list) called items. 
    function getAllItems(source){
      var items = source.getAllNodes().map(function(node){
        return source.getItem(node.id);
      });
      return items;
    }
    
    //-------- Configuration DnD ---------------------------------------
    //Need to have only the most recent dropped configuration in configCurrent. Do this by deleting everything in configCurrent
    //and reinserting the most resent one after a drop event.
    //This triggers for every dnd drop, not just those of freezeConfigureNode
    ConfigCurrent.on("DndDrop", function(source, nodes, copy, target){
      if ("ConfigCurrentNode" == target.node.id){
        //clear all data so when we add one there will never be more than one.
        ConfigCurrent.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
        //get the data for the new configuration 
        freezeConfigure.forInSelectedItems(function(item, id){
          ConfigCurrent.insertNodes(false, [item]);  //assign the node that is selected from the only valid source.
        });
        ConfigCurrent.sync(); 
        
        //Dojo uses .data to help keep track of .textContent or .innerHTML 
        //At one time I was trying to keep the original name in .data and allow the user 
        //to change the .textContent name only. I have now decided that will cause trouble. 
        //I'm keeping the following commented out code that would update the .textContent specifically.
        //var currentItem = Object.keys(ConfigCurrent.map)[0];
        //var freezeItem = Object.keys(freezeConfigure.selection)[0];
        //console.log("currentI", currentItem, " freezeI", freezeItem);
        //document.getElementById(currentItem).textContent = document.getElementById(freezeItem).textContent;
        
        //Update the configuration based on the Avida data  ***needs work****
      }
    });
    
    //Process when an Configuration is added to the Freezer
    freezeConfigure.on("DndDrop", function(source, nodes, copy, target){  //This triggers for every dnd drop, not just those of freezeConfigureNode
      if ("freezeConfigureNode" == target.node.id){
        var strItem = Object.keys(target.selection)[0];
        var dishCon = prompt("Please name your dish configuration", nodes[0].textContent+"_1");
        if (dishCon) {
          var namelist = dojo.query('> .dojoDndItem', 'freezeConfigureNode');
          var unique = true;
          while (unique) {
            unique = false;
            for (var ii = 0; ii < namelist.length; ii++){
              //console.log ("name ", namelist[ii].innerHTML);
              if (dishCon == namelist[ii].textContent) {
                dishCon = prompt("Please give your configured dish a unique name ", dishCon+"_1")
                unique = true;
              }
            }  
          }
          if (null != dishCon) {
            document.getElementById(strItem).textContent=dishCon;
            target.map[strItem].data = dishCon;
            //Now find which node has the new content so it can get a context menu. 
            
            var domItems = Object.keys(freezeConfigure.map);
            var nodeIndex = -1;
            for (var ii=0; ii< domItems.length; ii++) {
              if (freezeConfigure.map[domItems[ii]].data == dishCon) {
                nodeIndex = ii;
              }
            }
            //create a right mouse-click context menue for the item just created. 
            contextMenu(target, domItems[nodeIndex]); 
          }
        }
        else {  //user cancelled so the item should NOT be added to the freezer. 
          freezeConfigure.deleteSelectedNodes();  //clear items  
          freezeConfigure.sync();   //should be done after insertion or deletion
        }
      }
    });
    
    //Organsim dnd------------------------------------------------------

    //structure to hole list of ancestor organisms
    var parents = {};
    parents.name = [];
    parents.genome = [];
    parents.color = [];
    parents.col = [];
    parents.row = [];
    parents.AvidaNdx = [];
    parents.autoNdx = [];
    parents.handNdx = [];
    parents.howPlaced = [];
    parents.domId = [];
    
    //Clear parents/Ancestors
    function clearParents() {
      parents = {};
      parents.name = [];
      parents.genome = [];
      parents.color = [];
      parents.col = [];
      parents.row = [];
      parents.AvidaNdx = [];
      parents.autoNdx = [];
      parents.handNdx = [];
      parents.howPlaced = [];
      parents.domId = [];
    }
      
    //This triggers for every dnd drop, not just those of AncestorBoxNode
    AncestorBox.on("DndDrop", function(source, nodes, copy, target){
      //Do not copy parents if one is moved within Ancestor Box
      if ("AncestorBoxNode" == target.node.id && "AncestorBoxNode" != source.node.id) {
        nn = parents.name.length;
        parents.autoNdx.push(nn);
        parents.name.push(nodes[0].textContent);
        parents.howPlaced.push('auto');
        parents.domId.push(Object.keys(target.selection)[0]);  
        //Find color of ancestor
        if (0 < ParentColors.length) {parents.color.push(ParentColors.pop())}
        else {parents.color.push(defaultParentColor)};
        PlaceAncestors(parents);
      }
    });

    // Process Drop on gridBox
    //This triggers for every dnd drop, not just those of gridBoxNode
    gridBox.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id==gridBoxNode){
        //was it dropped on the grid of cells?
        //console.log('xOff, yOff, xUP, y', grd.xOffset, grd.yOffset, mouse.UpGridPos[0];, mouse.UpGridPos[1];);
        //calculated grid cell to see if it was a valid grid position.
        var nn = parents.name.length;
        var mouseX = mouse.UpGridPos[0] - grd.marginX - grd.xOffset;
        var mouseY = mouse.UpGridPos[1] - grd.marginY - grd.yOffset;
        //console.log('mouseX, y', mouseX, mouseY);
        parents.col[nn] = Math.floor(mouseX/grd.cellWd);
        parents.row[nn] = Math.floor(mouseY/grd.cellHt);
        //check to see if in the grid part of the canvas
        if (parents.col[nn] >=0 && parents.col[nn] < grd.cols && parents.row[nn] >=0 && parents.row[nn] < grd.rows) {
          parents.AvidaNdx[nn] = parents.row[nn] * grd.cols + parents.col[nn];
          //Add organism to AncestorBox in settings. 
          freezeOrgan.forInSelectedItems(function(item, id){
            //console.log('selected: item', item, '; id', id);
            AncestorBox.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
            //console.log('gridBox.map', gridBox.map);
            //console.log('AncestorBox.map', AncestorBox.map);
          });
          //update parents structure
          var nn = parents.name.length;
          parents.handNdx.push(nn);
          parents.howPlaced[nn] = 'hand';
          parents.name[nn] = nodes[0].textContent;
          //find domId of parent as listed in AncestorBox
          var mapItems = Object.keys(AncestorBox.map);
          parents.domId.push(mapItems[mapItems.length-1]);
          
          //Find color of ancestor
          if (0 < ParentColors.length) {parents.color.push(ParentColors.pop())}
          else {parents.color.push(defaultParentColor)};
          //console.log('after', parents)
          //Re-Draw Grid
          DrawGridSetup();
        }
        //In all cases remove the ancestor from the gridBoxNode so we only keep them in the AncestorBox. 
        gridBox.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
        gridBox.sync();
        //console.log("parents", parents);  
      }
    });

    //When something is added to the Organism Freezer ------------------
    freezeOrgan.on("DndDrop", function(source, nodes, copy, target){  //This triggers for every dnd drop, not just those of Organism Freezer
      if ("freezeOrganNode" == target.node.id && "AncestorBoxNode" == source.node.id) {
        var strItem = Object.keys(target.selection)[0];
        var avidian = prompt("Please name your avidian", document.getElementById(strItem).textContent + "_1");
        if (avidian) {
          var namelist = dojo.query('> .dojoDndItem', 'freezeOrganNode');
          var unique = true;
          while (unique) {
            //console.log('namelen', namelist.length, '; aviLen', avidian.length);
            unique = false;
            for (var ii = 0; ii < namelist.length; ii++){
              if (avidian == namelist[ii].textContent) {
                avidian = prompt("Please give your avidian a unique name ", avidian+"_1")
                unique = true;
                //break;
              }
            }  
          }
          if (null != avidian) {  //give dom item new avidian name
            document.getElementById(strItem).textContent=avidian; 
            target.map[strItem].data = avidian; 
            
            // need to remove organism from parents list. 
            var Ndx = parents.domId.indexOf(nodes[0].id);  //Find index into parent structure
            removeParent(Ndx);
            PlaceAncestors(parents);
            
            //create a right mouse-click context menue for the item just created. 
            contextMenu(target, nodes[0].id); 
          }
          else { //Not given a name, so it should NOT be added to the freezer.
            freezeOrgan.deleteSelectedNodes();  //clear items  
            freezeOrgan.sync();   //should be done after insertion or deletion
          }
        }
        else {  //cancelled so the item should NOT be added to the freezer. 
          freezeOrgan.deleteSelectedNodes();  //clear items  
          freezeOrgan.sync();   //should be done after insertion or deletion
        }
      }
      else if ("freezeOrganNode" == target.node.id && "AncestorBoxNode" != source.node.id) {
        console.log('dojo dnd to Organ Freezer, not from Ancestor Box');
      }
    });



    
    //OrganCurrent.on("DndDrop", function(source, nodes, copy, target){
    organismIcon.on("DndDrop", function(source, nodes, copy, target){
      if ("organismIcon" == target.node.id){
        //clear out the old data if an organism is already there
        var items = getAllItems(OrganCurrent);    //gets some data about the items in the container
        if (1<items.length){
          OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
          OrganCurrent.sync();   //should be done after insertion or deletion
        }
        //get the data for the new organism
        freezeOrgan.forInSelectedItems(function(item, id){  
          OrganCurrent.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
          OrganCurrent.sync();
        });
        //clear out organismIcon as nothing is stored there - just moved on to OrganismCurrent
        organismIcon.selectAll().deleteSelectedNodes();  //clear items  
        organismIcon.sync();   //should be done after insertion or deletion
        //Change to Organism Page
        mainBoxSwap("organismBlock"); 
        OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
        OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
        var height = ($("#rightDetail").innerHeight()-375)/2;
        document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById("ExecuteAbout").style.height = height+"px";
        document.getElementById("ExecuteJust").style.width = "100%";  
        document.getElementById("ExecuteAbout").style.width = "100%";
        doOrgTrace();  //request new Organism Trace from Avida and draw that.
      }
    });

    //Need to have only the most recent dropped organism in OrganCurrent. Do this by deleting everything in organCurrent
    //and reinserting the most resent one after a drop event.
    OrganCurrent.on("DndDrop", function(source, nodes, copy, target){  //This triggers for every dnd drop, not just those of OrganCurrentNode
      if ("OrganCurrentNode" == target.node.id){
        //clear out the old data if an organism is already there
        var items = getAllItems(OrganCurrent);    //used to see if there is more than one item in Organ Current
        //console.log('items', items, items.length);
        if (1<items.length){
          OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
          OrganCurrent.sync();   //should be done after insertion or deletion
          
          //get the data for the new organism
          freezeOrgan.forInSelectedItems(function(item, id){  
            OrganCurrent.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
            OrganCurrent.sync();
          });
          //console.log("OrganCurrent.map=", OrganCurrent.map);
        }
        doOrgTrace();  //request new Organism Trace from Avida and draw that.
      }
    });

    //The variable OrganCanvas with the html tag organismCanvas will Not hold the organism. Anything dropped on the OrganismCanvas
    //will be put in OrganCurrent.
    OrganCanvas.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="organismCanvas"){
        //Clear current to put the new organism in there.
        OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
        OrganCurrent.sync();   //should be done after insertion or deletion
        
        //Clear canvas because we should only drag offspring from the canvas
        ItemID = Object.keys(OrganCurrent.map)[0];
        OrganCanvas.selectAll().deleteSelectedNodes();  //clear items  
        OrganCanvas.sync();   //should be done after insertion or deletion
        dojo.destroy(ItemID); 

        //get the data for the new organism
        freezeOrgan.forInSelectedItems(function(item, id){  
          OrganCurrent.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
        });
        OrganCurrent.sync();

        doOrgTrace();  //request new Organism Trace from Avida and draw that.
        }
    });
    
    //uiWorker function
    function doOrgTrace() {
       var request = {
          'Key':'OrgTrace', 
          'PtMuteRate': '0.02',
          'Seed': '0'  // sets to demo mode; optional if left off it is experimental mode
       };
       uiWorker.postMessage(request);
    }

    //------------------------------------- Populated Dishes DND ---------------------
    //This should never happen as there is only one source for populated dishes
    //This triggers for every dnd drop, not just those of freezePopDish
    freezePopDish.on("DndDrop", function(source, nodes, copy, target){
      if ("freezePopDishNode" == target.node.id){
        //var items = getAllItems(freezePopDish);  not used
        var popDish = prompt("Please name your populated dish", nodes[0].textContent+"_1");
        var namelist = dojo.query('> .dojoDndItem', 'freezePopDishNode');
        var unique = true;
        while (unique) {
          unique = false;
          for (var ii = 0; ii < namelist.length; ii++){
            if (popDish == namelist[ii].innerHTML) {
              popDish = prompt("Please give your populated dish a unique name ", popDish+"_1")
              unique = true;
              break;
            }
          }  
        }
        if (null!=popDish) { 
          nodes[0].textContent=popDish;
          //to change data value not fully tested, but keep as it was hard to figure out
          //freezePopDish.setItem(target.node.id, {data: popDish, type: ["popDish"]});
        }
        //ways to get information about the Dnd containers
        //console.log("nodes[0].id, target.node.id = ", nodes[0].id, target.node.id);
        //console.log(Object.keys(target.selection)[0]);
        //console.log("map: ", target.map);
        //console.log("id: ", target.node.id);
        //console.log("textContent: ", nodes[0].textContent);
        //console.log("nodes[0].id: ", nodes[0].id);
        //console.log("target.selection: ",target.selection);
        //console.log("target.selection: ",Object.keys(target.selection)[0]);
        //console.log(document.getElementById(Object.keys(target.selection)[0]).innerHTML)
        //console.log("allnodes: ",target.getAllNodes());
      }
    });

    // Process trash ---------------------------------------------------
    //This triggers for every dnd drop, not just those of trashNode
    trash.on("DndDrop", function(source, nodes, copy, target){
      if ("trashNode" == target.node.id){
        //if the item is from the freezer, delete from freezer unless it is original stock (@) 
        if ("freezeConfigureNode" == source.node.id ||
            "freezeOrganNode" == source.node.id || "freezePopDishNode" == source.node.id) {
          // find name of item in node; don't remove starter (@) items
          if (!('@default' == nodes[0].textContent ||'@ancestor'==nodes[0].textContent || 
                '@example'==nodes[0].textContent)) {
            source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
          }
        }
        // items from ancestor box require ancestor (parent) handling. 
        else if ("AncestorBoxNode" == source.node.id) {
          //find index into parents    
          console.log('source', source.map);
          console.log('nodes', nodes[0], nodes[0].id);
          //Find index into parent structure
          var Ndx = parents.domId.indexOf(nodes[0].id);
          console.log('nodeId', nodes[0].id, '; Ndx', Ndx, '; parents.domId', parents.domId);
          removeParent(Ndx);
          PlaceAncestors(parents);
        }
        trash.selectAll().deleteSelectedNodes();  //in all cases, empty the trash
      }
    });

    //-----------------------------------------------------------------//
    //          DND Analysis page
    //-----------------------------------------------------------------//
    //The following cases should never happen as they are defined as 'target' not as 'source'
    //This triggers for every dnd drop, not just those of freezePopDish
    trash.on("DndDrop", function(source, nodes, copy, target){
      if (source.node.id =="graphPop1Node"){
        pop1a = [];       //remove lines from population 1
        pop1b = [];
        AnaChartFn();
      }
      if (source.node.id =="graphPop2Node"){
        pop2a = [];       //remove lines from population 2
        pop2b = [];
        AnaChartFn();
      }
      if (source.node.id =="graphPop3Node"){
        pop3a = [];       //remove lines from population 3
        pop3b = [];
        AnaChartFn();
      }
    });
    
    var domItm; //used in population graph slots
    var currentItem;
    var freezeItem;
    //This triggers for every dnd drop, not just those of graphPop1
    graphPop1.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="graphPop1Node"){
        var items = getAllItems(graphPop1);
        //if there is an existing item, need to clear all nodes and assign most recent to item 0
        if (1 < items.length) {
          //clear out the old data
          graphPop1.selectAll().deleteSelectedNodes();  //clear items  
          graphPop1.sync();   //should be done after insertion or deletion
          
          //get the data for the new organism
          freezePopDish.forInSelectedItems(function(item, id){  
            graphPop1.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
          });
          graphPop1.sync();
          //console.log("graphPop1.map=", graphPop1.map);
        }
        currentItem = Object.keys(graphPop1.map)[0];
        domItm = document.getElementById(currentItem).textContent
        //update the graph
        //this works for demo purposes only. We will be using textContent rather than data
        pop1a = dictPlota[domItm];
        pop1b = dictPlotb[domItm];
        //console.log('1=', domItm);
        AnaChartFn();
        
        //example code to set item programatically. not actually needed here.
        //graphPop1.setItem(graphPop1.node.childNodes[0].id, {data: "test_name", type: ["popDish"]});
        //graphPop1.sync();
        //console.log("graphPop1.node.childNodes[0].id=", graphPop1.node.childNodes[0].id);
      }
    });

    //This triggers for every dnd drop, not just those of graphPop1
    graphPop2.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="graphPop2Node"){
        var items = getAllItems(graphPop2);
        //if there is an existing item, need to clear all nodes and assign most recent to item 0
        if (1 < items.length) {
          //clear out the old data
          graphPop2.selectAll().deleteSelectedNodes();  //clear items  
          graphPop2.sync();   //should be done after insertion or deletion
          
          //get the data for the new organism
          freezePopDish.forInSelectedItems(function(item, id){  
            graphPop2.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
          });
          graphPop2.sync();
          //console.log("graphPop2.map=", graphPop2.map);
          
        }
        currentItem = Object.keys(graphPop2.map)[0];
        domItm = document.getElementById(currentItem).textContent
        //update the graph
        //this works for demo purposes only. We will be using textContent rather than data
        pop2a = dictPlota[domItm];
        pop2b = dictPlotb[domItm];
        //console.log('2=', domItm);
        AnaChartFn();
      }
    });

    //This triggers for every dnd drop, not just those of graphPop1
    graphPop3.on("DndDrop", function(source, nodes, copy, target){
      if (target.node.id=="graphPop3Node"){
        var items = getAllItems(graphPop3);
        //if there is an existing item, need to clear all nodes and assign most recent to item 0
        if (1 < items.length) {
          //clear out the old data
          graphPop3.selectAll().deleteSelectedNodes();  //clear items  
          graphPop3.sync();   //should be done after insertion or deletion
          
          //get the data for the new organism
          freezePopDish.forInSelectedItems(function(item, id){  
            graphPop3.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
          });
          graphPop3.sync();
          //console.log("graphPop3.map=", graphPop3.map);
        }
        currentItem = Object.keys(graphPop3.map)[0];
        domItm = document.getElementById(currentItem).textContent
        //update the graph
        pop3a = dictPlota[domItm];
        pop3b = dictPlotb[domItm];
        console.log('3=', domItm);
        AnaChartFn();
      }
    });

    /* ********************************************************************** */
    /* Right Click Context Menu Freezer ************************************* */
    /* ********************************************************************** */
    //used to re-name freezer items after they are created--------------
    //http://jsfiddle.net/bEurr/10/
    function contextMenu(target, fzItemID) {
      var fzSection = target.node.id;
      //console.log("target.node.id=",target.node.id);
      //console.log("target.map", target.map);
      //console.log("fzItemID=",fzItemID, " fzSection=", fzSection);
      var aMenu;
      aMenu = new dijit.Menu({ targetNodeIds: [fzItemID]});
      aMenu.addChild(new dijit.MenuItem({
        label: "Rename",
        onClick: function() {
          var fzName = prompt("Please rename freezer item", document.getElementById(fzItemID).textContent);
          var namelist = dojo.query('> .dojoDndItem', fzSection);
          var unique = true;
          while (unique) {
            unique = false;
            if (fzName != document.getElementById(fzItemID).innerHTML){
              for (var ii = 0; ii < namelist.length; ii++){
                //console.log ("name ", namelist[ii].innerHTML);
                if (fzName == namelist[ii].innerHTML) {
                  fzName = prompt("Please give your freezer item a unique name ", fzName+"_1")
                  unique = true;
                  break;
                }
              }  
            }
          }
          if (null!=fzName) {
            //document.getElementById(fzItemID).innerHTML = fzName;  //either works
            document.getElementById(fzItemID).textContent = fzName;
            //console.log(".data=", target.map[fzItemID].data);
          }
        }
      }));
      aMenu.addChild(new dijit.MenuItem({
        label: "delete",
        onClick: function() {
          var sure = confirm("Do you want to delete " + document.getElementById(fzItemID).textContent);
          if (sure) {
            //target.parent.removeChild(fzItemID);
            target.selectNone(); 
            //console.log('frzITem', fzItemID);
            dojo.destroy(fzItemID); 
            target.delItem(fzItemID); 
            //console.log("target.map", target.map);
          }
        }
      }))
    };
/*  
 *  //commented out on 4 sept delete completely later
    // create the delete dialog:
    deleteDlg = new dijit.Dialog({
        title: "Delete",
        style: "width: 300px"
    });
*/
    /* *************************************************************** */
    /* Population page script ******************************************/
    /* *************************************************************** */
    // shifts the population page from Map (grid) view to setup parameters view and back again.
    function popBoxSwap(){
      if ("Map"== document.getElementById("PopSetupButton").innerHTML ) {
      var height = $("#mapBlock").innerHeight()-6;

        dijit.byId("mapBlock").set("style", "display: block; height: "+height+"px");
        dijit.byId("mapBC").set("style", "height: "+height+"px");
        dijit.byId("setupBlock").set("style", "display: none");
        document.getElementById("PopSetupButton").innerHTML = "Setup";
        DrawGridSetup();
      } else {
        document.getElementById("PopSetupButton").innerHTML = "Map";
        dijit.byId("setupBlock").set("style", "display: block;");
        dijit.byId("mapBlock").set("style", "display: none;");
      }
    }
    document.getElementById("PopSetupButton").onclick = function(){popBoxSwap();};

    // hides and shows the population and selected organsim data on right of population page with "Stats" button
    var popStatFlag = true;
    document.getElementById("PopStatsButton").onclick = function(){
      if (popStatFlag) {
        popStatFlag = false;
        registry.byId("popRight").domNode.style.width = "1px";
        registry.byId("mainBC").layout();  
        dijit.byId("popRight").set("style", "display: block; visibility: visible;");

      }
      else {
        popStatFlag = true;
        registry.byId("selectOrganPane").domNode.style.width = "150px";
        registry.byId("popRight").domNode.style.width = "395px";
        registry.byId("mainBC").layout();  
        dijit.byId("popRight").set("style", "display: block; visibility: visible;");

      }
    };

    /* *************************************************************** */
    /* ******* Map Grid buttons - New  Run/Pause Freeze ************** */
    /* *************************************************************** */
    var newrun = true;
    var ave_fitness = [];
    var ave_gestation_time = [];
    var ave_metabolic_rate = [];
    var population_size = [];
    dijit.byId("mnPause").attr("disabled", true);
    dijit.byId("mnFzOrganism").attr("disabled", true);
    dijit.byId("mnFzOffspring").attr("disabled", true);
    dijit.byId("mnFzPopulation").attr("disabled", true);
    
    function runPopFn(){
      //check for ancestor organism in configuration data
      var namelist = dojo.query('> .dojoDndItem', 'AncestorBoxNode');
      //console.log("namelist", namelist);
      if (1>namelist.length){
        document.getElementById("runStopButton").innerHTML="Run";
        dijit.byId("mnPause").attr("disabled", true);
        dijit.byId("mnRun").attr("disabled", false);
        NeedAncestorDialog.show();
      }
      else { // setup for a new run by sending config data to avida
        if (newrun) {
          dom.byId("AncestorBoxNode").isSource = false;
          newrun = false;  //the run will no longer be "new"
          //Disable some of the options on the Setup page
          AncestorBox.isSource = false;
          ConfigCurrent.isSource = false;
          delete AncestorBox.accept["organism"];
          delete ConfigCurrent.accept["conDish"];
          $( "#muteSlide" ).slider( { disabled: true });  //http://stackoverflow.com/questions/970358/jquery-readonly-slider-how-to-do
          dijit.byId("sizeCols").attr("disabled", true);
          dijit.byId("sizeRows").attr("disabled", true);
          dijit.byId("muteInput").attr("disabled", true);
          dijit.byId("childParentRadio").attr("disabled", true);
          dijit.byId("childRandomRadio").attr("disabled", true);
          dijit.byId("notose").attr("disabled", true);
          dijit.byId("nanose").attr("disabled", true);
          dijit.byId("andose").attr("disabled", true);
          dijit.byId("ornose").attr("disabled", true);
          dijit.byId("orose").attr("disabled", true);
          dijit.byId("andnose").attr("disabled", true);
          dijit.byId("norose").attr("disabled", true);
          dijit.byId("xorose").attr("disabled", true);
          dijit.byId("equose").attr("disabled", true);
          dijit.byId("experimentRadio").attr("disabled", true);
          dijit.byId("demoRadio").attr("disabled", true);
          
          //there will be a population so it can now be frozen. 
          dijit.byId("mnFzPopulation").attr("disabled", false);
          //collect setup data to send to avida
          var setDict={};
          setDict["sizeCols"]=dijit.byId("sizeCols").get('value');
          setDict["sizeRows"]=dijit.byId("sizeRows").get('value');
          setDict["muteInput"]=document.getElementById("muteInput").value;
          var nmlist = [];
          for (var ii=0; ii<namelist.length; ii++){
            nmlist.push(namelist[ii].innerHTML);
          }
          setDict["ancestor"] = nmlist;
          if (dijit.byId("childParentRadio").get('checked')){
            setDict["birthMethod"]=0}
          else {
          setDict["birthMethod"]=1}
          setDict["notose"]=dijit.byId("notose").get('checked');
          setDict["nanose"]=dijit.byId("nanose").get('checked');
          setDict["andose"]=dijit.byId("andose").get('checked');
          setDict["ornose"]=dijit.byId("ornose").get('checked');
          setDict["orose"]=dijit.byId("orose").get('checked',true);
          setDict["andnose"]=dijit.byId("andnose").get('checked',true);
          setDict["norose"]=dijit.byId("norose").get('checked',true);
          setDict["xorose"]=dijit.byId("xorose").get('checked',true);
          setDict["equose"]=dijit.byId("equose").get('checked',true);
          setDict["repeatMode"]=dijit.byId("experimentRadio").get('checked',true);
          //dijit.byId("manRadio").set('checked',true); 
           
          var setjson = dojo.toJson(setDict);
          //console.log("setjson ", setjson);   
        }  
        doRunPause();
      }
      //update screen based on data from C++
    }
 
    //sends message to worker to tell Avida to run/pause as a toggle. 
    //uiWorker function
    function doRunPause() {
       var request = {
          'Key':'RunPause'
       };
       uiWorker.postMessage(request);
    }

    //Dummy Data 
    //var dataManDict={}
    //dataManDict["core.world.update"]=1;
    //var dataManJson = dojo.toJson(dataManDict);
    //var DataManJson = JSON.stringify(dataManDict) //does the same thing as dojo.toJason
    //console.log("man ", dataManJson);
    //console.log("str ", DataManJson);

    function updatePopStats(msg){
        document.getElementById("TimeLabel").textContent = msg["core.update"].formatNum(0)+" updates";
        document.getElementById("popSizeLabel").textContent = msg["core.world.organisms"].formatNum(0);
        document.getElementById("aFitLabel").textContent = msg["core.world.ave_fitness"].formatNum(2);
        document.getElementById("aMetabolicLabel").textContent = msg["core.world.ave_metabolic_rate"].formatNum(1);
        document.getElementById("aGestateLabel").textContent = msg["core.world.ave_gestation_time"].formatNum(1);
        document.getElementById("aAgeLabel").textContent = msg["core.world.ave_age"].formatNum(2);
        document.getElementById("notPop").textContent = msg["core.environment.triggers.not.test_organisms"];
        document.getElementById("nanPop").textContent = msg["core.environment.triggers.nand.test_organisms"];
        document.getElementById("andPop").textContent = msg["core.environment.triggers.and.test_organisms"];
        document.getElementById("ornPop").textContent = msg["core.environment.triggers.orn.test_organisms"];
        document.getElementById("oroPop").textContent = msg["core.environment.triggers.or.test_organisms"];
        document.getElementById("antPop").textContent = msg["core.environment.triggers.andn.test_organisms"];
        document.getElementById("norPop").textContent = msg["core.environment.triggers.nor.test_organisms"];
        document.getElementById("xorPop").textContent = msg["core.environment.triggers.xor.test_organisms"];
        document.getElementById("equPop").textContent = msg["core.environment.triggers.equ.test_organisms"];
        //update graph arrays
        ave_fitness.push(msg["core.world.ave_fitness"]); 
        ave_gestation_time.push(msg["core.world.ave_gestation_time"]);
        ave_metabolic_rate.push(msg["core.world.ave_metabolic_rate"]);
        population_size.push(msg["core.world.organisms"]);
        popChartFn();
    }
    
    //from http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
    //formats numbers with commas
    Number.prototype.formatNum = function(c, d, t){
    var n = this, 
        c = isNaN(c = Math.abs(c)) ? 2 : c, 
        d = d == undefined ? "." : d, 
        t = t == undefined ? "," : t, 
        s = n < 0 ? "-" : "", 
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", 
        j = (j = i.length) > 3 ? j % 3 : 0;
       return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
     };

    //process the run/Stop Button - a separate function is used so it can be flipped if the message to avida is not successful. 
    document.getElementById("runStopButton").onclick = function(){runStopFn()}
    function runStopFn(){
      if ("Run"==document.getElementById("runStopButton").innerHTML) {
        document.getElementById("runStopButton").innerHTML="Pause";
        dijit.byId("mnPause").attr("disabled", false);
        dijit.byId("mnRun").attr("disabled", true);
        runPopFn();
      } else {
        document.getElementById("runStopButton").innerHTML="Run";
        dijit.byId("mnPause").attr("disabled", true);
        dijit.byId("mnRun").attr("disabled", false);
        doRunPause()
        //console.log("pop size ", population_size);
      }
    };

    //process run/Stop buttons as above but for drop down menu
    dijit.byId("mnRun").on("Click", function(){ 
        dijit.byId("mnPause").attr("disabled", false);
        dijit.byId("mnRun").attr("disabled", true);
        document.getElementById("runStopButton").innerHTML="Pause";
        runPopFn();
    });
    dijit.byId("mnPause").on("Click", function(){ 
        dijit.byId("mnPause").attr("disabled", true);
        dijit.byId("mnRun").attr("disabled", false);
        document.getElementById("runStopButton").innerHTML="Run";
        doRunPause()
    });
    
    /* ************** New Button and new Dialog ***********************/    
    dijit.byId("newDiscard").on("Click", function(){
      newDialog.hide();
      resetDishFn();
      //console.log("newDiscard click");
    }); 

    dijit.byId("newSave").on("Click", function(){
      newDialog.hide();
      resetDishFn();
      FrPopulationFn();
      //console.log("newSave click");
    }); 

    function newButtonBoth(){
      if (newrun) {// reset petri dish
        resetDishFn();
      }
      else {// check to see about saving current population
        newDialog.show();
      }
    }
    document.getElementById("newDishButton").onclick = function(){newButtonBoth()};
    dijit.byId("mnNewpop").on("Click", function(){newButtonBoth()});
    
    //uiWorker function
    function doReset() {
      var request = {
        'Key':'Reset'
      };
      uiWorker.postMessage(request);
    }
    
    //reset values with hard coded defaults Needs to be updated when Avida workss
    function resetDishFn() { //Need to reset all settings to @default
      newrun = true;
      // send rest to Avida adaptor
      doReset();
      //Enable the options on the Setup page
      AncestorBox.accept["organism"] = 1;     
      ConfigCurrent.accept["conDish"] = 1;     
      AncestorBox.isSource = true;  
      ConfigCurrent.isSource = true;  
      $( "#muteSlide" ).slider( { disabled: false });  //http://stackoverflow.com/questions/970358/jquery-readonly-slider-how-to-do
      dijit.byId("sizeCols").attr("disabled", false);
      dijit.byId("sizeRows").attr("disabled", false);
      dijit.byId("muteInput").attr("disabled", false);
      dijit.byId("childParentRadio").attr("disabled", false);
      dijit.byId("childRandomRadio").attr("disabled", false);
      dijit.byId("notose").attr("disabled", false);
      dijit.byId("nanose").attr("disabled", false);
      dijit.byId("andose").attr("disabled", false);
      dijit.byId("ornose").attr("disabled", false);
      dijit.byId("orose").attr("disabled", false);
      dijit.byId("andnose").attr("disabled", false);
      dijit.byId("norose").attr("disabled", false);
      dijit.byId("xorose").attr("disabled", false);
      dijit.byId("equose").attr("disabled", false);
      dijit.byId("experimentRadio").attr("disabled", false);
      dijit.byId("demoRadio").attr("disabled", false);

      //reset Ancestor Color stack
      ParentColors = ColorBlind;
      ParentColors.reverse();
      //set run/stop and drop down menu to the 'stopped' state
      dijit.byId("mnPause").attr("disabled", true);
      dijit.byId("mnRun").attr("disabled", false);
      document.getElementById("runStopButton").innerHTML="Run";
      //set configuation to default
      ConfigCurrent.selectAll().deleteSelectedNodes();  
      ConfigCurrent.insertNodes(false, [{ data: "@default",      type: ["conDish"]}]);
      ConfigCurrent.sync();
      //clear the time series graphs
      ave_fitness = [];
      ave_gestation_time = [];
      ave_metabolic_rate = [];
      population_size = [];
      popChartFn();
      //Clear grid settings
      clearParents();
      //reset values in population settings either based on a 'file' @default or a @default string
      writeSettings();
      //re-write grid if that page is visible 
      DrawGridSetup();
    }

    //writes data to Environmental Settings page based on the content of ConfigCurrent
    //for now this is hard coded to what would be in @default. will need a way to request data from C++
    //and read the returned json string. 
    function writeSettings(){
      dijit.byId("sizeCols").set('value','60');
      dijit.byId("sizeRows").set('value','60');
      document.getElementById("muteInput").value='2';
      var event = new Event('change');
      document.getElementById("muteInput").dispatchEvent(event);
      AncestorBox.selectAll().deleteSelectedNodes();
      AncestorBox.sync();
      gridBox.selectAll().deleteSelectedNodes();
      gridBox.sync();
      AncestorList = [];
      TimeLabel.textContent = 0;
      document.getElementById("seedTray").innerHTML="";
      dijit.byId("childParentRadio").set('checked',true);
      dijit.byId("notose").set('checked',true);
      dijit.byId("nanose").set('checked',true);
      dijit.byId("andose").set('checked',true);
      dijit.byId("ornose").set('checked',true);
      dijit.byId("orose").set('checked',true);
      dijit.byId("andnose").set('checked',true);
      dijit.byId("norose").set('checked',true);
      dijit.byId("xorose").set('checked',true);
      dijit.byId("equose").set('checked',true);
      dijit.byId("experimentRadio").set('checked',true);
      dijit.byId("manRadio").set('checked',true);
      //Selected Organism Type
      document.getElementById("nameLabel").textContent="-";
      document.getElementById("fitLabel").innerHTML="-";
      document.getElementById("metabolicLabel").textContent="-";
      document.getElementById("generateLabel").textContent="-";
      document.getElementById("ageLabel").textContent="-";
      document.getElementById("ancestorLabel").textContent="-";
      document.getElementById("notLabel").textContent="not-";
      document.getElementById("nanLabel").textContent="nan-";
      document.getElementById("andLabel").textContent="and-";
      document.getElementById("ornLabel").textContent="orn-";
      document.getElementById("antLabel").textContent="ant-";
      document.getElementById("norLabel").textContent="nor-";
      document.getElementById("xorLabel").textContent="xor-";
      document.getElementById("equLabel").textContent="equ-";
      document.getElementById("notTime").textContent="0";
      document.getElementById("nanTime").textContent="0";
      document.getElementById("andTime").textContent="0";
      document.getElementById("ornTime").textContent="0";
      document.getElementById("antTime").textContent="0";
      document.getElementById("norTime").textContent="0";
      document.getElementById("xorTime").textContent="0";
      document.getElementById("equTime").textContent="0";
      //Population Statistics
      document.getElementById("popSizeLabel").textContent="-";
      document.getElementById("aFitLabel").textContent="-";
      document.getElementById("aMetabolicLabel").textContent="-";
      document.getElementById("aGestateLabel").textContent="-";
      document.getElementById("aAgeLabel").textContent="-";
      document.getElementById("notPop").textContent="-";
      document.getElementById("nanPop").textContent="-";
      document.getElementById("andPop").textContent="-";
      document.getElementById("ornPop").textContent="-";
      document.getElementById("oroPop").textContent="-";
      document.getElementById("antPop").textContent="-";
      document.getElementById("norPop").textContent="-";
      document.getElementById("xorPop").textContent="-";
      document.getElementById("equPop").textContent="-";
      grd.flagSelected = false;
      dijit.byId("mnFzOrganism").attr("disabled", true);
    }

    //******* Freeze Button ********************************************
    //Saves either configuration or populated dish
    //Also creates context menu for all new freezer items. 
    document.getElementById("freezeButton").onclick = function(){
      fzDialog.show();
    }
    
    function FrConfigFn(){
      var fzName = prompt("Please name the new configuration", "newConfig");
      var namelist = dojo.query('> .dojoDndItem', "freezeConfigureNode");
      var unique = true;
      while (unique) {
        unique = false;
        for (var ii = 0; ii < namelist.length; ii++){
          //console.log ("name ", namelist[ii].innerHTML);
          if (fzName == namelist[ii].innerHTML) {
            fzName = prompt("Please give your new configuration a unique name ", fzName+"_1")
            unique = true;
            break;
          }
        }  
      }
      if (null!=fzName) {
        freezeConfigure.insertNodes(false, [ {data: fzName,   type: ["conDish"]}]);
        freezeConfigure.sync();
        //Create context menu for right-click on this item
        //Find out the dom ID the node element just inserted. 
        var domItems = Object.keys(freezeConfigure.map);
        //console.log("domItems=", domItems);
        var nodeIndex = -1;
        for (var ii=0; ii< domItems.length; ii++) {
          if (freezeConfigure.map[domItems[ii]].data == fzName) {
            nodeIndex = ii;
          }
        }
        contextMenu(freezeConfigure, domItems[nodeIndex]);
      }
    }
    
    dijit.byId("FzConfiguration").on("Click", function(){
      fzDialog.hide();
      FrConfigFn();
    }); 

    //Drop down menu to save a configuration item
    dijit.byId("mnFzConfig").on("Click", function(){ FrConfigFn() });
    
    //Save a populated dish
    function FrPopulationFn(){
      var fzName = prompt("Please name the new population", "newPopulation");
      var namelist = dojo.query('> .dojoDndItem', "freezePopDishNode");
      var unique = true;
      while (unique) {
        unique = false;
        for (var ii = 0; ii < namelist.length; ii++){
          //console.log ("name ", namelist[ii].innerHTML);
          if (fzName == namelist[ii].innerHTML) {
            fzName = prompt("Please give your new Population a unique name ", fzName+"_1")
            unique = true;
            break;
          }
        }  
      }
      if (null!=fzName) {
        freezePopDish.insertNodes(false, [ {data: fzName,   type: ["popDish"]}]);
        freezePopDish.sync();
        //Create context menu for right-click on this item
        //Find out the dom ID the node element just inserted. 
        var domItems = Object.keys(freezePopDish.map);
        //console.log("domItems=", domItems);
        var nodeIndex = -1;
        for (var ii=0; ii< domItems.length; ii++) {
          if (freezePopDish.map[domItems[ii]].data == fzName) {
            nodeIndex = ii;
          }
        }
        contextMenu(freezePopDish, domItems[nodeIndex]);
      }
    }

    //button to freeze a population
    dijit.byId("FzPopulation").on("Click", function(){
      fzDialog.hide();
      FrPopulationFn();
    }); 
    
    //Buttons on drop down menu to save population
    dijit.byId("mnFzPopulation").on("Click", function() {FrPopulationFn() });
    //Buttons on drop down menu to save configured dish
    dijit.byId("mnFzOrganism").on("Click", function(){ FrOrganismFn('selected') });

    //Freeze the selected organism
    function FrOrganismFn(trigger){
      var fzName = 'new';
      var parentName = "";
      if ('selected' == trigger) {
        fzName = prompt("Please name the selected organism", "newOrganism");
      }
      else if ('offpring' == trigger) {
        //get name from parent 
        parentName = document.getElementById(Object.keys(OrganCurrent.map)[0]).textContent;
        fzName = prompt("Please name the offspring", parentName + '_Offspring');
      }
      else {
        fzName = prompt("Please name the organism", "newOrganism");
      }
      var namelist = dojo.query('> .dojoDndItem', "freezeOrganNode");
      var unique = true;
      while (unique) {
        unique = false;
        for (var ii = 0; ii < namelist.length; ii++){
          //console.log ("name ", namelist[ii].innerHTML);
          if (fzName == namelist[ii].innerHTML) {
            fzName = prompt("Please give your new Organism a unique name ", fzName+"_1")
            unique = true;
            break;
          }
        }  
      }
      if (null!=fzName) {
        //insert new item into the freezer. 
        freezeOrgan.insertNodes(false, [ {data: fzName,   type: ["organism"]}]);
        freezeOrgan.sync();
        
        //Find out the dom ID the node element just inserted. 
        var domItems = Object.keys(freezeOrgan.map);
        //console.log("domItems=", domItems);
        var nodeIndex = -1;
        for (var ii=0; ii< domItems.length; ii++) {
          if (freezeOrgan.map[domItems[ii]].data == fzName) {
            nodeIndex = ii;
          }
        }
        contextMenu(freezeOrgan, domItems[nodeIndex]);
      }
    }

    // End of Freezer Functions 
    /* *************************************************************** */
    // ****************  Draw Population Grid ************************ */
    /* *************************************************************** */

    var CanvasScale = document.getElementById("scaleCanvas");
    var sCtx = CanvasScale.getContext("2d");
    CanvasScale.width = $("#gridHolder").innerWidth()-6;

    var CanvasGrid = document.getElementById("gridCanvas");
    var cntx = CanvasGrid.getContext("2d");
    CanvasGrid.width = $("#gridHolder").innerWidth()-6;
    CanvasGrid.height = $("#gridHolder").innerHeight()-16-$("#scaleCanvas").innerHeight();
    
    grd = {};       //data about the grid canvas
    grd.cols = 30;  //Number of columns in the grid
    grd.rows = 30;  //Number of rows in the grid
    grd.sizeX = 300;  //size of canvas in pixels
    grd.sizeY = 300;  //size of canvas in pixels
    grd.flagSelected = false; //is a cell selected
    grd.zoom = 1;     //magnification for zooming.

    function backgroundSqares() {
      var boxColor = '#111';
      for (ii=0; ii<grd.cols; ii++) {
        xx = grd.marginX + grd.xOffset + ii*grd.cellWd;
        for (jj=0; jj<grd.rows; jj++) {
          yy = grd.marginY + grd.yOffset + jj*grd.cellHt;
          //boxColor = get_color0(Viridis_cmap, Math.random(), 0, 1);
          //boxColor = get_color0(Viridis_cmap, 0.5, 0, 1);
          //console.log('color=', boxColor);
          cntx.fillStyle = '#222';
          cntx.fillRect(xx, yy, grd.cellWd-1, grd.cellHt-1);
        }
      }
    }

  //********************************************************************
  //    Mouse DND functions
  //********************************************************************
    var mouseDnoffsetPos = [];

    var nearly = function(aa, bb) {
      var epsilon = 3;
      var distance = Math.sqrt(Math.pow(aa[0]-bb[0],2) + Math.pow(aa[1]-bb[1],2))
      if (distance > epsilon) return false;
      else return true;
    }

    var matches = function(aa, bb) {
      if (aa[0]==bb[0] && aa[1]==bb[1]) return true;
      else return false;
    }

    var findParentNdx = function() {
      var MomNdx = -1;
      for (var ii=0; ii<parents.name.length; ii++) {
        if (matches([grd.ColSelected, grd.RowSelected], [parents.col[ii], parents.row[ii]])) {
          MomNdx = ii;
          //console.log('parent found in function', MomNdx);
          break;  //found a parent no need to keep looking
        }
      }
      return MomNdx;
    }
    
    function findSelected(evt) {
      mouseX = evt.offsetX - grd.marginX - grd.xOffset;
      mouseY = evt.offsetY - grd.marginY - grd.yOffset;
      grd.ColSelected = Math.floor(mouseX/grd.cellWd);
      grd.RowSelected = Math.floor(mouseY/grd.cellHt);
      //console.log('mx,y', mouseX, mouseY, '; selected Col, Row', grd.ColSelected, grd.RowSelected);
    }

    var mouse = {};
      mouse.Dn = false;
      mouse.DnGridPos = [];
      mouse.UpGridPos = [];
      mouse.DnOrganPos = [];
      mouse.Move = false;
      mouse.Drag = false; 
      mouse.ParentNdx = -1;
      mouse.ParentSelected = false;
      mouse.Picked = "";
  
    $(document.getElementById('organismCanvas')).on('mousedown', function (evt) {
      mouse.DnOrganPos=[evt.offsetX, evt.offsetY];
      mouse.Dn = true;
      var distance = Math.sqrt(Math.pow(evt.offsetX-gen.cx[1],2) + Math.pow(evt.offsetY-gen.cy[1],2));
      if (25 > distance) { 
        document.getElementById('organismIcon').style.cursor = 'copy';
        document.getElementById('organismCanvas').style.cursor = 'copy';
        document.getElementById('mainBC').style.cursor = 'move';
        mouse.Picked = "offspring"; 
      }
      else { mouse.Picked = ""; }
    });
  
    //mouse down on the grid
    $(document.getElementById('gridCanvas')).on('mousedown', function (evt) {
      mouse.DnGridPos=[evt.offsetX, evt.offsetY];
      mouse.Dn = true;          
      // Select if it is in the grid
      findSelected(evt);
      //check to see if in the grid part of the canvas
      if (grd.ColSelected >=0 && grd.ColSelected < grd.cols && grd.RowSelected >=0 && grd.RowSelected < grd.rows) {
        grd.flagSelected = true;
        DrawGridSetup();
        dijit.byId("mnFzOrganism").attr("disabled", false);  //When an organism is selected, then it can be save via the menu

        //In the grid and selected. Now look to see contents of cell are dragable. 
        mouse.ParentNdx=-1; //index into parents array if parent selected else -1;
        if (newrun) {  //run has not started so look to see if cell contains ancestor
          mouse.ParentNdx = findParentNdx();
          if (-1 < mouse.ParentNdx) { //selected a parent, check for dragging
            document.getElementById('organismIcon').style.cursor = 'copy';
            document.getElementById('gridCanvas').style.cursor = 'copy';
            document.getElementById('TrashCan').style.cursor = 'copy';
            document.getElementById('mainBC').style.cursor = 'move';
            mouse.Picked = 'parent';
            //console.log('Parent cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('TrashCan').style.cursor);
          }
        }
      }
    });

    //mouse move anywhere on screen
    $(document).on('mousemove', function handler(evt) { //needed so cursor changes shape
      //console.log('gd move');
      //document.getElementById('gridCanvas').style.cursor = 'copy';
      //document.getElementById('TrashCan').style.cursor = 'copy';
      //console.log('mouseMove cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('TrashCan').style.cursor);
      if(!nearly([evt.offsetX, evt.offsetY], mouse.DnGridPos)) {
        console.log("gd draging");  
        if (mouse.Dn) mouse.Drag = true;
        else mouse.Drag = true;
      }
      $(document).off('mousemove', handler);
    });

    //When mouse button is released, return cursor to default values
    $(document).on('mouseup', function (evt) {
      //console.log('mouseup anywhere in document -------------');
      document.getElementById('organismCanvas').style.cursor = 'default';
      document.getElementById('gridCanvas').style.cursor = 'default';
      document.getElementById('TrashCan').style.cursor = 'default';
      document.getElementById('mainBC').style.cursor = 'default';
      document.getElementById('organismIcon').style.cursor = 'default';
      mouse.UpGridPos=[evt.offsetX, evt.offsetY];
      mouse.Dn = false;
      
      // --------- process if something picked to dnd ------------------
      if ('parent' == mouse.Picked) {
        mouse.Picked = ""
        ParentMouseDn(evt) ;
      }
      else if ('offspring' == mouse.Picked) {
        mouse.Picked = "";
        OffspringMouseDn(evt)
      }
      mouse.Picked = "";
    });

    function OffspringMouseDn(evt) {
      if ('organismIcon' == evt.target.id) { // needs work!!  tiba
        //Get name of parent that is in OrganCurrentNode
        var parent;
        var parentID = Object.keys(OrganCurrent.map)[0];
        console.log('parentID', parentID);
        if (undefined == parentID) parent = '';
        else parent = document.getElementById(parentID).textContent;
        OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
        OrganCurrent.sync();   //should be done after insertion or deletion
        //Put name of offspring in OrganCurrentNode
        OrganCurrent.insertNodes(false, [{ data: parent+"_offspring",      type: ["organism"]}]);
        OrganCurrent.sync();
        
        //get genome from offspring data //needs work!!
        doOrgTrace();  //request new Organism Trace from Avida and draw that.
      }
    }

    function ParentMouseDn(evt) {
        if ('gridCanvas' == evt.target.id) { // parent moved to another location on grid canvas
          mouse.UpGridPos=[evt.offsetX, evt.offsetY]; //not used for now
          //Move the ancestor on the canvas
          //console.log("on gridCanvas")
          findSelected(evt);
          // look to see if this is a valid grid cell
          if (grd.ColSelected >=0 && grd.ColSelected < grd.cols && grd.RowSelected >=0 && grd.RowSelected < grd.rows) {
            parents.col[mouse.ParentNdx] = grd.ColSelected;
            parents.row[mouse.ParentNdx] = grd.RowSelected; 
            parents.AvidaNdx[parents.handNdx[ii]] = parents.col[parents.handNdx[ii]] + grd.cols * parents.row[parents.handNdx[ii]];
            //console.log('mvparent', mouse.ParentNdx, parents.col[mouse.ParentNdx], parents.row[mouse.ParentNdx]); 
            //console.log('b auto', parents.autoNdx.length, parents.autoNdx, parents.name);
            //console.log('b hand', parents.handNdx.length, parents.handNdx);
            //change from auto placed to hand placed if needed
            if ('auto' == parents.howPlaced[mouse.ParentNdx] ) {
              parents.howPlaced[mouse.ParentNdx] = 'hand';
              makeHandAutoNdx();
              //PlaceAncestors(parents);
            }
            //console.log('auto', parents.autoNdx.length, parents.autoNdx, parents.name);
            //console.log('hand', parents.handNdx.length, parents.handNdx);
            DrawGridSetup();
          }
        }  // close on canvas
        //-------------------------------------------- trash
        else if ('TrashCan' == evt.target.id) {
          //Remove this Parent from the grid  
          //remove node from AncestorBoxNode
          /*fromAncestorBoxRemove(parents.name[mouse.ParentNdx]);
          var domItems = Object.keys(AncestorBox.map);
          console.log("domItems=", domItems);
          console.log('parents.domId', parents.domId[mouse.ParentNdx]);
          var nodeIndex = -1;
          for (var ii=0; ii< domItems.length; ii++) { //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
            if (AncestorBox.map[domItems[ii]].data == parents.name[mouse.ParentNdx]) {
              nodeIndex = ii;
            }
          }
          console.log('nodeIndex', nodeIndex, domItems[nodeIndex] );
          */
          var node = dojo.byId(parents.domId[mouse.ParentNdx]);
          AncestorBox.parent.removeChild(node);
          AncestorBox.sync();

          //remove from main list.
          removeParent(mouse.ParentNdx);
          DrawGridSetup();
        }
        //-------------------------------------------- organism view
        else if ('organismIcon' == evt.target.id) { 
          //Change to Organism Page
          mainBoxSwap("organismBlock"); 
          OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
          OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
          var height = ($("#rightDetail").innerHeight()-375)/2;
          document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
          document.getElementById("ExecuteAbout").style.height = height+"px";
          document.getElementById("ExecuteJust").style.width = "100%";  
          document.getElementById("ExecuteAbout").style.width = "100%";

          OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
          OrganCurrent.sync();   //should be done after insertion or deletion
          //Put name of offspring in OrganCurrentNode
          OrganCurrent.insertNodes(false, [{ data: parents.name[mouse.ParentNdx], type: ["organism"]}]);
          OrganCurrent.sync();
          //genome data should be in parents.genome[mouse.ParentNdx];

          doOrgTrace();  //request new Organism Trace from Avida and draw that.
        }
    }

    function fromAncestorBoxRemove(removeName) {
      var domItems = Object.keys(AncestorBox.map);
      //console.log("domItems=", domItems);
      var nodeIndex = -1;
      for (var ii=0; ii< domItems.length; ii++) { //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
        if (AncestorBox.map[domItems[ii]].data == removeName) {
          nodeIndex = ii;
        }
      }
      var node = dojo.byId(domItems[nodeIndex]);
      console.log('nodeIndex', nodeIndex, domItems[nodeIndex] );
      AncestorBox.parent.removeChild(node);
      AncestorBox.sync();
    }

    //removes the parent at index ParentNdx
    function removeParent(ParentNdx) {
      //console.log('rP', ParentColors)
      //console.log('rp ndx, domId, parents',ParentNdx, parents.domId, parents);
      ParentColors.push(parents.color[ParentNdx]);
      parents.color.splice(ParentNdx,1);      
      parents.name.splice(ParentNdx,1);
      parents.genome.splice(ParentNdx,1);
      parents.col.splice(ParentNdx,1);
      parents.row.splice(ParentNdx,1);
      parents.AvidaNdx.splice(ParentNdx,1);
      parents.howPlaced.splice(ParentNdx, 1);
      parents.domId.splice(ParentNdx, 1);
      makeHandAutoNdx();
    }

    function makeHandAutoNdx() {
      var hh = 0;  //index into hand placed
      var aa = 0;  //index into auto placed
      parents.handNdx = [];
      parents.autoNdx = [];
      for (ii = 0; ii < parents.name.length; ii++) {
        if ('hand' == parents.howPlaced[ii]) {
          parents.handNdx[hh] = ii;
          hh++;
        }
        else if ('auto' == parents.howPlaced[ii]) {
          parents.autoNdx[aa] = ii;
          aa++;
        }
      }
    };

    //Draw Cell outline or including special case for Selected
    function DrawSelected() {
      grd.selectX = grd.marginX + grd.xOffset + grd.ColSelected * grd.cellWd;
      grd.selectY = grd.marginY + grd.yOffset + grd.RowSelected * grd.cellHt;
      DrawCellOutline(2, '#00ff00', grd.selectX, grd.selectY, grd.cellWd, grd.cellHt)
    }
    
    function DrawCellOutline(lineThickness, color, xx, yy, wide, tall) {
      cntx.rect(xx, yy, wide, tall);
      cntx.strokeStyle = color;
      cntx.lineWidth = lineThickness;
      cntx.stroke();
    }
    
    function DrawParent() {
      //console.log('parents.col.length, marginX, xOffset', parents.col.length, grd.marginX, grd.xOffset);
      for (ii = 0; ii < parents.col.length; ii++) {
        xx = grd.marginX + grd.xOffset + parents.col[ii]*grd.cellWd;
        yy = grd.marginY + grd.yOffset + parents.row[ii]*grd.cellHt;
        if ("Ancestor Organism" == dijit.byId("colorMode").value) { cntx.fillStyle = parents.color[ii];}
        else { cntx.fillStyle = '#eee'}
        cntx.fillRect(xx, yy, grd.cellWd-1, grd.cellHt-1);
        //console.log('x, y, wd, Ht', xx, yy, grd.cellWd, grd.cellHt);
      }
    };

    function DrawGridSetup() {
      //Get the size of the div that holds the grid and the scale or legend
      var GridHolderHt = $("#gridHolder").innerHeight();
      
      //Determine if a color gradient or legend will be displayed
      if ("Ancestor Organism" == dijit.byId("colorMode").value) { drawLegend() }
      else { GradientScale() }
      
      //find the height for the div that holds the grid Canvas
      var GrdNodeHt = GridHolderHt - 16 - $("#scaleCanvas").innerHeight();
      document.getElementById("gridBoxNode").style.height = GrdNodeHt+'px';
      document.getElementById("gridBoxNode").style.overflowY = "scroll";
      //console.log('GrdNodeHt=',GrdNodeHt);
      
      // When zoom = 1x, set canvas size based on space available and cell size
      // based on rows and columns requested by the user. Zoom acts as a factor 
      // to multiply the size of each cell. When the size of the grid become larger
      // than the canvas, then the canvas is set to the size of the grid and the 
      // offset in that direction goes to zero.
      
      //find the space available to display the grid in pixels
      grd.spaceX = $("#gridHolder").innerWidth()-6;
      grd.spaceY = GrdNodeHt-5;
      //console.log('spaceY', grd.spaceY, '; gdHolder', GridHolderHt, '; scaleCanv', $("#scaleCanvas").innerHeight());
      // First find sizes based on zoom 
      grd.boxX = grd.zoom * grd.spaceX;
      grd.boxY = grd.zoom * grd.spaceY;
      //get rows and cols based on user input form
      grd.cols = dijit.byId("sizeCols").get('value');
      grd.rows = dijit.byId("sizeRows").get('value');
      //max size of box based on width or height based on ratio of cols:rows and width:height
      if (grd.spaceX/grd.spaceY > grd.cols/grd.rows) {
        //set based  on height as that is the limiting factor. 
        grd.sizeY = grd.boxY;
        grd.sizeX = grd.sizeY*grd.cols/grd.rows;
        grd.spaceCellWd = grd.spaceY/grd.rows;
        grd.spaceCells = grd.rows;  //rows exactly fit the space when zoom = 1x
      } 
      else {
        //set based on width as that is the limiting direction
        grd.sizeX = grd.boxX;
        grd.sizeY = grd.sizeX * grd.rows/grd.cols;
        grd.spaceCellWd = grd.spaceX/grd.cols;
        grd.spaceCells = grd.cols;  //cols exactly fit the space when zoom = 1x
      }
      
      //Determine offset and size of canvas based on grid size relative to space size in that direction
      if (grd.sizeX < grd.spaceX) {
        CanvasGrid.width = grd.spaceX;
        grd.xOffset =(grd.spaceX-grd.sizeX)/2;
      }
      else {
        CanvasGrid.width = grd.sizeX;
        grd.xOffset = 0;
      }
      if (grd.sizeY < grd.spaceY) {
        CanvasGrid.height = grd.spaceY;
        grd.yOffset =(grd.spaceY-grd.sizeY)/2;
      }
      else {
        CanvasGrid.height = grd.sizeY;
        grd.yOffset = 0;
      }
      //console.log('Xsize', grd.sizeX, '; Ysize', grd.sizeY, '; zoom=', grd.zoom);

      //get cell size based on grid size and number of columns and rows
      grd.marginX = 1;  //width of black line between the cells
      grd.marginY = 1;  //width of black line between the cells
      grd.cellWd = ((grd.sizeX-grd.marginX)/grd.cols); 
      grd.cellHt = ((grd.sizeY-grd.marginY)/grd.rows);

      //Find a reasonable maximum zoom for this grid and screen space
      zMaxCells = Math.trunc(grd.spaceCells/25);  // at least 10 cells
      zMaxWide = Math.trunc(10/grd.spaceCellWd);  // at least 10 pixels
      zMax = ((zMaxCells > zMaxWide) ? zMaxCells: zMaxWide); //Max of two methods 
      zMax = ((zMax > 2) ? zMax: 2); //max zoom power of at least 2x
      
      ZoomSlide.set("maximum", zMax);
      ZoomSlide.set("discreteValues", 2*(zMax-1)+1);
      //console.log("Cells, pixels, zMax, zoom", zMaxCells, zMaxWide, zMax, grd.zoom);

      DrawGridBackground();
      //Check to see if run has started
      //if (newrun) { DrawParent();}
      if (true) { DrawParent();}
      else { // running so draw grid data from Avida
      }
      //Draw Selected as one of the last items to draw
      if (grd.flagSelected) { DrawSelected() };
    }

    function DrawGridBackground() {
      // Use the identity matrix while clearing the canvas    http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
      cntx.setTransform(1, 0, 0, 1, 0, 0);
      cntx.clearRect(0, 0, CanvasGrid.width, CanvasGrid.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
      //draw grey rectangle as back ground
      cntx.fillStyle = dictColor["ltGrey"];
      cntx.fillRect(0,0, CanvasGrid.width, CanvasGrid.height);

      //cntx.translate(grd.xOffset, grd.yOffset);
      cntx.fillStyle=dictColor['Black'];
      cntx.fillRect(grd.xOffset,grd.yOffset,grd.sizeX,grd.sizeY);
      
      backgroundSqares();      
      //Draw parents if run has not started. 
    }

    //--------------- Draw legend --------------------------------------
    //Draws the color and name of each Ancestor (parent) organism 
    //to lay out the legend we need the width of the longest name and we
    //allow for the width of the color box to see how many columns fit across
    //the width of CanvasScale. We will need to increase the size of the 
    //legend box by the height of a line for each additional line.
    function drawLegend() {
      var legendPad = 10;   //padding on left so it is not right at edge of canvas
      var colorWide = 13;   //width and heigth of color square
      var RowHt = 20;       //height of each row of text
      var textOffset = 15;  //vertical offset to get to the bottom of the text
      var leftPad = 10;     //padding to allow space between each column of text in the legend
      var legendCols = 1;   //max number of columns based on width of canvas and longest name
      var txtWide = 0;      //width of text for an ancestor (parent) name
      var maxWide = 0;      //maximum width needed for any of the ancestor names in this set
      //console.log('in drawLedgend')
      CanvasScale.width = $("#gridHolder").innerWidth()-6;
      sCtx.font = "14px Arial";
      //find out how much space is needed
      for (ii=0; ii< parents.name.length; ii++) {
        txtWide = sCtx.measureText(parents.name[ii]).width;
        if (txtWide > maxWide) { maxWide = txtWide }
      }
      legendCols = Math.trunc((CanvasScale.width-leftPad)/(maxWide + colorWide + legendPad));
      if (Math.trunc(parents.name.length/legendCols) == parents.name.length/legendCols) {
        legendRows = Math.trunc(parents.name.length/legendCols);
      }
      else { legendRows = Math.trunc(parents.name.length/legendCols)+1; }
      //set canvas height based on space needed
      CanvasScale.height = RowHt * legendRows;
      sCtx.fillStyle = dictColor["ltGrey"];
      sCtx.fillRect(0,0, CanvasGrid.width, CanvasGrid.height);
      var colWide = (CanvasScale.width-leftPad)/legendCols
      var col = 0; 
      var row = 0;
      for (ii = 0; ii< parents.name.length; ii++) {
        col = ii%legendCols;
        row = Math.trunc(ii/legendCols);
        //xx = leftPad + col*(maxWide+colorWide+legendPad);
        xx = leftPad + col*(colWide);
        yy = 2+row*RowHt; 
        sCtx.fillStyle = parents.color[ii];
        sCtx.fillRect(xx,yy, colorWide, colorWide);
        yy = textOffset+row*RowHt; 
        sCtx.font = "14px Arial";
        sCtx.fillStyle='black';
        sCtx.fillText(parents.name[ii],xx+colorWide+legendPad/2, yy);
      }
    }
    
    //needs numbers from Avida
    function GradientScale() {
      CanvasScale.width = $("#gridHolder").innerWidth()-6;
      CanvasScale.height = 30;
      sCtx.fillStyle = dictColor["ltGrey"];
      sCtx.fillRect(0,0, CanvasScale.width, CanvasScale.height);
      var xStart = 30;
      var xEnd = CanvasScale.width - xStart;
      var gradWidth = xEnd-xStart 
      var grad = sCtx.createLinearGradient(xStart+2, 0, xEnd-2, 0)
      var legendHt = 15;
      switch(grd.colorMap) {
        case "Viridis":
          for (var ii=0; ii < Viridis_cmap.length; ii++) {
            grad.addColorStop(ii/(Viridis_cmap.length-1), Viridis_cmap[ii]); 
          }
          break;
        case 'Gnuplot2':
          for (var ii=0; ii < Gnuplot2_cmap.length; ii++) {
            grad.addColorStop(ii/(Gnuplot2_cmap.length-1), Gnuplot2_cmap[ii]); 
          }
          break;
        case 'Cubehelix':
          for (var ii=0; ii < Cubehelix_cmap.length; ii++) {
            grad.addColorStop(ii/(Cubehelix_cmap.length-1), Cubehelix_cmap[ii]); 
          }
          break;
      }
      sCtx.fillStyle = grad;
      sCtx.fillRect(xStart, legendHt, gradWidth, CanvasScale.height-legendHt);
    }
    
    // *************************************************************** */
    //        Color Map Color Mode and Zoom Slide Controls             //
    // *************************************************************** */
    
    //Get color map data from Avida and draw
    dijit.byId("colorMode").on("Change", function(){
      var scaleType = dijit.byId("colorMode").value;
      //need to request data to update the color map from Avida
      // code for that
      //Redraw Grid;
      DrawGridSetup();
    });

    //Only effect display, not Avida

    // Zoom slide 
    var ZoomSlide = new HorizontalSlider({
        name: "ZoomSlide",
        value: 1,
        minimum: 1,
        maximum: 10,
        intermediateChanges: true,
        discreteValues: 19,
        style: "height: auto; width: 120px;float:right",
        onChange: function(value){
            grd.zoom = value;
            //console.log('ZoomSlide', grd.zoom);
            DrawGridSetup();
        }
    }, "ZoomSlide");

    grd.colorMap = 'Gnuplot2';
    dijit.byId("mnGnuplot2").attr("disabled", true);
    
    dijit.byId("mnViridis").on("Click", function(){ 
      dijit.byId("mnCubehelix").attr("disabled", false);
      dijit.byId("mnGnuplot2").attr("disabled", false);
      dijit.byId("mnViridis").attr("disabled", true);
      grd.colorMap = 'Viridis';
      DrawGridSetup();
    });

    dijit.byId("mnGnuplot2").on("Click", function(){ 
      dijit.byId("mnCubehelix").attr("disabled", false);
      dijit.byId("mnGnuplot2").attr("disabled", true);
      dijit.byId("mnViridis").attr("disabled", false);
      grd.colorMap = 'Gnuplot2';
      DrawGridSetup();
    });

    dijit.byId("mnCubehelix").on("Click", function(){ 
      dijit.byId("mnCubehelix").attr("disabled", true);
      dijit.byId("mnGnuplot2").attr("disabled", false);
      dijit.byId("mnViridis").attr("disabled", false);
      grd.colorMap = 'Cubehelix';
      DrawGridSetup();
    });
    
    // *************************************************************** */
    //    Buttons that select organisms that perform a logic function 
    // *************************************************************** */
    
    function toggle(button) {
      if ('on' == document.getElementById(button).value) {
        document.getElementById(button).value = 'off';
        document.getElementById(button).className = 'bitButtonOff';
        console.log('now off');
      }
      else {
        document.getElementById(button).value = 'on';
        document.getElementById(button).className = 'bitButtonOn';
        console.log('now on');
      }
    }

    document.getElementById("notButton").onclick = function(){ toggle('notButton');}
    document.getElementById("nanButton").onclick = function(){ toggle('nanButton');}
    document.getElementById("andButton").onclick = function(){ toggle('andButton');}
    document.getElementById("ornButton").onclick = function(){ toggle('ornButton');}
    document.getElementById("oroButton").onclick = function(){ toggle('oroButton');}
    document.getElementById("antButton").onclick = function(){ toggle('antButton');}
    document.getElementById("norButton").onclick = function(){ toggle('norButton');}
    document.getElementById("xorButton").onclick = function(){ toggle('xorButton');}
    document.getElementById("equButton").onclick = function(){ toggle('equButton');}

    //
    // *************************************************************** */
    // ******* Population Setup Buttons from 'Setup' subpage ********* */
    // *************************************************************** */
    gridWasCols = Number(document.getElementById("sizeCols").value);
    gridWasRows = Number(document.getElementById("sizeRows").value);
    function popSizeFn() {
      var NewCols = Number(document.getElementById("sizeCols").value);
      var NewRows = Number(document.getElementById("sizeRows").value);
      document.getElementById("sizeCells").innerHTML = "is a total of " + NewCols * NewRows + " cells";
      //Linear scale the positon for Ancestors added by hand; 
      for (var ii=0; ii<parents.handNdx.length; ii++) {
        //console.log('old cr', parents.col[parents.handNdx[ii]], parents.row[parents.handNdx[ii]]);
        parents.col[parents.handNdx[ii]] = Math.round(NewCols * parents.col[parents.handNdx[ii]] / gridWasCols);
        parents.row[parents.handNdx[ii]] = Math.round(NewRows * parents.row[parents.handNdx[ii]] / gridWasRows);
        parents.AvidaNdx[parents.handNdx[ii]] = parents.col[parents.handNdx[ii]] + NewCols * parents.row[parents.handNdx[ii]];
        //console.log('New cr', parents.col[parents.handNdx[ii]], parents.row[parents.handNdx[ii]]);
      }
      gridWasCols = Number(document.getElementById("sizeCols").value);
      gridWasRows = Number(document.getElementById("sizeRows").value);
      //reset zoom power to 1 
      ZoomSlide.set("value", 1);
      PlaceAncestors(parents);
    }

    dijit.byId("sizeCols").on("Change", popSizeFn);
    dijit.byId("sizeRows").on("Change", popSizeFn);

    $(function slidemute() {
      /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
      /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
      /* so I multiplied by 100,000 to get 100.000% to come out even. */
      //console.log("before defaultslide value");
      var muteSlideDefault = 109861.   /* results in 2% as a default */
      var muteDefault = (Math.pow(Math.E, (muteSlideDefault/100000))-1).toFixed(3)
      var slides = $( "#muteSlide" ).slider({
        // range: "min",   /*causes the left side of the scroll bar to be grey */
        value: muteSlideDefault,
        min: 0.0,
        max: 461512,
        slide: function( event, ui ) {
          //$( "#mRate" ).val( ui.value);  /*put slider value in the text above the slider */
          $( "#muteInput" ).val( (Math.pow(Math.E, (ui.value/100000))-1).toFixed(3));  /*put the value in the text box */
        }
      });
      /* initialize */
      //$( "#mRate" ).val( ($( "#muteSlide").slider( "value" )));  //used in testing nonlinear scale
      $( "#muteInput" ).val(muteDefault);
      /*update slide based on textbox */
      $( "#muteInput" ).change(function() {
        slides.slider( "value", 100000.0*Math.log(1+(parseFloat(this.value))) );
        $( "#mRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
        //console.log("in mute change");
      });
    });
       
    /* --------------------------------------------------------------- */
    /*                    Population Chart                             */
    /* --------------------------------------------------------------- */
    
    //need to get the next two values from real data. 
    //var popY = [1, 1, 1, 2, 2, 2, 4, 4, 4, 8,8,8,14,15,16,16,16,24,24,25,26,36,36,36,48,48]; /
    var popY = [];
    var ytitle = dijit.byId("yaxis").value;
    var popChart = new Chart("popChart");
    
    //use theme to change grid color based on tick color http://stackoverflow.com/questions/6461617/change-the-color-of-grid-plot-dojo
    //this required the use of a theme, but I'm no longer using the theme. Could take 'Wetland' out of require statemet as long a this is not used
    //var myTheme = Wetland; // Or any other theme
    //myTheme.axis.majorTick.color = "#CCC";  //grey
    //myTheme.axis.minorTick.color = "red";
    
    function popChartFn(){
      if ("Average Fitness" == dijit.byId("yaxis").value) {popY = ave_fitness;}
      else if ("Average Gestation Time" == dijit.byId("yaxis").value) {popY = ave_gestation_time;}
      else if ("Average Metabolic Rate" == dijit.byId("yaxis").value) {popY = ave_metabolic_rate;}
      else if ("Number of Organisms" == dijit.byId("yaxis").value) {popY = population_size;}
      //popChart.setTheme(myTheme);
      popChart.addPlot("default", {type: "Lines"});
      //popChart.addPlot("grid",{type:"Grid",hMinorLines:false});  //if color not specified it uses tick color.
      // grid info from https://dojotoolkit.org/reference-guide/1.10/dojox/charting.html
      popChart.addPlot("grid", {type:Grid, hMajorLines: true, majorHLine: {color: "#CCC", width: 1}, 
                                          vMajorLines: true, majorVLine: {color: "#CCC", width: 1}});

      popChart.addAxis("x", {fixLower: "major", fixUpper: "major",title:'Time (updates)', titleOrientation: 'away', titleGap: 2,
                             titleFont: "normal normal normal 8pt Arial", font: "normal normal normal 8pt Arial"});
      //popChart.addAxis("y", {vertical: true, title: ytitle, titleFont: "normal normal normal 8pt Arial", titleOrientation: 'axis',
      popChart.addAxis("y", {vertical: true, 
                    fixLower: "major", fixUpper: "major", min: 0, font: "normal normal normal 8pt Arial", titleGap: 4,});
      popChart.addSeries("Series y", popY, {stroke: {color:"blue", width: 2}});   
      popChart.resize(domGeometry.position(document.getElementById("popChartHolder")).w-10, 
                    domGeometry.position(document.getElementById("popChartHolder")).h-30);
      popChart.render();
    };
    popChartFn();
   
    //Set Y-axis title and choose the correct array to plot
    dijit.byId("yaxis").on("Change", function(){
      ytitle = dijit.byId("yaxis").value;
      //need to get correct array to plot from freezer
      popChartFn();
    });
    
    /* *************************************************************** */
    /* Organism page script *********************************************/
    /* *************************************************************** */
    /* **** Organism Setup Dialog */

    document.getElementById("OrgSetting").onclick = function(){
      OrganSetupDialog.show();
    }
    
    //process button to hide or show Organism detail panal. 
    var DetailsFlag = true;
    document.getElementById("OrgDetailsButton").onclick = function(){
      if (DetailsFlag) {
        DetailsFlag = false;
        dijit.byId("rightDetail").set("style", "display: none;");
        registry.byId("rightDetail").domNode.style.width = "1px";
        registry.byId("mainBC").layout();  
      }
      else {
        DetailsFlag = true;
        dijit.byId("rightDetail").set("style", "display: block; visibility: visible;");
        registry.byId("rightDetail").domNode.style.width = "180px";
        registry.byId("mainBC").layout();  
      }
    };

    $(function slideOrganism() {
      /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
      /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
      /* so I multiplied by 100,000 to get 100.000% to come out even. */
      //console.log("before defaultslide value");
      var muteSlideDefault = 109861.   /* results in 2% as a default */
      var muteDefault = (Math.pow(Math.E, (muteSlideDefault/100000))-1).toFixed(3)
      var slides = $( "#orMuteSlide" ).slider({
        // range: "min",   /*causes the left side of the scroll bar to be grey */
        value: muteSlideDefault,
        min: 0.0,
        max: 461512,
        slide: function( event, ui ) {
          //$( "#orMRate" ).val( ui.value);  /*put slider value in the text near slider */
          $( "#orMuteInput" ).val( (Math.pow(Math.E, (ui.value/100000))-1).toFixed(3) + "%");  /*put the value in the text box */
        }
      });
      /* initialize */
      //$( "#orMRate" ).val( ($( "#orMuteSlide").slider( "value" )));
      $( "#orMuteInput" ).val(muteDefault+"%");
      /*update slide based on textbox */
      $( "#orMuteInput" ).change(function() {
        slides.slider( "value", 100000.0*Math.log(1+(parseFloat(this.value))) );
        //$( "#orMRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
        //console.log("in mute change");
      });
    });

    // ****************************************************************
    //        Menu buttons that call for genome/Organism trace
    // ****************************************************************
      dijit.byId("mnOrganismTrace").on("Click", function(){ 
      //get name and genome for selected cell
      var SelectedName = 'selectedOrganism';  //replace this with data from Avida later
      // . . . need avida stuff first
      //Open Oranism view 
      mainBoxSwap("organismBlock"); 
      OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
      OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
      var height = ($("#rightDetail").innerHeight()-375)/2;
      document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height+"px";
      document.getElementById("ExecuteJust").style.width = "100%";  
      document.getElementById("ExecuteAbout").style.width = "100%";
      //and put organsim in place
      //clear out the old data
      var items = getAllItems(OrganCurrent);    //gets some data about the items in the container
      if (0<items.length){
        OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
        OrganCurrent.sync();   //should be done after insertion or deletion
      }
      OrganCurrent.insertNodes(false, [ {data: SelectedName,   type: ["organism"]}]);
      OrganCurrent.sync();

      //call organismTrace
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
    });

    //Put the offspring in the parent position on Organism Trace
      dijit.byId("mnOffspringTrace").on("Click", function(){ 
      //get name and genome for offspring cell
      var Name = 'offspring';  //replace this with data from Avida later
      // . . . need avida stuff first
      //Open Oranism view 
      mainBoxSwap("organismBlock"); 
      OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
      OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
      var height = ($("#rightDetail").innerHeight()-375)/2;
      document.getElementById("ExecuteJust").style.height = height+"px";  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById("ExecuteAbout").style.height = height+"px";
      document.getElementById("ExecuteJust").style.width = "100%";  
      document.getElementById("ExecuteAbout").style.width = "100%";
      //and put organsim in place
      //clear out the old data
      var items = getAllItems(OrganCurrent);    //gets some data about the items in the container
      if (0<items.length){
        OrganCurrent.selectAll().deleteSelectedNodes();  //clear items  
        OrganCurrent.sync();   //should be done after insertion or deletion
      }
      OrganCurrent.insertNodes(false, [ {data: Name,   type: ["organism"]}]);
      OrganCurrent.sync();

      //call organismTrace
      doOrgTrace();  //request new Organism Trace from Avida and draw that.
    });
    
    /* ****************************************************************/
    /*                  Canvas for Organsim (genome) view
    /* ************************************************************** */
    //initialize all canvases needed for Organism page
    var bufferCvs = document.getElementById("buffer");
    var bufferCtx = bufferCvs.getContext("2d");
    bufferCtx.translate(0.5, 0.5);
    var registerCvs = document.getElementById("register");
    var registerCtx = registerCvs.getContext("2d");
    registerCtx.translate(0.5, 0.5);
    var AstackCvs = document.getElementById("Astack");
    var AstackCtx = AstackCvs.getContext("2d");
    AstackCtx.translate(0.5, 0.5);
    var BstackCvs = document.getElementById("Bstack");
    var BstackCtx = BstackCvs.getContext("2d");
    BstackCtx.translate(0.5, 0.5);
    var outputCvs = document.getElementById("output");
    var outputCtx = outputCvs.getContext("2d");
    //outputCtx.imageSmoothingEnabled= false;
    var OrgCanvas = document.getElementById("organismCanvas");
    var ctx = OrgCanvas.getContext("2d");
    ctx.translate(0.5, 0.5);  //makes a crisper image  http://stackoverflow.com/questions/4261090/html5-canvas-and-anti-aliasing
    //initialize gen (genome) object. 
    var gen = {};
    gen.bigR = [120, 120]; //radius of full circle
    gen.size = [50, 50];
    gen.smallR = gen.bigR*2*Math.PI/(2*gen.size[0]); //radius of each small circle
    gen.tanR = gen.bigR[0]-gen.smallR;         //radius of circle tanget to inside of small circles
    gen.pathR = gen.bigR[0]-3*gen.smallR;      //radius of circle used to define reference point of arcs on path
    gen.headR = [gen.bigR[0]-2*gen.smallR,gen.bigR[1]-2*gen.smallR];      //radius of circle made by center of head positions.
    gen.cx = [150, 350];  //center of main circle x
    gen.cy = [150, 150];  //center of main circle y
    gen.fontsize = Math.round(1.8*gen.smallR);
    gen.rotate = [0, 0];  //used to rotate offspring 180 degrees when growing; otherwise no rotation.
    gen.dna = ["",""];
    gen.TimeLineHeight = 60;
    gen.imageXY = {x: 5, y: 5};

    function DrawTimeline(obj, cycle) {
      var startX, lineY, endX, length, cycles, upLabelY, dnLabelY, txtWide, dnTickX, dnNum;
      var tickLength = 10;
      var upLabelYoffset = 12;
      var dnLabelYoffset = 22;
      var upTickX = [];
      var upTickY = 5;
      var upNum = [];
      var upNdx = [];
      var dnTickY = 5;
      var dnTickSpaces = 24;
      var radius = 5;
      
      lineY = OrgCanvas.height - gen.TimeLineHeight/2;
      upTickY = lineY - tickLength;
      dnTickY = lineY + tickLength;
      upLabelY = lineY - upLabelYoffset;
      dnLabelY = lineY + dnLabelYoffset;      
      startX = 26;                //The number are fudge factors to account for the end of the slider
      endX = OrgCanvas.width-25;
      length = endX-startX; 
      cycles = obj.length-1;
      //go through all cycles comparing the current with the previous cycle 
      //Start with comparing cycle 1 to cycle 0 since there are no negative cycles. 
      for (var ii = 1; ii < obj.length; ii++){
        if (obj[ii-1].Functions.not < obj[ii].Functions.not) {upNum.push("0"); upNdx.push(ii);}
        if (obj[ii-1].Functions.nand < obj[ii].Functions.nand) {upNum.push("1"); upNdx.push(ii);}
        if (obj[ii-1].Functions.and < obj[ii].Functions.and) {upNum.push("2"); upNdx.push(ii);}
        if (obj[ii-1].Functions.orn < obj[ii].Functions.orn) {upNum.push("3"); upNdx.push(ii);}
        if (obj[ii-1].Functions.or < obj[ii].Functions.or) {upNum.push("4"); upNdx.push(ii);}
        if (obj[ii-1].Functions.andn < obj[ii].Functions.andn) {upNum.push("5"); upNdx.push(ii);}
        if (obj[ii-1].Functions.nor < obj[ii].Functions.nor) {upNum.push("6"); upNdx.push(ii);}
        if (obj[ii-1].Functions.xor < obj[ii].Functions.xor) {upNum.push("7"); upNdx.push(ii);}
        if (obj[ii-1].Functions.equ < obj[ii].Functions.equ) {upNum.push("8"); upNdx.push(ii);}
      }
      //Draw horizontal line
      ctx.lineWidth = 1; 
      ctx.strokeStyle = dictColor["Black"];
      ctx.beginPath();
      ctx.moveTo(startX,lineY);
      ctx.lineTo(endX,lineY);
      ctx.stroke();
      //Draw upTicks for indicating when logic functions complete
      ctx.font = "12px Arial";
      ctx.fillStyle = dictColor["Black"];
      for (var ii=0; ii<upNum.length; ii++) {
        upTickX[ii] = startX + length*upNdx[ii]/cycles;
        ctx.moveTo(upTickX[ii], lineY);
        ctx.lineTo(upTickX[ii], upTickY);
        ctx.stroke();
        txtWide = ctx.measureText(upNum[ii]).width;     
        ctx.fillText(upNum[ii],upTickX[ii]-txtWide/2, upLabelY);
      }
      //Draw downTicks for indicating cycles on the time line. 
      for (var ii = 0; ii <= dnTickSpaces; ii++){
        dnTickX = startX + ii*length/dnTickSpaces;
        dnNum = Math.round(ii * cycles/ dnTickSpaces);
        ctx.moveTo(dnTickX, lineY);
        ctx.lineTo(dnTickX, dnTickY);
        ctx.stroke();
        if (0==Math.fmod(ii,4)) {
          txtWide = ctx.measureText(dnNum).width;     
          ctx.fillText(dnNum,dnTickX-txtWide/2, dnLabelY);
        }
      }
      //Draw red circle indicating current cycle
      ctx.beginPath();
      dnTickX = startX + cycle*length/cycles;
      ctx.fillStyle = dictColor["Red"];
      ctx.arc(dnTickX, lineY, radius, 0, 2*Math.PI);
      ctx.fill();
    }

    function drawBitStr (context, row, bitStr) {
      var recWidth = 5;   //The width of the rectangle, in pixels
      var recHeight = 5;  //The height of the rectangle, in pixels
      var xx; //The x-coordinate of the upper-left corner of the rectangle
      var yy = row*recHeight;    //upper-left corner of rectangle
      var str = "1";
      var color; 
      for (var ii = 0; ii < bitStr.length; ii++){
        xx = ii*(recWidth);
        //draw outline of rectangle
        context.beginPath();
        context.lineWidth = 1;
        context.strokeStyle = orgColorCodes["outline"];
        context.rect(xx, yy, recWidth, recHeight);
        context.stroke();
        //fill in rectangle
        context.beginPath();
        str = bitStr.substr(ii,1);
        if ("0" == str) {context.fillStyle = orgColorCodes["0"];}
        else {context.fillStyle = orgColorCodes["1"];}
        context.fillRect(xx, yy, recWidth, recHeight);
        context.fill();
        //draw black lines every so many bits
        if (0 == Math.fmod(ii,4)) {
          context.beginPath();
          context.lineWidth = 1;
          context.strokeStyle = dictColor["Black"];
          context.moveTo(xx,yy);
          context.lineTo(xx,yy+recHeight);
          context.stroke();
        }
        //console.log("fs=", context.fillStyle, "; xx=", xx, "; yy=", yy, "; w=", recWidth, "; h=", recHeight, 
        //            "; bitStr=",str, "; out=",context.strokeStyle);
      }
    }

    function genomeCircle(gen, gg, obj, cycle){ //gg is generation
      var SmallCenterX, SmallCenterY;  //center of small circle
      var txtW;      // width of txt
      //var tickR;        //mutation tick mark: radius used to find position for tick Mark
      //var tickX, tickY  //mutation tick mark: position of inner tick mark
      //var tanX, tanY    //mutation tick mark: position of end of tick mark tangent to instruction circle.
      for (var ii = 0; ii < gen.dna[gg].length; ii++){
        SmallCenterX = gen.cx[gg] + gen.bigR[gg]*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        SmallCenterY = gen.cy[gg] + gen.bigR[gg]*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
        ctx.beginPath();
        ctx.arc(SmallCenterX, SmallCenterY, gen.smallR, 0, 2*Math.PI);
        //Assign color based on letter code of instruction
          //ctx.fillStyle = letterColor[gen.dna[gg].substr(ii,1)];  //use if gen.dna is a string
        ctx.fillStyle = letterColor[gen.dna[gg][ii]];  //use if gen.dna is an array
        ctx.fill();   //required to render fill
        //Draw ring if there was a mutation in the offspring
        if (undefined != obj[cycle].MemSpace[1]) {
          if (1==gg && obj[cycle].MemSpace[1].Mutated[ii]) {
            ctx.strokeStyle = orgColorCodes["mutate"];
            ctx.lineWidth = 3;
            ctx.arc(SmallCenterX, SmallCenterY, gen.SmallR, 0, 2*Math.PI);
            ctx.stroke();
            //Draw tick mark to interior of circle for mutated instruction
            //tickR = gen.bigR[gg]-3*gen.smallR;
            //tickX = gen.cx[gg] + tickR*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //tickY = gen.cy[gg] + tickR*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //tickR = gen.bigR[gg]-gen.smallR;
            //tanX = gen.cx[gg] + tickR*Math.cos(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //tanY = gen.cy[gg] + tickR*Math.sin(ii*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
            //ctx.beginPath();
            //ctx.moveTo(tickX, tickY);
            //ctx.lineTo(tanX, tanY);
            //ctx.stroke();
          }
        }
        //Draw letter inside circle
        ctx.fillStyle = dictColor["Black"];
        ctx.font = gen.fontsize+"px Arial";
          //txtW = ctx.measureText(gen.dna[gg].substr(ii,1)).width;  //use if gen.dna is a string
        txtW = ctx.measureText(gen.dna[gg][ii]).width;     //use if gen.dna is an array
          //ctx.fillText(gen.dna[gg].substr(ii,1),SmallCenterX-txtW/2, SmallCenterY+gen.smallR/2);  //use if gen.dna is a string
        ctx.fillText(gen.dna[gg][ii],SmallCenterX-txtW/2, SmallCenterY+gen.smallR/2);
      }
      //Draw center of circle to test max arc height - should not go past center of circle
      //ctx.arc(gen.cx[gg], gen.cy[gg], gen.smallR/4, 0, 2*Math.PI);
      //ctx.fill();
    }
    
    function drawHead(gen, spot, gg, head) {
      var hx, hy; //center of head and used as center of ring
      var txtW;  // width of txt
      //draw circumference around instruction that the head points to. 
      hx = gen.cx[gg] + gen.bigR[gg]*Math.cos(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      hy = gen.cy[gg] + gen.bigR[gg]*Math.sin(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      ctx.beginPath();
      ctx.arc(hx, hy, gen.smallR, 0, 2*Math.PI);
      ctx.strokeStyle = orgColorCodes[head];
      ctx.lineWidth = 2;
      ctx.stroke();
      //draw head tangent to instruction
      hx = gen.cx[gg] + gen.headR[gg]*Math.cos(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      hy = gen.cy[gg] + gen.headR[gg]*Math.sin(spot*2*Math.PI/gen.size[gg]+gen.rotate[gg]);
      ctx.beginPath();
      ctx.arc(hx, hy, gen.smallR, 0, 2*Math.PI);
      ctx.fillStyle = orgColorCodes["headFill"];
      ctx.fill();
      ctx.fillStyle = orgColorCodes[head];
      ctx.font = gen.fontsize+"px Arial";
      txtW = ctx.measureText(headCodes[head]).width;
      ctx.fillText(headCodes[head],hx-txtW/2, hy+gen.smallR/2); 
    }

    //Draw arc using Bézier curve and two control points http://www.w3schools.com/tags/canvas_beziercurveto.asp
    function drawArc2(gen, spot1, spot2, rep){ //draw an arc
      var xx1, yy1, xx2, yy2, xc1, yc1, xc2, yc2; 
      ctx.lineWidth = 1;
      if (spot2 >= spot1) {
        ctx.strokeStyle = dictColor["Black"];  //set the line to a color which can also be a gradient see http://www.w3schools.com/canvas/canvas_clock_face.asp
      } else { ctx.strokeStyle = dictColor["Red"];}
      ctx.beginPath();
      xx1 = gen.cx[0] + gen.tanR*Math.cos(spot1*2*Math.PI/gen.size[0]); //Draw line from Spot1
      yy1 = gen.cy[0] + gen.tanR*Math.sin(spot1*2*Math.PI/gen.size[0]);  
      ctx.moveTo(xx1, yy1);
      xx2 = gen.cx[0] + gen.tanR*Math.cos(spot2*2*Math.PI/gen.size[0]); //Draw line to Spot2
      yy2 = gen.cy[0] + gen.tanR*Math.sin(spot2*2*Math.PI/gen.size[0]);  
      //Set Control points on same radial as the spots
      gen.pathR = gen.bigR[0]-2*gen.smallR-rep*gen.bigR[0]/gen.size[0];
      //gen.pathR = gen.bigR[0]-(2+rep/3)*gen.smallR;
      xc1 = gen.cx[0] + gen.pathR*Math.cos(spot1*2*Math.PI/gen.size[0]);  
      yc1 = gen.cy[0] + gen.pathR*Math.sin(spot1*2*Math.PI/gen.size[0]);
      xc2 = gen.cx[0] + gen.pathR*Math.cos(spot2*2*Math.PI/gen.size[0]);  
      yc2 = gen.cy[0] + gen.pathR*Math.sin(spot2*2*Math.PI/gen.size[0]);
      //console.log(xc1, yc1, xc2, yc2, xx2, yy2);
      ctx.bezierCurveTo(xc1, yc1, xc2, yc2, xx2, yy2);
      ctx.stroke();
    }

    //Draw offspring Icon once cell divides  from http://stackoverflow.com/questions/8977369/drawing-png-to-a-canvas-element-not-showing-transparency
    function drawIcon(gen) {
      var txt = "Offspring Genome"; 
      var drw = new Image();
      drw.src = "avida-ed-ancestor-icon.png";
      drw.onload = function () {   //image size(width, height) from http://stackoverflow.com/questions/5173796/html5-get-image-dimension
        ctx.drawImage(drw, gen.cx[1]-drw.width/2, gen.cy[1]-drw.height/2);
      }
      ctx.fillStyle = dictColor["black"];
      ctx.font = gen.fontsize+"px Arial";
      var txtWd = ctx.measureText(txt).width;
      ctx.fillText(txt, gen.cx[1]-txtWd/2, gen.cy[1]+drw.height);       
    }
    
    //*****************************************************************/
    //main function to update the Organism Trace on the Organism Page
    function updateOrgTrace(obj, cycle){
      //set canvas size
      OrgCanvas.width = $("#organismCanvasHolder").innerWidth()-6;
      OrgCanvas.height = $("#organismCanvasHolder").innerHeight()-6;
      //Find size and content of each genome. 
      for (var ii=0; ii < obj[cycle].MemSpace.length; ii++) {
        gen.dna[ii] = obj[cycle].MemSpace[ii].Memory;
        gen.size[ii] = obj[cycle].MemSpace[ii].Memory.length;
      }
      //Draw Timeline
      DrawTimeline(obj, cycle);
      //Find radius and center of big circle for each genome
      if (OrgCanvas.height < .55*(OrgCanvas.width-gen.TimeLineHeight)) {
        gen.bigR[0] = Math.round(0.45*(OrgCanvas.height-gen.TimeLineHeight)) }//set size based on height
      else {
        gen.bigR[0] = Math.round(0.2*OrgCanvas.width) //set size based on width
      }
      gen.cx[0] = OrgCanvas.width/2 - 1.2*gen.bigR[0];        //center of 1st (parent) circle x
      gen.cy[0] = (OrgCanvas.height-gen.TimeLineHeight)/2;  //center of 1st (parent) circle y
      // Draw parent (Mom) genome in a circle---------------------------------------- 
      gen.smallR = gen.bigR[0]*2*Math.PI/(2*gen.size[0]); //radius of each small circle
      gen.tanR = gen.bigR[0]-gen.smallR;         //radius of circle tanget to inside of small circles
      gen.pathR = gen.bigR[0]-3*gen.smallR;      //radius of circle used to define reference point of arcs on path
      gen.headR[0] = gen.bigR[0]-2*gen.smallR;      //radius of circle made by center of head positions.
      gen.fontsize = Math.round(1.8*gen.smallR);
      genomeCircle(gen, 0, obj, cycle);
      // Draw child (Son) genome in a circle ---------
      if (1 < obj[cycle].MemSpace.length) {
        gen.bigR[1] = gen.smallR*2*gen.size[1]/(2*Math.PI);
        gen.bigR[1] = gen.bigR[1]+gen.bigR[1]/gen.size[1];
        gen.cy[1] = gen.cy[0];
        gen.headR[1] = gen.bigR[1]-2*gen.smallR;      //radius of circle made by center of head positions.
        if (obj[cycle].DidDivide) {
          gen.cx[1] = OrgCanvas.width/2 + 1.1*gen.bigR[1];
          gen.rotate[1] = 0;
          drawIcon(gen);
          //there is an offspring, so it can be saved in the freezer or fed back into Organism viewer
          dijit.byId("mnFzOffspring").attr("disabled", false);
          dijit.byId("mnOffspringTrace").attr("disabled", false);
        }
        else {
          gen.cx[1] = gen.cx[0] + gen.bigR[0] + 2*gen.smallR + gen.bigR[1];
          gen.rotate[1] = Math.PI;            //offspring rotated 180 degrees when still growing.
          //no organism, so menu item is disabled 
          dijit.byId("mnFzOffspring").attr("disabled", true);
          dijit.byId("mnOffspringTrace").attr("disabled", true);
          //console.log("xy", gen.cx[1], gen.cy[1], " size", gen.size[0]);
        }
        genomeCircle(gen, 1, obj, cycle);
      }
      //Draw path of acrs
      //drawArc2(gen, spot1, spot2, rep)
      for (var ii = 0; ii<obj[cycle].Jumps.length; ii++) {
        drawArc2(gen,  obj[cycle].Jumps[ii].FromIDX,  obj[cycle].Jumps[ii].ToIDX, obj[cycle].Jumps[ii].Freq);
      }
      //drawHead(gen, spot, generation, head) // draws the various heads for parent (Mom)
      for (var ii=0; ii < obj[cycle].MemSpace.length; ii++) {
        if (undefined != obj[cycle].MemSpace[ii].Heads.READ) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.READ, ii, "READ");}
        if (undefined != obj[cycle].MemSpace[ii].Heads.WRITE) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.WRITE, ii, "WRITE");}
        if (undefined != obj[cycle].MemSpace[ii].Heads.FLOW) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.FLOW, ii, "FLOW");}
        if (undefined != obj[cycle].MemSpace[ii].Heads.IP) 
          {drawHead(gen, obj[cycle].MemSpace[ii].Heads.IP, ii, "IP");}
      }
      //Draw Buffers ---------------------------------------------------
      //drawBitStr (name, row, bitStr);
      for (var ii = 0; ii < obj[cycle].Buffers.input.length; ii++){
        drawBitStr (bufferCtx, ii, obj[cycle].Buffers.input[ii]);
      }
      drawBitStr (registerCtx, 0, obj[cycle].Registers['AX']);
      drawBitStr (registerCtx, 1, obj[cycle].Registers['BX']);
      drawBitStr (registerCtx, 2, obj[cycle].Registers['CX']);
      //console.log("A", obj[cycle].Buffers);
      for (var ii = 0; ii<2; ii++){ //only showing the top 2 in the stack of 10
        //console.log(ii, obj[cycle].Buffers["stack A"][ii]);
        drawBitStr (AstackCtx, ii, obj[cycle].Buffers["stack A"][ii]);
        }
      for (var ii = 0; ii<2; ii++){ //only showing the top 2 in the stack of 10
        drawBitStr (BstackCtx, ii, obj[cycle].Buffers["stack B"][ii]);
      }
      drawBitStr (outputCtx, 0, obj[cycle].Buffers.output[0]);
      // update details 
      updateTimesPerformed(obj, cycle);   //Update Times Functions are performed. 
      writeInstructDetails(obj, cycle);   //Write Instruction Details
      //context.clearRect(0, 0, canvas.width, canvas.height); //to clear canvas see http://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
    }

    function updateTimesPerformed(obj, cycle){
      document.getElementById("notPerf").textContent = obj[cycle].Functions.not;
      document.getElementById("nanPerf").textContent = obj[cycle].Functions.nand;
      document.getElementById("andPerf").textContent = obj[cycle].Functions.and;
      document.getElementById("ornPerf").textContent = obj[cycle].Functions.orn;
      document.getElementById("oroPerf").textContent = obj[cycle].Functions.or;
      document.getElementById("antPerf").textContent = obj[cycle].Functions.andn;
      document.getElementById("norPerf").textContent = obj[cycle].Functions.nor;
      document.getElementById("xorPerf").textContent = obj[cycle].Functions.xor;
      document.getElementById("equPerf").textContent = obj[cycle].Functions.equ;
      if (0 < obj[cycle].Functions.not) {document.getElementById("notOrg").textContent="0 not+";}
      else {document.getElementById("notOrg").textContent="0 not-";}
      if (0 < obj[cycle].Functions.nand) {document.getElementById("nanOrg").textContent="1 nan+";}
      else {document.getElementById("nanOrg").textContent="1 nan-";}
      if (0 < obj[cycle].Functions.and) {document.getElementById("andOrg").textContent="2 and+";}
      else {document.getElementById("andOrg").textContent="2 and-";}
      if (0 < obj[cycle].Functions.orn) {document.getElementById("ornOrg").textContent="3 orn+";}
      else {document.getElementById("ornOrg").textContent="3 orn-";}
      if (0 < obj[cycle].Functions.or) {document.getElementById("oroOrg").textContent="4 oro+";}
      else {document.getElementById("oroOrg").textContent="4 oro-";}
      if (0 < obj[cycle].Functions.andn) {document.getElementById("antOrg").textContent="5 ant+";}
      else {document.getElementById("antOrg").textContent="5 ant-";}
      if (0 < obj[cycle].Functions.nor) {document.getElementById("norOrg").textContent="6 nor+";}
      else {document.getElementById("norOrg").textContent="6 nor-";}
      if (0 < obj[cycle].Functions.xor) {document.getElementById("xorOrg").textContent="7 xor+";}
      else {document.getElementById("xorOrg").textContent="7 xor-";}
      if (0 < obj[cycle].Functions.equ) {document.getElementById("equOrg").textContent="8 equ+";}
      else {document.getElementById("equOrg").textContent="8 equ-";}
    }
    
    function writeInstructDetails(obj, cycle) {
      var letter;
      var IPspot = obj[cycle].MemSpace[0].Heads.IP
      if (undefined == obj[cycle-1]) {
        document.getElementById("ExecuteJust").textContent = "(none)"; 
      }
      else {
        letter = obj[cycle-1].NextInstruction;
        document.getElementById("ExecuteJust").textContent = letter + ": " + InstDescribe[letter];
        //console.log("Inst", InstDescribe[letter]);
      }
      if (undefined == obj[cycle].MemSpace[0].Memory[IPspot]) {
        document.getElementById("ExecuteAbout").textContent = "(none)";
      }
      else {
        letter = obj[cycle].MemSpace[0].Memory[IPspot];
        document.getElementById("ExecuteAbout").textContent = letter + ": " + InstDescribe[letter];
      }
      //console.log('spot=', IPspot, ' letter=', letter, " Instr=", InstDescribe[letter]);
    }

    /* ****************************************************************/
    /*             End of Canvas to draw genome and update details
    /* ************************************************************** */

    /* **** Controls bottum of organism page **************************/
    var update_timer = null;

    function outputUpdate(vol) {
      document.querySelector('#orgCycle').value = vol;
    }

    dijit.byId("orgBack").on("Click", function() {
      var ii = Number(document.getElementById("orgCycle").value);
      if (cycleSlider.get("minimum") < cycleSlider.get("value")) {
        ii--;
        dijit.byId("orgCycle").set("value", ii);
        cycle = ii;
        updateOrgTrace(traceObj, cycle)
      }
    });

    dijit.byId("orgForward").on("Click", function() {
      var ii = Number(document.getElementById("orgCycle").value);
      if (cycleSlider.get("maximum") > cycleSlider.get("value")) {
        ii++;
        dijit.byId("orgCycle").set("value", ii);
        cycle = ii;
        updateOrgTrace(traceObj, cycle)
      }
    });

    dijit.byId("orgReset").on("Click", function(){
      dijit.byId("orgCycle").set("value", 0);
      cycle = 0;
      updateOrgTrace(traceObj, cycle);
      orgStopFn()
    });
    
    function orgStopFn() {
      if (update_timer){ clearInterval(update_timer);}
      dijit.byId("orgRun").set("label", "Run");
    }
    
    function orgRunFn(){
      if (cycleSlider.get("maximum") > cycleSlider.get("value")) {
        cycle++;
        dijit.byId("orgCycle").set("value", cycle);
        updateOrgTrace(traceObj, cycle);
      }
      else {orgStopFn();}
    }
    dijit.byId("orgRun").on("Click", function(){
      if ("Run" == dijit.byId("orgRun").get("label")) {
        dijit.byId("orgRun").set("label", "Stop");
        update_timer = setInterval(orgRunFn, 100);
      }
      else { orgStopFn();
      }
    });

    dijit.byId("orgEnd").on("Click", function() {
      dijit.byId("orgCycle").set("value", cycleSlider.get("maximum"));
      cycle = cycleSlider.get("maximum");
      updateOrgTrace(traceObj, cycle);
      orgStopFn()
    });

    dijit.byId("orgCycle").on("Change", function(value){
      cycleSlider.set("value",value);
      cycle = value;
      //console.log('orgCycle.change');
      updateOrgTrace(traceObj, cycle);
    });

    /* Organism Gestation Length Slider */
    var cycleSlider = new HorizontalSlider({
        name: "cycleSlider",
        value: 0,
        minimum: 0,
        maximum: 200,
        intermediateChanges: true,
        discreteValues:201,
        style: "width:100%;",
        onChange: function(value){
            document.getElementById("orgCycle").value = value;
            cycle = value;
            //console.log('cycleSlider');
            updateOrgTrace(traceObj, cycle);
        }
    }, "cycleSlider");

    /* ****************************************************************/
    /* Analysis Page **************************************************/
    /* ****************************************************************/
    var dictPlota = {};
    var dictPlotb = {};
    dictPlota["@example"] = [1, 2, 1, 2, 2, 3,   2, 3, 3,    4];
    dictPlota["m2w30u1000not"] = [0.6, 1.8, 2, 2, 2.4, 2.7, 3];
    dictPlota["m2w30u1000nand"] = [1, 1, 1.5, 2, 3, 3, 4, 4, 4.5];
    dictPlotb["@example"] = [60, 50, 50, 40, 40, 37, 30, 20, 15, 7];
    dictPlotb["m2w30u1000not"] = [70,   68, 60, 50, 50,   47, 40];
    dictPlotb["m2w30u1000nand"] = [80, 70, 75, 60, 50, 50, 40, 40, 30];
    dictPlota["newPopulation"] = [0.5,  1,  2, 1.7,  2, 2.7, 3.2, 3.2];
    dictPlotb["newPopulation"] = [ 65, 50, 50,  47, 40,  37,  32, 22];
    var pop1a = [];
    var pop1b = [];
    var pop2a = [];
    var pop2b = [];
    var pop3a = [];
    var pop3b = [];
    var color1 = dictColor[dijit.byId("pop1color").value];
    var color2 = dictColor[dijit.byId("pop2color").value];
    var color3 = dictColor[dijit.byId("pop3color").value]; 
    var y1title = "Average Fitness";
    var y2title = 'Average Gestation Time'        
    var anaChart = new Chart("analyzeChart");

    function AnaChartFn(){
      anaChart.addPlot("default", {type: "Lines", hAxis:"x", vAxis:"y"});
      anaChart.addPlot("other", {type: "Lines", hAxis: "x", vAxis: "right y"});
      //grid line info on https://dojotoolkit.org/reference-guide/1.10/dojox/charting.html
      anaChart.addPlot("grid", {type:Grid, hMajorLines: true, majorHLine: {color: "#CCC", width: 1}, 
                                          vMajorLines: true, majorVLine: {color: "#CCC", width: 1}});
      anaChart.addAxis("x", {fixLower: "major", fixUpper: "major",title:'Time (updates)', titleOrientation: 'away'});
      anaChart.addAxis("y", {vertical: true, fixLower: "major", title: y1title, titleOrientation: 'axis',fixUpper: "major", min: 0});
      //anaChart.addAxis("top x", {leftBottom: false});
      anaChart.addAxis("right y", {vertical: true, leftBottom: false, min: 0, title:y2title});
      anaChart.addSeries("Series 1a", pop1a, {stroke: {color:color1, width: 2}});   
      anaChart.addSeries("Series 2a", pop2a, {stroke: {color:color2, width: 2}});
      anaChart.addSeries("Series 3a", pop3a, {stroke: {color:color3, width: 2}});
      anaChart.addSeries("Series 1b", pop1b, {plot: "other", stroke: {color:color1, width: .3}});
      anaChart.addSeries("Series 2b", pop2b, {plot: "other", stroke: {color:color2, width: .3}});
      anaChart.addSeries("Series 3b", pop3b, {plot: "other", stroke: {color:color3, width: .3}});
      
      anaChart.resize(domGeometry.position(document.getElementById("chartHolder")).w-10, 
                    domGeometry.position(document.getElementById("chartHolder")).h-15);
      var dZoom = new MouseZoomAndPan(anaChart, "default");
            //https://www.sitepen.com/blog/2012/11/09/dojo-charting-zooming-scrolling-and-panning/  a different zoom method using a window.
      anaChart.render();
    };
    
    /* Chart buttons ****************************************/
    document.getElementById("pop1delete").onclick = function(){ 
      graphPop1.selectAll().deleteSelectedNodes();
      pop1a = [];
      pop1b = [];
      AnaChartFn();
    }
    document.getElementById("pop2delete").onclick = function(){ 
      pop2a = [];
      pop2b = [];
      AnaChartFn();
      graphPop2.selectAll().deleteSelectedNodes();
    }
    document.getElementById("pop3delete").onclick = function(){ 
      pop3a = [];
      pop3b = [];
      AnaChartFn();
      graphPop3.selectAll().deleteSelectedNodes();
    }
    dijit.byId("pop1color").on("Change", function(){
      color1 = dictColor[dijit.byId("pop1color").value];
      AnaChartFn();
    });
    dijit.byId("pop2color").on("Change", function(){
      color2 = dictColor[dijit.byId("pop2color").value];
      AnaChartFn();
    });
    dijit.byId("pop3color").on("Change", function(){
      color3 = dictColor[dijit.byId("pop3color").value];
      AnaChartFn();
    });
    
    //Set Y-axis title and choose the correct array to plot
    dijit.byId("y1select").on("Change", function(){
      y1title = dijit.byId("y1select").value;
      //need to get correct array to plot from freezer
      AnaChartFn();
    });

    dijit.byId("y2select").on("Change", function(){
      y2title = dijit.byId("y2select").value;
      //need to get correct array to plot from freezer
      AnaChartFn();
    });
    
    //************************************************************************
    //Tasks that Need to be run when page is loaded but after chart is defined
    //************************************************************************
    
    DrawGridSetup(); //Draw initial background
        
    //Eliminate scrollbars (we hope
    
    //used to set the height so the data just fits. Done because different monitor/brower combinations require a diffent height in pixels.
    //may need to take out as requires loading twice now.
    function removeScrollbar(scrollDiv, htChangeDiv, page) {
      https://tylercipriani.com/2014/07/12/crossbrowser-javascript-scrollbar-detection.html
      //if the two heights are different then there is a scroll bar 
      var ScrollDif = document.getElementById(scrollDiv).scrollHeight - document.getElementById(scrollDiv).clientHeight;
      var hasScrollbar = 0 < ScrollDif;
      //console.log(scrollDiv, hasScrollbar, document.getElementById(scrollDiv).scrollHeight, 
      //  document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
      //  document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);
      
      var divHt = document.getElementById(htChangeDiv).style.height.match(/\d/g);  //get 0-9 globally in the string  //http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
      divHt = divHt.join(''); //converts array to string
      var NewHt = Number(divHt)+1+ScrollDif;  //add the ht difference to the outer div that holds this one
      //line below is where the height of the div actually changes
      document.getElementById(htChangeDiv).style.height = NewHt + 'px';
      
      //redraw the screen
      mainBoxSwap(page);
      //console.log('Afterscroll', hasScrollbar, document.getElementById(scrollDiv).scrollHeight, 
      //  document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=',document.getElementById(htChangeDiv).scrollHeight,
      //  document.getElementById(htChangeDiv).offsetHeight , document.getElementById(htChangeDiv).style.height);
    }
    
    removeScrollbar('selectOrganPane', 'popTopRight', 'populationBlock');
    removeScrollbar('popStatistics', 'popTopRight', 'populationBlock');

    //************************************************************************
    //Usefull Generic Functions
    //************************************************************************
    
    //Modulo that is more accurate than %; Math.fmod(aa, bb);
    Math.fmod = function (aa, bb) { return Number((aa - (Math.floor(aa/bb) * bb)).toPrecision(8));}
    
    //http://nelsonwells.net/2011/10/swap-object-key-and-values-in-javascript/
    var invertHash = function (obj) {
      var new_obj = {};
      for (var prop in obj) {
        if(obj.hasOwnProperty(prop)) {
          new_obj[obj[prop]] = prop;
        }
      }
      return new_obj;
    };
    
    //************************************************************************
    //Functions not in use, but might be usefull; could be deleted -----------
    //************************************************************************

    var hexColor = invertHash(dictColor);
    var theColor = hexColor["#000000"];  //This should get 'Black'
    //console.log("theColor=", theColor);

    //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
    //var orderedDataItems = source.getAllNodes().map(function(node){
    //    return source.getItem(node.id).data;
    //});
    
    // from http://dojotoolkit.org/reference-guide/1.10/dojo/dnd.html
    function OrderedItem(container, f, o){
      // similar to:
      // container.forInItems(f, o);
      // but iterates in the listed order
      o = o || dojo.global;
      container.getAllNodes().forEach(function(node){
        var id = node.id;
        f.call(o, container.getItem(id), id, container);
      });
    }

    //sigmoid for use in converting a floating point into hue, saturation, brightness
    function sigmoid (xx, midpoint, steepness) {
      var val = steepness * (xx-midpoint);
      return Math.exp(val) /(1.0 + Math.exp(val));
    }

    //Draw arc using quadraticCurve and 1 control point http://www.w3schools.com/tags/canvas_quadraticcurveto.asp
    function drawArc1(gen, spot1, spot2, rep){ 
      var xx1, yy1, xx2, yy2, xxc, yyc; 
      ctx.lineWidth = 1;
      if (0 < spot2 - spot1) {
        ctx.strokeStyle = dictColor["Black"];  //set the line to a color which can also be a gradient see http://www.w3schools.com/canvas/canvas_clock_face.asp
      } else { ctx.strokeStyle = dictColor["Red"];}
      ctx.beginPath();
      xx1 = gen.cx[0] + gen.tanR*Math.cos(spot1*2*Math.PI/gen.size[0]); //Draw line from Spot1
      yy1 = gen.cy[0] + gen.tanR*Math.sin(spot1*2*Math.PI/gen.size[0]);  
      ctx.moveTo(xx1, yy1);
      xx2 = gen.cx[0] + gen.tanR*Math.cos(spot2*2*Math.PI/gen.size[0]); //Draw line to Spot2
      yy2 = gen.cy[0] + gen.tanR*Math.sin(spot2*2*Math.PI/gen.size[0]);  
      //Set Control point on line perpendicular to line between Spot1 & spot2
      gen.pathR = gen.bigR-(2+rep)*gen.smallR;
      xxc = gen.cx[0] + gen.pathR*Math.cos(spot2*2*Math.PI/gen.size[0] + (spot1-spot2)*(Math.PI)/gen.size[0]);  
      yyc = gen.cy[0] + gen.pathR*Math.sin(spot2*2*Math.PI/gen.size[0] + (spot1-spot2)*(Math.PI)/gen.size[0]);
      ctx.quadraticCurveTo(xxc, yyc, xx2, yy2);
      ctx.stroke();
    }
    
    // does not work
    on(dom.byId("gridCanvas"),"drop", function(event){
      domGeometry.normalizeEvent(event);
      console.log("Not work xx ", event.pageX);
      console.log("NOt work yy ", event.pageY);
    })
    
    //Notes on things I learned writing this code, that is not directly used in the code
    //use FileMerge to compare to versions of the same file on a Mac
    //js fiddle of dragging image to cavans and dragging it around http://jsfiddle.net/XU2a3/41/

    //Use Meld to compare two folders worth of stuff. Evoke from a terminal prompt. Does not seem to be be in applications folder

    //http://dojo-toolkit.33424.n3.nabble.com/dojo-dnd-problems-selection-object-from-nodes-etc-td3753366.html
    //This is supposed to select a node; lists as selected programatically, but does not show up on screen.

    //A method to distinguish a mouse click from a mouse drag
    //http://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
    
    //A method to get the data items in a dojo DND container in order
    //freezeConfigure.on("DndDrop", function(source, nodes, copy, target){  //This triggers for every dnd drop, not just those of freezeConfigureNode
    //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
    //var orderedDataItems = freezeConfigure.getAllNodes().map(function(node){
    //  return freezeConfigure.getItem(node.id).data;
    //});
    //console.log("orderedDataItems", orderedDataItems); 

  });
