let canvas, context, x = 0, y = 0;

window.onload = init;

function init() {
  
  // sets canvas to the character <canvas> element
  canvas = document.getElementById("character");
  
  // checks if the browser supports <canvas>
  if (canvas.getContext) {
    
    // sets context to a 2D rendering context for the character canvas element
    context = canvas.getContext("2d");
    
  } else {
    
    // canvas-unsupported code here
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }

  // Start the first frame request
  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {
  
  // Calculate how much time has passed
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;
  
  update();
  draw();

  // Keep requesting new frames
  window.requestAnimationFrame(gameLoop);
}

// drawing code
function draw() {
  
  // Clear the entire canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  context.fillStyle = "rgb(200, 0, 0)";
  context.fillRect(x, y, 100, 100);
}

function update() {
  x += 1
  y += 1
}

function colourChange() {
  if (document.body.style.backgroundColor == "lightcyan") {
    document.body.style.backgroundColor = "cyan";
  }
  else {
    document.body.style.backgroundColor = "lightcyan";
  }
}