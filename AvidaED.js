"use strict";
// need a server to run this. The one below works.
// python -m SimpleHTTPServer  in the folder with index.html to start a server for using pouchDB
// python -m SimpleHTTPServer 8001  to put on 8001 instead of 8000
// Then visit http://127.0.0.1:8000/avidaED.html in a browser
//
// Git commands used to push
// git add .
// git commit -m 'comment about the change being pushed'
// git commit    then use editor to make the comment.
// i to insert text in vim; escape to get out of insert mode
// :wq will write and then quit vim
// git push -u origin master
//
// Get hashtag of avida side to state which version of avida works with this version of av_ui
// git rev-parse HEAD
//
// Avida -------------------
//
// to thet the parse value go to the current version of avida folder and
// git rev-parse --short HEAD
//
// on 2017_0927 switched to using new avida files with parse number  = 88746e4
//
// Update Notes -------------------------------------------------------------------------------------------------------
//  Should have started this sooner;  
//
// Avida-ED 3.3.2 on 2019 Oct 4
//     added new version of plotly.js to plotly.js-1.49.4
//     modified modeBarButtons ToRemove to remove the new button called 'toggleSpikelines'
//     modified to display the button 'zoom2d'
//     added the setting: responsive: true    to the list of options in av.pch.widg
// Avida-ED 3.3.3 2020 Feb 26
//     changed Pause Run: dojo radio buttons to a plain javascript check box
//     changed dojo number spinner to a plain javascript text input box
//     if autoPauseNum is changed to a value > updates, then autoPauseCheck becomes true
//     some students were having trouble entering the correct number of updates for Exercise 4 due to changes in browser/javascript/dojo interactions
// Avida-ED 3.3.4 on 2020 Feb 28
//     changed text in error reporting & removed some console.log statements. 
//     Fixed to look for pauseRunAt.txt file in the configured dish folder & to set the the pause if the value is > 0, 
//     then that value is used and the checkbox is checked. 
// Avida-ED 3.3.5 on 2020 Apr 4
//     updated the following libraries: Dojo 1.16.2, plotly-v1.53, jquery-3.4.1, and jquery-ui-1.12.1
//     need to up date jsZip and FileSaver, but ran into problems.
//     uppdatd index.html file to redirect to AvidaED.html after 3 seconds. Does not work as of April 2021
//     removed indexPlain.html
// Avida-ED 3.3.6 2020 Jul 29
//     patched an error so that adding a populated dish to the analysis, charts correctly using the menu. 
// Avida-ED 3.3.7 on 2020 Oct 2
//     updatd dojo library to release-1.16.3
//     updated slider that had stopped working on population page. 
//     Changed demo mode seed to 8 so there is 1 changed instruction with 2% mutation rate
//     5 changed instructions at 10% mutation rate on a MacBook Pro (16-inch, 2019) running Mos 10.15.6 Catalina and Chrome Version 85.0.4183.121 (Official Build) (64-bit). 
//     Also updating Dojo libraries to dojo-release-1.16.3
// Avida-ED 3.3.9 updated Dojo libraries to dojo-release-1.16.4  on 2021 April 15
// Avida-ED 3.4.0 updated Average Age calculation to account for the fact that Population Statistics is one update behind Selected Organsism Type
//     The one update offset is to improve speed by having the web worker calculate the next update while the website updates the image. 
//
// Generic Notes -------------------------------------------------------------------------------------------------------
//
// [option]<alt>{go} to get library in the list for finder
//
// /var/www/vhosts/bwng/public_html/projects/
//
// to have chrome run from file
///Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files
//
// to get to mac files on parallels
// net use z: \\Mac\Home
//
// Path in TX for Filezilla /var/www/vhosts/bwng/public_html/projects/Avida-ED
//
// for things on Darwin (dream weaver site)
// ssh -l diane darwin.beacon.msu.edu/html
// var/sites/Avida-ED.msu.edu
// emacs home.html
//
// IDEs ----------------------------------------------------------------------------------------------------------------------
// 
// Webstorm is a memory/cpu hog
// Brackets is slimer/faster, but I have not learned to customize
// Brackets uess MS Gothic', monospace which is a good font. 1iIlL|! oO0 I can tell all is, Ls and 1s for what they are. 
// Net Beans requires files for it to look at folder as a projec and uses github. i have not leaned to juse github properly with Net Beans
//
// end ------------------------------------------------------------------------------------------------------------------------
/*
  <script type='text/javascript' src='lib/dojo-release-1.16.4/dojo/dojo.js'
          data-dojo-config="'parseOnLoad':false,'async':true,
        'packages':[
        {'name':'maqetta','location':'../../maqetta'},
        {'name':'jquery','location':'../../jquery/','main':'jquery-3.4.1.min'},
        {'name':'jquery-ui','location':'../../jquery-ui','main':'jquery-ui'}
        ],
        'themeMap':[
          ['Android','',['../../themes/android/android.css']],
          ['BlackBerry','',['../../themes/blackberry/blackberry.css']],
          ['iPad','',['../../themes/ipad/ipad.css']],
          ['iPhone','',['../../themes/iphone/iphone.css']],
          ['.*','',['../../themes/iphone/iphone.css']
        ]],'mblThemeFiles':[],'mblLoadCompatPattern':''"></script>
*/
/*
  <link href='images/favicon.ico' rel='icon' type='image/x-icon' />
  <link rel='stylesheet' href='lib/jquery-ui/themes/smoothness/jquery-ui.css'>
  <style>@import 'themes/claro/document.css';
    @import 'themes/claro/claro.css';
    @import 'AvidaED.css';
  </style>

*/

define.amd.jQuery = true;
require([
  'maqetta/space',
  'maqetta/AppStates',
  'dijit/dijit',
  'dijit/registry',
  'dijit/form/Button',
  'dijit/form/Select',
  'dijit/form/HorizontalSlider',
  'dijit/form/HorizontalRule',
  'dijit/form/HorizontalRuleLabels',
  'dijit/form/RadioButton',
  'dijit/form/NumberSpinner',
  'dijit/form/ComboButton',
  'dijit/form/DropDownButton',
  'dijit/form/ComboBox',
  'dijit/form/Textarea',
  'dijit/Dialog',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',
  'dijit/MenuBar',
  'dijit/PopupMenuBarItem',
  'dijit/MenuItem',
  'dijit/Menu',
  'dijit/TitlePane',
  'dojo/parser',
  'dojo/_base/declare',
  'dojo/query',
  'dojo/NodeList-traverse',
  'dojo/dnd/Source',
  'dojo/dnd/Manager',
  'dojo/dnd/Selector',
  'dojo/dnd/Target',
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/aspect',
  'dojo/on',
  'dojo/request/xhr',
  'dojo/ready',
  
  //'lib/jquery.fileDownload.js',
  'jquery',
  'jquery-ui',   //used primarily for the jquery slider. It can go away if the slider goes away. 
  
  'lib/plotly-v1.53.min.js',
  //'lib/plotly.js',
  //'lib/jszip-v3.3.0.min.js',
  'lib/jszip-v2.6.1.min.js',
  //'lib/jszip.min.js',   //older version, not sure which version
  //'/lib/FileSaver.js',
  'lib/FileSaver_v1.1_date-2016_0328.js',
  //'lib/FileSaver-2.0.3/FileSaver.min.js',
  //'lib/FileSaver.js',
  //'avida-messages.js',
  'messaging.js',
  'fileDataRead.js',
  'fileDataWrite.js',
  'fileIO.js',

  'populationGrid.js',
  'organismView.js',
  'dojoDnd.js',
  'popControls.js',
  'mouse.js',
  'mouseDown.js',
  //'restartAvida.js',
  //'diagnosticconsole.js',
  'dojo/domReady!'
], function (space, AppStates, dijit, registry,
             Button, Select,
             HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, NumberSpinner, ComboButton,
             DropDownButton, ComboBox, Textarea,
             Dialog,
             BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu,
             TitlePane, parser, declare, query, nodelistTraverse,
             dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom, domConst,
             aspect, on, xhr,
             ready, $, jqueryui, 
             Plotly, //fileDownload,  //Blob.js,
             JSZip, FileSaver) {
  'use strict';
  if (typeof $ != 'undefined') {
    // jQuery is loaded => print the version
    // console.log($.fn.jquery);
    console.log('jquery defined on 2020 Oct 1')
  } else {
    console.log('Jquery ($) is not defined.');
  }

  //console.log('dojo version', dojo.version.toString());
  parser.parse();

  /********************************************************************************************************************/
  // * The files at the end of the require list contain code specific to Avida-ED.
  // * The functions they contain can access the dom. They cannot access functions defined anywhere
  // * else in the project. This has resulted in some code split between AvidaED.js and the various
  // * other files.
  // *
  // * The files included in script tags in AvidaED.html cannot access the dom. They contain global
  // * variables and functions that are independent of the dom
  // *
  /********************************************************************************************************************/
  // Splash Screen code stopped when ready message from Avida
  /********************************************************************************************************************/
  setTimeout(function () {
    if (!av.ui.loadOK) {
      //alert('Avida-ED failed to load, please try re-loading');
      appReloadDialog.show();
    }
  }, 121000);

  //initiallize default mouse shapes
  //av.mouse.getOriginalShapes(); only gets empty strings

  /********************************************************************************************************************/

  // -------------------------------------------------------------------------------------------------------------------
  // Initialize variables that depend on files loaded in requirement statement
  // -------------------------------------------------------------------------------------------------------------------

  dijit.byId('mnCnPause').attr('disabled', true);
  dijit.byId('mnCnOrganismTrace').attr('disabled', true);
  dijit.byId('mnFzOrganism').attr('disabled', true);
  dijit.byId('mnFzOffspring').attr('disabled', true);
  dijit.byId('mnFzPopulation').attr('disabled', true);
  //dijit.byId('mnFzAddConfigEx').attr('disabled', true);
  //dijit.byId('mnFzAddGenomeEx').attr('disabled', true);
  //dijit.byId('mnFzAddPopEx').attr('disabled', true);
  //dijit.byId('mnFzAddGenomeView').attr('disabled', true);
  //dijit.byId('mnFzAddPopAnalysis').attr('disabled', true);

  // for analyze page
  av.anl.color[0] = av.color.names[dijit.byId('pop0color').value];
  av.anl.color[1] = av.color.names[dijit.byId('pop1color').value];
  av.anl.color[2] = av.color.names[dijit.byId('pop2color').value];
  av.anl.yLeftTitle = dijit.byId('yLeftSelect').value;
  av.anl.yRightTitle = dijit.byId('yRightSelect').value;

  av.dom.load = function () {
    'use strict';
    //av.dom.mnCnPopRun = document.getElementById('mnCnPopRun');
    
    av.dom.popChart = document.getElementById('popChart');  //easier handle for div with chart
    av.dom.popChrtHolder = document.getElementById('popChrtHolder');
    //av.dom.anlChrtSpace = document.getElementById('anlChrtSpace');  //easier handle for div with chart
    av.dom.anlChrtSpace = document.getElementById('anlDndChart');  //easier handle for div with chart
    av.dom.anlDndChart = document.getElementById('anlDndChart');
    av.dom.anaChrtHolder = document.getElementById('anaChrtHolder');
    av.dom.graphPop0 = document.getElementById('graphPop0');
    av.dom.graphPop1 = document.getElementById('graphPop1');
    av.dom.graphPop2 = document.getElementById('graphPop2');

    av.dom.userMsgLabel = document.getElementById('userMsgLabel');
    av.dom.wsSavedMsg = document.getElementById('wsSavedMsg');

    //Population Page
    av.dom.runStopButton = document.getElementById('runStopButton');
    av.dom.oneUpdateButton = document.getElementById('oneUpdateButton');
    av.dom.newDishButton = document.getElementById('newDishButton');
      
    //Population Map Setup page
    av.dom.popSetupButton = document.getElementById('popSetupButton');
    av.dom.sizeCells = document.getElementById('sizeCells');
    av.dom.sizeCols = document.getElementById('sizeCols');
    av.dom.sizeRows = document.getElementById('sizeRows');
    av.dom.mutePopInput = document.getElementById('mutePopInput');
    av.dom.muteOrgError = document.getElementById('muteOrgError');
    av.dom.orgMuteInput = document.getElementById('orgMuteInput');
    av.dom.orgSetting = document.getElementById('orgSetting');
    av.dom.orgSettingsModalID = document.getElementById('orgSettingsModalID');
    av.dom.indDone = document.getElementById('indDone');
    
    av.dom.mutePopError = document.getElementById('mutePopError');
   // av.dom.muteError = document.getElementById('muteError');
    av.dom.childParentRadio = document.getElementById('childParentRadio');
    av.dom.childRandomRadio = document.getElementById('childRandomRadio');
    av.dom.notose = document.getElementById('notose');
    av.dom.andose = document.getElementById('andose');
    av.dom.orose = document.getElementById('orose');
    av.dom.norose = document.getElementById('norose');
    av.dom.equose = document.getElementById('equose');  //5
    av.dom.nanose = document.getElementById('nanose');
    av.dom.ornose = document.getElementById('ornose');
    av.dom.andnose = document.getElementById('andnose');
    av.dom.xorose = document.getElementById('xorose');

    av.dom.notButton = document.getElementById('notButton');
    av.dom.andButton = document.getElementById('andButton');
    av.dom.orButton = document.getElementById('orButton');
    av.dom.norButton = document.getElementById('norButton');
    av.dom.equButton = document.getElementById('equButton');  //5
    av.dom.nanButton = document.getElementById('nanButton');
    av.dom.ornButton = document.getElementById('ornButton');
    av.dom.andnButton = document.getElementById('andnButton');
    av.dom.xorButton = document.getElementById('xorButton');

    av.dom.experimentRadio = document.getElementById('experimentRadio');
    av.dom.demoRadio = document.getElementById('demoRadio');
    av.dom.autoPauseCheck = document.getElementById('autoPauseCheck');
    av.dom.autoPauseNum = document.getElementById('autoPauseNum');

    av.dom.sendLogTextarea = document.getElementById('sendLogTextarea');
    av.dom.sendLogPara = document.getElementById('sendLogPara');
    av.dom.sendLogTextarea = document.getElementById('sendLogTextarea');

    //post - send data to database
    av.dom.postLogTextarea = document.getElementById('postLogTextarea');
    av.dom.postLogPara = document.getElementById('postLogPara');
    av.dom.postVersionLabel = document.getElementById('postVersionLabel');
    av.dom.postScreenSize = document.getElementById('postScreenSize');
    av.dom.postUserInfoLabel = document.getElementById('postUserInfoLabel');
    av.dom.postError = document.getElementById('postError');
    av.dom.postProblemError = document.getElementById('postProblemError');
    av.dom.postEmailInput = document.getElementById('postEmailInput');
    av.dom.postEmailLabel = document.getElementById('postEmailLabel');
    av.dom.postNoteLabel = document.getElementById('postNoteLabel');
    av.dom.postComment = document.getElementById('postComment');
    av.dom.postLogTextarea = document.getElementById('postLogTextarea');
    av.dom.postdTailTextarea = document.getElementById('postdTailTextarea');
    av.dom.postStatus = document.getElementById('postStatus');
    av.dom.postDeveloperEmail = document.getElementById('postDeveloperEmail');

    av.dom.popBC = document.getElementById('popBC');
    av.dom.mainBC = document.getElementById('mainBC');
    av.dom.mapBlockHold = document.getElementById('mapBlockHold');
    av.dom.mapBlock = document.getElementById('mapBlock');
    av.dom.gridHolder = document.getElementById('gridHolder');
    av.dom.gridCanvas = document.getElementById('gridCanvas');
    av.dom.mapBC = document.getElementById('mapBC');
    av.dom.popRight = document.getElementById('popRight');
    av.dom.popBot = document.getElementById('popBot');

    av.dom.mnFlStandAloneApp = document.getElementById('mnFlStandAloneApp');
    av.dom.mnHpAbout = document.getElementById('mnHpAbout');
    av.dom.mnHpManual = document.getElementById('mnHpManual');
    av.dom.mnHpHardware = document.getElementById('mnHpHardware');
    av.dom.mnHpInfo = document.getElementById('mnHpInfo');
    av.dom.mnHpProblem = document.getElementById('mnHpProblem');
    av.dom.mnHpDebug = document.getElementById('mnHpDebug');

    av.dom.mainButtons = document.getElementById('mainButtons');
    av.dom.trashCP = document.getElementById('trashCP');
    av.dom.orgTop = document.getElementById('orgTop');
    
    av.dom.ExecuteJust = document.getElementById('ExecuteJust');       //check for code repeats might be able to do a function and clean things tiba
    av.dom.ExecuteAbout = document.getElementById('ExecuteAbout');

    av.dom.xorLabel = document.getElementById('xorLabel');          //used to toggle debug menu

    //av.dom. = document.getElementById('');
  };
  av.dom.load();

  if (av.debug.root) console.log('before dnd definitions');
  /********************************************************************************************************************/
  /******************************************* Dojo Drag N Drop Initialization ****************************************/
  /********************************************************************************************************************/
  /* Yes they are globals, but they are defined based on the dom and
   when I've tried putting them in another file it does not work */

  av.dnd.fzConfig = new dndSource('fzConfig', {
    accept: ['b', 'c'],  //b=both; c=config
    copyOnly: true,
    singular: true,
    selfAccept: false
  });
  if (av.debug.root) console.log('before fzOrgan');
  av.dnd.fzOrgan = new dndSource('fzOrgan', {
    accept: ['g'],  //g=genome
    copyOnly: true,
    singular: true,
    selfAccept: false
  });
  if (av.debug.root) console.log('before fzWorld');
  av.dnd.fzWorld = new dndSource('fzWorld', {
    //accept: ['b', 'w'],   //b=both; w=world  //only after the population started running
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  /*  //kept only as an example of how to programatically add data to a dnd container
   av.dnd.fzWorld.insertNodes(false, [
   {data: 'm2w30u1000nand', type: ['w']},
   {data: 'm2w30u1000not', type: ['w']}
   ]);
   */

  if (av.debug.root) console.log('before organIcon');
  av.dnd.organIcon = new dndTarget('organIcon', {accept: ['g'], selfAccept: false});
  av.dnd.ancestorBox = new dndSource('ancestorBox', {accept: ['g'], copyOnly: true, selfAccept: false});
  av.dnd.gridCanvas = new dndTarget('gridCanvas', {accept: ['g']});
  av.dnd.trashCan = new dndSource('trashCan', {accept: ['c', 'g', 'w'], singular: true});
  if (av.debug.root) console.log('after trashCan');

  av.dnd.activeConfig = new dndSource('activeConfig', {
    accept: ['b', 'c', 'w'],  //b-both; c-configuration; w-world (populated dish
    singular: true,
    copyOnly: true,
    selfAccept: false
  });

  if (av.debug.root) console.log('before activeOrgan');
  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.activeOrgan = new dndSource('activeOrgan', {
    accept: ['g'],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  av.dnd.organCanvas = new dndSource('organCanvas', {accept: ['g'], singular: true, selfAccept: false});
  //Targets only accept object, source can do both
  av.dnd.anlDndChart = new dndTarget('anlDndChart', {accept: ['w'], singular: true});
  av.dnd.graphPop0 = new dndTarget('graphPop0', {accept: ['w'], singular: true});
  av.dnd.graphPop1 = new dndTarget('graphPop1', {accept: ['w'], singular: true});
  av.dnd.graphPop2 = new dndTarget('graphPop2', {accept: ['w'], singular: true});

  av.parents.clearParentsFn();

  //**************************************************************************************************
  //                web worker to talk to avida
  //**************************************************************************************************/

  //Avida as a web worker
  if (av.debug.root) console.log('before call avida');
  //console.log('typeof(av.aww.uiWorker', typeof(av.aww.uiWorker));
  if (typeof(Worker) !== 'undefined') {
    //console.log('Worker type is not undefined');
    if (null === av.aww.uiWorker) {
      av.aww.uiWorker = new Worker('avida.js');
      //console.log('webworker created');
      av.debug.log += '\n     --note: av.aww.uiWorker was null, started a new webworker';
    }
    else console.log('av.aww.uiWorker is not null');
  }
  else {
    userMsgLabel.textContent = "Sorry, your browser does not support Web workers and Avida won't run";
  }

  //process message from web worker
  if (av.debug.root) console.log('before fio.uiWorker on message');
  av.aww.uiWorker.onmessage = function (ee) {
    av.msg.readMsg(ee)
  };  // in file messaging.js

  //********************************************************************************************************************
  //  Read Default Workspace as part of initialization
  // ********************************************************************************************************************
  av.fio.JSZip = JSZip;  //to allow other required files to be able to use JSZip
  av.fio.FileSaver = FileSaver;
  av.pch.Plotly = Plotly;
  av.pch.Plotly.aminate = Plotly.animate;

  av.fio.readZipWS(av.fio.defaultFname, true);
  //av.fio.loadDefaultConfig();

  //********************************************************************************************************************
  // Menu Buttons handling
  //********************************************************************************************s************************

  dijit.byId('mnFlOpenDefaultWS').on('Click', function () {
    'use strict';
    av.post.addUser('Button: mnFlOpenDefaultWS');
    av.fio.useDefault = true;
    av.fio.isB64 = false;
    if ('no' === av.fzr.saveState) sWSfDialog.show();  //Save WSfile Dialog box
    else {
      av.fio.readZipWS(av.fio.defaultFname, false);  //false = do not load config file
    }
  });

  dijit.byId('sWSfSave').on('Click', function () {
    av.post.addUser('Button: sWSSave');
    //console.log('before call save workspace');
    av.fio.fzSaveCurrentWorkspaceFn();  //fileIO.js
    //console.log('after call to save workspace');
  });

  dijit.byId('sWSfOpen').on('Click', function () {
    av.post.addUser('Button: sWSfOpen');
    sWSfDialog.hide(sWSfDialog.hide);
    if (av.fio.useDefault) {
      av.fio.readZipWS(av.fio.defaultFname, false);
    }  //false = do not load config file
    else {
      //document.getElementById('inputFile').click();  //to get user picked file
      document.getElementById('putWS').click();  //to get user picked file
    }
  });

  // open and read user picked file
  //--------------------------------------------------------------------------------------------------------------------

  dijit.byId('mnFlOpenWS').on('Click', function () {
    'use strict';
    av.post.addUser('Button: mnFlOpenWS');
    av.fio.useDefault = false;
    av.fio.isB64 = false;
    if ('no' === av.fzr.saveState) sWSfDialog.show();   //Need to change to include might be saved tiba fix
    //else document.getElementById('inputFile').click();
    else document.getElementById('putWS').click();  // calls av.fio.userPickZipRead
  });

  dijit.byId('mnFlOpenB64').on('Click', function () {
    'use strict';
    av.post.addUser('Button: mnFlOpenB64');
    av.fio.useDefault = false;
    av.fio.isB64 = true;
    if ('no' === av.fzr.saveState) sWSfDialog.show();
    //else document.getElementById('inputFile').click();
    else document.getElementById('putWS').click();   // call av.fio.userPickZipRead()
  });

  //--------------------------------------------------------------------------------------------------------------------

  dijit.byId('mnFlFzItem').on('Click', function () {
    'use strict';
    av.post.addUser('Button: mnFlFzItem');
    av.fio.useDefault = false;
    //console.log('importFzrItem', importFzrItem);
    document.getElementById('importFzrItem').click();
  });

  // ----------------------- Save Workspace ----------------------------------------------------------------------------
  // Save current workspace (mnFzSaveWorkspace)
  document.getElementById('mnFlSaveWorkspace').onclick = function () {
    if (!av.brs.isSafari) {
    //if (true) {
      av.post.addUser('Button: mnFlSaveWorkspace');
      av.fio.fzSaveCurrentWorkspaceFn();  //fileIO.js
    }
  };

  try {
    var isFileSaverSupported = !!new Blob;
  } catch (e) {
    console.log('----------------------------------------------------------filesaver supported?', e);
  }

  // Save current workspace with a new name
  document.getElementById('mnFlSaveAs').onclick = function () {
    if (!av.brs.isSafari) {
    //if (true) {
      av.post.addUser('Button: mnFlSaveAs');
      var suggest = 'avidaWS.avidaedworkspace.zip';
      if (av.fio.userFname) {
        if (0 < av.fio.userFname.length) suggest = av.fio.userFname;
      }
      av.fio.userFname = prompt('Choose a new name for your Workspace now', suggest);
      if (null !== av.fio.userFname) {
        av.fio.fzSaveCurrentWorkspaceFn();
      }  //fileIO.js
    }
  };

  //Export csv data from current run.
  dijit.byId('mnFlExportData').on('Click', function () {
    'use strict';
    //console.log('-------mnFlExportData');
    av.post.addUser('Button: mnFlExportData');
    //console.log('call av.fwt.writeCurrentCSV ()=',av.fzr.actConfig.name + '@' + av.grd.popStatsMsg.update);
    av.fwt.writeCurrentCSV(av.fzr.actConfig.name + '@' + av.grd.popStatsMsg.update + '\n');
    //console.log('string=', av.fzr.actConfig.name + '@' + av.grd.popStatsMsg.update + '\n');
  });

  //Export chart data from current run.
  dijit.byId('mnFlExportGraph').on('Click', function () {
    'use strict';
    av.post.addUser('Button: mnFlExportGraph');
    mnFlExportGraphDialog.show();
  });

  //Save Stand alone applicaton .
  dijit.byId('mnFlStandAloneApp').on('Click', function () {
    'use strict';
    av.post.addUser('Button: mnFlExportGraph');
    mnFlStandAloneAppDialog.show();
  });

  //------------- Testing only need to delete later.--------------------

  av.dom.mnHpDebug.onclick = function () {
    if ('visible' === document.getElementById('mnDebug').style.visibility) {
      document.getElementById('mnDebug').style.visibility = 'hidden';
      dijit.byId('mnHpDebug').set('label', 'Show debug menu');
      av.post.addUser('Button: mnHpDebug: now hidden');
    } else {
      document.getElementById('mnDebug').style.visibility = 'visible';
      dijit.byId('mnHpDebug').set('label', 'Hide debug menu');
      av.post.addUser('Button: mnHpDebug: now visible');
    }
  };

  av.dom.xorLabel.onclick = function () {
    if ('visible' === document.getElementById('mnDebug').style.visibility) {
      document.getElementById('mnDebug').style.visibility = 'hidden';
      dijit.byId('mnHpDebug').set('label', 'Show debug menu');
      av.post.addUser('Button: mnHpDebug: now hidden');
    } else {
      document.getElementById('mnDebug').style.visibility = 'visible';
      dijit.byId('mnHpDebug').set('label', 'Hide debug menu');
      av.post.addUser('Button: mnHpDebug: now visible');
    }
  };

  //works saving text as an example -
  document.getElementById('mnDbSaveTxt').onclick = function () {
    av.post.addUser('Button: mnDbSaveTxt');
    av.fio.userFname = 'junk.txt';
    //av.fio.saveTxt();
    av.fio.saveJson();
  };

  $(fileDownloadButton).click(function () {
    console.log('inside fileDownButton')

    if (0 === av.fio.userFname.length) av.fio.userFname = prompt('Choose a name for your Workspace', av.fio.defaultUserFname);
    if (0 === av.fio.userFname.length) av.fio.userFname = av.fio.defaultUserFname;
    var end = av.fio.userFname.substring(av.fio.userFname.length - 4);
    if ('.zip' != end) av.fio.userFname = av.fio.userFname + '.zip';
    //console.log('end', end, '; userFname', av.fio.userFname);
    console.log('before use of "new av.fio.JSZip();"');
    var WSzip = new av.fio.JSZip();
    //console.log('number of files', av.utl.objectLength(av.fzr.file));
    var numFiles = 0;
    for (var fname in av.fzr.file) {
      WSzip.file('av.avidaedworkspace/' + fname, av.fzr.file[fname]);
      numFiles++;
    }
    var blob = WSzip.generate({type: 'blob'});
    //console.log('wrote blob');
    //var data = { x: 42, s: 'hello, world', d: new Date() };
    //var json = JSON.stringify(data);
    //var blob = new Blob([json], {type: 'octet/stream'});
    var tmpUrl = window.URL.createObjectURL(blob);
      //console.log('tmpURL=', tmpUrl);
      av.fio.writeSafari(tmpUrl);
      //window.URL.revokeObjectURL(tmpUrl);
    //av.fwt.tryDown(blob);
  });

  av.fwt.tryDown = function(blob) {
    var ab = document.createElement('a');
    ab.href     = 'data:attachment/csv;charset=utf-8,' + encodeURI(av.debug.log);
    ab.target   = '_blank';
    ab.download = 'testfile.txt';
    document.body.appendChild(ab);
    ab.click();
    setTimeout(function(){
      document.body.removeChild(ab);
      window.URL.revokeObjectURL(ab.href);
    }, 100);
  }
  //------------- Testing only need to delete above later.--------------------

  if (av.debug.root) console.log('before Help drop down menu');
  //--------------------------------------------------------------------------------------------------------------------
  // Help Drop down menu buttons
  //--------------------------------------------------------------------------------------------------------------------
  dijit.byId('mnHpAbout').on('Click', function () {
    av.post.addUser('Button: mnHpAbout');
    mnHpAboutDialog.show();
  });

  dijit.byId('mnAeAbout').on('Click', function () {
    av.post.addUser('Button: mnAeAbout');
    mnHpAboutDialog.show();
  });``

  dijit.byId('mnHpProblem').on('Click', function () {
    av.post.addUser('Button: mnHpProblem');
    av.debug.finalizeDtail();
    av.debug.triggered = 'userTriggered';
    av.debug.developerEmail = 'For more direct help, please send e-mail to avida-ed-development@googlegroups.com'
    av.debug.postStatus = '';
    av.post.postLogPara = 'Please send the data below to help us make Avida-ED better by clicking on the [Send] button'
    av.debug.sendLogPara = 'Please describe the problem and put that at the beginning of the e-mail along with the session log from the text area seeen below.';
    av.debug.postNoteLabel = 'Please describe the problem or suggestion in the comment field below.'
    av.debug.postEmailLabel = 'Please include your e-mail so we can discuss your problem or suggeston further.';
    av.debug.sendLogTextarea = av.fio.mailAddress + '\n\n' + av.debug.log + '\n\nDebug Details:\n' + av.debug.dTail;
    av.debug.error = '';
    av.dom.postError.style.color = 'grey';
    av.ui.problemWindow();
    // only shows one line = prompt('Please put this in an e-mail to help us improve Avida-ED: Copy to clipboard: Ctrl+C, Enter', '\nto: ' + av.fio.mailAddress + '\n' + av.debug.log);
  });

  //http://stackoverflow.com/questions/7080269/javascript-before-leaving-the-page
  dijit.byId('sendEmail').on('Click', function () {
    av.ui.sendEmailFlag = true;
    av.post.addUser('Button: sendEmail');
    var link = 'mailto:' + av.fio.mailAddress +
        //'?cc=CCaddress@example.com' +
      '?subject=' + escape('Avida-ED session log') +
      '&body=' + escape(av.debug.log);
    window.location.href = link;
    av.ui.sendEmailFlag = false;
  });

  av.debug.finalizeDtail = function (){
    //finalize dTail
    //dom dimensions clientWidth clientHeight scrollWidth scrollHeight innerWidth innerHeight outerWidth outerHeight
    //assignment must have units and is a string style.width style.height
    av.debug.dTail = ''
      +   '      mainBC.client wd Ht = ' + av.dom.mainBC.clientWidth + '  '  +  av.dom.mainBC.clientHeight
      + '\n       popBC.client wd Ht = ' + av.dom.popBC.clientWidth + '  '  +  av.dom.popBC.clientHeight
      + '\n       popBC.scroll wd Ht = ' + av.dom.popBC.scrollWidth + '  '  +  av.dom.popBC.scrollHeight
      + '\nmapBlockHold.client wd Ht = ' + av.dom.mapBlockHold.clientWidth + '  '  +  av.dom.mapBlockHold.clientHeight
      + '\nmapBlockHold.scroll wd Ht = ' + av.dom.mapBlockHold.scrollWidth + '  '  +  av.dom.mapBlockHold.scrollHeight
      + '\n    mapBlock.client wd Ht = ' + av.dom.mapBlock.clientWidth + '  '  +  av.dom.mapBlock.clientHeight
      + '\n    mapBlock.scroll wd Ht = ' + av.dom.mapBlock.scrollWidth + '  '  +  av.dom.mapBlock.scrollHeight
      + '\n       mapBC.client wd Ht = ' + av.dom.mapBC.clientWidth + '  '  +  av.dom.mapBC.clientHeight
      + '\n       mapBC.scroll wd Ht = ' + av.dom.mapBC.scrollWidth + '  '  +  av.dom.mapBC.scrollHeight
      + '\n  gridHolder.client wd Ht = ' + av.dom.gridHolder.clientWidth + '  '  +  av.dom.gridHolder.clientHeight
      + '\n  gridHolder.scroll wd Ht = ' + av.dom.gridHolder.scrollWidth + '  '  +  av.dom.gridHolder.scrollHeight
      + '\n  gridCanvas.client wd Ht = ' + av.dom.gridCanvas.clientWidth + '  '  +  av.dom.gridCanvas.clientHeight
      + '\n  gridCanvas.scroll wd Ht = ' + av.dom.gridCanvas.scrollWidth + '  '  +  av.dom.gridCanvas.scrollHeight
      + '\n' + av.debug.dTail;
  }

  //process problme pop-up window
  av.ui.problemWindow = function () {
    //console.log('in problemWindow');
    av.debug.vars = {
      isBlink: av.brs.isBlink,
      isChrome: av.brs.isChrome,
      isEdge: av.brs.isEdge,
      isFirefox: av.brs.isFirefox,
      isIE: av.brs.isIE,
      isOpera: av.brs.isOpera,
      isSafari: av.brs.isSafari
    };

    av.debug.postData = {
      version: av.ui.version,
      userInfo: window.navigator.userAgent,
      screenSize: av.brs.userData.screen,
      comment:'userComment',
      error:av.debug.error,
      email:'user email if provided',
      triggered:av.debug.triggered,
      logs: {
        details: av.debug.dTail,
        session: av.debug.log,
      },
      freezer: JSON.stringify(av.fzr),
      vars: av.debug.vars
    };
    console.log('postData=', av.debug.postData);

    //Until we get sending data to database figure out. Switch between post and e-mail session log
    if (true) {
      //Need to be able to get rid of these three lines for postPost. will crash without them now.
      sendLogDialog.show();  //textarea must be visable first
      av.dom.sendLogTextarea.focus();   //must not be commented out or extra error
      sendLogDialog.hide();  //
      av.post.sendWindow();
    }
    //e-mail in production version until database worked out.
    else {
      av.post.emailWindow();
    }
  }
  
  av.post.sendWindow = function () {
    postLogDialog.show();  //textarea must be visable first
    av.dom.postLogPara.textContent = av.post.postLogPara;
    av.dom.postVersionLabel.textContent = av.ui.version;
    av.dom.postScreenSize.textContent = av.brs.userData.screen;
    av.dom.postUserInfoLabel.textContent = window.navigator.userAgent.toString();
    av.dom.postError.textContent = av.debug.error;
    av.dom.postError.style.color = 'red';
    av.dom.postEmailLabel.textContent = av.debug.postEmailLabel;
    av.dom.postNoteLabel.textContent = av.debug.postNoteLabel;
    av.dom.postDeveloperEmail.textContent = av.debug.developerEmail;
    av.dom.postStatus.textContent = av.debug.postStatus;
    av.dom.postLogTextarea.textContent = av.debug.log;
    av.dom.postdTailTextarea.textContent = av.debug.dTail;
    av.dom.postProblemError.textContent = '';

  }

  av.post.emailWindow = function() {
    document.getElementById('sendLogTextarea').textContent = av.debug.sendLogTextarea;
    document.getElementById('sendLogPara').textContent = av.debug.sendLogPara;

    //document.getElementById('postLogTextarea').textContent = av.debug.sendLogTextarea;
    //document.getElementById('postLogPara').textContent = av.debug.sendLogPara;

    sendLogDialog.show();  //textarea must be visable first
    av.dom.sendLogTextarea.focus();
    av.dom.sendLogTextarea.select();  //https://css-tricks.com/snippets/javascript/auto-select-textarea-text/
    
  }
  //********************************************************************************************************************
  // Error logging
  //********************************************************************************************************************

  //--------------------------------------------------------------------------------------------
  //https://bugsnag.com/blog/js-stacktracess
  //http://blog.bugsnag.com/js-stacktraces
  window.onerror = function (message, file, line, col, error) {
    console.log('in onError');
    av.dom.runStopButton.innerHTML = 'Run';  //av.msg.pause('now');
    av.debug.finalizeDtail();
    av.debug.triggered = 'errorTriggered';
    av.post.postLogPara = 'For more direct help, please send e-mail to avida-ed-development@googlegroups.com'
    av.debug.sendLogPara = 'The error is the last line in the session log in the text below.';
    av.debug.postEmailLabel = 'Please include your e-mail if you would like feed back or are willing to further assist in debug';
    av.debug.postNoteLabel = 'Please include any additional comments in the field below.'
    av.debug.postEmailLabel = 'Please include your e-mail for feedback or so we can discuss the problem further';
    av.debug.error = 'Error: ' + message + ' from ' + file + ':' + line + ':' + col;
    av.debug.sendLogTextarea = av.fio.mailAddress + '\n\n' + av.debug.log + '\n\nDebug Details:\n' + av.debug.dTail + '\n\n' + av.debug.error;

    console.log('before call problemWindow')
    av.ui.problemWindow();
  }

  window.addEventListener('error', function (evt) {
    //console.log('event listener', evt);
  });
  //--------------------------------------------------------------------------------------------

  on(document.getElementById('postPost'), 'click', function(){
    av.post.addUser('Button: postPost');
    //Data to send
    av.debug.postData.email = av.dom.postEmailInput.value;
    av.debug.postData.comment = av.dom.postComment.value;
    console.log('postData=', av.debug.postData);

    av.dom.postStatus.textContent = 'Sending';
    av.dom.postProblemError.textContent = '';

    //domConst.place('<p>sending message</p>', 'postStatus');
    var hostname = 'https://avida-ed.msu.edu/developer/report/receive';

    xhr.post(  //Post is a helper function to xhr, a more generic class
      hostname,  //URL parameter
      {  //Data and halding parameter
        data: dojo.toJson(av.debug.postData),
        headers: {'X-Requested-With':null}
      }
    ).then(function(received){ //Promise format; received data from request (first param of then)
        av.dom.postStatus.textContent = 'Received';
        //domConst.place('<p>Data received: <code>' + JSON.stringify(received) + '</code></p>', 'postStatus');
      }, function(err){ //Error handling (second param of then)
        av.dom.postStatus.textContent = 'Error';
        av.dom.postProblemError.textContent = 'Please send an e-mail to '+av.fio.mailAddress + ' about the error sending a Problem Report';
        av.dom.postProblemError.style.color = 'red';

      //domConst.place('<p>Error: <code>' + JSON.stringify(err) + '</code></p>', 'postStatus');
      }
    ); // End then
  }); // End on's function and on statement

  //--------------------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  //More usefull websites to catch errors
  // https://davidwalsh.name/javascript-stack-trace
  // https://danlimerick.wordpress.com/2014/01/18/how-to-catch-javascript-errors-with-window-onerror-even-on-chrome-and-firefox/
  //to send e-mail  http://stackoverflow.com/questions/7381150/how-to-send-an-email-from-javascript

  // how to send e-mail
  // http://www.codeproject.com/Questions/303284/How-to-send-email-in-HTML-or-Javascript

  // selected text
  // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
  // http://www.javascriptkit.com/javatutors/copytoclipboard.shtml

  //http://www.technicaladvices.com/2012/03/26/detecting-the-page-leave-event-in-javascript/
  //Cannot get custom message in Firefox (or Safari for now)
  window.onbeforeunload = function (event) {
    if (!av.ui.sendEmailFlag) {
      if ('no' === av.fzr.saveState || 'maybe' === av.fzr.saveState) {
        return 'Your workspace may have changed sine you last saved. Do you want to save first?';

        //e.stopPropagation works in Firefox.
        if (event.stopPropagation) {
          event.stopPropagation();
          event.preventDefault();
        }
      }
    }
  }

  /*
   //http://stackoverflow.com/questions/20773306/mozilla-firefox-not-working-with-window-onbeforeunload
   var myEvent = window.attachEvent || window.addEventListener;
   var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compitable

   myEvent(chkevent, function(e) { // For >=IE7, Chrome, Firefox
   var confirmationMessage = 'Remember to save your workSpace before you leave Avida-ED';  // a space
   (e || window.event).returnValue = confirmationMessage;
   return confirmationMessage;
   });

   function goodbye(e) {
   if(!e) e = window.event;
   //e.cancelBubble is supported by IE - this will kill the bubbling process.
   e.cancelBubble = true;
   e.returnValue = 'Have you saved your workspace?'; //This is displayed on the dialog

   //e.stopPropagation works in Firefox.
   if (e.stopPropagation) {
   e.stopPropagation();
   e.preventDefault();
   }
   }
   window.onbeforeunload=goodbye;
   */

  //--------------------------------------------------------------------------------------------------------------------
  // main button scripts
  //--------------------------------------------------------------------------------------------------------------------

  //initialize the ht for main buttons and trash can so there is no scroll bar
  if (av.dom.mainButtons.scrollHeight > av.dom.mainButtons.clientHeight) {
    av.dom.mainButtons.style.height = av.dom.mainButtons.scrollHeight + 'px';
  }
  if (av.dom.trashCP.scrollHeight > av.dom.trashCP.clientHeight) {
    av.dom.trashCP.style.height = av.dom.trashCP.scrollHeight + 'px';
  }
  if (av.dom.orgTop.scrollHeight > av.dom.orgTop.clientHeight) {
    av.dom.orgTop.style.height = av.dom.orgTop.scrollHeight + 'px';
  }
  //console.log('orgBot', document.getElementById('organismBottom').scrollHeight, document.getElementById('organismBottom').clientHeight);
  if (document.getElementById('organismBottom').scrollHeight > document.getElementById('organismBottom').clientHeight) {
    av.ui.num = document.getElementById('organismBottom').scrollHeight + 9;
    document.getElementById('organismBottom').style.height = av.ui.num + 'px';
  }

  //The style display: 'none' cannnot be used in the html during the initial load as the dijits won't work right
  //visibility:hidden can be used, but it leaves the white space and just does not display dijits.
  //So all areas are loaded, then the mainBoxSwap is called to set display to none after the load on all but
  //the default option.
  //av.ui.mainBoxSwap('organismBlock');
  //av.ui.mainBoxSwap('populationBlock');  //commented out here as it is called near the end of this file
  dijit.byId('setupBlock').set('style', 'display: none;');

  av.ui.mainBoxSwap = function (showBlock) {
    av.ui.page = showBlock;
    dijit.byId('populationBlock').set('style', 'display: none;');
    dijit.byId('organismBlock').set('style', 'display: none;');
    dijit.byId('analysisBlock').set('style', 'display: none;');
    dijit.byId(showBlock).set('style', 'display: block; visibility: visible;');
    dijit.byId(showBlock).resize();

    //disable menu options. they will be enabled when relevant canvas is drawn
    dijit.byId('mnFzOffspring').attr('disabled', true);
    dijit.byId('mnCnOffspringTrace').attr('disabled', true);
    //console.log('end of mainBoxSwap');
  };

  // Buttons that call MainBoxSwap
  document.getElementById('populationButton').onclick = function () {
    av.post.addUser('Button: populationButton');
    if (av.debug.dnd || av.debug.mouse) console.log('PopulationButton, av.fzr.genome', av.fzr.genome);
    av.ui.mainBoxSwap('populationBlock');
    console.log('dom.fzOrgan=', document.getElementById('fzOrgan'));
    console.log('fzOrgan has a selected item', av.dnd['fzOrgan'].getSelectedNodes()[0])
  }

  document.getElementById('organismButton').onclick = function () {
    av.post.addUser('Button: organismButton');
    av.ui.mainBoxSwap('organismBlock');
    //console.log('after mainBoxSwap');
    organismCanvasHolderSize();
    var height = ($('#rightDetail').innerHeight() - 395) / 2;
    av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    av.dom.ExecuteAbout.style.height = height + 'px';
    av.dom.ExecuteJust.style.width = '100%';
    av.dom.ExecuteAbout.style.width = '100%';
    if (undefined != av.traceObj) {
      av.ind.updateOrgTrace();
    }
  };

  document.getElementById('analysisButton').onclick = function () {
    av.post.addUser('Button: analysisButton');
    av.ui.mainBoxSwap('analysisBlock');
    av.anl.AnaChartFn();
  };

  //********************************************************************************************************************
  // Resize window helpers -------------------------------------------
  //********************************************************************************************************************
  if (av.debug.root) console.log('before Resize helpers');

  av.pch.divSize = function(from) {
    if (av.debug.plotly) console.log('in av.pch.divSize from ', from);
    av.pch.ht = av.dom.popChrtHolder.clientHeight - 3;
    av.pch.wd = av.dom.popChrtHolder.clientWidth - 3;
    av.dom.popChrtHolder.style.height = av.dom.popChrtHolder.clientHeight;
    av.dom.popChart.style.height = av.pch.ht + 'px';
    av.dom.popChart.style.width = av.pch.wd + 'px';
    av.pch.layout.height = av.pch.ht;
    av.pch.layout.width = av.pch.wd;
  };

  av.anl.divSize = function(from) {
    //console.log(from,'anaChrtHolder Ht client scroll ', av.dom.anaChrtHolder.clientHeight, av.dom.anaChrtHolder.scrollHeight);
    //console.log(from,'anlDndChart Ht client scroll', av.dom.anlDndChart.clientHeight, av.dom.anlDndChart.scrollHeight);
    //console.log(from,'anlChrtSpace Ht client scroll', av.dom.anlChrtSpace.clientHeight, av.dom.anlChrtSpace.scrollHeight);

    if (av.debug.plotly) console.log('in av.anl.divSize from ', from);
    av.anl.ht = av.dom.anaChrtHolder.clientHeight - 1;
    av.anl.wd = av.dom.anaChrtHolder.clientWidth - 1;
    av.dom.anaChrtHolder.style.height = av.anl.ht + 'px';
    av.anl.ht = av.dom.anaChrtHolder.clientHeight - 6;
    av.dom.anlChrtSpace.style.height = av.anl.ht + 'px';
    av.dom.anlChrtSpace.style.width = av.anl.wd + 'px';
    av.anl.layout.height = av.anl.ht;
    av.anl.layout.width = av.anl.wd;
  };

  // called from script in html file as well as below
  av.ui.browserResizeEventHandler = function () {
    if ('block' == domStyle.get('analysisBlock', 'display')) {
      av.anl.AnaChartFn();
    }
    if ('block' == domStyle.get('populationBlock', 'display')) {
      if (av.grd.notInDrawingGrid) {
        //av.ui.adjustPopRightSize();
        av.grd.popChartFn();
        //console.log('before call av.grd.drawGridSetupFn');
        av.grd.drawGridSetupFn();
      }
    }
    if ('block' == domStyle.get('organismBlock', 'display')) {
      var rd = $('#rightDetail').innerHeight();
      var height = ($('#rightDetail').innerHeight() - 395) / 2;  //was 375
      av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      av.dom.ExecuteAbout.style.height = height + 'px';
      av.dom.ExecuteJust.style.width = '100%';
      av.dom.ExecuteAbout.style.width = '100%';
      //console.log('rightDetail', height, rd);
      av.ind.updateOrgTrace();
    }
  };
  //console.log('ht, wd', document.getElementById('mainBC').clientHeight,document.getElementById('splash').clientWidth);

  ready(function () {
    aspect.after(registry.byId('gridHolder'), 'resize', function () {
      av.ui.browserResizeEventHandler();
    });
    aspect.after(registry.byId('anaChrtHolder'), 'resize', function () {
      av.anl.divSize('ready resize');
    });
    aspect.after(registry.byId('popChrtHolder'), 'resize', function () {
      av.ui.browserResizeEventHandler();
      av.pch.divSize('ready resize');
    });
    aspect.after(registry.byId('organismCanvasHolder'), 'resize', function () {
      av.ui.browserResizeEventHandler();
    });
  });

  av.ui.popRightOldwidth = 0;
  aspect.after(registry.byId('popRight'), 'resize', function () {
    if (registry.byId('popRight').domNode.style.width != av.ui.popRightOldwidth) {
      av.ui.popRightOldwidth = registry.byId('popRight').domNode.style.width;
      var str = registry.byId('popRight').domNode.style.width;
      registry.byId('sotPane').domNode.style.width = Math.round((Number(str.substr(0, str.length - 2)) - 50) * 0.52) + 'px'
      registry.byId('mainBC').layout();
    }
    //console.log('popBot ====', document.getElementById('popBot').style.width); //need abotu 430 px for button arrangement to look good.
  });

  //Adjust Statistics area width based on gridholder size and shape. gridholder should be roughly square
  av.ui.adjustPopRightSize_ = function () {}
  av.ui.adjustPopRightSize = function () {
    av.ui.gridHolderWd = av.dom.gridHolder.clientWidth;
    //console.log('av.ui.gridHolderWd', av.ui.gridHolderWd, '; popRight.wd=',av.dom.popRight.style.width, '; av.ui.popBotWdMin=', av.ui.popBotWdMin);
    //console.log('popBot wd, ht', av.dom.popBot.clientWidth, av.dom.popBot.clientHeight, '; gridHolder.Ht', av.dom.gridHolder.clientHeight);
    if (av.ui.popBotWdMin < av.ui.gridHolderWd) {
      av.ui.gridHolderXtra = av.ui.gridHolderWd - (av.dom.gridHolder.clientHeight-av.ui.popBotHtMin);
      //av.ui.gridHolderXtra = av.ui.gridHolderWd - (av.dom.gridHolder.clientHeight);
      //console.log('av.ui.gridHolderXtra',av.ui.gridHolderXtra);
      if (av.ui.gridHolderSideBuffer < av.ui.gridHolderXtra) {
        av.ui.gridHolderWdNew = av.ui.gridHolderWd - av.ui.gridHolderXtra + av.ui.gridHolderSideBuffer;
        //console.log('av.ui.gridHolderWdNew=',av.ui.gridHolderWdNew, '; gridHolderSideBuffer=', av.ui.gridHolderSideBuffer);
        if (av.ui.popBotWdMin > av.ui.gridHolderWdNew) av.ui.gridHolderWdNew = av.ui.popBotWdMin;
        av.ui.popRightWdNew = av.dom.popRight.clientWidth + av.ui.gridHolderWd - av.ui.gridHolderWdNew;
        //console.log('av.ui.popRightWd Old, New',document.getElementById('popRight').clientWidth, av.ui.popRightWdNew);
        //av.ui.popRightWdNew = av.dom.popRight.clientWidth + av.ui.gridHolderXtra - av.ui.gridHolderSideBuffer;
        document.getElementById('popRight').style.width = av.ui.popRightWdNew + 'px';
      }
    }
    //console.log('popRight', av.dom.popRight.style.width, '; popBot wd, ht', av.dom.popBot.clientWidth, av.dom.popBot.clientHeight);
    //console.log('gridHolder: wd, ht=', av.dom.gridHolder.clientWidth, av.dom.gridHolder.clientHeight);
  };

  if (av.debug.root) console.log('before dnd triggers');
  //*******************************************************************************************************************
  //       Dojo Dnd drop function - triggers for all dojo dnd drop events
  //*******************************************************************************************************************
  // Dojo DndDrop function triggers for drops in all locations (target or source). However not all the information is
  // available unless the correct source/target name is in the event call. I had one event handler with calls to the
  // different functions based on the target.node.id, but that did not work, for not all the information was available.
  // It looks like it is there based on console.logging just the taret, but trying to access subdata results in a null.
  // I don't think I would have written it this way had I known the single event handler would not work, but I had
  // created the dojodnd.js file before I realized that I needed separate event handelers with the conditional.

  av.dnd.activeConfig.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeConfig
    'use strict';
    //console.log('s=', source.node.id, '; n=',nodes, '; c=', copy, '; t=', target.node.id)
    if ('activeConfig' === target.node.id) {
      av.dnd.makeMove(source, nodes, target);
    }
  });

  av.dnd.fzConfig.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of fzConfig
    if ('fzConfig' === target.node.id) {
      av.ui.num = av.fzr.cNum;  //hold current cNum to see if it changes in av.dnd.landConfig
      av.dnd.landFzConfig(source, nodes, target);  //needed as part of call to contextMenu
      //if (av.ui.num !== av.fzr.cNum) { av.fwt.makeFzrConfig(av.fzr.cNum); }
    }
  });

  av.dnd.fzOrgan.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of fzOrgan
    if ('fzOrgan' === target.node.id) {
      av.dnd.landFzOrgan(source, nodes, target);
    }
  });

  av.dnd.ancestorBox.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of ancestorBox
    if ('ancestorBox' == target.node.id) {
      //console.log('ancestorBox=', target, av.dnd.ancestorBox);  //yes they are the same. could use in the above if statement.
      av.dnd.makeMove(source, nodes, target);
      }
  });

  av.dnd.gridCanvas.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of gridCanvas
    if ('gridCanvas' == target.node.id) {
      av.dnd.landGridCanvas(source, nodes, target);
      //console.log('before call av.grd.drawGridSetupFn');
      av.grd.drawGridSetupFn();
      //console.log('in gridCanvas.on');
    }
  });

  av.dnd.organIcon.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of organIcon
    //setTimeout(null,1000);
    if ('organIcon' == target.node.id) {
      if (av.debug.dnd) console.log('landOrganIcon: s, t', source, target);
      av.dnd.landOrganIcon(source, nodes, target);
      //Change to Organism Page
      av.ui.mainBoxSwap('organismBlock');
      organismCanvasHolderSize();
      var height = ($('#rightDetail').innerHeight() - 375) / 2;
      av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      av.dom.ExecuteAbout.style.height = height + 'px';
      av.dom.ExecuteJust.style.width = '100%';
      av.dom.ExecuteAbout.style.width = '100%';
      av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.activeOrgan.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeOrgan
    if ('activeOrgan' == target.node.id) {
      if (av.debug.dnd) console.log('activeOrgan: s, t', source, target);
      av.dnd.makeMove(source, nodes, target);
      //av.dnd.landActiveOrgan(source, nodes, target);
      av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.organCanvas.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of organCanvas
    if ('organCanvas' == target.node.id) {
      if (av.debug.dnd) console.log('landorganCanvas: s, t', source, target);
      av.dnd.landorganCanvas(source, nodes, target);
      av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.trashCan.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of trashCan
    if ('trashCan' == target.node.id) {
      var remove = {};
      remove.type = '';
      remove.dir = '';
      if (av.debug.dnd) console.log('trashCan: s, t', source, target);
      remove = av.dnd.landTrashCan(source, nodes, target);
      if ('' != remove.type) {
        //removeFzrItem(av.fzr, remove.dir, remove.type);
        remove.dir = av.fzr.dir[remove.domid];
        av.fwt.removeFzrItem(remove.dir, remove.type);
      }
    }
  });

  av.dnd.anlDndChart.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop0
    if ('anlDndChart' == target.node.id) {
      if (av.debug.dnd) console.log('anlDndChart: s, t', source, target);
      av.dnd.landAnlDndChart(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  av.dnd.graphPop0.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop0
    if ('graphPop0' == target.node.id) {
      if (av.debug.dnd) console.log('graphPop0: s, t', source, target);
      av.dnd.landgraphPop0(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  av.dnd.graphPop1.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop1
    if ('graphPop1' == target.node.id) {
      if (av.debug.dnd) console.log('graphPop1: s, t', source, target);
      av.dnd.landgraphPop1(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  av.dnd.graphPop2.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop2
    if ('graphPop2' == target.node.id) {
      if (av.debug.dnd) console.log('graphPop2: s, t', source, target);
      av.dnd.landgraphPop2(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  //need to figure out active configuration and active world
  av.dnd.fzWorld.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeConfig
    if ('fzWorld' == target.node.id) {
      var pkg = {};
      av.ui.num = av.fzr.wNum;
      pkg.source = source;
      pkg.nodes = nodes;
      pkg.copy = copy;
      pkg.target = target;
      av.dnd.landFzWorldFn(pkg);
      if (av.ui.num !== av.fzr.wNum) {
        av.fwt.makeFzrWorld(av.ui.num);
      } //tiba need to check this
    }
  });

  av.dnd.graphPop0.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeConfig
    //The following cases should never happen as they are defined as 'target' not as 'source' dnd types.
    // The code is here in case the dnd type is changed to 'source'
    switch (source.node.id) {
      case 'graphPop0':
        av.post.addUser('DnD: delete_from: graphPop0?');
        av.anl.pop[0].left = [];       //remove lines from population 1
        av.anl.pop[0].right = [];
        av.anl.AnaChartFn();
        break;
      case 'graphPop1':
        av.post.addUser('DnD: delete_from: graphPop1?');
        av.anl.pop[1].left = [];       //remove lines from population 2
        av.anl.pop[1].right = [];
        av.anl.AnaChartFn();
        break;
      case 'graphPop2':
        av.post.addUser('DnD: delete_from: graphPop2?');
        av.anl.pop[2].left = [];       //remove lines from population 3
        av.anl.pop[2].right = [];
        av.anl.AnaChartFn();
        break;
    }
  });

  if (av.debug.root) console.log('before Population Page');
//----------------------------------------------------------------------------------------------------------------------
//                                    End of dojo based DND triggered functions
//----------------------------------------------------------------------------------------------------------------------
//                                             Population page Buttons
//----------------------------------------------------------------------------------------------------------------------

// shifts the population page from Map (grid) view to setup parameters view and back again.
  av.dom.popSetupButton.onclick = function () {
    //av.post.addUser('Button: sendEmail');  //done in popBoxSwap
    av.ptd.popBoxSwap();   //in popControls.js
  };

  // hides and shows the population and selected organsim data on right of population page with 'Stats/mpa' button
  av.ptd.popStatView = function () {
    if (av.ptd.popStatFlag) {
      av.post.addUser('Button: popStatsButton: start hidding stats');
      av.ptd.popStatFlag = false;
      registry.byId('popRight').domNode.style.width = '1px';
      registry.byId('mainBC').layout();
      dijit.byId('popRight').set('style', 'display: block; visibility: hidden;');

    }
    else {
      av.post.addUser('Button: popStatsButton: start showing stats');
      av.ptd.popStatFlag = true;
      registry.byId('sotPane').domNode.style.width = '150px';
      registry.byId('popRight').domNode.style.width = '395px';
      registry.byId('mainBC').layout();
      av.ui.adjustPopRightSize();
      dijit.byId('popRight').set('style', 'display: block; visibility: visible;');

    }
  }

  document.getElementById('popStatsButton').onclick = function () {
    ///av.post.addUser('Button: popStatsButton');   //done in popStatView
    av.ptd.popStatView()
  };

  //--------------------------------------------------------------------------------------------------------------------
  ///   Map Grid buttons - New  Run/Pause Freeze
  //--------------------------------------------------------------------------------------------------------------------
  
  //process the run/Stop Button - a separate function is used so it can be flipped if the message to avida is not successful.
  av.dom.runStopButton.onclick = function () {
    av.post.addUser('Button: runStopButton = ' + av.grd.updateNum, '=updateNum;  ' + av.grd.msg.update + '=msg.update;  ' + av.grd.popStatsMsg.update + '=popStatsMsg.update');
    var upDate = av.msg.previousUpdate + 1;
    //av.post.addUser('Button: runStopButton = ' + upDate);
    av.ptd.runStopFn();
  };

  dijit.byId('mnCnPause').on('Click', function () {
    av.post.addUser('Button: mnCnPause');
    //console.log('about to call av.ptd.makePauseState()');
    av.msg.pause('now');
    //av.debug.log += '______Debug Note: about to call av.ptd.makePauseState() in AvidaEd.js line 986 \n';
    av.ptd.makePauseState();
  });
/*
  //process run/Stop buttons as above but for drop down menu
  dijit.byId('mnCnPopRun').on('Click', function () {
    console.log('label=', dijit.byId('mnCnPopRun').get('value'));
    if ('Population: Run' == dijit.byId('mnCnPopRun').get('value')) {
      console.log('in Loop');
      av.post.addUser('Button: mnCnPopRun');
      av.ptd.makeRunState();
      av.ptd.runPopFn();
    }
    else {
      av.post.addUser('Button: mnCnPause');
      //console.log('about to call av.ptd.makePauseState()');
      av.msg.pause('now');
      //av.debug.log += '______Debug Note: about to call av.ptd.makePauseState() in AvidaEd.js line 986 \n';
      av.ptd.makePauseState();
    }
    //dijit.byId('mnCnPopRun').set('value', 'Population: change');
  });
*/

  //process run/Stop buttons as above but for drop down menu
  dijit.byId('mnCnRun').on('Click', function () {
    av.post.addUser('Button: mnCnRun');
    av.ptd.makeRunState();
    av.ptd.runPopFn();
  });

  //process run/Stop buttons as above but for drop down menu
  dijit.byId('mnCnOne').on('Click', function () {
    av.post.addUser('Button: mnCnOne');
    av.ui.oneUpdateFlag = true;
    av.ptd.makeRunState();
    av.ptd.runPopFn();
  });

  av.dom.oneUpdateButton.onclick = function () {
    av.post.addUser('Button: oneUpdateButton');
    av.ui.oneUpdateFlag = true;
    av.ptd.makeRunState();
    av.ptd.runPopFn();
  };

  /******************************************* New Button and new Dialog **********************************************/

  dijit.byId('newDiscard').on('Click', function () {
    av.post.addUser('Button: newDiscard');
    newDialog.hide();
    av.msg.reset();
    //av.ptd.resetDishFn(true); //Only do when get reset back from avida after sending reset
    //console.log('newDiscard click');
  });

  dijit.byId('newSaveWorld').on('Click', function () {
    av.post.addUser('Button: newSaveWorld');
    av.ptd.FrPopulationFn();
    newDialog.hide();
    av.msg.reset();
    //av.ptd.resetDishFn(true); //Only do when get reset back from avida after sending reset
    //console.log('newSave click');
  });

  dijit.byId('newSaveConfig').on('Click', function () {
    av.post.addUser('Button: newSaveConfig');
    av.ptd.FrConfigFn();
    newDialog.hide();
    av.msg.reset();
    //av.ptd.resetDishFn(true); //Only do when get reset back from avida after sending reset
    //console.log('newSave click');
  });

  function newButtonBoth() {
    if ('prepping' == av.grd.runState) {// reset petri dish
      av.msg.reset();
      //av.ptd.resetDishFn(true); //Only do when get reset back from avida after sending reset
    }
    else {// check to see about saving current population
      av.msg.pause('now');
      av.ptd.makePauseState();
      newDialog.show();
    }
  }

//  document.getElementById('newDishButton').onclick = function () {
  av.dom.newDishButton.onclick = function () {
    av.post.addUser('Button: newDishButton');
    newButtonBoth();
  };

  dijit.byId('mnCnNewpop').on('Click', function () {
    av.post.addUser('Button: mnCnNewpop');
    newButtonBoth();
  });

  //**************************************      Freeze Button      *****************************************************
  //Saves either configuration or populated dish
  //Also creates context menu for all new freezer items.*/
  document.getElementById('freezeButton').onclick = function () {
    av.post.addUser('Button: freezeButton');
    if ('prepping' == av.grd.runState) av.ptd.FrConfigFn();
    else {
      if (5 > av.msg.ByCellIDgenome.length) {
        document.getElementById('FzOrganismSpan').style.display = 'none';
      }  //block
      else document.getElementById('FzOrganismSpan').style.display = 'inline';
      fzDialog.show();
    }
  };

  dijit.byId('FzConfigurationButton').on('Click', function () {
    av.post.addUser('Button: FzConfigurationButton');
    fzDialog.hide();
    av.ptd.FrConfigFn();
  });

  //Drop down menu to save a configuration item
  dijit.byId('mnFzConfig').on('Click', function () {
    av.post.addUser('Button: mnFzConfig');
    av.ptd.FrConfigFn();
  });

  //
  dijit.byId('FzOrganismButton').on('Click', function () {
    av.post.addUser('Button: FzOrganismButton');
    fzDialog.hide();
    av.ptd.FrOrganismFn('selected');
  });

  //button to freeze a population
  dijit.byId('FzPopulationButton').on('Click', function () {
    av.post.addUser('Button: FzPopulationButton');
    fzDialog.hide();
    av.ptd.FrPopulationFn();
  });

  dijit.byId('mnFzPopulation').on('Click', function () {
    av.post.addUser('Button: mnFzPopulation');
    av.ptd.FrPopulationFn();
  });

  //Buttons on drop down menu to save an organism
  dijit.byId('mnFzOrganism').on('Click', function () {
    av.post.addUser('Button: mnFzOrganism');
    av.ptd.FrOrganismFn('selected')
  });

  //Buttons on drop down menu to save an offspring
  dijit.byId('mnFzOffspring').on('Click', function () {
    av.post.addUser('Button: mnFzOffspring');
    av.ptd.FrOrganismFn('offspring')
  });

  //Buttons on drop down menu to add Configured Dish to an Experiment
  dijit.byId('mnFzAddConfigEx').on('Click', function () {
    av.post.addUser('Button: mnFzAddConfigEx');
    av.dnd.FzAddExperimentFn('fzConfig', 'activeConfig', 'c');
  });

  //Buttons on drop down menu to add Organism to an Experiment
  dijit.byId('mnFzAddGenomeEx').on('Click', function () {
    av.post.addUser('Button: mnFzAddGenomeEx');
    av.dnd.FzAddExperimentFn('fzOrgan', 'ancestorBox', 'g');
  });

  //Buttons on drop down menu to add Populated Dish to an Experiment
  dijit.byId('mnFzAddPopEx').on('Click', function () {
    av.post.addUser('Button: mnFzAddPopEx');
    av.dnd.FzAddExperimentFn('fzWorld', 'activeConfig', 'w');
  });

  //Buttons on drop down menu to put an organism in Organism Viewer
  dijit.byId('mnFzAddGenomeView').on('Click', function () {
    av.post.addUser('Button: mnFzAddGenomeEx');
    av.dnd.FzAddExperimentFn('fzOrgan', 'activeOrgan', 'g');
    av.ui.mainBoxSwap('organismBlock');
    organismCanvasHolderSize();
    var height = ($('#rightDetail').innerHeight() - 375) / 2;
    av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    av.dom.ExecuteAbout.style.height = height + 'px';
    av.dom.ExecuteJust.style.width = '100%';
    av.dom.ExecuteAbout.style.width = '100%';
    av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
  });

  //Buttons on drop down menu to add Populated Dish to Analysis
  dijit.byId('mnFzAddPopAnalysis').on('Click', function () {
    av.post.addUser('Button: mnFzAddPopEx');
    av.dnd.FzAddExperimentFn('fzWorld', 'anlDndChart', 'w');
    av.anl.AnaChartFn();
  });


  // End of Freezer functions
  //---------------------------------------------- Restart Avida web worker --------------------------------------------

  //http://www.w3schools.com/html/tryit.asp?filename=tryhtml5_webworker
  av.ui.restartAvida = function () {
    userMsgLabel.textContent = 'reloading Avida . . .';

    av.aww.uiWorker.terminate();
    av.aww.uiWorker = null;

    //console.log('just killed webWorker');

    if (typeof(Worker) !== 'undefined') {
      if (null == av.aww.uiWorker) {
        av.aww.uiWorker = new Worker('avida.js');
        console.log('webworker recreated');
        av.debug.log += '\nuiA: ui killed avida webworker and started a new webworker'
      }
    }
    else {
      userMsgLabel.textContent = "Sorry, your browser does not support Web workers and Avida won't run";
    }

    //need to 'start new experiment'
    av.ptd.resetDishFn(false);  //do not send reset to avida; avida restarted
    restartAvidaDialog.hide();
  }

  document.getElementById('restartAvidaNow').onclick = function () {
    av.post.addUser('Button: restartAvidaNow');
    av.ui.restartAvida();
  }

  document.getElementById('restartAvidaFrzConfig').onclick = function () {
    av.post.addUser('Button: restartAvidaFzrConfig');
    av.ptd.FrConfigFn();
  }

  //test - delete later ------------------------------------------------------------------------------------------------
  document.getElementById('mnDbRestartAvida').onclick = function () {
    av.post.addUser('Button: mnDbRestartAvida');
    av.aww.restartAvidaFn();
  }

  document.getElementById('mnDbDiagnostic').onclick = function () {
    av.post.addUser('Button: mnDbDiagnostic');
    av.dcn.diagnosticConsoleFn();
  }

  document.getElementById('mnDbThrowData').onclick = function () {
    'use strict';
    av.post.addUser('Button: mnDbThrowData');
    console.log('av', av);
    console.log('fzr', av.fzr);
    console.log('parents', av.parents);
    console.log('av.grd.msg', av.grd.msg);
    console.log('av.grd.popStatsMsg', av.grd.popStatsMsg);
    console.log('av.dnd.fzConfig', av.dnd.fzConfig);
    console.log('av.dnd.fzOrgan', av.dnd.fzOrgan);
    console.log('av.dnd.fzWorld', av.dnd.fzWorld);
    console.log('av.dnd.activeConfig', av.dnd.activeConfig);
    console.log('av.dnd.activeOrgan', av.dnd.activeOrgan);
    console.log('av.dnd.ancestorBox', av.dnd.ancestorBox);
    console.log('av.debug.log', av.debug.log);
  };

  document.getElementById('mnDbThrowError').onclick = function () {
    'use strict';
    av.post.addUser('Button: mnDbThrowError');
    var george = fred;
  };

  document.getElementById('mnDbLineLog').onclick = function () {
    'use strict';
    av.debug.log += '\n -----------------------------------------------------------------------------------------------\n';
  };

  //--------------------------------------------------------------------------------------------------------------------
  //    mouse DND functions
  //--------------------------------------------------------------------------------------------------------------------

  //mouse click started on Organism Canvas - only offspring can be selected if present
  $(document.getElementById('organCanvas')).on('mousedown', function (evt) {
    av.post.addUser('mousedown: organCanvas('+evt.offsetX + ', ' + evt.offsetY + ')');
    av.mouse.downOrganCanvasFn(evt);
  });

  //if a cell is selected, arrow keys can move the selection
  $(document).keydown(function (event) {
    //av.post.addUser(' ');   //in av.mouse.arrowKeyOnGrid
    av.mouse.arrowKeysOnGrid(event)
  });

  //av.mouse down on the grid
  $(document.getElementById('gridCanvas')).on('mousedown', function (evt) {
    av.post.addUser('mousedown: gridCanvas('+evt.offsetX + ', ' + evt.offsetY + ')');
    av.mouse.downGridCanvasFn(evt)  });

  //mouse move anywhere on screen - not currently in use.
  /*  $(document.getElementById('gridCanvas')).on('mousemove', function handler (evt) {
   //$(document).on('mousemove', function handler(evt) { //needed so cursor changes shape
   //console.log('gd move');
   //document.getElementById('gridCanvas').style.cursor = 'copy';
   //document.getElementById('trashCan').style.cursor = 'copy';
   //console.log('av.mouseMove cursor GT', document.getElementById('gridCanvas').style.cursor, dom.byId('trashCan').style.cursor);
   //if (av.debug.mouse) console.log('________________________________av.mousemove');
   if (!av.mouse.nearly([evt.offsetX, evt.offsetY], av.mouse.DnGridPos)) {
   //if (av.debug.mouse) console.log('________________________________');
   //if (av.debug.mouse) console.log('gd draging');
   if (av.mouse.Dn) av.mouse.Drag = true;
   }
   $(document).off('av.mousemove', handler);
   });
   */

  $(document).on('pointerup', function(evt) {
    av.mouse.UpGridPos = [evt.originalEvent.offsetX, evt.originalEvent.offsetY];
  });

    //When mouse button is released, return cursor to default values
  $(document).on('mouseup', function (evt) {
    'use strict';
    var target = '';
    if (av.debug.mouse) console.log('in mouseup target:', evt.target.id, '; event:', evt);
    if (av.debug.mouse) console.log('in mouseup target:', evt.target.id);
    av.mouse.makeCursorDefault();
    av.mouse.UpGridPos = [evt.offsetX, evt.offsetY];
    if (av.debug.mouse) console.log('AvidaED.js: mouse.UpGridPosX, y', av.mouse.UpGridPos[0], av.mouse.UpGridPos[1]);
    av.mouse.Dn = false;

    // --------- process if something picked to dnd ------------------
    if ('parent' == av.mouse.Picked) {
      av.mouse.Picked = '';
      av.mouse.ParentMouse(evt, av);
      if ('gridCanvas' == evt.target.id || 'trashCanImage' == evt.target.id) {
        //console.log('before call av.grd.drawGridSetupFn');
        av.grd.drawGridSetupFn();
      }
      else if ('organIcon' == evt.target.id) {
        //Change to Organism Page
        av.ui.mainBoxSwap('organismBlock');
        organismCanvasHolderSize();
        var height = ($('#rightDetail').innerHeight() - 375) / 2;
        av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        av.dom.ExecuteAbout.style.height = height + 'px';
        av.dom.ExecuteJust.style.width = '100%';
        av.dom.ExecuteAbout.style.width = '100%';
        if (av.debug.mouse) console.log('from parent', av.parent, '; fzr', av.fzr);
        av.post.addUser('Dragged item to Organism Icon');
        av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
      }
    }
    else if ('offspring' == av.mouse.Picked) {
      target = av.mouse.offspringMouse(evt, av.dnd, av.fio, av.fzr, av.gen);
      av.mouse.Picked = '';
    }
    else if ('kid' == av.mouse.Picked) {
      av.mouse.Picked = '';
      target = av.mouse.kidMouse(evt, av.dnd, av.fzr, av.grd);
      if (av.debug.mouse) console.log('kidMouse: target', target, '===============', evt.target.id);
      if ('organIcon' == evt.target.id) {
        //Change to Organism Page
        av.ui.mainBoxSwap('organismBlock');
        organismCanvasHolderSize();
        var height = ($('#rightDetail').innerHeight() - 375) / 2;
        av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        av.dom.ExecuteAbout.style.height = height + 'px';
        av.dom.ExecuteJust.style.width = '100%';
        av.dom.ExecuteAbout.style.width = '100%';
        av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
      }
      /*      else if ('fzOrgan' == target) {
       //make_database_entry if using a database (av.fio, av.fzr);
       }
       */
    }
    av.mouse.Picked = '';
  });

  // *******************************************************************************************************************
  //                                      Pouplation Page
  // *******************************************************************************************************************
  //                                      Draw Population Grid
  // *******************************************************************************************************************

  //Set up canvas objects
  av.grd.CanvasScale = document.getElementById('scaleCanvas');  //tiba should change to av.dom.scaleCanvas
  av.grd.sCtx = av.grd.CanvasScale.getContext('2d');
  av.grd.CanvasGrid = document.getElementById('gridCanvas');
  av.grd.cntx = av.grd.CanvasGrid.getContext('2d');
  av.grd.CanvasSelected = document.getElementById('sotColor');
  av.grd.selCtx = av.grd.CanvasSelected.getContext('2d');
  av.grd.SelectedWd = $('#sotColor').innerWidth();
  av.grd.SelectedHt = $('#sotColor').innerHeight();

  av.grd.CanvasScale.width = document.getElementById('gridControlTable').clientWidth - 1;
  av.grd.CanvasGrid.width = av.dom.gridHolder.clientHeight / 2;
  av.grd.CanvasGrid.width = av.dom.gridHolder.clientWidth - 1; //?? may need to delete 
  //av.grd.CanvasGrid.height = $('#gridHolder').innerHeight() - 16 - av.grd.CanvasScale.height;
  av.grd.CanvasGrid.height = 15;

  //--------------------------------------------------------------------------------------------------------------------
  if (av.debug.root) console.log('before av.grd.drawGridSetupFn');

  av.grd.drawGridSetupFn = function () {
    'use strict';
    if (undefined != av.grd.msg) {
      if ('prepping' != av.grd.runState && undefined != av.grd.msg.fitness) {
        //av.grd.setMapData();  //update color information for offpsring once run has started only if screen visable.
        av.grd.findLogicOutline();
      }
    }
    if ('populationBlock' === av.ui.page && 'Setup' === av.dom.popSetupButton.textContent) {
      if ('None' == dijit.byId('colorMode').value) {
        if (av.grd.newlyNone) {
          av.grd.newlyNone = false;
          av.grd.cntx.fillStyle = av.color.names['Black'];
          av.grd.cntx.fillRect(1, 1, av.grd.CanvasGrid.width - 1, av.grd.CanvasGrid.height - 1);
        }
      }
      else {
        av.grd.newlyNone = true;
        av.grd.notInDrawingGrid = false;
        if (undefined != av.grd.msg) {
          if ('prepping' != av.grd.runState && undefined != av.grd.msg.fitness) {
            av.grd.setMapData();  //update color information for offpsring once run has started
            //av.grd.findLogicOutline(); //needs to be done for all updates
          }
        }
        //figure out scale or legend
        av.grd.CanvasScale.width = document.getElementById('gridControlTable').clientWidth - 1;
        document.getElementById('popBot').style.height = '5px';
        if ('Ancestor Organism' == dijit.byId('colorMode').value) {
          av.grd.drawLegend();
        }
        else {
          av.grd.gradientScale();
        }
        //console.log('after drawing scale or legend. update=',av.grd.oldUpdate);

        document.getElementById('popBot').style.height = document.getElementById('popBot').scrollHeight + 'px';
        dijit.byId('populationBlock').resize();

        var gridHolderHt = av.dom.gridHolder.clientHeight;
        av.ui.num = Math.floor(gridHolderHt / 4);

        av.grd.CanvasGrid.width = av.dom.gridHolder.clientWidth - 1;
        av.grd.CanvasGrid.height = gridHolderHt - 2;
        av.grd.spaceX = av.grd.CanvasGrid.width;
        av.grd.spaceY = av.grd.CanvasGrid.height;

        av.grd.findGridSize(av.grd, av.parents);
        if (av.dom.gridHolder.scrollHeight == av.dom.gridHolder.clientHeight + 17) {
          var numGH = av.dom.gridHolder.clientHeight;
          av.grd.CanvasGrid.height = numGH - 6 - 17;
          av.grd.findGridSize(av.grd, av.parents);     //in populationGrid.js
          consold.log('inside DrawGridSetupFn in odd if statement ----------------------------------')
        }
        av.grd.drawGridUpdate();   //in populationGrid.js

        rescaleLabel.textContent = av.grd.fillRescale;
        av.grd.notInDrawingGrid = true;
      }
    }
  }

  // The rest of grid canvas drawing code is in populationGrid.js

  // *******************************************************************************************************************
  //        Color Map Color Mode and Zoom Slide Controls
  // *******************************************************************************************************************

  // Get color map data from Avida and draw
  dijit.byId('colorMode').on('Change', function () {
    var scaleType = dijit.byId('colorMode').value;
    //Redraw Grid;
    //console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
  });

  // Zoom slide - display only not avida
  av.grd.zoomSlide = new HorizontalSlider({
    name: 'zoomSlide',
    value: 1,
    minimum: 1,
    maximum: 10,
    intermediateChanges: true,
    discreteValues: 10,
    style: 'height: auto; width: 80px;float:right',
    onChange: function (value) {
      av.grd.zoom = value;
      //console.log('zoomSlide', av.grd.zoom);
      //console.log('before call av.grd.drawGridSetupFn');
      av.grd.drawGridSetupFn();
    }
  }, 'zoomSlide');

  av.grd.colorMap = 'Gnuplot2';
  dijit.byId('mnGnuplot2').attr('disabled', true);

  dijit.byId('mnViridis').on('Click', function () {
    av.post.addUser('Button: mnViridis');
    dijit.byId('mnCubehelix').attr('disabled', false);
    dijit.byId('mnGnuplot2').attr('disabled', false);
    dijit.byId('mnViridis').attr('disabled', true);
    av.grd.colorMap = 'Viridis';
    //console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
  });

  dijit.byId('mnGnuplot2').on('Click', function () {
    av.post.addUser('Button: mnGnuplot2');
    dijit.byId('mnCubehelix').attr('disabled', false);
    dijit.byId('mnGnuplot2').attr('disabled', true);
    dijit.byId('mnViridis').attr('disabled', false);
    av.grd.colorMap = 'Gnuplot2';
    //console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
  });

  dijit.byId('mnCubehelix').on('Click', function () {
    av.post.addUser('Button: mnCubehelix');
    dijit.byId('mnCubehelix').attr('disabled', true);
    dijit.byId('mnGnuplot2').attr('disabled', false);
    dijit.byId('mnViridis').attr('disabled', false);
    av.grd.colorMap = 'Cubehelix';
    //console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
    av.post.addUser('Button: mnCubehelix pressed');
  });

  // *******************************************************************************************************************
  //    Buttons that select organisms that perform a logic function
  // *******************************************************************************************************************
  if (av.debug.root) console.log('before logic buttons');

  //    av.post.addUser('Button: notButton');    //done in av.ptd.bitToggle
  document.getElementById('notButton').onclick = function () {
    av.ptd.bitToggle('notButton');
  } //av.ptd.bitToggle in popControls.js
  document.getElementById('nanButton').onclick = function () {
    av.ptd.bitToggle('nanButton');
  }
  document.getElementById('andButton').onclick = function () {
    av.ptd.bitToggle('andButton');
  }
  document.getElementById('ornButton').onclick = function () {
    av.ptd.bitToggle('ornButton');
  }
  document.getElementById('oroButton').onclick = function () {
    av.ptd.bitToggle('oroButton');
  }
  document.getElementById('antButton').onclick = function () {
    av.ptd.bitToggle('antButton');
  }
  document.getElementById('norButton').onclick = function () {
    av.ptd.bitToggle('norButton');
  }
  document.getElementById('xorButton').onclick = function () {
    av.ptd.bitToggle('xorButton');
  }
  document.getElementById('equButton').onclick = function () {
    av.ptd.bitToggle('equButton');
  };

  // -------------------------------------------------------------------------------------------------------------------
  //                    Population Chart   ; pop chart; popchart
  // -------------------------------------------------------------------------------------------------------------------

  // Chart control on population page
  //Set Y-axis title and choose the correct array to plot
  dijit.byId('yaxis').on('Change', function () {
    av.grd.ytitle = dijit.byId('yaxis').value;
    //need to get correct array to plot from freezer
    //console.log('changeyaxis popChartFn');
    av.grd.popChartFn();
  });

  // initialize needs to be in AvidaED.js
  av.grd.popChartInit = function () {
    av.pch.clearPopChrt();
    av.pch.divSize('av.grd.popChartInit');
    var popData = av.pch.data;

    if (undefined == av.dom.popChart.data) {
      if (av.debug.plotly) console.log('before plotly.plot in popChartInit');
      av.debug.log += '\n     --uiD: Plotly.plot("popChart", popData, av.pch.layout, av.pch.widg) in AvidaED.js at 1565';
      av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'popData, av.pch.layout, av.pch.widg', [popData, av.pch.layout, av.pch.widg]);
      Plotly.plot('popChart', popData, av.pch.layout, av.pch.widg);
      if (av.debug.plotly) console.log('after plotly.plot in poChartInit');
    }
    else {
      //av.pch.update = {
      //  xaxis: {range: [0, 10]}, yaxis: {range: [0, 1]},
      //  width: av.pch.wd,
      //  height: av.pch.ht
      //};
      av.pch.update = {
        autorange: true,
        width: av.pch.wd,
        height: av.pch.ht
      };

      if (av.debug.plotly) console.log('popData', popData);
      //Plotly.purge(av.dom.popChart);      //does not seem to work once plotly.animate has been used
      //console.log('data=', av.dom.popChart.data);
      if (undefined != av.dom.popChart.data[0]) {
        av.debug.log += '\n     --uiD: Plotly: Plotly.deleteTraces(av.dom.popChart, [0, 1]) in AvidaED.js at 1599';
        av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.popChart', [av.dom.popChart]);
        Plotly.deleteTraces(av.dom.popChart, [0, 1]);
        av.debug.log += '\n     --uiD: Plotly.relayout(av.dom.popChart, av.pch.update) in av.grd.popChartInit in AvidaED.js at 1589';
        av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.popChart, av.pch.update', [av.dom.popChart, av.pch.update]);
        Plotly.relayout(av.dom.popChart, av.pch.update);
      }
    }
    av.dom.popChart.style.visibility='hidden';
    //console.log('layout.ht, wd =', av.dom.popChart.layout.height, av.dom.popChart.layout.width);
  };

  av.grd.popChartFn = function () {
    'use strict';
    //console.log('av.grd.runState = ', av.grd.runState);
    if ('prepping' === av.grd.runState) {   //values can be prepping, started, or world
      av.dom.popChart.style.visibility = 'hidden';
    }
    else {
      av.dom.popChart.style.visibility = 'visible';
      if ('none' === dijit.byId('yaxis').value) {
        if (undefined !== av.dom.popChart.data) {
          console.log('before purge in popChartFn');
          av.debug.log += '\n     --uiD: Plotly: Plotly.deleteTraces(av.dom.popChart, [0, 1]) in AvidaED.js at 1621';
          av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.popChart', [av.dom.popChart]);
          Plotly.deleteTraces(av.dom.popChart, [0, 1]);
          //Plotly.purge(av.dom.popChart);      //does not seem to work once plotly.animate has been used
          console.log('after purge in popChartFn');
        }
      }
      else {
        av.pch.divSize('av.grd.popChartFn');

        if (dijit.byId('yaxis').value === av.pch.yValue) av.pch.yChange = false;
        else {
          av.pch.yChange = true;
          av.pch.yValue = dijit.byId('yaxis').value;
        }
        //console.log('av.pch.maxFit=',av.pch.aveMaxFit, '; av.pch.logMaxFit=',av.pch.logMaxFit, '; av.pch.aveFit = ', av.pch.aveFit);
        //console.log('av.pch.logFit = ', av.pch.logFit);
        if ('Average Fitness' === dijit.byId('yaxis').value) {
          av.pch.popY = av.pch.aveFit;
          av.pch.logY = av.pch.logFit;
          //console.log('av.pch.maxFit=',av.pch.aveMaxFit, '; av.pch.logMaxFit=',av.pch.logMaxFit);
          av.pch.maxY = (av.pch.aveMaxFit > av.pch.logMaxFit) ? av.pch.aveMaxFit : av.pch.logMaxFit;
          //console.log('aveMaxFit=', av.pch.aveMaxFit, '; logMaxFit=', av.pch.logMaxFit, '; maxY=', av.pch.maxY);
          //console.log('aveFit', av.pch.aveFit);
          //console.log('logFit', av.pch.logFit);
        }
        else if ('Average Offspring Cost' == dijit.byId('yaxis').value) {
          av.pch.popY = av.pch.aveCst;
          av.pch.logY = av.pch.logCst;
          av.pch.maxY = (av.pch.aveMaxCst > av.pch.logMaxCst) ? av.pch.aveMaxCst : av.pch.logMaxCst;
        }
        else if ('Average Energy Acq. Rate' == dijit.byId('yaxis').value) {
          av.pch.popY = av.pch.aveEar;
          av.pch.logY = av.pch.logEar;
          av.pch.maxY = (av.pch.aveMaxEar > av.pch.logMaxEar) ? av.pch.aveMaxEar : av.pch.logMaxEar;
        }
        else if ('Number of Organisms' == dijit.byId('yaxis').value) {
          av.pch.popY = av.pch.aveNum;
          av.pch.logY = av.pch.logNum;
          av.pch.maxY = (av.pch.aveMaxNum > av.pch.logMaxNum) ? av.pch.aveMaxNum : av.pch.logMaxNum;
        }
        else if ('Number Viable' == dijit.byId('yaxis').value) {
          av.pch.popY = av.pch.aveVia;
          av.pch.logY = av.pch.logNum;
          av.pch.maxY = (av.pch.aveMaxVia > av.pch.logMaxNum) ? av.pch.aveMaxVia : av.pch.logMaxNum;
        }
        else {
          av.pch.yValue = 'none';
          av.pch.popY = [];
          av.pch.logY = [];
          av.pch.maxY = 0.1;
        }
        //console.log('xx   after', av.pch.xx);
        //console.log('popY after', av.pch.logY);
        //console.log('maxY', av.pch.maxY);
        //console.log('logY after', av.pch.logY);

        //av.pch.trace0 = {x:av.pch.xx, y:av.pch.popY, type:'scatter', mode: 'lines'};
        //av.pch.trace1 = {x:av.pch.xx, y:av.pch.logY, type:'scatter', mode: 'lines'};
        av.pch.trace0.x = av.pch.xx;
        av.pch.trace0.y = av.pch.popY;
        av.pch.trace1.x = av.pch.xx;
        av.pch.trace1.y = av.pch.logY;
        //console.log('trace0',av.pch.trace0);
        //console.log('trace1',av.pch.trace1);

        //var popData = [av.pch.trace0];
        var popData = [av.pch.trace0, av.pch.trace1];
        var rstl0 = {x: [av.pch.xx], y: [av.pch.popY]};
        var rstl1 = {x: [av.pch.xx], y: [av.pch.logY]};

        //if (av.pch.yChange) {
        if (false) {
          av.pch.yChange = false;
          av.pch.layout.width = av.pch.wd;
          av.pch.layout.height = av.pch.ht;
          console.log('before purge in update grid chart');
          av.debug.log += '\n     --uiD: Plotly: Plotly.purge(av.dom.popChart)  in AvidaED.js at 1690';
          av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.popChart', [av.dom.popChart]);
          Plotly.purge(av.dom.popChart);
          console.log('after purge in update grid chart');
          av.debug.log += '\n     --uiD: Plotly: Plotly.plot("popChart", popData, av.pch.layout, av.pch.widg)  in AvidaED.js at 1694';
          av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'popData, av.pch.layout, av.pch.widg', [popData, av.pch.layout, av.pch.widg]);
          Plotly.plot('popChart', popData, av.pch.layout, av.pch.widg);
          //Plotly.plot('popChart', popData, av.pch.layout);
          console.log('purge chart.popData=', av.dom.popChart.data);
          //console.log('purge chart.layout=', av.dom.popChart.layout);
        }
        else {
          //av.pch.update = {
          //  xaxis: {range: [0, av.pch.popY.length + 1]}, yaxis: {range: [0, 1.1 * av.pch.maxY]},
          //  width: av.pch.wd,
          //  height: av.pch.ht
          //};
          av.pch.update = {
            autorange: true,
            width: av.pch.wd,
            height: av.pch.ht
          };
          //av.pch.update = {xaxis: {range: [0, av.pch.popY.length+1]}, yaxis: {range: [0, av.pch.maxY]}};

          //console.log('before relayout in update grid chart');
          if (av.debug.plotly) console.log('av.pch.update', av.pch.update);

          if (undefined == av.dom.popChart.data) {
            if (av.debug.plotly) console.log('before plot');
            av.debug.log += '\n     --uiD: Plotly: Plotly.plot("popChart", popData, av.pch.layout, av.pch.widg)  in AvidaED.js at 1714';
            av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'popData, av.pch.layout, av.pch.widg', [popData, av.pch.layout, av.pch.widg]);
            Plotly.plot('popChart', popData, av.pch.layout, av.pch.widg);
            if (av.debug.plotly) console.log('after plot');
          }
          else if (0 == av.dom.popChart.data.length) {
            if (av.debug.plotly) console.log('before plot');
            av.debug.log += '\n     --uiD: Plotly: Plotly.plot("popChart", popData, av.pch.layout, av.pch.widg) in AvidaED.js at 1724';
            av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'popData, av.pch.layout, av.pch.widg', [popData, av.pch.layout, av.pch.widg]);
            Plotly.plot('popChart', popData, av.pch.layout, av.pch.widg);
          }
          else {
            if (av.brs.isChrome) {
              av.debug.log += '\n     --uiD: Plotly: Plotly.restyle("popChart", rstl0, [0]) at 1734';
              av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'rstl0', [rstl0]);
              Plotly.restyle('popChart', rstl0, [0]);
              av.debug.log += '\n     --uiD: Plotly: Plotly.restyle("popChart", rstl1, [1])  in AvidaED.js at 1738';
              av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'rstl1', [rstl1]);
              Plotly.restyle('popChart', rstl1, [1]);
              av.debug.log += '\n     --uiD: Plotly.relayout(av.dom.popChart, av.pch.update) in AvidaED.js at 1741';
              av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.popChart, av.pch.update', [av.dom.popChart, av.pch.update]);
              Plotly.relayout(av.dom.popChart, av.pch.update);
            }
            else {
              //console.log('trace0', av.pch.trace0);
              //Plotly.restyle(graphDiv, update, [1, 2]);
              //Plotly.restyle(av.dom.popChart, av.pch.trace0, [0]);
              //Plotly.restyle(av.dom.popChart, av.pch.trace1, [1]);
              av.debug.log += '\n     --uiD: Plotly.relayout(av.dom.popChart, av.pch.update) in AvidaED.js at 1750';
              av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.popChart, av.pch.update', [av.dom.popChart, av.pch.update]);
              Plotly.relayout(av.dom.popChart, av.pch.update);
              //console.log('after relayout in update grid chart');
              if (av.debug.plotly) console.log('popData', popData);
              //Plotly.animate('popChart', {popData});
              av.debug.log += '\n     --uiD: Plotly.aminate("popChart", {popData}) in AvidaED.js at 1757';
              av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'popData', [popData]);
              Plotly.aminate('popChart', {popData});
              //Plotly.aminate('popChart', popData);
              //av.pch.Plotly.aminate('popChart', {popData});
              if (av.debug.plotly) console.log('after animate in update grid chart');
            }
          }
          if (av.debug.plotly) console.log('chart.popData=', av.dom.popChart.data);
          if (av.debug.plotly) console.log('chart.layout=', av.dom.popChart.layout);
        }
      }
    }
  };

  av.grd.popChartClear = function () {
    'use strict';
    //console.log('in popChartClear');
  };
  //av.grd.popChartClear();

  // **************************************************************************************************************** */
  // ******* Population Setup Buttons from 'Setup' subpage ********* */
  // **************************************************************************************************************** */
  av.grd.gridWasCols = Number(av.dom.sizeCols.value);
  av.grd.gridWasRows = Number(av.dom.sizeRows.value);

  av.ptd.popSizeFn = function() {
    //console.log('av.ptd.popSizeFn: should call if viable size');
    var NewCols = Number(av.dom.sizeCols.value);
    var NewRows = Number(av.dom.sizeRows.value);
    //console.log('NewCols, Rows', NewCols, NewRows);
    av.dom.sizeCells.innerHTML = 'for a total of ' + NewCols * NewRows + ' cells';
    //av.dom.sizeCells.text = 'for a total of ' + NewCols * NewRows + ' cells';
    av.dom.sizeCols.style.color = 'black';
    av.dom.sizeRows.style.color = 'black';
    av.dom.sizeCells.style.color = 'black';
    //Linear scale the position for Ancestors added by hand;
    if (undefined != av.parents.handNdx) {
      var lngth = av.parents.handNdx.length;
      for (var ii = 0; ii < lngth; ii++) {
        //console.log('old cr', av.parents.col[av.parents.handNdx[ii]], av.parents.row[av.parents.handNdx[ii]]);
        av.parents.col[av.parents.handNdx[ii]] = Math.floor(NewCols * av.parents.col[av.parents.handNdx[ii]] / av.grd.gridWasCols);  //was trunc
        av.parents.row[av.parents.handNdx[ii]] = Math.floor(NewRows * av.parents.row[av.parents.handNdx[ii]] / av.grd.gridWasRows);  //was trunc
        av.parents.AvidaNdx[av.parents.handNdx[ii]] = av.parents.col[av.parents.handNdx[ii]] + NewCols * av.parents.row[av.parents.handNdx[ii]];
        //console.log('New cr', av.parents.col[av.parents.handNdx[ii]], av.parents.row[av.parents.handNdx[ii]]);
      }
    }
    av.grd.gridWasCols = Number(av.dom.sizeCols.value);
    av.grd.gridWasRows = Number(av.dom.sizeRows.value);
    //reset zoom power to 1
    av.grd.zoomSlide.set('value', 1);
    av.parents.placeAncestors();
    //are any parents on the same cell?
    av.grd.cellConflict(NewCols, NewRows);
  }

  av.ptd.mutePopInputChange = function() {
    var muteNum = Number(av.dom.mutePopInput.value);
    //console.log('muteNum=', muteNum);
    if (muteNum >= 0 && muteNum <= 100) {
      av.ptd.validMuteInuput=true;
      av.dom.mutePopError.style.color = 'black';
      av.dom.mutePopError.innerHTML = '';
      av.dom.userMsgLabel.innerHTML = '';
    }
    else {
      av.ptd.validMuteInuput=false;
      av.dom.mutePopError.style.color = 'red';
      av.dom.mutePopError.innerHTML = '';
      av.dom.userMsgLabel.innerHTML = '';
      if (muteNum <= 0) { av.dom.mutePopError.innerHTML += 'Mutation rate must be greater than zero percent. '; console.log('<0');}
      if (muteNum >= 100) { av.dom.mutePopError.innerHTML += 'Mutation rate must be 100% or less. '; console.log('>0');}
      if ( isNaN(muteNum) ) {av.dom.mutePopError.innerHTML += 'Mutation rate must be a valid number. '; console.log('==NaN');}
    }
  };

  dijit.byId('allSugarDrop').on('Change', function () {
    var allSugar = dijit.byId('allSugarDrop').value;
    av.ptd.allSugar(allSugar);
    dijit.byId('allSugarDrop').set('value', 'allNeutral');
  });

  av.ptd.gridChange = function(tmpval) {
    var colNum = Number(av.dom.sizeCols.value);
    var rowNum = Number(av.dom.sizeRows.value);
    //console.log('col, row=', colNum, rowNum);
    if (colNum > 0 && colNum <= 100 && rowNum > 0 && rowNum <= 100) {   
      //console.log('valid response');
      av.ptd.popSizeFn();
      av.ptd.validGridSize = true;
      av.dom.userMsgLabel.innerHTML = '';
    }
    else {
      av.ptd.validGridSize = false;
      if (colNum > 0 && colNum <= 100) av.dom.sizeCols.style.color = 'black';
      else av.dom.sizeCols.style.color = 'red'
      if (rowNum > 0 && rowNum <= 100) av.dom.sizeRows.style.color = 'black';
      else av.dom.sizeRows.style.color = 'red';
      av.dom.sizeCells.style.color = 'red';
      console.log('not valid; col, row=', colNum, rowNum);
      av.dom.sizeCells.innerHTML = '';
      av.dom.userMsgLabel.innerHTML = '';
      if (colNum <= 0) { av.dom.sizeCells.innerHTML += 'Number of columns must be greater than zero. '; console.log('<0');}
      if (colNum >= 100) { av.dom.sizeCells.innerHTML += 'Number of columns must be 100 or less. '; console.log('>0');}
      if ( isNaN(colNum) ) {av.dom.sizeCells.innerHTML += 'Number of columns must be a valid number. '; console.log('==NaN');}
      if (rowNum <= 0) { av.dom.sizeCells.innerHTML += 'Number of rows must be greater than zero. '; console.log('<0');}
      if (rowNum >= 100) { av.dom.sizeCells.innerHTML += 'Number of rows must be 100 or less. '; console.log('>0');}
      if ( isNaN(rowNum) ) {av.dom.sizeCells.innerHTML += 'Number of rows must be a valid number. '; console.log('==NaN');}
    }
  };

  av.ptd.rowChange = function(tmpval) {
    console.log('rows=', av.dom.sizeRows.value);
    var tmpNum = Number(av.dom.sizeRows.value);
    console.log('num=', tmpNum);
    if (tmpNum > 0 && tmpNum <= 100) {   //max number of columns
      console.log('valid response');
      av.ptd.popSizeFn();
    }
    else {
      av.dom.sizeRows.style.color = 'red';
      av.dom.sizeCells.style.color = 'red';
      console.log('not valid; tmpNum=', tmpNum);
      if (tmpNum <= 0) { av.dom.sizeCells.innerHTML = 'Number of rows must be greater than zero'; console.log('<0');}
      if (tmpNum >= 100) { av.dom.sizeCells.innerHTML = 'Number of rows must be 100 or less'; console.log('>0');}
      if ( isNaN(tmpNum) ) {av.dom.sizeCells.innerHTML = 'Number of rows must be a valid number'; console.log('==NaN');}
    }
  };
  
//----------------------------------------------------------------------------------------- $(function slidePopmute() --
   $(function slidePopMute() {
    // because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED 
    // the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, 
    // so I multiplied by 200 to get 100.000% to get a reasonable number of values for the pixils in the slide
    //console.log('before defaultslide value');
    var muteSlideDefault = 95.4242509439325;
    // results in 2% as a default 
    var muteDefault = (Math.pow(10, (muteSlideDefault / 200)) - 1).toFixed(3);
    var slides = $('#mutePopSlide').slider({
      range: 'max',   // min causes the left side of the scroll bar to be light grey instead of white; max causes the right side of the slide to be light grey
      value: muteSlideDefault,
      min: 0.0,
      max: 401,
      theme: 'summer',
      slide: function (event, ui) {
        var tmpVal = (Math.pow(10, (ui.value / 200)) - 1);
        if (12 <= tmpVal ) {tmpVal = tmpVal.toFixed(0); }
        else if (1 <= tmpVal ) {tmpVal = tmpVal.toFixed(1); }
        else if (0.3 <= tmpVal ) {tmpVal = tmpVal.toFixed(2); }
        else {tmpVal = tmpVal.toFixed(2); }
        //put the value in the text box 
        //console.log('input', tmpVal, '; slide=', ui.value);
        $('#mutePopInput').val(tmpVal); //put slider value in the text near slider 
      }
    });
    // initialize
     $('#mutePopInput').val(muteDefault);
    
    /*update slide based on textbox */
    $('#mutePopInput').change(function () {
      var value = this.value;
      var muteNum = parseFloat(value);
      //if (av.debug.uil) { console.log('ui: muteNum=', muteNum); }
      if (muteNum >= 0 && muteNum <= 100) {
        av.ptd.validMuteInuput = true;
        av.dom.mutePopError.style.color = 'black';
        av.dom.mutePopError.innerHTML = '';
        //update slide value
        slides.slider('value', 200 * av.utl.log(10,1 + (muteNum)));
        //console.log('value=', muteNum, '; slide=', 200 * av.utl.log(10,1 + (muteNum) ) );
        
        av.ind.settingsChanged = true;
        if (av.debug.trace) { console.log('Mute changed', av.ind.settingsChanged); };
        av.post.addUser('mutePopInput =' + av.dom.mutePopInput.value,  ' on line 2247');
      } 
      else {
        av.ptd.validMuteInuput = false;
        av.dom.mutePopError.style.color = 'red';
        av.dom.mutePopError.innerHTML = '';
        av.dom.userMsgLabel.innerHTML = '';
        if (muteNum <= 0) {
          av.dom.mutePopError.innerHTML += 'Mutation rate must be >= than zero percent. ';
          if (av.debug.popCon) { console.log('<0'); }
        }
        if (muteNum >= 100) {
          av.dom.mutePopError.innerHTML += 'Mutation rate must be 100% or less. ';
          if (av.debug.popCon) { console.log('>0'); }
        }
        if (isNaN(muteNum)) {
          av.dom.mutePopError.innerHTML += 'Mutation rate must be a valid number. ';
          if (av.debug.popCon) { console.log('==NaN'); }
        }
      };
    });
  });
//------------------------------------------------------------------------------------- end $(function slidePopmute() --
  


  dojo.connect(dijit.byId('childParentRadio'), 'onClick', function () {
    av.post.addUser('Button: childParentRadio');
  });

  dojo.connect(dijit.byId('childRandomRadio'), 'onClick', function () {
    av.post.addUser('Button: childRandomRadio');
  });

  dojo.connect(dijit.byId('notose'), 'onClick', function () {
    av.post.addUser('Button: notose = ' + dijit.byId('notose').get('checked').toString());
  });


  dojo.connect(dijit.byId('andose'), 'onClick', function () {
    av.post.addUser('Button: andose = ' + dijit.byId('andose').get('checked').toString());
  });

  dojo.connect(dijit.byId('orose'), 'onClick', function () {
    av.post.addUser('Button: orose = ' + dijit.byId('orose').get('checked').toString());
  });

  dojo.connect(dijit.byId('norose'), 'onClick', function () {
    av.post.addUser('Button: norose = ' + dijit.byId('norose').get('checked').toString());
  });

  dojo.connect(dijit.byId('equose'), 'onClick', function () {
    av.post.addUser('Button: equose = ' + dijit.byId('equose').get('checked').toString());
  });

  dojo.connect(dijit.byId('nanose'), 'onClick', function () {
    av.post.addUser('Button: nanose = ' + dijit.byId('nanose').get('checked').toString());
  });

  dojo.connect(dijit.byId('ornose'), 'onClick', function () {
    av.post.addUser('Button: ornose = ' + dijit.byId('ornose').get('checked').toString());
  });

  dojo.connect(dijit.byId('andnose'), 'onClick', function () {
    av.post.addUser('Button: andnose = ' + dijit.byId('andnose').get('checked').toString());
  });

  dojo.connect(dijit.byId('xorose'), 'onClick', function () {
    av.post.addUser('Button: xorose = ' + dijit.byId('xorose').get('checked').toString());
  });

  dojo.connect(dijit.byId('experimentRadio'), 'onClick', function () {
    av.post.addUser('Button: experimentRadio');
  });

  dojo.connect(dijit.byId('demoRadio'), 'onClick', function () {
    av.post.addUser('Button: demoRadio');
  });

  av.dom.autoPauseCheck.onclick = function() {
    //console.log('av.dom.autoPauseCheck.checked =', av.dom.autoPauseCheck.checked);
    if (av.dom.autoPauseCheck.checked) { av.ui.autoStopFlag = true; }
    else { av.ui.autoStopFlag = false; }
    var tmpStr = 'Button: autoPauseCheck='+av.ui.autoStopFlag
    av.post.addUser(tmpStr);
    //console.log(tmpStr);
  };

  av.dom.autoPauseNum.onchange = function() {
    av.post.addUser('input: autoPauseNum = ' + av.dom.autoPauseNum.value);
    av.ui.autoStopValue = av.dom.autoPauseNum.value;
    if (av.grd.updateNum < av.ui.autoStopValue) {
      av.ui.autoStopFlag = true; 
      av.dom.autoPauseCheck.checked = true;
    }
    //console.log('autoPauseNum=', av.dom.autoPauseNum.value);
  };

  /* *************************************************************** */
  /* Organism page script *********************************************/
  /* *************************************************************** */
  /* **** Organism Setup Dialog */

  //process button to hide or show Organism detail panal.
  var DetailsFlag = true;
  document.getElementById('orgDetailsButton').onclick = function () {
    av.post.addUser('Button: orgDetailsButton');
    if (DetailsFlag) {
      DetailsFlag = false;
      dijit.byId('rightDetail').set('style', 'display: none;');
      registry.byId('rightDetail').domNode.style.width = '1px';
      registry.byId('mainBC').layout();
    }
    else {
      DetailsFlag = true;
      dijit.byId('rightDetail').set('style', 'display: block; visibility: visible;');
      registry.byId('rightDetail').domNode.style.width = '180px';
      registry.byId('mainBC').layout();
    }
  };
  
  //Opens Settings dialog box /*
  av.dom.orgSetting.onclick = function () {
    //console.log('in orgSetting: av.dom.orgSettingsModalID = ', document.getElementById('orgSettingsModalID') );
    av.post.addUser('Button: orgSetting');
    av.ind.settingsChanged = false;
    av.dom.orgSettingsModalID.style.display="block";
    document.getElementById('orgSettingsModalID').style.display="block";
    //console.log('av.dom.orgSettingsModalID.style.display=',av.dom.orgSettingsModalID.style.display );
  };

    av.dom.indDone.onclick = function() {
    av.post.addUser('Button: hide Setting');
    av.dom.orgSettingsModalID.style.display = 'none';
    console.log('av.ind.settingsChanged =', av.ind.settingsChanged);
    if (av.ind.settingsChanged) av.msg.doOrgTrace();    
  }
  
  document.getElementById('orgSettingModelClose').onclick = function() { av.dom.orgSettingsModalID.style.display = 'none'; }
    
  //If settings were changed then this will request new data when the settings dialog box is closed.
  /*
  OrganSetupDialog.connect(OrganSetupDialog, 'hide', function (e) {
    av.post.addUser('Button: hide Setting');
    if (av.ind.settingsChanged) av.msg.doOrgTrace();
  });
*/
  
  //------------------------------------------------------------------------------------------------- $ slideOrganism --
  $(function slideOrganism() {
    // because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED 
    // the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, 
    // so I multiplied by 400 to get a range .from 0 to 802 for a slide that uses 800 pixels 
    //console.log('before defaultslide value');
    var muteSlideDefault = 190.848501887865;
    // results in 2% as a default 
    var muteDefault = (Math.pow(10, (muteSlideDefault / 400)) - 1).toFixed(3);
    var slides = $('#orgMuteSlide').slider({
      // orientation: "vertical",
      range: 'max',   // min causes the left side of the scroll bar to be light grey instead of white; max causes the right side of the slide to be light grey
      value: muteSlideDefault,
      min: 0.0,
      max: 802,
      slide: function (event, ui) {
        var tmpVal = (Math.pow(10, (ui.value / 400)) - 1);
        if (12 <= tmpVal ) {tmpVal = tmpVal.toFixed(0); }
        else if (1 <= tmpVal ) {tmpVal = tmpVal.toFixed(1); }
        else if (0.3 <= tmpVal ) {tmpVal = tmpVal.toFixed(2); }
        else {tmpVal = tmpVal.toFixed(2); }
         //console.log('mutation rate =', tmpVal, 'slider = ', ui.value);
        $('#orgMuteInput').val(tmpVal); //put slider value in the text near slider
        av.ind.orgMuteInputChange(tmpVal); 
        //put the value in the text box 
        av.ind.settingsChanged = true;
        if (av.debug.trace) { console.log('orSlide changed', av.ind.settingsChanged); }
      }
    });
    // initialize
    $('#orgMuteInput').val(muteDefault);
    
    // update slide based on textbox 
    $('#orgMuteInput').change(function () {
      var value = this.value;
      var muteNum = Number(value);
      //if (av.debug.uil) { console.log('ui: muteNum=', muteNum); }
      if (muteNum >= 0 && muteNum <= 100) {
        //update slide value
        slides.slider('value', 400 * av.utl.log(10,1 + (muteNum)));
      av.ind.settingsChanged = true;
      };
      av.ind.orgMuteInputChange(value);
    });
  });
  //--------------------------------------------------------------------------------------------- end $ slideOrganism --

  //--------------------------------------------------------------------------------------- av.ind.orgMuteInputChange --
  // Error messagses and format to 2 significant figures 
  av.ind.orgMuteInputChange = function(value) {
      var muteNum = Number(value);    
      if (muteNum >= 0 && muteNum <= 100) {
        av.ptd.validMuteInuput = true;
        console.log();
        av.dom.muteOrgError.style.color = 'black';
        av.dom.muteOrgError.innerHTML = '';
        av.ind.settingsChanged = true;
        if (av.debug.trace) { console.log('Mute changed', av.ind.settingsChanged); };
        //console.log('value=', muteNum, '; slide=', 400 * av.utl.log(10,1 + (muteNum) ) );
        av.post.addUser('orgMuteInput =' + value + '; in av.ind.orgMuteInputChange');
      } 
      else {
        av.ptd.validMuteInuput = false;
        av.dom.muteOrgError.style.color = 'red';
        av.dom.muteOrgError.innerHTML = '';
        av.dom.userMsgLabel.innerHTML = '';
        if (muteNum <= 0) {
          av.dom.muteOrgError.innerHTML += 'Mutation rate must be >= than zero percent. ';
          if (av.debug.popCon) { console.log('<0'); }
        }
        if (muteNum >= 100) {
          av.dom.muteOrgError.innerHTML += 'Mutation rate must be 100% or less. ';
          if (av.debug.popCon) { console.log('>0'); }
        }
        if (isNaN(muteNum)) {
          av.dom.muteOrgError.innerHTML += 'Mutation rate must be a valid number. ';
          if (av.debug.popCon) { console.log('==NaN'); }
        }
      }
  };
  
  //----------------------------------------------------------------------------------- end av.ind.orgMuteInputChange --
    
  //triggers flag that requests more data when the settings dialog is closed.
  //http://stackoverflow.com/questions/3008406/dojo-connect-wont-connect-onclick-with-button

  av.ind.organDemoChangeRadio = function(domObj) {
    var radioType = domObj.id;
    av.post.addUser('Button:', radioType);
    av.ind.settingsChanged = true;
    
  }
  
  
  
  
  /*
  $(function slideOrganism() {
    // because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED 
    // the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, 
    // so I multiplied by 100,000 to get 100.000% to come out even. 
    //console.log('before defaultslide value');
    var muteSlideDefault = 109861.
    /1 results in 2% as a default 
    var muteDefault = (Math.pow(Math.E, (muteSlideDefault / 100000)) - 1).toFixed(3)
    var slides = $('#orgMuteSlide').slider({
      // range: 'min',   //causes the left side of the scroll bar to be grey 
      value: muteSlideDefault,
      min: 0.0,
      max: 461512,
      slide: function (event, ui) {
        //$( '#orgMuteInput' ).val( ui.value);  //put slider value in the text near slider 
        $('#orMuteInput').val((Math.pow(Math.E, (ui.value / 100000)) - 1).toFixed(3));
        //put the value in the text box 
        av.ind.settingsChanged = true;
        if (av.debug.trace) console.log('orSlide changed', av.ind.settingsChanged)
      }
    });
    // initialize 
    // $( '#orgMuteInput' ).val( ($( '#orgMuteSlide').slider( 'value' )));
    // $( '#orMuteInput' ).val(muteDefault+'%');
    $('#orMuteInput').val(muteDefault);
    // update slide based on textbox 
    $('#orMuteInput').change(function () {
      slides.slider('value', 100000.0 * Math.log(1 + (parseFloat(this.value))));
      av.ind.settingsChanged = true;
      if (av.debug.trace) console.log('orMute changed', av.ind.settingsChanged)
      //$( '#orgMuteInput' ).val( 100000*Math.log(1+(parseFloat(this.value))) );
      //console.log('in mute change');
      av.post.addUser('muteInput =' + dijit.byId('orMuteInput').get('value')+'1949');
    });
  });
  */
  
  
  // ****************************************************************
  //        Menu buttons that call for genome/Organism trace
  // ****************************************************************
  dijit.byId('mnCnOrganismTrace').on('Click', function () {
    av.post.addUser('Button: mnCnOrganismTrace');
    av.mouse.traceSelected(av.dnd, av.fzr, av.grd);
    av.ui.mainBoxSwap('organismBlock');
    organismCanvasHolderSize();
    var height = ($('#rightDetail').innerHeight() - 375) / 2;
    av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    av.dom.ExecuteAbout.style.height = height + 'px';
    av.dom.ExecuteJust.style.width = '100%';
    av.dom.ExecuteAbout.style.width = '100%';
    av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
  });

  //Put the offspring in the parent position on Organism Trace
  dijit.byId('mnCnOffspringTrace').on('Click', function () {
    //Open Oranism view
    av.post.addUser('Button: mnCnOffspringTrace');
    av.ui.mainBoxSwap('organismBlock');
    organismCanvasHolderSize();
    var height = ($('#rightDetail').innerHeight() - 375) / 2;
    av.dom.ExecuteJust.style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    av.dom.ExecuteAbout.style.height = height + 'px';
    av.dom.ExecuteJust.style.width = '100%';
    av.dom.ExecuteAbout.style.width = '100%';
    offspringTrace(av.dnd, av.fio, av.fzr, av.gen);
  });

  /* ****************************************************************/
  /*                  Canvas for Organsim View (genome)
   /* ************************************************************** */

  av.gen = av.ind.clearGen(av.gen);
  //set canvas size; called from many places
  function organismCanvasHolderSize() {
    av.ind.OrgCanvas.width = $('#organismCanvasHolder').innerWidth() - 6;
    av.ind.OrgCanvas.height = $('#organismCanvasHolder').innerHeight() - 12;
  }

  av.ind.updateOrgTrace = function () {
    //set canvas size
    ////console.log('gen', av.gen);
    //console.log('av.traceObj', av.traceObj);
    //console.log('av.ind.cycle', av.ind.cycle);
    organismCanvasHolderSize();
    //if (undefined == av.traceObj[av.ind.cycle]) console.log('its undefined');
    if (!(undefined == av.traceObj || {} == av.traceObj || undefined == av.traceObj[av.ind.cycle])) {
      av.ind.didDivide = av.traceObj[av.ind.cycle].didDivide; //update global version of didDivide
      av.ind.updateOrganTrace(av.traceObj, av.gen);
    }
    else av.ind.didDivide = false;
  }
  /* ******************************************************************************************************************/
  /*                                 End of Canvas to draw genome and update details
  /* **************************************************************************************************************** */

  /* ************************************** Controls bottum of organism page ******************************************/
  function outputUpdate(vol) {
    document.querySelector('#orgCycle').value = vol;
  }

  document.getElementById('orgBack').onclick = function () {
    var ii = Number(document.getElementById('orgCycle').value);
    if (av.ind.cycleSlider.get('minimum') < av.ind.cycleSlider.get('value')) {
      ii--;
      dijit.byId('orgCycle').set('value', ii);
      av.ind.cycle = ii;
      av.ind.updateOrgTrace()
    }
    av.post.addUser('Button: orgBack; cycle = ' + ii);
  };

  document.getElementById('orgForward').onclick = function () {
    var ii = Number(document.getElementById('orgCycle').value);
    if (av.ind.cycleSlider.get('maximum') > av.ind.cycleSlider.get('value')) {
      ii++;
      dijit.byId('orgCycle').set('value', ii);
      av.ind.cycle = ii;
      if (av.debug.ind) console.log('ii', ii, '; gen', av.gen);
      av.ind.updateOrgTrace()
    }
    av.post.addUser('Button: orgForward; cycle = ' + ii);
  };

  document.getElementById('orgReset').onclick = function () {
    av.post.addUser('Button: orgReset');
    //dijit.byId('orgCycle').set('value', 0);
    //av.ind.cycle = 0;
    //av.ind.updateOrgTrace();
    //av.ind.orgStopFn()
    av.msg.doOrgTrace();
  };

  av.ind.orgRunFn = function () {
    if (av.ind.cycleSlider.get('maximum') > av.ind.cycleSlider.get('value')) {
      av.ind.cycle++;
      dijit.byId('orgCycle').set('value', av.ind.cycle);
      av.ind.updateOrgTrace();
    }
    else {
      av.ind.orgStopFn();
    }
  };

  document.getElementById('orgRun').onclick = function () {
    if ('Run' == document.getElementById('orgRun').textContent) {
      document.getElementById('orgRun').textContent = 'Stop';
      av.ind.update_timer = setInterval(av.ind.orgRunFn, 100);
      av.post.addUser('Button: orgRun = stop; cycle = ' + av.ind.cycleSlider.get('value'));
    }
    else {
      av.ind.orgStopFn();
      av.post.addUser('Button: orgRun = run; cycle = ' + av.ind.cycleSlider.get('value'));
    }
  };

  document.getElementById('orgEnd').onclick = function () {
    av.post.addUser('Button: orgEnd');
    dijit.byId('orgCycle').set('value', av.ind.cycleSlider.get('maximum'));
    av.ind.cycle = av.ind.cycleSlider.get('maximum');
    av.ind.updateOrgTrace();
    av.ind.orgStopFn()
  };

  dijit.byId('orgCycle').on('Change', function (value) {
    av.ind.cycleSlider.set('value', value);
    av.ind.cycle = value;
    //console.log('orgCycle.change');
    av.ind.updateOrgTrace();
  });

  /* Organism Offspring Cost Slider */
  av.ind.cycleSlider = new HorizontalSlider({
    name: 'cycleSlider',
    value: 0,
    minimum: 0,
    maximum: 2,
    diabled: true,
    intermediateChanges: true,
    discreteValues: 3,
    style: 'width:100%;',
    onChange: function (value) {
      document.getElementById('orgCycle').value = value;
      av.ind.cycle = value;
      //console.log('cycleSlider');
      av.ind.updateOrgTrace();
    }
  }, 'cycleSlider');

  // **************************************************************************************************************** */
  //                                                Analysis Page
  // **************************************************************************************************************** */

  // initialize needs to be in AvidaED.js
  av.anl.anaChartInit = function () {
    av.anl.divSize('anaChartInit');

    if (undefined !== av.dom.anlChrtSpace.data) {
      if (av.debug.plotly) console.log('before purge in init');
      av.debug.log += '\n     --uiD: Plotly: Plotly.purge(av.dom.anlChrtSpace) in AvidaED.js at 2168';
      av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.anlChrtSpace', [av.dom.anlChrtSpace]);
      Plotly.purge(av.dom.anlChrtSpace);
      if (av.debug.plotly) console.log('after purge in init');
    }
    //Comment out the next three lines later
    var anaData = av.anl.data;
    if (av.debug.plotly) console.log('anlChrtPlotly in av.anl.anaChartInit');
    //Plotly.plot('anlChrtSpace', anaData, av.anl.layout, av.anl.widg);
    av.debug.log += '\n     --uiD: Plotly: Plotly.plot(av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg) in AvidaED.js at 2157';
    av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg', [av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg]);
    Plotly.plot(av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg);
    if (av.debug.plotly) console.log('after plot in av.anl.anaChartInit');

    //console.log('layout=', av.dom.anlChrtSpace.layout);
    av.dom.anlChrtSpace.style.visibility ='hidden';
  };
  av.anl.anaChartInit();

  av.anl.AnaChartFn = function () {
    'use strict';
    var hasData = false;
    for (var ii=0; ii < 3; ii++) {
      if (0 < document.getElementById('graphPop'+ii).textContent.length) hasData = true;
    }
    if (!hasData) av.dom.anlChrtSpace.style.visibility ='hidden';
    else {
      av.dom.anlChrtSpace.style.visibility = 'visible';
      dijit.byId('analysisBlock').resize();
      //console.log('start av.anl.AnaChartFn-----------------------------------');
      //if ('populationBlock' === av.ui.page && av.ptd.popStatFlag && undefined !== av.anl.logFit[1]) {
      if ('none' === dijit.byId('yLeftSelect').value && 'none' === dijit.byId('yRightSelect').value) {
        if (av.debug.plotly) console.log('both axis set to none');
        if (undefined !== av.dom.anlChrtSpace.data) {
          console.log('before purge in anaChartFn');
          av.debug.log += '\n     --uiD: Plotly: Plotly.purge(av.dom.anlChrtSpace) in AvidaED.js at 2205';
          av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.anlChrtSpace', [av.dom.anlChrtSpace]);
          Plotly.purge(av.dom.anlChrtSpace);
          console.log('after purge in anaChartFn');
        }
      }
      else {
        if (av.debug.plotly) console.log('in AnaChartFn');
        av.anl.trace0.x = av.anl.xx.slice(0, av.anl.pop[0].left.length);
        av.anl.trace1.x = av.anl.xx.slice(0, av.anl.pop[0].right.length);
        av.anl.trace2.x = av.anl.xx.slice(0, av.anl.pop[1].left.length);
        av.anl.trace3.x = av.anl.xx.slice(0, av.anl.pop[1].right.length);
        av.anl.trace4.x = av.anl.xx.slice(0, av.anl.pop[2].left.length);
        av.anl.trace5.x = av.anl.xx.slice(0, av.anl.pop[2].right.length);
        av.anl.trace0.y = av.anl.pop[0].left;
        av.anl.trace1.y = av.anl.pop[0].right;
        av.anl.trace2.y = av.anl.pop[1].left;
        av.anl.trace3.y = av.anl.pop[1].right;
        av.anl.trace4.y = av.anl.pop[2].left;
        av.anl.trace5.y = av.anl.pop[2].right;
        av.anl.trace0.line.color = av.anl.color[0];
        av.anl.trace1.line.color = av.anl.color[0];
        av.anl.trace2.line.color = av.anl.color[1];
        av.anl.trace3.line.color = av.anl.color[1];
        av.anl.trace4.line.color = av.anl.color[2];
        av.anl.trace5.line.color = av.anl.color[2];
        av.anl.trace0.name = av.anl.abbreviate[dijit.byId('yLeftSelect').value] + '-' + document.getElementById('graphPop0').textContent;
        av.anl.trace1.name = av.anl.abbreviate[dijit.byId('yRightSelect').value] + '-' + document.getElementById('graphPop0').textContent;
        av.anl.trace2.name = av.anl.abbreviate[dijit.byId('yLeftSelect').value] + '-' + document.getElementById('graphPop1').textContent;
        av.anl.trace3.name = av.anl.abbreviate[dijit.byId('yRightSelect').value] + '-' + document.getElementById('graphPop1').textContent;
        av.anl.trace4.name = av.anl.abbreviate[dijit.byId('yLeftSelect').value] + '-' + document.getElementById('graphPop2').textContent;
        av.anl.trace5.name = av.anl.abbreviate[dijit.byId('yRightSelect').value] + '-' + document.getElementById('graphPop2').textContent;

        var anaData = [av.anl.trace0, av.anl.trace1, av.anl.trace2, av.anl.trace3, av.anl.trace4, av.anl.trace5];

        if (av.debug.plotly) console.log('av.anl.xx', av.anl.xx);
        if (av.debug.plotly) console.log('trace0', av.anl.trace0);

        av.anl.divSize('anaChartInit');
        av.anl.layout.height = av.anl.ht;
        av.anl.layout.width = av.anl.wd;
        av.anl.layout.yaxis.title = dijit.byId('yLeftSelect').value;
        av.anl.layout.yaxis2.title = dijit.byId('yRightSelect').value;
        if (av.debug.plotly) console.log('before purge in update');
        av.debug.log += '\n     --uiD: Plotly: Plotly.purge(av.dom.anlChrtSpace) in AvidaED.js at 2249';
        av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.anlChrtSpace', [av.dom.anlChrtSpace]);
        Plotly.purge(av.dom.anlChrtSpace);
        if (av.debug.plotly) console.log('after plot anlChrtSpace');
        //Plotly.plot('anlChrtSpace', anaData, av.anl.layout, av.anl.widg);
        av.debug.log += '\n     --uiD: Plotly: Plotly.plot(av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg) in AvidaED.js at 2254';
        av.utl.dTailWrite('AvidaED.js', (new Error).lineNumber, 'av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg', [av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg]);
        Plotly.plot(av.dom.anlChrtSpace, anaData, av.anl.layout, av.anl.widg);
        if (av.debug.plotly) console.log('after plot anlChrtSpace');
      }
    }
  }

  /* Chart buttons ****************************************/
  document.getElementById('pop0delete').onclick = function () {
    av.post.addUser('Button: pop0delete');
    av.anl.hasPopData[0] = false;
    av.anl.pop[0].left = [];
    av.anl.pop[0].right = [];
    av.anl.clearWorldData(0);
    av.dnd.graphPop0.selectAll().deleteSelectedNodes();
    av.anl.AnaChartFn();
  }
  document.getElementById('pop1delete').onclick = function () {
    av.post.addUser('Button: pop1delete');
    av.anl.hasPopData[1] = false;
    av.anl.pop[1].left = [];
    av.anl.pop[1].right = [];
    av.anl.clearWorldData(1);
    av.dnd.graphPop1.selectAll().deleteSelectedNodes();
    av.anl.AnaChartFn();
  }
  document.getElementById('pop2delete').onclick = function () {
    av.post.addUser('Button: pop2delete');
    av.anl.hasPopData[2] = false;
    av.anl.pop[2].left = [];
    av.anl.pop[2].right = [];
    av.anl.clearWorldData(2);
    av.dnd.graphPop2.selectAll().deleteSelectedNodes();
    av.anl.AnaChartFn();
  }
  dijit.byId('pop0color').on('Change', function () {
    av.anl.color[0] = av.color.names[dijit.byId('pop0color').value];
    av.post.addUser('Button: pop0color');
    av.anl.AnaChartFn();
  });
  dijit.byId('pop1color').on('Change', function () {
    av.post.addUser('Button: pop1color');
    av.anl.color[1] = av.color.names[dijit.byId('pop1color').value];
    av.anl.AnaChartFn();
  });
  dijit.byId('pop2color').on('Change', function () {
    av.post.addUser('Button: pop2color');
    av.anl.color[2] = av.color.names[dijit.byId('pop2color').value];
    av.anl.AnaChartFn();
  });

  //Set Y-axis title and choose the correct array to plot
  dijit.byId('yLeftSelect').on('Change', function () {
    av.post.addUser('Button: yLeftSelect = ' + dijit.byId('yLeftSelect').value);
    av.anl.yLeftTitle = dijit.byId('yLeftSelect').value;
    //need to get correct array to plot from freezer
    av.anl.loadSelectedData(0, 'yLeftSelect', 'left');  //numbers are world landing spots
    av.anl.loadSelectedData(1, 'yLeftSelect', 'left');
    av.anl.loadSelectedData(2, 'yLeftSelect', 'left');
    av.anl.AnaChartFn();
  });

  dijit.byId('yRightSelect').on('Change', function () {
    av.anl.yRightTitle = dijit.byId('yRightSelect').value;
    //need to get correct array to plot from freezer
    av.anl.loadSelectedData(0, 'yRightSelect', 'right');
    av.anl.loadSelectedData(1, 'yRightSelect', 'right');
    av.anl.loadSelectedData(2, 'yRightSelect', 'right');
    av.anl.AnaChartFn();
    av.post.addUser('Button: yRightSelect = '+dijit.byId('yRightSelect').value);
  });

  // **************************************************************************************************************** */
  //Tasks that Need to be run when page is loaded but after chart is defined
  // **************************************************************************************************************** */

  // ------------------------ Population Page Statistics tables --------------------------------------------------------

  av.ui.adjustPopRightSize();

  //used to set the height so the data just fits. Done because different monitor/browser combinations require a different height in pixels.
  //may need to take out as requires loading twice now.
  
  //setting row height to match on population page stats window
  //http://www.tek-tips.com/viewthread.cfm?qid=891026
  /*
  Trying to dynamically set row ht in case it was different on differnt screens/opperationg systems, browsers.
  Never got it working

  var popsBotTblRows = document.getElementById('popsBotTable').rows;
  var sotBotTbl = document.getElementById('sotBotTable').rows;
  var ht = sotBotTbl[2].offsetHeight;
  for (var ii = 1; ii < popsBotTblRows.length; ii++) {
    //sotBotTbl[ii].offsetHeight = popsBotTblRows[ii].offsetHeight;  //can only get values not put them.
    console.log('sot rowHt=',sotBotTbl[ii].offsetHeight, '; PopsrowHt=',popsBotTblRows[ii].offsetHeight );
  }

  var newCss = '.botTable td {  line-height: ' + ht + 'px;  }';
  av.ptd.setStyle(newCss);
  //stylesheet.insertRule('.botTable td {  line-height: ' + ht + 'px;  }', 265);
   */

  av.ui.removeVerticalScrollbar = function (scrollDiv, htChangeDiv) {
    //https://tylercipriani.com/2014/07/12/crossbrowser-javascript-scrollbar-detection.html
    var scrollSpace = 0;
    if (0 <= window.jscd.os.indexOf('Win')) {scrollSpace = 17}
    //if the two heights are different then there is a scroll bar
    var ScrollDif = document.getElementById(scrollDiv).scrollHeight - document.getElementById(scrollDiv).clientHeight;
    var hasScrollbar = 0 < ScrollDif;
    if (av.debug.root) console.log('scroll', scrollDiv, hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
      document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=', document.getElementById(htChangeDiv).scrollHeight,
      document.getElementById(htChangeDiv).offsetHeight, document.getElementById(htChangeDiv).style.height);

    var divHt = document.getElementById(htChangeDiv).style.height.match(/\d/g);  //get 0-9 globally in the string  //http://stackoverflow.com/questions/10003683/javascript-get-number-from-string
    divHt = divHt.join(''); //converts array to string
    var NewHt = Number(divHt) + 1 + + scrollSpace + ScrollDif;  //add the ht difference to the outer div that holds this one
    //line below is where the height of the div actually changes
    document.getElementById(htChangeDiv).style.height = NewHt + 'px';

    //redraw the screen
    //av.ui.mainBoxSwap(page);
    if (av.debug.root) console.log('Afterscroll', hasScrollbar, document.getElementById(scrollDiv).scrollHeight,
      document.getElementById(scrollDiv).clientHeight, '; htChangeDiv=', document.getElementById(htChangeDiv).scrollHeight,
      document.getElementById(htChangeDiv).offsetHeight, document.getElementById(htChangeDiv).style.height);
  }

  av.ui.removeVerticalScrollbar('popStatistics', 'popTopRight');
  av.ui.removeVerticalScrollbar('popBot', 'popBot');
  av.ui.removeVerticalScrollbar('popTop', 'popTop');
  av.ui.mainBoxSwap('populationBlock');

  //av.grd.popChartFn();
  //av.grd.drawGridSetupFn(); //Draw initial background

  //Safari 9 will not allow saving workspaces or freezer items.
  if (av.brs.isSafari) {
  //if (false) {
    userMsgLabel.textContent = 'Safari 9 does not allow saving a workspace or freezer items. Please use Firefox or Chrome';
    dijit.byId('mnFlSaveWorkspace').attr('disabled', true);
    dijit.byId('mnFlSaveWorkspace').attr('disabled', true);
    dijit.byId('mnFlSaveAs').attr('disabled', true);
  }
  
  // **************************************************************************************************************** */
  //                                          Useful Generic functions
  // **************************************************************************************************************** */

  //Modulo that is more accurate than %; Math.fmod(aa, bb);
  Math.fmod = function (aa, bb) {
    return Number((aa - (Math.floor(aa / bb) * bb)).toPrecision(8));
  }

  //http://nelsonwells.net/2011/10/swap-object-key-and-values-in-javascript/
  av.ui.invertHash = function (obj) {
    var new_obj = {};
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        new_obj[obj[prop]] = prop;
      }
    }
    return new_obj;
  };
  });

  //------- not in use = example
  //var hexColor = av.ui.invertHash(av.color.names);
  //var theColor = hexColor['#000000'];  //This should get 'Black'
  //console.log('theColor=', theColor);

  //--------------------------------------------------------------------------------------------------------------------
  //Notes on things I learned writing this code, that is not directly used in the code
  //use FileMerge to compare to versions of the same file on a Mac
  //js fiddle of dragging image to cavans and dragging it around http://jsfiddle.net/XU2a3/41/

  //Use Meld to compare two folders worth of stuff. Evoke from a terminal prompt. Does not seem to be be in applications folder

  //http://dojo-toolkit.33424.n3.nabble.com/dojo-dnd-problems-selection-object-from-nodes-etc-td3753366.html
  //This is supposed to select a node; lists as selected programatically, but does not show up on screen.

  //A method to distinguish a av.mouse click from a av.mouse drag
  //http://stackoverflow.com/questions/6042202/how-to-distinguish-av.mouse-click-and-drag

  //A method to get the data items in a dojo DND container in order
  //av.dnd.fzConfig.on('DndDrop', function(source, nodes, copy, target){  //This triggers for every dnd drop, not just those of freezeConfigureNode
  //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
  //var orderedDataItems = av.dnd.fzConfig.getAllNodes().map(function(node){
  //  return av.dnd.fzConfig.getItem(node.id).data;
  //});
  //console.log('orderedDataItems', orderedDataItems);
  /*
  var matches = function (aa, bb) {
    if (aa[0] == bb[0] && aa[1] == bb[1]) return true;
    else return false;
  }
});
*/

// Web sites that looked useful for some task
/* Capture Close event
 http://stackoverflow.com/questions/1631959/how-to-capture-the-browser-window-close-event
 http://stackoverflow.com/questions/5712195/js-listen-when-child-window-is-closed

 Single page app
 http://singlepageappbook.com/detail1.html
 */


/* Charting packages

Reviews
 https://iprodev.com/39-javascript-chart-and-graph-libraries-for-developers/
 http://thenextweb.com/dd/2015/06/12/20-best-javascript-chart-libraries/#gref
 http://www.sitepoint.com/15-best-javascript-charting-libraries/

Good zooming and point value pop-up
 http://dygraphs.com/
 http://jsfiddle.net/eM2Mg/

 Charles likes -
 http://c3js.org/
 http://swizec.com/blog/quick-scatterplot-tutorial-for-d3-js/swizec/5337
 http://bl.ocks.org/peterssonjonas/4a0e7cb8d23231243e0e

real time grapsh shift data over
 https://square.github.io/cubism/
 https://bost.ocks.org/mike/cubism/intro/#10

other
 http://www.flotcharts.org/flot/examples/

 */

//http://maffelu.net/jquery-handle-left-click-right-click-and-double-click-at-the-same-time/
// I just had to handle a left-click, right-click and a dbl-click at the same time which turned
// out to be a bit tricky at first using just the mousedown function, but the solution was simple:
/*$('#Foo')
 .click(function() //Left click
 {
 //Do something
 })
 .mousedown(function(e) //Right click
 {
 if(e.which == 3) //1: left, 2: middle, 3: right
 {
 //Do something
 }
 })
 .dblclick(function() //Double click
 {
 //Do something
 });
 */

/*
formating tables = http://www.the-art-of-web.com/html/table-markup/
 */

/* How to make a .gif file.
To make a gif using screen capture
     http://osxdaily.com/2013/08/23/record-screen-animated-gif-mac-os-x/
 A web application reverses a GIF.
    http://gifmaker.me/reverser/
 */

