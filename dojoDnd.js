//global definitions based dom that involve DND

//functions used to process events that happen when a dojo drag and drop lands on the particular dnd 'target'.
//Note that all dnd 'source' elements can also be 'targets'.

// General Drag and Drop (DnD) functions --------------------------------------

//not sure that this is in use
/*  dojo.declare("AcceptOneItemSource", dndSource, {
 checkAcceptance: function (source, nodes) {
 if (this.node.children.length >= 1) {
 return false;
 }
 return this.inherited(arguments);
 }
 });
 */
//http://stackoverflow.com/questions/1134572/dojo-is-there-an-event-after-drag-drop-finished
//Puts the contents of the source in a object (list) called items.
function getAllItems(source) {
  'use strict';
  var items = source.getAllNodes().map(function (node) {
    return source.getItem(node.id);
  });
  return items;
}

var getUniqueName = function(name, target) {
  'use strict';
  var namelist = dojo.query('> .dojoDndItem', target.node.id);
  var unique = true;
  while (unique) {
    unique = false;
    for (var ii = 0; ii < namelist.length; ii++) {
      //if (av.debug.dnd) console.log ("name ", namelist[ii].innerHTML);
      if (name == namelist[ii].textContent) {
        name = prompt("Please give your item a unique name ", name + "_1")
        unique = true;
      }
    }
  }
  return name;
}

var getDomId = function (name, target){
  'use strict';
  //Now find which node has the new content so it can get a context menu.
  var domItems = Object.keys(target.map);
  var nodeIndex = -1;
  for (var ii = 0; ii < domItems.length; ii++) {
    if (target.map[domItems[ii]].data == name) {
      nodeIndex = ii;
      break;
    }
  }
  return domItems[nodeIndex];
};

//pass in fzr.config, fzr.world or fzr.organ
var getFzrNdx = function (array, domId) {
  'use strict';
  var ndx = -1;
  for (var ii = 0; ii < array.length; ii++){
    if (domId === array[ii].domId) {
      ndx = ii;
      break;
    }
  }
  return ndx;
}

//-------- Configuration DnD ---------------------------------------
//Need to have only the most recent dropped configuration in configCurrent. Do this by deleting everything in configCurrent
//and reinserting the most resent one after a drop event.

function landActiveConfig(dnd, pkg) {
  'use strict';
  var ndx = -1;
  //there is always a node here, so it must always be cleared when adding a new one.
  dnd.activeConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  //get the data for the new configuration
  pkg.source.forInSelectedItems(function (item, id) { //assign the node that is selected from the source.
    dnd.activeConfig.insertNodes(false, [item]);
  });
  dnd.activeConfig.sync();
  var domId = Object.keys(dnd.activeConfig.map)[0];
  fzr.actConfig.domID = domId;
  fzr.actConfig.name = document.getElementById(domId).textContent;
  domId = Object.keys(pkg.source.selection)[0];
  switch (pkg.source.node.id) {
    case 'fzConfig':
      fzr.actConfig.type = 'c';
      ndx = getFzrNdx(fzr.config, domId);
      if (-1 < ndx) {
        fzr.actConfig._id = fzr.config[ndx]._id;
      }
      else {console.log('index not found for updating active configuration');}
      break;
    case 'fzWorld':
      fzr.actConfig.type = 'w';
      ndx = getFzrNdx(fzr.world, domId);
      if (-1 < ndx) {
        fzr.actConfig._id = fzr.world[ndx]._id;
      }
      else {console.log('index not found for updating active configuration');}
      break;
  }

  //I tried to see if I could just remove the one node rather than all of them and re-instering. Seems to work.
  //source.parent.removeChild(nodes[0]);    this statement works in trash to remove node from fzOrgan
  //statement below only works if new config added to the bottom
  //pkg.target.parent.removeChild(pkg.target.parent.childNodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically

  //Dojo uses .data to help keep track of .textContent or .innerHTML
  //At one time I was trying to keep the original name in .data and allow the user
  //to change the .textContent name only. I have now decided that will cause trouble.
  //I'm keeping the following commented out code that would update the .textContent specifically.
  //var currentItem = Object.keys(dnd.activeConfig.map)[0];
  //var freezeItem = Object.keys(dnd.fzConfig.selection)[0];
  //if (av.debug.dnd) console.log("currentI", currentItem, " freezeI", freezeItem);
  //document.getElementById(currentItem).textContent = document.getElementById(freezeItem).textContent;

}

//Process when an Configuration is added to the Freezer
function landFzConfig(dnd, fzr, source, nodes, target) {
  'use strict';
  var strItem = Object.keys(target.selection)[0];
  var dishCon = prompt("Please name your dish configuration", nodes[0].textContent + "_1");
  if (dishCon) {
    var configName = getUniqueName(dishCon, target);
    if (null != configName) {
      document.getElementById(strItem).textContent = configName;
      target.map[strItem].data = configName;

      //Now find which node has the new content so it can get a context menu.
      var domID = getDomId(configName, target);
      var newConfig = {
        domID: domID,
        name: configName,
        _id: 'c'+ fzr.cNum,
        fileNum: fzr.cNum
      };
      fzr.config.push(newConfig);
      fzr.cNum++;

      //create a right av.mouse-click context menu for the item just created.
      contextMenu(fzr, target, domID);
    }
  }
  else {  //user cancelled so the item should NOT be added to the freezer.
    dnd.fzConfig.deleteSelectedNodes();  //clear items
    dnd.fzConfig.sync();   //should be done after insertion or deletion
  }
}

//Organsim dnd------------------------------------------------------
function landAncestorBox(dnd, fzr, parents, source, nodes, target) {
  //Do not copy parents if one is moved within Ancestor Box
  if ('ancestorBox' != source.node.id) {
    //find genome by finding source
    var domId = Object.keys(source.selection)[0];
    var ndx = fndFzrNdx(domId, fzr.genome);
    parents.genome.push(fzr.genome[ndx].genome);
    nn = parents.name.length;
    parents.autoNdx.push(nn);
    parents.name.push(nodes[0].textContent);
    parents.howPlaced.push('auto');
    parents.domId.push(Object.keys(target.selection)[0]);
    //Find color of ancestor
    if (0 < parents.Colors.length) { parents.color.push(parents.Colors.pop()) }
    else { parents.color.push(defaultParentColor) }
    PlaceAncestors(parents);
    if (av.debug.dnd) console.log('parents', parents.name[nn], parents.domId[nn], parents.genome[nn]);
  }
}

// Process Drop on gridCanvas
//This triggers for every dnd drop, not just those of gridCanvas
function landGridCanvas(av, dnd, fzr, grd, parents, source, nodes, target) {
  if (av.debug.dnd) console.log('inside gridCanvas dnd');
  //was it dropped on the grid of cells?
  //if (av.debug.dnd) console.log('xOff, yOff, xUP, y', grd.xOffset, grd.yOffset, av.mouse.UpGridPos[0];, av.mouse.UpGridPos[1];);
  //calculated grid cell to see if it was a valid grid position.
  var nn = parents.name.length;
  var mouseX = av.mouse.UpGridPos[0] - grd.marginX - grd.xOffset;
  var mouseY = av.mouse.UpGridPos[1] - grd.marginY - grd.yOffset;
  if (av.debug.dnd) console.log('mouse.UpGridPosX, y', av.mouse.UpGridPos[0], av.mouse.UpGridPos[1]);
  if (av.debug.dnd) console.log('mouseX, y', mouseX, mouseY);
  parents.col[nn] = Math.floor(mouseX / grd.cellWd);
  parents.row[nn] = Math.floor(mouseY / grd.cellHt);
  //check to see if in the grid part of the canvas
  if (parents.col[nn] >= 0 && parents.col[nn] < grd.cols && parents.row[nn] >= 0 && parents.row[nn] < grd.rows) {
    parents.AvidaNdx[nn] = parents.row[nn] * grd.cols + parents.col[nn];
    //Add organism to dnd.ancestorBox in settings.
    dnd.fzOrgan.forInSelectedItems(function (item, id) {
      if (av.debug.dnd) console.log('selected: item', item, '; id', id);
      dnd.ancestorBox.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
      if (av.debug.dnd) console.log('dnd.gridCanvas.map', dnd.gridCanvas.map);
      if (av.debug.dnd) console.log('dnd.ancestorBox.map', dnd.ancestorBox.map);
    });
    //update parents structure
    var nn = parents.name.length;
    parents.handNdx.push(nn);
    parents.howPlaced[nn] = 'hand';
    parents.name[nn] = nodes[0].textContent;
    var domId = Object.keys(source.selection)[0];
    if (av.debug.dnd) console.log('LandGridCanvas; domId', domId, '; fzr.genome', fzr.genome);
    var ndx = fndFzrNdx(domId, fzr.genome);
    parents.genome.push(fzr.genome[ndx].genome);
    //find domId of parent as listed in dnd.ancestorBox
    var mapItems = Object.keys(dnd.ancestorBox.map);
    parents.domId.push(mapItems[mapItems.length - 1]);

    //Find color of ancestor
    if (0 < parents.Colors.length) {
      parents.color.push(parents.Colors.pop())
    }
    else {
      parents.color.push(defaultParentColor)
    }
    //if (av.debug.dnd) console.log('after', parents)
    //Re-Draw Grid - done in routine that calls this one.
  }
  //In all cases remove the ancestor from the gridCanvas so we only keep them in the dnd.ancestorBox.
  dnd.gridCanvas.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  dnd.gridCanvas.sync();
  if (av.debug.dnd) console.log("parents", parents);
}

//When something is added to the Organism Freezer ------------------
function landFzOrgan(dnd, fzr, parents, source, nodes, target) {
  'use strict';
  var neworg = {};
  var gen;
  var strItem = Object.keys(target.selection)[0];
  if (av.debug.dnd) console.log('strItem', strItem);
  var avidian = prompt("Please name your avidian", document.getElementById(strItem).textContent + "_1");
  if (avidian) {
    var avName = getUniqueName(avidian, target);
    if (null != avName) {  //give dom item new avName name
      document.getElementById(strItem).textContent = avName;
      target.map[strItem].data = avName;

      if ('ancestorBox' == source.node.id) {
        //update structure to hold freezer data for Organisms.
        var Ndx = parents.domId.indexOf(nodes[0].id);  //Find index into parent structure
        gen = parents.genome[Ndx];

        // need to remove organism from parents list.
        removeParent(Ndx, parents);
        PlaceAncestors(parents);

        // need to remove organism from the Ancestor Box.
        // dnd.ancestorBox is dojo dnd copyonly to prevent loss of that organsim when the user clicks cancel. The user will
        // see the cancel as cancelling the dnd rather than canceling the rename.
        dnd.ancestorBox.deleteSelectedNodes();  //clear items
        dnd.ancestorBox.sync();   //should be done after insertion or deletion
        if (av.debug.dnd) console.log('neworg', neworg);
      }
      else if ('activeOrgan' == source.node.id) { gen = fzr.actOrgan.genome; }
      neworg = {
        'name': dnd.fzOrgan.map[strItem].data,
        'domId': strItem,
        'genome': gen,
        'fileNum': fzr.gNum,
        '_id': 'g' + fzr.gNum
      };
      fzr.genome.push(neworg);
      fzr.gNum++;

      if (av.debug.dnd) console.log('fzOrgan', dnd.fzOrgan);
      //create a right av.mouse-click context menu for the item just created.
      if (av.debug.dnd) console.log('target',target, '; neworg.domId', neworg.domId );
      contextMenu(fzr, target, neworg.domId);
    }
    else { //Not given a name, so it should NOT be added to the freezer.
      dnd.fzOrgan.deleteSelectedNodes();  //clear items
      dnd.fzOrgan.sync();   //should be done after insertion or deletion
    }
  }
  else {  //cancelled so the item should NOT be added to the freezer.
    dnd.fzOrgan.deleteSelectedNodes();  //clear items
    dnd.fzOrgan.sync();   //should be done after insertion or deletion
  }
  if (av.debug.dnd) console.log('near end of landFzOrgan');
  if ('ancestorBox' != source.node.id) {
    console.log('dojo dnd to Organ Freezer, not from Ancestor Box');
  }
  if (av.debug.dnd) console.log('End of landFzOrgan');
}

function landOrganIcon(dnd, fzr, source, nodes, target) {
  //clear out the old data if an organism is already there
  'use strict';
  var items = getAllItems(dnd.activeOrgan);    //gets some data about the items in the container
  if (1 < items.length) {
    dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
    dnd.activeOrgan.sync();   //should be done after insertion or deletion
  }
  //get the data for the new organism
    source.forInSelectedItems(function (item, id) {
    dnd.activeOrgan.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    dnd.activeOrgan.sync();
  });
  if ('fzOrgan' == source.node.id) updateFromFzrOrganism(dnd, fzr); //should only be from freezer as other are av.mouse based dnd.
  //clear out dnd.organIcon as nothing is stored there - just moved on to OrganismCurrent
  dnd.organIcon.selectAll().deleteSelectedNodes();  //clear items
  dnd.organIcon.sync();   //should be done after insertion or deletion
}

//Need to have only the most recent dropped organism in dnd.activeOrgan. Do this by deleting everything in activeOrgan
//and reinserting the most resent one after a drop event.
function landActiveOrgan(dnd, fzr, source, nodes, target) {
  'use strict';
  //clear out the old data if an organism is already there
  var items = getAllItems(dnd.activeOrgan);    //used to see if there is more than one item in Organ Current
  //if (av.debug.dnd) console.log('items', items, items.length);
  if (1 < items.length) {
    dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
    dnd.activeOrgan.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    dnd.fzOrgan.forInSelectedItems(function (item, id) {
      dnd.activeOrgan.insertNodes(false, [item]);          //assign the node that is selected from the only valid pkg.source.
      dnd.activeOrgan.sync();
    });
    //if (av.debug.dnd) console.log("dnd.activeOrgan.map=", dnd.activeOrgan.map);
  }
  updateFromFzrOrganism(dnd, fzr);
}

function updateFromFzrOrganism(dnd, fzr) {
  var domId = Object.keys(dnd.fzOrgan.selection)[0];
  if (av.debug.dnd) console.log('domId', domId);
  var ndx = fndFzrNdx(domId, fzr.genome)
  fzr.actOrgan.name = fzr.genome[ndx].name;
  fzr.actOrgan.domId = Object.keys(dnd.activeOrgan.map)[0];
  fzr.actOrgan.genome = fzr.genome[ndx].genome;
  if (av.debug.dnd) console.log('fzr.actOrgan', fzr.actOrgan);
}

//The variable OrganCanvas with the html tag organismCanvas will Not hold the organism. Anything dropped on the OrganismCanvas
//will be put in dnd.activeOrgan.
function landOrganCanvas(dnd, fzr, source, nodes, target) {
  //Clear current to put the new organism in there.
  dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  dnd.activeOrgan.sync();   //should be done after insertion or deletion

  //Clear canvas because we only store the 'Mom' in the OrganCurrentNode
  var ItemID = Object.keys(dnd.activeOrgan.map)[0];
  dnd.organCanvas.selectAll().deleteSelectedNodes();  //clear items
  dnd.organCanvas.sync();   //should be done after insertion or deletion
  dojo.destroy(ItemID);

  //get the data for the new organism
  dnd.fzOrgan.forInSelectedItems(function (item, id) {
    dnd.activeOrgan.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
  });
  dnd.activeOrgan.sync();

  if ('fzOrgan' == source.node.id) updateFromFzrOrganism(dnd, fzr);
}

//------------------------------------- Populated Dishes DND ---------------------
//This should never happen as fzPopDish is the only source for populated dishes. Here in case that changes.
function landFzPopDish(dnd, pkg) {
  //var items = getAllItems(dnd.fzWorld);  not used
  var populatedDish = prompt("Please name your populated dish", pkg.nodes[0].textContent + "_1");
  if (populatedDish) {
    var popDish = getUniqueName(populatedDishcon, pkg.target);
    if (null != popDish) {
      pkg.nodes[0].textContent = popDish;
      //to change data value not fully tested, but keep as it was hard to figure out
      //dnd.fzWorld.setItem(pkg.target.node.id, {data: popDish, type: ["popDish"]});
    }
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
  }
}

// Process dnd.trashCan ---------------------------------------------------
var landTrashCan = function (dnd, fzr, parents, source, nodes, target) {
  'use strict';
  var domId;
  var remove = {};
  remove.type = '';
  remove.id = '';
  if (av.debug.dnd) console.log('in LandTrashCan');
  //if the item is from the freezer, delete from freezer unless it is original stock (@)
  if ('fzOrgan' == source.node.id && '@ancestor' != nodes[0].textContent) {
    if (av.debug.dnd) {console.log('fzOrgan->trash', fzr.genome);}
    domId = Object.keys(dnd.fzOrgan.selection)[0];
    if (av.debug.dnd) console.log('domId', domId);
    var ndx = fndFzrNdx(domId, fzr.genome);
    remove.type = 'g';
    remove.id = fzr.genome[ndx]._id;
    fzr.genome.splice(ndx,1);
    if (av.debug.dnd) console.log('fzOrgan->trash; nodes[0]',nodes[0]);
    if (av.debug.dnd) console.log('fzOrgan->trash; source.parent',source.parent);
    source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
  }
  else if ('fzConfig' == source.node.id && '@default' != nodes[0].textContent) {
    domId = Object.keys(dnd.fzConfig.selection)[0];
    var ndx = fndFzrNdx(domId, fzr.config);
    remove.type = 'c';
    remove.id = fzr.config[ndx]._id;
    fzr.config.splice(ndx,1);
    source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
  }
  else if ('fzWorld' == source.node.id && '@example' != nodes[0].textContent) {
    domId = Object.keys(dnd.fzWorld.selection)[0];
    var ndx = fndFzrNdx(domId, fzr.world);
    remove.type = 'w';
    remove.id = fzr.world[ndx]._id;
    fzr.world.splice(ndx,1);
    source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
  }
  // items from ancestor box require ancestor (parent) handling.
  else if ('ancestorBox' == source.node.id) {
    //find index into parents
    if (av.debug.dnd) console.log('ancestorBox->trash; source', source.map);
    //Find index into parent structure
    var Ndx = parents.domId.indexOf(nodes[0].id);
    if (av.debug.dnd) console.log('ancestorBox->trash, nodes[0].id', nodes[0].id);
    if (av.debug.dnd) console.log('ancestorBox->trash, parents', parents.domId[0]);

    if (av.debug.dnd) console.log('ancestorBox->trash; nodeId', nodes[0].id, '; Ndx', Ndx, '; parents.domId', parents.domId);
    removeParent(Ndx, parents);
    PlaceAncestors(parents);
    if (av.debug.dnd) console.log('ancestorBox->trash, parents', parents);
  }
  dnd.trashCan.selectAll().deleteSelectedNodes();  //in all cases, empty the dnd.trashCan
  return remove;
}

//-----------------------------------------------------------------//
//          DND Analysis page
//-----------------------------------------------------------------//
var domItm; //used in population graph slots
var currentItem;

function landGraphPop1(dnd, source, nodes, target, plt) {
  var items = getAllItems(dnd.graphPop1);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (1 < items.length) {
    //clear out the old data
    dnd.graphPop1.selectAll().deleteSelectedNodes();  //clear items
    dnd.graphPop1.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    dnd.fzWorld.forInSelectedItems(function (item, id) {
      dnd.graphPop1.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    dnd.graphPop1.sync();
    //if (av.debug.dnd) console.log("dnd.graphPop1.map=", dnd.graphPop1.map);
  }
  //another way to get the name of the dish.
  //currentItem = Object.keys(dnd.graphPop1.map)[0];
  //domItm = document.getElementById(currentItem).textContent;
  var dishName = nodes[0].textContent;
  //update the graph
  //this works for demo purposes only. We will be using textContent rather than data
  plt.pop1a = plt.dictPlota[dishName];
  plt.pop1b = plt.dictPlotb[dishName];
  //if (av.debug.dnd) console.log('1=', domItm);

  //example code to set item programatically. not actually needed here.
  //dnd.graphPop1.setItem(dnd.graphPop1.node.childnodes[0].id, {data: "test_name", type: ["popDish"]});
  //dnd.graphPop1.sync();
  //if (av.debug.dnd) console.log("dnd.graphPop1.node.childnodes[0].id=", dnd.graphPop1.node.childnodes[0].id);
}

function landGraphPop2(dnd, source, nodes, target, plt) {
  var items = getAllItems(dnd.graphPop2);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (1 < items.length) {
    //clear out the old data
    dnd.graphPop2.selectAll().deleteSelectedNodes();  //clear items
    dnd.graphPop2.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    dnd.fzWorld.forInSelectedItems(function (item, id) {
      dnd.graphPop2.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    dnd.graphPop2.sync();
    //if (av.debug.dnd) console.log("graphPop2.map=", graphPop2.map);

  }
  var dishName = nodes[0].textContent;
  //update the graph
  //this works for demo purposes only. We will be using textContent rather than data
  plt.pop2a = plt.dictPlota[dishName];
  plt.pop2b = plt.dictPlotb[dishName];
  //if (av.debug.dnd) console.log('2=', domItm);
}

function landGraphPop3(dnd, source, nodes, target, plt) {
  var items = getAllItems(dnd.graphPop3);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (1 < items.length) {
    //clear out the old data
    dnd.graphPop3.selectAll().deleteSelectedNodes();  //clear items
    dnd.graphPop3.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    dnd.fzWorld.forInSelectedItems(function (item, id) {
      dnd.graphPop3.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    dnd.graphPop3.sync();
    //if (av.debug.dnd) console.log("graphPop3.map=", graphPop3.map);
  }
  var dishName = nodes[0].textContent;
  //update the graph
  plt.pop3a = plt.dictPlota[dishName];
  plt.pop3b = plt.dictPlotb[dishName];
  //if (av.debug.dnd) console.log('3=', dishName);
}

/* ********************************************************************** */
/* Right Click Context Menu Freezer ************************************* */
/* ********************************************************************** */
//used to re-name freezer items after they are created--------------
//http://jsfiddle.net/bEurr/10/
function contextMenu(fzr, target, fzItemID) {
  var fzSection = target.node.id;
  if (av.debug.dnd) console.log("contextMenu; target.node.id=",target.node.id);
  if (av.debug.dnd) console.log("contextMenu; fzItemID=",fzItemID, " fzSection=", fzSection);
  if (av.debug.dnd) console.log('contextMenu', fzItemID, fzr.genome);
  var aMenu = new dijit.Menu({targetNodeIds: [fzItemID]});
  aMenu.addChild(new dijit.MenuItem({
    label: "Rename",
    onClick: function () {
      var fzName = prompt("Please rename freezer item", document.getElementById(fzItemID).textContent);
      if (fzName) {
        fzName = getUniqueName(fzName, target);
        if (null != fzName) {
          //document.getElementById(fzItemID).innerHTML = fzName;  //either works
          document.getElementById(fzItemID).textContent = fzName;
          //if (av.debug.dnd) console.log(".data=", target.map[fzItemID].data);
          //update freezer structure
          if ('fzOrgan' == fzSection) {
            var Ndx = fndFzrNdx(fzItemID, fzr.genome);
            fzr.genome[Ndx].name = fzName;
          } else if ('fzConfig' == fzSection){
            var Ndx = fndFzrNdx(fzItemID, fzr.config);
            fzr.config[Ndx].name = fzName;
          } else if ('fzWorld' == fzSection){
            var Ndx = fndFzrNdx(fzItemID, fzr.world);
            fzr.world[Ndx].name = fzName;
          }
          //update PouchDB
        }
      }
    }
  }));
  aMenu.addChild(new dijit.MenuItem({
    label: "delete",
    onClick: function () {
      var sure = confirm("Do you want to delete " + document.getElementById(fzItemID).textContent);
      if (sure) {
        if ('fzOrgan' == fzSection) {
          var Ndx = fndFzrNdx(fzItemID, fzr.genome);
          fzr.genome.splice(Ndx, 1);
        } else if ('fzConfig' == fzSection) {
          var Ndx = fndFzrNdx(fzItemID, fzr.config);
          fzr.config.splice(Ndx, 1);
        }else if ('fzWorld' == fzSection) {
          var Ndx = fndFzrNdx(fzItemID, fzr.config);
          fzr.config.splice(Ndx, 1);
        }
        //update PouchDB
        target.selectNone();
        dojo.destroy(fzItemID);
        target.delItem(fzItemID);
        //need to remove from fzr and pouchDB
      }
    }
  }))
};
/* ********************************************************************** */

var fndFzrNdx = function (domId, fzrSection) {
  for (var ii = 0; ii < fzrSection.length; ii++) {
    if (domId == fzrSection[ii].domId) {
      return ii;
      break;
    }
  }
  if (av.debug.dnd) console.log('GenomeNdx not found');
  return -1;
}

function makeHandAutoNdx(parents) {
  var hh = 0;  //index into hand placed
  var aa = 0;  //index into auto placed
  parents.handNdx = [];
  parents.autoNdx = [];
  for (ii = 0; ii < parents.name.length; ii++) {
    if ('hand' == parents.howPlaced[ii]) {
      parents.handNdx[hh] = ii;
      hh++;
    }
    else if ('auto' == parents.howPlaced[ii]) {
      parents.autoNdx[aa] = ii;
      aa++;
    }
  }
}

//removes the parent at index ParentNdx
function removeParent(ParentNdx, parents) {
  //if (av.debug.dnd) console.log('rP', parents.Colors)
  if (av.debug.dnd) console.log('rp ndx, domId, parents',ParentNdx, parents.domId, parents);
  parents.Colors.push(parents.color[ParentNdx]);
  parents.color.splice(ParentNdx, 1);
  parents.name.splice(ParentNdx, 1);
  parents.genome.splice(ParentNdx, 1);
  parents.col.splice(ParentNdx, 1);
  parents.row.splice(ParentNdx, 1);
  parents.AvidaNdx.splice(ParentNdx, 1);
  parents.howPlaced.splice(ParentNdx, 1);
  parents.domId.splice(ParentNdx, 1);
  makeHandAutoNdx(parents);
}


