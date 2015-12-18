// folders will be:
// cwd = current working directory
// saved = where files are put to save to user workspace
function writeEmDxFile(db, path, contents) {
  'use strict';
  db.FILE_DATA.add( {
      timestamp: Date.now(),  //We may need to do more work with this property
      contents: utf8bytes_encode(contents),
      mode: 33206
    },
    path
  ).then(function () {
      console.log('Able to add file ', path);
  }).catch(function (err) {
    console.log('Unable to add file, path',path, '; error', err);
    throw error;
  })
}

function writeDxFile(db, path, contents) {
  'use strict';
  db.work.add( {
      name: path,
      timestamp: Date.now(),  //We may need to do more work with this property
      contents: contents,
      mode: 33206
    }
  ).then(function () {
      //console.log('Able to add file ' + path);
    }).catch(function () {
      console.log('Unable to add file ' + path);
      throw error;
    });
}
function addFzItem(dndSection, fzrSection, item, type) {
  'use strict';
  dndSection.insertNodes(false, [{data: item.name, type: [type]}]);
  dndSection.sync();
  var mapItems = Object.keys(dndSection.map);
  item.domId = mapItems[mapItems.length - 1];
  fzrSection.push(item);
  //create a right av.mouse-click context menu for the item just created.
  if (av.debug.fio) console.log('item', item);
  //if (0<item.fileNum) {contextMenu(av.fzr, dndSection, item.domId);}
}

function add2freezerFromFile(av) {
  "use strict";
  var type = av.fio.anID.substr(0, 1);
  var tmp = wsb('/', av.fio.anID);
  var num = tmp.substr(1, tmp.length-1);
  var name;
  if (null == av.fio.thisfile.asText()) { name = av.fio.anID; }
  else { name = wsb("\n", av.fio.thisfile.asText()); }
  var item = {
    'name': name,
    'fileNum': num,
    '_id': tmp
  };
  if (av.debug.fio) console.log('type ', type, '; tmp', tmp, '; num', num);
  switch (type) {
    case 'c':
      addFzItem(av.dnd.fzConfig, av.fzr.config, item, type);
      if (av.fzr.cNum < Number(item.fileNum)) {av.fzr.cNum = Number(item.fileNum); }
      break;
    case 'g':
      var afileName = wsb('entryname.txt', av.fio.fName) + 'genome.seq';
      item.genome = av.fio.zipfile.files[afileName].asText();
      addFzItem(av.dnd.fzOrgan, av.fzr.genome, item, type);
      if (av.fzr.gNum < Number(item.fileNum)) {av.fzr.gNum = Number(item.fileNum); }
      break;
    case 'w':
      addFzItem(av.dnd.fzWorld, av.fzr.world, item, type);
      if (av.fzr.wNum < Number(item.fileNum)) {av.fzr.wNum = Number(item.fileNum); }
      break;
  }
}

function processFiles(av){
  "use strict";
  av.fio.anID = wsa(av.fio.target+'/', av.fio.fName);
  var fileType = wsa('/', av.fio.anID);
  switch (fileType) {
    case 'entryname.txt':
      add2freezerFromFile(av);
    case 'ancestors':
    case 'ancestors_manual':
    case 'avida.cfg':
    case 'clade.ssg':
    case 'detail.spop':
    case 'environment.cfg':
    case 'events.cfg':
    case 'genome.seq':
    case 'instset.cfg':
    case 'tr0':
    case 'tr1':
    case 'tr2':
    case 'tr3':
    case 'update':
      if ('c0/avida.cfg'==av.fio.anID) {avidaCFG2form(av.fio.thisfile.asText()); }
      if ('c0/environment.cfg'==av.fio.anID) {environmentCFG2form(av.fio.thisfile.asText().trim()); }

      writeDxFile(av.fio.dxdb, av.fio.anID, av.fio.thisfile.asText().trim());
      /* no longer use PouchDB
       var ifile = {
       _id: av.fio.anID,
       text: av.fio.thisfile.asText().trim()
       };
      av.fio.wsdb.get(av.fio.anID).then(function (doc) {
        ifile._rev = doc._rev;
        if (av.debug.pdb) console.log('get entryName doc already exists, ok update', doc);
        av.fio.wsdb.put(ifile).then(function (response) {//if (av.debug.fio) console.log('ok correct', response); // handle response to put
        }).catch(function (err) {console.log('put err', err);
        });
      }).catch(function (err) {
        av.fio.wsdb.put(ifile).then(function (response) {//if (av.debug.fio) console.log('ok correct', response); // handle response to put
        }).catch(function (err) {console.log('put err', err);
        });
      });
      */
      break;
    default:
      //if (av.debug.fio) console.log('undefined file type in zip: full ', av.fio.fName, '; id ', av.fio.anID, '; type ', fileType);
      break;
  }
  //if (av.debug.fio) console.log('file type in zip: fname ', av.fio.fName, '; id ', av.fio.anID, '; type ', fileType);
}


//---------------------------------------- update config data from pouchDB data ----------------------------------------
function updateSetup(av) {
  'use strict';
  av.fio.wsdb.get(av.fzr.actConfig._id + '/avida.cfg').then(function (doc) {
    avidaCFG2form(doc.text);
  }).catch(function (err) {
    console.log('error getting active avida.cfg data', err);
    throw error;
  });
  av.fio.wsdb.get(av.fzr.actConfig._id + '/environment.cfg').then(function (doc) {
    environmentCFG2form(doc.text);
  }).catch(function (err) {
    console.log('error getting active environment.cfg data', err);
    throw error;
  });
}

//----------------------- section to put data from environment.cfg into setup form of population page ------------------

var environmentCFGlineParse = function(instr){
  'use strict';
  var num = 0;
  var flag = true;
  var cfgary = flexsplit(instr).split(',');
  if (0 < cfgary[3].length) {num = wsb(':',wsa('=',cfgary[3]));}
  if (0 == num) {flag = false;} //use == in this case as they are of different type
  //console.log('flag', flag, '; num', num, '; cfgary', cfgary[3], '; instr', instr);
  var rslt = {
    name : cfgary[1],
    value : flag
  };
  return rslt;
};

// makes a dictionary out of a environment.cfg file
var environmentCFGparse = function (filestr) {
  'use strict';
  var rslt = {};
  var lineobj;
  var lines = filestr.split("\n");
  for (var ii = 0; ii < lines.length; ii++) {
    if (3 < lines[ii].length) {
      lineobj = environmentCFGlineParse(lines[ii]);
      rslt[lineobj.name.toUpperCase()] = lineobj.value;
    }
  } // for
  return rslt;
};

// puts data from the environment.cfg into the setup form for the population page
function environmentCFG2form(fileStr) {
  'use strict';
  var dict = environmentCFGparse(fileStr);
  dijit.byId("notose").set('checked', dict.NOT);
  dijit.byId("nanose").set('checked', dict.NAND);
  dijit.byId("andose").set('checked', dict.AND);
  dijit.byId("ornose").set('checked', dict.ORN);
  dijit.byId("orose").set('checked', dict.OR);
  dijit.byId("andnose").set('checked', dict.ANDN);
  dijit.byId("norose").set('checked', dict.NOR);
  dijit.byId("xorose").set('checked', dict.XOR);
  dijit.byId("equose").set('checked', dict.EQU);
}
//----------------------------- section to put data from avida.cfg into setup form of population page ------------------
//makes a dictionary entry out of line if the key and value are the first two items.
var avidaCFGlineParse = function(instr){
  'use strict';
  var cfgary = flexsplit(instr).split(',');  //replaces white space with a comma, then splits on comma
  var rslt = {
    name : cfgary[0],
    value : cfgary[1]
  };
  return rslt;
};

// makes a dictionary out of a avida.cfg file
var avidaCFGparse = function (filestr) {
  'use strict';
  var rslt = {};
  var lines = filestr.split("\n");
  for (var ii = 0; ii < lines.length; ii++) {
    var lineobj = avidaCFGlineParse(lines[ii]);
    rslt[lineobj.name.toUpperCase()] = lineobj.value;
  } // for
  return rslt;
};

// puts data from the avida.cfg into the setup form for the population page
function avidaCFG2form(fileStr){
  'use strict';
  var dict = avidaCFGparse(fileStr);
  dijit.byId("sizeCols").set('value', dict.WORLD_X);
  dijit.byId("sizeRows").set('value', dict.WORLD_Y);
  document.getElementById("muteInput").value = dict.COPY_MUT_PROB*100;
  //var event = new Event('change');
  var event = new window.CustomEvent('change');
  document.getElementById("muteInput").dispatchEvent(event);
  if (0==dict.BIRTH_METHOD) {
    dijit.byId("childParentRadio").set('checked', true);
    dijit.byId("childRandomRadio").set('checked', false);
  }
  else {
    dijit.byId("childParentRadio").set('checked', false);
    dijit.byId("childRandomRadio").set('checked', true);
  }

  if (-1 == dict.RANDOM_SEED) {
    dijit.byId("experimentRadio").set('checked', true);
    dijit.byId("demoRadio").set('checked', false);
  }
  else {
    dijit.byId("experimentRadio").set('checked', false);
    dijit.byId("demoRadio").set('checked', true);
  }
}

//------------------------------------------------- rest may not be in use ---------------------------------------------
//http://www.html5rocks.com/en/tutorials/file/dndfiles/
function mnOpenWorkSpace() {
  console.log('test message');
  openWsDialog.show();
  // Check for the various File API support.  http://www.html5rocks.com/en/tutorials/file/dndfiles/
  if (window.File && window.FileReader && window.FileList && window.Blob) { // Great success! All the File APIs are supported.
    console.log('file stuff should work')
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }
  console.log("declaring handleFileSelect()");
  function handleFileSelect(evt) {
    var theFile = evt.target.files[0]; // FileList object
    var files = evt.target.files; // FileList object
    console.log('file', theFile);
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
        f.size, ' bytes, last modified: ',
        f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
        '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
  }

  document.getElementById('files').addEventListener('change', handleFileSelect, false);
}

function mnOpenDefault(){

}

/*
 http://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript
*/


//console.log("declaring _getAllFilesFromFolder()");
var _getAllFilesFromFolder = function(dir) {

  var filesystem = require("fs");
  var results = [];

  filesystem.readdirSync(dir).forEach(function(file) {

    file = dir+'/'+file;
    var stat = filesystem.statSync(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(_getAllFilesFromFolder(file))
    } else results.push(file);

  });
  return results;
};

//console.log("declaring download()");
// http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    var event = document.createEvent('av.mouseEvents');
    event.initEvent('click', true, true);
    pom.dispatchEvent(event);
  }
  else {
    pom.click();
  }
}

//console.log("declaring window.downloadFile()");
// http://pixelscommander.com/en/javascript/javascript-file-download-ignore-content-type/
window.downloadFile = function(sUrl) {

  //If in Chrome or Safari - download via virtual link click
  if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
    //Creating new link node.
    var link = document.createElement('a');
    link.href = sUrl;

    if (link.download !== undefined){
      //Set HTML5 download attribute. This will prevent file from opening if supported.
      var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
      link.download = fileName;
    }

    //Dispatching click event.
    if (document.createEvent) {
      var e = document.createEvent('av.mouseEvents');
      e.initEvent('click' ,true ,true);
      link.dispatchEvent(e);
      return true;
    }
  }

  // Force file download (whether supported by server).
  var query = '?download';

  window.open(sUrl + query);
}

//console.log("tests for different browsers for download");
window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;


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
