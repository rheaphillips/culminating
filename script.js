function draw() {
  
  // sets canvas to the character <canvas> element
  const canvas = document.getElementById("character");
  
  // checks if the browser supports <canvas>
  if (canvas.getContext) {
    
    // sets ctx to a 2D rendering context for the character canvas element
    const ctx = canvas.getContext("2d");
    
    // drawing code
    ctx.fillStyle = "rgb(200, 0, 0)";
    ctx.fillRect(10, 10, 100, 100);

    ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    ctx.fillRect(30, 30, 100, 100);
    
  } else {
    
    // canvas-unsupported code here
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }
}