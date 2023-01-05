// <img id="ground" src="ground.png" alt="ground">

// declares variables
let canvas, context, secondsPassed, oldTimeStamp = 0, gravity = 500, xCharacter = 10, yCharacter = 400, xVelocity = 0, yVelocity = 0, xObstacle, yObstacle, widthObstacle, heightObstacle, characterColour = "plum", left = false, right = false, up = false, colourIndex, platformCoordinates = [], platforms = [], xPlatform = {min: 100, max: 200}, yPlatform = {min: 200, max: 300}, widthPlatform = {min: 100, max: 200}, heightPlatform = {min: 100, max: 200}, platformNum = 0;

// runs initialization function as soon as window loads
window.onload = init;

class Player {
  constructor() {
    this.position = {
      x: 10,
      y: 400,
    }
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.xSquare = 350;
  }

  draw() {
    
    // clears canvas before loading the next frame
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    // draws player space to canvas
    context.fillStyle = "lightgreen";
    context.fillRect(350 - this.position.x, 0, canvas.width, canvas.height);
  
    // context.drawImage("ground.png", 0, 0);
    
    // draws character to canvas
    context.fillStyle = characterColour;
    context.fillRect(this.xSquare, this.position.y, 100, 100);
  }

  // updates x and y velocities of the character depending on which arrow key is pressed
  update(secondsPassed) {

    this.draw();
    
    // left key pressed and velocity is within it's max limit
    if (left == true && this.velocity.x >= -200) this.velocity.x -= 20;
    
    // right key pressed and velocity is within it's max limit
    if (right == true && this.velocity.x <= 200) this.velocity.x += 20;
    
    // up key pressed
    if (up == true) this.velocity.y -= 100;
  
    // if player isn't moving character left or right (accelerating), the horizontal velocity of the character reduces back to 0
    if (left == false && right == false && this.position.y == 400) {
      if (this.velocity.x > 0) {
        this.velocity.x -= 50 * secondsPassed;
      }
      else if (this.velocity.x < 0) {
        this.velocity.x += 50 * secondsPassed;
      }
    }
  
    // y velocity constantly impacted by the acceleration due to gravity 
    this.velocity.y += gravity * secondsPassed;

    // x and y coordinates dependent on the seconds that have passed since the last frame

    // ensures camera only follows the player when its moving forward, beyond the center point of the screen
    if (this.velocity.x > 0 && this.xSquare >= 350) {
      this.xSquare = 350
      this.position.x += this.velocity.x * secondsPassed;
    }
    else {
      this.xSquare += this.velocity.x * secondsPassed;
    }
    this.position.y += this.velocity.y * secondsPassed;
  
    // ensures if square collides with canvas borders, it bounces back
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
    }
    else if (this.position.y >= 400) {
      this.position.y = 400;
      this.velocity.y = -this.velocity.y * .5;
    }
    if (this.xSquare <= 0) {
      this.xSquare = 0;
      this.velocity.x = 75;
    }
  }
}

class Platform {

  // randomizes coordinates and dimensions, within the given range
  constructor({x, y, width, height}) {
    this.position = {
      x: Math.floor(Math.random() * (x.max - x.min)) + x.min,
      y: Math.floor(Math.random() * (y.max - y.min)) + y.min,
    }
    this.dimension = {
      x: Math.floor(Math.random() * (width.max - width.min)) + width.min,
      y: Math.floor(Math.random() * (height.max - height.min)) + height.min,
    }
  }

  // draws platform to canvas
  draw(xPlayer) {
    context.fillStyle = "yellow";
    context.fillRect(this.position.x - xPlayer, this.position.y, this.dimension.x, this.dimension.y);
  }
}

const player = new Player();

//initiallizes the HTML canvas
function init() {

  // sets canvas to the display <canvas> element
  canvas = document.getElementById("display");

  // checks if browser supports <canvas>
  if (canvas.getContext) {

    // sets canvas to a 2D rendering context for the character canvas element
    context = canvas.getContext("2d");

    // start the first frame request
    window.requestAnimationFrame(gameLoop);

    // if canvas is unsupported by the browser
  } else {
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }
}

function gameLoop(timeStamp) {
  
  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  player.update(secondsPassed); 

  let newPlatform = new Platform({x: {min: xPlatform.min, max: xPlatform.max}, y: {min: yPlatform.min, max: yPlatform.max}, width: {min: widthPlatform.min, max: widthPlatform.max}, height: {min: heightPlatform.min, max: heightPlatform.max}});

  // adds new platform to the list containing all platforms
  platforms.push(newPlatform)

  // adds platform coordinates to a list containting coordinates for object collision
  platformCoordinates.push([newPlatform.position.x, newPlatform.position.y, newPlatform.dimension.x, newPlatform.dimension.y])

  // identfies the index of the oldest platform still on screen
  for (let i = 0; i < platforms.length; i++) { 
    if (platforms[i].position.x + platforms[i].dimension.x > 0) platformNum = i
    break
  }

  // draws all platforms
  for (let i = platformNum; i < platforms.length; i++) { 
    platforms[i].draw(player.position.x);
  }

  xPlatform.min = newPlatform.position.x + newPlatform.dimension.x + 200
  xPlatform.max = xPlatform.min + 100

  // keeps requesting new frames by recalling the gameLoop function
  window.requestAnimationFrame(gameLoop);
}

// listens for keydown/keyup events and calls move/stop, the event handler functions

window.addEventListener("keydown", (event) => {
  
  // the keyCode of the key that's pressed is compared with the four arrow key cases
  switch (event.key) {

    // left key pressed
    case "a":
      left = true;
      break;

    // right key pressed
    case "d":
      right = true;
      break;

    // up key pressed
    case "w":
      up = true;
      break;
  }
});

window.addEventListener("keyup", (event) => {
  
  // the keyCode of the key that's released is compared with the four arrow key cases
  switch (event.key) {

    // left key released
    case "a":
      left = false;
      break;

    // right key released
    case "d":
      right = false;
      break;

    // up key released
    case "w":
      up = false;
      break;
  }
});

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