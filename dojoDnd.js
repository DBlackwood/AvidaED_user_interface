//functions used to process events that happen when a dojo drag and drop lands on the particular dnd 'target'.
//Note that all dnd 'source' elements can also be 'targets'.

if (debug.root) console.log('before general dnd functions')
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
  var items = source.getAllNodes().map(function (node) {
    return source.getItem(node.id);
  });
  return items;
}

var getUniqueName = function(name, target) {
  var namelist = dojo.query('> .dojoDndItem', target.node.id);
  var unique = true;
  while (unique) {
    unique = false;
    for (var ii = 0; ii < namelist.length; ii++) {
      //if (debug.dnd) console.log ("name ", namelist[ii].innerHTML);
      if (name == namelist[ii].textContent) {
        name = prompt("Please give your item a unique name ", name + "_1")
        unique = true;
      }
    }
  }
  return name;
}

var getDomID = function (name, target){
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
}

if (debug.root) console.log('before Configuration DND');
//-------- Configuration DnD ---------------------------------------
//Need to have only the most recent dropped configuration in configCurrent. Do this by deleting everything in configCurrent
//and reinserting the most resent one after a drop event.

function landActiveConfig(dnd, pkg) {
  //there is always a node here, so it must always be cleared when adding a new one.
  //clear all data so when we add one there will never be more than one.
  dnd.activeConfig.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  //get the data for the new configuration
  dnd.fzConfig.forInSelectedItems(function (item, id) {
    dnd.activeConfig.insertNodes(false, [item]);  //assign the node that is selected from the only valid source.
  });
  dnd.activeConfig.sync();

  //Dojo uses .data to help keep track of .textContent or .innerHTML
  //At one time I was trying to keep the original name in .data and allow the user
  //to change the .textContent name only. I have now decided that will cause trouble.
  //I'm keeping the following commented out code that would update the .textContent specifically.
  //var currentItem = Object.keys(dnd.activeConfig.map)[0];
  //var freezeItem = Object.keys(dnd.fzConfig.selection)[0];
  //if (debug.dnd) console.log("currentI", currentItem, " freezeI", freezeItem);
  //document.getElementById(currentItem).textContent = document.getElementById(freezeItem).textContent;

  //Update the configuration based on the Avida data  ***needs work****
}

//Process when an Configuration is added to the Freezer
function landFzConfig(dnd, fzr, source, nodes, target) {
  var strItem = Object.keys(target.selection)[0];
  var dishCon = prompt("Please name your dish configuration", nodes[0].textContent + "_1");
  if (dishCon) {
    var configName = getUniqueName(dishCon, target);
    if (null != configName) {
      document.getElementById(strItem).textContent = configName;
      target.map[strItem].data = configName;

      //Now find which node has the new content so it can get a context menu.
      var domID = getDomID(configName, target);
      //create a right mouse-click context menu for the item just created.
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
    var ndx = fndGenomeNdx(domId, fzr.organism);
    parents.genome.push(fzr.organism[ndx].genome);
    nn = parents.name.length;
    parents.autoNdx.push(nn);
    parents.name.push(nodes[0].textContent);
    parents.howPlaced.push('auto');
    parents.domId.push(Object.keys(target.selection)[0]);
    //Find color of ancestor
    if (0 < parents.Colors.length) { parents.color.push(parents.Colors.pop()) }
    else { parents.color.push(defaultParentColor) }
    PlaceAncestors(parents);
    if (debug.dnd) console.log('parents', parents.name[nn], parents.domId[nn], parents.genome[nn])
  }
}

// Process Drop on gridCanvas
//This triggers for every dnd drop, not just those of gridCanvas
function landGridCanvas(dnd, fzr, parents, source, nodes, target) {
  if (debug.dnd) console.log('inside gridCanvas dnd');
  //was it dropped on the grid of cells?
  //if (debug.dnd) console.log('xOff, yOff, xUP, y', grd.xOffset, grd.yOffset, mouse.UpGridPos[0];, mouse.UpGridPos[1];);
  //calculated grid cell to see if it was a valid grid position.
  var nn = parents.name.length;
  var mouseX = mouse.UpGridPos[0] - grd.marginX - grd.xOffset;
  var mouseY = mouse.UpGridPos[1] - grd.marginY - grd.yOffset;
  //if (debug.dnd) console.log('mouseX, y', mouseX, mouseY);
  parents.col[nn] = Math.floor(mouseX / grd.cellWd);
  parents.row[nn] = Math.floor(mouseY / grd.cellHt);
  //check to see if in the grid part of the canvas
  if (parents.col[nn] >= 0 && parents.col[nn] < grd.cols && parents.row[nn] >= 0 && parents.row[nn] < grd.rows) {
    parents.AvidaNdx[nn] = parents.row[nn] * grd.cols + parents.col[nn];
    //Add organism to dnd.ancestorBox in settings.
    dnd.fzOrgan.forInSelectedItems(function (item, id) {
      //if (debug.dnd) console.log('selected: item', item, '; id', id);
      dnd.ancestorBox.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
      //if (debug.dnd) console.log('dnd.gridCanvas.map', dnd.gridCanvas.map);
      //if (debug.dnd) console.log('dnd.ancestorBox.map', dnd.ancestorBox.map);
    });
    //update parents structure
    var nn = parents.name.length;
    parents.handNdx.push(nn);
    parents.howPlaced[nn] = 'hand';
    parents.name[nn] = nodes[0].textContent;
    var domId = Object.keys(source.selection)[0];
    if (debug.dnd) console.log('LandGridCanvas; domId', domId, '; fzr.organism', fzr.organism);
    var ndx = fndGenomeNdx(domId, fzr.organism);
    parents.genome.push(fzr.organism[ndx].genome);
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
    //if (debug.dnd) console.log('after', parents)
    //Re-Draw Grid - done in routine that calls this one.
  }
  //In all cases remove the ancestor from the gridCanvas so we only keep them in the dnd.ancestorBox.
  dnd.gridCanvas.selectAll().deleteSelectedNodes();  //http://stackoverflow.com/questions/11909540/how-to-remove-delete-an-item-from-a-dojo-drag-and-drop-source
  dnd.gridCanvas.sync();
  if (debug.dnd) console.log("parents", parents);
}

//When something is added to the Organism Freezer ------------------
function landFzOrgan(dnd, fzr, parents, source, nodes, target) {
  var strItem = Object.keys(target.selection)[0];
  if (debug.dnd) console.log('strItem', strItem);
  var avidian = prompt("Please name your avidian", document.getElementById(strItem).textContent + "_1");
  if (avidian) {
    var avName = getUniqueName(avidian, target);
    if (null != avName) {  //give dom item new avName name
      document.getElementById(strItem).textContent = avName;
      target.map[strItem].data = avName;

      if ('ancestorBox' == source.node.id) {
        //update structure to hold freezer data for Organisms.
        var Ndx = parents.domId.indexOf(nodes[0].id);  //Find index into parent structure
        var neworg = {
          'name': dnd.fzOrgan.map[strItem].data,
          'domId': strItem,
          'genome': parents.genome[Ndx]
        };
        fzr.organism.push(neworg);

        // need to remove organism from parents list.
        removeParent(Ndx, parents);
        PlaceAncestors(parents);

        // need to remove organism from the Ancestor Box.
        // dnd.ancestorBox is dojo dnd copyonly to prevent loss of that organsim when the user clicks cancel. The user will
        // see the cancel as cancelling the dnd rather than canceling the rename.
        dnd.ancestorBox.deleteSelectedNodes();  //clear items
        dnd.ancestorBox.sync();   //should be done after insertion or deletion
        if (debug.dnd) console.log('neworg', neworg);
      }
      else if ('activeOrgan' == source.node.id) {
        neworg = {
          'name': dnd.fzOrgan.map[strItem].data,
          'domId': strItem,
          'genome': fzr.actOrgan.genome
        }
        fzr.organism.push(neworg);
      }
      if (debug.dnd) console.log('fzOrgan', dnd.fzOrgan);
      //create a right mouse-click context menu for the item just created.
      if (debug.dnd) console.log('target',target, '; neworg.domId', neworg.domId );
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
  if (debug.dnd) console.log('near end of landFzOrgan');
  if ('ancestorBox' != source.node.id) {
    console.log('dojo dnd to Organ Freezer, not from Ancestor Box');
  }
  if (debug.dnd) console.log('End of landFzOrgan');
}

function landOrganIcon(dnd, fzr, source, nodes, target) {
  //clear out the old data if an organism is already there
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
  if ('fzOrgan' == source.node.id) updateFromFzrOrganism(dnd, fzr);
  //clear out dnd.organIcon as nothing is stored there - just moved on to OrganismCurrent
  dnd.organIcon.selectAll().deleteSelectedNodes();  //clear items
  dnd.organIcon.sync();   //should be done after insertion or deletion
}

//Need to have only the most recent dropped organism in dnd.activeOrgan. Do this by deleting everything in activeOrgan
//and reinserting the most resent one after a drop event.
function landActiveOrgan(dnd, fzr, source, nodes, target) {
  //clear out the old data if an organism is already there
  var items = getAllItems(dnd.activeOrgan);    //used to see if there is more than one item in Organ Current
  //if (debug.dnd) console.log('items', items, items.length);
  if (1 < items.length) {
    dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
    dnd.activeOrgan.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    dnd.fzOrgan.forInSelectedItems(function (item, id) {
      dnd.activeOrgan.insertNodes(false, [item]);          //assign the node that is selected from the only valid pkg.source.
      dnd.activeOrgan.sync();
    });
    //if (debug.dnd) console.log("dnd.activeOrgan.map=", dnd.activeOrgan.map);
  }
  updateFromFzrOrganism(dnd, fzr);
}

function updateFromFzrOrganism(dnd, fzr) {
  var domId = Object.keys(dnd.fzOrgan.selection)[0];
  if (debug.dnd) console.log('domId', domId);
  var ndx = fndGenomeNdx(domId, fzr.organism)
  fzr.actOrgan.name = fzr.organism[ndx].name;
  fzr.actOrgan.domId = Object.keys(dnd.activeOrgan.map)[0];
  fzr.actOrgan.genome = fzr.organism[ndx].genome;
  if (debug.dnd) console.log('fzr.actOrgan', fzr.actOrgan);
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
  //var items = getAllItems(dnd.fzPopDish);  not used
  var populatedDish = prompt("Please name your populated dish", pkg.nodes[0].textContent + "_1");
  if (populatedDish) {
    var popDish = getUniqueName(populatedDishcon, pkg.target);
    if (null != popDish) {
      pkg.nodes[0].textContent = popDish;
      //to change data value not fully tested, but keep as it was hard to figure out
      //dnd.fzPopDish.setItem(pkg.target.node.id, {data: popDish, type: ["popDish"]});
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
function landTrashCan(dnd, fzr, parents, source, nodes, target) {
  if (debug.dnd) console.log('in LandTrashCan');
  if ('fzOrgan' == source.node.id && '@ancestor' != nodes[0].textContent) {
    if (debug.dnd) console.log('fzOrgan->trash', fzr.organism)
    var domId = Object.keys(dnd.fzOrgan.selection)[0];
    if (debug.dnd) console.log('domId', domId);
    var ndx = fndGenomeNdx(domId, fzr.organism);
    fzr.organism.splice(ndx,1);
    source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
  }
  //if the item is from the freezer, delete from freezer unless it is original stock (@)
  else if ('fzConfig' == source.node.id || 'fzPopDish' == source.node.id) {
    // find name of item in node; don't remove starter (@) items
    if (!('@default' == nodes[0].textContent || '@example' == nodes[0].textContent)) {
      source.parent.removeChild(nodes[0]);       //http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
    }
  }
  // items from ancestor box require ancestor (parent) handling.
  else if ('ancestorBox' == source.node.id) {
    //find index into parents
    if (debug.dnd) console.log('ancestorBox->trash; source', source.map);
    //Find index into parent structure
    var Ndx = parents.domId.indexOf(nodes[0].id);
    if (debug.dnd) console.log('ancestorBox->trash, nodes[0].id', nodes[0].id);
    if (debug.dnd) console.log('ancestorBox->trash, parents', parents.domId[0]);

    if (debug.dnd) console.log('nodeId', nodes[0].id, '; Ndx', Ndx, '; parents.domId', parents.domId);
    removeParent(Ndx, parents);
    PlaceAncestors(parents);
    if (debug.dnd) console.log('ancestorBox->trash, parents', parents);
  }
  dnd.trashCan.selectAll().deleteSelectedNodes();  //in all cases, empty the dnd.trashCan
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
    dnd.fzPopDish.forInSelectedItems(function (item, id) {
      dnd.graphPop1.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    dnd.graphPop1.sync();
    //if (debug.dnd) console.log("dnd.graphPop1.map=", dnd.graphPop1.map);
  }
  //another way to get the name of the dish.
  //currentItem = Object.keys(dnd.graphPop1.map)[0];
  //domItm = document.getElementById(currentItem).textContent;
  var dishName = nodes[0].textContent;
  //update the graph
  //this works for demo purposes only. We will be using textContent rather than data
  plt.pop1a = plt.dictPlota[dishName];
  plt.pop1b = plt.dictPlotb[dishName];
  //if (debug.dnd) console.log('1=', domItm);

  //example code to set item programatically. not actually needed here.
  //dnd.graphPop1.setItem(dnd.graphPop1.node.childnodes[0].id, {data: "test_name", type: ["popDish"]});
  //dnd.graphPop1.sync();
  //if (debug.dnd) console.log("dnd.graphPop1.node.childnodes[0].id=", dnd.graphPop1.node.childnodes[0].id);
}

function landGraphPop2(dnd, source, nodes, target, plt) {
  var items = getAllItems(dnd.graphPop2);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (1 < items.length) {
    //clear out the old data
    dnd.graphPop2.selectAll().deleteSelectedNodes();  //clear items
    dnd.graphPop2.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    dnd.fzPopDish.forInSelectedItems(function (item, id) {
      dnd.graphPop2.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    dnd.graphPop2.sync();
    //if (debug.dnd) console.log("graphPop2.map=", graphPop2.map);

  }
  var dishName = nodes[0].textContent;
  //update the graph
  //this works for demo purposes only. We will be using textContent rather than data
  plt.pop2a = plt.dictPlota[dishName];
  plt.pop2b = plt.dictPlotb[dishName];
  //if (debug.dnd) console.log('2=', domItm);
}

function landGraphPop3(dnd, source, nodes, target, plt) {
  var items = getAllItems(dnd.graphPop3);
  //if there is an existing item, need to clear all nodes and assign most recent to item 0
  if (1 < items.length) {
    //clear out the old data
    dnd.graphPop3.selectAll().deleteSelectedNodes();  //clear items
    dnd.graphPop3.sync();   //should be done after insertion or deletion

    //get the data for the new organism
    dnd.fzPopDish.forInSelectedItems(function (item, id) {
      dnd.graphPop3.insertNodes(false, [item]);          //assign the node that is selected from the only valid source.
    });
    dnd.graphPop3.sync();
    //if (debug.dnd) console.log("graphPop3.map=", graphPop3.map);
  }
  var dishName = nodes[0].textContent;
  //update the graph
  plt.pop3a = plt.dictPlota[dishName];
  plt.pop3b = plt.dictPlotb[dishName];
  //if (debug.dnd) console.log('3=', dishName);
}

/* ********************************************************************** */
/* Right Click Context Menu Freezer ************************************* */
/* ********************************************************************** */
//used to re-name freezer items after they are created--------------
//http://jsfiddle.net/bEurr/10/
function contextMenu(fzr, target, fzItemID) {
  var fzSection = target.node.id;
  if (debug.dnd) console.log("contextMenu; target.node.id=",target.node.id);
  if (debug.dnd) console.log("contextMenu; fzItemID=",fzItemID, " fzSection=", fzSection);
  if (debug.dnd) console.log('contextMenu', fzItemID, fzr.organism);
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
          //if (debug.dnd) console.log(".data=", target.map[fzItemID].data);
          //update freezer structure
          if ('fzOrgan' == fzSection) {
            var Ndx = fndGenomeNdx(fzItemID, fzr.organism);
            fzr.organism[Ndx].name = fzName;
          }
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
          var Ndx = fndGenomeNdx(fzItemID, fzr.organism);
          fzr.organism.splice(Ndx, 1);
        }
        target.selectNone();
        dojo.destroy(fzItemID);
        target.delItem(fzItemID);
      }
    }
  }))
};

var fndGenomeNdx = function (domId, fzrOrganism) {
  for (var ii = 0; ii < fzrOrganism.length; ii++) {
    if (domId == fzrOrganism[ii].domId) {
      return ii;
      break;
    }
  }
  if (debug.dnd) console.log('GenomeNdx not found');
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
  //if (debug.dnd) console.log('rP', parents.Colors)
  if (debug.dnd) console.log('rp ndx, domId, parents',ParentNdx, parents.domId, parents);
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


