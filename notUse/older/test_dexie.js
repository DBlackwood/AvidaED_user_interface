define.amd.jQuery = true;
/*require([
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
  "lib/pouchdb-5.0.0.js",
  "lib/jszip.js",
  "lib/FileSaver.js",
  // "lib/tstDB.js-master/dist/tstDB.js",
  //"idbfs.js",
  "dojo/ready",
  "jquery",
  "jquery-ui",
  "messaging.js",
  "fileIO.js",
  "pouchDB_IO.js",
  "colorTest.js",
  "PopulationGrid.js",
  "organismView.js",
  'dojodnd.js',
  'popControls.js',
  'mouse.js',
  //'lib/Dexie.js',
  // 'ndxtstDB.js',
  "dojo/domReady!"
], function (dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
             BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu,
             Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom,
             aspect, on, registry, Select,
             HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
             DropDownButton, ComboBox, Textarea, Chart, Default, Lines, Grid, MouseZoomAndPan, Wetland,
             PouchDB, JSZip, FileSaver, //Dexie,//db, //IDBFS,
             ready, $, jqueryui) {
  "use strict";
  if (typeof $ !== 'undefined') {
    // jQuery is loaded => print the version
    // console.log($.fn.jquery);
  } else {console.log("Jquery ($) is not defined."); }

  parser.parse();

/*******************************************************************************************/
  console.log('test_dexie');


/*
  //
// Declare Database
//
  var db2 = new Dexie("FriendDatabase");
  db2.version(1).stores({ friends: "++id,name,age" });
  db2.open();

//
// Manipulate and Query Database
//
  db2.friends.add({name: "Josephine", age: 21}).then(function() {
    db2.friends.where("age").below(25).each(function(friend) {
      console.log("Found young friend: " + JSON.stringify(friend));
    });
  });
*/
//})