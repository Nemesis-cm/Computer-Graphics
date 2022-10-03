// Use strict is required
"use strict";

function colorSet(red, green, blue) {
  this.r = red;
  this.g = green;
  this.b = blue;
}
var colorChoice = [
  new colorSet(1.0, 0.0, 0.0),
  new colorSet(1.0, 1.0, 0.0),
  new colorSet(0.0, 1.0, 1.0),
  new colorSet(0.0, 0.0, 1.0),
  new colorSet(0.0, 0.0, 0.0),
  new colorSet(0.0, 1.0, 0.0),
  new colorSet(1.0, 0.0, 1.0),
  new colorSet(0.5, 0.0, 0.0),
  new colorSet(0.5, 0.5, 0.0),
  new colorSet(0.5, 0.5, 0.5),
  new colorSet(0.0, 0.5, 0.5),
];
var gl;
var points;
var NumPoints = 2500;
var lpCnt = 0;
var cWidth = 512;
var cHeight = 512;
var x = 0;
var y = 0;
var userChoice = new colorSet(1.0, 0.0, 0.0);
var gasketStatus = ("Status").bold();
var colorPickerUsed = false;

// From gasket1.html
var vertex_Shader = `
  attribute vec4 vertexPosition;
  void main() {
    gl_PointSize = 1.0;
      gl_Position = vertexPosition;
  }`;

var fragment_shader = `
  precision mediump float;
  void main() {
      gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
  }`;
window.onload = function init()
// exception for webgl
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Gasket is initialized via three points
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // Here's the starting point
    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

   // Add starting point to array of points
    points = [ p ];

     // Each new point is located between the last point and a random vertex
    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }

    // WebGL is canvas is configured
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShadersNew( gl, vertex_Shader, fragment_shader );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vertexPosition = gl.getAttribLocation( program, "vertexPosition" );
    gl.vertexAttribPointer( vertexPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );

    render();
};


function render() {
// Again we initialize our three points
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // our starting point p must lie in any set of 
    // three vertices
    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // Add the starting points to the array of points
    points = [ p ];

    // Compute new points
    // New points are located between the last vertex 
    // and a randomly chosen vertex
    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }
	gl.viewport( x, y, cWidth, cHeight );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
	var program = initShadersNew(gl, vertex_Shader, fragment_shader);
    gl.useProgram( program );
	
	if (!colorPickerUsed) {
		fragment_shader = `
			precision mediump float;
			void main() {
				gl_FragColor = vec4(${colorChoice[lpCnt].r}, 
          ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );}`;
	} else {
		fragment_shader = `
		precision mediump float;
		void main() {
			gl_FragColor = vec4(${userChoice.r}, ${userChoice.g}, ${userChoice.b}, 1.0 );
		}`;
	}
     // GPU recieves the data
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Variables for our shader connect to the data buffer
    var vertexPosition = gl.getAttribLocation( program, "vertexPosition" );
    gl.vertexAttribPointer( vertexPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    gl.drawArrays( gl.POINTS, 0, points.length );
}

// Allows the HTML file to compile with the JS file.
function initShadersNew(gl, iVShad, iFShad) {
  const vertex_Shader = makeShader(gl, gl.VERTEX_SHADER, iVShad);
  const fragment_shader = makeShader(gl, gl.FRAGMENT_SHADER, iFShad);
  const shaderProg = gl.createProgram();
  gl.attachShader(shaderProg, vertex_Shader);
  gl.attachShader(shaderProg, fragment_shader);
  gl.linkProgram(shaderProg);
  
  return shaderProg;
}

function makeShader(gl, shader, shaderSource) {
  const newShader = gl.createShader(shader);
  gl.shaderSource(newShader, shaderSource);
  gl.compileShader(newShader);

  return newShader;
}

// settings for sliders and buttons
var userPoints = document.getElementById("npoints");
var userColor = document.getElementById("colorpicker");
var rgbSliderRed = document.getElementById("red");
var rgbSliderBlue = document.getElementById("blue");
var rgbSliderGreen = document.getElementById("green");
userPoints.oninput = function() {
	NumPoints = this.value;
  };
  rgbSliderRed.oninput = function () {
    userChoice.r = rgbSliderRed.value / 255.0;
    colorPickerUsed = true;
    userColor.value = rgbToHex(rgbSliderRed.value, rgbSliderGreen.value, rgbSliderBlue.value);
  };
  rgbSliderGreen.oninput = function () {
    userChoice.g = rgbSliderGreen.value / 255.0;
    colorPickerUsed = true;
    userColor.value = rgbToHex(rgbSliderRed.value, rgbSliderGreen.value, rgbSliderBlue.value);
  };
  rgbSliderBlue.oninput = function () {
    userChoice.b = rgbSliderBlue.value / 255.0;
    colorPickerUsed = true;
    userColor.value = rgbToHex(rgbSliderRed.value, rgbSliderGreen.value, rgbSliderBlue.value);
  };
  // converts from RGB to hex
  function rgbToHex(r, g, b) {
    const hex = (r << 16) | (g << 8) | (b << 0);
    return '#' + (0x1000000 + hex).toString(16).slice(1);
  }
  userColor.oninput = function () {
    const userRGB = hexToRGB(userColor.value);
    // Data conversion for hex values
    rgbSliderRed.value = userRGB.r;
    rgbSliderGreen.value = userRGB.g;
    rgbSliderBlue.value = userRGB.b;
    userChoice.r = userRGB.r / 255.0;
    userChoice.g = userRGB.g / 255.0;
    userChoice.b = userRGB.b / 255.0;
    colorPickerUsed = true;
  };
  // Converts from hex to RGB
  function hexToRGB(color) {
    var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return rgb ? {
      r: parseInt(rgb[1], 16),
      g: parseInt(rgb[2], 16),
      b: parseInt(rgb[3], 16)
    } : null;
  }
  document.getElementById("bdisplay").onclick = function gasketDisplay() {
    var vertices = [
          vec2( -1, -1 ),
          vec2(  0,  1 ),
          vec2(  1, -1 )
      ];

    // our starting point p must lie in any set of 
    // three vertices
    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

   // Add the starting points to the array of points
    points = [ p ];

    // Compute new points
    // New points are located between the last vertex 
    // and a randomly chosen vertex
    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }
	gl.viewport( x, y, cWidth, cHeight );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	if (!colorPickerUsed) {
		fragment_shader = `
			precision mediump float;
			void main() {
				gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
			}
		`;
	} else {
		fragment_shader = `
		precision mediump float;
		void main() {
			gl_FragColor = vec4(${userChoice.r}, ${userChoice.g}, ${userChoice.b}, 1.0 );
		}
    `;
	}
	
	var program = initShadersNew(gl, vertex_Shader, fragment_shader);
    gl.useProgram( program );
	
    // GPU recieves the data
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Variables for our shader connect to the data buffer
    var vertexPosition = gl.getAttribLocation( program, "vertexPosition" );
    gl.vertexAttribPointer( vertexPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    gl.drawArrays( gl.POINTS, 0, points.length );

	gasketStatus = "Status:"
	gasketStatus = gasketStatus.bold() + " Displayed";
	const displayMessage = document.getElementById("status");
	displayMessage.innerHTML = gasketStatus;
};
document.getElementById("banimate").onclick = function gasketAnimate() {
	var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    // our starting point p must lie in any set of 
    // three vertices
    var u = add( vertices[0], vertices[1] );
    var v = add( vertices[0], vertices[2] );
    var p = scale( 0.25, add( u, v ) );

    // Add the starting points to the array of points
    points = [ p ];

    // Compute new points
    // New points are located between the last vertex 
    // and a randomly chosen vertex

    for ( var i = 0; points.length < NumPoints; ++i ) {
        var j = Math.floor(Math.random() * 3);
        p = add( points[i], vertices[j] );
        p = scale( 0.5, p );
        points.push( p );
    }
	gl.viewport( x, y, cWidth, cHeight );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );
	
	if (!colorPickerUsed) {
		fragment_shader = `
			precision mediump float;
			void main() {
				gl_FragColor = vec4(${colorChoice[lpCnt].r}, ${colorChoice[lpCnt].g}, ${colorChoice[lpCnt].b}, 1.0 );
			}`;
	} else {
		fragment_shader = `
		precision mediump float;
		void main() {
			gl_FragColor = vec4(${userChoice.r}, ${userChoice.g}, ${userChoice.b}, 1.0 );
		}
    `;
	}
	var program = initShadersNew(gl, vertex_Shader, fragment_shader);
    gl.useProgram( program );
	
   // GPU recieves the data

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Variables for our shader connect to the data buffer

    var vertexPosition = gl.getAttribLocation( program, "vertexPosition" );
    gl.vertexAttribPointer( vertexPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vertexPosition );
    gl.drawArrays( gl.POINTS, 0, points.length );
	
  // Animation goes back to the start
	setTimeout(() => {
		requestAnimationFrame(function () {
		  if (lpCnt > 10) {
			lpCnt = 0;
			cWidth = 512;
			cHeight = 512;
			NumPoints = 5000;
			x = 0;
			y = 0;
		  }
      // recursive method
		  gasketAnimate(); 
		  gasketStatus = ("Status: ").bold();
		  gasketStatus += `Frame count = ${lpCnt}`;
		  const displayMessage = document.getElementById("status");
		  displayMessage.innerHTML = gasketStatus;
		  lpCnt++;
		  cWidth -= 50;
		  cHeight -= 50;
		  NumPoints -= 500;
		  x += 25;
		  y += 25;
		});
	}, 175);
};
document.getElementById("bclear").onclick = function gasketClear() {
	gasketStatus = ("Status: ").bold() + "Cleared";
	const displayMessage = document.getElementById("status");
	displayMessage.innerHTML = gasketStatus;
}