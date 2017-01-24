"use strict";

document.addEventListener("DOMContentLoaded", function() {
  const mouse = {
    click: false,
    move: false,
    pos: {x:0, y:0},
    posPrev: false
  }

  // Get canvas and create context
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  const width = canvas.parentElement.clientWidth;
  const height = canvas.parentElement.clientHeight;
  const socket = io.connect();

  // Set canvas to full browser width/height
  canvas.width = width;
  canvas.height = height;

  // Register mouse event handlers
  canvas.onmousedown = (e) => {
    mouse.click = true;
  }
  canvas.onmouseup = (e) => {
    mouse.click = false;
  }
  canvas.onmousemove = (e) => {
    // normalize mouse position 0.0 - 1.0
    const rect = canvas.getBoundingClientRect();
    mouse.pos.x = e.clientX - rect.left;
    mouse.pos.y = e.clientY - rect.top;
    mouse.move = true;
  }

  // draw line received from server
  socket.on('draw_line', (data) => {
    const line = data.line;
    context.beginPath();
    context.moveTo(line[0].x, line[0].y);
    context.lineTo(line[1].x, line[1].y);
    context.strokeStyle = "black";
    context.lineWidth = 4;
    context.stroke();
  });

  // mainloop running every 25ms
  function mainLoop() {
    // check if the user is drawing
    if (mouse.click && mouse.move && mouse.posPrev) {
      // send line to the server
      socket.emit('draw_line', { line: [mouse.pos, mouse.posPrev] });
      mouse.move = false;
    }
    mouse.posPrev = { x: mouse.pos.x, y: mouse.pos.y };
    setTimeout(mainLoop, 50);
  }
  mainLoop();


  /**
    * Clear the canvas
  */
  document.getElementById('clear-canvas').addEventListener('click', emitClearCanvas, false);
  function emitClearCanvas() {
    socket.emit('clear_canvas', { line: null });
  }

  socket.on('clear_canvas', (data) => {
    if (data.line == null) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
});


//////////
// // save canvas image as data url (png format by default)
// const dataURL = canvas.toDataURL();
//
// // set canvasImg image src to dataURL
// // so it can be saved as an image
// document.getElementById('canvasImg').src = dataURL;


// Draw dataURL onto the canvasImg
// const myCanvas = document.getElementById('my_canvas_id');
// const ctx = myCanvas.getContext('2d');
// const img = new Image;
// img.onload = function(){
//   ctx.drawImage(img,0,0); // Or at whatever offset you like
// };
// img.src = strDataURI;
