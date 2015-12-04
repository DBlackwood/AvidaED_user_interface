var nearly = function (aa, bb) {
  var epsilon = 3;
  var distance = Math.sqrt(Math.pow(aa[0] - bb[0], 2) + Math.pow(aa[1] - bb[1], 2))
  if (distance > epsilon) return false;
  else return true;
}

var findParentNdx = function (parents) {
  var MomNdx = -1;
  for (var ii = 0; ii < parents.name.length; ii++) {
    //if (matches([grd.selectedCol, grd.selectedRow], [parents.col[ii], parents.row[ii]])) {
    if (grd.selectedNdx == parents.AvidaNdx[ii]) {
      MomNdx = ii;
      //console.log('parent found in function', MomNdx);
      break;  //found a parent no need to keep looking
    }
  }
  return MomNdx;
}

function findSelected(evt, grd) {
  mouseX = evt.offsetX - grd.marginX - grd.xOffset;
  mouseY = evt.offsetY - grd.marginY - grd.yOffset;
  grd.selectedCol = Math.floor(mouseX / grd.cellWd);
  grd.selectedRow = Math.floor(mouseY / grd.cellHt);
  grd.selectedNdx = grd.selectedRow*grd.cols + grd.selectedCol;
  if (av.debug.mouse) console.log('mx,y', mouseX, mouseY, '; selected Col, Row', grd.selectedCol, grd.selectedRow);
}

//update data about a kid in the selecred organism to move = primarily genome and name
function SelectedKidMouseStyle(dnd, fzr, grd) {
  document.getElementById('organIcon').style.cursor = 'copy';
  document.getElementById('fzOrgan').style.cursor = 'copy';
  document.getElementById('freezerDiv').style.cursor = 'copy';
  document.getElementById('gridCanvas').style.cursor = 'copy';
  for (var ii=1; ii<fzr.genome.length; ii++) document.getElementById(fzr.genome[ii].domId).style.cursor = 'copy';
  grd.kidName = 'temporary';
  grd.kidGenome = '0,heads_default,wzcagcccccccccaaaaaaaaaaaaaaaaaaaaccccccczvfcaxgab'  //ancestor
}

function offspringTrace(dnd, fzr) {
  //Get name of parent that is in OrganCurrentNode
  var parent;
  var parentID = Object.keys(dnd.activeOrgan.map)[0];
  console.log('parentID', parentID);
  if (undefined == parentID) parent = '';
  else parent = document.getElementById(parentID).textContent;
  dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  dnd.activeOrgan.sync();   //should be done after insertion or deletion
  //Put name of offspring in OrganCurrentNode
  dnd.activeOrgan.insertNodes(false, [{data: parent + "_offspring", type: ["g"]}]);
  dnd.activeOrgan.sync();

  fzr.actOrgan.name = parent + "_offspring";
  fzr.actOrgan.genome = '0,heads_default,' + gen.dna[gen.son];  //this should be the full genome when the offspring is complete.
  fzr.actOrgan.domId = Object.keys(dnd.activeOrgan.map)[0];
  console.log('fzr.actOrgan', fzr.actOrgan.genome);
  //get genome from offspring data //needs work!!
  doOrgTrace(fzr);  //request new Organism Trace from Avida and draw that.
}

var OffspringMouse = function(evt, dnd, fzr) {
  var target = '';
  if ('organIcon' == evt.target.id) {
    offspringTrace(dnd, fzr);
  target = 'organIcon';}
  else { // look for target in the freezer
    var found = false;
    for (var ii=1; ii<fzr.genome.length; ii++) {
      if (fzr.genome[ii].domId == evt.target.id) {found=true; break;}
    }
    if (found || 'freezerDiv' == evt.target.id) {
      target  = 'fzOrgan';
      //create a new freezer item
      if (av.debug.mouse) console.log('offSpring->freezerDiv');
      var parent;
      var parentID = Object.keys(dnd.activeOrgan.map)[0];
      console.log('parentID', parentID);
      if (undefined == parentID) parent = 'noParentName';
      else parent = document.getElementById(parentID).textContent;
      //make sure there is a name.
      var avidian = prompt("Please name your avidian", parent + '_offspring');
      if (avidian) {
        avidian = getUniqueName(avidian, dnd.fzOrgan);
        if (null != avidian) {  //add to Freezer
          dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ["organism"]}]);
          dnd.fzOrgan.sync();
          //find domId of parent as listed in dnd.fzOrgan
          var mapItems = Object.keys(dnd.fzOrgan.map);
          var domStr = "";
          var neworg = {
            'name': avidian,
            'domId': mapItems[mapItems.length - 1],
            'fileNum': fzr.gNum,
            '_id': 'g' + fzr.gNum,
            'genome': '0,heads_default,' + gen.dna[1]
          }
          fzr.genome.push(neworg);
          fzr.gNum++;
          if (av.debug.mouse) console.log('Offspring-->freezer, fzr.genome', fzr.genome);
          //create a right mouse-click context menu for the item just created.
          if (av.debug.mouse) console.log('Offspring-->freezer; neworg', neworg);
          contextMenu(fzr, dnd.fzOrgan, neworg.domId);
        }
      }
    }
  }
  return target;
}

function traceSelected(dnd, fzr, grd) {
  "use strict";
  dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
  dnd.activeOrgan.sync();   //should be done after insertion or deletion
  //Put name of offspring in OrganCurrentNode
  dnd.activeOrgan.insertNodes(false, [{data: grd.kidName, type: ["organism"]}]);
  dnd.activeOrgan.sync();
  //genome data should be in parents.genome[av.mouse.ParentNdx];
  fzr.actOrgan.genome = grd.kidGenome;
  fzr.actOrgan.name = grd.kidName;
  fzr.actOrgan.domId = "";
}

var KidMouse = function (evt, dnd, fzr, grd){
  "use strict";
  var target = '';
  if (av.debug.mouse) console.log('in KidMouse', evt.target.id, evt);
  if (5 < grd.kidGenome.length) {
    if ('organIcon' == evt.target.id) {
      target = 'organIcon';
      traceSelected(dnd, fzr, grd);}
    else { // look for target in the freezer
      var found = false;
      for (var ii = 1; ii < fzr.genome.length; ii++) {
        if (fzr.genome[ii].domId == evt.target.id) {
          found = true;
          break;
        }
      }
      if (found || 'freezerDiv' == evt.target.id) {
        target = 'fzOrgan';
        if (av.debug.mouse) console.log('freezerDiv');
        //make sure there is a name.
        var avidian = prompt("Please name your avidian", grd.kidName);
        if (avidian) {
          avidian = getUniqueName(avidian, dnd.fzOrgan);
          if (null != avidian) {  //add to Freezer
            dnd.fzOrgan.insertNodes(false, [{data: avidian, type: ['g']}]);
            dnd.fzOrgan.sync();
            //find domId of parent as listed in dnd.ancestorBox
            var mapItems = Object.keys(dnd.fzOrgan.map);
            var neworg = {
              'name': avidian,
              'domId': mapItems[mapItems.length - 1],
              'fileNum': fzr.gNum,
              '_id': 'g' + fzr.gNum,
              'genome': grd.kidGenome
            }
            fzr.genome.push(neworg);
            fzr.gNum++;
            console.log('fzOrgan', dnd.fzOrgan);
            if (av.debug.mouse) console.log('Kid-->Snow', fzr.genome);
            //create a right mouse-click context menu for the item just created.
            if (av.debug.mouse) console.log('kid to freezerDiv', neworg);
            contextMenu(fzr, dnd.fzOrgan, neworg.domId);
          }
        }
      }
    }
  }
  else console.log('Kid->OrganismIcon: genome too short ', grd.kidGenome);
  return target;
}

function ParentMouse(evt, dnd, fzr, parents) {
  if (av.debug.mouse) console.log('ParentMouse', evt.target.id, evt);
  if ('gridCanvas' == evt.target.id) { // parent moved to another location on grid canvas
    av.mouse.UpGridPos = [evt.offsetX, evt.offsetY]; //not used for now
    //Move the ancestor on the canvas
    findSelected(evt, grd);
    // look to see if this is a valid grid cell
    if (grd.selectedCol >= 0 && grd.selectedCol < grd.cols && grd.selectedRow >= 0 && grd.selectedRow < grd.rows) {
      if (av.debug.mouse) console.log('parentMouse, selected,',grd.selectedCol, grd.selectedRow, grd.selectedNdx);
      parents.col[mouse.ParentNdx] = grd.selectedCol;
      parents.row[mouse.ParentNdx] = grd.selectedRow;
      parents.AvidaNdx[av.mouse.ParentNdx] = parents.col[av.mouse.ParentNdx] + grd.cols * parents.row[av.mouse.ParentNdx];
      console.log('mvparent', av.mouse.ParentNdx, parents.col[av.mouse.ParentNdx], parents.row[av.mouse.ParentNdx]);
      console.log('b auto', parents.autoNdx.length, parents.autoNdx, parents.name);
      console.log('b hand', parents.handNdx.length, parents.handNdx);
      //change from auto placed to hand placed if needed
      if ('auto' == parents.howPlaced[av.mouse.ParentNdx]) {
        parents.howPlaced[av.mouse.ParentNdx] = 'hand';
        makeHandAutoNdx(parents);
        //PlaceAncestors(parents);
      }
      console.log('auto', parents.autoNdx.length, parents.autoNdx, parents.name);
      console.log('hand', parents.handNdx.length, parents.handNdx);
    }
  }  // close on canvas
  //-------------------------------------------- dnd.trashCan
  else if ('TrashCanImage' == evt.target.id) {
    if (av.debug.mouse) console.log('parent->trashCan', evt);
    var node = dojo.byId(parents.domId[av.mouse.ParentNdx]);
    dnd.ancestorBox.parent.removeChild(node);
    dnd.ancestorBox.sync();

    //remove from main list.
    removeParent(av.mouse.ParentNdx, parents);
  }
  //-------------------------------------------- organism view
  else if ('organIcon' == evt.target.id) {
    dnd.activeOrgan.selectAll().deleteSelectedNodes();  //clear items
    dnd.activeOrgan.sync();   //should be done after insertion or deletion
    //Put name of offspring in dnd.activeOrganism
    dnd.activeOrgan.insertNodes(false, [{data: parents.name[av.mouse.ParentNdx], type: ["organism"]}]);
    dnd.activeOrgan.sync();
    //genome data should be in parents.genome[av.mouse.ParentNdx];
    fzr.actOrgan.genome = parents.genome[av.mouse.ParentNdx];
    fzr.actOrgan.name = parents.name[av.mouse.ParentNdx];
    fzr.actOrgan.domId = parents.domId[av.mouse.ParentNdx];
  }
}

function fromAncestorBoxRemove(removeName) {
  var domItems = Object.keys(dnd.ancestorBox.map);
  //console.log("domItems=", domItems);
  var nodeIndex = -1;
  for (var ii = 0; ii < domItems.length; ii++) { //http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
    if (dnd.ancestorBox.map[domItems[ii]].data == removeName) {
      nodeIndex = ii;
    }
  }
  var node = dojo.byId(domItems[nodeIndex]);
  console.log('nodeIndex', nodeIndex, domItems[nodeIndex]);
  dnd.ancestorBox.parent.removeChild(node);
  dnd.ancestorBox.sync();
}
