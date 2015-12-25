//need to write string to be the data 'file' to put in pouchDB

function deleteFzrFile(fzr, fileId) {
  'use strict';
  fio.wsdb.get(fileId).then(function (doc) {
    return fio.wsdb.remove(doc);
  }).then(function (result) {
    if (av.debug.pdb) console.log('correct pdb: ', doc);
  }).catch(function (err) {
    console.log('delete file err: ', err);
  });
}

function makeEmDxFile(fio, path, contents) {
  'use strict';
  fio.dxdb.FILE_DATA.add( {
      timestamp: Date.now(),  //We may need to do more work with this property
      contents: utf8bytesEncode(contents),
      mode: 33206
    },
    path
  ).then(function () {
      console.log('Able to add file ', path);
    }).catch(function (err) {
      console.log('Unable to add file, path',path, '; error', err);
    });
}

function makeFzrFile(fzr, fileId, text) {
  'use strict';
  fzr.file[fileId] = text;
}

// copy instruction set from default config.
function makeFzrInstsetCfg(fzr, idStr) {
  'use strict';
  fzr.file[idStr + '/instset.cfg'] = fzr.file['c0/instset.cfg'];
}

function makeFzrWorldEventsCfg(fzr, idStr, em) {
  'use strict';
  var txt = 'u begin LoadPopulation detail.spop' + '\n';
  txt += 'u begin LoadStructuredSystematicsGroup role=clade:filename=clade.ssg';
  if (em) {makeEmDxFile(fzr, idStr+'/events.cfg', txt);}
  else {makeFzrFile(fzr, idStr+'/events.cfg', txt);}
}

function makeFzrAvidaCfg(fzr, idStr, em) {
  'use strict';
  var txt = 'WORLD_X ' + dijit.byId("sizeCols").get('value') + '\n';
  txt += 'WORLD_Y ' + dijit.byId("sizeRows").get('value') + '\n';
  txt += 'WORLD_GEOMETRY 1 \n';
  txt += 'COPY_MUT_PROB ' + document.getElementById("muteInput").value/100 + '\n';
  txt += 'DIVIDE_INS_PROB 0.0 \n';
  txt += 'DIVIDE_DEL_PROB 0.0 \n';
  txt += 'OFFSPRING_SIZE_RANGE 1.0 \n';
  // parents (ancestors) are injected into avida separately.
  if (dijit.byId("childParentRadio").get('checked')) txt += 'BIRTH_METHOD 0 \n';  //near parent
  else txt += 'BIRTH_METHOD 4 \n';   //anywhere randomly
  if (dijit.byId("experimentRadio").get('checked')) txt += 'RANDOM_SEED -1 \n';
  else txt += 'RANDOM_SEED 100\n';
  txt += '#include instset.cfg\n';
  txt += 'I\n';
  if (em) {makeEmDxFile(fzr, idStr+'/avida.cfg', txt);}
  else {makeFzrFile(fzr, idStr+'/avida.cfg', txt);}
}

function makeFzrEnvironmentCfg(fzr, idStr, em) {
  'use strict';
  var txt = '';
  if (dijit.byId("notose").get('checked')) txt += 'REACTION  NOT  not   process:value=1:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NOT  not   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("nanose").get('checked')) txt += 'REACTION  NAND nand  process:value=1:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NAND nand  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("andose").get('checked')) txt += 'REACTION  AND  and   process:value=2:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  AND  and   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("ornose").get('checked')) txt += 'REACTION  ORN  orn   process:value=2:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  ORN  orn   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("orose").get('checked'))  txt += 'REACTION  OR   or    process:value=3:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  OR   or    process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("andnose").get('checked')) txt += 'REACTION  ANDN andn  process:value=3:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  ANDN andn  process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("norose").get('checked')) txt += 'REACTION  NOR  nor   process:value=4:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  NOR  nor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("xorose").get('checked')) txt += 'REACTION  XOR  xor   process:value=4:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  XOR  xor   process:value=0:type=pow  requisite:max_count=1\n';
  if (dijit.byId("equose").get('checked')) txt += 'REACTION  EQU  equ   process:value=5:type=pow  requisite:max_count=1\n'; else txt += 'REACTION  EQU  equ   process:value=0:type=pow  requisite:max_count=1\n';
  if (em) {makeEmDxFile(fzr, idStr+'/environment.cfg', txt);}
  else  { makeFzrFile(fzr, idStr+'/environment.cfg', txt);}

}

function makeFzrAncestor(fzr, idStr) {
  'use strict';
}

av.fio.sendConfig = function(av) {
  'use strict';
  av.fio.dxdb.open();
  var idStr = 'ws/cwd';
  var em = true;
  makeFzrAvidaCfg(av.fio, idStr, em);
  makeFzrEnvironmentCfg(av.fio, idStr, em);
  makeEmDxFile(av.fio, idStr+'/events.cfg', '');
  //makeFzrInstsetCfg(av.fio, idStr, em);
  av.fio.dxdb.close();
}

function makeFzrConfig(fzr, num, parents) {
  'use strict';
  var em = false;
  makeFzrAvidaCfg(fzr, 'c'+num, em);
  makeFzrEnvironmentCfg(fzr, 'c'+num, em);
  makeFzrFile(fzr, 'c'+num+'/events.cfg', '');
  makeFzrFile(fzr, 'c'+num+'/entryname.txt', fzr.config[ndx].name);
  makeFzrInstsetCfg(fzr, 'c'+num);
  //need ancestor files still tiba
}

function makeFzrWorld(fzr, fio, grd, parents) {
  'use strict';
  var ndx = fzr.config.length-1;  //write the last one created
  makeFzrAvidaCfg(fzr, fzr.world[ndx]._id);
  makeFzrEnvironmentCfg(fzr, fzr.world[ndx]._id);
  makeFzrWorldEventsCfg(fzr, fzr.world[ndx]._id);
  makeFzrFile(fzr, fzr.world[ndx]._id+'/entryname.txt', fzr.world[ndx].name);
  makeFzrInstsetCfg(fzr, fzr.world[ndx]._id);

  makeFzrFile(fzr, fzr.world[ndx]._id+'/update', grd.updateNum);
  //there are more files need to talk to Matt, tiba
}

function makeFzrOrgan(fzr) {
  'use strict';
  var ndx = fzr.genome.length-1;  //write the last one created
  makeEmDxFile(fzr, fzr.genome[ndx]._id+'/entryname.txt', fzr.genome[ndx].name);
  makeEmDxFile(fzr, fzr.genome[ndx]._id+'/genome.seq', fzr.genome[ndx].genome);
}

function removeFzrConfig(fzr, strId) {
  'use strict';
  deleteFzrFile(fzr, strId+'/ancestors');
  deleteFzrFile(fzr, strId+'/ancestors_manual');
  deleteFzrFile(fzr, strId+'/avida.cfg');
  deleteFzrFile(fzr, strId+'/environment.cfg');
  deleteFzrFile(fzr, strId+'/events.cfg');
  deleteFzrFile(fzr, strId+'/entryname.txt');
  deleteFzrFile(fzr, strId+'/instset.cfg');
}

function removeFzrGenome(fzr, strId) {
  'use strict';
  deleteFzrFile(fzr, strId+'/entryname.txt');
  deleteFzrFile(fzr, strId+'/genome.seq');
}

function removeFzrWorld(fzr, strId) {
  'use strict';
  deleteFzrFile(fzr, strId+'/ancestors');
  deleteFzrFile(fzr, strId+'/ancestors_manual');
  deleteFzrFile(fzr, strId+'/avida.cfg');
  deleteFzrFile(fzr, strId+'/environment.cfg');
  deleteFzrFile(fzr, strId+'/events.cfg');
  deleteFzrFile(fzr, strId+'/entryname.txt');
  deleteFzrFile(fzr, strId+'/instset.cfg');
  deleteFzrFile(fzr, strId+'/update');
  //deleteFzrFile(fzr, strId+'/');
  //deleteFzrFile(fzr, strId+'/');
}

function removeFzrItem(fzr, strId, type){
  'use strict';
  switch (type){
    case 'c':
      removeFzrConfig(fzr, strId);
      break;
    case 'g':
      removeFzrGenome(fzr, strId);
      break;
    case 'w':
      removeFzrWorld(fzr, strId);
      break;
  }
}
/* PouchDB websites
 http://pouchdb.com/api.html#database_information
 https://github.com/webinista/PouchNotes
 http://pouchdb.com/guides/databases.html
 */