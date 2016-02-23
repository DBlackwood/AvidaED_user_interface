//write file data

av.fwt.deleteFzrFile = function (fileId) {
  'use strict';
  try { delete av.fzr.file[fileId];}
  catch(e) {av.fzr.file[fileId] = undefined; }
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

av.fwt.makeFzrAvidaCfg = function (idStr, em) {
  'use strict';
  var txt = 'WORLD_X ' + dijit.byId('sizeCols').get('value') + '\n';
  txt += 'WORLD_Y ' + dijit.byId('sizeRows').get('value') + '\n';
  txt += 'WORLD_GEOMETRY 1 \n';
  txt += 'COPY_MUT_PROB ' + document.getElementById('muteInput').value/100 + '\n';
  txt += 'DIVIDE_INS_PROB 0.0 \n';
  txt += 'DIVIDE_DEL_PROB 0.0 \n';
  txt += 'OFFSPRING_SIZE_RANGE 1.0 \n';
  // parents (ancestors) are injected into avida separately.
  if (dijit.byId('childParentRadio').get('checked')) txt += 'BIRTH_METHOD 0 \n';  //near parent
  else txt += 'BIRTH_METHOD 4 \n';   //anywhere randomly
  if (dijit.byId('experimentRadio').get('checked')) txt += 'RANDOM_SEED -1 \n';
  else txt += 'RANDOM_SEED 100\n';
  txt += 'AVE_TIME_SLICE ' + dijit.byId('aveTimeSlice').get('value') + '\n';
  txt += 'SLEEP_DELAY ' + dijit.byId('sleepDelay').get('value') + '\n';
  txt += '#include instset.cfg\n';
  txt += 'I';
  if (em) {av.fwt.makeEmDxFile(idStr+'/avida.cfg', txt);}
  else {av.fwt.makeFzrFile(idStr+'/avida.cfg', txt);}
}

av.fwt.makeFzrEnvironmentCfg = function (idStr, em) {
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
  if (em) {av.fwt.makeEmDxFile(idStr+'/environment.cfg', txt);}
  else  { av.fwt.makeFzrFile(idStr+'/environment.cfg', txt);}
}

av.fwt.makeFzrAncestorAuto = function (idStr) {
  'use strict';
  var txt = '';
  var lngth = av.parents.autoNdx.length;
  for (var ii = 0; ii < lngth; ii++) {
    txt += av.parents.name[av.parents.autoNdx[ii]] + '\n';
    txt += av.parents.genome[av.parents.autoNdx[ii]] + '\n';
  }
  av.fwt.makeFzrFile(idStr+'/ancestors', txt);
}

av.fwt.makeFzrAncestorHand = function (idStr) {
  'use strict';
  var txt = '';
  var lngth = av.parents.handNdx.length;
  for (var ii = 0; ii < lngth; ii++) {
    txt += av.parents.name[av.parents.handNdx[ii]] + '\n';
    txt += av.parents.genome[av.parents.handNdx[ii]] + '\n';
    txt += av.parents.col[av.parents.handNdx[ii]] + ',' + av.parents.row[av.parents.handNdx[ii]] + '\n';
  }
  av.fwt.makeFzrFile(idStr+'/ancestors_manual', txt);
}

av.fwt.makeFzrTRfile = function (path, data) {
  var text = '';
  var pairs = [];
  var dataLn = data.length;
  for (var ii = 0; ii < dataLn; ii++) {
    pairs[ii] = ii + ':' + data[ii];
  }
  text = pairs.join();
  av.fwt.makeFzrFile(path, text);
}

// --------------------------------------------------- called by other files -------------------------------------------
av.fwt.form2cfgFolder = function() {
  'use strict';
  var em = false;
  av.fwt.makeFzrAvidaCfg('cfg', em);
  av.fwt.makeFzrEnvironmentCfg('cfg', em);
  av.fwt.makeFzrAncestorAuto('cfg');
  av.fwt.makeFzrAncestorHand('cfg');
}

av.fwt.makeFzrConfig = function (num) {
  'use strict';
  var em = false;
  av.fwt.makeFzrAvidaCfg('c'+num, em);
  av.fwt.makeFzrEnvironmentCfg('c'+num, em);
  av.fwt.makeFzrFile('c'+num+'/events.cfg', '');
  //av.fwt.makeFzrFile('c'+num+'/entryname.txt', av.fzr.config[ndx].name);  // this was created in dnd menu code
  av.fwt.makeFzrInstsetCfg('c'+num);
  av.fwt.makeFzrAncestorAuto('c'+num)
  av.fwt.makeFzrAncestorHand('c'+num)
}

av.fwt.makeFzrWorld = function (num) {
  'use strict';
  var em = false;
  av.fwt.makeFzrAvidaCfg('w'+num, em);
  av.fwt.makeFzrEnvironmentCfg('w'+num, em);
  av.fwt.makeFzrEventsCfgWorld =('w'+num, em)
  //av.fwt.makeFzrFile('c'+num+'/entryname.txt', av.fzr.config[ndx].name);  // this was created in dnd menu code
  av.fwt.makeFzrInstsetCfg('w'+num);
  av.fwt.makeFzrAncestorAuto('w'+num)
  av.fwt.makeFzrAncestorHand('w'+num);
  av.fwt.makeFzrTRfile('w'+num+'/tr0', av.ptd.aveFit);
  av.fwt.makeFzrTRfile('w'+num+'/tr1', av.ptd.aveGnl);
  av.fwt.makeFzrTRfile('w'+num+'/tr2', av.ptd.aveMet);
  av.fwt.makeFzrTRfile('w'+num+'/tr3', av.ptd.aveNum);
  av.fwt.makeFzrFile('w'+num + '/update', av.grd.updateNum);
  //there are more files needed to talk to Matt, tiba
}

// never called. Not in use as of 2016_029
av.fwt.makeFzrOrgan = function () {
  'use strict';
  var ndx = av.fzr.genome.length-1;  //write the last one created
  av.fwt.makeEmDxFile(av.fzr.genome[ndx]._id+'/entryname.txt', av.fzr.genome[ndx].name);  //took fzr out
  av.fwt.makeEmDxFile(av.fzr.genome[ndx]._id+'/genome.seq', av.fzr.genome[ndx].genome);
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
