/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var Draw = __webpack_require__(2);
	var Toolbar = __webpack_require__(3);
	var socket = io.connect();
	
	var toolbar = new Toolbar();
	var draw = new Draw();
	draw.start();
	var canvasProps = draw.getCanvasProperties();
	
	// Display current line size
	socket.on('update_line_size', function (data) {
	  document.getElementById('line-size-display').innerHTML = data.size;
	});
	
	/**
	  *Toolbar Functions
	*/
	
	// Change line size
	var lineSizes = document.getElementById('line-sizes').getElementsByTagName("li");
	for (var i = 0; i < lineSizes.length; i++) {
	  lineSizes[i].addEventListener('click', toolbar.emitChangeLineSize, false);
	}
	socket.on('change_line_size', function (data) {
	  toolbar.changeLineSize(data.size);
	});
	
	// Clear the canvas
	document.getElementById('clear-canvas').addEventListener('click', toolbar.emitClearCanvas, false);
	socket.on('clear_canvas', function (data) {
	  toolbar.clearCanvas(data);
	});
	
	var colors = document.getElementById("line-colors").getElementsByTagName("li");
	for (var _i = 0; _i < colors.length; _i++) {
	  colors[_i].addEventListener('click', toolbar.emitChangeColor, false);
	}
	socket.on('change_color', function (data) {
	  toolbar.changeColor(data);
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	var Draw = function Draw() {
	  this.getCanvasProperties = function () {
	    var canvas = document.getElementById('canvas');
	    var context = canvas.getContext('2d');
	    var width = canvas.parentElement.clientWidth;
	    var height = canvas.parentElement.clientHeight;
	    return {
	      canvas: canvas,
	      context: context,
	      width: width,
	      height: height
	    };
	  };
	
	  this.start = function () {
	    var that = this;
	    document.addEventListener("DOMContentLoaded", function () {
	      var mouse = {
	        click: false,
	        move: false,
	        pos: { x: 0, y: 0 },
	        posPrev: false
	      };
	
	      // Get canvas and create context
	      var cProps = that.getCanvasProperties();
	      var canvas = cProps.canvas;
	      var context = cProps.context;
	      var width = cProps.width;
	      var height = cProps.height;
	      var socket = io.connect();
	
	      // Set canvas to full browser width/height
	      canvas.width = width;
	      canvas.height = height;
	
	      // Register mouse event handlers
	      canvas.onmousedown = function (e) {
	        mouse.click = true;
	      };
	      canvas.onmouseup = function (e) {
	        mouse.click = false;
	      };
	      canvas.onmousemove = function (e) {
	        // normalize mouse position 0.0 - 1.0
	        var rect = canvas.getBoundingClientRect();
	        mouse.pos.x = e.clientX - rect.left;
	        mouse.pos.y = e.clientY - rect.top;
	        mouse.move = true;
	      };
	
	      // draw line received from server
	      socket.on('draw_line', function (data) {
	        var line = data.line;
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
	  };
	};
	
	module.exports = Draw;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var Draw = __webpack_require__(2);
	var draw = new Draw();
	var canvasProps = draw.getCanvasProperties();
	var socket = io.connect();
	
	var Toolbar = function Toolbar() {
	  this.emitClearCanvas = function () {
	    socket.emit('clear_canvas', { line: null });
	  };
	
	  this.clearCanvas = function (data) {
	    // this is to check if line_history.length === 0 (bin/www)
	    if (data.line == null) {
	      canvasProps.context.clearRect(0, 0, canvas.width, canvas.height);
	    }
	  };
	
	  // changes line width for individual strokes
	  this.emitChangeLineSize = function () {
	    socket.emit('change_line_size', { size: this.dataset.lineSize });
	  };
	  this.changeLineSize = function (size) {
	    document.getElementById('line-size-display').innerHTML = size;
	    canvasProps.context.lineWidth = size;
	  };
	
	  // changes color of individual strokes
	  this.emitChangeColor = function () {
	    socket.emit('change_color', { color: this.id });
	  };
	  this.changeColor = function (color) {
	    canvasProps.context.strokeStyle = color;
	  };
	};
	
	module.exports = Toolbar;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYmMwMDFhOTRkYjkwZWUwM2Y4NGQiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2phdmFzY3JpcHRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL3B1YmxpYy9qYXZhc2NyaXB0cy9jbGllbnQuanMiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2phdmFzY3JpcHRzL3Rvb2xiYXIuanMiXSwibmFtZXMiOlsiRHJhdyIsInJlcXVpcmUiLCJUb29sYmFyIiwic29ja2V0IiwiaW8iLCJjb25uZWN0IiwidG9vbGJhciIsImRyYXciLCJzdGFydCIsImNhbnZhc1Byb3BzIiwiZ2V0Q2FudmFzUHJvcGVydGllcyIsIm9uIiwiZGF0YSIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJpbm5lckhUTUwiLCJzaXplIiwibGluZVNpemVzIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJpIiwibGVuZ3RoIiwiYWRkRXZlbnRMaXN0ZW5lciIsImVtaXRDaGFuZ2VMaW5lU2l6ZSIsImNoYW5nZUxpbmVTaXplIiwiZW1pdENsZWFyQ2FudmFzIiwiY2xlYXJDYW52YXMiLCJjb2xvcnMiLCJlbWl0Q2hhbmdlQ29sb3IiLCJjaGFuZ2VDb2xvciIsImNhbnZhcyIsImNvbnRleHQiLCJnZXRDb250ZXh0Iiwid2lkdGgiLCJwYXJlbnRFbGVtZW50IiwiY2xpZW50V2lkdGgiLCJoZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJ0aGF0IiwibW91c2UiLCJjbGljayIsIm1vdmUiLCJwb3MiLCJ4IiwieSIsInBvc1ByZXYiLCJjUHJvcHMiLCJvbm1vdXNlZG93biIsImUiLCJvbm1vdXNldXAiLCJvbm1vdXNlbW92ZSIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJjbGllbnRYIiwibGVmdCIsImNsaWVudFkiLCJ0b3AiLCJsaW5lIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwibGluZVRvIiwic3Ryb2tlU3R5bGUiLCJjb2xvciIsImxpbmVXaWR0aCIsInN0cm9rZSIsIm1haW5Mb29wIiwiZW1pdCIsInNldFRpbWVvdXQiLCJtb2R1bGUiLCJleHBvcnRzIiwiY2xlYXJSZWN0IiwiZGF0YXNldCIsImxpbmVTaXplIiwiaWQiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ3RDQTs7QUFDQSxLQUFNQSxPQUFPLG1CQUFBQyxDQUFRLENBQVIsQ0FBYjtBQUNBLEtBQU1DLFVBQVUsbUJBQUFELENBQVEsQ0FBUixDQUFoQjtBQUNBLEtBQU1FLFNBQVNDLEdBQUdDLE9BQUgsRUFBZjs7QUFHQSxLQUFNQyxVQUFVLElBQUlKLE9BQUosRUFBaEI7QUFDQSxLQUFNSyxPQUFPLElBQUlQLElBQUosRUFBYjtBQUNBTyxNQUFLQyxLQUFMO0FBQ0EsS0FBTUMsY0FBY0YsS0FBS0csbUJBQUwsRUFBcEI7O0FBRUE7QUFDQVAsUUFBT1EsRUFBUCxDQUFVLGtCQUFWLEVBQThCLFVBQUNDLElBQUQsRUFBVTtBQUN0Q0MsWUFBU0MsY0FBVCxDQUF3QixtQkFBeEIsRUFBNkNDLFNBQTdDLEdBQXlESCxLQUFLSSxJQUE5RDtBQUNELEVBRkQ7O0FBSUE7Ozs7QUFJQTtBQUNBLEtBQU1DLFlBQVlKLFNBQVNDLGNBQVQsQ0FBd0IsWUFBeEIsRUFBc0NJLG9CQUF0QyxDQUEyRCxJQUEzRCxDQUFsQjtBQUNBLE1BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRixVQUFVRyxNQUE5QixFQUFzQ0QsR0FBdEMsRUFBMkM7QUFDekNGLGFBQVVFLENBQVYsRUFBYUUsZ0JBQWIsQ0FBOEIsT0FBOUIsRUFBdUNmLFFBQVFnQixrQkFBL0MsRUFBbUUsS0FBbkU7QUFDRDtBQUNEbkIsUUFBT1EsRUFBUCxDQUFVLGtCQUFWLEVBQThCLFVBQUNDLElBQUQsRUFBVTtBQUN0Q04sV0FBUWlCLGNBQVIsQ0FBdUJYLEtBQUtJLElBQTVCO0FBQ0QsRUFGRDs7QUFLQTtBQUNBSCxVQUFTQyxjQUFULENBQXdCLGNBQXhCLEVBQXdDTyxnQkFBeEMsQ0FBeUQsT0FBekQsRUFBa0VmLFFBQVFrQixlQUExRSxFQUEyRixLQUEzRjtBQUNBckIsUUFBT1EsRUFBUCxDQUFVLGNBQVYsRUFBMEIsVUFBQ0MsSUFBRCxFQUFVO0FBQ2xDTixXQUFRbUIsV0FBUixDQUFvQmIsSUFBcEI7QUFDRCxFQUZEOztBQUtBLEtBQU1jLFNBQVNiLFNBQVNDLGNBQVQsQ0FBd0IsYUFBeEIsRUFBdUNJLG9CQUF2QyxDQUE0RCxJQUE1RCxDQUFmO0FBQ0EsTUFBSyxJQUFJQyxLQUFJLENBQWIsRUFBZ0JBLEtBQUlPLE9BQU9OLE1BQTNCLEVBQW1DRCxJQUFuQyxFQUF3QztBQUN0Q08sVUFBT1AsRUFBUCxFQUFVRSxnQkFBVixDQUEyQixPQUEzQixFQUFvQ2YsUUFBUXFCLGVBQTVDLEVBQTZELEtBQTdEO0FBQ0Q7QUFDRHhCLFFBQU9RLEVBQVAsQ0FBVSxjQUFWLEVBQTBCLFVBQUNDLElBQUQsRUFBVTtBQUNsQ04sV0FBUXNCLFdBQVIsQ0FBb0JoQixJQUFwQjtBQUNELEVBRkQsRTs7Ozs7O0FDekNBOztBQUVBLEtBQU1aLE9BQU8sU0FBUEEsSUFBTyxHQUFXO0FBQ3RCLFFBQUtVLG1CQUFMLEdBQTJCLFlBQVc7QUFDcEMsU0FBTW1CLFNBQVNoQixTQUFTQyxjQUFULENBQXdCLFFBQXhCLENBQWY7QUFDQSxTQUFNZ0IsVUFBVUQsT0FBT0UsVUFBUCxDQUFrQixJQUFsQixDQUFoQjtBQUNBLFNBQU1DLFFBQVFILE9BQU9JLGFBQVAsQ0FBcUJDLFdBQW5DO0FBQ0EsU0FBTUMsU0FBU04sT0FBT0ksYUFBUCxDQUFxQkcsWUFBcEM7QUFDQSxZQUFPO0FBQ0xQLGVBQVFBLE1BREg7QUFFTEMsZ0JBQVNBLE9BRko7QUFHTEUsY0FBT0EsS0FIRjtBQUlMRyxlQUFRQTtBQUpILE1BQVA7QUFNRCxJQVhEOztBQWFBLFFBQUszQixLQUFMLEdBQWEsWUFBVztBQUN0QixTQUFNNkIsT0FBTSxJQUFaO0FBQ0F4QixjQUFTUSxnQkFBVCxDQUEwQixrQkFBMUIsRUFBOEMsWUFBVztBQUN2RCxXQUFNaUIsUUFBUTtBQUNaQyxnQkFBTyxLQURLO0FBRVpDLGVBQU0sS0FGTTtBQUdaQyxjQUFLLEVBQUNDLEdBQUUsQ0FBSCxFQUFNQyxHQUFFLENBQVIsRUFITztBQUlaQyxrQkFBUztBQUpHLFFBQWQ7O0FBT0E7QUFDQSxXQUFNQyxTQUFTUixLQUFLM0IsbUJBQUwsRUFBZjtBQUNBLFdBQU1tQixTQUFTZ0IsT0FBT2hCLE1BQXRCO0FBQ0EsV0FBTUMsVUFBVWUsT0FBT2YsT0FBdkI7QUFDQSxXQUFNRSxRQUFRYSxPQUFPYixLQUFyQjtBQUNBLFdBQU1HLFNBQVNVLE9BQU9WLE1BQXRCO0FBQ0EsV0FBTWhDLFNBQVNDLEdBQUdDLE9BQUgsRUFBZjs7QUFFQTtBQUNBd0IsY0FBT0csS0FBUCxHQUFlQSxLQUFmO0FBQ0FILGNBQU9NLE1BQVAsR0FBZ0JBLE1BQWhCOztBQUVBO0FBQ0FOLGNBQU9pQixXQUFQLEdBQXFCLFVBQUNDLENBQUQsRUFBTztBQUMxQlQsZUFBTUMsS0FBTixHQUFjLElBQWQ7QUFDRCxRQUZEO0FBR0FWLGNBQU9tQixTQUFQLEdBQW1CLFVBQUNELENBQUQsRUFBTztBQUN4QlQsZUFBTUMsS0FBTixHQUFjLEtBQWQ7QUFDRCxRQUZEO0FBR0FWLGNBQU9vQixXQUFQLEdBQXFCLFVBQUNGLENBQUQsRUFBTztBQUMxQjtBQUNBLGFBQU1HLE9BQU9yQixPQUFPc0IscUJBQVAsRUFBYjtBQUNBYixlQUFNRyxHQUFOLENBQVVDLENBQVYsR0FBY0ssRUFBRUssT0FBRixHQUFZRixLQUFLRyxJQUEvQjtBQUNBZixlQUFNRyxHQUFOLENBQVVFLENBQVYsR0FBY0ksRUFBRU8sT0FBRixHQUFZSixLQUFLSyxHQUEvQjtBQUNBakIsZUFBTUUsSUFBTixHQUFhLElBQWI7QUFDRCxRQU5EOztBQVFBO0FBQ0FyQyxjQUFPUSxFQUFQLENBQVUsV0FBVixFQUF1QixVQUFDQyxJQUFELEVBQVU7QUFDL0IsYUFBTTRDLE9BQU81QyxLQUFLNEMsSUFBbEI7QUFDQTFCLGlCQUFRMkIsU0FBUjtBQUNBM0IsaUJBQVE0QixNQUFSLENBQWVGLEtBQUssQ0FBTCxFQUFRZCxDQUF2QixFQUEwQmMsS0FBSyxDQUFMLEVBQVFiLENBQWxDO0FBQ0FiLGlCQUFRNkIsTUFBUixDQUFlSCxLQUFLLENBQUwsRUFBUWQsQ0FBdkIsRUFBMEJjLEtBQUssQ0FBTCxFQUFRYixDQUFsQztBQUNBYixpQkFBUThCLFdBQVIsR0FBc0JoRCxLQUFLaUQsS0FBTCxJQUFjLE9BQXBDO0FBQ0EvQixpQkFBUWdDLFNBQVIsR0FBb0JsRCxLQUFLSSxJQUFMLElBQWEsQ0FBakM7QUFDQWMsaUJBQVFpQyxNQUFSO0FBQ0QsUUFSRDs7QUFVQTtBQUNBLGdCQUFTQyxRQUFULEdBQW9CO0FBQ2xCO0FBQ0EsYUFBSTFCLE1BQU1DLEtBQU4sSUFBZUQsTUFBTUUsSUFBckIsSUFBNkJGLE1BQU1NLE9BQXZDLEVBQWdEO0FBQzlDO0FBQ0F6QyxrQkFBTzhELElBQVAsQ0FBWSxXQUFaLEVBQXlCLEVBQUVULE1BQU0sQ0FBQ2xCLE1BQU1HLEdBQVAsRUFBWUgsTUFBTU0sT0FBbEIsQ0FBUixFQUF6QjtBQUNBTixpQkFBTUUsSUFBTixHQUFhLEtBQWI7QUFDRDtBQUNERixlQUFNTSxPQUFOLEdBQWdCLEVBQUVGLEdBQUdKLE1BQU1HLEdBQU4sQ0FBVUMsQ0FBZixFQUFrQkMsR0FBR0wsTUFBTUcsR0FBTixDQUFVRSxDQUEvQixFQUFoQjtBQUNBdUIsb0JBQVdGLFFBQVgsRUFBcUIsRUFBckI7QUFDRDtBQUNEQTtBQUNELE1BMUREO0FBMkRELElBN0REO0FBOERELEVBNUVEOztBQThFQUcsUUFBT0MsT0FBUCxHQUFpQnBFLElBQWpCLEM7Ozs7OztBQ2hGQTs7QUFDQSxLQUFNQSxPQUFPLG1CQUFBQyxDQUFRLENBQVIsQ0FBYjtBQUNBLEtBQU1NLE9BQU8sSUFBSVAsSUFBSixFQUFiO0FBQ0EsS0FBTVMsY0FBY0YsS0FBS0csbUJBQUwsRUFBcEI7QUFDQSxLQUFNUCxTQUFTQyxHQUFHQyxPQUFILEVBQWY7O0FBRUEsS0FBTUgsVUFBVSxTQUFWQSxPQUFVLEdBQVc7QUFDekIsUUFBS3NCLGVBQUwsR0FBdUIsWUFBVztBQUNoQ3JCLFlBQU84RCxJQUFQLENBQVksY0FBWixFQUE0QixFQUFFVCxNQUFNLElBQVIsRUFBNUI7QUFDRCxJQUZEOztBQUlBLFFBQUsvQixXQUFMLEdBQW1CLFVBQVNiLElBQVQsRUFBZTtBQUNoQztBQUNBLFNBQUlBLEtBQUs0QyxJQUFMLElBQWEsSUFBakIsRUFBdUI7QUFDckIvQyxtQkFBWXFCLE9BQVosQ0FBb0J1QyxTQUFwQixDQUE4QixDQUE5QixFQUFpQyxDQUFqQyxFQUFvQ3hDLE9BQU9HLEtBQTNDLEVBQWtESCxPQUFPTSxNQUF6RDtBQUNEO0FBQ0YsSUFMRDs7QUFPQTtBQUNBLFFBQUtiLGtCQUFMLEdBQTBCLFlBQVc7QUFDbkNuQixZQUFPOEQsSUFBUCxDQUFZLGtCQUFaLEVBQWdDLEVBQUVqRCxNQUFNLEtBQUtzRCxPQUFMLENBQWFDLFFBQXJCLEVBQWhDO0FBQ0QsSUFGRDtBQUdBLFFBQUtoRCxjQUFMLEdBQXNCLFVBQVNQLElBQVQsRUFBZTtBQUNuQ0gsY0FBU0MsY0FBVCxDQUF3QixtQkFBeEIsRUFBNkNDLFNBQTdDLEdBQXlEQyxJQUF6RDtBQUNBUCxpQkFBWXFCLE9BQVosQ0FBb0JnQyxTQUFwQixHQUFnQzlDLElBQWhDO0FBQ0QsSUFIRDs7QUFLQTtBQUNBLFFBQUtXLGVBQUwsR0FBdUIsWUFBVztBQUNoQ3hCLFlBQU84RCxJQUFQLENBQVksY0FBWixFQUE0QixFQUFFSixPQUFPLEtBQUtXLEVBQWQsRUFBNUI7QUFDRCxJQUZEO0FBR0EsUUFBSzVDLFdBQUwsR0FBbUIsVUFBU2lDLEtBQVQsRUFBZ0I7QUFDakNwRCxpQkFBWXFCLE9BQVosQ0FBb0I4QixXQUFwQixHQUFrQ0MsS0FBbEM7QUFDRCxJQUZEO0FBSUQsRUE3QkQ7O0FBK0JBTSxRQUFPQyxPQUFQLEdBQWlCbEUsT0FBakIsQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBiYzAwMWE5NGRiOTBlZTAzZjg0ZCIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgRHJhdyA9IHJlcXVpcmUoJy4vY2xpZW50Jyk7XG5jb25zdCBUb29sYmFyID0gcmVxdWlyZSgnLi90b29sYmFyJyk7XG5jb25zdCBzb2NrZXQgPSBpby5jb25uZWN0KCk7XG5cblxuY29uc3QgdG9vbGJhciA9IG5ldyBUb29sYmFyKCk7XG5jb25zdCBkcmF3ID0gbmV3IERyYXcoKTtcbmRyYXcuc3RhcnQoKTtcbmNvbnN0IGNhbnZhc1Byb3BzID0gZHJhdy5nZXRDYW52YXNQcm9wZXJ0aWVzKCk7XG5cbi8vIERpc3BsYXkgY3VycmVudCBsaW5lIHNpemVcbnNvY2tldC5vbigndXBkYXRlX2xpbmVfc2l6ZScsIChkYXRhKSA9PiB7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaW5lLXNpemUtZGlzcGxheScpLmlubmVySFRNTCA9IGRhdGEuc2l6ZVxufSk7XG5cbi8qKlxuICAqVG9vbGJhciBGdW5jdGlvbnNcbiovXG5cbi8vIENoYW5nZSBsaW5lIHNpemVcbmNvbnN0IGxpbmVTaXplcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsaW5lLXNpemVzJykuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJsaVwiKTtcbmZvciAobGV0IGkgPSAwOyBpIDwgbGluZVNpemVzLmxlbmd0aDsgaSsrKSB7XG4gIGxpbmVTaXplc1tpXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvb2xiYXIuZW1pdENoYW5nZUxpbmVTaXplLCBmYWxzZSk7XG59XG5zb2NrZXQub24oJ2NoYW5nZV9saW5lX3NpemUnLCAoZGF0YSkgPT4ge1xuICB0b29sYmFyLmNoYW5nZUxpbmVTaXplKGRhdGEuc2l6ZSk7XG59KTtcblxuXG4vLyBDbGVhciB0aGUgY2FudmFzXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xlYXItY2FudmFzJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b29sYmFyLmVtaXRDbGVhckNhbnZhcywgZmFsc2UpO1xuc29ja2V0Lm9uKCdjbGVhcl9jYW52YXMnLCAoZGF0YSkgPT4ge1xuICB0b29sYmFyLmNsZWFyQ2FudmFzKGRhdGEpO1xufSk7XG5cblxuY29uc3QgY29sb3JzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaW5lLWNvbG9yc1wiKS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImxpXCIpO1xuZm9yIChsZXQgaSA9IDA7IGkgPCBjb2xvcnMubGVuZ3RoOyBpKyspIHtcbiAgY29sb3JzW2ldLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9vbGJhci5lbWl0Q2hhbmdlQ29sb3IsIGZhbHNlKTtcbn1cbnNvY2tldC5vbignY2hhbmdlX2NvbG9yJywgKGRhdGEpID0+IHtcbiAgdG9vbGJhci5jaGFuZ2VDb2xvcihkYXRhKTtcbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcHVibGljL2phdmFzY3JpcHRzL2luZGV4LmpzIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IERyYXcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5nZXRDYW52YXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb25zdCB3aWR0aCA9IGNhbnZhcy5wYXJlbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhcy5wYXJlbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICByZXR1cm4ge1xuICAgICAgY2FudmFzOiBjYW52YXMsXG4gICAgICBjb250ZXh0OiBjb250ZXh0LFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHRcbiAgICB9XG4gIH1cblxuICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgdGhhdD0gdGhpcztcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1vdXNlID0ge1xuICAgICAgICBjbGljazogZmFsc2UsXG4gICAgICAgIG1vdmU6IGZhbHNlLFxuICAgICAgICBwb3M6IHt4OjAsIHk6MH0sXG4gICAgICAgIHBvc1ByZXY6IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBjYW52YXMgYW5kIGNyZWF0ZSBjb250ZXh0XG4gICAgICBjb25zdCBjUHJvcHMgPSB0aGF0LmdldENhbnZhc1Byb3BlcnRpZXMoKTtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGNQcm9wcy5jYW52YXM7XG4gICAgICBjb25zdCBjb250ZXh0ID0gY1Byb3BzLmNvbnRleHQ7XG4gICAgICBjb25zdCB3aWR0aCA9IGNQcm9wcy53aWR0aDtcbiAgICAgIGNvbnN0IGhlaWdodCA9IGNQcm9wcy5oZWlnaHQ7XG4gICAgICBjb25zdCBzb2NrZXQgPSBpby5jb25uZWN0KCk7XG5cbiAgICAgIC8vIFNldCBjYW52YXMgdG8gZnVsbCBicm93c2VyIHdpZHRoL2hlaWdodFxuICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAvLyBSZWdpc3RlciBtb3VzZSBldmVudCBoYW5kbGVyc1xuICAgICAgY2FudmFzLm9ubW91c2Vkb3duID0gKGUpID0+IHtcbiAgICAgICAgbW91c2UuY2xpY2sgPSB0cnVlO1xuICAgICAgfVxuICAgICAgY2FudmFzLm9ubW91c2V1cCA9IChlKSA9PiB7XG4gICAgICAgIG1vdXNlLmNsaWNrID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBjYW52YXMub25tb3VzZW1vdmUgPSAoZSkgPT4ge1xuICAgICAgICAvLyBub3JtYWxpemUgbW91c2UgcG9zaXRpb24gMC4wIC0gMS4wXG4gICAgICAgIGNvbnN0IHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIG1vdXNlLnBvcy54ID0gZS5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBtb3VzZS5wb3MueSA9IGUuY2xpZW50WSAtIHJlY3QudG9wO1xuICAgICAgICBtb3VzZS5tb3ZlID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZHJhdyBsaW5lIHJlY2VpdmVkIGZyb20gc2VydmVyXG4gICAgICBzb2NrZXQub24oJ2RyYXdfbGluZScsIChkYXRhKSA9PiB7XG4gICAgICAgIGNvbnN0IGxpbmUgPSBkYXRhLmxpbmU7XG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKGxpbmVbMF0ueCwgbGluZVswXS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8obGluZVsxXS54LCBsaW5lWzFdLnkpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gZGF0YS5jb2xvciB8fCAnYmxhY2snO1xuICAgICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGRhdGEuc2l6ZSB8fCAxO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIG1haW5sb29wIHJ1bm5pbmcgZXZlcnkgMjVtc1xuICAgICAgZnVuY3Rpb24gbWFpbkxvb3AoKSB7XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoZSB1c2VyIGlzIGRyYXdpbmdcbiAgICAgICAgaWYgKG1vdXNlLmNsaWNrICYmIG1vdXNlLm1vdmUgJiYgbW91c2UucG9zUHJldikge1xuICAgICAgICAgIC8vIHNlbmQgbGluZSB0byB0aGUgc2VydmVyXG4gICAgICAgICAgc29ja2V0LmVtaXQoJ2RyYXdfbGluZScsIHsgbGluZTogW21vdXNlLnBvcywgbW91c2UucG9zUHJldl0gfSk7XG4gICAgICAgICAgbW91c2UubW92ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIG1vdXNlLnBvc1ByZXYgPSB7IHg6IG1vdXNlLnBvcy54LCB5OiBtb3VzZS5wb3MueSB9O1xuICAgICAgICBzZXRUaW1lb3V0KG1haW5Mb29wLCA1MCk7XG4gICAgICB9XG4gICAgICBtYWluTG9vcCgpO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhdztcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3B1YmxpYy9qYXZhc2NyaXB0cy9jbGllbnQuanMiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IERyYXcgPSByZXF1aXJlKCcuL2NsaWVudCcpO1xuY29uc3QgZHJhdyA9IG5ldyBEcmF3KCk7XG5jb25zdCBjYW52YXNQcm9wcyA9IGRyYXcuZ2V0Q2FudmFzUHJvcGVydGllcygpO1xuY29uc3Qgc29ja2V0ID0gaW8uY29ubmVjdCgpO1xuXG5jb25zdCBUb29sYmFyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdENsZWFyQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgc29ja2V0LmVtaXQoJ2NsZWFyX2NhbnZhcycsIHsgbGluZTogbnVsbCB9KTtcbiAgfVxuXG4gIHRoaXMuY2xlYXJDYW52YXMgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gdGhpcyBpcyB0byBjaGVjayBpZiBsaW5lX2hpc3RvcnkubGVuZ3RoID09PSAwIChiaW4vd3d3KVxuICAgIGlmIChkYXRhLmxpbmUgPT0gbnVsbCkge1xuICAgICAgY2FudmFzUHJvcHMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICB9XG4gIH1cblxuICAvLyBjaGFuZ2VzIGxpbmUgd2lkdGggZm9yIGluZGl2aWR1YWwgc3Ryb2tlc1xuICB0aGlzLmVtaXRDaGFuZ2VMaW5lU2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHNvY2tldC5lbWl0KCdjaGFuZ2VfbGluZV9zaXplJywgeyBzaXplOiB0aGlzLmRhdGFzZXQubGluZVNpemUgfSk7XG4gIH1cbiAgdGhpcy5jaGFuZ2VMaW5lU2l6ZSA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGluZS1zaXplLWRpc3BsYXknKS5pbm5lckhUTUwgPSBzaXplO1xuICAgIGNhbnZhc1Byb3BzLmNvbnRleHQubGluZVdpZHRoID0gc2l6ZTtcbiAgfVxuXG4gIC8vIGNoYW5nZXMgY29sb3Igb2YgaW5kaXZpZHVhbCBzdHJva2VzXG4gIHRoaXMuZW1pdENoYW5nZUNvbG9yID0gZnVuY3Rpb24oKSB7XG4gICAgc29ja2V0LmVtaXQoJ2NoYW5nZV9jb2xvcicsIHsgY29sb3I6IHRoaXMuaWQgfSlcbiAgfVxuICB0aGlzLmNoYW5nZUNvbG9yID0gZnVuY3Rpb24oY29sb3IpIHtcbiAgICBjYW52YXNQcm9wcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRvb2xiYXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9wdWJsaWMvamF2YXNjcmlwdHMvdG9vbGJhci5qcyJdLCJzb3VyY2VSb290IjoiIn0=