// declares variables
let canvas, context, playerID, secondsPassed, oldTimeStamp = 0, left = false, right = false, up = false, newPlatform, platforms, coins, coinIndex = 1, xPlatform, yPlatform, widthPlatform, heightPlatform, menu = false, replay = false, pause = false, platformNum = 0, newPlayer = false, existingPlayer = true;

// lists containing HTML elements for different pages
let loginElements = ["newPlayer", "logIn", "username", "password", "usernameLabel", "passwordLabel", "enter", "error", "title", "backgroundtint"], menuElements = ["play", "leaderboard", "help", "settings", "title", "backgroundtint", "exit"], leaderboardElements = ["subMenuBackground", "leaderboardTitle", "leaderboardTable", "backgroundtint", "back"], helpElements = ["subMenuBackground", "helpTitle", "objectiveTitle", "objective", "controlsTitle", "WASD", "controls", "backgroundtint", "back"], settingsElements = ["subMenuBackground", "settingsTitle", "soundEffectsTitle", "soundEffects", "soundEffectsPlus", "soundEffectsMinus", "musicTitle", "music", "musicPlus", "musicMinus", "difficulty", "easy", "medium", "hard", "theme", "night", "evening", "morning", "backgroundtint", "back"], gameElements = ["stats", "pause", "musicSwitch"], gameOverElements = ["revive", "replay", "menu", "backgroundtint"], pauseGameElements = ["resume", "replay", "menu", "backgroundtint"], exitMenuElements = ["exitBackground", "yes", "no", "exitingMenu", "backgroundtint"];

// rotation lists for changing themes
let buttonColours = ["mediumpurple", "deepskyblue", "steelblue"], textColours = ["white", "black", "black"], musicButtons = ["url('game/unmutedWhite.png')", "url('game/mutedWhite.png')", "url('game/unmutedBlack.png')", "url('game/mutedBlack.png')", "url('game/unmutedBlack.png')", "url('game/mutedBlack.png')"], pauseButtons = ["url('game/pauseWhite.png')", "url('game/playWhite.png')", "url('game/pauseBlack.png')", "url('game/playBlack.png')", "url('game/pauseBlack.png')", "url('game/playBlack.png')"], themeIndex = 0;

// creating a list containing all image sources
let imageSources = ["cow/cow right.png", "cow/cow left.png", "cow/moo right.png", "cow/moo left.png", "sky/sky1.png", "sky/sky2.png", "sky/sky3.png", "platforms/brickblock.png", "platforms/brickblock.png", "platforms/grassblock.png", "platforms/mudblock.png", "platforms/stoneblock.png", "platforms/stoneblock.png"];

// appending coin sprites to the list of image sources
for (let i = 1; i <= 9; i++) {
  imageSources.push("coins/coin" + (i).toString() + ".png");
}

// creates database contains two arrays, players, and settings, in local storage, if they don't already exist
if (localStorage.getItem("players") == null) {
  localStorage.setItem("players", '[ {"username":"John", "password":"password123", "coins":10, "highScore":25}, {"username":"Anna", "password":"password123", "coins":31, "highScore":47}, {"username":"Peter", "password":"password123", "coins":4, "highScore":18} ]');
}

if (localStorage.getItem("settings") == null) {
  localStorage.setItem("settings", '[ {"username":"John", "soundEffects":0.4, "music":1, "difficulty":2, "theme":1}, {"username":"Anna", "soundEffects":0.4, "music":1, "difficulty":2, "theme": 1}, {"username":"Peter", "soundEffects":0.4, "music":1, "difficulty":2, "theme": 1} ]'); 
}

// turns JSON formatted strings into arrays
let playersDatabase = JSON.parse(localStorage.getItem("players")), settingsDatabase = JSON.parse(localStorage.getItem("settings"));

// creates image objects using the image sources and appends them to a list
let imageObjects = []
for (let i = 0; i < imageSources.length; i++) {
  let newImage = new Image();
  newImage.src = imageSources[i];
  imageObjects.push(newImage);
}

// list containing the dimensions of the different sky background images
let skyDimensions = [[1200, 799.5], [1290, 810], [1200, 750]];

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
    this.width = 147;
    this.height = 88.5;
    this.defaultLocation = 525;
    this.cow = 525;

    this.platformCollision = false;
    this.coinCollision = false;

    this.cowImage = imageObjects[0];
    this.mooImage = imageObjects[2];

    this.timeStamp = 0;

    this.coinAudio = document.getElementById("coinSound");

    this.score = 0;
    this.platformNum = 0;

    this.coinsCollected = 0

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
      context.drawImage(this.mooImage, this.cow + 30, this.position.y - 56.25, 78.75, 56.25);

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

        this.platformNum = platform.platformNum;

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
        coins.splice(i, 1);

        if (!musicMuted) {
          this.coinAudio.volume = settingsDatabase[playerID].soundEffects
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
        this.velocity.y -= 1500 * secondsPassed;
        if (this.velocity.x > 0) {
          this.velocity.x += 3000 * secondsPassed;
        } else {
          this.velocity.x -= 3000 * secondsPassed;
        }
      }
    }
  }

  // updates vertical velocity of the character and adjusts player motion if the new velocity causes collision
  verticalMovement(secondsPassed, left, right, up, platforms) {

    // vertical velocity constantly impacted by acceleration due to gravity 
    this.velocity.y += 3000 * secondsPassed;

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
      if (left && this.velocity.x > -750) this.velocity.x -= 100;

      // horizontal velocity increases by 20 pixels if "d" is pressed while colliding with a block
      if (right && this.velocity.x < 750) this.velocity.x += 100;

      // vertical velocity increases when "w" is pressed
      if (up) {
        this.velocity.y -= 1100;
      }
    } else {

      // horizontal velocity decreases by 25 pixels if "a" is pressed mid air
      if (left == true && this.velocity.x > -750) this.velocity.x -= 3.75;

      // horizontal velocity increases by 25 pixels if "d" is pressed mid air
      if (right == true && this.velocity.x < 750) this.velocity.x += 3.75;
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
  constructor({ x, y, width, height, themeIndex, platformNum }) {
    this.position = {
      x: Math.floor(Math.random() * (x.max - x.min)) + x.min,
      y: Math.floor(Math.random() * (y.max - y.min)) + y.min,
    }
    this.imageDimension = {
      x: 75,
      y: 75,
    }
    this.dimension = {
      x: Math.round((Math.floor(Math.random() * (width.max - width.min)) + width.min) / 75) * 75,
      y: Math.round((Math.floor(Math.random() * (height.max - height.min)) + width.min) / 75) * 75,
    }
    this.topImage = imageObjects[themeIndex * 2 + 7];
    this.insideImage = imageObjects[themeIndex * 2 + 8];

    this.platformNum = platformNum
  }

  // draws platform to canvas using the randomized coordinates and dimensions
  draw(xPlayer) {

    // draws platform like an array using 50 x 50 pixels blocks
    for (let row = 0; row < this.dimension.y; row += 75) {
      for (let column = 0; column < this.dimension.x; column += 75) {

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
    this.topImage = imageObjects[themeIndex * 2 + 7];
    this.insideImage = imageObjects[themeIndex * 2 + 8];

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
      x: 42,
      y: 42,
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

// create player object
let player = new Player();

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

    // runs log in screen
    loginScreen()

    // if canvas is unsupported by the browser
  } else {
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }
}

// checks if a user input contains spaces (used for error checking while logging in)
function checkInputForSpaces(text) {
  for (i = 0; i < text.split("").length; i++) {
    if (text.split("")[i] == " ") {
      return true;
    }
  } return false;
}


// displays login screen
function loginScreen() {

  // hides exit menu in case user is returning to the login screen from the menu
  elementVisibility(exitMenuElements, "hidden");
  
  elementVisibility(loginElements, "visible");

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";

  let title = document.getElementById("title").style

  title.width = "375px";
  title.height = "131.25px";
  title.left = "412.5px";
  title.top = "121.5px";

  document.getElementById("newPlayer").addEventListener("click", function() {
    newPlayer = true;
    existingPlayer = false;

    document.getElementById("newPlayer").style.backgroundImage = "url('menu/10.2.png')";
    document.getElementById("logIn").style.backgroundImage = "url('menu/11.1.png')";

    // document.getElementById("logIn").style.setProperty("hoverImage", "url('menu/11.1.png')");

  });

  document.getElementById("logIn").addEventListener("click", function() {
    newPlayer = false;
    existingPlayer = true;

    document.getElementById("newPlayer").style.backgroundImage = "url('menu/10.1.png')";
    document.getElementById("logIn").style.backgroundImage = "url('menu/11.2.png')";

  });

  document.getElementById("password").addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
      login();
    }
  });

}

// error checks username and password inputs
function login() {

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  let validLogin = false;
  let message = "";

  if (username.split("").length < 1) { // ensures the username field isn't left blank
    message = " Username missing!";
  } else if (password.split("").length < 4) { // ensures password is at least 4 characters in length (and also ensures the password field isn't left blank)
    message = " Password must be 4-20 characters in length!";
  } else if (checkInputForSpaces(username) || checkInputForSpaces(password)) { // ensures there are no spacees in the username/password
    message = " Make sure there are no spaces in the username or password!";
  } else { // if there are no errors in the entries, the login is valid 
    validLogin = true;
  }

  // if the player selected the 
  if (existingPlayer && validLogin) {

    message = " Invalid username / password! Account can not be found!";
    validLogin = false;

    for (i = 0; i < playersDatabase.length; i++) {
      if (playersDatabase[i].username == username && playersDatabase[i].password == password) {
        message = "";
        validLogin = true;

        player.coinsCollected = playersDatabase[i].coins;
        playerID = i;

        break;
      }
    }

  } else if (newPlayer && validLogin) {

    for (i = 0; i < playersDatabase.length; i++) {
      if (playersDatabase[i].username == username) {
        message = "Username is already in use!";
        validLogin = false;
        break;
      }
    }

    if (validLogin) {

      // creates records for the new player within the two database tables
      playersDatabase.push({ username: username, password: password, coins: 0, highScore: 0 });
      settingsDatabase.push({ username: username, soundEffects: 0.4, music: 1, difficulty: 2, theme: 1 });

      // updates database within local storage
      localStorage.setItem("players", JSON.stringify(playersDatabase));
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));

      player.coinsCollected = 0;
      playerID = playersDatabase.length - 1;
    }

  }

  // if user entry passes all error checking succesfully, they can enter the menu screen
  if (validLogin) {

    menuScreen();
    
  } else {
    document.getElementById("error").innerHTML = message;
    loginScreen();
  }

}

for (i = 0; i > document.getElementsByClassName("smallText").length; i++) {
    document.getElementsByClassName("smallText")[i].style.visibility = "hidden";
  }

function menuScreen() {

  elementVisibility(gameElements, "hidden");
  elementVisibility(pauseGameElements, "hidden");
  elementVisibility(gameOverElements, "hidden");
  elementVisibility(loginElements, "hidden");
  elementVisibility(helpElements, "hidden");
  elementVisibility(leaderboardElements, "hidden");
  elementVisibility(settingsElements, "hidden");
  elementVisibility(exitMenuElements, "hidden");
  elementVisibility(menuElements, "visible");
  
  let title = document.getElementById("title").style

  title.width = "750px";
  title.height = "262.5px";
  title.left = "45px";
  title.top = "150px";

  // draw sky image onto canvas
  context.drawImage(imageObjects[themeIndex + 4], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

}

function leaderboard() {

  elementVisibility(menuElements, "hidden");
  
  let table = document.getElementById("leaderboardTable");
  let highscores = [];

  // creates a list of all highscores
  for (i = 0; i < playersDatabase.length; i++) {
    highscores.push(playersDatabase[i].highScore);
  }

  // creates table ranking players by highscore
  for (i = 1; i <= Math.min(playersDatabase.length, 10); i++) {

    let highestScoreIndex = highscores.indexOf(Math.max(...highscores))
    
    let row = table.insertRow(i);

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);

    cell1.innerHTML = i.toString() + ".";
    cell2.innerHTML = playersDatabase[highestScoreIndex].username;
    cell3.innerHTML = playersDatabase[highestScoreIndex].highScore.toString();

    highscores[highestScoreIndex] = -1;

    if (playersDatabase[highestScoreIndex].username == username) {
      row.style.backgroundColor = "plum"
    }

  }

  // displays table
  elementVisibility(leaderboardElements, "visible");
  
}

function help() {
  elementVisibility(menuElements, "hidden");
  elementVisibility(helpElements, "visible");
}

function settings() {
  elementVisibility(menuElements, "hidden");
  elementVisibility(settingsElements, "visible");
  
  document.getElementById("difficulty" + settingsDatabase[playerID].difficulty.toString()).checked = true;
  document.getElementById("theme" + settingsDatabase[playerID].theme.toString()).checked = true;

  let soundEffectsDisplayed = document.getElementById("soundEffects"), musicDisplayed = document.getElementById("music"); 
  
  soundEffectsDisplayed.innerHTML = (settingsDatabase[playerID].soundEffects * 100).toString() + "%";
  musicDisplayed.innerHTML = (settingsDatabase[playerID].music * 100).toString() + "%";
  
  document.getElementById("soundEffectsPlus").addEventListener("click", function () {
    if (settingsDatabase[playerID].soundEffects < 1) {
      settingsDatabase[playerID].soundEffects = Math.round((settingsDatabase[playerID].soundEffects + 0.2) * 10) / 10;
      soundEffectsDisplayed.innerHTML = (settingsDatabase[playerID].soundEffects * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
    }
  });

  document.getElementById("soundEffectsMinus").addEventListener("click", function () {
    if (0 < settingsDatabase[playerID].soundEffects) {
      settingsDatabase[playerID].soundEffects = Math.round((settingsDatabase[playerID].soundEffects - 0.2) * 10) / 10;
      soundEffectsDisplayed.innerHTML = (settingsDatabase[playerID].soundEffects * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
    }
  });
  
  document.getElementById("musicPlus").addEventListener("click", function () {
    if (settingsDatabase[playerID].music < 1) {
      settingsDatabase[playerID].music = Math.round((settingsDatabase[playerID].music + 0.2) * 10) / 10;
      musicDisplayed.innerHTML = (settingsDatabase[playerID].music * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      music[musicIndex].volume = settingsDatabase[playerID].music
    }
  });

  document.getElementById("musicMinus").addEventListener("click", function () {
    if (0 < settingsDatabase[playerID].music) {
      settingsDatabase[playerID].music = Math.round((settingsDatabase[playerID].music - 0.2) * 10) / 10;
      musicDisplayed.innerHTML = (settingsDatabase[playerID].music * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      music[musicIndex].volume = settingsDatabase[playerID].music;
    }
  });

}

function updateDifficulty() {
  let chosenDifficuly = document.getElementsByName("difficulty");
              
  for (i = 0; i < chosenDifficuly.length; i++) {
    if (chosenDifficuly[i].checked) {
      console.log(i + 1);

      settingsDatabase[playerID].difficulty = i + 1;
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      
    }
  }
}

function updateTheme() {
  let chosenTheme = document.getElementsByName("theme");
              
  for (i = 0; i < chosenTheme.length; i++) {
    if (chosenTheme[i].checked) {
      console.log(i + 1);

      settingsDatabase[playerID].theme = i + 1;
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      
    }
  }

  
}

function changeTheme() {
  if (themeIndex < 2) {
    themeIndex += 1;
  } else {
    themeIndex = 0;
  }

  document.getElementById("stats").style.color = textColours[themeIndex];

  if (music[musicIndex].paused == true) {
    document.getElementById("musicSwitch").style.backgroundImage = musicButtons[themeIndex * 2 + 1];
  } else {
    document.getElementById("musicSwitch").style.backgroundImage = musicButtons[themeIndex * 2];
  }

}

function exit() {
  elementVisibility(menuElements, "hidden");
  elementVisibility(helpElements, "hidden");
  elementVisibility(exitMenuElements, "visible");
}

function revive() {

  if (player.coinsCollected >= 5) {
    player.coinsCollected -= 5;

    for (let i = 0; i < platforms.length; i++) {
      if (platforms[i].platformNum == player.score) {
        player.position.x = platforms[i].position.x - player.defaultLocation;
      }
    }

    player.position.y = -300;
    player.velocity.x = 0; player.velocity.y = 0; player.cow = player.defaultLocation; player.cowImage = imageObjects[0];

    elementVisibility(gameOverElements, "hidden");
  }

}

function initGame() {

  replay = false;
  menu = false;
  pause = false;

  // ranges for the coordinates and dimensions of the first platform 
  xPlatform = { min: 150, max: 300 }, yPlatform = { min: 300, max: 450 }, widthPlatform = { min: 150, max: 300 }, heightPlatform = { min: 150, max: 300 };

  // resets the platform number to 0
  platformNum = 0;

  // first platform object
  newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max }, themeIndex: themeIndex, platformNum: platformNum });

  // coin objects for coin counter and replay button
  decorativeCoin = new Coin({ x: { min: 50, max: 50 }, y: { min: 50, max: 50 } });

  // set score and colliding platform number counter to 0
  player.score = 0;
  player.platformNum = 0;

  // adds platform to a list that contains all platforms objects
  platforms = []; platforms.push(newPlatform);
  coins = []; coinIndex = 1;

  // resets the position, velocity, and image of the cow player onto the first platform
  player.position.x = newPlatform.position.x - player.defaultLocation; player.position.y = -300

  player.velocity.x = 0; player.velocity.y = 0; player.cow = player.defaultLocation; player.cowImage = imageObjects[0];

  // sets HTML game elements to visible and hides all other elements
  elementVisibility(gameOverElements, "hidden");
  elementVisibility(pauseGameElements, "hidden");
  elementVisibility(menuElements, "hidden");

  elementVisibility(gameElements, "visible");
  
  // start the first frame request
  window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp) {

  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = Math.min((timeStamp - oldTimeStamp) / 1500, .5);
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
  if (newPlatform.position.x + newPlatform.dimension.x + player.width <= player.position.x + 1200) {

    // the randomized x-coordinate of the new platform is within 100 pixels from 
    xPlatform.min = newPlatform.position.x + newPlatform.dimension.x + 300;
    xPlatform.max = xPlatform.min + 150;

    // increase the index of the platform by 1 for keeping track of score
    platformNum += 1;

    newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max }, themeIndex: themeIndex, platformNum: platformNum });

    // adds the platform to the list containing all platform objects
    platforms.push(newPlatform);

  }

  // deletes platform for list of platforms that are drawn once it's off screen and the one ahead of it is also off screen 
  for (let i = 0; i < platforms.length; i++) {
    if (platforms[i].position.x + platforms[i].dimension.x < player.position.x && i > 0) {
      platforms.splice(i - 1, 1);
      break;
    }
  }

  // once player is past the furthest coin, a new coin object is created
  if (coinIndex <= platforms[platforms.length - 1].platformNum) {

    let platform;

    for (let i = 0; i < platforms.length; i++) {
      if (coinIndex == platforms[i].platformNum) {
        platform = platforms[i];
      }
    }

    // ranges for the coordinates of the new coin 
    let xCoin = { min: platform.position.x, max: platform.position.x + platform.dimension.x + 300 };
    let yCoin = { min: platform.position.y - 300, max: platform.position.y - 180 };

    // new coin object
    newCoin = new Coin({ x: { min: xCoin.min, max: xCoin.max }, y: { min: yCoin.min, max: yCoin.max } });

    // adds the coin to the list containing all coin objects
    coins.push(newCoin);

    // randomly chooses a platform (3-5 platforms ahead of the previous coin) where the next coin is going to created
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

  // updates annimation for coin counterd
  decorativeCoin.update(secondsPassed, 0);

  if (playersDatabase[playerID].highScore <= player.score) {
    playersDatabase[playerID].highScore = player.score;
    document.getElementById("stats").innerHTML = "X " + player.coinsCollected.toString() + "&nbsp&nbsp&nbsphighscore: " + playersDatabase[playerID].highScore;
  } else {
    document.getElementById("stats").innerHTML = "X " + player.coinsCollected.toString() + "&nbsp&nbsp&nbspscore: " + player.score.toString() + "&nbsp&nbsp&nbsphighscore: " + playersDatabase[playerID].highScore;
  }

  document.getElementById("pause").addEventListener("click", function() { pause = true; });

  // if the player falls into the void the game restarts
  if (player.position.y > 750 || pause) { 

    playersDatabase[playerID].coins = player.coinsCollected
    localStorage.setItem("players", JSON.stringify(playersDatabase));

    player.velocity.x = 0;
    player.velocity.y = 0;

    document.getElementById("menu").addEventListener("click", function() { menu = true; });
    document.getElementById("replay").addEventListener("click", function() { replay = true; });
    document.getElementById("resume").addEventListener("click", function() { pause = false; });

    if (player.position.y > 750) {
      elementVisibility(gameOverElements, "visible");
    } else if (pause) {
      elementVisibility(pauseGameElements, "visible");
    }

  } else {
    elementVisibility(pauseGameElements, "hidden");
    eventListener("keydown", true);
    eventListener("keyup", false);
  }

  if (menu) {
    menuScreen();
  } else if (replay) {
    initGame();  
  } else { // new frames keep being requested by recalling the gameLoop function
    window.requestAnimationFrame(gameLoop);
  }
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
    document.getElementById(list[i]).style.visibility = status;
  }

}

function playMusic() {

  if (music[musicIndex].paused == true) {
    music[musicIndex].play();
    document.getElementById("musicSwitch").style.backgroundImage = musicUnmutedImage;

    musicMuted = false

  } else {
    music[musicIndex].pause();
    document.getElementById("musicSwitch").style.backgroundImage = musicMutedImage;

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