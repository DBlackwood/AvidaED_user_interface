//global definitions based dom that involve DND

//functions used to process events that happen when a dojo drag and drop lands on the particular dnd 'target'.
//Note that all dnd 'source' elements can also be 'targets'.

//http://stackoverflow.com/questions/1134572/dojo-is-there-an-event-after-drag-drop-finished
//Puts the contents of the source in a object (list) called items.
av.dnd.getAllItems = function (source) {
  'use strict';
  var items = source.getAllNodes().map(function (node) {
    return source.getItem(node.id);
  });
  return items;
}

av.dnd.getUniqueName = function(name, target) {
  'use strict';
  var namelist = dojo.query('> .dojoDndItem', target.node.id);
  var unique = true;
  var lngth = namelist.length;
  while (unique) {
    unique = false;
    for (var ii = 0; ii < lngth;  ii++) {
      //if (av.debug.dnd) console.log ("name ", namelist[ii].innerHTML);
      if (name == namelist[ii].textContent) {
        name = prompt("Please give your item a unique name ", name + "_1")
        unique = true;
      }
    }
  }
  return name;
};

av.dnd.getDomId = function (name, target){
  'use strict';
  //Now find which node has the new content so it can get a context menu.
  var domItems = Object.keys(target.map);
  var nodeIndex = -1;
  var lngth = domItems.length;
  for (var ii = 0; ii < lngth; ii++) {
    if (target.map[domItems[ii]].data == name) {
      nodeIndex = ii;
      break;
    }
  }
  return domItems[nodeIndex];
};


//----------------------------------------------- Configuration DnD ----------------------------------------------------
//Need to have only the most recent dropped configuration in configCurrent. Do this by deleting everything in configCurrent
//and reinserting the most resent one after a drop event.

av.dnd.landActiveConfig = function (pkg) {
  'use strict';
  av.debug.log += '\nDnD: ' + pkg.source.node.id + '--> ' + pkg.target.node.id + ': by: ' + pkg.nodes[0].textContent;
  var ndx = -1;
  var klen = 0;
  var kk = 0;
  var str = '';
  var dir = '';
  //there is always a node here, so it must always be cleared when adding a new one.
  av.dnd.activeConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.activeConfig.sync();   //should be done after insertion or deletion
  //delete av.fzr.dir[av.fzr.domid.dfg];     //delete the associated item in the domid dictionary
  //get the data for the new configuration
  pkg.source.forInSelectedItems(function (item, id) { //assign the node that is selected from the source.
    av.dnd.activeConfig.insertNodes(false, [item]);
  });
  var domid = Object.keys(av.dnd.activeConfig.map)[0];
  pkg.target.map[domid].type[0] = 'b';
  av.dnd.activeConfig.sync();

  av.fzr.actConfig.actDomid = domid;
  av.fzr.actConfig.name = document.getElementById(domid).textContent;
  //console.log('New Config:', av.fzr.actConfig.name);
  av.fzr.actConfig.fzDomid = Object.keys(pkg.source.selection)[0];
  av.fzr.actConfig.dir = av.fzr.dir[av.fzr.actConfig.fzDomid];
  delete av.fzr.actConfig.file['instset.cfg'];
  if (av.fzr.file[av.fzr.actConfig.dir + '/instset.cfg']) {
    av.fzr.actConfig.file['instset.cfg'] = av.fzr.file[av.fzr.actConfig.dir + '/instset.cfg'];
  }
  av.parents.clearParentsFn();
  av.frd.updateSetup();  //fileIO
  if ('fzConfig' === pkg.source.node.id) {
    av.fzr.actConfig.type = 'c';
    av.fzr.actConfig.file['events.cfg'] = ' ';
    if (av.fzr.actConfig.file['clade.ssg']) {delete av.fzr.actConfig.file['clade.ssg'];}
    if (av.fzr.actConfig.file['detail.spop']) {delete av.fzr.actConfig.file['detail.spop'];}
    if (av.fzr.actConfig.file['update']) {delete av.fzr.actConfig.file['update'];}
    if (av.fzr.file[av.fzr.actConfig.dir + '/ancestors']) {
      str = av.fzr.file[av.fzr.actConfig.dir + '/ancestors'];
      av.fio.autoAncestorLoad(str);
    }
    if (av.fzr.file[av.fzr.actConfig.dir + '/ancestors_manual']) {
      str = av.fzr.file[av.fzr.actConfig.dir + '/ancestors_manual'];
      av.fio.handAncestorLoad(str);
    }
    if ('map' == av.ui.subpage) {av.grd.drawGridSetupFn();} //draw grid
  }
  else if ('fzWorld' === pkg.source.node.id) {
    av.fzr.actConfig.type = 'w';
    av.fzr.actConfig.file['avida.cfg'] = av.fzr.file[av.fzr.actConfig.dir + '/avida.cfg'];
    av.fzr.actConfig.file['clade.ssg'] = av.fzr.file[av.fzr.actConfig.dir + '/clade.ssg'];
    av.fzr.actConfig.file['detail.spop'] = av.fzr.file[av.fzr.actConfig.dir + '/detail.spop'];
    av.fzr.actConfig.file['environment.cfg'] = av.fzr.file[av.fzr.actConfig.dir + '/environment.cfg'];
    av.fzr.actConfig.file['events.cfg'] = av.fzr.file[av.fzr.actConfig.dir + '/events.cfg'];
    av.fzr.actConfig.file['update'] = av.fzr.file[av.fzr.actConfig.dir + '/update'];
    av.grd.oldUpdate = av.fzr.actConfig.file['update'];
    TimeLabel.textContent = av.grd.oldUpdate;

    //load parents from clade.ssg and ancestors.
    av.fio.cladeSSG2parents(av.fzr.file[av.fzr.actConfig.dir + '/clade.ssg']);
    var handList = av.fio.handAncestorParse(av.fzr.file[av.fzr.actConfig.dir + '/ancestors_manual']);
    var autoList = av.fio.autoAncestorParse(av.fzr.file[av.fzr.actConfig.dir + '/ancestors']);
    var ndx = 0;
    klen = av.parents.name.length;
    for (kk = 0; kk <  klen; kk++) {
      ndx = autoList.nam.indexOf(av.parents.name[kk]);
      if (-1 < ndx) {
        av.parents.genome[kk] = autoList.gen[ndx];
        av.parents.howPlaced[kk] = 'auto';
        av.parents.autoNdx.push(kk);
        autoList.nam.splice(ndx,1);
        autoList.gen.splice(ndx,1);
      }
      else {
        ndx = handList.nam.indexOf(av.parents.name[kk]);
        if (-1 < ndx) {
          av.parents.genome[kk] = handList.gen[ndx];
          av.parents.col[kk] = handList.col[ndx];
          av.parents.row[kk] = handList.row[ndx];
          av.parents.howPlaced[kk] = 'hand';
          av.parents.handNdx.push(kk);
          handList.nam.splice(ndx,1);
          handList.gen.splice(ndx,1);
          handList.col.splice(ndx,1);
          handList.row.splice(ndx,1);
        }
        else {console.log('Name, ', av.parents.name[kk], ', not found');}
      }
    }
    av.parents.placeAncestors();
    //run status is no longer 'new' it is "world"
    av.ptd.popWorldStateUi();

    //Load Time Recorder Data.
    dir = av.fzr.actConfig.dir;
    av.ptd.aveFit = av.fio.tr2chart(av.fzr.file[dir + '/tr0']);
    av.ptd.aveGnl = av.fio.tr2chart(av.fzr.file[dir + '/tr1']);
    av.ptd.aveMet = av.fio.tr2chart(av.fzr.file[dir + '/tr2']);
    av.ptd.aveNum = av.fio.tr2chart(av.fzr.file[dir + '/tr3']);
    var lngth = av.ptd.aveFit.length;
    av.ptd.logFit = av.utl.newFilledArray(lngth, null);
    av.ptd.logGnl = av.utl.newFilledArray(lngth, null);
    av.ptd.logMet = av.utl.newFilledArray(lngth, null);
    av.ptd.logNum = av.utl.newFilledArray(lngth, null);
    //console.log('tr length=', av.ptd.aveFit.length, '; update=', av.fzr.actConfig.file['update'], '; oldUpdate=', av.grd.oldUpdate);
    //console.log('aveFit', av.ptd.aveFit);
    //console.log('aveGnl', av.ptd.aveGnl);
    //console.log('aveMet', av.ptd.aveMet);
    //console.log('aveNum', av.ptd.aveNum);

    //send message to Avida
    av.msg.importPopExpr();
    av.msg.requestGridData();
    av.msg.sendData();
    //av.msg.requestPopStats();  //tiba last time this was on; data was all = 0, so confusing;
  }
}

//Process when an Configuration is added to the Freezer
av.dnd.landFzConfig = function (source, nodes, target) {
  'use strict';
  if (av.debug.dnd) console.log('av.dnd.landFzConfig: fzr', av.fzr);
  var domid = Object.keys(target.selection)[0];
  var oldName = nodes[0].textContent;
  var dishCon = prompt("Please name your dish configuration", oldName + "_1");
  if (dishCon) {
    var configName = av.dnd.getUniqueName(dishCon, target);
    if (null != configName) {
      av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent + '; --> ' + configName;
      document.getElementById(domid).textContent = configName;
      target.map[domid].data = configName;
      if (av.debug.dnd) console.log('data', target.map[domid].data, target.map[domid]);
      if (av.debug.dnd) console.log('type', target.map[domid].type[0]);

      //Now find which node has the new content so it can get a context menu.
      var domID = av.dnd.getDomId(configName, target);
      target.map[domid].type[0] = 'c';
      av.fzr.dir[domID] = 'c'+ av.fzr.cNum;
      av.fzr.domid['c'+ av.fzr.cNum] = domID;
      av.fzr.file[av.fzr.dir[domID]+'/entryname.txt'] = configName;
      av.fzr.cNum++;

      //create a right av.mouse-click context menu for the item just created.
      av.dnd.contextMenu(target, domID);
      av.fzr.saved = false;
      if (av.debug.dnd) console.log('dir', av.fzr.dir[domID], '; configName', configName );
    }
    else {  //user cancelled so the item should NOT be added to the freezer.
      av.dnd.fzConfig.deleteSelectedNodes();  //clear items
      av.dnd.fzConfig.sync();   //should be done after insertion or deletion
    }
  }
  else {  //user cancelled so the item should NOT be added to the freezer.
    av.dnd.fzConfig.deleteSelectedNodes();  //clear items
    av.dnd.fzConfig.sync();   //should be done after insertion or deletion
  }
}

//----------------------------------------------------Organsim dnd------------------------------------------------------
//When something is added to the Organism Freezer ------------------
av.dnd.landFzOrgan = function (source, nodes, target) {
  'use strict';
  var gen;
  var domid = Object.keys(target.selection)[0];
  if (av.debug.dnd) console.log('domid', domid);
  var avidian = prompt("Please name your avidian", document.getElementById(domid).textContent + "_1");
  if (avidian) {
    var avName = av.dnd.getUniqueName(avidian, target);
    if (null != avName) {  //give dom item new avName name
      av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent + '; --> ' + avName;
      document.getElementById(domid).textContent = avName;
      target.map[domid].data = avName;

      if ('ancestorBox' == source.node.id && false === av.dnd.ancestorBox.copyOnly) {  //do not remove if population has started running
        //update structure to hold freezer data for Organisms.
        var Ndx = av.parents.domid.indexOf(nodes[0].id);  //Find index into parent structure
        gen = av.parents.genome[Ndx];

        // need to remove organism from parents list.
        av.parents.removeParent(Ndx);
        av.parents.placeAncestors();

        // need to remove organism from the Ancestor Box.
        // av.dnd.ancestorBox is dojo dnd copyonly to prevent loss of that organsim when the user clicks cancel. The user will
        // see the cancel as cancelling the dnd rather than canceling the rename.
        av.dnd.ancestorBox.deleteSelectedNodes();  //clear items
        av.dnd.ancestorBox.sync();   //should be done after insertion or deletion
      }
      else if ('activeOrgan' === source.node.id) { gen = av.fzr.actOrgan.genome; }
      av.fzr.dir[domid] = 'g' + av.fzr.gNum;
      av.fzr.domid['g' + av.fzr.gNum] = domid;
      av.fzr.file['g' + av.fzr.gNum + '/genome.seq'] = gen;
      av.fzr.file['g' + av.fzr.gNum + '/entryname.txt'] = av.dnd.fzOrgan.map[domid].data;
      av.fzr.gNum++;
      if (av.debug.dnd) console.log('fzr', av.fzr);

      if (av.debug.dnd) console.log('fzOrgan', av.dnd.fzOrgan);
      //create a right av.mouse-click context menu for the item just created.
      if (av.debug.dnd) console.log('before context menu: target',target, '; domId', domid );
      av.dnd.contextMenu(target, domid);
      av.fzr.saved = false;
    }
    else { //Not given a name, so it should NOT be added to the freezer.
      av.dnd.fzOrgan.deleteSelectedNodes();  //clear items
      av.dnd.fzOrgan.sync();   //should be done after insertion or deletion
    }
  }
  else {  //cancelled so the item should NOT be added to the freezer.
    av.dnd.fzOrgan.deleteSelectedNodes();  //clear items
    av.dnd.fzOrgan.sync();   //should be done after insertion or deletion
  }
  if (av.debug.dnd) console.log('near end of av.dnd.landFzOrgan');
  if ('ancestorBox' != source.node.id) {
    if (av.debug.dnd) console.log('dojo dnd to Organ Freezer, not from Ancestor Box');
  }
  if (av.debug.dnd) console.log('End of av.dnd.landFzOrgan');
}

av.dnd.landAncestorBox = function (source, nodes, target) {
  'use strict';
  //Do not copy parents if one is moved within Ancestor Box
  if ('ancestorBox' != source.node.id) {
    av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
    //find genome by finding source
    var domId = Object.keys(source.selection)[0];
    var dir = av.fzr.dir[domId];
    av.parents.genome.push(av.fzr.file[dir+'/genome.seq']);
    var nn = av.parents.name.length;
    av.parents.autoNdx.push(nn);
    av.parents.name.push(nodes[0].textContent);
    av.parents.howPlaced.push('auto');
    av.parents.domid.push(Object.keys(target.selection)[0]); //domid in ancestorBox used to remove if square in grid moved to trashcan
    //Find color of ancestor
    if (0 < av.parents.Colors.length) { av.parents.color.push(av.parents.Colors.pop());}
    else { av.parents.color.push(av.color.defaultParentColor) }
    av.parents.placeAncestors();
    if (av.debug.dnd) console.log('parents', av.parents.name[nn], av.parents.domid[nn], av.parents.genome[nn]);
  }
};

// Process Drop on gridCanvas
//This triggers for every dnd drop, not just those of gridCanvas
av.dnd.landGridCanvas = function (source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  if (av.debug.dnd) console.log('inside gridCanvas dnd');
  if (av.debug.dnd) console.log('parents', av.parents);

  //was it dropped on the grid of cells?
  //if (av.debug.dnd) console.log('xOff, yOff, xUP, y', av.grd.xOffset, av.grd.yOffset, av.mouse.UpGridPos[0];, av.mouse.UpGridPos[1];);
  //calculated grid cell to see if it was a valid grid position.
  var nn = av.parents.name.length;
  var mouseX = av.mouse.UpGridPos[0] - av.grd.marginX - av.grd.xOffset;
  var mouseY = av.mouse.UpGridPos[1] - av.grd.marginY - av.grd.yOffset;
  if (av.debug.dnd) console.log('mouse.UpGridPosX, y', av.mouse.UpGridPos[0], av.mouse.UpGridPos[1]);
  if (av.debug.dnd) console.log('mouseX, y', mouseX, mouseY);
  av.parents.col[nn] = Math.floor(mouseX / av.grd.cellWd);
  av.parents.row[nn] = Math.floor(mouseY / av.grd.cellHt);
  //check to see if in the grid part of the canvas
  if (av.parents.col[nn] >= 0 && av.parents.col[nn] < av.grd.cols && av.parents.row[nn] >= 0 && av.parents.row[nn] < av.grd.rows) {
    av.parents.AvidaNdx[nn] = av.parents.row[nn] * av.grd.cols + av.parents.col[nn];
    //Add organism to av.dnd.ancestorBox in settings.
    av.dnd.fzOrgan.forInSelectedItems(function (item, id) {
      if (av.debug.dnd) console.log('selected: item', item, '; id', id);
      av.dnd.ancestorBox.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
      if (av.debug.dnd) console.log('av.dnd.gridCanvas.map', av.dnd.gridCanvas.map);
      if (av.debug.dnd) console.log('av.dnd.ancestorBox.map', av.dnd.ancestorBox.map);
    });
    // need to find the domid of the ancestor in ancestorBox. The line below is not correct. ???? !!!!! tiba
    var domIDs = Object.keys(av.dnd.ancestorBox.map);
    av.parents.domid.push(domIDs[domIDs.length-1]);

    //update parents structure
    nn = av.parents.name.length;
    av.parents.handNdx.push(nn);
    av.parents.howPlaced[nn] = 'hand';
    av.parents.name[nn] = nodes[0].textContent;
    var domId = Object.keys(source.selection)[0];
    if (av.debug.dnd) console.log('av.dnd.landGridCanvas; domId', domId, '; av.fzr.genome', av.fzr.genome);
    var dir = av.fzr.dir[domId];
    av.parents.genome.push(av.fzr.file[dir+'/genome.seq']);
    //find domId of parent as listed in av.dnd.ancestorBox

    //Don't think I need domID withing ancestorBox
    //var mapItems = Object.keys(av.dnd.ancestorBox.map);
    //av.parents.domid.push(mapItems[mapItems.length - 1]);

    //Find color of ancestor
    if (0 < av.parents.Colors.length) {av.parents.color.push(av.parents.Colors.pop());}
    else {av.parents.color.push(av.color.defaultParentColor);}
    //if (av.debug.dnd) console.log('after', av.parents)
    //Re-Draw Grid - done in routine that calls this one.
  }
  //In all cases remove the ancestor from the gridCanvas so we only keep them in the av.dnd.ancestorBox.
  av.dnd.gridCanvas.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  av.dnd.gridCanvas.sync();
  if (av.debug.dnd) console.log("parents", av.parents);
}

av.dnd.updateFromFzrOrganism = function () {
  'use strict';
  var domId = Object.keys(av.dnd.fzOrgan.selection)[0];
  var dir = av.fzr.dir[domId];
  if (av.debug.dnd) console.log('domId', domId, '; dir', dir);
  av.fzr.actOrgan.name = av.fzr.file[dir+'/entryname.txt'];
  av.fzr.actOrgan.genome = av.fzr.file[dir+'/genome.seq'];
  if (av.debug.dnd) console.log('domId', domId);
  if (av.debug.dnd) console.log('domId', domId, '; dir', dir, '; name', av.fzr.actOrgan.name, '; genome', av.fzr.actOrgan.genome);
  if (av.debug.dnd) console.log('fzr', av.fzr);

  if (av.debug.dnd) console.log('av.fzr.actOrgan', av.fzr.actOrgan);
}

av.dnd.landOrganIcon = function (source, nodes, target) {
  //clear out the old data if an organism is already there
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  if (av.debug.dnd) console.log('source', source.node.id);
  if ('activeOrgan' != source.node.id) {
    var items = av.dnd.getAllItems(av.dnd.activeOrgan);    //gets some data about the items in the container
    if (0 < items.length) {
      av.dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
      av.dnd.activeOrgan.sync();   //should be done after insertion or deletion
    }
    //get the data for the new organism
    source.forInSelectedItems(function (item, id) {
      av.dnd.activeOrgan.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
      av.dnd.activeOrgan.sync();
    });
  }
  if ('fzOrgan' === source.node.id) { av.dnd.updateFromFzrOrganism(); }
  else if ('ancestorBox' === source.node.id) {
    var domid = Object.keys(av.dnd.ancestorBox.selection)[0];
    var Ndx = av.parents.domid.indexOf(domid);  //Find index into parent structure
    av.fzr.actOrgan.name = av.parents.name[Ndx];
    av.fzr.actOrgan.genome = av.parents.genome[Ndx];
    if (av.debug.dnd) console.log('fzr', av.fzr, '; parents', av.parents, '; ndx', Ndx);
  }

  //clear out av.dnd.organIcon as nothing is stored there - just moved on to OrganismCurrent
  av.dnd.organIcon.selectAll().deleteSelectedNodes();  //clear items
  av.dnd.organIcon.sync();   //should be done after insertion or deletion
}

//Need to have only the most recent dropped organism in av.dnd.activeOrgan. Do this by deleting everything in activeOrgan
//and reinserting the most resent one after a drop event.
av.dnd.landActiveOrgan = function (source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  //clear out the old data if an organism is already there
  var items = av.dnd.getAllItems(av.dnd.activeOrgan);    //used to see if there is more than one item in Organ Current
  //if (av.debug.dnd) console.log('items', items, items.length);
  if (0 < items.length) {
    av.dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
    av.dnd.activeOrgan.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    av.dnd.fzOrgan.forInSelectedItems(function (item, id) {
      av.dnd.activeOrgan.insertNodes(false, [item]);          //assign the node that is selected from the only valid pkg.source.
      av.dnd.activeOrgan.sync();
    });
    //if (av.debug.dnd) console.log("av.dnd.activeOrgan.map=", av.dnd.activeOrgan.map);
  }
  av.dnd.updateFromFzrOrganism();
}

//The variable OrganCanvas with the html tag organismCanvas will Not hold the organism. Anything dropped on the OrganismCanvas
//will be put in av.dnd.activeOrgan.
av.dnd.landOrganCanvas = function (source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  //Clear current to put the new organism in there.
  av.dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  av.dnd.activeOrgan.sync();   //should be done after insertion or deletion

  //Clear canvas because we only store the 'Mom' in the OrganCurrentNode
  var ItemID = Object.keys(av.dnd.activeOrgan.map)[0];
  av.dnd.organCanvas.selectAll().deleteSelectedNodes();  //clear items
  av.dnd.organCanvas.sync();   //should be done after insertion or deletion
  dojo.destroy(ItemID);

  //get the data for the new organism
  av.dnd.fzOrgan.forInSelectedItems(function (item, id) {
    av.dnd.activeOrgan.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
  });
  av.dnd.activeOrgan.sync();

  if ('fzOrgan' == source.node.id) av.dnd.updateFromFzrOrganism();
}

//------------------------------------------------- Populated Dishes DND -----------------------------------------------
//Process when an World is added to the Freezer
av.dnd.landFzWorldFn = function (pkg) {//source, pkg.nodes, pkg.target) {
  'use strict';
  if (av.debug.dnd) console.log('landFzPopDish: fzr', av.fzr);
  var domid = Object.keys(pkg.target.selection)[0];
  var worldName = prompt("Please name your populated dish", pkg.nodes[0].textContent + "_1");
  if (worldName) {
    var WorldName = av.dnd.getUniqueName(worldName, pkg.target);
    if (null != WorldName) {
      av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent + ' --> ' + WorldName;
      document.getElementById(domid).textContent = WorldName;
      pkg.target.map[domid].data = WorldName;

      //Now find which node has the new content so it can get a context menu.
      var domID = av.dnd.getDomId(WorldName, pkg.target);
      av.fzr.dir[domID] = 'w'+ av.fzr.wNum;
      av.fzr.domid['w'+ av.fzr.wNum] = domID;
      av.fzr.wNum++;

      //create a right av.mouse-click context menu for the item just created.
      av.dnd.contextMenu(pkg.target, domID);
      av.fzr.saved = false;
    }
    else {  //user cancelled so the item should NOT be added to the freezer.
      av.dnd.fzWorld.deleteSelectedpkg.nodes();  //clear items
      av.dnd.fzWorld.sync();   //should be done after insertion or deletion
    }
  }
  else {  //user cancelled so the item should NOT be added to the freezer.
    av.dnd.fzWorld.deleteSelectedpkg.nodes();  //clear items
    av.dnd.fzWorld.sync();   //should be done after insertion or deletion
  }
};

    //ways to get information about the Dnd containers
    //console.log("pkg.nodes[0].id, pkg.target.node.id = ", pkg.nodes[0].id, pkg.target.node.id);
    //console.log(Object.keys(pkg.target.selection)[0]);
    //console.log("map: ", pkg.target.map);
    //console.log("id: ", pkg.target.node.id);
    //console.log("textContent: ", pkg.nodes[0].textContent);
    //console.log("pkg.nodes[0].id: ", pkg.nodes[0].id);
    //console.log("pkg.target.selection: ",pkg.target.selection);
    //console.log("pkg.target.selection: ",Object.keys(pkg.target.selection)[0]);
    //console.log(document.getElementById(Object.keys(pkg.target.selection)[0]).innerHTML)
    //console.log("allnodes: ",pkg.target.getAllNodes());

// Process av.dnd.trashCan ---------------------------------------------------
av.dnd.landTrashCan = function (source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  var remove = {};
  remove.type = '';
  remove.domid = '';
  if (av.debug.dnd) console.log('in av.dnd.landTrashCan');
  //if the item is from the freezer, delete from freezer unless it is original stock (@)
  if ('fzOrgan' == source.node.id && '@ancestor' != nodes[0].textContent) {
    if (av.debug.dnd) {console.log('fzOrgan->trash', av.fzr.genome);}
    remove.domid = Object.keys(av.dnd.fzOrgan.selection)[0];
    remove.type = 'g';
    if (av.debug.dnd) console.log('fzOrgan->trash; nodes[0]',nodes[0]);
    if (av.debug.dnd) console.log('fzOrgan->trash; source.parent',source.parent);
    source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
  }
  else if ('fzConfig' == source.node.id && '@default' != nodes[0].textContent) {
    remove.domid = Object.keys(av.dnd.fzConfig.selection)[0];
    remove.type = 'c';
    source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
  }
  else if ('fzWorld' == source.node.id && '@example' != nodes[0].textContent) {
    remove.domid = Object.keys(av.dnd.fzWorld.selection)[0];
    remove.type = 'w';
    source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
  }
  // items from ancestor box require ancestor (parent) handling.
  else if ('ancestorBox' == source.node.id) {
    //find index into parents
    if (av.debug.dnd) console.log('ancestorBox->trash; source', source.map);
    //Find index into parent structure
    var Ndx = av.parents.domid.indexOf(nodes[0].id);
    if (av.debug.dnd) console.log('ancestorBox->trash, nodes[0].id', nodes[0].id);
    if (av.debug.dnd) console.log('ancestorBox->trash, av.parents', av.parents.domid[0]);

    if (av.debug.dnd) console.log('ancestorBox->trash; nodeId', nodes[0].id, '; Ndx', Ndx, '; av.parents.domid', av.parents.domid);
    av.parents.removeParent(Ndx);
    av.parents.placeAncestors();
    if (av.debug.dnd) console.log('ancestorBox->trash, av.parents', av.parents);
  }
  av.dnd.trashCan.selectAll().deleteSelectedNodes();  //in all cases, empty the av.dnd.trashCan
  return remove;
};

//--------------------------------------------------------------------------------------------------------------------//
//          DND Analysis page
//--------------------------------------------------------------------------------------------------------------------//

av.anl.loadWorldData = function (worldNum, dir) {
  av.fzr.pop[worldNum].fit = av.fio.tr2chart(av.fzr.file[dir + '/tr0']);
  av.fzr.pop[worldNum].ges = av.fio.tr2chart(av.fzr.file[dir + '/tr1']);
  av.fzr.pop[worldNum].met = av.fio.tr2chart(av.fzr.file[dir + '/tr2']);
  av.fzr.pop[worldNum].num = av.fio.tr2chart(av.fzr.file[dir + '/tr3']);
};

av.anl.clearWorldData = function (worldNum){
  'use strict';
  av.fzr.pop[worldNum].fit = [];
  av.fzr.pop[worldNum].ges = [];
  av.fzr.pop[worldNum].met = [];
  av.fzr.pop[worldNum].num = [];
}

av.anl.loadSelectedData = function (worldNum, axisSide, side) {
  'use strict';
  switch(dijit.byId(axisSide).value) {
    case 'None':
      av.anl.pop[worldNum][side] = [];
      break;
    case 'Average Fitness':
      av.anl.pop[worldNum][side] = av.fzr.pop[worldNum].fit;
      break;
    case 'Average Generation Length':
      av.anl.pop[worldNum][side] = av.fzr.pop[worldNum].ges;
      break;
    case 'Average Metabolic Rate':
      av.anl.pop[worldNum][side] = av.fzr.pop[worldNum].met;
      break;
    case 'Number of Organisms':
      av.anl.pop[worldNum][side] = av.fzr.pop[worldNum].num;
      break;
  }
};

av.dnd.landanalyzeChart = function (dnd, source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  var items = av.dnd.getAllItems(av.dnd.graphPop0);
  if (0 === items.length) { av.dnd.putNslot(0, source); }
  else {
    items = av.dnd.getAllItems(av.dnd.graphPop1);
    if (0 === items.length) { av.dnd.putNslot(1, source); }
    else {
      items = av.dnd.getAllItems(av.dnd.graphPop2);
      if (0 === items.length) { av.dnd.putNslot(2, source);}
    }
  }
  //in all cases no population name is stored in the graph div
  av.dnd.analyzeChart.selectAll().deleteSelectedNodes();  //clear items
  av.dnd.analyzeChart.sync();   //should be done after insertion or deletion
}

av.dnd.putNslot = function (Num, source) {
  'use strict';
  //get the data for the new organism
  var domid = Object.keys(source.selection)[0];
  var name = document.getElementById(domid).textContent
  var dir = av.fzr.dir[domid];
  //console.log('av.dnd.putNslot: Num', Num, '; name', name);
  //I tried putting av.dnd.graphPop0 as a parameter to be passed, but that did not work.
  av.dnd['graphPop'+Num].insertNodes(false, [{data: name, type: ['w']}]);
  av.dnd['graphPop'+Num].sync();
  av.anl.loadWorldData(Num, dir);
  av.anl.loadSelectedData(Num, 'yLeftSelect', 'left')
  av.anl.loadSelectedData(Num, 'yRightSelect', 'right')
}

av.dnd.landgraphPop0 = function (dnd, source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  var items = av.dnd.getAllItems(av.dnd.graphPop0);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (0 < items.length) {
    //clear out the old data
    av.dnd.graphPop0.selectAll().deleteSelectedNodes();  //clear items
    av.dnd.graphPop0.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    av.dnd.fzWorld.forInSelectedItems(function (item, id) {
      av.dnd.graphPop0.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    av.dnd.graphPop0.sync();
  }
  var fzdomid = Object.keys(source.selection)[0];
  var dir = av.fzr.dir[fzdomid];
  av.anl.loadWorldData(0, dir);
  av.anl.loadSelectedData(0, 'yLeftSelect', 'left')
  av.anl.loadSelectedData(0, 'yRightSelect', 'right')
}

av.dnd.landgraphPop1 = function (dnd, source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  var items = av.dnd.getAllItems(av.dnd.graphPop1);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (0 < items.length) {
    //clear out the old data
    av.dnd.graphPop1.selectAll().deleteSelectedNodes();  //clear items
    av.dnd.graphPop1.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    av.dnd.fzWorld.forInSelectedItems(function (item, id) {
      av.dnd.graphPop1.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    av.dnd.graphPop1.sync();
  }
  var fzdomid = Object.keys(source.selection)[0];
  var dir = av.fzr.dir[fzdomid];
  av.anl.loadWorldData(1, dir);
  av.anl.loadSelectedData(1, 'yLeftSelect', 'left')
  av.anl.loadSelectedData(1, 'yRightSelect', 'right')
}

av.dnd.landgraphPop2 = function (dnd, source, nodes, target) {
  'use strict';
  av.debug.log += '\nDnD: ' + source.node.id + '--> ' + target.node.id + ': by: ' + nodes[0].textContent;
  var items = av.dnd.getAllItems(av.dnd.graphPop2);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (0 < items.length) {
    //clear out the old data
    av.dnd.graphPop2.selectAll().deleteSelectedNodes();  //clear items
    av.dnd.graphPop2.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    av.dnd.fzWorld.forInSelectedItems(function (item, id) {
      av.dnd.graphPop2.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    av.dnd.graphPop2.sync();
    //if (av.debug.dnd) console.log("graphPop2.map=", graphPop2.map);
  }
  var fzdomid = Object.keys(source.selection)[0];
  var dir = av.fzr.dir[fzdomid];
  av.anl.loadWorldData(2, dir);
  av.anl.loadSelectedData(2, 'yLeftSelect', 'left')
  av.anl.loadSelectedData(2, 'yRightSelect', 'right')
}

/* ********************************************************************** */
/* Right Click Context Menu Freezer ************************************* */
/* ********************************************************************** */
//used to re-name freezer items after they are created--------------
//http://jsfiddle.net/bEurr/10/
av.dnd.contextMenu = function(target, fzItemID) {
  'use strict';
  var fzSection = target.node.id;
  var dir;
  if (av.debug.dnd) console.log("contextMenu; target.node.id=",target.node.id);
  if (av.debug.dnd) console.log("contextMenu; fzItemID=",fzItemID, " fzSection=", fzSection);
  if (av.debug.dnd) console.log('contextMenu: fzr', av.fzr);
  var aMenu = new dijit.Menu({targetNodeIds: [fzItemID]});
  aMenu.addChild(new dijit.MenuItem({
    label: "Rename",
    onClick: function () {
  av.debug.log += '\nButton: Rname:' + document.getElementById(fzItemID).textContent;
      var fzName = prompt("Please rename freezer item", document.getElementById(fzItemID).textContent);
      if (fzName) {
        fzName = av.dnd.getUniqueName(fzName, target);
        if (null != fzName) {
          //document.getElementById(fzItemID).innerHTML = fzName;  //either works
          document.getElementById(fzItemID).textContent = fzName;
          //if (av.debug.dnd) console.log(".data=", target.map[fzItemID].data);
          //update freezer structure
          dir = av.fzr.dir[fzItemID];
          av.fzr.file[dir+'/entryname.txt']=fzName;
        }
      }
    }
  }));
  aMenu.addChild(new dijit.MenuItem({
    label: "delete",
    onClick: function () {
      av.debug.log += '\nButton: delete:' + document.getElementById(fzItemID).textContent;
      var sure = confirm("Do you want to delete " + document.getElementById(fzItemID).textContent);
      if (sure) {
        dir = av.fzr.dir[fzItemID];
        av.fzr.file[dir+'/entryname.txt'];
        if ('fzOrgan' == fzSection) {
          av.fwt.removeFzrItem(dir, 'g')
        } else if ('fzConfig' == fzSection){
          av.fwt.removeFzrItem(dir, 'c')
        } else if ('fzWorld' == fzSection){
          av.fwt.removeFzrItem(dir, 'w')
        }
        target.selectNone();
        dojo.destroy(fzItemID);
        target.delItem(fzItemID);
        //need to remove from fzr and pouchDB
      }
    }
  }));
  aMenu.addChild(new dijit.MenuItem({
    label: "export",
    onClick: function () {
      av.debug.log += '\nButton: export:' + document.getElementById(fzItemID).textContent;
      var type;
      var itemName = document.getElementById(fzItemID).textContent;
      var zName = prompt(itemName + ' will be saved as ' + itemName + '.avidaedfreezeritem.zip', itemName + '.avidaedfreezeritem.zip');
      if (zName) {
        if (0 === zName.length) zName = itemName + '.avidaedfreezeritem.zip';  //.avidaedfreezeritem.zip is 23 characters
        if ('.zip' != zName.substring(zName.length - 4)) zName = zName + '.zip';
        dir = av.fzr.dir[fzItemID];
        type = dir.substring(0,1);
        var FIzip = new av.fio.JSZip();  //FreezerItemZip
        FIzip.file('entrytype.txt', type);
        if (av.debug.dnd) console.log('type', type);
        for (var fname in av.fzr.file) {
          //console.log('dir', dir, '; fname', fname);
          if (dir == fname.substring(0, dir.length)) {
            if (av.debug.dnd) console.log('export filename', fname.substring(dir.length + 1));
            FIzip.file(fname.substring(dir.length + 1), av.fzr.file[fname]);
          }
        }
        var content = FIzip.generate({type: "blob"});
        saveAs(content, zName);
      }
    }
  }))
};

/* ****************************************************************************************************************** */
/* ****************************************************************************************************************** */
/*
A dojo menu drop down cannot call a dojo popup. It crashes



Looking at DND move https://dojotoolkit.org/reference-guide/1.10/dojo/dnd/Moveable.html
 https://dojotoolkit.org/reference-guide/1.10/dojo/dnd/Moveable.html
 */

//I tried to see if I could just remove the one node rather than all of them and re-instering. Seems to work.
//source.parent.removeChild(nodes[0]);    this statement works in trash to remove node from fzOrgan
//statement below only works if new config added to the bottom
//pkg.target.parent.removeChild(pkg.target.parent.childNodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically

//Dojo uses .data to help keep track of .textContent or .innerHTML
//At one time I was trying to keep the original name in .data and allow the user
//to change the .textContent name only. I have now decided that will cause trouble.
//I'm keeping the following commented out code that would update the .textContent specifically.
//var currentItem = Object.keys(av.dnd.activeConfig.map)[0];
//var freezeItem = Object.keys(av.dnd.fzConfig.selection)[0];
//if (av.debug.dnd) console.log("currentI", currentItem, " freezeI", freezeItem);
//document.getElementById(currentItem).textContent = document.getElementById(freezeItem).textContent;
