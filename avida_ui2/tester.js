var uiWorker = new Worker('ui-test.js');


function doRunPause() {
   var request = {
      'Key':'RunPause'
   };
   uiWorker.postMessage(request);
}

function doReset() {
   var request = {
      'Key':'Reset'
   };
   uiWorker.postMessage(request);
}

uiWorker.onmessage = function(e){
   var data = e.data;
   console.log(data);
}


