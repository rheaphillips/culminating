 // <img id="ground" src="ground.png" alt="ground">

// declares variableshttps://culminating.rheaphillips.repl.co
let canvas, context, secondsPassed, oldTimeStamp = 0, gravity = 1000, characterColour = "plum", left = false, right = false, up = false, colourIndex, newPlatform, platforms, xPlatform, yPlatform, widthPlatform, heightPlatform, score, platformNum, points, xPoint, yPoint, pointIndex = 0, platformColours = ["lightgoldenrodyellow", "gold", "darkslateblue"], buttonColours = ["plum", "deepskyblue", "mediumpurple"], textColours = ["white", "black", "black"], backgroundIndex = 0;

// images
let imageSources = ["cow right.png", "cow left.png", "cow right 2.png", "cow left 2.png", "sky1.png", "sky2.png", "sky3.png"], imageObjects = [], imageDimensions = [[800, 533], [960, 540], [960, 540]];

for (let i = 0; i < imageSources.length; i++) {
  let newImage = new Image();
  newImage.src = imageSources[i];
  imageObjects.push(newImage);
}

// runs initialization function as soon as window loads
window.onload = init;

// class contains all the functions needed to create a player object, and draw and move it around the screen
class Player {
  constructor() {
    this.position = {
      x: 0,
      y: 0
    }
    this.velocity = {
      x: 0,
      y: 0
    }
    this.width = 98;
    this.height = 59;
    this.defaultLocation = 350;
    this.cow = 350;
    this.isColliding = false;
    this.cowImage = imageObjects[0];
  }

  // drawing square player onto canvas at the correct coordinates
  draw() {

    // clears canvas before loading the next frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw sky image onto canvas
    context.drawImage(imageObjects[backgroundIndex + 4], 0, 0, imageDimensions[backgroundIndex][0], imageDimensions[backgroundIndex][1]);

    // draws different cow sprite depending on the direction the cow is moving
    if (this.velocity.x >= 0) {
      this.cowImage = imageObjects[0];
    } else {
      this.cowImage = imageObjects[1];
    }

    // draws character to canvas
    // context.fillStyle = characterColour;
    // context.fillRect(this.cow, this.position.y, this.width, this.height);
    
    context.drawImage(this.cowImage, this.cow, this.position.y, this.width, this.height);
    
  }

  // detects collisions with platforms
  collisionDetection(platforms) {

    this.isColliding = false;

    // runs through all the platform objects checking whether the player is within the coordinates of that platform
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];

      // if the coordinates of the square overlap with the platform, the variable indicating collision is set to true
      if (this.position.y + this.height > platform.position.y && this.position.x + this.cow < platform.position.x + platform.dimension.x && this.position.x + this.cow + this.width > platform.position.x && this.position.y < platform.position.y + platform.dimension.y) {

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
    if (this.velocity.x > 0 && this.cow >= this.defaultLocation) { // if square is at the center of the screen, camera position (this.position.x) changes
      this.cow = this.defaultLocation;
      this.position.x += this.velocity.x * secondsPassed;
    }
    else { // otherwise the actual position of the square (this.cow) changes
      this.cow += this.velocity.x * secondsPassed;
    }

    if (this.cow < 0) {
      this.cow -= this.velocity.x * secondsPassed;
    }

    // checks if the square is colliding with any of the platform (left and right of the platform since only horizontal velocity has changed)
    this.collisionDetection(platforms);

    if (this.isColliding) {

      // resets the position of the square to where it was before collision
      if (this.cow == this.defaultLocation) {

        // Math.max is used so that if the amount the square is being reset by is below 9.5, it would reset it by 0.5 pixels instead. this ensures the square isn't stuck motionless due to being adjacent to the wall of the platform
        this.position.x -= (Math.abs(this.velocity.x) / this.velocity.x) * Math.max(Math.abs(this.velocity.x) * secondsPassed, .5);
        this.velocity.x *= -.3;
      } else {
        this.cow -= (Math.abs(this.velocity.x) / this.velocity.x) * Math.max(Math.abs(this.velocity.x) * secondsPassed, .5);
        this.velocity.x *= -.3;
      }

      // allows player to jump off of the side of walls by allowing player to move diagonally when pressing "w" and touching the platform walls
      if (up == true && this.velocity.x > 0) {
        this.velocity.x += 100;
        this.velocity.y -= 500;
      } else if (up == true && this.velocity.x < 0) {
        this.velocity.x -= 100;
        this.velocity.y -= 500;
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

      // updates score if on a platform
      if (score < platformNum) {
        score = platformNum
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
    this.colour = platformColours[backgroundIndex];
  }

  // draws platform to canvas using the randomized coordinates and dimensions
  draw(xPlayer) {
    context.fillStyle = this.colour;
    context.fillRect(this.position.x - xPlayer, this.position.y, this.dimension.x, this.dimension.y);
  }
}

// class contains all the functions needed to create a point object, and draw and move it depending on camera position
class Point {

  // randomizes coordinates and dimensions, within the given range
  constructor({ x, y }) {
    this.position = {
      x: Math.floor(Math.random() * (x.max - x.min)) + x.min,
      y: Math.floor(Math.random() * (y.max - y.min)) + y.min,
    }
    this.dimension = {
      x: 10,
      y: 10,
    }
  }

  // draws point object to canvas using the randomized coordinates
  draw(xPlayer) {
    context.fillStyle = "white";
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

  // ranges for the coordinates of the first point 
  xPoint = { min: newPlatform.position.x, max: newPlatform.position.x + newPlatform.dimension.x }, yPoint = { min: newPlatform.position.y - 100, max: newPlatform.position.y };

  // first point object
  newPoint = new Point({ x: { min: xPoint.min, max: xPoint.max }, y: { min: yPoint.min, max: yPoint.max } });

  // set score and colliding platform number counter to 0
  score = 0;
  platformNum = 0;

  // add objects to corresponding lists that contain all platforms/point objects
  platforms = [];
  points = [];
  platforms.push(newPlatform);
  points.push(newPoint);

  // sets coordinate of the player object to be right on top of the first platform, center the square and velocities to 0
  player.position.x = newPlatform.position.x - 350; player.position.y = newPlatform.position.y - player.height; player.velocity.x = 0; player.velocity.y = 0; player.cow = 350;

  // start the first frame request
  window.requestAnimationFrame(gameLoop);

}

function gameLoop(timeStamp) {

  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  player.update(secondsPassed);

  // creates the next platform object after the furthest one visible on screen is 100 pixels away from the right edge
  if (newPlatform.position.x + newPlatform.dimension.x + player.width <= player.position.x + 800) {

    // the randomized x-coordinate of the new platform is within 100 pixels from 
    xPlatform.min = newPlatform.position.x + newPlatform.dimension.x + 200;
    xPlatform.max = xPlatform.min + 100;

    newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max } });

    // adds the platform to the list containing all platform objects
    platforms.push(newPlatform);
  }

  if (newPoint.position.x + newPoint.dimension.x <= player.position.x + 800) {
    pointIndex += Math.floor(Math.random() * 3) + 2;
  }

  if (pointIndex <= platforms.length) {

    // ranges for the coordinates of the new point 
    xPoint = { min: platforms[pointIndex].position.x, max: platforms[pointIndex].position.x + platforms[pointIndex].dimension.x };
    yPoint = { min: platforms[pointIndex].position.y - player.height, max: platforms[pointIndex].position.y };

    newPoint = new Point({ x: { min: xPoint.min, max: xPoint.max }, y: { min: yPoint.min, max: yPoint.max } });

    // adds the point to the list containing all point objects
    points.push(newPoint);

  }

  // draws all platforms visible on screen 
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].draw(player.position.x);
  }

  // draws all platforms visible on screen 
  for (let i = 0; i < points.length; i++) {
    points[i].draw(player.position.x);
  }

  document.getElementById("score").innerHTML = "score: " + score.toString();

  if (player.position.y > 500) { // if the player falls into the void the game restarts
    initGame();
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

function changeTheme() {
  if (backgroundIndex < imageObjects.length - 5) {
    backgroundIndex += 1;
  } else {
    backgroundIndex = 0;
  }

  for (let i = 0; i < platforms.length; i++) {
    platforms[i].colour = platformColours[backgroundIndex];
  }

  document.getElementById("changeTheme").style.backgroundColor = buttonColours[backgroundIndex];
  document.getElementById("score").style.color = textColours[backgroundIndex];
  document.getElementById("controls").style.color = textColours[backgroundIndex];
  
}

// randomly assigns a colour to the character
function colourRandom() {

  // sets colourIndex to a random rgb value
  red = Math.floor(Math.random() * 255);
  green = Math.floor(Math.random() * 255);
  blue = Math.floor(Math.random() * 255);

  // picks a random colour from the colour list using the randomized index
  characterColour = "rgb(" + red + ", " + green + ", " + blue + ")";
};