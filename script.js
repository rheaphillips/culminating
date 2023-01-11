// <img id="ground" src="ground.png" alt="ground">

// declares variables
let canvas, context, secondsPassed, oldTimeStamp = 0, gravity = 100, xCharacter = 10, yCharacter = 400, xVelocity = 0, yVelocity = 0, xObstacle, yObstacle, widthObstacle, heightObstacle, characterColour = "plum", left = false, right = false, up = false, colourIndex, platformCoordinates = [], platforms = [], xPlatform = { min: 100, max: 200 }, yPlatform = { min: 200, max: 300 }, widthPlatform = { min: 100, max: 200 }, heightPlatform = { min: 100, max: 200 }, newestPlatform = 0, isColliding;

// runs initialization function as soon as window loads
window.onload = init;

class Player {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    }
    this.velocity = {
      x: 0,
      y: 0,
    }
    this.width = 100;
    this.height = 100;
    this.defaultLocation = 350;
    this.square = 350;
    this.isColliding = false;
    this.isTouching = true;
  }

  draw() {

    // clears canvas before loading the next frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draws player space to canvas
    context.fillStyle = "lightgreen";
    context.fillRect(this.defaultLocation - this.position.x, 0, canvas.width, canvas.height);

    // context.drawImage("ground.png", 0, 0);

    // draws character to canvas
    context.fillStyle = characterColour;
    context.fillRect(this.square, this.position.y, this.width, this.height);
  }

  // detects collisions with platforms
  collisionDetection(platforms) {

    this.isColliding = false;
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];

      // if the coordinates of the square don't overlap with the platform, the variable indicating collision is set to false
      if (this.position.y + this.height > platform.position.y && this.position.x + this.square < platform.position.x + platform.dimension.x && this.position.x + this.square + this.width > platform.position.x && this.position.y < platform.position.y + platform.dimension.y) {
        this.velocity.x *= .95
        this.isColliding = true;
      }
    }
  }

  // updates horizontal velocity of the character
  horizontalMovement(secondsPassed) {

    // horizontal velocity decreases by 20 pixels if "a" is pressed and velocity is within it's max limit
    if (left == true && this.velocity.x >= -200) this.velocity.x -= 20;

    // horizontal velocity increases by 20 pixels if "d" is pressed and velocity is within it's max limit
    if (right == true && this.velocity.x <= 200) this.velocity.x += 20;

    // horizontal position updated using new velocity and the number of seconds that have passed since the last frame

    // ensures camera only follows the player when its moving forward, beyond the center point of the screen
    if (this.velocity.x > 0 && this.square >= this.defaultLocation) { // if square is at the center of the screen, camera position (this.position.x) changes
      this.square = this.defaultLocation
      this.position.x += this.velocity.x * secondsPassed;
    }
    else { // otherwise the actual position of the square (this.square) changes
      this.square += this.velocity.x * secondsPassed;
    }

    this.collisionDetection(platforms);
    if (this.isColliding) {
      if (this.square == this.defaultLocation) {
        this.position.x -= (Math.abs(this.velocity.x) / this.velocity.x) * Math.max(Math.abs(this.velocity.x) * secondsPassed, .5);
        this.velocity.x *= -.3;
      } else {
        this.square -= (Math.abs(this.velocity.x) / this.velocity.x) * Math.max(Math.abs(this.velocity.x) * secondsPassed, .5);
        this.velocity.x *= -.3;
      }
      if (up == true) {
        this.velocity.x = (Math.abs(this.velocity.x) / this.velocity.x) * 100 * secondsPassed
      }
    }
  }

  // updates vertical velocity of the character
  verticalMovement(secondsPassed) {

    // vertical velocity constantly impacted by acceleration due to gravity 
    this.velocity.y += gravity * secondsPassed;

    // vertical position updated using new velocity and the number of seconds that have passed since the last frame
    this.position.y += this.velocity.y * secondsPassed;

    this.collisionDetection(platforms);
    if (this.isColliding) {
      this.position.y -= this.velocity.y * secondsPassed;
      this.velocity.y = 0;

      // vertical velocity increases when "w" is pressed
      if (up == true) {
        this.velocity.y = -100;
      }
    }
  }

  update(secondsPassed) {

    this.draw();
    this.horizontalMovement(secondsPassed);
    this.verticalMovement(secondsPassed);

  }
}

class Platform {

  // randomizes coordinates and dimensions, within the given range
  constructor({ x, y, width, height }) {
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
let newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max } });
platforms.push(newPlatform);
player.position.x = newPlatform.position.x - 350
player.position.y = newPlatform.position.y - player.height


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

  // creates the next platform object after the furthest one visible on screen is 100 pixels away from the right edge
  if (newPlatform.position.x + newPlatform.dimension.x + 100 <= player.position.x + 800) {

    // the randomized x-coordinate of the new platform is within 100 pixels from 
    xPlatform.min = newPlatform.position.x + newPlatform.dimension.x + 100;
    xPlatform.max = xPlatform.min + 100;

    newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max } });

    // adds the platform to the list containing all platform objects
    platforms.push(newPlatform);
  }

  // removes oldest platform and their coordinates from their respective arrays if it's no longer visible on screen 
  if (platforms[0].position.x + platforms[0].dimension.x - player.position.x < 0) {
    platforms.splice(0, 1);
  }

  // draws all platforms visible on screen 
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].draw(player.position.x);
  }

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

// randomly assigns a colour to the character
function colourRandom() {

  // sets colourIndex to a random rgb value
  red = Math.floor(Math.random() * 255);
  green = Math.floor(Math.random() * 255);
  blue = Math.floor(Math.random() * 255);

  // picks a random colour from the colour list using the randomized index
  characterColour = "rgb(" + red + ", " + green + ", " + blue + ")"
};