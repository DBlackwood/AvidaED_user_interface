// Place Parent on grid

//---------- set Ancestors ------------------/
av.parents.placeAncestors = function () {
  //var cols = dijit.byId("sizeCols").get('value');
  var cols = av.dom.sizeCols.value;
  var rows = av.dom.sizeRows.value;
  //var rows = dijit.byId("sizeRows").get('value');
  var lngth;
  var cc, rr, ii;
  if (undefined != av.parents.autoNdx) {
    switch (av.parents.autoNdx.length) {
      case 1:   //Place in center
        av.parents.col[av.parents.autoNdx[0]] = Math.floor(cols / 2);
        av.parents.row[av.parents.autoNdx[0]] = Math.floor(rows / 2);
        av.parents.AvidaNdx[av.parents.autoNdx[0]] = av.parents.col[av.parents.autoNdx[0]] + cols * av.parents.row[av.parents.autoNdx[0]];
        break;
      case 2:
        if (cols > rows) {  //place av.parents horizontally
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * ii + 1) / 4);
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 2);
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        else {  //place av.parents vertically
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 2);
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * ii + 1) / 4);
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        break;
      case 3:
        if (cols > rows) {  //place av.parents horizontally
          for (ii = 0; ii < 2; ii++) {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * ii + 1) / 4);
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 3);
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
          av.parents.col[av.parents.autoNdx[2]] = Math.floor(cols / 2);
          av.parents.row[av.parents.autoNdx[2]] = Math.floor(rows * 2 / 3);
          av.parents.AvidaNdx[av.parents.autoNdx[2]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
        }
        else {  //place av.parents vertically
          for (ii = 0; ii < 2; ii++) {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 3);
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * ii + 1) / 4);
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
          av.parents.col[av.parents.autoNdx[2]] = Math.floor(cols * 2 / 3);
          av.parents.row[av.parents.autoNdx[2]] = Math.floor(rows / 2);
          av.parents.AvidaNdx[av.parents.autoNdx[2]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
        }
        break;
      case 4:
        //var cc, rr;
        lngth = av.parents.autoNdx.length;
        for (ii = 0; ii < lngth; ii++) {
          if (ii < 2) {
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 4)
          }
          else {
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * 3 / 4)
          }
          if (ii % 2 < 1) {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 4)
          }
          else {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * 3 / 4)
          }
          av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          //console.log('c,r,a', av.parents.col[av.parents.autoNdx[ii]],av.parents.row[av.parents.autoNdx[ii]],av.parents.AvidaNdx[av.parents.autoNdx[ii]]);
          //cc = av.parents.AvidaNdx[av.parents.autoNdx[ii]] % cols;
          //rr = Math.floor(av.parents.AvidaNdx[av.parents.autoNdx[ii]]/cols);
          //console.log('cols,rows, cc, rr', cols, rows, cc, rr);
        }
      case 5:
        lngth = av.parents.autoNdx.length;
        for (ii = 0; ii < lngth; ii++) {
          if (ii < 2) {
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 5);
          }
          else {
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * 4 / 5);
          }
          if (ii % 2 < 1) {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 5);
          }
          else {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * 4 / 5);
          }
          if (4 == ii) {
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 2);
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 2);
          }
          av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
        }
        break;
      case 6:
      //console.log('case6');
      case 7:
      //console.log('case7');
      /*          if (cols > rows) {  //place av.parents horizontally
       for (ii = 0; ii < av.parents.autoNdx.length; ii++) {
       if (ii<3) { av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows/4) }
       else { av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows*3/4) }
       cc = ii%3;
       av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols*(2*cc+1)/6);
       //console.log('ii, cc, col, row',ii, cc, av.parents.col[av.parents.autoNdx[ii]], av.parents.row[av.parents.autoNdx[ii]]);
       if (6 == ii) {
       av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols/2);
       av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows/2);
       }
       av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
       }
       }
       else {
       for (ii = 0; ii < av.parents.autoNdx.length; ii++) {
       if (ii<3) { av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols/4) }
       else { av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols*3/4) }
       cc = ii%3;
       av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows*(2*cc+1)/6);
       if (6 == ii) {
       av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols/2);
       av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows/2);
       }
       av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
       }
       }
       break; */
      case 8:
        if (0 != cols % 2) cols = cols - 1;
        if (0 != rows % 2) rows = rows - 1;
        if (cols > rows) {  //place av.parents horizontally
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 3) {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 4)
            }
            else {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * 3 / 4)
            }
            cc = ii % 3;
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * cc + 1) / 6);
            //console.log('ii, cc, col, row',ii, cc, av.parents.col[av.parents.autoNdx[ii]], av.parents.row[av.parents.autoNdx[ii]]);
            if (6 <= ii) {
              cc = ii - 5;
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * cc / 3);
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 2);
            }
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        else {
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 3) {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 4)
            }
            else {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * 3 / 4)
            }
            cc = ii % 3;
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * cc + 1) / 6);
            if (6 <= ii) {
              cc = ii - 5;
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * cc / 3);
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 2);
            }
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        break;
      case 9:
        //console.log('case9');
        lngth = av.parents.autoNdx.length;
        for (ii = 0; ii < lngth; ii++) {
          if (ii < 3) {
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 5)
          }
          else if (ii < 6) {
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 2)
          }
          else {
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * 4 / 5)
          }
          cc = ii % 3;
          av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * cc + 1) / 6);
          av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
        }
        break;
      case 10:
        if (cols > rows) {  //place av.parents horizontally
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 4) {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 4)
            }
            else {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * 3 / 4)
            }
            cc = ii % 4;
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * cc + 1) / 8);
            //console.log('ii, cc, col, row',ii, cc, av.parents.col[av.parents.autoNdx[ii]], av.parents.row[av.parents.autoNdx[ii]]);
            if (8 <= ii) {
              cc = ii - 8;
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * cc + 1) / 4);
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 2);
            }
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        else {
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 4) {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 4)
            }
            else {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * 3 / 4)
            }
            cc = ii % 4;
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * cc + 1) / 8);
            if (8 <= ii) {
              cc = ii - 8;
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * cc + 1) / 4);
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 2);
            }
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        break;
      case 11:
        if (cols > rows) {  //place av.parents horizontally
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 4) {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 5)
            }
            else {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * 4 / 5)
            }
            cc = ii % 4;
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * cc + 1) / 8);
            if (8 <= ii) {
              cc = ii - 7;
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * cc / 4);
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 2);
            }
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        else {
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 4) {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 5)
            }
            else {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * 4 / 5)
            }
            cc = ii % 4;
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * cc + 1) / 8);
            if (8 <= ii) {
              cc = ii - 7;
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * cc / 4);
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 2);
            }
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        break;
      case 12:
        if (cols > rows) {  //place av.parents horizontally
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 4) {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 6)
            }
            else if (ii < 8) {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows / 2)
            }
            else {
              av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * 5 / 6)
            }
            cc = ii % 4;
            av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * cc + 1) / 8);
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        else {
          lngth = av.parents.autoNdx.length;
          for (ii = 0; ii < lngth; ii++) {
            if (ii < 4) {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 6)
            }
            else if (ii < 8) {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols / 2)
            }
            else {
              av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * 5 / 6)
            }
            cc = ii % 4;
            av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * cc + 1) / 8);
            av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
          }
        }
        break;
      default:
        //console.log('bigger than 12');
        if (Math.floor(Math.sqrt(av.parents.autoNdx.length)) == Math.sqrt(av.parents.autoNdx.length)) {
          sqLength = Math.sqrt(av.parents.autoNdx.length);
        }
        else {
          sqLength = Math.floor(Math.sqrt(av.parents.autoNdx.length)) + 1;
        }
        lngth = av.parents.autoNdx.length;
        for (ii = 0; ii < lngth; ii++) {
          cc = ii % sqLength;
          rr = Math.floor(ii / sqLength);
          av.parents.col[av.parents.autoNdx[ii]] = Math.floor(cols * (2 * cc + 1) / (2 * sqLength));
          av.parents.row[av.parents.autoNdx[ii]] = Math.floor(rows * (2 * rr + 1) / (2 * sqLength));
          av.parents.AvidaNdx[av.parents.autoNdx[ii]] = av.parents.col[av.parents.autoNdx[ii]] + cols * av.parents.row[av.parents.autoNdx[ii]];
        }
        break;
    }
  }
  //console.log('rows, cols, AnBoxCnt', rows, cols, av.parents.autoNdx.length);
  //for (ii=0; ii< av.parents.autoNdx.length; ii++) {
  //  console.log("ii, col, row, ii", ii, av.parents.col[av.parents.autoNdx[ii]], av.parents.row[av.parents.autoNdx[ii]], av.parents.AvidaNdx[av.parents.autoNdx[ii]]);
  //}
}

av.parents.makeHandAutoNdx = function () {
  'use strict';
  var hh = 0;  //index into hand placed
  var aa = 0;  //index into auto placed
  av.parents.handNdx = [];
  av.parents.autoNdx = [];
  var lngth = av.parents.name.length;
  for (var ii = 0; ii < lngth; ii++) {
    if ('hand' == av.parents.howPlaced[ii]) {
      av.parents.handNdx[hh] = ii;
      hh++;
    }
    else if ('auto' == av.parents.howPlaced[ii]) {
      av.parents.autoNdx[aa] = ii;
      aa++;
    }
  }
}

//removes the parent at index ParentNdx
av.parents.removeParent = function (ParentNdx) {
  'use strict';
  //if (av.debug.dnd) console.log('rP', av.parents.Colors)
  if (av.debug.dnd) console.log('rp ndx, domId, av.parents',ParentNdx, av.parents.domid, av.parents);
  av.parents.Colors.push(av.parents.color[ParentNdx]);
  av.parents.color.splice(ParentNdx, 1);
  av.parents.name.splice(ParentNdx, 1);
  av.parents.genome.splice(ParentNdx, 1);
  av.parents.col.splice(ParentNdx, 1);
  av.parents.row.splice(ParentNdx, 1);
  av.parents.AvidaNdx.splice(ParentNdx, 1);
  av.parents.howPlaced.splice(ParentNdx, 1);
  av.parents.domid.splice(ParentNdx, 1);
  av.parents.makeHandAutoNdx();
};


/* tell click apart from drag 
 * http://jsfiddle.net/0egur10s/2/
 * http://stackoverflow.com/questions/6042202/how-to-distinguish-mouse-click-and-drag
*/

/* canvas dragging images website examples
 * drag a box into a rectangle and it cannot leave 
 * http://jsfiddle.net/achudars/7h87a/
 * 
 * move box around that changes color with hover
 * http://jsfiddle.net/ARTsinn/DDZjA/
 * 
 * move red square around the canvas
 * http://jsfiddle.net/davidbarszczak/EnZEa/
 * 
 * Dragging objects on a canvas 
 * http://rectangleworld.com/blog/archives/129
 * http://rectangleworld.com/blog/archives/15
 * 
 * example with download
 * http://html5.litten.com/how-to-drag-and-drop-on-an-html5-canvas/
 * 
 * Move image from one canvas to another 
 * http://www.w3schools.com/html/html5_draganddrop.asp
 * http://www.w3schools.com/html/tryit.asp?filename=tryhtml5_draganddrop2
 * http://www.rgraph.net/blog/2013/january/an-example-of-html5-canvas-drag-and-drop.html
*/

/*move image to canvas and move it around on the canvase
 * http://jsfiddle.net/XU2a3/41/

/* We sites from Matt
 * https://jsfiddle.net/vozmegt9/7/#run
 * https://github.com/ruppmatt/avida-test-ui
 */

/* Comparison of Javascript frameworks
 * https://en.wikipedia.org/wiki/Comparison_of_JavaScript_frameworks
 * 
 * Analogizing jQuery and Dojo
 * http://thetascript.com/jqueryvsdojo/
*/

/* git hub info
 * http://gitready.com
 * http://rogerdudler.github.io/git-guide/

/* Dojo
 * The Definitive Guide
 * http://chimera.labs.oreilly.com/books/1234000001819/index.html
 * http://chimera.labs.oreilly.com/books/1234000001819/ch02.html
 * 
 * Down load 
 * http://dojotoolkit.org/download/#github
 * 
 * Dojo 10.2 guide
 * https://dojotoolkit.org/documentation/tutorials/1.10/modern_dojo/
 * 
 * DND example Junk outlet example
 * https://www.sitepen.com/blog/2011/12/05/dojo-drag-n-drop-redux/
 * 
 * DND intro
 * http://dojotoolkit.org/reference-guide/1.10/dojo/dnd.html
 * 
 * DND source
 * https://dojotoolkit.org/api/?qs=1.7/dojo/dnd/Source#singular
 * 
 * DND Move a node programatically 
 * http://stackoverflow.com/questions/1812148/dojo-dnd-move-node-programmatically
 * 
 * DND access newley copied node  
 * http://stackoverflow.com/questions/1632689/dojo-dnd-how-to-access-newly-copied-node-on-ondnddrop-event
 * 
 * Stop Drag should over ride checkAcceptance
 * http://stackoverflow.com/questions/2859188/dojo-drag-and-drop-stop-drag
 * 
 * 00fc91d4a98002ba5fdbee7bfa12eb58f129dd60
*/


//************************************************************************
//Functions not in use, but might be usefull; could be deleted -----------
//************************************************************************

//http://stackoverflow.com/questions/5837558/dojo-drag-and-drop-how-to-retrieve-order-of-items
//var orderedDataItems = source.getAllNodes().map(function(node){
//    return source.getItem(node.id).data;
//});

// from http://dojotoolkit.org/reference-guide/1.10/dojo/dnd.html
function OrderedItem(container, f, o){
  // similar to:
  // container.forInItems(f, o);
  // but iterates in the listed order
  o = o || dojo.global;
  container.getAllNodes().forEach(function(node){
    var id = node.id;
    f.call(o, container.getItem(id), id, container);
  });
}

//sigmoid for use in converting a floating point into hue, saturation, brightness
function sigmoid (xx, midpoint, steepness) {
  var val = steepness * (xx-midpoint);
  return Math.exp(val) /(1.0 + Math.exp(val));
}

//Draw arc using quadraticCurve and 1 control point http://www.w3schools.com/tags/canvas_quadraticcurveto.asp
function drawArc1(gen, spot1, spot2, rep){
  var xx1, yy1, xx2, yy2, xxc, yyc;
  ctx.lineWidth = 1;
  if (0 < spot2 - spot1) {
    ctx.strokeStyle = av.color.names["Black"];  //set the line to a color which can also be a gradient see http://www.w3schools.com/canvas/canvas_clock_face.asp
  } else { ctx.strokeStyle = av.color.names["Red"];}
  ctx.beginPath();
  xx1 = av.ind.cx[0] + av.ind.tanR*Math.cos(spot1*2*Math.PI/av.ind.size[0]); //Draw line from Spot1
  yy1 = av.ind.cy[0] + av.ind.tanR*Math.sin(spot1*2*Math.PI/av.ind.size[0]);
  ctx.moveTo(xx1, yy1);
  xx2 = av.ind.cx[0] + av.ind.tanR*Math.cos(spot2*2*Math.PI/av.ind.size[0]); //Draw line to Spot2
  yy2 = av.ind.cy[0] + av.ind.tanR*Math.sin(spot2*2*Math.PI/av.ind.size[0]);
  //Set Control point on line perpendicular to line between Spot1 & spot2
  av.ind.pathR = av.ind.bigR-(2+rep)*av.ind.smallR;
  xxc = av.ind.cx[0] + av.ind.pathR*Math.cos(spot2*2*Math.PI/av.ind.size[0] + (spot1-spot2)*(Math.PI)/av.ind.size[0]);
  yyc = av.ind.cy[0] + av.ind.pathR*Math.sin(spot2*2*Math.PI/av.ind.size[0] + (spot1-spot2)*(Math.PI)/av.ind.size[0]);
  ctx.quadraticCurveTo(xxc, yyc, xx2, yy2);
  ctx.stroke();
}

