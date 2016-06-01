// need a server to run this. The one below works.
// python -m SimpleHTTPServer  in the folder with index.html to start a server for using pouchDB
// Then visit http://127.0.0.1:8000/avidaED.html
//
// Git commands used to push
// git add .
// git commit -m 'comment about the change being pushed'
// git push -u origin master
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
// Path in TX for Filezilla /var/www/vhosts/bwng/public_html/projects/avida-ED
//
define.amd.jQuery = true;
require([
  'dijit/dijit',
  'dojo/parser',
  'dojo/_base/declare',
  'dojo/query',
  'dojo/NodeList-traverse',
  'maqetta/space',
  'maqetta/AppStates',
  'dijit/Dialog',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',
  'dijit/MenuBar',
  'dijit/PopupMenuBarItem',
  'dijit/MenuItem',
  'dijit/Menu',
  'dijit/form/Button',
  'dijit/TitlePane',
  'dojo/dnd/Source',
  'dojo/dnd/Manager',
  'dojo/dnd/Selector',
  'dojo/dnd/Target',
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/dom',
  'dojo/aspect',
  'dojo/on',
  'dijit/registry',
  'dijit/form/Select',
  'dijit/form/HorizontalSlider',
  'dijit/form/HorizontalRule',
  'dijit/form/HorizontalRuleLabels',
  'dijit/form/RadioButton',
  'dijit/form/ToggleButton',
  'dijit/form/NumberSpinner',
  'dijit/form/ComboButton',
  'dijit/form/DropDownButton',
  'dijit/form/ComboBox',
  'dijit/form/Textarea',
  'dojox/charting/Chart',
  'dojox/charting/axis2d/Default',
  'dojox/charting/plot2d/Lines',
  'dojox/charting/plot2d/Grid',
  'dojox/charting/action2d/MouseZoomAndPan',
  'dojo/ready',
  'jquery',
  'jquery-ui',
  //'lib/jquery.fileDownload.js',
  //'lib/Blob',
  'lib/jszip.min.js',
  'lib/FileSaver.js',
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
  //'diagnosticConsole.js',
  'dojo/domReady!'
], function (dijit, parser, declare, query, nodelistTraverse, space, AppStates, Dialog,
             BorderContainer, ContentPane, MenuBar, PopupMenuBarItem, MenuItem, Menu,
             Button, TitlePane, dndSource, dndManager, dndSelector, dndTarget, domGeometry, domStyle, dom,
             aspect, on, registry, Select,
             HorizontalSlider, HorizontalRule, HorizontalRuleLabels, RadioButton, ToggleButton, NumberSpinner, ComboButton,
             DropDownButton, ComboBox, Textarea, Chart, Default, Lines, Grid, MouseZoomAndPan,
             ready, $, jqueryui,  //fileDownload,  //Blob.js,
             JSZip, FileSaver) {
  'use strict';
  if (typeof $ != 'undefined') {
    // jQuery is loaded => print the version
    // console.log($.fn.jquery);
  } else {
    console.log('Jquery ($) is not defined.');
  }

  parser.parse();

  /********************************************************************************************************************/
  // * The files at the end of the require list contain code specific to avida-ED.
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
  //initiallize default mouse shapes
  av.mouse.getOriginalShapes();

  /********************************************************************************************************************/

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
  av.dnd.fzOrgan = new dndSource('fzOrgan', {
    accept: ['g'],  //g=genome
    copyOnly: true,
    singular: true,
    selfAccept: false
  });
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

  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.activeOrgan = new dndSource('activeOrgan', {
    accept: ['g'],
    singular: true,
    copyOnly: true,
    selfAccept: false
  });
  av.dnd.organCanvas = new dndSource('organCanvas', {accept: ['g'], singular: true, selfAccept: false});
  //Targets only accept object, source can do both
  av.dnd.analyzeChart = new dndTarget('analyzeChart', {accept: ['w'], singular: true});
  av.dnd.graphPop0 = new dndTarget('graphPop0', {accept: ['w'], singular: true});
  av.dnd.graphPop1 = new dndTarget('graphPop1', {accept: ['w'], singular: true});
  av.dnd.graphPop2 = new dndTarget('graphPop2', {accept: ['w'], singular: true});

  av.parents.clearParentsFn();

  // -------------------------------------------------------------------------------------------------------------------
  // Initialize variables that depend on files loaded in requirement statement
  // -------------------------------------------------------------------------------------------------------------------

  av.grd.popChart = new Chart('popChart');

  dijit.byId('mnCnPause').attr('disabled', true);
  dijit.byId('mnFzOrganism').attr('disabled', true);
  dijit.byId('mnFzOffspring').attr('disabled', true);
  dijit.byId('mnFzPopulation').attr('disabled', true);
  dijit.byId('mnCnOrganismTrace').attr('disabled', true);

  // for analyze page
  av.anl.color[0] = av.color.dictColor[dijit.byId('pop0color').value];
  av.anl.color[1] = av.color.dictColor[dijit.byId('pop1color').value];
  av.anl.color[2] = av.color.dictColor[dijit.byId('pop2color').value];
  av.anl.yLeftTitle = dijit.byId('yLeftSelect').value;
  av.anl.yRightTitle = dijit.byId('yRightSelect').value;
  var anaChart = new Chart('analyzeChart');

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
      av.debug.log += '\nui --> Avida:  av.aww.uiWorker was null, started a new webworker';
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

  av.fio.readZipWS(av.fio.defaultFname, true);
  //av.fio.loadDefaultConfig();

  //********************************************************************************************************************
  // Menu Buttons handling
  //********************************************************************************************s************************

  dijit.byId('mnFlOpenDefaultWS').on('Click', function () {
    'use strict';
    av.debug.log += '\n -Button: mnFlOpenDefaultWS';
    av.fio.useDefault = true;
    av.fio.isB64 = false;
    if ('no' === av.fzr.saveState) sWSfDialog.show();
    else {
      av.fio.readZipWS(av.fio.defaultFname, false);  //false = do not load config file
    }
  });

  dijit.byId('sWSfSave').on('Click', function () {
    av.debug.log += '\n -Button: sWSSave';
    console.log('before call save workspace');
    av.fio.fzSaveCurrentWorkspaceFn();  //fileIO.js
    console.log('after call to save workspace');
  });

  dijit.byId('sWSfOpen').on('Click', function () {
    av.debug.log += '\n -Button: sWSfOpen';
    sWSfDialog.hide();
    if (av.fio.useDefault) av.fio.readZipWS(av.fio.defaultFname, false);  //false = do not load config file
    else {
      //document.getElementById('inputFile').click();  //to get user picked file
      document.getElementById('putWS').click();  //to get user picked file
    }
  });

  // open and read user picked file
  //--------------------------------------------------------------------------------------------------------------------

  dijit.byId('mnFlOpenWS').on('Click', function () {
    'use strict';
    av.debug.log += '\n -Button: mnFlOpenWS';
    av.fio.useDefault = false;
    av.fio.isB64 = false;
    if ('no' === av.fzr.saveState) sWSfDialog.show();
    //else document.getElementById('inputFile').click();
    else document.getElementById('putWS').click();
  });

  dijit.byId('mnFlOpenB64').on('Click', function () {
    'use strict';
    av.debug.log += '\n -Button: mnFlOpenB64';
    av.fio.useDefault = false;
    av.fio.isB64 = true;
    if ('no' === av.fzr.saveState) sWSfDialog.show();
    //else document.getElementById('inputFile').click();
    else document.getElementById('putWS').click();   // call av.fio.userPickZipRead()
  });

  //--------------------------------------------------------------------------------------------------------------------

  dijit.byId('mnFlFzItem').on('Click', function () {
    'use strict';
    av.debug.log += '\n -Button: mnFlFzItem';
    av.fio.useDefault = false;
    //console.log('importFzrItem', importFzrItem);
    document.getElementById('importFzrItem').click();
  });

  // ----------------------- Save Workspace ----------------------------------------------------------------------------
  // Save current workspace (mnFzSaveWorkspace)
  document.getElementById('mnFlSaveWorkspace').onclick = function () {
    av.debug.log += '\n -Button: mnFlSaveWorkspace';
    av.fio.fzSaveCurrentWorkspaceFn();  //fileIO.js
  };

  try {
    var isFileSaverSupported = !!new Blob;
  } catch (e) {
    console.log('----------------------------------------------------------filesaver supported?', e);
  }

  if (av.brs.isSafari) {
    dijit.byId('mnFlSaveWorkspace').attr('disabled', true);
    dijit.byId('mnFlSaveAs').attr('disabled', true);
    dijit.byId('mnFlSaveAs').attr('disabled', true);
  }


  // Save current workspace with a new name
  document.getElementById('mnFlSaveAs').onclick = function () {
    av.debug.log += '\n -Button: mnFlSaveAs';
    var suggest = 'avidaWS.avidaedworkspace.zip';
    if (0 < av.fio.userFname.length) suggest = av.fio.userFname;
    av.fio.userFname = prompt('Choose a new name for your Workspace now', suggest);
    if (null !== av.fio.userFname) {
      av.fio.fzSaveCurrentWorkspaceFn();
    }  //fileIO.js
  };

  //Export csv data from current run.
  dijit.byId('mnFlExportData').on('Click', function () {
    'use strict';
    av.debug.log += '\n -Button: mnFlExportData';
    av.fwt.writeCSV();
  });

  //------------- Testing only need to delete later.--------------------

  document.getElementById('mnHpDebug').onclick = function () {
    if ('visible' === document.getElementById('mnDebug').style.visibility) {
      document.getElementById('mnDebug').style.visibility = 'hidden';
      //document.getElementById('mnHpDebug').label = 'Show debug menu';
      //document.getElementById('mnHpDebug').textContent = 'Show debug menu';
      dijit.byId("mnHpDebug").set("label", 'Show debug menu');

    } else {
      document.getElementById('mnDebug').style.visibility = 'visible';
      //document.getElementById('mnHpDebug').label = 'Hide debug menu';
      dijit.byId("mnHpDebug").set("label", 'Hide debug menu');
    }
  };

  //works saving text as an example -
  document.getElementById('mnDbSaveTxt').onclick = function () {
    av.fio.userFname = 'junk.txt';
    //av.fio.saveTxt();
    av.fio.saveJson();
  };

  $(fileDownloadButton).click(function () {
    //var blob = new Blob(['Hello, world!'], {type: 'text/plain;charset=utf-8'});
    //saveAs(blob, 'hello world.txt');

    if (0 === av.fio.userFname.length) av.fio.userFname = prompt('Choose a name for your Workspace', av.fio.defaultUserFname);
    if (0 === av.fio.userFname.length) av.fio.userFname = av.fio.defaultUserFname;
    var end = av.fio.userFname.substring(av.fio.userFname.length - 4);
    if ('.zip' != end) av.fio.userFname = av.fio.userFname + '.zip';
    console.log('end', end, '; userFname', av.fio.userFname);
    var WSzip = new av.fio.JSZip();
    console.log('number of files', av.utl.objectLength(av.fzr.file));
    var numFiles = 0;
    for (var fname in av.fzr.file) {
      WSzip.file('av.avidaedworkspace/' + fname, av.fzr.file[fname]);
      numFiles++;
    }
    var blob = WSzip.generate({type: 'blob'});
    console.log('wrote blob');
    //var data = { x: 42, s: 'hello, world', d: new Date() };
    //var json = JSON.stringify(data);
    //var blob = new Blob([json], {type: 'octet/stream'});
    var tmpUrl = window.URL.createObjectURL(blob);
      console.log('tmpURL=', tmpUrl);
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
    av.debug.log += '\n -Button: mnHpAbout';
    mnHpAboutDialog.show();
  });

  av.ui.HardwareDialog = new Dialog({
    title: 'Avida : A Guided Tour of an Ancestor and its Hardware',
    id: 'HardwareDialog',
    href: 'cpu_tour.html'
    //hide: function() {av.ui.HardwareDialog.destroy()}
    //style: 'width: 600px; height: 400px'
  });

  domStyle.set(av.ui.HardwareDialog.containerNode, {
    position: 'relative'
  });

  dijit.byId('mnHpHardware').on('Click', function () {
    av.debug.log += '\n -Button: mnHpHardware';
    if (!av.ui.HardwareDialog) {
      av.ui.HardwareDialog = new Dialog({
        title: 'Avida : A Guided Tour of an Ancestor and its Hardware',
        id: 'HardwareDialog',
        href: 'cpu_tour.html'
        //hide: function() {av.ui.HardwareDialog.destroy()}
        //style: 'width: 600px; height: 400px'
      });
    }
    //console.log(av.ui.HardwareDialog);
    av.ui.HardwareDialog.show();
  });

  dijit.byId('mnHpProblem').on('Click', function () {
    av.debug.log += '\n -Button: mnHpProblem';
    //alert(av.debug.log);
    // only shows one line = prompt('Please put this in an e-mail to help us improve Avida-Ed: Copy to clipboard: Ctrl+C, Enter', '\nto: ' + av.fio.mailAddress + '\n' + av.debug.log);
    document.getElementById('sendLogTextarea').textContent = av.fio.mailAddress + '\n\n' + av.debug.log;
    //dijit.byId('sendLogDialog').set('value', 'Avida-Ed problem report');
    document.getElementById('sendLogPara').textContent =
      'Please describe the problem and put that at the beginning of the e-mail along with the session log from the text area seeen below.';

    sendLogDialog.show();  //textarea must be visable first
    av.debug.sendLogTextarea = document.getElementById('sendLogTextarea');
    av.debug.sendLogTextarea.focus();
    //av.debug.sendLogTextarea.setSelectionRange(0, av.debug.sendLogTextarea.length);
    av.debug.sendLogTextarea.select();  //https://css-tricks.com/snippets/javascript/auto-select-textarea-text/
  });

  //http://stackoverflow.com/questions/7080269/javascript-before-leaving-the-page
  dijit.byId('sendEmail').on('Click', function () {
    av.ui.sendEmailFlag = true;
    var link = 'mailto:' + av.fio.mailAddress +
        //'?cc=CCaddress@example.com' +
      '?subject=' + escape('Avida-Ed session log') +
      '&body=' + escape(av.debug.log);
    window.location.href = link;
    av.ui.sendEmailFlag = false;
  });

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
  //********************************************************************************************************************
  // Error logging
  //********************************************************************************************************************

  //https://bugsnag.com/blog/js-stacktracess
  //http://blog.bugsnag.com/js-stacktraces
  window.onerror = function (message, file, line, col, error) {
    //console.log(message, ' from ', error.stack, '------------------');
    document.getElementById('runStopButton').innerHTML = 'Run';  //av.msg.pause('now');
    av.debug.log += '\n' + message + ' from ' + file + ':' + line + ':' + col;
    //av.debug.errorEmailFn();

    //dijit.byId('sendLogDialog').set('title', 'javascrip error report');
    document.getElementById('sendLogTextarea').textContent = av.fio.mailAddress + '\n\n' + av.debug.log;
    document.getElementById('sendLogPara').textContent = 'The error is the last line in the session log in the text below.';
    sendLogDialog.show();  //textarea must be visable first
    av.debug.sendLogTextarea = document.getElementById('sendLogTextarea');
    av.debug.sendLogTextarea.focus();
    //av.debug.sendLogTextarea.setSelectionRange(0, av.debug.sendLogTextarea.length);
    av.debug.sendLogTextarea.select();  //https://css-tricks.com/snippets/javascript/auto-select-textarea-text/
  }

  window.addEventListener('error', function (evt) {
    //console.log('event listener', evt);
  });

  //More usefull websites to catch errors
  // https://davidwalsh.name/javascript-stack-trace
  // https://danlimerick.wordpress.com/2014/01/18/how-to-catch-javascript-errors-with-window-onerror-even-on-chrome-and-firefox/
  //to send e-mail  http://stackoverflow.com/questions/7381150/how-to-send-an-email-from-javascript

  // how to send e-mail
  // http://www.codeproject.com/Questions/303284/How-to-send-email-in-HTML-or-Javascript

  // selected text
  // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
  // http://www.javascriptkit.com/javatutors/copytoclipboard.shtml

  //--------------------------------------------------------------------------------------------------------------------
  // main button scripts
  //--------------------------------------------------------------------------------------------------------------------

  //initialize the ht for main buttons and trash can so there is no scroll bar
  if (document.getElementById('mainButtons').scrollHeight > document.getElementById('mainButtons').clientHeight) {
    document.getElementById('mainButtons').style.height = document.getElementById('mainButtons').scrollHeight + 'px';
  }
  if (document.getElementById('trashCP').scrollHeight > document.getElementById('trashCP').clientHeight) {
    document.getElementById('trashCP').style.height = document.getElementById('trashCP').scrollHeight + 'px';
  }
  if (document.getElementById('orgTop').scrollHeight > document.getElementById('orgTop').clientHeight) {
    document.getElementById('orgTop').style.height = document.getElementById('orgTop').scrollHeight + 'px';
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
    av.debug.log += '\n -Button: populationButton';
    if (av.debug.dnd || av.debug.mouse) console.log('PopulationButton, av.fzr.genome', av.fzr.genome);
    av.ui.mainBoxSwap('populationBlock');
  }

  document.getElementById('organismButton').onclick = function () {
    av.debug.log += '\n -Button: organismButton';
    av.ui.mainBoxSwap('organismBlock');
    //console.log('after mainBoxSwap');
    organismCanvasHolderSize();
    var height = ($('#rightDetail').innerHeight() - 395) / 2;
    document.getElementById('ExecuteJust').style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById('ExecuteAbout').style.height = height + 'px';
    document.getElementById('ExecuteJust').style.width = '100%';
    document.getElementById('ExecuteAbout').style.width = '100%';
    if (undefined != av.traceObj) {
      av.ind.updateOrgTrace();
    }
  };

  document.getElementById('analysisButton').onclick = function () {
    av.debug.log += '\n -Button: analysisButton';
    av.ui.mainBoxSwap('analysisBlock');
  };

  //********************************************************************************************************************
  // Resize window helpers -------------------------------------------
  //********************************************************************************************************************
  if (av.debug.root) console.log('before Resize helpers');

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
      document.getElementById('ExecuteJust').style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById('ExecuteAbout').style.height = height + 'px';
      document.getElementById('ExecuteJust').style.width = '100%';
      document.getElementById('ExecuteAbout').style.width = '100%';
      //console.log('rightDetail', height, rd);
      av.ind.updateOrgTrace();
    }
  };
  console.log('ht, wd', document.getElementById('mainBC').clientHeight,document.getElementById('splash').clientWidth);

  ready(function () {
    aspect.after(registry.byId('gridHolder'), 'resize', function () {
      av.ui.browserResizeEventHandler();
    });
    aspect.after(registry.byId('popChartHolder'), 'resize', function () {
      av.ui.browserResizeEventHandler();
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
  av.ui.adjustPopRightSize = function () {
    av.ui.gridHolderWd = document.getElementById('gridHolder').clientWidth;
    //console.log('av.ui.gridHolderWd', av.ui.gridHolderWd);
    if (av.ui.pobBotWdMin < av.ui.gridHolderWd) {
      av.ui.gridHolderXtra = av.ui.gridHolderWd - document.getElementById('gridHolder').clientHeight;
      //console.log('av.ui.gridHolderXtra',av.ui.gridHolderXtra);
      if (av.ui.gridHolderSideBuffer < av.ui.gridHolderXtra) {
        av.ui.gridHolderWdNew = av.ui.gridHolderWd - av.ui.gridHolderXtra + av.ui.gridHolderSideBuffer;
        //console.log('av.ui.gridHolderWdNew',av.ui.gridHolderWdNew);
        if (430 > av.ui.gridHolderWdNew) av.ui.gridHolderWdNew = 430;
        av.ui.popRightWdNew = document.getElementById('popRight').clientWidth + av.ui.gridHolderWd - av.ui.gridHolderWdNew;
        //console.log('av.ui.popRightWd Old, New',document.getElementById('popRight').clientWidth, av.ui.popRightWdNew);
        //av.ui.popRightWdNew = document.getElementById('popRight').clientWidth + av.ui.gridHolderXtra - av.ui.gridHolderSideBuffer;
        document.getElementById('popRight').style.width = av.ui.popRightWdNew + 'px';
      }
    }
    //console.log('popRight', document.getElementById('popRight').style.width);
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
    //console.log('pkg.target', pkg.target);
    //console.log('pkg.target.s', pkg.target.selection);
    if ('activeConfig' === target.node.id) {
      var pkg = {};
      pkg.source = source;
      pkg.nodes = nodes;
      pkg.copy = copy;
      pkg.target = target;
      av.dnd.landActiveConfig(pkg);  //dojoDnd
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
      av.dnd.landAncestorBox(source, nodes, target);
    }
  });

  av.dnd.gridCanvas.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of gridCanvas
    if ('gridCanvas' == target.node.id) {
      av.dnd.landGridCanvas(source, nodes, target);
      console.log('before call av.grd.drawGridSetupFn');
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
      document.getElementById('ExecuteJust').style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
      document.getElementById('ExecuteAbout').style.height = height + 'px';
      document.getElementById('ExecuteJust').style.width = '100%';
      document.getElementById('ExecuteAbout').style.width = '100%';
      av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.activeOrgan.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeOrgan
    if ('activeOrgan' == target.node.id) {
      if (av.debug.dnd) console.log('activeOrgan: s, t', source, target);
      av.dnd.landActiveOrgan(source, nodes, target);
      av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.organCanvas.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of organCanvas
    if ('organCanvas' == target.node.id) {
      //av.debug.log += '\n -DnD_land: organCanvas';
      if (av.debug.dnd) console.log('landOrganCanvas: s, t', source, target);
      av.dnd.landOrganCanvas(source, nodes, target);
      av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
    }
  });

  av.dnd.trashCan.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of trashCan
    if ('trashCan' == target.node.id) {
      //av.debug.log += '\n -DnD_land: trashCan';
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

  av.dnd.analyzeChart.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop0
    if ('analyzeChart' == target.node.id) {
      //av.debug.log += '\n -DnD_land: analyzeChart';
      if (av.debug.dnd) console.log('analyzeChart: s, t', source, target);
      av.dnd.landanalyzeChart(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  av.dnd.graphPop0.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop0
    if ('graphPop0' == target.node.id) {
      //av.debug.log += '\n -DnD_land: graphPop0';
      if (av.debug.dnd) console.log('graphPop0: s, t', source, target);
      av.dnd.landgraphPop0(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  av.dnd.graphPop1.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop1
    if ('graphPop1' == target.node.id) {
      //av.debug.log += '\n -DnD_land: graphPop1';
      if (av.debug.dnd) console.log('graphPop1: s, t', source, target);
      av.dnd.landgraphPop1(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  av.dnd.graphPop2.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of graphPop2
    if ('graphPop2' == target.node.id) {
      //av.debug.log += '\n -DnD_land: graphPop2';
      if (av.debug.dnd) console.log('graphPop2: s, t', source, target);
      av.dnd.landgraphPop2(av.dnd, source, nodes, target);
      av.anl.AnaChartFn();
    }
  });

  //need to figure out active configuration and active world
  av.dnd.fzWorld.on('DndDrop', function (source, nodes, copy, target) {//This triggers for every dnd drop, not just those of activeConfig
    if ('fzWorld' == target.node.id) {
      //av.debug.log += '\n -DnD_land: fzWorld';
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
        av.debug.log += '\n -DnD_from: graphPop0?';
        av.anl.pop[0].left = [];       //remove lines from population 1
        av.anl.pop[0].right = [];
        av.anl.AnaChartFn();
        break;
      case 'graphPop1':
        av.debug.log += '\n -DnD_from: graphPop1?';
        av.anl.pop[1].left = [];       //remove lines from population 2
        av.anl.pop[1].right = [];
        av.anl.AnaChartFn();
        break;
      case 'graphPop2':
        av.debug.log += '\n -DnD_from: graphPop2?';
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
  document.getElementById('PopSetupButton').onclick = function () {
    av.ptd.popBoxSwap();   //in popControls.js
  };

  // hides and shows the population and selected organsim data on right of population page with 'Stats/mpa' button
  av.ptd.popStatView = function () {
    if (av.ptd.popStatFlag) {
      av.debug.log += '\n -Button: PopStatsButton: start hidding stats';
      av.ptd.popStatFlag = false;
      registry.byId('popRight').domNode.style.width = '1px';
      registry.byId('mainBC').layout();
      dijit.byId('popRight').set('style', 'display: block; visibility: hidden;');

    }
    else {
      av.debug.log += '\n -Button: PopStatsButton: start showing stats';
      av.ptd.popStatFlag = true;
      registry.byId('sotPane').domNode.style.width = '150px';
      registry.byId('popRight').domNode.style.width = '395px';
      registry.byId('mainBC').layout();
      av.ui.adjustPopRightSize();
      dijit.byId('popRight').set('style', 'display: block; visibility: visible;');

    }
  }

  document.getElementById('PopStatsButton').onclick = function () {
    av.ptd.popStatView()
  };

  //--------------------------------------------------------------------------------------------------------------------
  ///   Map Grid buttons - New  Run/Pause Freeze
  //--------------------------------------------------------------------------------------------------------------------

  av.ptd.makeRunState = function () {
    document.getElementById('runStopButton').textContent = 'Pause';
    dijit.byId('mnCnPause').attr('disabled', false);
    dijit.byId('mnCnRun').attr('disabled', true);
  }

  av.ptd.runPopFn = function () {
    //check for ancestor organism in configuration data
    var namelist = dojo.query('> .dojoDndItem', 'ancestorBox');
    //console.log('namelist', namelist);
    if (1 > namelist.length) {
      //console.log('about to call av.ptd.makePauseState()');
      //av.debug.log += 'about to call av.ptd.makePauseState() in AvidaEd.js line 740 \n';
      av.ptd.makePauseState();
      NeedAncestorDialog.show();
    }
    else { // setup for a new run by sending config data to avida
      if ('started' !== av.grd.runState) {
        //collect setup data to send to avida.  Order matters. Files must be created first. Then files must be sent before some other stuff.
        av.fwt.form2cfgFolder();          //fileDataWrite.js creates avida.cfg and environment.cfg and ancestor.txt and ancestor_manual.txt
        if ('prepping' === av.grd.runState) {
          av.msg.importConfigExpr();
          av.msg.injectAncestors();
        }
        else {
          av.msg.importWorldExpr();
        }

        //change ui parameters for the correct state when the avida population has started running
        av.ptd.popRunningStateUi();  //av.grd.runState now == 'started'

        av.msg.requestGridData();
        av.msg.requestPopStats();
        if (0 < av.grd.selectedNdx) av.msg.doWebOrgDataByCell();
      }

      if (dijit.byId('autoUpdateRadio').get('checked')) {
        //av.msg.pause(dijit.byId('autoUpdateSpinner').get('value'));  //not used where there is handshaking (not used with av.msg.stepUpdate)
        av.ui.autoStopFlag = true;
        av.ui.autoStopValue = dijit.byId('autoUpdateSpinner').get('value');
        //console.log('stop at ', dijit.byId('autoUpdateSpinner').get('value'));
      }

      av.ptd.makeRunState();
      av.msg.stepUpdate();   //av.msg.doRunPause(av.fio);
    }
    //update screen based on data from C++
  }

  av.ptd.runStopFn = function () {
    if ('Run' == document.getElementById('runStopButton').innerHTML) {
      av.ptd.makeRunState();
      av.ptd.runPopFn();
    } else {
      //console.log('about to call av.ptd.makePauseState()');
      //av.debug.log += 'about to call av.ptd.makePauseState() in AvidaEd.js line 772 \n';
      av.ptd.makePauseState();
      //av.msg.doRunPause(av.fio);
      //console.log('pop size ', av.ptd.aveNum);
    }
  };

  //process the run/Stop Button - a separate function is used so it can be flipped if the message to avida is not successful.
  document.getElementById('runStopButton').onclick = function () {
    av.debug.log += '\n -Button: runStopButton';
    av.ptd.runStopFn();
  };

  dijit.byId('mnCnPause').on('Click', function () {
    av.debug.log += '\n -Button: mnCnPause';
    //console.log('about to call av.ptd.makePauseState()');
    av.debug.log += 'about to call av.ptd.makePauseState() in AvidaEd.js line 786 \n';
    av.msg.pause('now');
    av.ptd.makePauseState();
  });

  //process run/Stop buttons as above but for drop down menu
  dijit.byId('mnCnRun').on('Click', function () {
    av.debug.log += '\n -Button: mnCnRun';
    av.ptd.makeRunState();
    av.ptd.runPopFn();
  });

  /******************************************* New Button and new Dialog **********************************************/

  dijit.byId('newDiscard').on('Click', function () {
    av.debug.log += '\n -Button: newDiscard';
    newDialog.hide();
    av.msg.reset();
    //av.ptd.resetDishFn(true); //Only do when get reset back from avida after sending reset
    //console.log('newDiscard click');
  });

  dijit.byId('newSaveWorld').on('Click', function () {
    av.debug.log += '\n -Button: newSaveWorld';
    av.ptd.FrPopulationFn();
    newDialog.hide();
    av.msg.reset();
    //av.ptd.resetDishFn(true); //Only do when get reset back from avida after sending reset
    //console.log('newSave click');
  });

  dijit.byId('newSaveConfig').on('Click', function () {
    av.debug.log += '\n -Button: newSaveConfig';
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

  document.getElementById('newDishButton').onclick = function () {
    av.debug.log += '\n -Button: newDishButton';
    newButtonBoth();
  };

  dijit.byId('mnNewpop').on('Click', function () {
    av.debug.log += '\n -Button: mnNewpop';
    newButtonBoth();
  });

  //**************************************      Freeze Button      *****************************************************
  //Saves either configuration or populated dish
  //Also creates context menu for all new freezer items.*/
  document.getElementById('freezeButton').onclick = function () {
    av.debug.log += '\n -Button: freezeButton';
    if ('prepping' == av.grd.runState) av.ptd.FrConfigFn();
    else {
      if (5 > av.msg.ByCellIDgenome.length) {
        document.getElementById('FzOrgansimSpan').style.display = 'none';
      }  //block
      else document.getElementById('FzOrgansimSpan').style.display = 'inline';
      fzDialog.show();
    }
  };

  dijit.byId('FzConfigurationButton').on('Click', function () {
    av.debug.log += '\n -Button: FzConfigurationButton';
    fzDialog.hide();
    av.ptd.FrConfigFn();
  });

  //Drop down menu to save a configuration item
  dijit.byId('mnFzConfig').on('Click', function () {
    av.debug.log += '\n -Button: mnFzConfig';
    av.ptd.FrConfigFn();
  });

  //
  dijit.byId('FzOrganismButton').on('Click', function () {
    av.debug.log += '\n -Button: FzOrganismButton';
    fzDialog.hide();
    av.ptd.FrOrganismFn('selected');
  });

  //button to freeze a population
  dijit.byId('FzPopulationButton').on('Click', function () {
    av.debug.log += '\n -Button: FzPopulationButton';
    fzDialog.hide();
    av.ptd.FrPopulationFn();
  });

  dijit.byId('mnFzPopulation').on('Click', function () {
    av.debug.log += '\n -Button: mnFzPopulation';
    av.ptd.FrPopulationFn();
  });

  //Buttons on drop down menu to save an organism
  dijit.byId('mnFzOrganism').on('Click', function () {
    av.debug.log += '\n -Button: mnFzOrganism';
    av.ptd.FrOrganismFn('selected')
  });

  //Buttons on drop down menu to save an offspring
  dijit.byId('mnFzOffspring').on('Click', function () {
    av.debug.log += '\n -Button: mnFzOffspring';
    av.ptd.FrOrganismFn('offspring')
  });

  // End of Freezer functions
  //---------------------------------------------- Restart Avida web worker --------------------------------------------

  //http://www.w3schools.com/html/tryit.asp?filename=tryhtml5_webworker
  av.ui.restartAvida = function () {
    userMsgLabel.textContent = 'reloading Avida . . .';

    av.aww.uiWorker.terminate();
    av.aww.uiWorker = null;

    console.log('just killed webWorker');

    if (typeof(Worker) !== 'undefined') {
      if (null == av.aww.uiWorker) {
        av.aww.uiWorker = new Worker('avida.js');
        console.log('webworker recreated');
        av.debug.log += '\nui --> Avida:  ui killed avida webworker and started a new webworker'
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
    av.debug.log += '\n -Button: restartAvidaNow';
    av.ui.restartAvida();
  }

  document.getElementById('restartAvidaFrzConfig').onclick = function () {
    av.debug.log += '\n -Button: restartAvidaFzrConfig';
    av.ptd.FrConfigFn();
  }

  //test - delete later ------------------------------------------------------------------------------------------------
  document.getElementById('mnDbRestartAvida').onclick = function () {
    av.debug.log += '\n -Button: mnDbRestartAvida';
    av.aww.restartAvidaFn();
  }

  document.getElementById('mnDbDiagnostic').onclick = function () {
    av.debug.log += '\n -Button: mnDbDiagnostic';
    av.dcn.diagnosticConsoleFn();
  }

  document.getElementById('mnDbThrowData').onclick = function () {
    'use strict';
    av.debug.log += '\n -Button: mnDbThrowData';
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
  };

  document.getElementById('mnDbThrowError').onclick = function () {
    'use strict';
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
    av.mouse.downOrganCanvasFn(evt);
  });

  //if a cell is selected, arrow keys can move the selection
  $(document).keydown(function (event) { av.mouse.arrowKeysOnGrid(event)});

  //av.mouse down on the grid
  $(document.getElementById('gridCanvas')).on('mousedown', function (evt) {
    av.mouse.downGridCanvasFn(evt)  });

  av.mouse.downGridCanvasFn = function (evt) {
  av.mouse.DnGridPos = [evt.offsetX, evt.offsetY];
    av.mouse.Dn = true;
    // Select if it is in the grid
    av.mouse.findSelected(evt, av.grd);
    //check to see if in the grid part of the canvas
    if (av.debug.mouse) console.log('av.mousedown', av.grd.selectedNdx);
    //if (av.debug.mouse) console.log('grid Canvas; selectedNdx', av.grd.selectedNdx,'________________________________');
    //if (av.debug.mouse) console.log('grid Canvas; av.grd.msg.ancestor[av.grd.selectedNdx]', av.grd.msg.ancestor.data[av.grd.selectedNdx]);
    if (av.grd.selectedCol >= 0 && av.grd.selectedCol < av.grd.cols && av.grd.selectedRow >= 0 && av.grd.selectedRow < av.grd.rows) {
      av.grd.flagSelected = true;
      if (av.debug.mouse) console.log('ongrid', av.grd.selectedNdx);
      av.debug.log += '\n -Grid click on ' + av.grd.selectedNdx;
      //console.log('before call av.grd.drawGridSetupFn');
      av.grd.drawGridSetupFn();

      //In the grid and selected. Now look to see contents of cell are dragable.
      av.mouse.ParentNdx = -1; //index into parents array if parent selected else -1;
      if ('prepping' == av.grd.runState) {  //run has not started so look to see if cell contains ancestor
        av.mouse.ParentNdx = av.mouse.findParentNdx(av.parents);
        if (av.debug.mouse) console.log('parent', av.mouse.ParentNdx);
        if (-1 < av.mouse.ParentNdx) { //selected a parent, check for dragging
          av.mouse.selectedDadMouseStyle();
          av.mouse.Picked = 'parent';
        }
      }
      else {  //look for decendents (kids)
        if (av.debug.mouse) console.log('kidSelected; selectedNdx', av.grd.selectedNdx, '________________________________');
        if (av.debug.mouse) console.log('kidSelected; av.grd.msg.ancestor[av.grd.selectedNdx]', av.grd.msg.ancestor.data[av.grd.selectedNdx]);
        //find out if there is a kid in that cell
        //if ancestor not null then there is a 'kid' there.
        //if (null != av.grd.msg.ancestor.data[av.grd.selectedNdx]) {
        if (av.grd.msg.ancestor) {
          if (null != av.grd.msg.ancestor.data[av.grd.selectedNdx]) {
            av.grd.kidStatus = 'getgenome';
            av.msg.doWebOrgDataByCell();
            av.mouse.selectedKidMouseStyle();
            av.grd.kidName = 'temporary';
            av.grd.kidGenome = '0,heads_default,wzcagcccccccccaaaaaaaaaaaaaaaaaaaaccccccczvfcaxgab';  //ancestor
            av.mouse.Picked = 'kid';
            if (av.debug.mouse) console.log('kid', av.grd.kidName, av.grd.kidGenome);
            dijit.byId('mnFzOrganism').attr('disabled', false);  //When an organism is selected, then it can be save via the menu
            dijit.byId('mnCnOrganismTrace').attr('disabled', false);
          }
          else {
            dijit.byId('mnCnOrganismTrace').attr('disabled', true);
            dijit.byId('mnFzOrganism').attr('disabled', true);  //kid not selected, then it cannot be save via the menu
          }
        }
        else {
          dijit.byId('mnCnOrganismTrace').attr('disabled', true);
          dijit.byId('mnFzOrganism').attr('disabled', true);  //kid not selected, then it cannot be save via the menu
        }
      }
    }
    else {
      av.grd.flagSelected = false;
      av.grd.selectedNdx = -1;
      dijit.byId('mnCnOrganismTrace').attr('disabled', true);
      dijit.byId('mnFzOrganism').attr('disabled', true);
    }
    av.grd.drawGridSetupFn();
  }

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

  //When mouse button is released, return cursor to default values
  $(document).on('mouseup', function (evt) {
    'use strict';
    var target = '';
    if (av.debug.mouse) console.log('in mouseup target:', evt.target.id, '; event:', evt);
    av.mouse.makeCursorDefault();
    av.mouse.UpGridPos = [evt.offsetX, evt.offsetY];
    if (av.debug.mouse) console.log('AvidaED.js: mouse.UpGridPosX, y', av.mouse.UpGridPos[0], av.mouse.UpGridPos[1]);
    av.mouse.Dn = false;

    // --------- process if something picked to dnd ------------------
    if ('parent' == av.mouse.Picked) {
      av.mouse.Picked = '';
      av.mouse.ParentMouse(evt, av);
      if ('gridCanvas' == evt.target.id || 'TrashCanImage' == evt.target.id) {
        console.log('before call av.grd.drawGridSetupFn');
        av.grd.drawGridSetupFn();
      }
      else if ('organIcon' == evt.target.id) {
        //Change to Organism Page
        av.ui.mainBoxSwap('organismBlock');
        organismCanvasHolderSize();
        var height = ($('#rightDetail').innerHeight() - 375) / 2;
        document.getElementById('ExecuteJust').style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById('ExecuteAbout').style.height = height + 'px';
        document.getElementById('ExecuteJust').style.width = '100%';
        document.getElementById('ExecuteAbout').style.width = '100%';
        if (av.debug.mouse) console.log('from parent', av.parent, '; fzr', av.fzr);
        av.debug.log += '\n -drag to Icon';
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
        document.getElementById('ExecuteJust').style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
        document.getElementById('ExecuteAbout').style.height = height + 'px';
        document.getElementById('ExecuteJust').style.width = '100%';
        document.getElementById('ExecuteAbout').style.width = '100%';
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
  av.grd.CanvasScale = document.getElementById('scaleCanvas');
  av.grd.sCtx = av.grd.CanvasScale.getContext('2d');
  av.grd.CanvasGrid = document.getElementById('gridCanvas');
  av.grd.cntx = av.grd.CanvasGrid.getContext('2d');
  av.grd.CanvasSelected = document.getElementById('sotColor');
  av.grd.selCtx = av.grd.CanvasSelected.getContext('2d');
  av.grd.SelectedWd = $('#sotColor').innerWidth();
  av.grd.SelectedHt = $('#sotColor').innerHeight();

  av.grd.CanvasScale.width = document.getElementById('gridControlTable').clientWidth - 1;
  av.grd.CanvasGrid.width = document.getElementById('gridHolder').clientHeight / 2;
  //av.grd.CanvasGrid.height = $('#gridHolder').innerHeight() - 16 - av.grd.CanvasScale.height;
  av.grd.CanvasGrid.height = 15;

  //--------------------------------------------------------------------------------------------------------------------
  if (av.debug.root) console.log('before av.grd.drawGridSetupFn');

  av.grd.drawGridSetupFn = function () {
    'use strict';
    if ('populationBlock' === av.ui.page && 'Setup' === document.getElementById('PopSetupButton').textContent) {
      if ('None' == dijit.byId('colorMode').value) {
        if (av.grd.newlyNone) {
          av.grd.newlyNone = false;
          av.grd.cntx.fillStyle = av.color.dictColor['Black'];
          av.grd.cntx.fillRect(1, 1, av.grd.CanvasGrid.width - 1, av.grd.CanvasGrid.height - 1);
        }
      }
      else {
        av.grd.newlyNone = true;
        av.grd.notInDrawingGrid = false;
        if ('prepping' != av.grd.runState && undefined != av.grd.msg.fitness) {
          av.grd.setMapData();  //update color information for offpsring once run has started
          av.grd.findLogicOutline();
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

        var gridHolderHt = document.getElementById('gridHolder').clientHeight;
        av.ui.num = Math.floor(gridHolderHt / 4);

        av.grd.CanvasGrid.width = document.getElementById('gridHolder').clientWidth - 1;
        av.grd.CanvasGrid.height = gridHolderHt - 2;
        av.grd.spaceX = av.grd.CanvasGrid.width;
        av.grd.spaceY = av.grd.CanvasGrid.height;

        av.grd.findGridSize(av.grd, av.parents);
        if (document.getElementById('gridHolder').scrollHeight == document.getElementById('gridHolder').clientHeight + 17) {
          var numGH = document.getElementById('gridHolder').clientHeight;
          av.grd.CanvasGrid.height = numGH - 6 - 17;
          av.grd.findGridSize(av.grd, av.parents);     //in PopulationGrid.js
        }
        av.grd.drawGridUpdate();   //in PopulationGrid.js

        rescaleLabel.textContent = av.grd.fillRescale;
        av.grd.notInDrawingGrid = true;
      }
    }
  }

  // The rest of grid canvas drawing code is in PopulationGrid.js

  // *******************************************************************************************************************
  //        Color Map Color Mode and Zoom Slide Controls
  // *******************************************************************************************************************

  // Get color map data from Avida and draw
  dijit.byId('colorMode').on('Change', function () {
    var scaleType = dijit.byId('colorMode').value;
    //Redraw Grid;
    console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
  });

  // Zoom slide - display only not avida
  av.grd.ZoomSlide = new HorizontalSlider({
    name: 'ZoomSlide',
    value: 1,
    minimum: 1,
    maximum: 10,
    intermediateChanges: true,
    discreteValues: 19,
    style: 'height: auto; width: 120px;float:right',
    onChange: function (value) {
      av.grd.zoom = value;
      //console.log('ZoomSlide', av.grd.zoom);
      console.log('before call av.grd.drawGridSetupFn');
      av.grd.drawGridSetupFn();
    }
  }, 'ZoomSlide');

  av.grd.colorMap = 'Gnuplot2';
  dijit.byId('mnGnuplot2').attr('disabled', true);

  dijit.byId('mnViridis').on('Click', function () {
    av.debug.log += '\n -Button: mnViridis';
    dijit.byId('mnCubehelix').attr('disabled', false);
    dijit.byId('mnGnuplot2').attr('disabled', false);
    dijit.byId('mnViridis').attr('disabled', true);
    av.grd.colorMap = 'Viridis';
    console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
  });

  dijit.byId('mnGnuplot2').on('Click', function () {
    av.debug.log += '\n -Button: mnGnuplot2';
    dijit.byId('mnCubehelix').attr('disabled', false);
    dijit.byId('mnGnuplot2').attr('disabled', true);
    dijit.byId('mnViridis').attr('disabled', false);
    av.grd.colorMap = 'Gnuplot2';
    console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
  });

  dijit.byId('mnCubehelix').on('Click', function () {
    av.debug.log += '\n -Button: mnCubehelix';
    dijit.byId('mnCubehelix').attr('disabled', true);
    dijit.byId('mnGnuplot2').attr('disabled', false);
    dijit.byId('mnViridis').attr('disabled', false);
    av.grd.colorMap = 'Cubehelix';
    console.log('before call av.grd.drawGridSetupFn');
    av.grd.drawGridSetupFn();
    av.debug.log += '\n -Button: mnCubehelix pressed';
  });

  // *******************************************************************************************************************
  //    Buttons that select organisms that perform a logic function
  // *******************************************************************************************************************
  if (av.debug.root) console.log('before logic buttons');

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
  }

  // -------------------------------------------------------------------------------------------------------------------
  //                    Population Chart   ; pop chart; popchart
  // -------------------------------------------------------------------------------------------------------------------
  // tried moving this whole section to another file:
  //   dijit.byId lines need to be in this file.
  //   some of the chart definition lines need to be in this file.

  // Chart control on population page
  //Set Y-axis title and choose the correct array to plot
  dijit.byId('yaxis').on('Change', function () {
    av.grd.ytitle = dijit.byId('yaxis').value;
    //need to get correct array to plot from freezer
    //console.log('changeyaxis popChartFn');
    av.grd.popChartFn();
  });

// Can use theme to change grid color based on tick color http://stackoverflow.com/questions/6461617/change-the-color-of-grid-plot-dojo
//this required the use of a theme, but I'm no longer using the theme. Could take 'Wetland' out of require statemet as long a this is not used
//var myTheme = Wetland; // Or any other theme
//myTheme.axis.majorTick.color = '#CCC';  //grey
//myTheme.axis.minorTick.color = 'red';


  av.grd.popChartFn = function () {
    'use strict';
    if ('populationBlock' === av.ui.page && av.ptd.popStatFlag && undefined !== av.ptd.logFit[1]) {
      //console.log('chart update=', av.grd.popStatsMsg.update);
      //av.debug.log += '\n - - Call popChartFn';
      if ('Average Fitness' == dijit.byId('yaxis').value) {
        av.grd.popY = av.ptd.aveFit;
        av.grd.popY2 = av.ptd.logFit;
      }
      else if ('Average Generation Length' == dijit.byId('yaxis').value) {
        av.grd.popY = av.ptd.aveGnl;
        av.grd.popY2 = av.ptd.logGnl;
      }
      else if ('Average Metabolic Rate' == dijit.byId('yaxis').value) {
        av.grd.popY = av.ptd.aveMet;
        av.grd.popY2 = av.ptd.logMet;
      }
      else if ('Number of Organisms' == dijit.byId('yaxis').value) {
        av.grd.popY = av.ptd.aveNum;
        av.grd.popY2 = av.ptd.logNum;
      }
      else {
        console.log('yaxis is None');
        av.grd.popY = [0];
        av.grd.popY2 = [0];
      }
      //console.log('popY after',av.grd.popY);
      //console.log('pop2 after', av.grd.popY2);
      /*
      av.grd.popChart.addPlot('default', {type: 'Lines'});
      av.grd.popChart.addPlot('grid', {
        type: Grid, hMajorLines: true, majorHLine: {color: '#CCC', width: 1},
        vMajorLines: true, majorVLine: {color: '#CCC', width: 1}
      });

      av.grd.popChart.addAxis('x', {
        fixLower: 'major', fixUpper: 'major', title: 'Time (updates)', titleOrientation: 'away', titleGap: 2,
        titleFont: 'normal normal normal 8pt Arial', font: 'normal normal normal 8pt Arial'
      });
      //av.grd.popChart.addAxis('y', {vertical: true, title: ytitle, titleFont: 'normal normal normal 8pt Arial', titleOrientation: 'axis',
      av.grd.popChart.addAxis('y', {
        vertical: true,
        fixLower: 'major', fixUpper: 'major', min: 0, font: 'normal normal normal 8pt Arial', titleGap: 4,
      });
      */
      //av.grd.popChart.addSeries('Series y', popY, {stroke: {color: 'blue', width: 1}});
      //av.grd.popChart.addSeries('Series y2', popY2, {stroke: {color: 'red', width: 2}});
      av.grd.popChart.addSeries('Series y', av.grd.popY, {plot: 'default', stroke: {color: 'blue', width: 1}});
      av.grd.popChart.addSeries('Series y2', av.grd.popY2, {plot: 'default', stroke: {color: 'green', width: 1}});
      av.grd.popChart.resize(domGeometry.position(document.getElementById('popChartHolder')).w - 10,
        domGeometry.position(document.getElementById('popChartHolder')).h - 30);
      av.grd.popChart.render();
    }
  };

  av.grd.popChartClear = function () {
    'use strict';
      av.grd.popY = [0];
      av.grd.popY2 = [0];
      av.grd.popChart.addPlot('default', {type: 'Lines'});
      av.grd.popChart.addPlot('grid', {
        type: Grid, hMajorLines: true, majorHLine: {color: '#CCC', width: 1},
        vMajorLines: true, majorVLine: {color: '#CCC', width: 1}
      });

      av.grd.popChart.addAxis('x', {
        fixLower: 'major', fixUpper: 'major', title: 'Time (updates)', titleOrientation: 'away', titleGap: 2,
        titleFont: 'normal normal normal 8pt Arial', font: 'normal normal normal 8pt Arial'
      });
      av.grd.popChart.addAxis('y', {
        vertical: true,
        fixLower: 'major', fixUpper: 'major', min: 0, font: 'normal normal normal 8pt Arial', titleGap: 4,
      });
      //av.grd.popChart.addSeries('Series y', popY, {stroke: {color: 'blue', width: 1}});
      //av.grd.popChart.addSeries('Series y2', popY2, {stroke: {color: 'red', width: 2}});
      av.grd.popChart.addSeries('Series y', av.grd.popY, {plot: 'default', stroke: {color: 'blue', width: 1}});
      av.grd.popChart.addSeries('Series y2', av.grd.popY2, {plot: 'default', stroke: {color: 'green', width: 1}});
      av.grd.popChart.resize(domGeometry.position(document.getElementById('popChartHolder')).w - 10,
        domGeometry.position(document.getElementById('popChartHolder')).h - 30);
      av.grd.popChart.render();
  };
  av.grd.popChartClear();

  // **************************************************************************************************************** */
  // ******* Population Setup Buttons from 'Setup' subpage ********* */
  // **************************************************************************************************************** */
  av.grd.gridWasCols = Number(document.getElementById('sizeCols').value);
  av.grd.gridWasRows = Number(document.getElementById('sizeRows').value);

  function popSizeFn() {
    var NewCols = Number(document.getElementById('sizeCols').value);
    var NewRows = Number(document.getElementById('sizeRows').value);
    document.getElementById('sizeCells').innerHTML = 'is a total of ' + NewCols * NewRows + ' cells';
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
    av.grd.gridWasCols = Number(document.getElementById('sizeCols').value);
    av.grd.gridWasRows = Number(document.getElementById('sizeRows').value);
    //reset zoom power to 1
    av.grd.ZoomSlide.set('value', 1);
    av.parents.placeAncestors();
    //are any parents on the same cell?
    av.grd.cellConflict(NewCols, NewRows);
  }

  dijit.byId('sizeCols').on('Change', popSizeFn);
  dijit.byId('sizeRows').on('Change', popSizeFn);

  $(function slidemute() {
    /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
    /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
    /* so I multiplied by 100,000 to get 100.000% to come out even. */
    //console.log('before defaultslide value');
    var muteSlideDefault = 109861.
    /* results in 2% as a default */
    var muteDefault = (Math.pow(Math.E, (muteSlideDefault / 100000)) - 1).toFixed(3)
    var slides = $('#muteSlide').slider({
      // range: 'min',   /*causes the left side of the scroll bar to be grey */
      value: muteSlideDefault,
      min: 0.0,
      max: 461512,
      slide: function (event, ui) {
        //$( '#mRate' ).val( ui.value);  /*put slider value in the text above the slider */
        $('#muteInput').val((Math.pow(Math.E, (ui.value / 100000)) - 1).toFixed(3));
        /*put the value in the text box */
      }
    });
    /* initialize */
    //$( '#mRate' ).val( ($( '#muteSlide').slider( 'value' )));  //used in testing nonlinear scale
    $('#muteInput').val(muteDefault);
    /*update slide based on textbox */
    $('#muteInput').change(function () {
      slides.slider('value', 100000.0 * Math.log(1 + (parseFloat(this.value))));
      $('#mRate').val(100000 * Math.log(1 + (parseFloat(this.value))));
      //console.log('in mute change');
    });
  });

  dojo.connect(dijit.byId('manualUpdateRadio'), 'onClick', function () {
    av.debug.log += '\n -Button: manualUpdateRadio';
    av.ui.autoStopFlag = false;
  });

  dojo.connect(dijit.byId('autoUpdateRadio'), 'onClick', function () {
    av.debug.log += '\n -Button: autoUpdateRadio';
    av.ui.autoStopFlag = true;
  });

  dojo.connect(dijit.byId('autoUpdateSpinner'), 'onChange', function () {
    av.debug.log += '\n -Spinner: autoUpdateSpinner=' + dijit.byId('autoUpdateSpinner').get('value');
    av.ui.autoStopValue = dijit.byId('autoUpdateSpinner').get('value');
    console.log('autoUpdateSpinner=', dijit.byId('autoUpdateSpinner').get('value'));
  });

  /* *************************************************************** */
  /* Organism page script *********************************************/
  /* *************************************************************** */
  /* **** Organism Setup Dialog */

  //process button to hide or show Organism detail panal.
  var DetailsFlag = true;
  document.getElementById('OrgDetailsButton').onclick = function () {
    av.debug.log += '\n -Button: OrgDetailsButton';
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

  //Opens Settings dialog box
  document.getElementById('OrgSetting').onclick = function () {
    av.ind.settingsChanged = false;
    OrganSetupDialog.show();
  }

  //If settings were changed then this will request new data when the settings dialog box is closed.
  OrganSetupDialog.connect(OrganSetupDialog, 'hide', function (e) {
    if (av.ind.settingsChanged) av.msg.doOrgTrace();
  });

  $(function slideOrganism() {
    /* because most mutation rates will be less than 2% I set up a non-linear scale as was done in the Mac Avida-ED */
    /* the jQuery slider I found only deals in integers and the fix function truncates rather than rounds, */
    /* so I multiplied by 100,000 to get 100.000% to come out even. */
    //console.log('before defaultslide value');
    var muteSlideDefault = 109861.
    /* results in 2% as a default */
    var muteDefault = (Math.pow(Math.E, (muteSlideDefault / 100000)) - 1).toFixed(3)
    var slides = $('#orMuteSlide').slider({
      // range: 'min',   /*causes the left side of the scroll bar to be grey */
      value: muteSlideDefault,
      min: 0.0,
      max: 461512,
      slide: function (event, ui) {
        //$( '#orMRate' ).val( ui.value);  /*put slider value in the text near slider */
        $('#orMuteInput').val((Math.pow(Math.E, (ui.value / 100000)) - 1).toFixed(3));
        /*put the value in the text box */
        av.ind.settingsChanged = true;
        if (av.debug.trace) console.log('orSlide changed', av.ind.settingsChanged)
      }
    });
    /* initialize */
    //$( '#orMRate' ).val( ($( '#orMuteSlide').slider( 'value' )));
    //$( '#orMuteInput' ).val(muteDefault+'%');
    $('#orMuteInput').val(muteDefault);
    /*update slide based on textbox */
    $('#orMuteInput').change(function () {
      slides.slider('value', 100000.0 * Math.log(1 + (parseFloat(this.value))));
      av.ind.settingsChanged = true;
      if (av.debug.trace) console.log('orMute changed', av.ind.settingsChanged)
      //$( '#orMRate' ).val( 100000*Math.log(1+(parseFloat(this.value))) );
      //console.log('in mute change');
    });
  });

  //triggers flag that requests more data when the settings dialog is closed.
  //http://stackoverflow.com/questions/3008406/dojo-connect-wont-connect-onclick-with-button
  dojo.connect(dijit.byId('OrganExperimentRadio'), 'onClick', function () {
    av.debug.log += '\n -Button: OrganExperimentRadio';
    av.ind.settingsChanged = true;
  });
  dojo.connect(dijit.byId('OrganDemoRadio'), 'onClick', function () {
    av.ind.settingsChanged = true;
    av.debug.log += '\n -Button: OrganDemoRadio';
  });

  // ****************************************************************
  //        Menu buttons that call for genome/Organism trace
  // ****************************************************************
  dijit.byId('mnCnOrganismTrace').on('Click', function () {
    av.debug.log += '\n -Button: mnCnOrganismTrace';
    av.mouse.traceSelected(av.dnd, av.fzr, av.grd);
    av.ui.mainBoxSwap('organismBlock');
    organismCanvasHolderSize();
    var height = ($('#rightDetail').innerHeight() - 375) / 2;
    document.getElementById('ExecuteJust').style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById('ExecuteAbout').style.height = height + 'px';
    document.getElementById('ExecuteJust').style.width = '100%';
    document.getElementById('ExecuteAbout').style.width = '100%';
    av.msg.doOrgTrace();  //request new Organism Trace from Avida and draw that.
  });

  //Put the offspring in the parent position on Organism Trace
  dijit.byId('mnCnOffspringTrace').on('Click', function () {
    //Open Oranism view
    av.debug.log += '\n -Button: mnCnOffspringTrace';
    av.ui.mainBoxSwap('organismBlock');
    organismCanvasHolderSize();
    var height = ($('#rightDetail').innerHeight() - 375) / 2;
    document.getElementById('ExecuteJust').style.height = height + 'px';  //from http://stackoverflow.com/questions/18295766/javascript-overriding-styles-previously-declared-in-another-function
    document.getElementById('ExecuteAbout').style.height = height + 'px';
    document.getElementById('ExecuteJust').style.width = '100%';
    document.getElementById('ExecuteAbout').style.width = '100%';
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
      updateOrganTrace(av.traceObj, av.gen);
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
    av.debug.log += '\n -Button: orgBack';
    var ii = Number(document.getElementById('orgCycle').value);
    if (av.ind.cycleSlider.get('minimum') < av.ind.cycleSlider.get('value')) {
      ii--;
      dijit.byId('orgCycle').set('value', ii);
      av.ind.cycle = ii;
      av.ind.updateOrgTrace()
    }
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
  };

  document.getElementById('orgReset').onclick = function () {
    av.debug.log += '\n -Button: orgReset';
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
    av.debug.log += '\n -Button: orgRun';
    if ('Run' == document.getElementById('orgRun').textContent) {
      document.getElementById('orgRun').textContent = 'Stop';
      av.ind.update_timer = setInterval(av.ind.orgRunFn, 100);
    }
    else {
      av.ind.orgStopFn();
    }
  };

  document.getElementById('orgEnd').onclick = function () {
    av.debug.log += '\n -Button: orgEnd';
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

  /* Organism Generation Length Slider */
  av.ind.cycleSlider = new HorizontalSlider({
    name: 'cycleSlider',
    value: 0,
    minimum: 0,
    maximum: 200,
    intermediateChanges: true,
    discreteValues: 201,
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

  av.anl.AnaChartFn = function () {
    anaChart.addPlot('default', {type: 'Lines', hAxis: 'x', vAxis: 'y'});
    anaChart.addPlot('other', {type: 'Lines', hAxis: 'x', vAxis: 'right y'});
    //grid line info on https://dojotoolkit.org/reference-guide/1.10/dojox/charting.html
    anaChart.addPlot('grid', {
      type: Grid, hMajorLines: true, majorHLine: {color: '#CCC', width: 1},
      vMajorLines: true, majorVLine: {color: '#CCC', width: 1}
    });
    if (av.debug.anl) console.log('add x axis');
    anaChart.addAxis('x', {fixLower: 'major', fixUpper: 'major', title: 'Time (updates)', titleOrientation: 'away'});
    anaChart.addAxis('y', {
      vertical: true,
      fixLower: 'major',
      title: av.anl.yLeftTitle,
      titleOrientation: 'axis',
      fixUpper: 'major',
      min: 0
    });
    //anaChart.addAxis('top x', {leftBottom: false});
    anaChart.addAxis('right y', {vertical: true, leftBottom: false, min: 0, title: av.anl.yRightTitle});
    anaChart.addSeries('Series 0a', av.anl.pop[0].left, {stroke: {color: av.anl.color[0], width: 2}});
    anaChart.addSeries('Series 1a', av.anl.pop[1].left, {stroke: {color: av.anl.color[1], width: 2}});
    anaChart.addSeries('Series 2a', av.anl.pop[2].left, {stroke: {color: av.anl.color[2], width: 2}});
    anaChart.addSeries('Series 0b', av.anl.pop[0].right, {plot: 'other', stroke: {color: av.anl.color[0], width: .3}});
    anaChart.addSeries('Series 1b', av.anl.pop[1].right, {plot: 'other', stroke: {color: av.anl.color[1], width: .3}});
    anaChart.addSeries('Series 2b', av.anl.pop[2].right, {plot: 'other', stroke: {color: av.anl.color[2], width: .3}});
    var wdth = domGeometry.position(document.getElementById('chartHolder')).w - 10;
    var ht = domGeometry.position(document.getElementById('chartHolder')).h - 15;
    if (av.debug.anl) console.log('before resize: w', wdth, '; h', ht);
    anaChart.resize(wdth, ht);
    var dZoom = new MouseZoomAndPan(anaChart, 'default');
    //https://www.sitepen.com/blog/2012/11/09/dojo-charting-zooming-scrolling-and-panning/  a different zoom method using a window.
    anaChart.render();
  };

  /* Chart buttons ****************************************/
  document.getElementById('pop0delete').onclick = function () {
    av.debug.log += '\n -Button: pop0delete';
    av.anl.pop[0].left = [];
    av.anl.pop[0].right = [];
    av.anl.clearWorldData(0);
    av.anl.AnaChartFn();
    av.dnd.graphPop0.selectAll().deleteSelectedNodes();
  }
  document.getElementById('pop1delete').onclick = function () {
    av.debug.log += '\n -Button: pop1delete';
    av.anl.pop[1].left = [];
    av.anl.pop[1].right = [];
    av.anl.clearWorldData(1);
    av.anl.AnaChartFn();
    av.dnd.graphPop1.selectAll().deleteSelectedNodes();
  }
  document.getElementById('pop2delete').onclick = function () {
    av.debug.log += '\n -Button: pop2delete';
    av.anl.pop[2].left = [];
    av.anl.pop[2].right = [];
    av.anl.clearWorldData(2);
    av.anl.AnaChartFn();
    av.dnd.graphPop2.selectAll().deleteSelectedNodes();
  }
  dijit.byId('pop0color').on('Change', function () {
    Rav.anl.color[0] = av.color.dictColor[dijit.byId('pop0color').value];
    av.debug.log += '\n -Button: pop0color';
    av.anl.AnaChartFn();
  });
  dijit.byId('pop1color').on('Change', function () {
    av.debug.log += '\n -Button: pop1color';
    av.anl.color[1] = av.color.dictColor[dijit.byId('pop1color').value];
    av.anl.AnaChartFn();
  });
  dijit.byId('pop2color').on('Change', function () {
    av.debug.log += '\n -Button: pop2color';
    av.anl.color[2] = av.color.dictColor[dijit.byId('pop2color').value];
    av.anl.AnaChartFn();
  });

  //Set Y-axis title and choose the correct array to plot
  dijit.byId('yLeftSelect').on('Change', function () {
    av.debug.log += '\n -Button: yLeftSelect';
    av.anl.yLeftTitle = dijit.byId('yLeftSelect').value;
    //need to get correct array to plot from freezer
    av.anl.loadSelectedData(0, 'yLeftSelect', 'left')  //numbers are world landing spots
    av.anl.loadSelectedData(1, 'yLeftSelect', 'left')
    av.anl.loadSelectedData(2, 'yLeftSelect', 'left')
    av.anl.AnaChartFn();
  });

  dijit.byId('yRightSelect').on('Change', function () {
    av.debug.log += '\n -Button: yRightSelect';
    av.anl.yRightTitle = dijit.byId('yRightSelect').value;
    //need to get correct array to plot from freezer
    av.anl.loadSelectedData(0, 'yRightSelect', 'right');
    av.anl.loadSelectedData(1, 'yRightSelect', 'right');
    av.anl.loadSelectedData(2, 'yRightSelect', 'right');
    av.anl.AnaChartFn();
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

  av.grd.popChartFn();
  //av.grd.drawGridSetupFn(); //Draw initial background

  //Safari 9 will not allow saving workspaces or freezer items.
  if (av.brs.isSafari) {
    userMsgLabel.textContent = 'Safari 9 does not allow saving a workspace or freezer items. Please use Firefox or Chrome';
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
  //var hexColor = av.ui.invertHash(av.color.dictColor);
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