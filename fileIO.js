

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
function readDefaultWS(dnd, fio, fzr) {
  "use strict";
  fio.zipName = fio.defaultFname;
  var oReq = new XMLHttpRequest();
//oReq.open("GET", "/ziptest.zip", true);
  oReq.open("GET", fio.zipName, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
    var arybuf = oReq.response;
    console.log("have ziptest.zip", arybuf);
    // do something to extract it
    fio.zipfile = new fio.JSZip();
    console.log("loading arybuf");
    fio.zipfile.load(arybuf, {base64: false});
    //console.log("arybuf loaded");
    console.log('before call procesfiles');
    fio.target = null;
    for (var zFileName in fio.zipfile.files) {
      //target will be assigned the beginning of the path name within the zip file.
      if (null == fio.target) {
        var leading = wsb('/', zFileName);
        if ('__MACOSX' != leading) fio.target = leading;
      }
      fio.thisfile = fio.zipfile.files[zFileName];
      fio.fName = zFileName;
      processFiles(dnd, fio, fzr);
    }
  }
  oReq.send();
}

function addFzItem(dndSection, fio, fzrSection, item, type) {
  "use strict";
  dndSection.insertNodes(false, [{data: item.name, type: [type]}]);
  dndSection.sync();
  var mapItems = Object.keys(dndSection.map);
  item.domId = mapItems[mapItems.length - 1];
  fzrSection.push(item);
  //create a right mouse-click context menu for the item just created.
  console.log('item', item);
  if (0<item.fileNum) {contextMenu(fzr, dndSection, item.domId);}
}

function add2freezer(dnd,fio, fzr) {
  "use strict";
  var type = fio.anID.substr(0, 1);
  var tmp = wsb('/', fio.anID);
  var num = tmp.substr(1, tmp.length-1);
  var name;
  if (null == fio.thisfile.asText()) { name = fio.anID; }
  else { name = fio.thisfile.asText(); }
  var item = {
    'name': name,
    'fileNum': num,
    '_id': fio.anID
  };
  if (debug.fio) console.log('type ', type, '; tmp', tmp, '; num', num);
  switch (type) {
    case 'c':
      addFzItem(dnd.fzConfig, fio, fzr.config, item, type);
      break;
    case 'g':
      var afileName = wsb('entryname.txt', fio.fName) + 'genome.seq';
      item.genome = fio.zipfile.files[afileName].asText();
      addFzItem(dnd.fzOrgan, fio, fzr.organism, item, type);
      break;
    case 'w':
      addFzItem(dnd.fzWorld, fio, fzr.world, item, type);
      break;
  }
}

function processFiles(dnd, fio, fzr){
  "use strict";
  fio.anID = wsa(fio.target+'/', fio.fName);
  var fileType = wsa('/', fio.anID);
  //console.log("  within zip: full, ", fio.fName, '; id ',anID, '; type ', fileType);
  switch (fileType) {
    case 'entryname.txt':
      add2freezer(dnd, fio, fzr);
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
      var ifile = {
        _id: fio.anID,
        text: fio.thisfile.asText()
      };
      fio.wsdb.get(fio.anID).then(function (doc) {
        ifile._rev = doc._rev;
        if (debug.pdb) console.log('get entryName doc already exists, ok update', doc);
        fio.wsdb.put(ifile).then(function (response) {//if (debug.fio) console.log('ok correct', response); // handle response to put
        }).catch(function (err) {console.log('put err', err);
        });
      }).catch(function (err) {
        fio.wsdb.put(ifile).then(function (response) {//if (debug.fio) console.log('ok correct', response); // handle response to put
        }).catch(function (err) {console.log('put err', err);
        });
      });
      break;
    default:
      //if (debug.fio) console.log('undefined file type in zip: full ', fio.fName, '; id ', fio.anID, '; type ', fileType);
      break;
  }
  if (debug.fio) console.log('file type in zip: fname ', fio.fName, '; id ', fio.anID, '; type ', fileType);
}

//console.log("Start of FileIO.js");
//console.log("declaring mnOpenWorkSpace()");
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
    var files = evt.target.files; // FileList object

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

//usage is clear:
//  _getAllFilesFromFolder(__dirname + "folder");





// var keywordString = " ford    tempo, with,,, sunroof,, ";

 //remove all commas; remove preceeding and trailing spaces; replace spaces with comma

// str1 = keywordString.replace(/,/g , '').replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/[\s,]+/g, ',');


//add a comma at t

//console.log("declaring flexsplit()");
var flexsplit;
flexsplit = function (instr) {
  var str1 = instr.replace(/,/g, '').replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/[\s,]+/g, ',');

  return str1;
};

//console.log("declaring cfglineparse()");
var cfglineparse;
cfglineparse = function(instr){
  var cfgary = flexsplit(instr).split(',');

  var rslt = {
    name : cfgary[0],
    value : cfgary[1]
  };
  return rslt;
};

//console.log("declaring avidacfgparse()");
var avidacfgparse;
avidacfgparse = function (filestr) {
  var rslt = {};
  var lines = filestr.split("\n");

  for (var ii = 0; ii < lines.length; ii++) {
    var lineobj = cfglineparse(lines[ii]);
    rslt[lineobj.name.toUpperCase()] = lineobj.value;
  } // for

  return rslt;
};

//console.log("declaring download()");
// http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  pom.setAttribute('download', filename);

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents');
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
      var e = document.createEvent('MouseEvents');
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

//console.log("end of FileIO.js");
