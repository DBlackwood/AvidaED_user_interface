define.amd.jQuery = true;
require([
  "dijit/dijit",
  "dojo/parser",
  "dojo/_base/declare",
  "maqetta/space",
  "maqetta/AppStates",
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
  "dojo/ready",
  "jquery",
  "jquery-ui",
  "dojo/domReady!"
  ], function(dijit, parser, declare, space, AppStates, BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu, 
              Button, TitlePane, dndSource, dndManager, dndSelector, Select,
              HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
              DropDownButton, ComboBox, Textarea, Chart, Default, Lines, ready, $, jqueryui){

    parser.parse();

    console.log("after parser");
    // main button scripts-------------------------------------------
    
    //The style display: none cannnot be used in the html durint the initial load as the dijits won't work right
    //visibility:hidden can be used, but it leave the white space and just does not display dijits. 
    //So all areas are loaded, then the mainBoxSwap is called to set display to none after the load on all but 
    //the default option.
    //mainBoxSwap("organismBlock");
    mainBoxSwap("populationBlock");
    dijit.byId("setupBlock").set("style", "display: none;");

    function mainBoxSwap(showBlock){
      //console.log("in mainBoxSwap");
      dijit.byId("populationBlock").set("style", "display: none;");
      dijit.byId("organismBlock").set("style", "display: none;");
      dijit.byId("analysisBlock").set("style", "display: none;");
      dijit.byId("testBlock").set("style", "display: none;");
      dijit.byId(showBlock).set("style", "display: block; visibility: visible;");
  };
  
    // Call general function
    document.getElementById("populationButton").onclick = function(){ mainBoxSwap("populationBlock"); }
    document.getElementById("organismButton").onclick = function(){ mainBoxSwap("organismBlock"); }
    document.getElementById("analysisButton").onclick = function(){ mainBoxSwap("analysisBlock"); }
    document.getElementById("testButton").onclick = function(){ mainBoxSwap("testBlock"); }

    /* Drag N Drop Freezer ****************************************************/
    
    dojo.declare("AcceptOneItemSource", dndSource, {
      checkAcceptance : function(source, nodes) {
        if (this.node.children.length >= 1) {
           return false;
        }
        return this.inherited(arguments);
      }
    });
      
    var freezeConfigure = new dndSource("freezeConfigureNode", {accept: ["conDish"], copyOnly: ["true"], singular: "true"});
    freezeConfigure.insertNodes(false, [
      { data: "@default",      type: ["conDish"]},
      { data: "s30m.2NandNot", type: ["conDish"]},
    ]);
    var freezeOrgan = new dndSource("freezeOrgansimNode", {accept: ["organism"], copyOnly: ["true"], singular: "true"});
    freezeOrgan.insertNodes(false, [
      { data: "@ancestor",      type: ["organism"]},
      { data: "m2u8000Nand",    type: ["organism"]},
      { data: "m2u8000Not",     type: ["organism"]}
    ]);
    var freezePopDish = new dndSource("freezePopDishNode", {accept: ["popDish"], copyOnly: ["true"], singular: "true"});
    freezePopDish.insertNodes(false, [
      { data: "example",       type: ["popDish"]},
      { data: "m2w30u1000nand", type: ["popDish"]},
      { data: "m2w30u1000not",  type: ["popDish"]}
    ]);
    var AncestorBox = new dndSource("AncestorBoxNode", {accept: ["organism"]});
    
    var trash = new dndSource("trashNode", {accept: ['conDish', 'organism', 'popDish'], singular: "true"});

    var ConfigCurrent = new dndSource("ConfigurationCurrent", {accept: ["conDish"], singular: "true"});
    
    var graphPop1 = new AcceptOneItemSource("pop1name", {accept: ["popDish"], singular: "true"});
    var graphPop2 = new AcceptOneItemSource("pop2name", {accept: ["popDish"], singular: "true"});
    var graphPop3 = new AcceptOneItemSource("pop3name", {accept: ["popDish"], singular: "true"});
    console.log("after create graphPopulations");

    freezeConfigure.on("MouseMove", function(evt){
       //console.log({"x": evt.layerX, "y": evt.layerY}); 
    });
    
    freezeOrgan.on("DndDrop", function(source, nodes, copy, target){
      //console.log("Source: ", source);
      //console.log("Nodes: ", nodes);
      //console.log("Copy: ", copy);
      //console.log("Target: ", target);
      //console.log("id: ", target.node.id);
      // Asks for a name for any object dragged to the freezer. Need to check for duplicate names.
      // Does not change "data" value, only textContent changes.
      if (target.node.id=="freezeConfigureNode"){
        var dishCon = prompt("Please name your dish configuration", "George");
        nodes[0].textContent=dishCon;
      }
      if (target.node.id=="freezeOrgansimNode"){
        var avidian = prompt("Please name your avidian", nodes[0].textContent);
        console.log("map: ", target.map);
        nodes[0].textContent=avidian;
        nodes[0].data=dishCon;
        console.log("data: ", nodes[0].data);
      }
      if (target.node.id=="freezePopDishNode"){
        var popDish = prompt("Please name your populated dish", "Fred");
        nodes[0].textContent=popDish;
      }
      if (target.node.id=="ConfigurationCurrent"){
        console.log("children=",target.node.children);
        dojo.empty(target.node.children);
        var list = this.getAllNodes();
        return list.length < 1
      }
      if (target.node.id=="pop1name"){
        console.log("textContent: ", nodes[0].textContent);
        //console.log("nodes[0].id: ", nodes[0].id);
        //console.log("target.selection: ",target.selection);
        //console.log("allnodes: ",target.getAllNodes());
        //console.log("source.getItem(nodes[0].id)=",source.getItem(nodes[0].id));
        pop1a = dictPlota[nodes[0].textContent];
        pop1b = dictPlotb[nodes[0].textContent];
        AnaChart();
      }
      if (target.node.id=="pop2name"){
        console.log("textContent: ", nodes[0].textContent);
        pop2a = dictPlota[nodes[0].textContent];
        pop2b = dictPlotb[nodes[0].textContent];
        AnaChart();
      }
      if (target.node.id=="pop3name"){
        console.log("textContent: ", nodes[0].textContent);
        pop3a = dictPlota[nodes[0].textContent];
        pop3b = dictPlotb[nodes[0].textContent];
        AnaChart();
      }
    });



      /* Population page script ***************************************/

    function popBoxSwap(){
      if ("Map"== document.getElementById("PopSetupButton").innerHTML ) {
        dijit.byId("mapBlock").set("style", "display: block;");
        dijit.byId("setupBlock").set("style", "display: none;");
        document.getElementById("PopSetupButton").innerHTML = "Setup";
      } else {
        document.getElementById("PopSetupButton").innerHTML = "Map";
        dijit.byId("setupBlock").set("style", "display: block;");
        dijit.byId("mapBlock").set("style", "display: none;");
      }
    }
    document.getElementById("PopSetupButton").onclick = function(){popBoxSwap();};
    //console.log(dijit.byId("sizex"));

    function popSizeFn() {
      console.log("in popSizeFn");
      var xx = Number(document.getElementById("sizex").value);
      var yy = Number(document.getElementById("sizey").value);
      //console.log("x is " + xx + "; y=" + yy);
      document.getElementById("sizexy").innerHTML = "is a total of " + xx * yy + " cells";
    }

    dijit.byId("sizex").on("Change", popSizeFn);
    dijit.byId("sizey").on("Change", popSizeFn);
    //console.log("after size");

    $(function slidemute() {
      /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
      /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
      /* so I multiplied by 100,000 to get 100.000% to come out even. */
      //console.log("before defaultslide value");
      var muteSlideDefault = 109861.   /* results in 2% as a default */
      var muteDefault = (Math.pow(Math.E, (muteSlideDefault/100000))-1).toFixed(3)
      var slides = $( "#muteSlide" ).slider({
        /* range: "min", */  /*causes the left side of the scroll bar to be grey */
        value: muteSlideDefault,
        min: 0.0,
        max: 461512,
        slide: function( event, ui ) {
          $( "#mRate" ).val( ui.value);  /*put slider value in the text above the slider */
          $( "#muteInput" ).val( (Math.pow(Math.E, (ui.value/100000))-1).toFixed(3));  /*put the value in the text box */
        }
      });
      //console.log("max");
      /* initialize */
      $( "#mRate" ).val( ($( "#muteSlide").slider( "value" )));
      $( "#muteInput" ).val(muteDefault);
      /*update slide based on textbox */
      $( "#muteInput" ).change(function() {
        slides.slider( "value", 100000.0*Math.log(1+(parseFloat(this.value))) );
        $( "#mRate" ).val( 100000*Math.log(1+(parseFloat(this.value))) );
        //console.log("in mute change");
      });
    });

    /* Organism page script *********************************************/
    /* Organism Gestation Length Slider */

    //console.log(dijit.byId("orgCycle"));

    function orgBackFn() {
      var ii = Number(document.getElementById("orgCycle").value);
      dijit.byId("orgCycle").set("value", ii-1);
    }

    function orgForwardFn() {
      var ii = Number(document.getElementById("orgCycle").value);
      dijit.byId("orgCycle").set("value", ii+1);
    }

    dijit.byId("orgReset").on("Click", function(){
      dijit.byId("orgCycle").set("value", 0);
      document.getElementById("organCycle").innerHTML = "0"
    });
    dijit.byId("orgBack").on("Click", orgBackFn);
    dijit.byId("orgForward").on("Click", orgForwardFn);
    dijit.byId("orgEnd").on("Click", function() {
    dijit.byId("orgCycle").set("value", 100);
    });
    dijit.byId("orgCycle").on("Change", function(value){
      cycleSlider.set("value",value);
    });
    //console.log("after orgEnd");

    //var slider = declare([HorizontalSlider, HorizontalRule, HorizontalRuleLabels], {

    var cycleSlider = new HorizontalSlider({
        name: "cycleSlider",
        value: 2,
        minimum: 0,
        maximum: 100,
        intermediateChanges: true,
        style: "width:100%;",
        onChange: function(value){
            document.getElementById("orgCycle").value = value;
        }
    }, "cycleSlider");
    //console.log("after slider");

    /* ****************************************************************/
    /* Analysis Page **************************************************/
    /* ****************************************************************/
    var dictPlota = {};
    var dictPlotb = {};
    dictPlota["example"] = [1, 2, 1, 2, 2, 3,   2, 3, 3,    4];
    dictPlota["m2w30u1000not"] = [0.6, 1.8, 2, 2, 2.4, 2.7, 3];
    dictPlota["m2w30u1000nand"] = [1, 1, 1.5, 2, 3, 3, 4, 4, 4.5];
    dictPlotb["example"] = [6, 5, 5, 4, 4, 3.7, 3, 2, 1.5, .7];
    dictPlotb["m2w30u1000not"] = [7,   6.8, 6, 5, 5,   4.7, 4];
    dictPlotb["m2w30u1000nand"] = [8, 7, 7.5, 6, 5, 5, 4, 4, 3];
    var dictColor = {};
    dictColor["Red"] = "#FF0000";
    dictColor["Green"] = "#00FF00";
    dictColor["Blue"] = "#0000FF";
    dictColor["Magenta"] = "#FF00FF";
    dictColor["Cyan"] = "#00FFFF";
    dictColor["Yellow"] = "#FFFF00";
    dictColor["Purple"] = "#8800FF";
    dictColor["Orange"] = "#FFAA00";
    //var example_a = [1, 2, 1, 2, 2, 3,   2, 3, 3,    4];
    //var example_b = [6, 5, 5, 4, 4, 3.7, 3, 2, 1.5, .7];
    //var m2w30u1000not_a = [0.6, 1.8, 2, 2, 2.4, 2.7, 3];
    //var m2w30u1000not_b = [7,   6.8, 6, 5, 5,   4.7, 4];
    //var m2w30u1000nand_a = [1, 1, 1.5, 2, 3, 3, 4, 4, 4.5];
    //var m2w30u1000nand_b = [8, 7, 7.5, 6, 5, 5, 4, 4, 3];
    //var pop1a = example_a;
    //var pop1b = example_b;
    //var pop2a = m2w30u1000not_a;
    //var pop2b = m2w30u1000not_b;
    //var pop3a = m2w30u1000nand_a;
    //var pop3b = m2w30u1000nand_b;
    var pop1a = [];
    var pop1b = [];
    var pop2a = [];
    var pop2b = [];
    var pop3a = [];
    var pop3b = [];
    //console.log("c1: ", dijit.byId("pop1color").value);
    //console.log("c2: ", dijit.byId("pop2color").value);
    //console.log("c3: ", dijit.byId("pop3color").value);
    var color1 = dictColor[dijit.byId("pop1color").value];
    var color2 = dictColor[dijit.byId("pop2color").value];
    var color3 = dictColor[dijit.byId("pop3color").value]; 
    var y1title = "Average Fitness";
    var y2title = 'Average Gestation Time'
    //var chart1 = new Chart("chartOne",{title: "Avida Traits"});
    var chart1 = new Chart("chartOne");

    ready(function(){
    });
    
    function AnaChart(){
      chart1.addPlot("default", {type: "Lines"});
      chart1.addPlot("other", {type: "Lines", hAxis: "other x", vAxis: "other y"});
      chart1.addAxis("x", {fixLower: "major", fixUpper: "major",title:'Time (updates)', titleOrientation: 'away'});
      chart1.addAxis("y", {vertical: true, fixLower: "major", title: y1title, titleOrientation: 'axis',fixUpper: "major", min: 0});
      //chart1.addAxis("other x", {leftBottom: false});
      chart1.addAxis("other y", {vertical: true, leftBottom: false, min: 0, title:y2title});
      console.log("pop1a: ", pop1a);
      console.log("pop2a: ", pop2a);
      console.log("pop3a: ", pop3a);
      console.log("pop1b: ", pop1b);
      console.log("pop2b: ", pop2b);
      console.log("pop3b: ", pop3b);
      chart1.addSeries("Series 1a", pop1a, {stroke: {color:color1, width: 2}});   
      chart1.addSeries("Series 2a", pop2a, {stroke: {color:color2, width: 2}});
      chart1.addSeries("Series 3a", pop3a, {stroke: {color:color3, width: 2}});
      chart1.addSeries("Series 1b", pop1b, {plot: "other", stroke: {color:color1, width: .3}});
      chart1.addSeries("Series 2b", pop2b, {plot: "other", stroke: {color:color2, width: .3}});
      chart1.addSeries("Series 3b", pop3b, {plot: "other", stroke: {color:color3, width: .3}});
      chart1.render();
    };
    
    /* Chart buttons and dnd ********/
    document.getElementById("pop1delete").onclick = function(){ 
      graphPop1.selectAll().deleteSelectedNodes();
      console.log("delete pop1");
      pop1a = [];
      pop1b = [];
      AnaChart();
    }
    document.getElementById("pop2delete").onclick = function(){ 
      console.log("delete pop2");
      pop2a = [];
      pop2b = [];
      AnaChart();
      graphPop2.selectAll().deleteSelectedNodes();
    }
    document.getElementById("pop3delete").onclick = function(){ 
      console.log("delete pop3");
      pop3a = [];
      pop3b = [];
      AnaChart();
      graphPop3.selectAll().deleteSelectedNodes();
    }
    dijit.byId("pop1color").on("Change", function(){
      color1 = dictColor[dijit.byId("pop1color").value];
      AnaChart();
    });
    dijit.byId("pop2color").on("Change", function(){
      color2 = dictColor[dijit.byId("pop2color").value];
      AnaChart();
    });
    dijit.byId("pop3color").on("Change", function(){
      color3 = dictColor[dijit.byId("pop3color").value];
      AnaChart();
    });

    /* Canvas Play in gridCanvas *************************************/
    var canvas = document.getElementById("gridCanvas");
    var ctx = canvas.getContext("2d");
    ctx.moveTo(0,0);
    ctx.lineTo(200,100);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(95,50,40,0,3*Math.PI/2);
    ctx.stroke();
    
  });
