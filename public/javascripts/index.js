"use strict";
const Draw = require('./client');
const Toolbar = require('./toolbar');
const socket = io.connect();


const toolbar = new Toolbar();
const draw = new Draw();
draw.start();
const canvasProps = draw.getCanvasProperties();

// Display current line size
socket.on('update_line_size', (data) => {
  document.getElementById('line-size-display').innerHTML = data.size
});

/**
  *Toolbar Functions
*/

// Change line size
const lineSizes = document.getElementById('line-sizes').getElementsByTagName("li");
for (let i = 0; i < lineSizes.length; i++) {
  lineSizes[i].addEventListener('click', toolbar.emitChangeLineSize, false);
}
socket.on('change_line_size', (data) => {
  toolbar.changeLineSize(data.size);
});


// Clear the canvas
document.getElementById('clear-canvas').addEventListener('click', toolbar.emitClearCanvas, false);
socket.on('clear_canvas', (data) => {
  toolbar.clearCanvas(data);
});


const colors = document.getElementById("line-colors").getElementsByTagName("li");
for (let i = 0; i < colors.length; i++) {
  colors[i].addEventListener('click', toolbar.emitChangeColor, false);
}
socket.on('change_color', (data) => {
  toolbar.changeColor(data);
});
