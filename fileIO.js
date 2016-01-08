// folders will be:
// cwd = current working directory
// saved = where files are put to save to user workspace

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
//https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/
av.fio.readZipWS = function(zipFileName) {
  'use strict';
  av.fzr.clearFzrFn();  // clear freezer (globals.js)
  av.parents.clearParentsFn();  //globals.js
  //Clear each section of the freezer and active organism and ancestorBox
  av.dnd.fzConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.fzConfig.sync();   //should be done after insertion or deletion
  av.dnd.fzOrgan.selectAll().deleteSelectedNodes();
  av.dnd.fzOrgan.sync();
  av.dnd.fzWorld.selectAll().deleteSelectedNodes();
  av.dnd.fzWorld.sync();
  av.dnd.ancestorBox.selectAll().deleteSelectedNodes();
  av.dnd.ancestorBox.sync();
  av.dnd.activeOrgan.selectAll().deleteSelectedNodes();
  av.dnd.activeOrgan.sync();
  //Either need to clear the active config and active organism here or when the file is read.
  av.fio.zipName = zipFileName;
  var oReq = new XMLHttpRequest();
  oReq.open("GET", av.fio.zipName, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
    var arybuf = oReq.response;
    console.log("have ziptest.zip", arybuf);
    // do something to extract it
    av.fio.zipfile = new av.fio.JSZip();
    console.log("loading arybuf");
    av.fio.zipfile.load(arybuf, {base64: false});
    //console.log("arybuf loaded");
    console.log('before call procesfiles');
    av.fio.target = null;
    for (var zFileName in av.fio.zipfile.files) {
      //target will be assigned the beginning of the path name within the zip file.
      if (null == av.fio.target) {
        var leading = wsb('/', zFileName);
        if ('__MACOSX' != leading) av.fio.target = leading; //this gets the root name which we remove from path in the fzr file
      }
      av.fio.thisfile = av.fio.zipfile.files[zFileName];
      av.fio.fName = zFileName;
      processFiles(av);
    };
    //note setup form is updated when the files are read.
    console.log('after read loop: fzr', av.fzr);
    av.fio.fileReadingDone = true;
    //console.log('before DrawGridSetup')
    av.grd.drawGridSetupFn();
    av.fzr.cNum++;  //now the Num value refer to the next (new) item to be put in the freezer.
    av.fzr.gNum++;
    av.fzr.wNum++;
  };
  oReq.send();
}

av.fio.fzSaveCurrentWorkspaceFn = function () {
  if (0 === av.fio.userFname.length) av.fio.userFname = prompt('Choose a name for your Workspace', 'avidaWS.avidaedworkspace.zip');
  if (0 === av.fio.userFname.length) av.fio.userFname = 'avidaWS.avidaedworkspace.zip';
  var end = av.fio.userFname.substring(av.fio.userFname.length-4);
  if ('.zip' != end) av.fio.userFname = av.fio.userFname + '.zip';
  console.log('end', end, '; userFname', av.fio.userFname);
  var WSzip = new av.fio.JSZip();
  for (var fname in av.fzr.file) {
    WSzip.file(fname, av.fzr.file[fname]);
  }
  var content = WSzip.generate({type:"blob"});
  saveAs(content, av.fio.userFname);
  // Test works; zip is saved to user's Downloads directory
};

//http://www.html5rocks.com/en/tutorials/file/dndfiles/
av.fio.mnOpenDefaultWSfn = function() {
  'use strict';
  if (!av.fzr.saved) {
    var sure = confirm('Current workspace as been changed since the last save. Save workspace first?');
    if (sure) {
      av.fio.fzSaveCurrentWorkspaceFn();
    }
  }
  av.fio.readZipWS(av.fio.defaultFname);
  console.log('mnOpenDefaultWSfn else', av.fzr);
  //need to fix this so the existing data is saved before the default file is read. tiba do later
};

//console.log("tests for different browsers for download"); //wish I knew where the stuff below came from
//window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
//window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

// Dojo file uploads and downloads
// https://infrequently.org/2005/12/file-uploading-with-dojo/
// http://www.mikejuniper.com/fun-with-dojoioiframesend/

// Iframe file download
// http://encosia.com/ajax-file-downloads-and-iframes/

// JQuery
// http://jsfiddle.net/a856P/51/
// http://jsfiddle.net/cowboy/hHZa9/

// Pure JS
// http://jsfiddle.net/uselesscode/qm5ag/

// usefule Dexie.db websites
//https://github.com/dfahlander/Dexie.js/wiki/Best%20Practices
