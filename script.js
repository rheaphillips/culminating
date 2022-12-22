// <img id="ground" src="ground.png" alt="ground">

// declares variables
let canvas, context, secondsPassed, oldTimeStamp = 0, xCharacter = 10, yCharacter = 400, xVelocity = 0, yVelocity = 0, xObstacle, yObstacle, widthObstacle, heightObstacle, characterColour = "plum", left = false, right = false, up = false, down = false, colourIndex;

// runs initialization function as soon as window loads
window.onload = init;

// listens for keydown/keyup events and calls move/stop, the event handler functions
window.addEventListener("keydown", move, false);
window.addEventListener("keyup", stop, false);

//initiallizes the HTML canvas
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

class Player {
  constructor(position) {
    this.position = position
    this.velocity = {
      x: 0,
      y: 1,
    }
  }

  // updates x and y velocities of the character depending on which arrow key is pressed
  update() {
    
  // left key pressed
  if (left == true && xVelocity >= -200) {
    xVelocity -= 20;
  }
  
  // right key pressed
  if (right == true && xVelocity <= 200) {
    xVelocity += 20;
  }
  
  // up key pressed
  if (up == true) {
    yVelocity -= 100;
  }

  // down key pressed
  if (down == true) {
    yVelocity += 100;
  }

  // if player isn't moving character left or right (accelerating), the horizontal velocity of the character reduces back to 0
  if (left == false && right == false && yCharacter == 400) {
    if (xVelocity > 0) {
      xVelocity -= 50 * secondsPassed
    }
    else if (xVelocity < 0) {
      xVelocity += 50 * secondsPassed
    }
  }

  // y velocity constantly impacted by the acceleration due to gravity 
  yVelocity += 500 * secondsPassed
  }
}

function gameLoop(timeStamp) {

  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  draw(secondsPassed);
  obstacle();

  // keeps requesting new frames by recalling the gameLoop function
  window.requestAnimationFrame(gameLoop);
}

// draws character
function draw() {
  
  // updates x and y velocities of the character depending on which arrow key is pressed

  // left key pressed
  if (left == true && xVelocity >= -200) {
    xVelocity -= 20;
  }
  
  // right key pressed
  if (right == true && xVelocity <= 200) {
    xVelocity += 20;
  }
  
  // up key pressed
  if (up == true) {
    yVelocity -= 100;
  }

  // down key pressed
  if (down == true) {
    yVelocity += 100;
  }

  // if player isn't moving character left or right (accelerating), the horizontal velocity of the character reduces back to 0
  if (left == false && right == false && yCharacter == 400) {
    if (xVelocity > 0) {
      xVelocity -= 50 * secondsPassed
    }
    else if (xVelocity < 0) {
      xVelocity += 50 * secondsPassed
    }
  }

  // y velocity constantly impacted by the acceleration due to gravity 
  yVelocity += 500 * secondsPassed

  // x and y coordinates dependent on the seconds that have passed since the last frame
  xCharacter += xVelocity * secondsPassed
  yCharacter += yVelocity * secondsPassed

  // ensures if square collides with canvas borders, it bounces back
  if (yCharacter <= 0) {
    yCharacter = 0
    yVelocity = 0
  }
  else if (yCharacter >= 400) {
    yCharacter = 400
    yVelocity = -yVelocity * .5
  }
  if (xCharacter <= 0) {
    xCharacter = 0
    xVelocity = 75
  }
  else if (xCharacter >= 700) {
    xCharacter = 700
    xVelocity = -75
  }

  // clears canvas before loading the next frame
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draws player space to canvas
  context.fillStyle = "lightgreen";
  context.fillRect(10 - xCharacter, 400 - yCharacter, canvas.width, canvas.height);

  // context.drawImage("ground.png", 0, 0);
  
  // draws character to canvas
  context.fillStyle = characterColour;
  context.fillRect(10, 400, 100, 100);
}

function obstacle() {

  xObstacle = Math.floor(Math.random() * 300) + 400
  yObstacle = Math.floor(Math.random() * 100) + 300
  widthObstacle = Math.floor(Math.random() * 400) + 100
  heightObstacle = Math.floor(Math.random() * 100) + 100
  
  // draws obstacle to canvas
  context.fillStyle = "white";
  context.fillRect(xObstacle - xCharacter, yObstacle - yCharacter, widthObstacle, heightObstacle); 
}

function move(e) {

  // the keyCode of the key that's pressed is compared with the four arrow key cases
  switch (e.keyCode) {

    // left key pressed
    case 37:
      left = true;
      break;

    // right key pressed
    case 39:
      right = true;
      break;

    // up key pressed
    case 38:
      up = true;
      break;

    // down key pressed
    case 40:
      down = true;                                                     
      break;
  }
}

function stop(e) {

  // the keyCode of the key that's released is compared with the four arrow key cases
  switch (e.keyCode) {

    // left key released
    case 37:
      left = false;
      break;

    // right key released
    case 39:
      right = false;
      break;

    // up key released
    case 38:
      up = false;
      break;

    // down key released
    case 40:
      down = false;                                                     
      break;
  }
}     

// change colour of character to either plum or yellowgreen
function colourChange() {
  if (characterColour == "plum") {
    characterColour = "yellowgreen"
  }
  else {
    characterColour = "plum"
  }
}

// randomly assigns a colour to the character
function colourRandom() {

  // sets colourIndex to a random rgb value
  red = Math.floor(Math.random() * 255);
  green = Math.floor(Math.random() * 255);
  blue = Math.floor(Math.random() * 255);

  // picks a random colour from the colour list using the randomized index
  characterColour = "rgb(" + red + ", " + green + ", " + blue + ")"
}