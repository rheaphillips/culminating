/* Name: Rhea Phillips
Data: January 20th, 2023
Program Name: Moo!
Program Purpose: A 2D Parkour GUI based game where you're a cow exploring the vast world! The objective of the game is to beat your personal highscore; traveling as far as possible by jumping from one platform to another, without falling. */

// ------------ VARIABLES ------------

// declares global variables
let canvas, context, playerID, secondsPassed, oldTimeStamp = 0, left = false, right = false, up = false, newPlatform, platforms, coins, coinIndex = 1, xPlatform, yPlatform, widthPlatform, heightPlatform, menu = false, replay = false, pause = false, platformNum = 0, newPlayer = false, existingPlayer = true, midAirAcceleration, coinDensity, platformDistance, themeIndex = 0;

// lists containing HTML elements ids for different pages
let loginElements = ["newPlayer", "logIn", "username", "password", "usernameLabel", "passwordLabel", "enter", "error", "title", "backgroundtint"], menuElements = ["play", "leaderboard", "welcome", "help", "settings", "title", "backgroundtint", "exit"], leaderboardElements = ["subMenuBackground", "leaderboardTitle", "leaderboardTable", "backgroundtint", "back"], helpElements = ["subMenuBackground", "helpTitle", "objectiveTitle", "objective", "controlsTitle", "WASD", "controls", "backgroundtint", "back"], settingsElements = ["subMenuBackground", "settingsTitle", "soundEffectsTitle", "soundEffects", "soundEffectsPlus", "soundEffectsMinus", "musicTitle", "music", "musicPlus", "musicMinus", "difficulty", "easy", "medium", "hard", "theme", "night", "evening", "morning", "backgroundtint", "back"], gameElements = ["stats", "pause", "musicSwitch"], gameOverElements = ["revive", "replay", "menu", "backgroundtint"], pauseGameElements = ["resume", "replay", "menu", "backgroundtint"], exitMenuElements = ["exitBackground", "yes", "no", "exitingMenu", "backgroundtint"];

// rotation lists for changing themes
let textColours = ["white", "black", "black"], themeColours = ["#913822", "#464646", "#ad8016"], musicUnmutedButtons = ["url('game/unmutedWhite.png')", "url('game/unmutedBlack.png')", "url('game/unmutedBlack.png')"], musicMutedButtons = ["url('game/mutedWhite.png')", "url('game/mutedBlack.png')", "url('game/mutedBlack.png')"], pauseButtons = ["url('game/pauseWhite.png')", "url('game/pauseBlack.png')", "url('game/pauseBlack.png')"], playButtons = ["url('game/playWhite.png')", "url('game/playBlack.png')", "url('game/playBlack.png')"], skyDimensions = [[1200, 799.5], [1290, 810], [1200, 750]];

// lists containing HTML ids for for all elements for which the image changes when theme is changed
themedImages = ["subMenuBackground", "leaderboardTitle", "helpTitle", "objectiveTitle", "controlsTitle", "WASD", "settingsTitle", "soundEffectsTitle", "musicTitle", "difficulty", "theme", "exitBackground"];
themedButtons = ["back", "soundEffectsPlus", "soundEffectsMinus", "musicPlus", "musicMinus", "yes", "no"];

// lists containing image pathways the elements corresponding to the lists above
themedImagesSources = ["menu/bigBrickBackground", "menu/6.2", "menu/4.2", "menu/4.3", "menu/4.4", "menu/4.5", "menu/5.2", "menu/5.3","menu/5.4", "menu/5.5", "menu/5.6", "menu/smallBrickBackground"];
themedButtonsSources = ["menu/3", "menu/5.7", "menu/5.8", "menu/5.7", "menu/5.8", "menu/15", "menu/14"];

// creating a list that contains the image sources of all coin sprites
let coinImageSources = [];
for (let i = 1; i <= 9; i++) {
  coinImageSources.push("coins/coin" + (i).toString() + ".png");
}

// creates lists that contain different types of image objects 
let cowImageObjects = createImageObjects(["cow/cow right.png", "cow/cow left.png", "cow/moo right.png", "cow/moo left.png"]), coinImageObjects = createImageObjects(coinImageSources), skyImageObjects = createImageObjects(["sky/sky1.png", "sky/sky2.png", "sky/sky3.png"]), platformImageObjects = createImageObjects(["platforms/brickblock.png", "platforms/stoneblock.png", "platforms/sandblock.png"]);

// creates database contains two arrays, players, and settings, in local storage, if they don't already exist
if (localStorage.getItem("players") == null) {
  localStorage.setItem("players", '[ {"username":"John", "password":"password123", "coins":10, "highScore":25}, {"username":"Anna", "password":"password123", "coins":31, "highScore":47}, {"username":"Peter", "password":"password123", "coins":4, "highScore":18} ]');
}

if (localStorage.getItem("settings") == null) {
  localStorage.setItem("settings", '[ {"username":"John", "soundEffects":0.4, "music":1, "difficulty":2, "theme":0}, {"username":"Anna", "soundEffects":0.4, "music":1, "difficulty":2, "theme": 0}, {"username":"Peter", "soundEffects":0.4, "music":1, "difficulty":2, "theme": 0} ]'); 
}

// turns JSON formatted strings into arrays
let playersDatabase = JSON.parse(localStorage.getItem("players")), settingsDatabase = JSON.parse(localStorage.getItem("settings"));

// audios and releated variables
let music = [document.getElementById("song1"), document.getElementById("song2"), document.getElementById("song3")], musicIndex = 0, musicMuted = true;



// ------------ CLASSES ------------

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

    this.cowImage = cowImageObjects[0];
    this.mooImage = cowImageObjects[2];

    this.timeStamp = 0;

    this.coinAudio = document.getElementById("coinSound");

    this.score = 0;
    this.platformNum = 0;

    this.coinsCollected = 0

  }

  // drawing square player onto canvas at the correct coordinates
  draw(secondsPassed) {

    // draws different cow sprite depending on the direction the cow is moving
    if (this.velocity.x >= 0) {
      this.cowImage = cowImageObjects[0];
    } else {
      this.cowImage = cowImageObjects[1];
    }

    // draws cow to canvas
    context.drawImage(this.cowImage, this.cow, this.position.y, this.width, this.height);

    // draws moo speech bubble to canvas if cow collects a coin, displaying the sppech bubble for 0.5 seconds
    if (this.coinCollision == true && this.timeStamp <= 0.5) {

      this.timeStamp += secondsPassed;

      // a different moo speech bubble image is displayed depending on the direction the cow is facing
      if (this.velocity.x >= 0) {
        this.mooImage = cowImageObjects[2];
      } else {
        this.mooImage = cowImageObjects[3];
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
  platformCollisionDetection() {

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
  coinCollisionDetection() {

    // runs through all the platform objects checking whether the player is within the coordinates of that platform
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];

      // if the coordinates of the square overlap with the coin, the coin object is removed from the list of coins
      if (coin.position.y + coin.dimension.y > this.position.y && coin.position.x < this.position.x + this.cow + this.width && coin.position.x + coin.dimension.x > this.position.x + this.cow && coin.position.y < this.position.y + this.height) {
        coins.splice(i, 1);

        // a coin/ping audio is played if music isn't muted
        if (!musicMuted) {
          this.coinAudio.volume = settingsDatabase[playerID].soundEffects
          this.coinAudio.play();
        }

        // coins increase by 1
        this.coinsCollected += 1;

        this.coinCollision = true;

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
    this.platformCollisionDetection();

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
  verticalMovement(secondsPassed) {

    // vertical velocity constantly impacted by acceleration due to gravity 
    this.velocity.y += 3000 * secondsPassed;

    // vertical position updated using new velocity and the number of seconds that have passed since the last frame
    this.position.y += this.velocity.y * secondsPassed;

    // checks if the square is colliding with any of the platform (top and bottom of the platform since only vertical velocity has changed)
    this.platformCollisionDetection();

    if (this.platformCollision) {

      // updates score if on a platform
      if (this.score < this.platformNum) {
        this.score = this.platformNum
      }

      // resets the position of the square to where it was before collision
      this.position.y -= this.velocity.y * secondsPassed;
      this.velocity.y = 0;

      // horizontal velocity decreases by 100 if "a" is pressed while colliding with a block
      if (left && this.velocity.x > -750) this.velocity.x -= 100;

      // horizontal velocity increases by 1o0 if "d" is pressed while colliding with a block
      if (right && this.velocity.x < 750) this.velocity.x += 100;

      // vertical velocity increases when "w" is pressed
      if (up) {
        this.velocity.y -= 1100;
      }
    } else {

      // horizontal velocity decreases by a smaller amount if "a" is pressed mid air
      if (left == true && this.velocity.x > -750) this.velocity.x -= midAirAcceleration;

      // horizontal velocity increases by a smaller amount if "d" is pressed mid air
      if (right == true && this.velocity.x < 750) this.velocity.x += midAirAcceleration;
    }
  }

  // runs all the nessecary functions for the player
  update(secondsPassed) {

    this.draw(secondsPassed);
    this.horizontalMovement(secondsPassed);
    this.verticalMovement(secondsPassed);
    this.coinCollisionDetection();
  }
}

// class contains all the functions needed to create a platform object, and draw and move it depending on camera position
class Platform {

  // randomizes coordinates and dimensions, within the given range
  constructor({ x, y, width, height, platformNum }) {
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

    this.platformNum = platformNum
  }

  // draws platform to canvas using the randomized coordinates and dimensions
  draw(xPlayer) {

    // draws platform like an array using blocks that are 75 x 75 pixels 
    for (let row = 0; row < this.dimension.y; row += 75) {
      for (let column = 0; column < this.dimension.x; column += 75) {

        // draws the platform row by row using the base block
        context.drawImage(platformImageObjects[themeIndex], this.position.x + column - xPlayer, this.position.y + row, this.imageDimension.x, this.imageDimension.y);

      }
    }

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
    this.image = 0;
    this.timeStamp = 0;
  }

  // draws coin object to canvas using the randomized coordinates
  draw(xPlayer) {

    context.drawImage(coinImageObjects[this.image], this.position.x - xPlayer, this.position.y, this.dimension.x, this.dimension.y);
  }

  update(secondsPassed, xPlayer) {

    this.timeStamp += secondsPassed;

    // changes coin sprite every 1 seconds
    if (this.timeStamp >= 0.05) {
      if (this.image == 8) {
        this.image = 0;
      } else {
        this.image += 1;
      }

      this.timeStamp = 0;
    }

    this.draw(xPlayer);

  }
}



// ------------ GENERAL FUNCTIONS ------------

// creates image objects using the image sources and appends them to a list
// IN: imageSources
// OUT: list constanting image objects
function createImageObjects(imageSources) {

  let imageList = [];
  
  for (let i = 0; i < imageSources.length; i++) {
    let newImage = new Image();
    newImage.src = imageSources[i];
    imageList.push(newImage);
  }

  return imageList;
}

// checks if a user input contains spaces (used for error checking while logging in)
// IN: text
// OUT: true or false indicating whehter the text contains spaces or not
function checkInputForSpaces(text) {
  for (i = 0; i < text.split("").length; i++) {
    if (text.split("")[i] == " ") {
      return true;
    }
  } return false;
}

// error checks username and password inputs
// IN: nothing
// OUT: running the function for the correct page (login page/menu page) depending on whether the error checking was successful or not
function login() {

  // sets local variables to the username and password fields for easy reference while error checking
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  // if valid login is true by the ending of the error checking, user proceeds to menu page
  let validLogin = false;

  // error message that is determined depending on what kind of error is detected
  let message = "";

  // -- Error Checking For Unacceptable Username/Password Inputs -- 

  if (username.split("").length < 1) { // ensures the username field isn't left blank
    message = " Username missing!";
  } else if (password.split("").length < 4) { // ensures password is at least 4 characters in length (and also ensures the password field isn't left blank)
    message = " Password must be 4-20 characters in length!";
  } else if (checkInputForSpaces(username) || checkInputForSpaces(password)) { // ensures there are no spacees in the username/password
    message = " Make sure there are no spaces in the username or password!";
  } else { // if there are no typing errors in the entries, the login is valid till now
    validLogin = true;
  }

  // -- Error Checking for Ensuring Username Matches/Doesn't Match Usernames in Database --

  // if the player selected the exiting player button username should match one in the database
  if (existingPlayer && validLogin) {

    message = " Invalid username / password! Account can not be found!";
    validLogin = false;

    // iterates through all the usernames and passwords in the database, looking for matching username/password pairs
    for (i = 0; i < playersDatabase.length; i++) {

      // playerID (used for refering to the user's record in the database throughout the program) is set once the login is determined as successful
      if (playersDatabase[i].username == username && playersDatabase[i].password == password) {
        message = "";
        validLogin = true;

        playerID = i;

        // welcome back message since the player is returning
        document.getElementById("welcome").innerHTML = "Welcome Back " + username + "!"

        break;
      }
    }

  // if the player selected the new player button username shouldn't match with any in the database
  } else if (newPlayer && validLogin) {

    // iterates through all the usernames in the database, looking for one that matches
    for (i = 0; i < playersDatabase.length; i++) {
      if (playersDatabase[i].username == username) {
        message = "Username is already in use!";
        validLogin = false;
        break;
      }
    }

    // if the username isn't already taken, a new record with default settings is created within the database/local storage
    if (validLogin) {

      // creates records for the new player within the two database tables
      playersDatabase.push({ username: username, password: password, coins: 0, highScore: 0 });
      settingsDatabase.push({ username: username, soundEffects: 0.4, music: 1, difficulty: 2, theme: 0 });

      // updates database within local storage, to ensure the new player is instantly saved
      localStorage.setItem("players", JSON.stringify(playersDatabase));
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));

      // playerID is set
      playerID = playersDatabase.length - 1;

      // welcome message if the player is new to the game
      document.getElementById("welcome").innerHTML = "Welcome " + username + "!"
    }

  }

  // if user entry passes all error checking succesfully, they can enter the menu screen
  if (validLogin) {

    // coins collected is set to the saved number of coins in the user's database record
    player.coinsCollected = playersDatabase[playerID].coins;

    // themeIndex (referenced throught the program for setting visual aesthetics) is set to the saved theme in the user's database record
    themeIndex = settingsDatabase[playerID].theme;

    // theme and difficulty are updated to match the saved settings in the user's database record, before entering the menu
    updateTheme();
    updateDifficulty();

    // runs menu screen
    menuScreen();

  // if there is any error, the user remains at the login screen and shown a message that indicates the nature of the error
  } else {

    document.getElementById("error").innerHTML = message;
    loginScreen();
  }

}

// saves the difficulty setting that the player chooses to the database and updates the settings by calling updateDifficulty()
// IN: nothing
// OUT: difficulty level saved to the database and local storage, and settings updated
function updateDifficultyIndex() {

  // a list containing the 3 checkbozes that indicate difficulty
  let chosenDifficuly = document.getElementsByName("difficulty");

  // iterates through the 3 checkboxes, looking for the one that is checked off
  for (i = 0; i < chosenDifficuly.length; i++) {
    if (chosenDifficuly[i].checked) {

      // the checked off ddificulty is saved to the database and local storage
      settingsDatabase[playerID].difficulty = i + 1;
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      
    }
  }

  // once the difficulty level is saved to the database, game settings are updated for the new level of difficulty
  updateDifficulty();
  
}

// updates game settings to chosen difficulty level
// IN: nothing
// OUT: Acceleration of the cow while in air, the minimum distance between platforms, and the minimum platforms between coins (coin density) are set according to the difficulty setting
function updateDifficulty() {
  
  // checks value of the difficulty setting and changes settings accordingly 
  switch (settingsDatabase[playerID].difficulty) {
      
    case 1:
      midAirAcceleration = 50;
      platformDistance = 200;
      coinDensity = 1;
      break;

    // right key pressed/released
    case 2:
      midAirAcceleration = 25;
      platformDistance = 300;
      coinDensity = 2;
      break;

    // up key pressed/released
    case 3:
      midAirAcceleration = 10;
      platformDistance = 500;
      coinDensity = 5;
      break;
  }
}

// saves the theme setting that the player chooses to the database and updates the theme throughout the game by calling updateTheme()
// IN: nothing
// OUT: theme saved to the database and local storage, and settings updated
function updateThemeIndex() {

  // a list containing the 3 checkbozes that indicate theme
  let chosenTheme = document.getElementsByName("theme");

  // iterates through the 3 checkboxes, looking for the one that is checked off
  for (i = 0; i < chosenTheme.length; i++) {
    if (chosenTheme[i].checked) {

      // the checked off ddificulty is saved to the database and local storage
      settingsDatabase[playerID].theme = i;
      themeIndex = settingsDatabase[playerID].theme
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      
    }
  } 

  // once the theme is saved to the database, the colours/images are updated throughout the game to match the new theme
  updateTheme();
  
}

// updates all elements using the current theme index
// IN: nothing
// OUT: colours/images updated throughout the game to match the theme setting saved in the player's record in the database
function updateTheme() {
  
  // updates sky image that's drawn to canvas to match the player's new theme
  context.drawImage(skyImageObjects[themeIndex], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

  // changes the colour of the stats to match the new theme
  document.getElementById("stats").style.color = textColours[themeIndex];

  // updates pause and music switch buttons to match the new theme
  document.getElementById("pause").style.backgroundImage = pauseButtons[themeIndex];

  // updates the images for the music switch
  if (music[musicIndex].paused == true) {
    document.getElementById("musicSwitch").style.backgroundImage = musicMutedButtons[themeIndex];
  } else {
    document.getElementById("musicSwitch").style.backgroundImage = musicUnmutedButtons[themeIndex];
  }
  
  // updates the image sources for all HTML image elements to the images correspodning to the new theme
  for (i = 0; i < themedImages.length; i++) {
      document.getElementById(themedImages[i]).src = themedImagesSources[i] + "." + themeIndex.toString() + ".png";
  }

  // updates the image sources for all HTML button elements to the images correspodning to the new theme
  for (i = 0; i < themedButtons.length; i++) {
      document.getElementById(themedButtons[i]).style.backgroundImage = "url('" + themedButtonsSources[i] + "." + themeIndex.toString() + ".png')";
  }

  // updates the CSS themed colour variable used by HTML elements to match the new theme
  document.querySelector(":root").style.setProperty("--themeColour", themeColours[themeIndex]);
}

// hides/displays HTML elements 
// IN: list contains the IDs of the HTML elements that need to be hidden/made visible, and the status (hidden/visible) that you want to set the elemts to
// OUT: indicated HTML elements hidden or made visible
function elementVisibility(list, status) {

  // iterates through the given list of elements, setting the visibility CSS attribute of each element to the given status
  for (let i = 0; i < list.length; i++) {
    document.getElementById(list[i]).style.visibility = status;
  }

}

// plays/pauses music
// IN: nothing
// OUT: music starts playing or is paused
function playMusic() {

  // if the music is already paused, music begins to play and the image used for the music switch button is changed to ON
  if (music[musicIndex].paused == true) {
    music[musicIndex].play();
    document.getElementById("musicSwitch").style.backgroundImage = musicUnmutedButtons[themeIndex];

    musicMuted = false

  // if the music is playing, music is paused and the image used for the music switch button is changed to muted
  } else {
    music[musicIndex].pause();
    document.getElementById("musicSwitch").style.backgroundImage = musicMutedButtons[themeIndex];

    musicMuted = true
  }

}

// revives cow after it has fallen into the void
// IN: nothing
// OUT: cow's position set to the location of the last platform it touched before falling
function revive() {

  // only runs the function if the player has enough coins (5)
  if (player.coinsCollected >= 5) {

    // removes 5 coins for reviving cow
    player.coinsCollected -= 5;

    // iterates through the list of platform objects, looking for the platform who's index matches with the player's score since that would be the last platform the player touched. 
    for (let i = 0; i < platforms.length; i++) {
      
      if (platforms[i].platformNum == player.score) {

        // sets player's horizontal position equal to this platform's position
        player.position.x = platforms[i].position.x - player.defaultLocation;
      }
    }

    // set's the player's position to 300 pixels above the top edge of the canvas, so that the cow free falls back into the game
    player.position.y = -300;

    // sets cow velocity and other attributes to their default values
    player.velocity.x = 0; player.velocity.y = 0; player.cow = player.defaultLocation; player.cowImage = cowImageObjects[0];

    // hides game over menu elements
    elementVisibility(gameOverElements, "hidden");
  }

}

// listens for keydown/keyup events for keys "a", "d" and "w" to change movement varaibels
// IN: the event type the program should be listening for (keydown/keyup) and what state should the movement variables be set to
// OUT: the state of the movement varaibles (up/left/right) used for moving the cow
function eventListener(eventType, state) {

  // in built event listener
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



// ------------ FUNCTIONS FOR EACH OF THE DIFFERENT PAGES ------------

// MAIN INITIALLIZATION FUNCTION

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
    context.drawImage(skyImageObjects[0], 0, 0, skyDimensions[0][0], skyDimensions[0][1]);

    // calls login screen function
    loginScreen()

    // if canvas is unsupported by the browser
  } else {
    document.getElementById("canvasNotSupported").innerHTML = "Your browser doesn't support canvas! Please use another browser to play game";
  }
}

// LOGIN SCREEN FUNCTION

function loginScreen() {

  // hides exit menu in case user is returning to the login screen from the menu
  elementVisibility(exitMenuElements, "hidden");

  // sets login screen elements to visible
  elementVisibility(loginElements, "visible");

  document.getElementById("username").value = "";
  document.getElementById("password").value = "";

  // sets dimensions and position of title "MOO" in case returning from main menu, where they are set to different values
  let title = document.getElementById("title").style

  title.width = "375px";
  title.height = "131.25px";
  title.left = "412.5px";
  title.top = "121.5px";

  // identifies when user clicks on new player and changes the style of the buttons
  document.getElementById("newPlayer").addEventListener("click", function() {
    newPlayer = true;
    existingPlayer = false;

    document.getElementById("newPlayer").style.backgroundImage = "url('menu/10.2.png')";
    document.getElementById("logIn").style.backgroundImage = "url('menu/11.1.png')";

  });

  // identifies when user clicks on login and changes the style of the buttons
  document.getElementById("logIn").addEventListener("click", function() {
    newPlayer = false;
    existingPlayer = true;

    document.getElementById("newPlayer").style.backgroundImage = "url('menu/10.1.png')";
    document.getElementById("logIn").style.backgroundImage = "url('menu/11.2.png')";

  });

  // listens for enter key events when within the passqord field, running the login function when enter is clicked
  document.getElementById("password").addEventListener("keypress", function(event) {
    if (event.key == "Enter") {
      login();
    }
  });

}

// MENU SCREEN FUNCTION

function menuScreen() {

  // music starts playing as sson as user enters the menu page
  music[musicIndex].play();
  document.getElementById("musicSwitch").style.backgroundImage = musicUnmutedButtons[themeIndex];
  musicMuted = false;

  // ensures all elements are hidden besides menu elements since a player could be entering the menu from any other page
  elementVisibility(gameElements, "hidden");
  elementVisibility(pauseGameElements, "hidden");
  elementVisibility(gameOverElements, "hidden");
  elementVisibility(loginElements, "hidden");
  elementVisibility(helpElements, "hidden");
  elementVisibility(leaderboardElements, "hidden");
  elementVisibility(settingsElements, "hidden");
  elementVisibility(exitMenuElements, "hidden");
  elementVisibility(menuElements, "visible");

  // updates dimensions and position of title "MOO!" in case user is entering from login page 
  let title = document.getElementById("title").style

  title.width = "750px";
  title.height = "262.5px";
  title.left = "45px";
  title.top = "150px";

  // updates sky image that's drawn to canvas to match the player's chosen theme
  context.drawImage(skyImageObjects[themeIndex], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

}

// LEADERBOARD PAGE FUNCTION

function leaderboard() {

  // menu elements are hidden
  elementVisibility(menuElements, "hidden");

  // HTML leaderboard table is referenced
  let table = document.getElementById("leaderboardTable");
  let highscores = [];

  let tableRows = table.rows.length;
  
  // clears table of all rows before adding the updated records
  for (i = 1; i < tableRows; i++) {
    table.deleteRow(1);
  }

  // creates a list of all highscores
  for (i = 0; i < playersDatabase.length; i++) {
    highscores.push(playersDatabase[i].highScore);
  }
  
  // creates table ranking players by highscore
  for (i = 1; i <= Math.min(playersDatabase.length, 10); i++) {

    // identifies the index of the greatest highscore in the list of highscore
    let highestScoreIndex = highscores.indexOf(Math.max(...highscores))
    
    let row = table.insertRow(i);

    // creates three cells, one for ranking, one for name and one for highscore
    let cell1 = row.insertCell(0), cell2 = row.insertCell(1), cell3 = row.insertCell(2);

    // updates cells with the information of the player with the greatest highscore using the index
    cell1.innerHTML = i.toString() + ".";
    cell2.innerHTML = playersDatabase[highestScoreIndex].username;
    cell3.innerHTML = playersDatabase[highestScoreIndex].highScore.toString();

    // changes this highscore to -1, so that the nextest greatest highscore within the list can be found
    highscores[highestScoreIndex] = -1;

  }

  // displays table, along with the other elements used in the leaderboard page
  elementVisibility(leaderboardElements, "visible");
  
}

// HELP PAGE FUNCTION

function help() {

  // menu elements are hidden and help page elements are displayed
  elementVisibility(menuElements, "hidden");
  elementVisibility(helpElements, "visible");
}

// SETTINGS PAGE FUNCTION

function settings() {

  // menu elements are hidden and settings page elements are displayed
  elementVisibility(menuElements, "hidden");
  elementVisibility(settingsElements, "visible");

  // the user's saved difficuly level and theme are checked off
  document.getElementById("difficulty" + settingsDatabase[playerID].difficulty.toString()).checked = true;
  document.getElementById("theme" + settingsDatabase[playerID].theme.toString()).checked = true;

  // the sound effects and music volume displays are set to the user's saved volumes
  let soundEffectsDisplayed = document.getElementById("soundEffects"), musicDisplayed = document.getElementById("music"); 

  // volumes are displayed as percentage
  soundEffectsDisplayed.innerHTML = (settingsDatabase[playerID].soundEffects * 100).toString() + "%";
  musicDisplayed.innerHTML = (settingsDatabase[playerID].music * 100).toString() + "%";

  // runs if the plus button is clicked for sound effects volume
  document.getElementById("soundEffectsPlus").addEventListener("click", function () {
    if (settingsDatabase[playerID].soundEffects < 1) {
      settingsDatabase[playerID].soundEffects = Math.round((settingsDatabase[playerID].soundEffects + 0.2) * 10) / 10;
      soundEffectsDisplayed.innerHTML = (settingsDatabase[playerID].soundEffects * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
    }
  });

  // runs if the minus button is clicked for sound effects volume
  document.getElementById("soundEffectsMinus").addEventListener("click", function () {
    if (0 < settingsDatabase[playerID].soundEffects) {
      settingsDatabase[playerID].soundEffects = Math.round((settingsDatabase[playerID].soundEffects - 0.2) * 10) / 10;
      soundEffectsDisplayed.innerHTML = (settingsDatabase[playerID].soundEffects * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
    }
  });

  // runs if the plus button is clicked for music volume
  document.getElementById("musicPlus").addEventListener("click", function () {
    if (settingsDatabase[playerID].music < 1) {
      settingsDatabase[playerID].music = Math.round((settingsDatabase[playerID].music + 0.2) * 10) / 10;
      musicDisplayed.innerHTML = (settingsDatabase[playerID].music * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      music[musicIndex].volume = settingsDatabase[playerID].music
      music[musicIndex].play();
      musicMuted = false;
    }
  });

  // runs if the plus button is clicked for music volume
  document.getElementById("musicMinus").addEventListener("click", function () {
    if (0 < settingsDatabase[playerID].music) {
      settingsDatabase[playerID].music = Math.round((settingsDatabase[playerID].music - 0.2) * 10) / 10;
      musicDisplayed.innerHTML = (settingsDatabase[playerID].music * 100).toString() + "%";
      localStorage.setItem("settings", JSON.stringify(settingsDatabase));
      music[musicIndex].volume = settingsDatabase[playerID].music;
      music[musicIndex].play();
      musicMuted = false;
    }
  });

}

// EXIT POP UP MENU FUNCTION

function exit() {

  // hides menu elements and display exit pop up menu elements
  elementVisibility(menuElements, "hidden");
  elementVisibility(exitMenuElements, "visible");
}



// ------------ FUNCTIONS FOR THE MAIN GAME ------------

// INTIALIZING GAME

function initGame() {

  replay = false;
  menu = false;
  pause = false;

  // ranges for the coordinates and dimensions of the first platform 
  xPlatform = { min: 150, max: 300 }, yPlatform = { min: 300, max: 450 }, widthPlatform = { min: 150, max: 300 }, heightPlatform = { min: 150, max: 300 };

  // resets the platform number to 0
  platformNum = 0;

  // first platform object
  newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max }, platformNum: platformNum });

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

  player.velocity.x = 0; player.velocity.y = 0; player.cow = player.defaultLocation; player.cowImage = cowImageObjects[0];

  // sets HTML game elements to visible and hides all other elements
  elementVisibility(gameOverElements, "hidden");
  elementVisibility(pauseGameElements, "hidden");
  elementVisibility(menuElements, "hidden");

  elementVisibility(gameElements, "visible");
  
  // start the first frame request
  window.requestAnimationFrame(gameLoop);
}

// MAIN GAMELOOP

function gameLoop(timeStamp) {

  // calculates how manu seconds have passed since the last frame request in order to accurately calculate the location of the character using it's constant speed
  secondsPassed = Math.min((timeStamp - oldTimeStamp) / 1500, .5);
  oldTimeStamp = timeStamp;

  // ensures that the next song starts playing once the previous song ends
  if (music[musicIndex].ended) {
    music[musicIndex].pause();
    if (musicIndex == 2) {
      musicIndex = 0;
    } else {
      musicIndex += 1;
    }
    music[musicIndex].play();
  }

  // clears canvas before loading the next frame
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draw sky image onto canvas
  context.drawImage(skyImageObjects[themeIndex], 0, 0, skyDimensions[themeIndex][0], skyDimensions[themeIndex][1]);

  // draws player onto canvas
  player.update(secondsPassed);

  // creates the next platform object after the furthest one visible on screen is 100 pixels away from the right edge
  if (newPlatform.position.x + newPlatform.dimension.x + player.width <= player.position.x + 1200) {

    // the x-coordinate of the new platform is randomly choosen from positions within the given range (300-450 pixels from the previous platform if difficulty level is medium)
    xPlatform.min = newPlatform.position.x + newPlatform.dimension.x + platformDistance;
    xPlatform.max = xPlatform.min + 150;

    // increase the index of the platform by 1 for keeping track of score
    platformNum += 1;

    newPlatform = new Platform({ x: { min: xPlatform.min, max: xPlatform.max }, y: { min: yPlatform.min, max: yPlatform.max }, width: { min: widthPlatform.min, max: widthPlatform.max }, height: { min: heightPlatform.min, max: heightPlatform.max }, platformNum: platformNum });

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

    // randomly chooses a platform (2-5 platforms ahead of the previous coin if difficulty level is at medium) where the next coin is going to created
    coinIndex += Math.floor(Math.random() * 3) + coinDensity;
  }

  // draws all platforms visible on screen 
  for (let i = 0; i < platforms.length; i++) {
    platforms[i].draw(player.position.x);
  }

  // draws all coins visible on screen 
  for (let i = 0; i < coins.length; i++) {
    coins[i].update(secondsPassed, player.position.x);
  }

  // updates annimation for coin counterd
  decorativeCoin.update(secondsPassed, 0);

  // displays both score and highscore if score is lesser than highscore 
  if (playersDatabase[playerID].highScore <= player.score) {
    playersDatabase[playerID].highScore = player.score;
    document.getElementById("stats").innerHTML = "X " + player.coinsCollected.toString() + "&nbsp&nbsp&nbsphighscore: " + playersDatabase[playerID].highScore;
  } else { // if score surpasses highscore, only highscore is displayed
    document.getElementById("stats").innerHTML = "X " + player.coinsCollected.toString() + "&nbsp&nbsp&nbspscore: " + player.score.toString() + "&nbsp&nbsp&nbsphighscore: " + playersDatabase[playerID].highScore;
  }

  // constantly checking for pause being pressed
  document.getElementById("pause").addEventListener("click", function() { pause = true; });

  // if the player falls into the void or pausese the game, the game pauses and a pop up menu is diplayed
  if (player.position.y > 750 || pause) { 

    // coins collected within the game are saved
    playersDatabase[playerID].coins = player.coinsCollected
    localStorage.setItem("players", JSON.stringify(playersDatabase));

    // velocites are set to 0 in order to stop any cow movement
    player.velocity.x = 0;
    player.velocity.y = 0;

    // if the menu or replay buttons within the game over/pause menu are clicked the menu screen is shown or the game is restarted 
    document.getElementById("menu").addEventListener("click", function() { menu = true; });
    document.getElementById("replay").addEventListener("click", function() { replay = true; });

    // if the resume button is clicked:
    document.getElementById("resume").addEventListener("click", function() { 

      // pause is set to false, resuming cow movement
      pause = false; 
      
      // hides pause menu and resets pause button  
      elementVisibility(pauseGameElements, "hidden");
      document.getElementById("pause").style.backgroundImage = pauseButtons[themeIndex];
    });

    // shows game over menu/pause menu elements depending on the reason why the game has stopped
    if (player.position.y > 750) {
      elementVisibility(gameOverElements, "visible");
    } else if (pause) {
      elementVisibility(pauseGameElements, "visible");

      document.getElementById("pause").style.backgroundImage = playButtons[themeIndex];
    }

  // only listens for key pressing events when the player isn't in the game over / pause menus, so that the player can't still keep moving the cow when these menus are open
  } else {
    
    eventListener("keydown", true);
    eventListener("keyup", false);
  }

  // new frames keep being requested by recalling the gameLoop function, unless menu or replay buttons are pressed
  if (menu) {
    document.getElementById("pause").style.backgroundImage = pauseButtons[themeIndex];
    menuScreen();
  } else if (replay) {
    document.getElementById("pause").style.backgroundImage = pauseButtons[themeIndex];
    initGame();  
  } else { 
    window.requestAnimationFrame(gameLoop);
  }
}



// ------------ MAIN PROGRAM ------------

// runs initialization function as soon as window loads
window.onload = init;

// create player object
let player = new Player();