"use strict";
const Draw = require('./client');
const draw = new Draw();
const canvasProps = draw.getCanvasProperties();
const socket = io.connect();

const Toolbar = function() {
  this.emitClearCanvas = function() {
    socket.emit('clear_canvas', { line: null });
  }

  this.clearCanvas = function(data) {
    // this is to check if line_history.length === 0 (bin/www)
    if (data.line == null) {
      canvasProps.context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // changes line width for individual strokes
  this.emitChangeLineSize = function() {
    socket.emit('change_line_size', { size: this.dataset.lineSize });
  }
  this.changeLineSize = function(size) {
    document.getElementById('line-size-display').innerHTML = size;
    canvasProps.context.lineWidth = size;
  }

  // changes color of individual strokes
  this.emitChangeColor = function() {
    socket.emit('change_color', { color: this.id })
  }
  this.changeColor = function(color) {
    canvasProps.context.strokeStyle = color;
  }

}

module.exports = Toolbar;
