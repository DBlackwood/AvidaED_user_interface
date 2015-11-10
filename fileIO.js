//console.log("Start of FileIO.js");
//console.log("declaring mnOpenWorkSpace()");
function mnOpenWorkSpace() {
  console.log('test message');
  OpenWsDialog.show();
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
