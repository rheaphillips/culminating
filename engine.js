// declares variables
let canvas, context, x = 10, y = 400, seconds = 0, oldTimeStamp = 0, xVelocity = 0, yVelocity = 0, accelerating = false, character_colour = "plum";

// runs initialization function as soon as window loads
window.onload = init;

// listens for keydown events and calls move, the event handler function
window.addEventListener("keydown", move, false);

function init() {
  
  // sets canvas to the display <canvas> element
  canvas = document.getElementById("display");
  
  // checks if browser supports <canvas>
  if (canvas.getContext) {
    
    // sets canvas to a 2D rendering context for the character canvas element
    context = canvas.getContext("2d");

  // if canvas is unsupported by the browser
  } else {
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }

  // start the first frame request
  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {

  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  draw(secondsPassed);

  // keeps requesting new frames by recalling the gameLoop function
  window.requestAnimationFrame(gameLoop);
}

// draws character
function draw() {

  // y velocity constantly impacted by the acceleration due to gravity 
  yVelocity += 150 * secondsPassed

  // if player isn't moving character left or right (accelerating), the horizontal velocity of the character reduces back to 0
  if (accelerating == false) {
    if (xVelocity > 0) {
      xVelocity -= 50 * secondsPassed
    }
    else if (xVelocity < 0) {
      xVelocity += 50 * secondsPassed
    }
  }
  accelerating = false

  // x and y coordinates dependent on the seconds that have passed since the last frame
  x += xVelocity * secondsPassed
  y += yVelocity * secondsPassed

  if (y <= 0) {
    y = 0
    yVelocity = 75
  }
  else if (y >= 400) {
    y = 400
    yVelocity = -75
  }
  if (x <= 0) {
    x = 0
    xVelocity = 75
  }
  else if (x >= 900) {
    x = 900
    xVelocity = -75
  }
  
  // clears canvas before loading the next frame
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draws character to canvas
  context.fillStyle = character_colour;
  context.fillRect(x, y, 100, 100);
  
}

// updates x and y velocities of the character depending on which arrow key is pressed
function move(e) {

  // the keyCode of the key that's pressed is compared with the four arrow key cases
  switch(e.keyCode) {

    // left key pressed
    case 37:
      if (xVelocity >= -100) {
        xVelocity -= 20;
      }
      accelerating = true
      break;

    // right key pressed
    case 39:
      if (xVelocity <= 100) {
        xVelocity += 20;
      }
      accelerating = true
      break;
      
    // up key pressed
    case 38:
      yVelocity -= 200;
      break;

    // down key pressed
    case 40:
      yVelocity += 200;
      break;
  }  
}       

// change colour of character
function colourChange() {
  if (character_colour = "teal") {
    character_colour = "yellowgreen"
  }
  else {
    character_colour = "teal"
  }
}