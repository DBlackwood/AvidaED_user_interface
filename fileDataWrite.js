"use strict";
//write file data
var av = av || {};  //because av already exists

av.fwt.deleteFzrFile = function (fileId) {
  'use strict';
  try { delete av.fzr.file[fileId];}
  catch(e) {av.fzr.file[fileId] = undefined; }
}

av.fwt.deleteFzrItem = function (fileId) {
  'use strict';
  try { delete av.fzr.item[fileId];}
  catch(e) {av.fzr.item[fileId] = undefined; }
}

av.fwt.makeEmDxFile = function (path, contents) {
  'use strict';
/*
  //Dexie is not currently in use
  av.fio.dxdb.FILE_DATA.add( {
      timestamp: Date.now(),  //We may need to do more work with this property
      //contents: utf8bytesEncode(contents),
      mode: 33206
    },
    path
  ).then(function () {
      console.log('Able to add file ', path);
    }).catch(function (err) {
      console.log('Unable to add file, path',path, '; error', err);
    });
    */
}

//kept this one line function in case we need to go to storing the workspace in a database instead of freezer memory
av.fwt.makeFzrFile = function (fileId, text) {
  'use strict';
  av.fzr.file[fileId] = text;
}

av.fwt.makeActConfigFile = function (fileId, text) {
  'use strict';
  av.fzr.actConfig.file[fileId] = text;
}

// copy instruction set from default config.
av.fwt.makeFzrInstsetCfg = function (idStr) {
  'use strict';
  av.fzr.file[idStr + '/instset.cfg'] = av.fzr.file['c0/instset.cfg'];
}

av.fwt.makeFzrEventsCfgWorld = function (idStr, em) {
  'use strict';
  var txt = 'u begin LoadPopulation detail.spop' + '\n';
  txt += 'u begin LoadStructuredSystematicsGroup role=clade:filename=clade.ssg';
  if (em) {av.fwt.makeEmDxFile(idStr+'/events.cfg', txt);}
  else {av.fwt.makeFzrFile(idStr+'/events.cfg', txt);}
}

av.fwt.makeFzrAvidaCfg = function (idStr, actConfig) {
  'use strict';
  //console.log('col; row', av.dom.sizeCols, av.dom.sizeRows);
  //console.log('col; row - text', av.dom.sizeCols.text, av.dom.sizeRows.text);
  //console.log('col; row - value', av.dom.sizeCols.value, av.dom.sizeRows.value);
  //console.log('col; row - HTML', av.dom.sizeCols.innerHTML, av.dom.sizeRows.innerHTML);
  var txt = 'WORLD_X ' + av.dom.sizeCols.value + '\n';
  txt += 'WORLD_Y ' + av.dom.sizeRows.value + '\n';
  txt += 'WORLD_GEOMETRY 1 \n';
  txt += 'COPY_MUT_PROB ' + document.getElementById('mutePopInput').value/100 + '\n';
  txt += 'DIVIDE_INS_PROB 0.0 \n';
  txt += 'DIVIDE_DEL_PROB 0.0 \n';
  txt += 'OFFSPRING_SIZE_RANGE 1.0 \n';
  // parents (ancestors) are injected into avida separately.
  if (dijit.byId('childParentRadio').get('checked')) txt += 'BIRTH_METHOD 0 \n';  //near parent
  else txt += 'BIRTH_METHOD 4 \n';   //anywhere randomly
  if (dijit.byId('experimentRadio').get('checked')) txt += 'RANDOM_SEED -1 \n';
  else txt += 'RANDOM_SEED 100\n';
  //no longer in use; tiba delete later
  //txt += 'AVE_TIME_SLICE ' + dijit.byId('aveTimeSlice').get('value') + '\n';
  //txt += 'SLEEP_DELAY ' + dijit.byId('sleepDelay').get('value') + '\n';
  txt += '#include instset.cfg\n';
  txt += 'PRECALC_PHENOTYPE 1\n';
  txt += 'VERSION_ID 2.14.0 \n';
  if (actConfig) {av.fwt.makeActConfigFile('avida.cfg', txt);}  // always false for now 2017 July
  else {av.fwt.makeFzrFile(idStr+'/avida.cfg', txt);}
}

av.fwt.makeFzrPauseRunAt = function (idStr, actConfig) {
  'use strict';
  var txt = av.dom.autoPauseNum.value.toString();
  // Is autoPause checked?
  if (!av.dom.autoPauseCheck.checked) { txt = '-1'; }   //Manual Update 
  else { txt = av.dom.autoPauseNum.value; }
  if (actConfig) {av.fwt.makeActConfigFile('pauseRunAt.txt', txt);}
  else {av.fwt.makeFzrFile(idStr+'/pauseRunAt.txt', txt);}
};

/* Delete later tiba
av.fwt.makeFzrConfigTxt = function (idStr, actConfig) {
  'use strict';
  var txt = 'update ';
  if (dijit.byId('experimentRadio').get('checked')) txt += 'RANDOM_SEED -1 \n';
  txt += dijit.byId('autoPauseNum').get('value') + '\n';
  if (actConfig) {av.fwt.makeActConfigFile('avida.cfg', txt);}
  else {av.fwt.makeFzrFile(idStr+'/avida.cfg', txt);}
};

*/
av.fwt.makeFzrEnvironmentCfg = function (idStr, actConfig) {
  'use strict';
  var txt = '';
  if (dijit.byId('notose').get('checked')) txt += 'REACTION  NOT  not   process:value=1:type=pow  requisite:max_count=1\n';  else txt += 'REACTION  NOT  not   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('nanose').get('checked')) txt += 'REACTION  NAND nand  process:value=1:type=pow  requisite:max_count=1\n';  else txt += 'REACTION  NAND nand  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('andose').get('checked')) txt += 'REACTION  AND  and   process:value=2:type=pow  requisite:max_count=1\n';  else txt += 'REACTION  AND  and   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('ornose').get('checked')) txt += 'REACTION  ORN  orn   process:value=2:type=pow  requisite:max_count=1\n';  else txt += 'REACTION  ORN  orn   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('orose').get('checked'))  txt += 'REACTION  OR   or    process:value=3:type=pow  requisite:max_count=1\n';  else txt += 'REACTION  OR   or    process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('andnose').get('checked')) txt += 'REACTION  ANDN andn  process:value=3:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  ANDN andn  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('norose').get('checked')) txt += 'REACTION  NOR  nor   process:value=4:type=pow  requisite:max_count=1\n';  else txt += 'REACTION  NOR  nor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('xorose').get('checked')) txt += 'REACTION  XOR  xor   process:value=4:type=pow  requisite:max_count=1\n';  else txt += 'REACTION  XOR  xor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId('equose').get('checked')) txt += 'REACTION  EQU  equ   process:value=5:type=pow  requisite:max_count=1';    else txt += 'REACTION  EQU  equ   process:value=0:type=pow  requisite:max_count=1';
  if (actConfig) {av.fwt.makeActConfigFile('environment.cfg', txt);}
  else  { av.fwt.makeFzrFile(idStr+'/environment.cfg', txt);}
}

av.fwt.makeFzrAncestorAuto = function (idStr, actConfig) {
  'use strict';
  var txt = '';
  var lngth = av.parents.autoNdx.length;
  for (var ii = 0; ii < lngth; ii++) {
    txt += av.parents.name[av.parents.autoNdx[ii]] + '\n';
    txt += av.parents.genome[av.parents.autoNdx[ii]] + '\n';
  }
  if (actConfig) {av.fwt.makeActConfigFile('ancestors', txt);}
  else {av.fwt.makeFzrFile(idStr+'/ancestors', txt);}
}

av.fwt.makeFzrAncestorHand = function (idStr, actConfig) {
  'use strict';
  var txt = '';
  var lngth = av.parents.handNdx.length;
  for (var ii = 0; ii < lngth; ii++) {
    txt += av.parents.name[av.parents.handNdx[ii]] + '\n';
    txt += av.parents.genome[av.parents.handNdx[ii]] + '\n';
    txt += av.parents.col[av.parents.handNdx[ii]] + ',' + av.parents.row[av.parents.handNdx[ii]] + '\n';
  }
  if (actConfig) {av.fwt.makeActConfigFile('ancestors_manual', txt);}
  else {av.fwt.makeFzrFile(idStr+'/ancestors_manual', txt);}
}

av.fwt.makeFzrTRfile = function (path, data) {
  var text = '';
  var pairs = [];
  var dataLn = data.length;
  for (var ii = 0; ii < dataLn; ii++) {
    pairs[ii] = ii + ':' + data[ii];
  }
  text = pairs.join();
  //console.log(path, text);
  av.fwt.makeFzrFile(path, text);
}

av.fwt.makeFzrTimeRecorder = function (fname, data) {
  var text='';
  var lngth = data.length-1;
  //console.log('lngth', lngth);
  for (ii=0; ii < lngth; ii++) {
    text += ii + ':' + data[ii] + ',';
  }
  lngth++;
  text += lngth + ':' + data[lngth];
  av.fwt.makeFzrTRfile(fname, text);
}

// --------------------------------------------------- called by other files -------------------------------------------
av.fwt.form2cfgFolder = function() {
  'use strict';
  var actConfig = true;
  av.fwt.makeFzrAvidaCfg('cfg', actConfig);
  av.fwt.makeFzrEnvironmentCfg('cfg', actConfig);
  av.fwt.makeFzrAncestorAuto('cfg', actConfig);
  av.fwt.makeFzrAncestorHand('cfg', actConfig);
}

av.fwt.makeFzrConfig = function (num) {
  'use strict';
  var em = false;
  av.fwt.makeFzrAvidaCfg('c'+num, em);
  av.fwt.makeFzrEnvironmentCfg('c'+num, em);
  av.fwt.makeFzrFile('c'+num+'/events.cfg', '');
  //av.fwt.makeFzrFile('c'+num+'/entryname.txt', av.fzr.config[ndx].name);  // this was created in dnd menu code
  av.fwt.makeFzrInstsetCfg('c'+num);
  av.fwt.makeFzrAncestorAuto('c'+num, em);
  av.fwt.makeFzrAncestorHand('c'+num, em);
  av.fwt.makeFzrPauseRunAt('c'+num, em);
}

av.fwt.makeFzrWorld = function (num) {
  'use strict';
  var em = false;
  av.fwt.makeFzrAvidaCfg('w'+num, em);
  av.fwt.makeFzrEnvironmentCfg('w'+num, em);
  av.fwt.makeFzrEventsCfgWorld =('w'+num, em)
  //av.fwt.makeFzrFile('c'+num+'/entryname.txt', av.fzr.config[ndx].name);  // this was created in dnd menu code
  av.fwt.makeFzrInstsetCfg('w'+num);
  av.fwt.makeFzrAncestorAuto('w'+num, em);
  av.fwt.makeFzrAncestorHand('w'+num, em);
  av.fwt.makeFzrTRfile('w'+num+'/tr0', av.pch.aveFit);
  av.fwt.makeFzrTRfile('w'+num+'/tr1', av.pch.aveCst);
  av.fwt.makeFzrTRfile('w'+num+'/tr2', av.pch.aveEar);
  av.fwt.makeFzrTRfile('w'+num+'/tr3', av.pch.aveNum);
  av.fwt.makeFzrTRfile('w'+num+'/tr4', av.pch.aveVia);
  av.fwt.makeFzrFile('w'+num + '/update', av.grd.updateNum.toString() );
  av.fwt.makeFzrCSV('w'+num, em);
  //there are more files needed to talk to Matt, tiba
}

av.fwt.popExpWrite = function (msg) {
  'use strict';
  //console.log('exportExpr', msg);
  //assume last world for now.
  var lngth = msg.files.length;
  for (var ii = 0; ii < lngth; ii++) {
    switch (msg.files[ii].name) {
      case 'clade.ssg':
      case 'detail.spop':
      case 'instset.cfg':
      case 'events.cfg':
      //case 'environment.cfg':
      //case 'avida.cfg':
        //console.log('ii', ii, '; name', msg.files[ii].name);
        av.fwt.makeFzrFile(msg.popName + '/' + msg.files[ii].name, msg.files[ii].data);
        break;
    }
  }
  //console.log('fzr', av.fzr.file);
}

av.fwt.removeFzrConfig = function(dir) {
  'use strict';
  av.fwt.deleteFzrFile(dir+'/ancestors');
  av.fwt.deleteFzrFile(dir+'/ancestors_manual');
  av.fwt.deleteFzrFile(dir+'/avida.cfg');
  av.fwt.deleteFzrFile(dir+'/environment.cfg');
  av.fwt.deleteFzrFile(dir+'/events.cfg');
  av.fwt.deleteFzrFile(dir+'/entryname.txt');
  av.fwt.deleteFzrFile(dir+'/instset.cfg');
  var domid = av.fzr.domid[dir];
  delete av.fzr.domid[dir];
  delete av.fzr.dir[domid];
};

av.fwt.removeFzrGenome = function (dir) {
  'use strict';
  av.fwt.deleteFzrFile(dir+'/entryname.txt');
  av.fwt.deleteFzrFile(dir+'/genome.seq');
  var domid = av.fzr.domid[dir];
  delete av.fzr.domid[dir];
  delete av.fzr.dir[domid];
  //console.log('after remove genome: dir', dir, '; av.fzr', av.fzr);
}

av.fwt.removeFzrWorld = function (dir) {
  'use strict';
  av.fwt.deleteFzrFile(dir+'/ancestors');
  av.fwt.deleteFzrFile(dir+'/ancestors_manual');
  av.fwt.deleteFzrFile(dir+'/avida.cfg');
  av.fwt.deleteFzrFile(dir+'/environment.cfg');
  av.fwt.deleteFzrFile(dir+'/events.cfg');
  av.fwt.deleteFzrFile(dir+'/entryname.txt');
  av.fwt.deleteFzrFile(dir+'/instset.cfg');
  av.fwt.deleteFzrFile(dir+'/update');
  var domid = av.fzr.domid[dir];
  delete av.fzr.domid[dir];
  delete av.fzr.dir[domid];
  //av.fwt.deleteFzrFile(dir+'/');
  //av.fwt.deleteFzrFile(dir+'/');
}

av.fwt.removeFzrItem = function(dir, type){
  'use strict';
  //console.log('dir', dir, '; type', type, '; dir0', dir[0]);
  switch (type){
    case 'c':
      av.fwt.removeFzrConfig(dir);
      break;
    case 'g':
      av.fwt.removeFzrGenome(dir);
      break;
    case 'w':
      av.fwt.removeFzrWorld(dir);
      break;
  }
}

av.fwt.makeFzrCSV = function(idStr, em) {
  "use strict";
  //console.log('idStr=', idStr, ' em=',em);
  var fileNm = idStr + '/timeRecorder.csv';
  //console.log('fileName = ', fileNm);
  av.fwt.makeCSV(fileNm);
  //console.log(av.fzr);
}

av.fwt.writeCurrentCSV = function(idStr) {  
  "use strict";
  //console.log('idStr=', idStr);
  av.fwt.makeCSV(idStr);
  //console.log('before av.fio.fzSaveCsvfn');
  av.fio.fzSaveCsvfn();
}

av.fwt.makeCSV = function(fileNm) {
  'use strict';
  //console.log('av.fwt.makeCSV fileNm=', fileNm);
  //console.log('av.ui.page=', av.ui.page);
  if ('populationBlock' === av.ui.page) {
    //  '@default at update 141 Average Fitness,@default at update 141 Average Gestation Time,' +
    //  '@default at update 141 Average Energy Acq. Rate,@default at update 141 Count of Organisms in the World';
    av.fwt.csvStrg = '# Name = ' + fileNm + '\n';
    av.fwt.csvStrg += '# Functions = ' + av.grd.selFnBinary + ' = ' + av.grd.selFnText + ' are picked \n'
      + '# FitP = Average Fitness of Viable Population \n'
      + '# CstP = Average Offspring Cost of Viable Population \n'
      + '# EarP = Average Energy Acquisition Rate of Viable Population \n'
      + '# NumP = Total Polution Size \n'
      + '# ViaP = Viable Population Size \n'
      + '# FitF = Average Fitness of avidians performing picked functions \n'
      + '# CstF = Average Offspring Cost avidians performing picked functions \n'
      + '# EarF = Average Energy Acquisition Rate avidians performing functions \n'
      + '# NumF = Number of avidians performing picked functions \n'
      + '# columns for statistics for each ancestor (up to 16) will follow. Each column will use 3 letters for the \n'
      + '# data type followed by _##; where the number with a leading zero is for each ancestor \n';

    for (var ii = 0; ii < av.pch.numDads; ii++) {
      av.fwt.csvStrg += '# ancestor ' + (ii).pad() + ' is ' + av.parents.name[ii] + '\n'
    }


    av.fwt.csvStrg += 'Update,'
      + 'FitP,'
      + 'CstP,'
      + 'EarP,'
      + 'NumP,'
      + 'ViaP,'
      + 'FitF,'
      + 'CstF,'
      + 'EarF,'
      + 'NumF,';

    for (var ii = 0; ii < av.pch.numDads; ii++) {
      //av.fwt.csvStrg += 'Fit_' + av.parents.name[ii] + ','
      //av.fwt.csvStrg += 'Cst_' + av.parents.name[ii] + ','
      //av.fwt.csvStrg += 'Ear_' + av.parents.name[ii] + ','
      //av.fwt.csvStrg += 'Num_' + av.parents.name[ii] + ','
      //av.fwt.csvStrg += 'Via_' + av.parents.name[ii] + ','
      av.fwt.csvStrg += 'Fit_' + (ii).pad() + ','
      av.fwt.csvStrg += 'Cst_' + (ii).pad() + ','
      av.fwt.csvStrg += 'Ear_' + (ii).pad() + ','
      av.fwt.csvStrg += 'Num_' + (ii).pad() + ','
      av.fwt.csvStrg += 'Via_' + (ii).pad() + ','
    }

    var lngth = av.pch.aveFit.length;
    for (var update = 0; update < lngth; update++) {
      av.fwt.csvStrg += '\n' + update + ',' + av.pch.aveFit[update] + ',' + av.pch.aveCst[update] + ','
        + av.pch.aveEar[update] + ',' + av.pch.aveNum[update] + ',' + av.pch.aveVia[update] + ','
        + av.pch.logFit[update] + ',' + av.pch.logCst[update] + ',' + av.pch.logEar[update] + ',' + av.pch.logNum[update] + ',';

      for (var kk = 0; kk < av.pch.numDads; kk++) {
        av.fwt.csvStrg += av.pch.dadFit[av.parents.name[kk]][update] + ',';
        av.fwt.csvStrg += av.pch.dadCst[av.parents.name[kk]][update] + ',';
        av.fwt.csvStrg += av.pch.dadEar[av.parents.name[kk]][update] + ',';
        av.fwt.csvStrg += av.pch.dadNum[av.parents.name[kk]][update] + ',';
        av.fwt.csvStrg += av.pch.dadVia[av.parents.name[kk]][update] + ',';
      }
    }
    //string completed
  }
  else if ('analysisBlock' === av.ui.page) {
    var longest = 0;
    av.fwt.csvStrg = 'Update';
    for (var ii = 0; ii < 3; ii++) {
      if (0 < document.getElementById('graphPop' + ii).textContent.length) {
        av.fwt.csvStrg += ', "' + document.getElementById('graphPop' + ii).textContent + ' Ave Fitness' + '"'
        av.fwt.csvStrg += ', "' + document.getElementById('graphPop' + ii).textContent + ' Ave Offspring Cost' + '"'
        av.fwt.csvStrg += ', "' + document.getElementById('graphPop' + ii).textContent + ' Ave Energy Acq. Rate' + '"'
        av.fwt.csvStrg += ', "' + document.getElementById('graphPop' + ii).textContent + ' Pop Size' + '"'
        av.fwt.csvStrg += ', "' + document.getElementById('graphPop' + ii).textContent + ' Viable Size' + '"';
        if (longest < av.fzr.pop[ii].fit.length) longest = av.fzr.pop[ii].fit.length;
      }
    }
    for (var ii = 0; ii < longest; ii++) {
      av.fwt.csvStrg += '\n' + ii;
      for (var jj = 0; jj < 3; jj++)
      if (0 < document.getElementById('graphPop' + jj).textContent.length) {
        if (ii < av.fzr.pop[jj].fit.length) {
          av.fwt.csvStrg += ', ' + av.fzr.pop[jj].fit[ii]
                          + ', ' + av.fzr.pop[jj].ges[ii]
                          + ', ' + av.fzr.pop[jj].met[ii]
                          + ', ' + av.fzr.pop[jj].num[ii]
                          + ', ' + av.fzr.pop[jj].via[ii];
        }
        else av.fwt.csvStrg += ', , , , , ';
      }
    }
  }
  //av.fwt.csvStrg now contains what should be in the cvs file
  //console.log(av.fwt.csvStrg);
};


/***********************************************************************************************************************
                                  Notes about problems saving in Safari
/***********************************************************************************************************************
 Notes on saving files in Safari.
 http://jsfiddle.net/B7nWs/  works on Safari in jsfiddle
 works in Avida-ED for PDF, but gives the following error
 [Error] Failed to load resource: Frame load interrupted (0, line 0)
 works in pdf file, but can’t seem to get with text I generate.

 /works in safari – does not open blank tab. Callbacks do not work.
 av.fio.writeSafari = function (tmpUrl) {
    //http://johnculviner.com/jquery-file-download-plugin-for-ajax-like-feature-rich-file-downloads/
$.fileDownload('http://jqueryfiledownload.apphb.com/FileDownload/DownloadReport/0', {
      //$.fileDownload(tmpUrl, {
      successCallback: function (url) {
        alert('You just got a file download dialog or ribbon for this URL :' + url);
      },
      failCallback: function (html, url) {
        alert('Your file download just failed for this URL:' + url + '\r\n' + 'Here was the resulting error HTML: \r\n' + html
        );
      }
    });
  };

//works in safari for pdf files
http://jqueryfiledownload.apphb.com

//works in safari - opens a new blank tab and leaves it open after saving file called 'unknown'
//http://stackoverflow.com/questions/12802109/download-blobs-locally-using-safari
window.open('data:attachment/csv;charset=utf-8,' + encodeURI(av.debug.log));

http://stackoverflow.com/questions/23667074/javascriptwrite-a-string-with-multiple-lines-to-a-csv-file-for-downloading
https://adilapapaya.wordpress.com/2013/11/15/exporting-data-from-a-web-browser-to-a-csv-file-using-javascript/
http://jsfiddle.net/nkm2b/2/
$(fileDownloadButton).click(function () {
 //works in Safari, but opens a new tab which is blank and gets left open; file named 'unknown'
  var a = document.createElement('a');
  a.href     = 'data:attachment/csv,' + av.fwt.csvStrg;
  a.target   = '_blank';
  a.download = 'myFile.csv';
  document.body.appendChild(a);
  a.click();
});

  //Did not work in Safari works in Firefox
  var saveData = (function () {
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    return function (data, fileName) {
      var json = JSON.stringify(data),
        blob = new Blob([json], {type: 'octet/stream'}),
        url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    };
  }());

  var data = { x: 42, s: 'hello, world', d: new Date() },
    fileName = 'DianeFile.json';  //av.fio.userFname
  saveData(data, fileName);

//Does not work in safari
https://codepen.io/davidelrizzo/pen/cxsGb

// the statement pair below does not work in Safari. Opens tab with text data. does not save it.
// tab has randomvalue url name like blob:file:///705ac45f-ab49-40ac-ae9a-8b03797daeae
//http://stackoverflow.com/questions/18690450/how-to-generate-and-prompt-to-save-a-file-from-content-in-the-client-browser
 var blob = new Blob(['Hello, world!'], {type: 'text/plain;charset=utf-8'});
 saveAs(blob, 'helloWorld.txt');

//Does not work in Safari – opens tab with the string only
// http://stackoverflow.com/questions/13405129/javascript-create-and-save-file
    var myCsv = 'Col1,Col2,Col3\nval1,val2,val3';
    window.open('data:text/csv;charset=utf-8,' + escape(myCsv));

//http://stackoverflow.com/questions/13405129/javascript-create-and-save-file
//does not work in chrome or safari I might not have it right
    var a = document.getElementById('a');
    var file = new Blob(['file text'], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'filename.txt';

//works in chrome, but not in safari
function download(text, name, type) {
    var a = document.createElement('a');
    var file = new Blob([text], {type: type});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
  }
download('file text', 'myfilename.txt', 'text/plain')

//Does not work in Safari
var aFileParts = ['<a id='a'><b id='b'>hey!</b></a>'];
var oMyBlob = new Blob(aFileParts, {type : 'text/html'}); // the blob
window.open(URL.createObjectURL(oMyBlob));

//does not work in safari does work in chrome
http://thiscouldbebetter.neocities.org/texteditor.html

//does not work in Safari
  var blob = new Blob([av.fwt.csvStrg], {type: 'text/plain;charset=utf-8'});
  saveAs(blob, av.fio.csvFileName);};
 
 // http://stackoverflow.com/questions/30694453/blob-createobjecturl-download-not-working-in-firefox-but-works-when-debugging
 //Should work but I can get the right type for data
 function downloadFile(filename, data) {

    var a = document.createElement('a');
    a.style = 'display: none';
    var blob = new Blob(data, {type: 'application/octet-stream'});
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      document.body.removeChild(a);    //does not remove blank tab
      window.URL.revokeObjectURL(url);
    }, 100);
  }

 //works in Firefox & safari. Lets you name the file in Firefox ,BUT
 // looses the line feeds so does not work for sv file.
 var a = document.createElement('a');
 a.href = 'data:attachment/csv,' + av.fwt.csvStrg;
 a.target = '_blank';
 a.download = av.fio.csvFileName;
 document.body.appendChild(a);
 a.click();

 // saves in safari - opens blank tab an leaves it open
 av.fwt.tryDown = function() {
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

 //window.open('data:attachment/csv;charset=utf-8,' + encodeURI(av.debug.log)); //also works, but creates odd file names.


 Places that say you cannot save non-text files from javascript in Safari
 https://github.com/wenzhixin/bootstrap-table/issues/2187
 http://www.html5rocks.com/en/tutorials/file/filesystem/

 ---------------------- look at -- could not get to load in Safari
 http://johnculviner.com/jquery-file-download-plugin-for-ajax-like-feature-rich-file-downloads/

***********************************************************************************************************************/
// http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
/*
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
 */

/*
 //console.log('declaring window.downloadFile()');
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
*/

/**********************************************************************************************************************/
/* OpenJSCAD.org  There is a github site for this. 

Can apparently save files in Safari from javascript
  Used some ideas from here and I can save a file that is the correct size, but I still cannot read it.

  For saving look at:
 generateOutputFileBlobUrl: function() {
 if (OpenJsCad.isSafari()) {
 //console.log('Trying download via DATA URI');
 // convert BLOB to DATA URI
 var blob = this.currentObjectToBlob();
 var that = this;
 var reader = new FileReader();
 reader.onloadend = function() {
 if (reader.result) {
 that.hasOutputFile = true;
 that.downloadOutputFileLink.href = reader.result;
 that.downloadOutputFileLink.innerHTML = that.downloadLinkTextForCurrentObject();
 var ext = that.selectedFormatInfo().extension;
 that.downloadOutputFileLink.setAttribute('download','openjscad.'+ext);
 that.downloadOutputFileLink.setAttribute('target', '_blank');
 that.enableItems();
 }
 };
 reader.readAsDataURL(blob);

  Still need to look at reading!
  /********************************************************************************************************************/