

//this does not work (diane)
av.aww.restartAvidaFn = function () {
  av.debug.log += '\n--User: Button: testRestartButton';
  console.log('in testRestartButton');
  av.debug.log += '\nAvida -->ui simulated level:error';
  restartMsgLabel.textContent = 'Avida message: simulated message from Avida'
  restartAvidaDialog.show();
  console.log('after dialog show');
}
