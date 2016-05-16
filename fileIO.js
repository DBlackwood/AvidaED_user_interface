// folders will be:
// cwd = current working directory
// saved = where files are put to save to user workspace

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
//https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/
av.fio.readZipWS = function(zipFileName, loadConfigFlag) {
  'use strict';
  if (loadConfigFlag) av.fzr.clearFzrFn();
  else av.fzr.clearMainFzrFn();  // clear freezer (globals.js)
  //Clear each section of the freezer and active organism and ancestorBox
  av.dnd.fzConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.fzConfig.sync();   //should be done after insertion or deletion
  av.dnd.fzOrgan.selectAll().deleteSelectedNodes();
  av.dnd.fzOrgan.sync();
  av.dnd.fzWorld.selectAll().deleteSelectedNodes();
  av.dnd.fzWorld.sync();
  //Change loading a workspace will change the freezer, but not parents or configuration
/*  av.parents.clearParentsFn();  //globals.js
  av.dnd.ancestorBox.selectAll().deleteSelectedNodes();
  av.dnd.ancestorBox.sync();
  av.dnd.activeOrgan.selectAll().deleteSelectedNodes();
  av.dnd.activeOrgan.sync();
*/
  var oReq = new XMLHttpRequest();
  oReq.open("GET", zipFileName, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
    var arybuf = oReq.response;
    //console.log("have ziptest.zip", arybuf);
    // do something to extract it
    av.fio.zipfile = new av.fio.JSZip();
    //console.log("loading arybuf");
    av.fio.zipfile.load(arybuf, {base64: false});
    //console.log("arybuf loaded");
    //console.log('before call procesfiles');
    av.fio.zipPathRoot = null;
    for (var nameOfFileContainedInZipFile in av.fio.zipfile.files) {
      /*Mac generated workspaces have the string '.avidaedworkspace/' before the folders for each freezerItem.
       This prefix needs to be removed if present. av.fio.zipPathRoot will be assigned the beginning of the path name within the zip file.
       */
      //console.log('nameOfFileContainedInZipFile=', nameOfFileContainedInZipFile, '; fileContainedInZipFile.asText()=', fileContainedInZipFile.asText());
      if (null === av.fio.zipPathRoot) {
        if (0 < nameOfFileContainedInZipFile.indexOf('avidaedworkspace') && 0 > nameOfFileContainedInZipFile.indexOf('MACOSX')) {
          av.fio.zipPathRoot = wsb('/', nameOfFileContainedInZipFile);
        }
        else if (0 > nameOfFileContainedInZipFile.indexOf('MACOSX')) {av.fio.zipPathRoot='';}
        //console.log('Path=', av.fio.zipPathRoot, '; __a=', nameOfFileContainedInZipFile.indexOf('.avidaedworkspace/'),
        //  '; __b=',nameOfFileContainedInZipFile.indexOf('MACOSX'));
      }
      av.fio.thisfile = av.fio.zipfile.files[nameOfFileContainedInZipFile];
      av.fio.fName = nameOfFileContainedInZipFile;
      if (10 < av.fio.zipPathRoot.length) av.fio.anID = wsa(av.fio.zipPathRoot+'/', av.fio.fName);
      else av.fio.anID = av.fio.fName;
      //console.log('nameOfFileContainedInZipFile=', nameOfFileContainedInZipFile,';___fName=',av.fio.fName, '; ___zipPathRoot=', av.fio.zipPathRoot, '; ____anID=',av.fio.anID);
      //console.log('fName=',av.fio.fName, '; ____anID=',av.fio.anID);
      if (3 < av.fio.fName.length) av.fio.processFiles(loadConfigFlag);  //do not load configfile
    }
    //note setup form is updated when the files are read.
    //console.log('after read loop: fzr', av.fzr);
    av.fio.fileReadingDone = true;
    //console.log('before DrawGridSetup')
    av.grd.drawGridSetupFn();
    av.fzr.cNum++;  //now the Num value refer to the next (new) item to be put in the freezer.
    av.fzr.gNum++;
    av.fzr.wNum++;
  };
  oReq.send();
  av.fzr.saveUpdateState('default');
};

  //https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/
  av.fio.userPickZipRead = function () {
    "use strict";
    av.fzr.clearMainFzrFn();  // clear freezer (globals.js)
    //Clear each section of the freezer and active organism and ancestorBox
    av.dnd.fzConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
    av.dnd.fzConfig.sync();   //should be done after insertion or deletion
    av.dnd.fzOrgan.selectAll().deleteSelectedNodes();
    av.dnd.fzOrgan.sync();
    av.dnd.fzWorld.selectAll().deleteSelectedNodes();
    av.dnd.fzWorld.sync();

    var inputWSfile = document.getElementById('putWS');
    var zipFileToLoad = inputWSfile.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent)
    {
      var zipFileLoaded = new av.fio.JSZip(fileLoadedEvent.target.result);
      //var ulFilesContained = document.getElementById("ulFilesContained");

      av.fio.zipPathRoot = null;
      for (var nameOfFileContainedInZipFile in zipFileLoaded.files)
      {
        var fileContainedInZipFile = zipFileLoaded.files[nameOfFileContainedInZipFile];
        /*Mac generated workspaces have the string '.avidaedworkspace/' before the folders for each freezerItem.
         This prefix needs to be removed if present. av.fio.zipPathRoot will be assigned the beginning of the path name within the zip file.
         */
        //console.log('nameOfFileContainedInZipFile=', nameOfFileContainedInZipFile, '; fileContainedInZipFile.asText()=', fileContainedInZipFile.asText());
        if (null === av.fio.zipPathRoot) {
          if (0 < nameOfFileContainedInZipFile.indexOf('avidaedworkspace') && 0 > nameOfFileContainedInZipFile.indexOf('MACOSX')) {
            av.fio.zipPathRoot = wsb('/', nameOfFileContainedInZipFile);
          }
          else if (0 > nameOfFileContainedInZipFile.indexOf('MACOSX')) {av.fio.zipPathRoot='';}
        }
        av.fio.thisfile = zipFileLoaded.files[nameOfFileContainedInZipFile];
        av.fio.fName = nameOfFileContainedInZipFile;
        if (10 < av.fio.zipPathRoot.length) av.fio.anID = wsa(av.fio.zipPathRoot+'/', av.fio.fName);
        else av.fio.anID = av.fio.fName;
        //console.log('nameOfFileContainedInZipFile=', nameOfFileContainedInZipFile,';___fName=',av.fio.fName, '; ___zipPathRoot=', av.fio.zipPathRoot, '; ____anID=',av.fio.anID);
        //console.log('fName=',av.fio.fName, '; ____anID=',av.fio.anID);
        if (3 < av.fio.fName.length) av.fio.processFiles(false);  //do not load configfile
      }
      if ('populationBlock' === av.ui.page) av.grd.drawGridSetupFn();
      av.fzr.cNum++;  //now the Num value refer to the next (new) item to be put in the freezer.
      av.fzr.gNum++;
      av.fzr.wNum++;
      av.fzr.saveUpdateState('yes');
    };
    fileReader.readAsArrayBuffer(zipFileToLoad);  //not sure what this does; was in the example.
  }

  //https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/
  av.fio.importZipRead = function () {
    "use strict";
    var inputWSfile = document.getElementById('import');
    var zipFileToLoad = inputWSfile.files[0];
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent)
    {
      var zipFileLoaded = new av.fio.JSZip(fileLoadedEvent.target.result);

      av.fio.zipPathRoot = null;
      for (var nameOfFileContainedInZipFile in zipFileLoaded.files)
      {
        var fileContainedInZipFile = zipFileLoaded.files[nameOfFileContainedInZipFile];
        //Mac generated workspaces have the string '.avidaedworkspace/' before the folders for each freezerItem.
        //This prefix needs to be removed if present. av.fio.zipPathRoot will be assigned the beginning of the path name within the zip file.

        //console.log('nameOfFileContainedInZipFile=', nameOfFileContainedInZipFile, '; fileContainedInZipFile.asText()=', fileContainedInZipFile.asText());
        //console.log('nameOfFileContainedInZipFile=', nameOfFileContainedInZipFile);
        if (null === av.fio.zipPathRoot) {
          if (0 < nameOfFileContainedInZipFile.indexOf('avidaedfreezeritem') && 0 > nameOfFileContainedInZipFile.indexOf('MACOSX')) {
            av.fio.zipPathRoot = wsb('/', nameOfFileContainedInZipFile);
          }
          else if (0 > nameOfFileContainedInZipFile.indexOf('MACOSX')) {av.fio.zipPathRoot='';}
        }
        av.fio.thisfile = zipFileLoaded.files[nameOfFileContainedInZipFile];
        av.fio.fName = nameOfFileContainedInZipFile;

        if (2 < av.fio.zipPathRoot.length) av.fio.anID = wsa(av.fio.zipPathRoot+'/', av.fio.fName);
        else av.fio.anID = av.fio.fName;
        //console.log('nameOfFileContainedInZipFile=', nameOfFileContainedInZipFile,';___fName=',av.fio.fName, '; ___zipPathRoot=', av.fio.zipPathRoot, '; ____anID=',av.fio.anID);
        //console.log('fName=',av.fio.fName, '; ____anID=',av.fio.anID);
        //console.log('-------------------------------------------------------------------------------------------------');
        if (2 < av.fio.fName.length) av.fio.processItemFiles();  //do not load configfile
      }
      av.fio.fixFname();
      if ('populationBlock' === av.ui.page) av.grd.drawGridSetupFn();
    };
    fileReader.readAsArrayBuffer(zipFileToLoad);  //not sure what this does; was in the example.
  }

av.fio.fixFname = function() {
  'use strict';
  var domid, name, type, dir;
  if (null === av.fzr.item['entryname.txt']) { name = wsb('.', av.fio.zipPathRoot); }
  else { name = av.fzr.item['entryname.txt'].trim(); }

  if (av.fzr.item['entrytype.txt']) {
    type = av.fzr.item['entrytype.txt'].trim();
    switch (type) {
      case 'c':
        domid = av.fio.addFzItem(av.dnd.fzConfig, name, type, av.fzr.cNum);
        dir = 'c' + av.fzr.cNum;
        av.fzr.cNum++;
        //console.log('c: num', num, '; name', name, 'flag', loadConfigFlag);
        break;
      case 'g':
        domid = av.fio.addFzItem(av.dnd.fzOrgan, name, type, av.fzr.gNum);
        dir = 'g' + av.fzr.gNum;
        av.fzr.gNum++;
        break;
      case 'w':
        domid = av.fio.addFzItem(av.dnd.fzWorld, name, type, av.fzr.wNum);
        dir = 'w' + av.fzr.wNum;
        av.fzr.wNum++;
        break;
    }
    for (var fname in av.fzr.item) {
      console.log('av.fzr.item', fname);
      if ('entrytype.txt' !== fname) {
        av.fzr.file[dir+'/'+fname] = av.fzr.item[fname];
        //console.log('dir', dir+'/'+fname, '; contents=', av.fzr.file[dir+'/'+fname]);
      }
      av.fwt.deleteFzrItem(fname);
    }
    av.fzr.domid[dir] = domid;
    av.fzr.dir[domid] = dir;
    console.log('av.fzr', av.fzr);
  }
}

av.fio.fzSaveWorkspaceAsFn = function () {
  if (0 === av.fio.userFname.length) av.fio.userFname = prompt('Choose a name for your Workspace', av.fio.defaultUserFname);
  if (0 === av.fio.userFname.length) av.fio.userFname = av.fio.defaultUserFname;
  var end = av.fio.userFname.substring(av.fio.userFname.length-4);
  if ('.zip' != end) av.fio.userFname = av.fio.userFname + '.zip';
  console.log('end', end, '; userFname', av.fio.userFname);

  var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
      var json = JSON.stringify(data),
        blob = new Blob([json], {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    };
  }());

  var data = { x: 42, s: "hello, world", d: new Date() },
    fileName = "DianeFile.json";  //av.fio.userFname

  saveData(data, fileName);

  av.fzr.saveUpdateState('maybe');
}

av.fio.fzSaveCsvfn = function () {
  if (0 === av.fio.csvFileName.length) av.fio.csvFileName = prompt('Choose a name for your csv file', av.fzr.actConfig.name + '@' + av.grd.popStatsMsg.update);
  if (0 === av.fio.csvFileName.length) av.fio.csvFileName = 'avidaDataRecorder.csv';
  var end = av.fio.csvFileName.substring(av.fio.csvFileName.length - 4);
  if ('.csv' != end) av.fio.userFname = av.fio.csvFileName + '.csv';

  //window.open('data:attachment/csv;charset=utf-8,' + encodeURI(av.debug.log)); //also works, but creates odd file names.

  var a = document.createElement('a');
  a.href     = 'data:attachment/csv;charset=utf-8,' + encodeURI(av.fwt.csvStrg);
  a.target   = '_blank';
  a.download = av.fio.csvFileName;
  document.body.appendChild(a);
  if ('Safari 3+' === av.brs.name) alert("The name of the file will be 'unknown' in Safari. Please change the name to end in .csv. Safari will also open a blank tab. Please close the tab when you are done saving and resume work in Avida-ED");
  a.click();
  setTimeout(function(){
    document.body.removeChild(a);   //does not remove blank tab
    window.URL.revokeObjectURL(a.href);
  }, 100);
}

av.fio.fzSaveCurrentWorkspaceFn = function () {
  if (0 === av.fio.userFname.length) av.fio.userFname = prompt('Choose a name for your Workspace', av.fio.defaultUserFname);
  if (0 === av.fio.userFname.length) av.fio.userFname = av.fio.defaultUserFname;
  var end = av.fio.userFname.substring(av.fio.userFname.length-4);
  if ('.zip' != end) av.fio.userFname = av.fio.userFname + '.zip';
  //console.log('end', end, '; userFname', av.fio.userFname);
  var WSzip = new av.fio.JSZip();
  //console.log('number of files', av.utl.objectLength(av.fzr.file) );
  var numFiles = 0;
  for (var fname in av.fzr.file) {
    WSzip.file('av.avidaedworkspace/'+fname, av.fzr.file[fname]);
    numFiles++;
  }
  var content = WSzip.generate({type:"blob"});
  var fsaver = saveAs(content, av.fio.userFname);
  av.fzr.saveUpdateState('maybe');
};

//    wsSavedMsg.textcontent = 'Workspace: default  ';
av.fzr.saveUpdateState = function (state) {
  "use strict";
  av.fzr.saveState = state;
  if ('yes' === av.fzr.saveState) {
    wsSavedMsg.textContent = 'Workspace: is saved ';
    document.getElementById("wsSavedMsg").style.color = 'green';
  }
  else if ('maybe' === av.fzr.saveState) {
    wsSavedMsg.textContent = 'Workspace: maybe saved';
    document.getElementById("wsSavedMsg").style.color = 'orangered';
  }
  else if ('no' === av.fzr.saveState) {
    wsSavedMsg.textContent = 'Workspace: not saved';
    document.getElementById("wsSavedMsg").style.color = 'red';
  }
  else if ('default' === av.fzr.saveState) {
    wsSavedMsg.textContent = 'Workspace: default  ';
    document.getElementById("wsSavedMsg").style.color = 'blue';
  }
  else {
    wsSavedMsg.textContent = 'Workspace: confused ';
    document.getElementById("wsSavedMsg").style.color = 'deeppink';
  }
}


/* PouchDB websites
 http://pouchdb.com/api.html#database_information
 https://github.com/webinista/PouchNotes
 http://pouchdb.com/guides/databases.html
 */

/* web sites on Promises
 first one does a good job of explaining.
 http://www.html5rocks.com/en/tutorials/es6/promises/
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
 http://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html
 */

/* JSzip Websites
 http://stuk.github.io/jszip/documentation/api_jszip/load.html
 http://stuk.github.io/jszip/documentation/limitations.html
 https://thiscouldbebetter.wordpress.com/2013/08/06/reading-zip-files-in-javascript-using-jszip/

 binary data
 https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
 */

/* Writing files
 http://jsfiddle.net/uselesscode/qm5ag/
 http://jsfiddle.net/cowboy/hHZa9/
 http://jsfiddle.net/uselesscode/qm5ag/          // Pure JS
 FileSaver cannot tell when a file is done saving
 https://github.com/eligrey/FileSaver.js/     //for browsers that don't support SaveAs; does not know when done saving
    http://stackoverflow.com/questions/19521894/close-window-after-file-save-in-filesaver-js

 study these to see try to figure out if a file was actually saved
 http://stackoverflow.com/questions/13405129/javascript-create-and-save-file
 http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-direntry
 */

/* Reading files
 API = https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 http://www.html5rocks.com/en/tutorials/file/dndfiles/
 http://jsfiddle.net/ebSS2/235/
 http://stackoverflow.com/questions/3582671/how-to-open-a-local-disk-file-with-javascript
 http://stackoverflow.com/questions/6463439/how-to-open-a-file-browse-dialog-using-javascript
 http://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript
 */

/* Name Spaces and single page apps
 http://singlepageappbook.com/index.html
 http://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript
 http://stackoverflow.com/questions/881515/how-do-i-declare-a-namespace-in-javascript#answer-3588712
 https://www.kenneth-truyers.net/2013/04/27/javascript-namespaces-and-modules/
 https://addyosmani.com/blog/essential-js-namespacing/
 */

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

// usefule Dexie.db websites
//https://github.com/dfahlander/Dexie.js/wiki/Best%20Practices

