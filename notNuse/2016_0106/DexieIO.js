//need to write string to be the data 'file' to put in pouchDB

function deletePdbFile(fio, fileId) {
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

function makePdbFile(fio, fileId, text) {
  'use strict';
  var ifile = {
    _id: fileId,
    contents: text
  };
  fio.wsdb.get(fileId).then(function (doc) {
    ifile._rev = doc._rev;
    if (av.debug.pdb) console.log('get entryName doc already exists, ok update', doc);
    fio.wsdb.put(ifile).then(function (response) {if (av.debug.pdb) console.log('ok correct', response); // handle response to put
    }).catch(function (err) {console.log('put err', err);
    });
  }).catch(function (err) {
    fio.wsdb.put(ifile).then(function (response) {if (av.debug.pdb) console.log('ok correct', response); // handle response to put
    }).catch(function (err) {console.log('put err', err);
    });
  });
}

function makePdbNullFile(fio, idStr){
  'use strict';
  fio.wsdb.get(idStr).then(function (doc) {
    if (av.debug.pdb) console.log('get events doc, ok no reason to update', doc);  //always empty so no reason to update
  }).catch(function (err) {
    if (av.debug.pdb) console.log('get events.cfg not really an err, just not already there', err);  //does not exist, so create.
    fio.wsdb.put({
      _id: idStr,
      text: ''
    }).then(function (response) {// handle response to put
    }).catch(function (err) {console.log('put err', err);
    });
  });
}

// copy instruction set from default config.
function makePdbInstsetCfg(fio, idStr) {
  'use strict';
  var ifile = {_id: idStr + '/instset.cfg'};
  fio.wsdb.get('c0/instset.cfg').then(function (instsetDoc) {
    //console.log('instset doc.text', instsetDoc.text);
    ifile.contents = instsetDoc.contents;
    return fio.wsdb.get(ifile._id).then(function (doc) {
      ifile._rev = doc._rev;
      if (av.debug.pdb) console.log('get avida doc already exists, ok update', doc);
      fio.wsdb.put(ifile).then(function (response) {
        if (av.debug.pdb) console.log('ok correct', response); // handle response to put
      }).catch(function (err) {
        console.log('put err', err);
      });
    }).catch(function (err) {
      if (av.debug.pdb) console.log('get avida err', err);  //not really an error, just not already there.
      fio.wsdb.put(ifile).then(function (response) {
        if (av.debug.pdb) console.log('ok correct', response); // handle response to put
      }).catch(function (err) {
        console.log('put err', err);
      });
    });
  });
}

function makePdbWorldEventsCfg(fio, idStr, em) {
  'use strict';
  var txt = 'u begin LoadPopulation detail.spop' + '\n';
  txt += 'u begin LoadStructuredSystematicsGroup role=clade:filename=clade.ssg';
  if (em) {makeEmDxFile(fio, idStr+'/events.cfg', txt);}
  else {makePdbFile(fio, idStr+'/events.cfg', txt);}
}

function makePdbAvidaCfg(fio, idStr, em) {
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
  if (em) {makeEmDxFile(fio, idStr+'/avida.cfg', txt);}
  else {makePdbFile(fio, idStr+'/avida.cfg', txt);}
}

function makePdbEnvironmentCfg(fio, idStr, em) {
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
  if (em) {makeEmDxFile(fio, idStr+'/environment.cfg', txt);}
  else  { makePdbFile(fio, idStr+'/environment.cfg', txt);}

}

function makePdbAncestor(fio, idStr) {
  'use strict';
}

av.fio.sendConfig = function(av) {
  'use strict';
  av.fio.dxdb.open();
  var idStr = 'ws/cwd';
  var em = true;
  makePdbAvidaCfg(av.fio, idStr, em);
  makePdbEnvironmentCfg(av.fio, idStr, em);
  makeEmDxFile(av.fio, idStr+'/events.cfg', '');
  //makePdbNullFile(av.fio, idStr+'/events.cfg', em);
  //makePdbInstsetCfg(av.fio, idStr, em);
  av.fio.dxdb.close();
}

function makePdbConfig(fzr, fio, parents) {
  'use strict';
  var em = false;
  var ndx = fzr.config.length-1;  //write the last one created
  if (av.debug.pdb) console.log('wsdb', fio.wsdb);
  makePdbAvidaCfg(fio, fzr.config[ndx]._id, em);
  makePdbEnvironmentCfg(fio, fzr.config[ndx]._id, em);
  makeEmDxFile(fio, fzr.config[ndx]._id+'/events.cfg', '');
  makeEmDxFile(fio, fzr.config[ndx]._id+'/entryname.txt', fzr.config[ndx].name);
  //makePdbInstsetCfg(fio, fzr.config[ndx]._id);
  //need ancestor files still tiba
}

function makePdbWorld(fzr, fio, grd, parents) {
  'use strict';
  var ndx = fzr.config.length-1;  //write the last one created
  makePdbAvidaCfg(fio, fzr.world[ndx]._id);
  makePdbEnvironmentCfg(fio, fzr.world[ndx]._id);
  makePdbWorldEventsCfg(fio, fzr.world[ndx]._id);
  makePdbFile(fio, fzr.world[ndx]._id+'/entryname.txt', fzr.world[ndx].name);
  makePdbInstsetCfg(fio, fzr.world[ndx]._id);

  makePdbFile(fio, fzr.world[ndx]._id+'/update', grd.updateNum);
  //there are more files need to talk to Matt, tiba
}

function makePdbOrgan(fio, fzr) {
  'use strict';
  var ndx = fzr.genome.length-1;  //write the last one created
  makeEmDxFile(fio, fzr.genome[ndx]._id+'/entryname.txt', fzr.genome[ndx].name);
  makeEmDxFile(fio, fzr.genome[ndx]._id+'/genome.seq', fzr.genome[ndx].genome);
}

function removePdbConfig(fio, strId) {
  'use strict';
  deletePdbFile(fio, strId+'/ancestors');
  deletePdbFile(fio, strId+'/ancestors_manual');
  deletePdbFile(fio, strId+'/avida.cfg');
  deletePdbFile(fio, strId+'/environment.cfg');
  deletePdbFile(fio, strId+'/events.cfg');
  deletePdbFile(fio, strId+'/entryname.txt');
  deletePdbFile(fio, strId+'/instset.cfg');
}

function removePdbGenome(fio, strId) {
  'use strict';
  deletePdbFile(fio, strId+'/entryname.txt');
  deletePdbFile(fio, strId+'/genome.seq');
}

function removePdbWorld(fio, strId) {
  'use strict';
  deletePdbFile(fio, strId+'/ancestors');
  deletePdbFile(fio, strId+'/ancestors_manual');
  deletePdbFile(fio, strId+'/avida.cfg');
  deletePdbFile(fio, strId+'/environment.cfg');
  deletePdbFile(fio, strId+'/events.cfg');
  deletePdbFile(fio, strId+'/entryname.txt');
  deletePdbFile(fio, strId+'/instset.cfg');
  deletePdbFile(fio, strId+'/update');
  //deletePdbFile(fio, strId+'/');
  //deletePdbFile(fio, strId+'/');
}

function removePdbItem(fio, strId, type){
  'use strict';
  switch (type){
    case 'c':
      removePdbConfig(fio, strId);
      break;
    case 'g':
      removePdbGenome(fio, strId);
      break;
    case 'w':
      removePdbWorld(fio, strId);
      break;
  }
}
/* PouchDB websites
 http://pouchdb.com/api.html#database_information
 https://github.com/webinista/PouchNotes
 http://pouchdb.com/guides/databases.html
 */
