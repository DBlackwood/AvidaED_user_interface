//Read file data

// folders will be:
// cwd = current working directory
// saved = where files are put to save to user workspace

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
    });
}

av.fio.addFzItem = function(dndSection, name, type, fileNum) {
  'use strict';
  dndSection.insertNodes(false, [{data: name, type: [type]}]);
  dndSection.sync();
  var mapItems = Object.keys(dndSection.map);
  var domid  =  mapItems[mapItems.length - 1];

  //create a right av.mouse-click context menu for the item just created.
  //console.log('fileNum', fileNum, '; name', name, '; Section', dndSection.node.id);
  if (0 < fileNum) { av.dnd.contextMenu(dndSection, domid); }
  //av.dnd.contextMenu(dndSection, domid);
  return domid;
}

//need to make sure freezer loaded first so not currently in use. Delete later if not used tiba
av.fio.loadDefaultConfig = function() {
  'use strict';
  av.fzr.actConfig.name = av.fzr.file['c0/entryname.txt'];
  console.log()
  av.fzr.actConfig.type = 'c';
  av.dnd.activeConfig.selectAll().deleteSelectedNodes();
  av.dnd.activeConfig.insertNodes(false, [{data: av.fzr.actConfig.name, type: [av.fzr.actConfig.type]}]);
  av.dnd.activeConfig.sync();
  var mapItems = Object.keys(av.dnd.activeConfig.map);
  av.fzr.actConfig.actDomid = mapItems[mapItems.length - 1];  //domid from active config. Not sure if needed.
  av.fzr.actConfig.fzDomid = av.fzr.domid['c0'];
  console.log('avida.cfg', av.fzr.file['c0/avida.cfg'])
  avidaCFG2form(av.fzr.file['c0/avida.cfg']);
  environmentCFG2form(av.fzr.file['c0/environment.cfg']);
}

av.fio.setActiveConfig = function(dndSection, name, type){
  av.dnd.activeConfig.selectAll().deleteSelectedNodes();
  av.dnd.activeConfig.insertNodes(false, [{data: name, type: [type]}]);
  av.dnd.activeConfig.sync();
  var mapItems = Object.keys(dndSection.map);
  av.fzr.actConfig.fzDomid = mapItems[mapItems.length - 1];  //domid from active config. Not sure if needed.
  av.fzr.actConfig.name = name;
  av.fzr.actConfig.type = type;
  return av.fzr.actConfig.domId;
}

function add2freezerFromFile(loadConfigFlag) {
  "use strict";
  var type = av.fio.anID.substr(0, 1);
  //console.log('av.fio.anID', av.fio.anID);
  var dir = wsb('/', av.fio.anID);
  var num = dir.substr(1, dir.length-1);
  var name, domid;
  //console.log('av.fio.thisfile.asText()', av.fio.thisfile.asText());
  //console.log('av.fio.thisfile', av.fio.thisfile);
  if (null == av.fio.thisfile.asText()) { name = av.fio.anID; }
  else { name = wsb("\n", av.fio.thisfile.asText()); }

  //if (av.debug.fio) console.log('type ', type, '; dir', dir, '; num', num);
  switch (type) {
    case 'c':
      domid = av.fio.addFzItem(av.dnd.fzConfig, name, type, num);
      if (av.fzr.cNum < Number(num)) {av.fzr.cNum = Number(num); }
      //console.log('c: num', num, '; name', name, 'flag', loadConfigFlag);
      if (0 == num && loadConfigFlag) {var ConfigActiveDomID = av.fio.setActiveConfig(av.dnd.activeConfig, name, type);}
      break;
    case 'g':
      domid = av.fio.addFzItem(av.dnd.fzOrgan, name, type, num);
      if (av.fzr.gNum < Number(num)) {av.fzr.gNum = Number(num); }
      break;
    case 'w':
      domid = av.fio.addFzItem(av.dnd.fzWorld, name, type, num);
      if (av.fzr.wNum < Number(num)) {av.fzr.wNum = Number(num); }
      break;
  }
  av.fzr.file[av.fio.anID] = name;
  av.fzr.domid[dir] = domid;
  av.fzr.dir[domid] = dir;
}

av.fio.processFiles = function (loadConfigFlag){
  "use strict";
  var fileType = wsa('/', av.fio.anID);
  switch (fileType) {
    case 'entryname.txt':
      add2freezerFromFile(loadConfigFlag);
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
      if (loadConfigFlag) {
        if ('c0/avida.cfg' == av.fio.anID) {avidaCFG2form(av.fio.thisfile.asText());}
        if ('c0/environment.cfg' == av.fio.anID) {environmentCFG2form(av.fio.thisfile.asText().trim());}
      }
      //writeDxFile(av.fio.dxdb, av.fio.anID, av.fio.thisfile.asText().trim());
      av.fzr.file[av.fio.anID] = av.fio.thisfile.asText().trim();
      break;
    default:
      //if (av.debug.fio) console.log('undefined file type in zip: full ', av.fio.fName, '; id ', av.fio.anID, '; type ', fileType);
      break;
  }
  //if (av.debug.fio) console.log('file type in zip: fname ', av.fio.fName, '; id ', av.fio.anID, '; type ', fileType);
  //console.log('file type in zip: fname ', av.fio.fName, '; id ', av.fio.anID, '; type ', fileType);
}


//---------------------------------- update config data from file data stored in freezer -------------------------------
function updateSetup(av) {
  'use strict';

  var dir = av.fzr.actConfig.dir;
  var path = dir + '/avida.cfg';
  var doctext = av.fzr.file[path];
  //if (av.debug.fio) console.log('fzr.file', av.fzr.file);
  //if (av.debug.fio) console.log('doctxt', av.fzr.file['c0/avida.cfg'])
  //if (av.debug.fio) console.log('updateSetup = path', path, '; doc', doctext);
    avidaCFG2form(doctext);
  doctext = av.fzr.file[dir + '/environment.cfg'];
  //if (av.debug.fio) console.log('updateSetup = dir', dir, '; doc', doctext);
  environmentCFG2form(doctext);
}

//----------------------- section to put data from environment.cfg into setup form of population page ------------------

var environmentCFGlineParse = function(instr){
  'use strict';
  var num = 0;
  var flag = true;
  var cfgary = flexsplit(instr).split(',');
  if (0 < cfgary[3].length) {num = wsb(':',wsa('=',cfgary[3]));}
  if (0 == num) {flag = false;} //use == in this case as they are of different type
  //if (av.debug.fio) console.log('flag', flag, '; num', num, '; cfgary', cfgary[3], '; instr', instr);
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

//----------------------- section to put data from ancestors file into ancestorBox and placeparents auto ---------------

// makes a dictionary out of a environment.cfg file
av.fio.autoAncestorParse = function (filestr) {
  'use strict';
  var rslt = {};
  var lineobj, gen, name;
  var lines = filestr.split("\n");
  for (var ii = 0; ii < lines.length; ii++) {
    if (1 < lines[ii].length) {
      if (ii % 2 < 1) {//even
        name = lines[ii];  //tiba need to get rid of whitespace in string
      }
      else { //odd
        rslt[name] = lines[ii]; //content will be genome line; leave white space alone
      }
    }
  } // for
  return rslt;
};

// puts data from the ancestor into parents file using autoplace
av.fio.autoAncestorLoad = function(fileStr) {
  'use strict';
  console.log('in av.autoAncestorLoad: fileStr', fileStr);
  var dict = av.fio.autoAncestorParse(fileStr);
  //Now put in ancestors and place parents
  for (var name in dict) {
    av.dnd.ancestorBox.insertNodes(false, [{data: name, type: ['g']}]);
    av.dnd.ancestorBox.sync();
    av.parents.genome.push(dict[name]);
    var nn = av.parents.name.length;
    av.parents.name.push(name);
    av.parents.howPlaced.push('auto');
    var domIds = Object.keys(av.dnd.ancestorBox.map);
    if (av.debug.fio) console.log('autoPlaceParent: domIds', domIds, '; length', domIds.length);
    av.parents.domid.push(domIds[domIds.length-1]); //domid in ancestorBox used to remove if square in grid moved to trashcan
    //Find color of ancestor
    if (0 < av.parents.Colors.length) { av.parents.color.push(av.parents.Colors.pop());}
    else { av.parents.color.push(av.color.defaultParentColor); }
    av.parents.autoNdx.push(nn);
    av.parents.placeAncestors();
    if (av.debug.fio) console.log('av.parents:  name', av.parents.name[nn], av.parents.domid[nn], av.parents.genome[nn]);
  }
};

//---------------- section to put data from ancestors_manual file into ancestorBox and placeparents hand ---------------

// makes a dictionary out of a environment.cfg file
av.fio.handAncestorParse = function (filestr) {
  'use strict';
  var rslt = {};
  rslt.gen = {};
  rslt.col = {};
  rslt.row = {};
  var lineobj, gen, name, xx, yy;
  var pair = [];
  var lines = filestr.split("\n");
  for (var ii = 0; ii < lines.length; ii++) {
    if (1 < lines[ii].length) {
      if (0 === ii % 3) {// divide by 3 evenly => first line
        name = lines[ii];  //tiba need to get rid of whitespace in string
      }
      else if (1 === ii % 3){ //second line
        rslt.gen[name] = lines[ii]; //content will be genome line; leave white space alone
      }
      else {  //third line
        pair = lines[ii].split(',');
        rslt.col[name] = Number(pair[0]);
        rslt.row[name] = Number(pair[1]);
      }
    }
  } // for
  return rslt;
};

// puts data from the ancestor into parents file by hand
av.fio.handAncestorLoad = function(fileStr) {
  'use strict';
  if (av.debug.fio) console.log('in av.fio.handAncestorLoad: fileStr', fileStr);
  var dict = av.fio.handAncestorParse(fileStr);
  if (av.debug.fio) console.log('in av.fio.handAncestorLoad: dict', dict);
  //Now put in ancestors and place parents
  for (var name in dict.gen) {
    av.dnd.ancestorBox.insertNodes(false, [{data: name, type: ['g']}]);
    av.dnd.ancestorBox.sync();
    //av.parents.genome.push(dict.gen[name]);
    var nn = av.parents.name.length;
    av.parents.name.push(name);
    var domIds = Object.keys(av.dnd.ancestorBox.map);
    if (av.debug.fio) console.log('handAncestorLoad: domIds', domIds, '; length', domIds.length);
    av.parents.domid.push(domIds[domIds.length-1]); //domid in ancestorBox used to remove if square in grid moved to trashcan
    //Find color of ancestor
    if (0 < av.parents.Colors.length) { av.parents.color.push(av.parents.Colors.pop());}
    else { av.parents.color.push(av.color.defaultParentColor); }
    av.parents.handNdx.push(nn);
    av.parents.howPlaced.push('hand');
    av.parents.genome[nn] = dict.gen[name];
    av.parents.col[nn] = dict.col[name];
    av.parents.row[nn] = dict.row[name];
    av.parents.AvidaNdx[nn] = av.parents.col[nn] + Number(av.parents.row[nn]) * Number(dijit.byId("sizeCols").get('value'));
    //parents.AvidaNdx[parents.autoNdx[ii]] = parents.col[parents.autoNdx[ii]] + cols * parents.row[parents.autoNdx[ii]];
    if (av.debug.fio) console.log('av.parents:  name', av.parents.name[nn], '; domid', av.parents.domid[nn], '; gen', av.parents.genome[nn]);
  }
  if (av.debug.fio) console.log('parents', av.parents);
};

//----------------------- section to put data from clade.ssg into parents ----------------------------------------------
//nothing in this section works.

// makes a dictionary out of a environment.cfg file
var cladeSSGparse = function (filestr) {
  'use strict';
  var rslt = [];
  var lineobj, cfgary, name;
  var lines = filestr.split("\n");
  for (var ii = 0; ii < lines.length; ii++) {
    if (3 < lines[ii].length) {
      cfgary = flexsplit(lines[ii]).split(',');   //replaces white space with a comma, then splits on comma
      name = cfgary[0];
      if ('#' != name[0]) {
        rslt.push(name);
      }
    }
  } // for
  return rslt;
};

// puts data from the environment.cfg into the setup form for the population page
av.fio.cladeSSG2parents = function (fileStr) {
  'use strict';
  var list = cladeSSGparse(fileStr);
  var lngth = list.length;
  for (var ii = 0; ii < lngth; ii++) {
    av.parents.name[ii] = list[ii];
    av.dnd.ancestorBox.insertNodes(false, [{data: av.parents.name[ii], type: ['g']}]);
  }
  av.dnd.ancestorBox.sync();
  console.log('parents', av.parents);
}

//----------------------- section to put data from time recorder (tr) files into data from charts ----------------------
//nothing in this section works.

// makes a dictionary out of a environment.cfg file
var tr2chartParse = function (filestr) {
  'use strict';
  var rslt = {};
  rslt.update = [];
  rslt.data = [];
  var lineobj, cfgary, name;
  var pairs = filestr.split(',');
  var pairLngth = pairs.length;
  console.log('pairLngth', pairLngth);
  for (var ii = 0; ii < pairLngth; ii++) {
    lineobj = pairs[ii].split(':');
    rslt.update[ii] = Number(lineobj[0]);
    rslt.data[ii] = Number(lineobj[1]);
  } // for
  return rslt.data;
};

// puts data from the environment.cfg into the setup form for the population page
av.fio.tr2chart = function (fileStr) {
  'use strict';
  var data = tr2chartParse(fileStr);
  return data;
}

//------------------------------------------------- rest may not be in use ---------------------------------------------

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

