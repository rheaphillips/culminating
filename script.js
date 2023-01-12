// <img id="ground" src="ground.png" alt="ground">

// declares variables
let canvas, context, secondsPassed, oldTimeStamp = 0, gravity = 1000, characterColour = "plum", left = false, right = false, up = false, colourIndex, newPlatform, platforms, xPlatform, yPlatform, widthPlatform, heightPlatform, highScore, platformNum;

// images
let sky = new Image();
sky.src = 'sky.png'

// runs initialization function as soon as window loads
window.onload = init;

// class contains all the functions needed to create a player object, and draw and move it around the screen
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
  }

  // drawing square player onto canvas at the correct coordinates
  draw() {

    // clears canvas before loading the next frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw sky image onto canvas
    context.drawImage(sky, 0, 0, 800, 533 + 1/3);

    // draws character to canvas
    context.fillStyle = characterColour;
    context.fillRect(this.square, this.position.y, this.width, this.height);
  }

  // detects collisions with platforms
  collisionDetection(platforms) {

    this.isColliding = false;

    // runs through all the platform objects checking whether the player is within the coordinates of that platform
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];

      // if the coordinates of the square overlap with the platform, the variable indicating collision is set to true
      if (this.position.y + this.height > platform.position.y && this.position.x + this.square < platform.position.x + platform.dimension.x && this.position.x + this.square + this.width > platform.position.x && this.position.y < platform.position.y + platform.dimension.y) {

        this.isColliding = true;
        
        // velocity is reduced by 10% every frame when the square is colliding with a platform, imitating friction 
        this.velocity.x *= .90;

        platformNum = i + 1;
        
      }
    }
  }

  // updates horizontal velocity of the character and adjusts player motion if the new velocity causes collision
  horizontalMovement(secondsPassed) {

    // horizontal position updated using new velocity and the number of seconds that have passed since the last frame

    // ensures camera only follows the player when its moving forward, beyond the center point of the screen
    if (this.velocity.x > 0 && this.square >= this.defaultLocation) { // if square is at the center of the screen, camera position (this.position.x) changes
      this.square = this.defaultLocation
      this.position.x += this.velocity.x * secondsPassed;
    }
    else { // otherwise the actual position of the square (this.square) changes
      this.square += this.velocity.x * secondsPassed;
    }
    
    // checks if the square is colliding with any of the platform (left and right of the platform since only horizontal velocity has changed)
    this.collisionDetection(platforms);
    
    if (this.isColliding) {
      
      // resets the position of the square to where it was before collision
      if (this.square == this.defaultLocation) {
        
        // Math.max is used so that if the amount the square is being reset by is below 9.5, it would reset it by 0.5 pixels instead. this ensures the square isn't stuck motionless due to being adjacent to the wall of the platform
        this.position.x -= (Math.abs(this.velocity.x) / this.velocity.x) * Math.max(Math.abs(this.velocity.x) * secondsPassed, .5);
        this.velocity.x *= -.3;
      } else {
        this.square -= (Math.abs(this.velocity.x) / this.velocity.x) * Math.max(Math.abs(this.velocity.x) * secondsPassed, .5);
        this.velocity.x *= -.3;
      }  

      // allows player to jump off of the side of walls by allowing player to move diagonally when pressing "w" and touching the platform walls
      if (up == true && this.velocity.x > 0) {
        this.velocity.x += 100
        this.velocity.y -= 500
      } else if (up == true && this.velocity.x < 0) {
        this.velocity.x -= 100
        this.velocity.y -= 500
      }
    }  
  }

  // updates vertical velocity of the character and adjusts player motion if the new velocity causes collision
  verticalMovement(secondsPassed) {

    // vertical velocity constantly impacted by acceleration due to gravity 
    this.velocity.y += gravity * secondsPassed;

    // vertical position updated using new velocity and the number of seconds that have passed since the last frame
    this.position.y += this.velocity.y * secondsPassed;

    // checks if the square is colliding with any of the platform (top and bottom of the platform since only vertical velocity has changed)
    this.collisionDetection(platforms);
    
    if (this.isColliding) {

      // updates highscore if on a platform
      if (highScore < platformNum) {
        highScore = platformNum 
      }
      
      // resets the position of the square to where it was before collision
      this.position.y -= this.velocity.y * secondsPassed;
      this.velocity.y = 0;

      // horizontal velocity decreases by 20 pixels if "a" is pressed while colliding with a block
      if (left == true) this.velocity.x -= 50;
  
      // horizontal velocity increases by 20 pixels if "d" is pressed while colliding with a block
      if (right == true) this.velocity.x += 50;

      // vertical velocity increases when "w" is pressed
      if (up == true) {
        this.velocity.y -= 500;
      }
    }
  }

  // runs all the nessecary functions for the player
  update(secondsPassed) {
    this.draw();
    this.horizontalMovement(secondsPassed);
    this.verticalMovement(secondsPassed);
  }
}

// class contains all the functions needed to create a platform object, and draw and move it depending on camera position
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

  // draws platform to canvas using the randomized coordinates and dimensions
  draw(xPlayer) {
    context.fillStyle = "lightgoldenrodyellow";
    context.fillRect(this.position.x - xPlayer, this.position.y, this.dimension.x, this.dimension.y);
  }
}

// create player object
let player = new Player();

// initiallizes the HTML canvas
function init() {

  // sets canvas to the display <canvas> element
  canvas = document.getElementById("display");

  // checks if browser supports <canvas>
  if (canvas.getContext) {

    // sets canvas to a 2D rendering context for the character canvas element
    context = canvas.getContext("2d");

    initGame();

    // if canvas is unsupported by the browser
  } else {
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }
}

function initGame() {

  // ranges for the coordinates and dimensions of the first platform 
  xPlatform = { min: 100, max: 200 }, yPlatform = { min: 200, max: 300 }, widthPlatform = { min: 100, max: 200 }, heightPlatform = { min: 100, max: 200 };
  
  // first platform object
  newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max } });

  // set highscore and colliding platform number counter to 0
  highScore = 0
  platformNum = 0
  
  // add object to a list that will contain all platforms
  platforms = [];
  platforms.push(newPlatform);
  
  // sets coordinate of the player object to be right on top of the first platform, center the square and velocities to 0
  player.position.x = newPlatform.position.x - 350;
  player.position.y = newPlatform.position.y - player.height;
  player.velocity.x = 0;
  player.velocity.y = 0;
  player.square = 350;

  // start the first frame request
  window.requestAnimationFrame(gameLoop);
  
}

function gameLoop(timeStamp) {

  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  player.update(secondsPassed);

  // creates the next platform object after the furthest one visible on screen is 100 pixels away from the right edge
  if (newPlatform.position.x + newPlatform.dimension.x + 100 <= player.position.x + 800) {

    // the randomized x-coordinate of the new platform is within 100 pixels from 
    xPlatform.min = newPlatform.position.x + newPlatform.dimension.x + 200;
    xPlatform.max = xPlatform.min + 100;

    newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max } });

    // adds the platform to the list containing all platform objects
    platforms.push(newPlatform);
  }

  // draws all platforms visible on screen 
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].draw(player.position.x);
  }

  document.getElementById("highScore").innerHTML = "highscore: " + highScore.toString();

  if (player.position.y > 500) { // if the player falls into the void the game restarts
    initGame()
  } else { // otherwise new frames countinue being requested by recalling the gameLoop function
    window.requestAnimationFrame(gameLoop); 
  }
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