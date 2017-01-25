"use strict";

const Draw = function() {
  this.getCanvasProperties = function() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;
    return {
      canvas: canvas,
      context: context,
      width: width,
      height: height
    }
  }

  this.start = function() {
    const that= this;
    document.addEventListener("DOMContentLoaded", function() {
      const mouse = {
        click: false,
        move: false,
        pos: {x:0, y:0},
        posPrev: false
      }

      // Get canvas and create context
      const cProps = that.getCanvasProperties();
      const canvas = cProps.canvas;
      const context = cProps.context;
      const width = cProps.width;
      const height = cProps.height;
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
        context.strokeStyle = data.color || 'black';
        context.lineWidth = data.size || 1;
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
    });
  }
}

module.exports = Draw;
