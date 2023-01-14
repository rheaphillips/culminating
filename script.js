 // <img id="ground" src="ground.png" alt="ground">

// declares variableshttps://culminating.rheaphillips.repl.co
let canvas, context, secondsPassed, oldTimeStamp = 0, gravity = 1000, characterColour = "plum", left = false, right = false, up = false, colourIndex, newPlatform, platforms, xPlatform, yPlatform, widthPlatform, heightPlatform, score, platformNum, coins, xCoin, yCoin, coinIndex = 0, coinsCollected = 0, buttonColours = ["plum", "deepskyblue", "mediumpurple"], textColours = ["white", "black", "black"], themeIndex = 0;

// cow and background sky images
let imageSources = ["cow right.png", "cow left.png", "sky1.png", "sky2.png", "sky3.png", "brickblock.png", "brickblock.png", "grassblock.png", "mudblock.png", "stoneblock.png", "stoneblock.png"], imageObjects = [], skyDimensions = [[800, 533], [960, 540], [960, 540]];

// coin sprites
for (let i = 1; i <= 9; i++) {
  imageSources.push("coins/coin" + (i).toString() + ".png");
}

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
    this.prevPosition = 350;
    this.cow = 350;
    this.isColliding = false;
    this.cowImage = imageObjects[0];
  }

  // drawing square player onto canvas at the correct coordinates
  draw() {

    // clears canvas before loading the next frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw sky image onto canvas
    context.drawImage(imageObjects[themeIndex + 2], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

    
    // draws different cow sprite depending on the direction the cow is moving
    if (this.velocity.x >= 0) {
      this.cowImage = imageObjects[0];
    } else {
      this.cowImage = imageObjects[1];
    }

    // draws cow to canvas
    context.drawImage(this.cowImage, this.cow, this.position.y, this.width, this.height);
    
  }

  // detects collisions with platforms
  platformCollisionDetection(platforms) {

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

  // detects collisions with coins
  coinCollisionDetection(coins) {

    // runs through all the platform objects checking whether the player is within the coordinates of that platform
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];

      // if the coordinates of the square overlap with the coin, the coin object is removed from the list of coins
      if (coin.position.y + coin.dimension.y > this.position.y && coin.position.x < this.position.x + this.cow + this.width && coin.position.x + coin.dimension.x > this.position.x + this.cow && coin.position.y < this.position.y + this.height) {
        coins.splice(i);

        coinsCollected += 1;

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
    this.platformCollisionDetection(platforms);

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
    this.platformCollisionDetection(platforms);

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
    this.coinCollisionDetection(coins);
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
    this.imageDimension = {
      x: 50,
      y: 50,
    }
    this.dimension = {
      x: Math.round((Math.floor(Math.random() * (width.max - width.min)) + width.min)/50)*50,
      y: Math.round((Math.floor(Math.random() * (height.max - height.min)) + width.min)/50)*50,
    }
    this.topImage = imageObjects[themeIndex*2 + 5];
    this.insideImage = imageObjects[themeIndex*2 + 6];
  }

  // draws platform to canvas using the randomized coordinates and dimensions
  draw(xPlayer) {

    // draws platform like an array using 50 x 50 pixels blocks
    for (let row = 0; row < this.dimension.y; row += 50) {
      for (let column = 0; column < this.dimension.x; column += 50) {

         // draws just the top row of platform which might be a different type of platform block
        if (row == 0) {
          context.drawImage(this.topImage, this.position.x + column - xPlayer, this.position.y, this.imageDimension.x, this.imageDimension.y);

        // draws the rest of the rows of the platform
        } else {
          context.drawImage(this.insideImage, this.position.x + column - xPlayer, this.position.y + row, this.imageDimension.x, this.imageDimension.y);
        }
        
      }
    }
    
  }

  update(xPlayer) {
    this.topImage = imageObjects[themeIndex*2 + 5];
    this.insideImage = imageObjects[themeIndex*2 + 6];

    this.draw(xPlayer);
  }
  
}

// class contains all the functions needed to create a coin object, and draw and move it depending on camera position
class Coin {

  // randomizes coordinates and dimensions, within the given range
  constructor({ x, y }) {
    this.position = {
      x: Math.floor(Math.random() * (x.max - x.min)) + x.min,
      y: Math.floor(Math.random() * (y.max - y.min)) + y.min,
    }
    this.dimension = {
      x: 28,
      y: 28,
    }
    this.image = 11;
    this.timeStamp = 0;
  }

  // draws coin object to canvas using the randomized coordinates
  draw(xPlayer) {

    context.drawImage(imageObjects[this.image], this.position.x - xPlayer, this.position.y, this.dimension.x, this.dimension.y);
  }

  update(secondsPassed, xPlayer) {

    this.timeStamp += secondsPassed;

    // changes coin sprite every 1 seconds
    if (this.timeStamp >= 1) {
      if (this.image == 19) {
        this.image = 11;
      } else {
        this.image += 1;
      }
    }

    this.draw(xPlayer);
    
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

  // set score and colliding platform number counter to 0
  score = 0;
  platformNum = 0;

  // adds platform to a list that contains all platforms objects
  platforms = []; platforms.push(newPlatform);
  coins = []; coinIndex = 0; coinsCollected = 0;

  // resets the position, velocity, and image of the cow player onto the first platform
  player.position.x = newPlatform.position.x - 350; player.position.y = newPlatform.position.y - player.height; player.velocity.x = 0; player.velocity.y = 0; player.cow = 350; player.prevPosition = 350; player.cowImage = imageObjects[0];

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

  if (coinIndex < platforms.length) {    

    // ranges for the coordinates of the new coin 
    xCoin = { min: platforms[coinIndex].position.x, max: platforms[coinIndex].position.x + platforms[coinIndex].dimension.x + 200 };
    yCoin = { min: platforms[coinIndex].position.y - 200, max: platforms[coinIndex].position.y - 120 };

    newCoin = new Coin({ x: { min: xCoin.min, max: xCoin.max }, y: { min: yCoin.min, max: yCoin.max } });

    // adds the point to the list containing all point objects
    coins.push(newCoin);

    coinIndex += Math.floor(Math.random() * 3) + 2;

  }

  // draws all platforms visible on screen 
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].update(player.position.x);
  }

  // draws all coins visible on screen 
  for (let i = 0; i < coins.length; i++) {
    coins[i].update(secondsPassed, player.position.x);
  }  

  document.getElementById("score").innerHTML = "score: " + score.toString() + " coins: " + coinsCollected.toString();

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
  if (themeIndex < 2) {
    themeIndex += 1;
  } else {
    themeIndex = 0;
  }

  document.getElementById("changeTheme").style.backgroundColor = buttonColours[themeIndex];
  document.getElementById("score").style.color = textColours[themeIndex];
  document.getElementById("controls").style.color = textColours[themeIndex];
  
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