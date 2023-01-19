// declares variables
let canvas, context, secondsPassed, oldTimeStamp = 0, left = false, right = false, up = false, newPlatform, platforms, coins, coinIndex = 1, xPlatform, yPlatform, widthPlatform, heightPlatform, returnToMenu = false;

// lists containing HTML elements for different pages
let homepageElements = ["newUser", "returningUser"], loginElements = ["username", "password", "usernameLabel", "passwordLabel", "submit"], menuElements = ["play", "leaderboard", "shop", "help", "settings", "title", "backgroundtint"], gameElements = ["music", "controls", "coins", "score"], gameOverElements = ["revive", "replay", "menu"];

// rotation lists for changing themes
let buttonColours = ["mediumpurple", "deepskyblue", "steelblue"], textColours = ["white", "black", "black"], musicButtons = ["url('game/1.png')", "url('game/2.png')", "url('game/3.png')", "url('game/4.png')", "url('game/3.png')", "url('game/4.png')"], themeIndex = 0; 

// creating a list containing all image sources
let imageSources = ["cow/cow right.png", "cow/cow left.png", "cow/moo right.png", "cow/moo left.png", "sky/sky1.png", "sky/sky2.png", "sky/sky3.png", "platforms/brickblock.png", "platforms/brickblock.png", "platforms/grassblock.png", "platforms/mudblock.png", "platforms/stoneblock.png", "platforms/stoneblock.png"];

// appending coin sprites to the list of image sources
for (let i = 1; i <= 9; i++) {
  imageSources.push("coins/coin" + (i).toString() + ".png");
}

// creates image objects using the image sources and appends them to a list
let imageObjects = []
for (let i = 0; i < imageSources.length; i++) {
  let newImage = new Image();
  newImage.src = imageSources[i];
  imageObjects.push(newImage);
}

// list containing the dimensions of the different sky background images
let skyDimensions = [[800, 533], [960, 540], [800, 500]];

// audios and releated variables
let music = [document.getElementById("song1"), document.getElementById("song2"), document.getElementById("song3")], musicIndex = 0, musicMuted = true;

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
    
    this.platformCollision = false;
    this.coinCollision = false;
    
    this.cowImage = imageObjects[0];
    this.mooImage = imageObjects[2];
    
    this.timeStamp = 0;
    
    this.coinAudio = document.getElementById("coinSound");

    this.score = 0;
    this.platformNum = 0;

    if (localStorage.getItem("coins") == null) {
      localStorage.setItem("coins", "0");
    }

    this.coinsCollected = parseInt(localStorage.getItem("coins"))
    
  }

  // drawing square player onto canvas at the correct coordinates
  draw(secondsPassed, themeIndex) {

    // clears canvas before loading the next frame
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw sky image onto canvas
    context.drawImage(imageObjects[themeIndex + 4], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

    // draws different cow sprite depending on the direction the cow is moving
    if (this.velocity.x >= 0) {
      this.cowImage = imageObjects[0];
    } else {
      this.cowImage = imageObjects[1];
    }

    // draws cow to canvas
    context.drawImage(this.cowImage, this.cow, this.position.y, this.width, this.height);

    // draws moo speech bubble to canvas if cow collects a coin, displaying the sppech bubble for 0.5 seconds
    if (this.coinCollision == true && this.timeStamp <= 0.5) {     

      this.timeStamp += secondsPassed;
      
      if (this.velocity.x >= 0) {
        this.mooImage = imageObjects[2];
      } else {
        this.mooImage = imageObjects[3];
      }

      // draws moo speech bubble to canvas
      context.drawImage(this.mooImage, this.cow + 20, this.position.y - 37.5, 52.5, 37.5);

    // in the case the 0.5 seconds run out, the time stamp and collision variable are reset for the next collision
    } else {
      this.timeStamp = 0;
      this.coinCollision = false;
      
    }
  }

  // detects collisions with platforms
  platformCollisionDetection(platforms) {

    this.platformCollision = false;

    // runs through all the platform objects checking whether the player is within the coordinates of that platform
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];

      // if the coordinates of the square overlap with the platform, the variable indicating collision is set to true
      if (this.position.y + this.height > platform.position.y && this.position.x + this.cow < platform.position.x + platform.dimension.x && this.position.x + this.cow + this.width > platform.position.x && this.position.y < platform.position.y + platform.dimension.y) {

        this.platformCollision = true;

        // velocity is reduced by 10% for every frame the square is colliding with a platform, imitating friction 
        this.velocity.x *= .90;

        this.platformNum = i;

      }
    }
  }

  // detects collisions with coins
  coinCollisionDetection(coins, musicMuted) {

    // runs through all the platform objects checking whether the player is within the coordinates of that platform
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];

      // if the coordinates of the square overlap with the coin, the coin object is removed from the list of coins
      if (coin.position.y + coin.dimension.y > this.position.y && coin.position.x < this.position.x + this.cow + this.width && coin.position.x + coin.dimension.x > this.position.x + this.cow && coin.position.y < this.position.y + this.height) {
        coins.splice(i); 

        if (musicMuted == false) {
          this.coinAudio.volume = 0.25
          this.coinAudio.play();
        }
        
        this.coinsCollected += 1;

        this.coinCollision = true;

      }
    }
  }

  // updates horizontal velocity of the character and adjusts player motion if the new velocity causes collision
  horizontalMovement(secondsPassed, up, platforms) {

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

    if (this.platformCollision) {

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
      if (up == true) {
        this.velocity.y -= 1000 * secondsPassed;
        if (this.velocity.x > 0) {
          this.velocity.x += 2000 * secondsPassed;
        } else {
          this.velocity.x -= 2000 * secondsPassed;
        }
      } 
    }
  }

  // updates vertical velocity of the character and adjusts player motion if the new velocity causes collision
  verticalMovement(secondsPassed, left, right, up, platforms) {

    // vertical velocity constantly impacted by acceleration due to gravity 
    this.velocity.y += 1000 * secondsPassed;

    // vertical position updated using new velocity and the number of seconds that have passed since the last frame
    this.position.y += this.velocity.y * secondsPassed;

    // checks if the square is colliding with any of the platform (top and bottom of the platform since only vertical velocity has changed)
    this.platformCollisionDetection(platforms);

    if (this.platformCollision) {

      // updates score if on a platform
      if (this.score < this.platformNum) {
        this.score = this.platformNum
      }

      // resets the position of the square to where it was before collision
      this.position.y -= this.velocity.y * secondsPassed;
      this.velocity.y = 0;

      // horizontal velocity decreases by 20 pixels if "a" is pressed while colliding with a block
      if (left == true && this.velocity.x > -500) this.velocity.x -= 2500 * secondsPassed;

      // horizontal velocity increases by 20 pixels if "d" is pressed while colliding with a block
      if (right == true && this.velocity.x < 500) this.velocity.x += 2500 * secondsPassed;

      // vertical velocity increases when "w" is pressed
      if (up == true) {
        this.velocity.y -= 15000 * secondsPassed;
      }
    } else {

      // horizontal velocity decreases by 25 pixels if "a" is pressed mid air
      if (left == true && this.velocity.x > -500) this.velocity.x -= 500 * secondsPassed;

      // horizontal velocity increases by 25 pixels if "d" is pressed mid air
      if (right == true && this.velocity.x < 500) this.velocity.x += 500 * secondsPassed;
    }
  }

  // runs all the nessecary functions for the player
  update(secondsPassed, themeIndex, up, left, right, platforms, coins, musicMuted) {
    
    this.draw(secondsPassed, themeIndex);
    this.horizontalMovement(secondsPassed, up, platforms);
    this.verticalMovement(secondsPassed, left, right, up, platforms);
    this.coinCollisionDetection(coins, musicMuted);
  }
}

// class contains all the functions needed to create a platform object, and draw and move it depending on camera position
class Platform {

  // randomizes coordinates and dimensions, within the given range
  constructor({ x, y, width, height, themeIndex }) {
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
    this.topImage = imageObjects[themeIndex*2 + 7];
    this.insideImage = imageObjects[themeIndex*2 + 8];
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
    this.topImage = imageObjects[themeIndex*2 + 7];
    this.insideImage = imageObjects[themeIndex*2 + 8];

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
    this.image = 13;
    this.timeStamp = 0;
  }

  // draws coin object to canvas using the randomized coordinates
  draw(xPlayer) {

    context.drawImage(imageObjects[this.image], this.position.x - xPlayer, this.position.y, this.dimension.x, this.dimension.y);
  }

  update(secondsPassed, xPlayer) {

    this.timeStamp += secondsPassed;

    // changes coin sprite every 1 seconds
    if (this.timeStamp >= 0.05) {
      if (this.image == 21) {
        this.image = 13;
      } else {
        this.image += 1;
      }

      this.timeStamp = 0;
    }

    this.draw(xPlayer);
    
  }
}

// runs initialization function as soon as window loads
window.onload = init;

// initiallizes the HTML canvas
function init() {

  // sets canvas to the display and gameOverCoin <canvas> elements
  canvas = document.getElementById("display");

  // checks if browser supports <canvas>
  if (canvas.getContext) {

    // sets canvas to a 2D rendering context for the character canvas element
    context = canvas.getContext("2d");

    // disables image smoothing so pixels look sharp
    context.imageSmoothingEnabled = false;

    // draw sky image onto canvas
    context.drawImage(imageObjects[themeIndex + 4], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

    // if canvas is unsupported by the browser
  } else {
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }
}

// create player object
let player = new Player();

// checks if a user input contains spaces (used for error checking while logging in)
function checkInputForSpaces(text, message) {
  for (i = 0; i < text.split("").length; i++) {
    if (text.split("")[i] == " ") {
      return true;
    }
  } return false;
}


// error checks username and password inputs
function loginScreen() {

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let validLogin = true;
  let message1 = "", message2 = "";

  // ensures there are no spacees in the username/password
  if (checkInputForSpaces(username, "username") || checkInputForSpaces(password, "password")) {
    validLogin = false;
    message1 = " Make sure there are no spaces!";
  }

  // ensures password is at least 4 characters in length
  if (password.split("").length < 4) {
    message2 = " Must be 4-20 characters in length!";
    password = "";
    validLogin = false;
  }

  if (validLogin == true) {
    menuScreen();
  } else {
    document.getElementById("error").innerHTML = "Invalid username/password!" + message1 + message2;
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }
  
}

function menuScreen() {

  elementVisibility(gameElements, "hidden");
  elementVisibility(gameOverElements, "hidden");
  elementVisibility(loginElements, "hidden");
  
  elementVisibility(menuElements, "visible");

  let title = document.getElementById("title").style
  
  title.width = "500px";
  title.height = "175px";
  title.left = "130px";
  title.top = "100px";

  // draw sky image onto canvas
  context.drawImage(imageObjects[themeIndex + 4], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

}

function revive() {

  if (player.coinsCollected >= 5) {
    player.coinsCollected -= 5;
    player.position.x = platforms[player.score].position.x - 350; player.position.y = -200 
    player.velocity.x = 0; player.velocity.y = 0; player.cow = 350; player.prevPosition = 350; player.cowImage = imageObjects[0];

    document.getElementById("backgroundtint").style.visibility="hidden";
    elementVisibility(gameOverElements, "hidden");
  }
  
}

function initGame() {

  returnToMenu = false;

  // ranges for the coordinates and dimensions of the first platform 
  xPlatform = { min: 100, max: 200 }, yPlatform = { min: 200, max: 300 }, widthPlatform = { min: 100, max: 200 }, heightPlatform = { min: 100, max: 200 };

  // first platform object
  newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max }, themeIndex: themeIndex });

  // coin objects for coin counter and replay button
  decorativeCoin = new Coin({ x: { min: 20, max: 20 }, y: { min: 25, max: 25 } });

  // set score and colliding platform number counter to 0
  player.score = 0;
  player.platformNum = 0;

  // adds platform to a list that contains all platforms objects
  platforms = []; platforms.push(newPlatform);
  coins = []; coinIndex = 1;

  // resets the position, velocity, and image of the cow player onto the first platform
  player.position.x = newPlatform.position.x - 350; player.position.y = -200 
  
  player.velocity.x = 0; player.velocity.y = 0; player.cow = 350; player.prevPosition = 350; player.cowImage = imageObjects[0];

  // sets HTML game elements to visible and hides all other elements
  elementVisibility(gameOverElements, "hidden");
  elementVisibility(menuElements, "hidden");

  elementVisibility(gameElements, "visible");

  // start the first frame request
  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {

  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = Math.min((timeStamp - oldTimeStamp) / 1000, .5);
  oldTimeStamp = timeStamp;

  if (music[musicIndex].ended) {
    music[musicIndex].pause();
    if (musicIndex == 2) {
      musicIndex = 0;
    } else {
      musicIndex += 1;
    }
    music[musicIndex].play();
  }
  
  player.update(secondsPassed, themeIndex, up, left, right, platforms, coins, musicMuted);
  
  // creates the next platform object after the furthest one visible on screen is 100 pixels away from the right edge
  if (newPlatform.position.x + newPlatform.dimension.x + player.width <= player.position.x + 800) {

    // the randomized x-coordinate of the new platform is within 100 pixels from 
    xPlatform.min = newPlatform.position.x + newPlatform.dimension.x + 200;
    xPlatform.max = xPlatform.min + 100;

    newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max }, themeIndex: themeIndex });

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

  // updates annimation for coin counter
  decorativeCoin.update(secondsPassed, 0);

  document.getElementById("coins").innerHTML = "X " + player.coinsCollected.toString();
  document.getElementById("score").innerHTML = "score: " + player.score.toString();

  if (player.position.y > 500) { // if the player falls into the void the game restarts

    document.getElementById("menu").addEventListener("click", function() { returnToMenu = true; });
    
    if (returnToMenu == true) {
      menuScreen();
    } else {
      document.getElementById("backgroundtint").style.visibility="visible";
      elementVisibility(gameOverElements, "visible");
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  } else { 
    eventListener("keydown", true);
    eventListener("keyup", false);
  }

  // new frames keep being requested by recalling the gameLoop function
  window.requestAnimationFrame(gameLoop);
  
}

// listens for keydown/keyup events for keys "a", "d" and "w"
function eventListener(eventType, state) {
  
  window.addEventListener(eventType, (event) => {

  // the keyCode of the key that's pressed is compared with the three key cases ("a", "d" and "w")
  switch (event.key.toLowerCase()) {

    // left key pressed/released
    case "a":
      left = state;
      break;

    // right key pressed/released
    case "d":
      right = state;
      break;

    // up key pressed/released
    case "w":
      up = state;
      break;
  }
});

}

function elementVisibility(list, status) {
  
  for (let i = 0; i < list.length; i++) {
    document.getElementById(list[i]).style.visibility=status;
  } 
  
}

function changeTheme() {
  if (themeIndex < 2) {
    themeIndex += 1;
  } else {
    themeIndex = 0;
  }

  document.getElementById("changeTheme").style.backgroundColor = buttonColours[themeIndex];
  document.getElementById("coins").style.color = textColours[themeIndex];
  document.getElementById("score").style.color = textColours[themeIndex];
  document.getElementById("controls").style.color = textColours[themeIndex];

  if (music[musicIndex].paused == true) {
    document.getElementById("music").style.backgroundImage = musicButtons[themeIndex*2 + 1];
  } else {
    document.getElementById("music").style.backgroundImage = musicButtons[themeIndex*2];
  }
  
}

function playMusic() {
  
  if (music[musicIndex].paused == true) {
    music[musicIndex].play();
    document.getElementById("music").style.backgroundImage = musicButtons[themeIndex*2];
    
    musicMuted = false
    
  } else {
    music[musicIndex].pause();
    document.getElementById("music").style.backgroundImage = musicButtons[themeIndex*2 + 1];
    
    musicMuted = true
  }
  
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

function saveData() {

  localStorage.setItem("coins", player.coinsCollected.toString());
  
}