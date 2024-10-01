/*

The game project FINAL!

*/

//game player variables
var gameCharX, gameCharY,
	gameCharWorldX, carrotScore,
	gameCharSpeed, lives, dogScore, maxLives,
	totalCarrotScore, totalDogScore, maxPossibleCarrotScore,
	maxPossibleDogScore;

//game positioning variables
var floorPosY, scrollPos;

//player animation variables, and non-jump movement
var isLeft, isRight,
	isFalling, isPlummeting, isDead;

//fancy jumping
var isJumping, jumpStartY,
	jumpSpeed, distCharJumpMax, maxJump;

//scenery variables
var clouds, mountains,
	canyons, collectables,
	platforms, trees;

//this function deals with the funny player animation when they beat a level (how they move left and right by themselves)
var victoryCount;

//all sounds
var jumpSound, itemSound,
	nextLevelSound, deathSound,
	gameoverSound, enemyDeathSound,
	menuButtonSound,
	stormSound, allMusicOff, allSoundOff;

//our different music variables
var winterMusic, springMusic, summerMusic, fallMusic, finalBossMusic, themeMusic, epicMusic;

//projectile variables (when set to true user will die)
var projectileKilledPlayer;

//end level variables
//im aware 'x' is ambigiously named, however within the function it makes sense.
//using x as a term with sin and cos is generally how it is practiced in algebraic notation
var curtainY, curtainClosed, x, multHorizontal;

//variables for the infinity sign function
var cosinf, sininf;

//level variables (levels is an object that holds all the levels)
var levels, currentLevel;

//the cutscenes variable that holds an array of all the cutscenes for the current level
//cutscenetext gets set to the current cutscene when its activated
var cutscenes, cutSceneText;

//the arrays for all the enemies and projectiles
//we also keep the total enemies for each level in here. 
let enemies, allProjectiles, totalEnemies;

//the timer that counts how long it takes the user to beat the game
let time;

//if this is true the game 'pauses'
let gamePaused;

//this should be false at the start of the game, to allow the user to choose difficulty levels
let difficultySelection;

//the FINAL BOSS OBJECT! And a boolean to determine if the boss is killed or not 
var finalBoss, finalBossKilled;

//booleans for controling musics on or off state
var themeMusicStarted;

//the flagpole variable that moves the flagpole up
var flagRaiser;

//the seasonal variables that change the design of the game based upon the season
var season, leafColor, skyColor, groundColor, cloudColor

//we use this to generate snow for when the seaosn is winter
var generateSnow;

//when this is true we allow lightning to strike
var lightningHasStruck;

//we preload all of our sounds
function preload() 
{
	//our sounds
	soundFormats('mp3', 'ogg');
	jumpSound = loadSound('sounds/jump.mp3');
	itemSound = loadSound('sounds/item.mp3');
	nextLevelSound = loadSound('sounds/nextLevel.mp3');
	deathSound = loadSound('sounds/death.mp3');
	gameoverSound = loadSound('sounds/gameover.mp3');
	enemyDeathSound = loadSound('sounds/enemyDeath.mp3');
	menuButtonSound = loadSound('sounds/menuButton.mp3');
	stormSound = loadSound('sounds/storm.mp3');
	jumpSound.setVolume(0.2);
	stormSound.setVolume(0.2);


	//our music variables
	springMusic = loadSound('sounds/springMusic.mp3');
	summerMusic = loadSound('sounds/summerMusic.mp3');
	fallMusic = loadSound('sounds/fallMusic.mp3');
	winterMusic = loadSound('sounds/winterMusic.mp3');
	finalBossMusic = loadSound('sounds/finalBossMusic.mp3');
	epicMusic = loadSound('sounds/epicBeatsMusic.mp3');
}

//we call setup once, before draw gets looped, therefore these variables only get set once in this manner
function setup() 
{
	//user starts on level 1
	currentLevel = 1;

	//the TOTAL carrot and dog score will get set to the max possible scores at the bottom of this document
	totalCarrotScore = totalDogScore = 0;

	//when this is true you see the difficulty selection screen and may select a difficulty
	difficultySelection = true;

	//theme music starts off by default
	themeMusicStarted = false;
	//our screen
	createCanvas(1024, 576);

	//we set our floor position
	floorPosY = height * 3 / 4;

	//our timer for counting how long it takes to win the game
	time = 0;

	//we start the game with this function, this also gets called upon death
	startGame();
}
//the main draw loop that gets repeated indefinetly
function draw() {
	if(maxLives == 1)
	{
		replay = true;
	}
	//if the user won a level, then the curtain will close, when it is closed we...
	if (curtainClosed) {
		//Do a fun little animation
		funAnimation();
	}
	//if cutSceneText gets set to anything, 
	else if (cutSceneText) {
		//then we want to trigger a cutscene
		triggerCutscene();
	}
	//if the user pauses the game by clicking ESC
	else if (gamePaused) {
		//we show the pause menu, and also shut music off
		gamePauseScreen();

	}

	//at the start of the game difficultySelection will be set to true, and will remain this way till the user selects
	//a difficulty level
	else if (difficultySelection) {
		//this function shows the user the difficulty options
		chooseDifficulty();
	}


	//if there is no difficulty selection, the game isn't paused, there isn't a cut scene, or the level isn't yet complete
	//we run the MAIN GAME LOOP
	else {
		//every second we increase the time by 1 (for level 6 we display it so we don't want this to increment then)
		if (frameCount / 60 == parseInt(frameCount / 60) && currentLevel != 6 && !flagpole.isReached) {
			time += 1;
		}



		background(skyColor); // fill the sky color

		//we check if there is a cutscene to be displayed
		checkCutscene();

		//this updates player lives and deals with the player lives at the top right of the screen
		checkPlayerDie();

		// draw some green ground
		fill(groundColor);
		rect(0, floorPosY, width, height / 4);

		//Screen scrolling starts here
		push();
		translate(scrollPos, 0);

		//we draw our mountains, trees
		drawMountains();
		drawClouds();

		//we draw the trees and activate their methods (which cause their leaves to fall...)
		for(const tree of trees)
		{
			//we draw each tree
			drawTree(tree);
			//if its fall we do a nice fall animation having leaves fall
			if(season == 'fall')
			{
				tree.activateTree();
			}
		}

		//we have for loops for canyon, collectable and platform since they have interactable components.
		//we draw them and also check if the player is currently interacting with each element in that given array
		for (const canyon of canyons) {
			//we draw the canyon
			drawCanyon(canyon);
			//we check if the player is falling in a canyon
			checkCanyon(canyon);
		}

		for (const collectable of collectables) {
			//if the collectable is found we skip it
			if (collectable.isFound) {
				continue;
			}
			else {
				//if it isnt found we draw it
				drawCollectable(collectable);
			}
			//we also periodically check if the collectable has been found
			checkCollectable(collectable);
		}

		for (const platform of platforms) {
			//we draw the platform
			drawPlatform(platform);

			//we check if the player is on the platform
			checkPlatform(platform);
		}
		// we draw the flagpole and also periodically check if the player is on the flagpole
		renderFlagPole();

		//We loop through all of our enemies and call all the functions needed
		//the enemies.entries simply allows us to get the index, as well as the enemy
		for (const [i, enemy] of enemies.entries()) {
			enemy.seesPlayer();
			enemy.drawEnemy();
			enemy.killedPlayer('square');
			enemy.drawProjectiles();
			enemy.killEnemy();
			if (enemy.isDead) {
				enemies.splice(i, 1)
			}
		}


		//if the current level is 6 we display the final stats
		if (currentLevel == 6) {
			textSize(30);
			fill(255);
			text('Thats all, thanks for playing!', 400, 150, 400, 400);
			text(`Total time: ${time} `, 400, 200, 400, 400);
			text(`Carrots: ${totalCarrotScore + carrotScore}/${maxPossibleCarrotScore} `, 400, 250, 400, 400);
			text(`Dogs saved: ${totalDogScore}/${maxPossibleDogScore} `, 400, 300, 400, 400);
			fill(255, 0, 0)
			text('High-score', 980, 50, 400, 400)
			text('Name: CREATOR', 900, 100, 400, 400)
			text('Total time: 195', 900, 150, 400, 400)
			text('Carrots: 34/34', 900, 200, 400, 400)
			text('Dogs saved: 10/10', 900, 250, 400, 400)
			text('Difficulty: Hard', 900, 300, 400, 400)
		}

		//if it is level 5 and the final boss hasnt been spawned yet
		if (currentLevel == 5 && finalBoss)
		 {
			//we activate the final boss
			 finalBoss.activateFinalBoss();

			 //if the player gets close to the final boss (greater then 9900)
			 //we shut off the epic music and play the final boss music 
			 if(themeMusic === epicMusic && gameCharWorldX > 9900)
			 {
				musicOff();
				musicOn();
			 }

		 }
		//Screen scrolling ends here anything past this pop statement will remain locked on the screen
		if(season == 'winter')
		{
			snowGenerator.startTheSnow();
		}
		getGameState();
		pop();

		//please note, this has intentionally been noot connected with the if statement above.
		//thisis because it MUST be after the pop() so it sticks to the players screen
		if (currentLevel != 6) {
			//if the level isn't 6 we draw the gamescore
			drawGameScore()
		}

		//and we draw the game character
		drawGameChar();


		if(season == 'boss')
		{
			lightningStrikeChance();
		}

		//if the users lives are under 1 (if they are dead)
		if (lives < 1) {
			//we show some game over text and return
			fill(255);
			stroke(0)
			strokeWeight(2);
			textSize(40);
			text("Game over. Press C to continue.", width / 2 - 290, height / 2);
			return;
		}
		//we periodically check if the user reaches the flagpole
		if (flagpole.isReached || finalBossKilled) {
			//if so we shut off music
			musicOff()

			//play our funny victory animation
			victoryDance();

			//once the flagpole has raised, we can call level completed
			if (flagpole.isRaised || finalBossKilled) {
				//we call levelcompleted(this will not work until the flag has been raised, so it will not work instantly)
				levelCompleted();
			}

			return;
		}
		else {
			//if the flagpole hasn't been reached...
			//we periodically check if the player is on the flagpole
			checkFlagpole();
		}


		// Logic for our character movement and our background scrolling
		if (isLeft) {
			if (gameCharX > width * 0.35) {
				gameCharX -= gameCharSpeed;
			}
			else {
				scrollPos += gameCharSpeed;
			}
		}

		if (isRight) {
			if (gameCharX < width * 0.65) {
				gameCharX += gameCharSpeed;
			}
			else {
				scrollPos -= gameCharSpeed; // negative for moving against the background
			}
		}
		//if the user is not jumping...
		if (!isJumping) {
			//and they are BELOW OR EQUAL the floor position...
			if (gameCharY >= floorPosY) {
				//then they have just landed from a jump, (or the default state before any jumps)
				//therefore they are not falling...
				isFalling = false;
			}

			// when the player is on any platform (when any platforms .onPlatform is set to true)
			//this else if statement is true
			else if (!platforms.every(platform => platform.onPlatform == false)) {
				//if we are on a platform, we cannot be jumping, therefore we set it to false
				//we also cant possibly be falling either, so we set that to false aswell
				isJumping = false;
				isFalling = false;
			}
			//so if we aren't on a platform, and we falling into a canyon, then we be falling from a jump or a height...
			else {
				//therefore we set isfalling to true and call falling() which is basically activating gravity
				isFalling = true;
				falling();
			}

		}
		else {
			//if they are jumping, then they aren't falling, they are 'jumping', we activate isFalling in the jump function
			//at the appropiate timing...
			isFalling = false;
		}



		//if player falls into a canyon, OR gets killed by a projectile
		if ((gameCharY >= floorPosY && isPlummeting) || projectileKilledPlayer) {
			//If they are in a ravine, then we want to increase their falling speed
			if (gameCharY >= floorPosY) {
				gameCharY += 2;
			}
			//If isDead is not yet set to true, we want to call the death noise (we use this to prevent an infinite deathnoise)
			if (!isDead) {
				deathNoise();
			}
			//we stop player movement dead in its tracks when the user dies (this prevents movement after death)
			isLeft = false;
			isRight = false;
			//NOW we set isDead to true, be verrryyyy careful moving this above the if(!isDead) statement!
			isDead = true;
		}

		//if isJumping is true, we preform one jump()
		if (isJumping) {
			jump();
		}

		// Update real position of gameChar for collision detection.
		gameCharWorldX = gameCharX - scrollPos;


		//update the distance between char and its max jump
		//this allows us to calculate when the user reaches their max jump height
		distCharJumpMax = dist(0, jumpStartY - maxJump, 0, gameCharY);



	}
}
//MAIN DRAW FUNCTION ENDS HERE

// ---------------------//
// Key control functions//
// ---------------------//

//if the player is falling we want to increase their speed to reach the ground
//as the distance between the gamecharacter and the max jump height increases, their falling velocity should too.
//we then increase the gamechar's yr coord 
const falling = () => gameCharY += jumpSpeed * min((distCharJumpMax / maxJump), 0.5);

//if the character exceeds their jump height, we set isJumping to false, as they must fall now.
//if they haven't reached their max jump height yet, we continue to increase their y coords towards their jump height
const jump = () => distCharJumpMax < 10 ? isJumping = false : gameCharY -= jumpSpeed * max((distCharJumpMax / maxJump), 0.10);

function keyPressed() {
		if(keyCode == 89)
		{
			output = true;
		}
		//if the difficultySelection screen is present, we only allow keystrokes neccecary to choose a difficulty level
		//we set the lives and play the starting music
		if (difficultySelection) {
			//if they click P, we set peaceful amount of lives
			if (keyCode == 80) {
				lives = maxLives = 'infinite';
				difficultySelection = false;
				musicOn();
			}

			//otherwise, if they click E, we set easy amount of lives
			else if (keyCode == 69) {
				lives = maxLives = 10;
				difficultySelection = false;
				musicOn();
			}

			//otherwise, if they click M, we set medium amount of lives
			else if (keyCode == 77) {
				lives = maxLives = 5;
				difficultySelection = false;
				musicOn();
			}

			//otherwise, if they click S, we set speedrun amount of lives
			else if (keyCode == 83) {
				lives = maxLives = 1;
				difficultySelection = false;
				musicOn();
			}
		}

		//if user clicks keycode 27(ESC key) and their currently isn't a cutscene, and the user isn't selecting a difficulty.
		if (keyCode == 27 && !cutSceneText && !difficultySelection) {
			//we toggle game paused true and false on every esc click
			gamePaused = !gamePaused;
			!gamePaused ? musicOn() : musicOff();
			//we flip between paused and unpaused states using noLoop and loop
			gamePaused ? noLoop() : loop();
		}

		//If the user clicks C
		if (keyCode === 67) {
			//if their is a cutscene, we now shut it off.
			if (cutSceneText) {
				cutSceneText = false;

			}
			//otherwise, if the user is on the endscreen with the curtain closed...
			else if (curtainClosed) {
				//we increment the current level
				currentLevel++;

				//we use this to set the position of the 
				currentCoords = 0;

				//we add their dogs score to their total dogs score
				totalDogScore += dogScore;

				//we add their carrot score to their total carrot score
				totalCarrotScore += carrotScore

				//and we 'open' the curtain but setting curtainClosed to false
				curtainClosed = false;

				//we then start the next level by calling startGame()
				startGame();

				//we also turn the music on
				musicOn();
			}

			else if (isDead && lives < 1) {
				location.reload();
			}
		}
		//if the player isn't dead, allow movement keystrokes
		if (!isDead) {
			console.log(keyCode);
			//keycode 65 = A
			if (keyCode == 65 || keyCode == 37) { isLeft = true; }

			//keycode 68 = D
			if (keyCode == 68 || keyCode == 39) { isRight = true; }

			//if the user clicks W, and they aren't falling, and aren't jumping, we allow them to jump
			// THIS CODE PREVENTS DOUBLE JUMP, VERY IMPORTANT!
			if ((keyCode == 87 || keyCode == 38) && !isFalling && !isJumping) {
				//the jump noise, as long as sounds aren't off in the esc menu
				if (!allSoundOff) {
					jumpSound.play();

				}

				//the variable which, when true, starts the jump physics and everything else required.
				isJumping = true;

				//we set the characters original jump location (we use this to calculate when they reach their max jump height) 
				jumpStartY = gameCharY;
			}
		}
	}


function mouseReleased() {
	if (gamePaused) {
		//restart button
		if (dist(mouseX, mouseY, 330, 350) < 25) {
			location.reload();
		}
		//music toggle button
		if (dist(mouseX, mouseY, 530, 350) < 25) {
			allMusicOff = !allMusicOff;
			drawPauseButtons();
			menuButtonSound.play();
		}
		//all sounds off toggle
		if (dist(mouseX, mouseY, 730, 350) < 25) {
			allSoundOff = !allSoundOff;
			drawPauseButtons();
			menuButtonSound.play();

		}
	}

}
//on key release
function keyReleased() {
	//if the user isn't dead (for bug fix purposes)
	if (!isDead) {
		//if they release 'A'
		if (keyCode == 65) {
			//then they are no longer moving left
			isLeft = false;
		}
		//if they release 'D'
		if (keyCode == 68) {
			//then they are no longer moving right
			isRight = false;
		}
	}
}

// ------------------------------
// Game character render function
// ------------------------------

//Most of the animation functions below only get called once, however, coding it in this manner makes it VERY easy to read,
//and therefore i've decided to code it in this way.

//the animation for when the player is facing forward
const forwardAnimation = (xPos, yPos, evil=false) => {
	push();
	translate(xPos, yPos);
	noStroke();
	strokeWeight(1);
	//back hair
	fill(0);
	quad( - 10,  - 48,
		 + 10,  - 48,
		 + 15,  - 15,
		 - 15,  - 15);
	//face w skin colour
	fill(222, 184, 135);
	ellipse(0,  - 40, 20, 20);
	//eye whites
	fill(255);
	ellipse( - 4,  - 40, 5, 4);
	ellipse( + 4,  - 40, 5, 4);
	// eye colour 
	fill(96, 49, 1);
	ellipse( - 4,  - 40, 2, 2);
	ellipse( + 4,  - 40, 2, 2);
	//lips
	fill(255, 0, 0, 150);
	ellipse(0,  - 34, 3, 2);
	//hands
	fill(222, 184, 135);
	rect( - 12,  - 12, 3, 2.5);
	rect( + 9,  - 12, 3, 2.5);
	//arms
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	rect( - 13,  - 30, 5, 18);
	rect( + 7,  - 30, 5, 18);
	noStroke();
	//top of hair
	fill(0);
	ellipse(0,  - 48, 20, 5);
	//airfores left and right respectively
	fill(255);
	rect( - 7, 0, 5, 3);
	rect( + 2, 0, 5, 3);
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	//torso
	rect( - 8,  - 30, 16, 30);
	//triangle cut in scrubs
	fill(222, 184, 135);
	triangle( - 5,  - 30,
		 + 5,  - 30,
		0,  - 22);
	//pants lines
	strokeWeight(1);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	noFill();
	//pants
	rect( - 8,  - 13, 8, 13);
	rect(0,  - 13, 8, 13);
	rect( + 4,  - 24, 3, 3);
	noStroke();
	pop();
}
//the animation for when the player is facing forward and falling
const forwardFallingAnimation = (xPos, yPos, evil = false) => {
	push();
	translate(xPos, yPos);
	noStroke();
	strokeWeight(1);
	fill(0);
	quad( - 10,  - 48,
		 + 10,  - 48,
		 + 15,  - 15,
		 - 15,  - 15);
	//face w skin colour
	fill(222, 184, 135);
	ellipse(0,  - 40, 20, 20);
	//eye whites
	fill(255);
	ellipse( - 4,  - 40, 5, 4);
	ellipse( + 4,  - 40, 5, 4);
	// eye colour 
	fill(96, 49, 1);
	ellipse( - 4,  - 40, 2, 2);
	ellipse( + 4,  - 40, 2, 2);
	//lips
	fill(255, 0, 0, 150);
	ellipse(0,  - 34, 3, 2);
	//arms
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	rect( - 13,  - 42, 5, 18);
	rect( + 8,  - 42, 5, 18);
	noStroke();
	//hands
	fill(222, 184, 135);
	rect( - 12,  - 44, 3, 2);
	rect( + 9,  - 44, 3, 2);
	//top of hair
	fill(0);
	ellipse(0,  - 48, 20, 5);
	//airfores left and right respectively
	fill(255);
	rect( - 7, 0, 5, 3);
	rect( + 2, 0, 5, 3);
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	//torso
	rect( - 8,  - 30, 16, 30);
	//triangle cut in scrubs
	fill(222, 184, 135);
	triangle( - 5,  - 30,
		 + 5,  - 30,
		0,  - 22);
	//pants lines
	strokeWeight(1);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	noFill();
	//pants
	rect( - 8,  - 13, 8, 13);
	rect(0,  - 13, 8, 13);
	rect( + 4,  - 24, 3, 3);
	noStroke();
	pop();
}
//the animation for when the player is facing the left
const leftAnimation = (xPos, yPos, evil=false) => {
	push();
	translate(xPos, yPos);
	noStroke();
	strokeWeight(1);
	fill(222, 184, 135);
	ellipse(0, - 40, 20, 20);
	//eye whites 
	fill(255);
	ellipse(- 4, - 40, 5, 4);
	// eye colour 
	fill(96, 49, 1);
	ellipse(- 5, - 40, 2, 2);
	//lips 
	fill(255, 0, 0, 150);
	ellipse(- 4, - 34, 3, 2);
	//top of hair
	fill(0);
	ellipse(0, - 48, 20, 5);
	//airfores left and right respectively
	fill(255);
	rect(- 10, 0, 6, 3);
	rect(+ 4, 0, 6, 3);
	//left hand
	noStroke();
	fill(222, 184, 135);
	quad(- 15, - 18,
		- 13, - 15,
		- 10, - 18,
		- 12, - 20);
	//right hand
	quad(+ 15, - 18,
		+ 13, - 15,
		+ 10, - 18,
		+ 12, - 20);
	//right arm
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	quad(0, - 30,
		- 3, - 25,
		+ 10, - 16,
		+ 13, - 20);
	//legs
	quad(+ 4, - 14,
		- 2, - 10,
		+ 3, + 2,
		+ 10, - 1);
	quad(- 4, - 14,
		+ 2, - 10,
		- 3, + 2,
		- 10, - 1);
	//torso
	rect(- 6, - 30, 12, 20);
	//arms
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	//leftarm
	quad(0, - 30,
		+ 3, - 25,
		- 10, - 16,
		- 13, - 20);
	//back hair
	noStroke();
	fill(0);
	quad(0, - 48,
		+ 10, - 48,
		+ 12, - 15,
		0, - 15);
	pop();
}
//the animation for when the player is facing the left and falling
const leftFallingAnimation = (xPos, yPos, evil=false) => {
	push();
	translate(xPos, yPos);
	noStroke();
	strokeWeight(1);
	fill(222, 184, 135);
	ellipse(0, - 40, 20, 20);
	//eye whites 
	fill(255);
	ellipse(- 4, - 40, 5, 4);
	// eye colour 
	fill(96, 49, 1);
	ellipse(- 5, - 40, 2, 2);
	//lips 
	fill(255, 0, 0, 150);
	ellipse(- 4, - 34, 3, 2);
	//top of hair
	fill(0);
	ellipse(0, - 48, 20, 5);
	//shoe colour
	fill(255);
	//left shoe
	rect(- 10, 0, 6, 3);
	//right shoe
	rect(+ 4, 0, 6, 3);
	//scrubs color
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	//right leg
	quad(+ 4, - 14,
		- 2, - 10,
		+ 3, + 2,
		+ 10, - 1);
	//left leg
	quad(- 4, - 14,
		+ 2, - 10,
		- 3, + 2,
		- 10, - 1);
	//torso
	rect(- 6, - 30, 12, 20);
	//back hair
	noStroke();
	fill(0);
	quad(+ 3, - 48,
		+ 10, - 48,
		+ 12, - 15,
		+ 5, - 15);
	//hand
	fill(222, 184, 135);
	rect(- 1, - 48, 5, 3);
	//arm
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	rect(- 1, - 45, 5, 18);
	noStroke();
	pop()
}
//the animation for when the player is facing the right
const rightAnimation = (xPos, yPos, evil=false) => {
	push();
	translate(xPos, yPos);
	noStroke();
	strokeWeight(1);
	//face w skin colour 
	fill(222, 184, 135);
	ellipse(0, - 40, 20, 20);
	//eye whites 
	fill(255);
	ellipse(+ 4, - 40, 5, 4);
	// eye colour 
	fill(96, 49, 1);
	ellipse(+ 5, - 40, 2, 2);
	//lips 
	fill(255, 0, 0, 150)
	ellipse(+ 4, - 34, 3, 2);
	//top of hair
	fill(0);
	ellipse(0, - 48, 20, 5);
	//shoe colour
	fill(255);
	//left shoe
	rect(- 10, 0, 6, 3);
	//right shoe
	rect(+ 4, 0, 6, 3);
	//left hand
	noStroke();
	fill(222, 184, 135);
	quad(+ 15, - 18,
		+ 13, - 15,
		+ 10, - 18,
		+ 12, - 20);
	//right hand
	quad(- 15, - 18,
		- 13, - 15,
		- 10, - 18,
		- 12, - 20);
	//scrubs color
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	//right arm
	quad(0, - 30,
		+ 3, - 25,
		- 10, - 16,
		- 13, - 20);
	//right leg
	quad(- 4, - 14,
		+ 2, - 10,
		- 3, + 2,
		- 10, - 1);
	//left leg
	quad(+ 4, - 14,
		- 2, - 10,
		+ 3, + 2,
		+ 10, - 1);
	//torso
	rect(- 6, - 30, 12, 20);
	//leftarm
	quad(0, - 30,
		- 3, - 25,
		+ 10, - 16,
		+ 13, - 20);
	//back hair
	noStroke();
	fill(0);
	quad(0, - 48,
		- 10, - 48,
		- 12, - 15,
		0, - 15);
	pop()
}
//the animation for when the player is facing the right and falling
const rightFallingAnimation = (xPos, yPos, evil=false) => {
	push();
	translate(xPos, yPos);
	noStroke();
	strokeWeight(1)
	//face w skin colour 
	fill(222, 184, 135);
	ellipse(0, - 40, 20, 20);
	//eye whites 
	fill(255);
	ellipse(+ 4, - 40, 5, 4);
	// eye colour 
	fill(96, 49, 1);
	ellipse(+ 5, - 40, 2, 2);
	//lips 
	fill(255, 0, 0, 150);
	ellipse(+ 4, - 34, 3, 2);
	//top of hair
	fill(0);
	ellipse(0, - 48, 20, 5);
	//shoe colour
	fill(255);
	//left shoe
	rect(- 10, 0, 6, 3);
	//right shoe
	rect(+ 4, 0, 6, 3);
	//scrubs color
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	//right leg
	quad(- 4, - 14,
		+ 2, - 10,
		- 3, + 2,
		- 10, - 1)
	//left leg
	quad(+ 4, - 14,
		- 2, - 10,
		+ 3, + 2,
		+ 10, - 1);
	//torso
	rect(- 6, - 30, 12, 20);
	//back hair
	noStroke()
	fill(0);
	quad(- 3, - 48,
		- 10, - 48,
		- 12, - 15,
		- 5, - 15);
	//hand
	fill(222, 184, 135);
	rect(- 3, - 48, 5, 3);
	//arm
	fill(evil ? [220, 20, 20] : [91, 225, 229]);
	stroke(evil ? [200, 0, 0] : [71, 205, 209]);
	rect(- 3, - 45, 5, 18);
	noStroke();
	pop();
}

// Function to draw the game character.
const drawGameChar = () => {
		//if the user is clicking A(left) AND D(right)... We check if the user is falling or not and play the appropiate animation
		if(isLeft && isRight) isFalling ? forwardFallingAnimation(gameCharX, gameCharY) : forwardAnimation(gameCharX, gameCharY);

		//if the user clicks D(right) we check if the player is falling or not, and play the appropiate animation
		else if(isRight) isFalling ? rightFallingAnimation(gameCharX, gameCharY) : rightAnimation(gameCharX, gameCharY);

		//if the user clicks A(left) we check if the player is falling or not, and play the appropiate animation
		else if(isLeft) isFalling ? leftFallingAnimation(gameCharX, gameCharY) : leftAnimation(gameCharX, gameCharY);

		//if the player is falling or is dead
		else if(isFalling || isDead) forwardFallingAnimation(gameCharX, gameCharY);
		
		//else we play the forward animation
		else forwardAnimation(gameCharX, gameCharY);

}

// --------------------------- //
// Background render functions //
// --------------------------- //

// Function to draw cloud objects.

const drawClouds = () => {
	//as long as we set a cloud color, we actually draw the clouds
	if(cloudColor)
	{
		for (const cloud of clouds) {
			push();
			translate(cloud.xPos, cloud.yPos);
			scale(cloud.size);
			fill(cloudColor);
			//cloud border color
			stroke(cloudColor + 10);
			strokeWeight(8);
			//top left
			ellipse(200, 105, 57, 57);
			//middle left
			ellipse(160, 140, 60, 60);
			// bottom curve of cloud
			curve(227, -15, 175, 165, 280, 168, 240, 20);
			//top right
			ellipse(260, 100, 57, 57);
			//middle right
			ellipse(297, 140, 60, 60);
			noStroke();
			//grey middle colour 
			ellipse(230, 140, 135, 85);
			//lightning
			if(season == 'boss' && lightningHasStruck)
			{
				fill(255, 255, 0);
				quad(220, 205, 235, 205, 220, 225, 205, 225);
				quad(218, 220, 233, 220, 218, 240, 203, 240);
				triangle(216, 235, 231, 235, 202, 265);
			}
			pop();
		}
	}
}
// Function to draw mountains objects.

const drawMountains = () => {
	for (const mountain of mountains) {
		fill(228, 215, 209);
		//back mountain
		triangle(mountain.xPos, 432,
			mountain.xPos + 700, 432,
			mountain.xPos + 340, 170 - mountain.size * 20);
		//forth mountain
		fill(221, 205, 197);
		triangle(mountain.xPos, 432,
			mountain.xPos + 500, 432,
			mountain.xPos + 230, 160 - mountain.size * 20);
		//third mountain
		fill(213, 193, 183);
		triangle(mountain.xPos, 432,
			mountain.xPos + 800, 432,
			mountain.xPos + 450, 150 - mountain.size * 20);
		//second mountain
		fill(203, 177, 165);
		triangle(mountain.xPos + 100, 432,
			mountain.xPos + 800, 432,
			mountain.xPos + 700, 80 - mountain.size * 20);
		//front mountain
		fill(190, 157, 143);
		triangle(mountain.xPos - 86, 432,
			mountain.xPos + 400, 432,
			mountain.xPos + 120, 140 - mountain.size * 20);
	}
}

// Function to draw trees objects.
const drawTree = tree => {
		noStroke();
		fill(98, 78, 44);
		//the stump
		rect(tree.xPos + 50, 322, 50, 110);
		//leaves for the tree, if there is no leaf color, then it is fall, thus we use the trees distinct fall color
		//otherwise we use the universal seasonal color 'leafColor'
		fill(leafColor ? leafColor : tree.fallColor);
		ellipse(tree.xPos + 20, 312, 70, 70);
		ellipse(tree.xPos + 70, 322, 70, 70);
		ellipse(tree.xPos + 120, 312, 70, 70);
		ellipse(tree.xPos + 140, 272, 70, 70);
		//center leaf tree
		ellipse(tree.xPos, 272, 70, 70);
		ellipse(tree.xPos + 110, 232, 70, 70);
		ellipse(tree.xPos + 30, 232, 70, 70);
		ellipse(tree.xPos + 70, 212, 70, 70);
		ellipse(tree.xPos + 70, 262, 100, 100);
		//apple colour
		//if the season is spring we show the apples, otherwise we make them transparent to hide them
		fill(season == 'spring' ? [153, 0, 0] : [0, 0, 0, 0]);
		strokeWeight(2);
		stroke(season == 'spring' ? [125, 0, 0] : [0, 0, 0, 0]);
		ellipse(tree.xPos + 110, 242, 20, 20);
		ellipse(tree.xPos + 90, 314, 20, 20);
		ellipse(tree.xPos + 30, 283, 20, 20);
}

// --------------------------------- //
// Canyon render and check functions //
// --------------------------------- //

// Function to draw canyon objects.
const drawCanyon = canyon => {
	noStroke();
	fill(28, 73, 106);
	//water rectangle
	quad(canyon.xPos + 80, 580,
		canyon.xPos + canyon.width + 200,
		580, canyon.xPos + canyon.width + 100,
		432, canyon.xPos + 70, 432);
	//canyon walls
	//backmost right one
	fill(213, 193, 183);
	triangle(canyon.xPos + canyon.width + 90, 444,
		canyon.xPos + canyon.width + 125, 600,
		canyon.xPos + canyon.width + 200, 450);
	fill(203, 177, 165);
	// middle right and top left
	triangle(canyon.xPos + canyon.width + 117, 490,
		canyon.xPos + canyon.width + 130, 600,
		canyon.xPos + canyon.width + 200, 500);
	triangle(canyon.xPos + 85, 455,
		canyon.xPos + 90, 525,
		canyon.xPos + 20, 600);
	fill(190, 157, 143);
	//front left
	triangle(canyon.xPos + 104, 542,
		canyon.xPos + 80, 600,
		canyon.xPos + 106, 575);
	//front right
	triangle(canyon.xPos + canyon.width + 140, 539,
		canyon.xPos + canyon.width + 150, 600,
		canyon.xPos + canyon.width + 300, 575);
	//edges of the canyon
	fill(groundColor);
	//grass patch right
	//bottom left, bottom right
	quad(canyon.xPos + canyon.width + 200, 580,
		canyon.xPos + canyon.width + width + 300, 580,
		canyon.xPos + canyon.width + width, 432,
		canyon.xPos + canyon.width + 100, 432);
	//grass patch left
	quad(canyon.xPos - 100, 580,
		canyon.xPos + 80, 580,
		canyon.xPos + 70, 432,
		canyon.xPos - 100, 432);
	// all the circlessss for the left and right canyon walls
	ellipse(canyon.xPos + 80, 550, 50, 80);
	ellipse(canyon.xPos + 70, 460, 30, 55);
	ellipse(canyon.xPos + canyon.width + 135, 480, 40, 40);
	ellipse(canyon.xPos + canyon.width + 170, 535, 60, 40);
	//top right
	arc(canyon.xPos + canyon.width + 115, 432, 60, 60, 0, PI, CHORD)
}

// Function to check character is over a canyon.

const checkCanyon = canyon => {
	//if the player fell into the canyon
	if (gameCharWorldX < canyon.xPos + canyon.width + 85
		&& gameCharWorldX > canyon.xPos + 89) {
		canyon.playerFallenInto = true;
	}
	else {
		canyon.playerFallenInto = false;
	}
	//here we check to see if all canyons dont have the player falling in them. If so, we keep isplummeting false,
	//otherwise we set isplummeting to true for the player
	canyons.every(canyon => canyon.playerFallenInto == false) ? isPlummeting = false : isPlummeting = true;
}

// ---------------------------------------------//
// Collectable items render and check functions-//
// ---------------------------------------------//

// Function to draw collectable objects.

const drawCollectable = collectable => {
	push();
	translate(collectable.xPos, collectable.yPos); // move image
	fill(237, 145, 33);
	//orange part of carrot
	ellipse(0, 5, 20, 30);
	ellipse(0, -10, 25, 35);
	ellipse(0, -25, 30, 40);
	ellipse(0, -40, 35, 45);
	// leaf colours
	strokeWeight(8);
	stroke(97, 138, 61);
	//middle leaf
	line(0, -60, 0, -80);
	//left leaf
	line(0, -60, 10, -70);
	//right leaf
	line(0, -60, -10, -70);
	noStroke();
	pop();
}

// ALL CODE BELOW IS CODE FOR FUNCTIONALITY!


// Function to check character has collected an item.
const checkCollectable = collectable => {
	//the code below is PERFECTLY ACCURATE, therefore any tampering
	//will drastically reduce hitbox accuracy.

	//if the players hitbox colides with the collectable
	if (collectable.xPos - 18 < gameCharWorldX + 15 &&
		collectable.xPos + 18 > gameCharWorldX - 15 &&
		collectable.yPos - 84 < gameCharY + 5 &&
		collectable.yPos + 20 > gameCharY - 50) {
		//we play the itemSound as long as sounds aren't off
		if (!allSoundOff) {
			itemSound.play();
		}


		//set the collectable.isfound property to true (so it disapears and cant be infinitely collected)
		collectable.isFound = true;

		//and we increase the players carrot score
		carrotScore++;
	}
}

//this function simply draws the gamescore at the top left
const drawGameScore = () => {
	fill(255);
	stroke(0)
	strokeWeight(2)
	textSize(35);
	text(`Time:${time}`, 30, 30);
	text(`Level: ${currentLevel}`, 30, 70);
	text(`Carrots: ${carrotScore}`, 30, 110);
	text(`Dogs saved: ${dogScore}`, 30, 150);

}
//this function deals with altering the flagpole position when the player reaches it
//in other words it moves the flagpole up and down

const renderFlagPole = () => {
	noStroke();
	//if the flagpole is reached...
	if (flagpole.isReached) {

		//if the flag isn't at the players y position we keep raising it, when it is at the players y positioon we set it to raised
		//which will allow levelCompleted() to close the curtain
		floorPosY - flagRaiser - 13 > gameCharY ? flagRaiser += 2 : flagpole.isRaised = true;

		push();
		//we translate to the flagposition to allow cleaner coding, therefore the new 0 is 'flagpole.xPos'

		translate(flagpole.xPos, floorPosY - flagRaiser);
		//if the flagpole is raised, we set the color to green, otherwise its red

		flagpole.isRaised ? fill(0, 255, 0) : fill(255, 0, 0);
		triangle(0, -60, 0, -10, -50, -30);
		pop();

	}

	else {
		fill(255, 0, 0);
		//flag down
		triangle(flagpole.xPos, floorPosY - 60,
			flagpole.xPos, floorPosY - 10,
			flagpole.xPos - 50, floorPosY - 30);
	}
	//flag stand and pole
	fill(120);
	rect(flagpole.xPos, floorPosY - 350, 10, 340);
	rect(flagpole.xPos - 30, floorPosY - 10, 70, 10);
	ellipse(flagpole.xPos + 5, floorPosY - 350, 20, 20);
	//draw horse
	stroke(0);
	strokeWeight(2);
	fill(80, 50, 0);
	//legs
	rect(flagpole.xPos + 160, floorPosY - 70, 15, 60);
	rect(flagpole.xPos + 150, floorPosY - 70, 15, 60);
	rect(flagpole.xPos + 100, floorPosY - 70, 15, 60);
	rect(flagpole.xPos + 90, floorPosY - 70, 15, 60);
	//body
	rect(flagpole.xPos + 80, floorPosY - 100, 100, 40, 20);
	fill(120);
	//horse shoes
	rect(flagpole.xPos + 160, floorPosY - 10, 15, 10);
	rect(flagpole.xPos + 150, floorPosY - 10, 15, 10);
	rect(flagpole.xPos + 100, floorPosY - 10, 15, 10);
	rect(flagpole.xPos + 90, floorPosY - 10, 15, 10); +
		fill(80, 50, 0);
	beginShape();
	curveVertex(flagpole.xPos + 15 + 90, floorPosY - 100);
	curveVertex(flagpole.xPos + 15 + 70, floorPosY - 85);
	curveVertex(flagpole.xPos + 15 + 40, floorPosY - 110);
	curveVertex(flagpole.xPos + 15 + 25, floorPosY - 100);
	curveVertex(flagpole.xPos + 15 + 15, floorPosY - 115);
	curveVertex(flagpole.xPos + 15 + 45, floorPosY - 145);
	curveVertex(flagpole.xPos + 15 + 105, floorPosY - 100);
	curveVertex(flagpole.xPos + 15 + 90, floorPosY - 100);
	endShape();
	fill(0);
	//mouth
	line(flagpole.xPos + 37, floorPosY - 102,
		flagpole.xPos + 43, floorPosY - 110);
	//nose
	ellipse(flagpole.xPos + 35, floorPosY - 110, 2, 4);
	//eye
	fill(255);
	strokeWeight(1);
	ellipse(flagpole.xPos + 52, floorPosY - 130, 8, 5);
	fill(0);
	ellipse(flagpole.xPos + 51, floorPosY - 130, 2, 1);

	//horse main and tail
	for (let i = 0; i < 12; i++) {
		stroke(0)
		fill(0)
		line(flagpole.xPos + 63, floorPosY - 145,
			flagpole.xPos + 155 - 50 * (1 - i / 14), floorPosY - 90);
		line(flagpole.xPos + 185 - i / 3, floorPosY - 85,
			flagpole.xPos + 180 + 20 * (1 + -i / 12), floorPosY - 30);
	}

}

//this function determines when the player reaches the flagpole
const checkFlagpole = () => {
	//when the player reaches the flagpole...
	if (gameCharWorldX >= flagpole.xPos &&
		gameCharWorldX < flagpole.xPos + 10) {

		//we play the nextlevel sound as long as sounds aren't off
		if (!allSoundOff) {
			nextLevelSound.play()
		}

		//the flagpole is now REACHED
		flagpole.isReached = true;

		//we cut player movement
		isLeft = isRight = false

		//and we set isfalling to true so we have our falling animation (aka we raise our hands because we won!)
		isFalling = true;

	}
}


//the cool swirly animation that is present when the curtains close
const funAnimation = () => {
	//this is some somewhat complex math, but basically it draws little swirls...
	noStroke()
	//cos and sin can = anything between -1 and 1, therefore we multiply both by 50 so the circles are biggers
	var cosX = cos(x) * 50;
	var sinX = sin(x) * 50;
	fill(80, 50, 50);

	//multHorizontal is what moves the swirl, otherwise it would just be a circle
	//we simply move the circle and it makes a nice little swirly effect
	ellipse(sinX + multHorizontal - 50, cosX + 70, 20);
	ellipse(width + sinX - multHorizontal, cosX + height - 70, 20);

	//whilst multhorizontal is under 1100 we keep adding to it, as well as to x
	if (multHorizontal < 1100) {
		x += 0.1;
		multHorizontal += 4;
	}

	//the text that shows after the curtains are closed
	textSize(30);
	fill(255);
	text(`Level ${currentLevel} complete. Press C to continue.`, 250, 150, 800, 200);
	//draw carrot image
	push();
	translate(275, 300); // move image
	fill(237, 145, 33);
	//orange part of carrot
	strokeWeight(0);
	ellipse(0, 5, 20, 30);
	ellipse(0, -10, 25, 35);
	ellipse(0, -25, 30, 40);
	ellipse(0, -40, 35, 45);
	// leaf colours
	strokeWeight(8)
	stroke(97, 138, 61);
	//middle leaf
	line(0, -60, 0, -80);
	//left leaf
	//make the leafs size alter the second x and y coordinate to fit with the other grass
	line(0, -60, 10, -70);
	//right leaf
	line(0, -60, -10, -70);
	noStroke();
	//we draw the text for the score
	textSize(30);
	fill(255);
	text(`${carrotScore}/${levels[currentLevel].collectables.length}`, -20, 30, 150, 150);
	pop();

	//DRAW THE DOG

	push();
	noStroke()
	translate(475, 265); // move image
	fill(160, 82, 45);
	rect(35, 25, 4, 30);
	rect(43, 25, 4, 30);
	rect(13, 25, 4, 30);
	rect(21, 25, 4, 30);
	rect(45, 16, 15, 5);
	ellipse(30, 20, 40, 20);
	ellipse(10, 10, 20, 20);
	fill(255)
	ellipse(5, 10, 8, 8);
	fill(0)
	ellipse(3, 10, 2, 2);
	ellipse(12, 13, 10, 20);
	//we draw the text for the score
	textSize(30);
	fill(255);
	text(`${dogScore}/${totalEnemies}`, 10, 65, 150, 150);
	pop();


	//DRAW THE CHARACTER
	push()
	translate(770, 225);
	push()
	scale(2)
	noStroke()
	fill(0);
	quad(-40, 11,
		-20, 11,
		-15, 45,
		-45, 45);
	//face w skin colour
	fill(222, 184, 135);
	ellipse(-30, 20, 20, 20);
	//eye whites
	fill(255)
	ellipse(-34, 20, 5, 4);
	ellipse(-26, 20, 5, 4);
	// eye colour 
	fill(96, 49, 1)
	ellipse(-34, 20, 2, 2);
	ellipse(-26, 20, 2, 2);
	//lips
	fill(255, 0, 0, 255)
	ellipse(-30, 26, 3, 2);
	//top of hair
	fill(0);
	ellipse(-30, 11, 20, 5);
	pop()
	textSize(30);
	fill(255);
	//if lives are infinite
	if (lives == 'infinite') {
		//we draw a super cool infinity sign
		infinitySign(-110, 120, backdrop = false);
	}
	else {
		//we draw the text for the score
		text(`${lives}/${maxLives}`, -80, 103, 150, 150);
	}
	pop();
}

// This function closes the curtain 
const levelCompleted = () => {
	//draw top curtain
	noStroke();
	fill(101, 50, 50);
	rect(0, curtainY - height / 2, width, height / 2);
	//draw bottom currtain
	rect(0, height - curtainY, width, height / 2);
	//only close curtain if its not closed yet
	curtainY < height / 2 ? curtainY += 1.5 : curtainClosed = true;

}
//a funny little animation of the player cheering when they win the level
const victoryDance = () => {
	//we set isfalling to true to start the animation
	isFalling = true
	//every half second we change the direction the player faces
	if (frameCount / 15 == parseInt(frameCount / 15)) {
		//on count 1 it faces left
		if (victoryCount == 1) {
			isLeft = true;
		}
		//on count 3 it faces right
		else if (victoryCount == 3) {
			isRight = true;
		}
		//on any other count (aka count 2) it faces forward
		else {
			//we set isleft and isright to false
			isLeft = isRight = false;
			//if victory count is greater then 3, we reset it, otherwise we keep it
			victoryCount = victoryCount > 3 ? 0 : victoryCount;
		}
		victoryCount++
	}

}
//this function deals with drawing and handling player lives and also with killing the player
const checkPlayerDie = () => {
	var i = 0;
	//we use a do while look so that when lives are infinite we can still have it draw one face

	//we DO this code
	do {
		noStroke()
		fill(0);
		quad(width - 40 - 50 * i, 12,
			width - 20 - 50 * i, 12,
			width - 15 - 50 * i, 45,
			width - 45 - 50 * i, 45);
		//face w skin colour
		fill(222, 184, 135);
		ellipse(width - 30 - 50 * i, 20, 20, 20);
		//eye whites
		fill(255)
		ellipse(width - 34 - 50 * i, 20, 5, 4);
		ellipse(width - 26 - 50 * i, 20, 5, 4);
		// eye colour 
		fill(96, 49, 1)
		ellipse(width - 34 - 50 * i, 20, 2, 2);
		ellipse(width - 26 - 50 * i, 20, 2, 2);
		//lips
		fill(255, 0, 0, 255)
		ellipse(width - 30 - 50 * i, 26, 3, 2);
		//top of hair
		fill(0);
		ellipse(width - 30 - 50 * i, +11, 20, 5);

		//if the lives are infinite we draw an amazing infinite animation
		if (lives == 'infinite') {
			//we draw a cool infinity sign animation
			infinitySign(900, 25, backdrop = true)
		}
		i++;
	}
	//WHILE this is true
	while (i < lives)

	//if player falls out of camera view, or is killed by projectile...
	if (gameCharY > height + 60 || projectileKilledPlayer) {
		//if lives are not infinite, we...
		if (lives != 'infinite') {
			//reduce the lives by one
			lives -= 1;
		}
		//if the lives are set to the word 'infinite' or if lives are > 0 we...
		if (lives > 0 || lives == 'infinite') {
			//start the game
			startGame();
			//and we turn the music on
			musicOn();
		}
	}


}
//simply draw the platform with the data from the platform provided
const drawPlatform = platform => {
	strokeWeight(2);
	stroke(82, 31, 0);
	fill(102, 51, 0);
	rect(platform.xPos, platform.yPos, platform.width, 10)
}

//this function checks if the player is on the platform if it is we set that platforms property to true;
const checkPlatform = platform => {

	//if the player is on the platform, this should be true, otherwise false
	var isPlayerOnPlatform = (
		gameCharWorldX + 15 > platform.xPos && gameCharWorldX - 15 < platform.xPos + platform.width &&
		dist(0, gameCharY, 0, platform.yPos) < 5)

	//we set the platforms onplatform property to the result of the isPlayerOnPlatform
	platform.onPlatform = isPlayerOnPlatform
}

//We play the deaht sound, which is dependant upon how many lives they have (careful putting this function in draw)
//it will call the sound infinitely!
const deathNoise = () => {
	//we shut off the background music
	musicOff();
	//and play the appropiate sound based upon how many lives are left
	if (!allSoundOff) {
		lives > 1 || lives == 'infinite' ? deathSound.play() : gameoverSound.play();
	}
}

//simply turn all music off
const musicOff = () => {
	if(themeMusic)
	{
		themeMusic.stop()

	}
}
//play music dependant upon the season
const musicOn = () => {
		switch(season)
		{
			case 'spring':
				themeMusic = springMusic;
				break;
			case 'summer':
				themeMusic = summerMusic;
				break;
			case 'fall':
				themeMusic = fallMusic;
				break;
			case 'winter':
				themeMusic = winterMusic;
				break;
			case 'boss':
				themeMusic = gameCharWorldX > 9900 ? finalBossMusic : epicMusic;
				break;
			default:
				themeMusic = null;
		}
		//as long as theme music isn't undefined, and all music isn't off we set the musics
		//volume and loop it
		if(themeMusic && !allMusicOff)
		{
			themeMusic.setVolume(0.2);
			themeMusic.loop();
		}
}

//check if there is a cutscene to show the user
const checkCutscene = () => {
	//check every cutscene in cutscenes (cutscenes is an array of all this levels cutscenes)
	for (const cutscene of cutscenes) {
		//if player is within 100px of the cutscene (from the left side obviously), and the cutscene has not
		//been triggered yet...
		if (cutscene.xPos - gameCharWorldX < 100 && !cutscene.hasTriggered) {
			//we set the cutScene text to this cutscenes text
			cutSceneText = cutscene.text;

			//and set its hasTriggered property to true
			cutscene.hasTriggered = true;
		}
	}
}

//this simply displays the cutscene.
const triggerCutscene = () => {
	fill(255);
	textSize(35);
	text(cutSceneText, 700, 200, 300, 300);
}


//this just draws the difficulty options when first loading the game or restarting it..
const chooseDifficulty = () => {
	//a slow fade to show the background (its a fade because this small opacity gets drawn 60 times per second in
	//the draw function)
	fill(0, 0, 0, 5);
	rect(0, 0, width, height);
	textSize(30);
	fill(255);
	text('Welcome to Veterinary Adventures, your mission is to save all the stray dogs! Please select a difficulty to continue.', 150, 50, 800);
	text('Press P for peaceful mode (infinite lives)', 250, 250);
	text('Press E for easy mode (10 lives)', 300, 300);
	text('Press M for medium mode (5 lives)', 300, 350);
	text('Press S for speedrun mode (1 life)', 300, 400);
}

//our cool infinity sign when you pick infinite lives!
const infinitySign = (xPos, yPos, backdrop) => {
	//here we set our cos and sin variables with their corresonding cosinf and sininf values
	//the higher the * factor for cosX the more wide it will move
	var cosX = cos(cosinf) * 20;
	//the higher the * factor for sinX the more high it will move


	var sinY = sin(sininf) * 8;
	//thus we can conclude it should move a bit more then twice as far as it does wide, which is true.

	//we set the ellipseSize
	var ellipseSize = 5;
	//where the infinity sign is drawn gets determined by the xpos and y pos variables in infinitySign
	push();
	translate(xPos, yPos);
	//if theres a backdrop we draw it and increase the ellipseSize to 10
	if (backdrop) {
		stroke(0);
		strokeWeight(3);
		fill(0, 0, 0, 0);
		ellipse(41, 0, 20, 13);
		ellipse(63, 0, 20, 13);
		ellipseSize = 10;
	}
	//then we create the spinning ball animation...

	stroke(255);
	//transparent bubble color
	fill(255, 255, 255, 200);

	//we set the x to cosX and the y to sinY, and the size to ellipsesize
	ellipse(50 + cosX, sinY, ellipseSize);

	//we then increase cosinf at half the rate of sininf  (therefore it will crossover in the middle 
	//hence, making the infinity)
	cosinf += 0.025;
	sininf += 0.05;
	//we pop out of the translate
	pop();

}
//we determine where canyons are and strategically place trees between them
const generateTrees = () => {
	//we define our fall colors
	let fallColors = [[143, 187, 9],[214, 231, 21],[250, 143, 4],[246, 77, 13]];
	//we make a small function to return a random fall color
	const randomFallColor = () => fallColors[~~random(0, 4)]
	//we gather the canyons and  plant trees between them with some randomness
	for (let i = 0; i < canyons.length; i++) {
		//only when there is a next canyon, do we need to check when to stop, otherwise we can plant x amount of trees
		//and stop when we feel neccecary. (this will almost certainly be at the end of the level)
		if (canyons[i + 1]) {
			//first we set an initial random tree position between the two values below
			let treePosFromCanyon = random(50, 400);

			//we then gather the position of the canyon plus its width (basically we gather the xpos of the end of the canyon)
			let canyonCoverage = canyons[i].xPos + canyons[i].width;

			//whilst there is at lease 100 pixels of distance from the next canyon and our tree, we keep planting trees.
			while (canyons[i + 1].xPos - (treePosFromCanyon + canyonCoverage) > 100) {
				//We plant the tree (by pushing its xpos and fallcolor in trees)
				trees.push(new tree(canyonCoverage + treePosFromCanyon, randomFallColor()));

				//and increase our treepos, therefore placing distance between the trees
				// (REMOVING THIS RESULTS IN AN INFINITE LOOP!)
				treePosFromCanyon += random(200, 400);
			}
		}
		//if there is no next canyon, we will simply plant 15 trees
		else {
			//we gather the coordinates of the end of the last canyon
			let lastCanyonEndXpos = canyons[canyons.length - 1].xPos + canyons[canyons.length - 1].width;
			//we randomize the initial first plant
			let distanceFromLastCanyon = random(50, 400);
			for (let i = 0; i < 15; i++) {
				trees.push(new tree(lastCanyonEndXpos + distanceFromLastCanyon,  randomFallColor()));
				//we ensure the trees are at least 200 apart, and at most 400 apart, but randomize where they plant
				distanceFromLastCanyon += random(200, 400)
			}
		}
	}
}
//simply draw the game pause screen. (the screen when you click esc)
const gamePauseScreen = () => {
	fill(0, 0, 0, 200);
	rect(0, 0, width, height);
	textSize(30);
	fill(255);
	text('Game paused', 450, 150);
	drawPauseButtons();
	musicOff();
}
//simply draws the game paused screen, we use this as a function so we can update the screen easily
//even after we call noLoop() to pause the game
const drawPauseButtons = () => {
	fill(255)
	//text('Press R to restart the game from the beginning, or ESC to unpause', 300, 400, 500, 300);
	textSize(20);
	ellipse(330, 350, 50, 50);
	text('Restart?', 300, 300)

	//the fill color will be red if all music is off (indicating it is off)
	fill(allMusicOff ? [255, 0, 0] : 255);
	ellipse(530, 350, 50, 50);
	text('Music Toggle', 475, 300)

	//the fill color will be red if all sounds is off (indicating it is off)
	fill(allSoundOff ? [255, 0, 0] : 255);
	ellipse(730, 350, 50, 50);
	text('Sounds Toggle', 670, 300)
}
var strikeColor = 0
const lightningStrikeChance = () => {
	if(frameCount / 120 == parseInt(frameCount / 120))
	{
		if(~~random(1,4) == 1)
		{
			//strike lightning
			lightningStrike();
		}
	}
	fill(255, 255, 255, strikeColor);
	rect(0, 0, width, height);
	strikeColor--;
	strikeColor = max(strikeColor, 0);
}
const lightningStrike = () => {

	lightningHasStruck = true;
	stormSound.play();
	setTimeout(() => {
		strikeColor = 255;
		lightningHasStruck = false;
	}, 400);
}



//sets the corresponding season to the level
const seasonHandler = () => {
	//we assign each level with a season
	switch(currentLevel)
	{
		case 1:
			season = 'spring';
			break;
		case 2:
			season = 'summer';
			break;
		case 3:
			season = 'fall';
			break;
		case 4:
			season = 'winter';
			break;
		case 5:
			season = 'boss';
			break;

		default:
			season = 'spring'
			break;
	}

	//we then check each season and apply the colors accordingly.
	//this may seem wasteful, however it helps with readability and editability later on.
	//please note, cloud color must be a singular number or undefined, otherwise the clouds 'stroke' wont look correct.
	if(season == 'spring')
	{
		leafColor = color(120, 190, 150);
		skyColor = color(135, 206, 250);
		groundColor = color(85, 107, 47);
		cloudColor = 255;
	}
	else if(season == 'summer')
	{
		leafColor = color(41, 124, 24);
		skyColor = color(90, 180, 255)
		groundColor = color(65, 90, 20);
		cloudColor = undefined; //therefore clouds do not get drawn
	}
	else if(season == 'fall')
	{
		leafColor = undefined //when leafcolor is undefined, we show the trees indepedant fallColor instead (this is in drawTree())
		skyColor = color(135, 206, 250);
		groundColor = color(152, 150, 77);
		cloudColor = 255;
	}
	else if(season == 'winter')
	{
		leafColor = color(255);
		skyColor = color(169,192,203);
		groundColor = color(240, 240, 240);
		cloudColor = 80;
	}
	else if(season == 'boss')
	{
		leafColor = color(1, 30, 12);
		skyColor = color(30);
		groundColor = color(112, 84, 62);
		cloudColor = 60;
	}
	
}
//generator snow object
const snowGenerator = 
{
	//we have a max particle limit as well as an array to hold all the particles
		particles: [],
		maxParticles: 400,
	generateParticles()
	{
		//as long as we do not exceed the particle limit we keep creating new particles
		while(this.particles.length < this.maxParticles)
		{
			let newParticle = new Particle(
			gameCharWorldX + 700,
			random(-500, height),
			random(-1, -6),
			random(1, 4),
			random(3, 7),
			color(255, 255, 255));
			this.particles.push(newParticle);
		}
			
	},
	//we kill particles that have gone past a certain distance from the player
	killParticles()
	{
		//we loop through and check every particle
		for(const [i, particle] of this.particles.entries())
		{
			//if the particle has past the height or is 700 px away from the player
			if(particle.yPos > height || dist(particle.xPos, 0, gameCharWorldX, 0) > 700)
			{
				//we delete it from the array using splice
				this.particles.splice(i, 1);	
			}
		}
	},
	//the main method that calls all the neccecary subsequent methods
	startTheSnow()
	{
		this.generateParticles();
		this.killParticles();
		for(const particle of this.particles)
		{
			//we draw and update each individual particle of the particles array
			particle.drawParticle()
			particle.updateParticle()
		}
	}
	

} 

//our tree class
class tree {
	constructor(xPos, fallColor)
	{
		this.xPos = xPos;
		this.yPos = floorPosY;
		this.fallColor = fallColor;
		this.fallingLeaves = [];
		this.maxLeaves = 10;
	}
	//we give each tree a chance to drop a leaf
	leavesFalling()
	{
		//every 60 frames 
		if(frameCount / 60 == parseInt(frameCount / 60))
		{
			//theres a 1/10 chance it will drop a leaf if the player is nearby
			if(~~random(0, 2) == 1 && dist(this.xPos, 0, gameCharWorldX, 0) < 900 && this.fallingLeaves.length < this.maxLeaves)
			{
				this.fallingLeaves.push(
					createVector(
					random(this.xPos, this.xPos + 150),
					 this.yPos - 100
					 )
					)
			}
		}
	}
	//we draw each leaf
	drawLeaf(leaf)
	{
		strokeWeight(2)
		//flatmap basically maps all elements and then creates a new array... we use this so we can easily modify 
		//all the elements and reduce their value
		stroke(this.fallColor.flatMap(colorNum => colorNum - 30));
		fill(this.fallColor);
		ellipse(leaf.x, leaf.y, 10, 5);
	}
	//we make each leaf fall until it has reached the ground
	 updateLeaf(leaf)
	{
		if(leaf.y < floorPosY-2.5)
		{
			leaf.y++;
		}
	}
	//if the tree has dropped its maxleaves, we clear the leaves and start again
	manageLeaves()
	{
		if(this.fallingLeaves.length == this.maxLeaves)
		{
			this.fallingLeaves.length = 0;
		}
	}

	//we activate each tree
	activateTree()
	{
		//we allow the falling of leaves.
		this.leavesFalling()
		//as long as their is leaves we update the leaves and draw them.
		if(this.fallingLeaves.length > 0)
		{
			//we check if there is the max leaves on the ground periodically, if so we clear them
			this.manageLeaves()
			for(const leaf of this.fallingLeaves)
			{
				this.drawLeaf(leaf);
				this.updateLeaf(leaf);
				
			}
		}
	}
}

//the projectile class, this is a super important class, and we use it for all the tennis balls (except homing ones)
//We also extxend this class for our boss class taking some of its attributes
class projectile {
	constructor(speed, xPos, projectileWidth, projectileHeight) {
		this.xPos = xPos;
		this.yPos = floorPosY - projectileHeight;
		this.width = projectileWidth;
		this.height = projectileHeight;
		this.speed = speed;
		this.timeAlive = 0;
	}
	//simply draw the projectile
	drawProjectile() {
		ellipse(this.xPos, this.yPos, this.width)
	}
	//here we detect if a projectile has collided with the player...
	killedPlayer(hitboxShape) {
		//if the hitbox of the projectile is a square
		if (hitboxShape === 'square') {
			//we check the hitbox using a square collision detection if statement
			if (gameCharWorldX > this.xPos &&
				gameCharWorldX < this.xPos + this.width &&
				gameCharY > this.yPos) {
				projectileKilledPlayer = true;
			}
		}
		//if the hitbox of the projectile is an ellipse
		else if (hitboxShape === 'ellipse') {
			//we check the hitbox using a ellipse collision detection if statement
			if (dist(this.xPos, this.yPos, gameCharWorldX, gameCharY - 10) < this.width) {
				projectileKilledPlayer = true;
			}
		}

	}
}

//we use this class to make a Particle
class Particle
{
	constructor(xPos, yPos, xSpeed, ySpeed, particleSize, color)
	{
		this.xPos = xPos;
		this.yPos = yPos;
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
		this.size = particleSize;
		this.color = color;
	}
	//we draw each particle individually
	drawParticle()
	{
		noStroke();
		fill(this.color);
		ellipse(this.xPos, this.yPos, this.size, this.size);
	}
	//and update their position
	updateParticle()
	{
		this.xPos += this.xSpeed;
		this.yPos += this.ySpeed;
	}

}

//here we EXTEND projectile, to use its properties and also its killedPlayer method
//basically we use its projectile width and height methods as well as xpos and speed
//we do this so we do not have to copy the properties in our enemy class
class Enemy extends projectile {
	constructor(speed = 1.5, xPos = 800, projectileWidth = 50, projectileHeight = 50, vision = 250, projectileLifespan = 500) {
		super(speed, xPos, projectileWidth, projectileHeight)
		//the max projectiles that can be fired by tehe enemy
		this.maxProjectiles = 5;
		//the enemies vision, that is, at what range it will be provoked to shoot tennis balls
		this.vision = vision;
		//the array that holds all the projectiles the enemy fires
		this.projectiles = [];
		//if the enemy is dead or alive
		this.isDead = false;
		//if the enemy is currently engaging the player in a fight 
		this.attackingPlayer = false;
		//the projectiles lifespan, that is, how long it takes them to die when shoot
		this.projectilesLifespan = projectileLifespan;
		//when the enemy hits a canyon this becomes true, and it turns the other way,
		//and does not turn back until some time has passed, without this the enemy may glitch through the canyon.
		this.movementLocked = false;
		//the eye color of the enemy
		this.eyeWhites = color(0);
		//which animation we show for the enemy
		this.rightAnimation = false;
	}

	// we draw all the projectiles that the enemy has fired
	drawProjectiles() {
		//for every projectile, we do the following...
		this.projectiles.forEach((projectile, index) => {
			//we draw it...
			strokeWeight(2);
			fill(223, 255, 79);
			ellipse(projectile.xPos, projectile.yPos, projectile.width);
			strokeWeight(1);
			//we increase its xPos by its speed...
			projectile.xPos += projectile.speed;
			//we increase its timeAlive
			projectile.timeAlive += 1;
			//terminate projectiles whos time alive is greater then the projectile lifespan limit
			if (projectile.timeAlive > this.projectilesLifespan) {
				this.projectiles.splice([index], 1);
			}
			//if there is at least one projectile...
			if (this.projectiles.length > 0) {
				//check if its currently in a range which would kill the player...
				this.projectiles[index].killedPlayer('ellipse');
			}
		})


	}
	//here we move our enemy...
	moveEnemy() {
		//we check every canyon in canyons...
		for (const canyon of canyons) {

			//the +80 and +85 are vital for visual accuracy, DO NOT REMOVE!
			//if the enemy is about to fall into a canyon... and its movement is not locked...
			if (this.xPos <= canyon.xPos + canyon.width + 85 &&
				this.xPos + this.width > canyon.xPos + 80 &&
				!this.movementLocked) {

				//we flip its speed (switching its direction)
				this.speed *= -1;

				//we lock the movement aswell, to fix a bug where the enemy glitches over the canyon...
				//basically when the enemy reaches a canyon we have it walk unbothered away from it 
				this.movementLocked = true;
			}

			//if its position is locked we want there to be at least some delay before it tries to 
			//move that way again. Although we aren't determining the frame count at this time, this should provide
			//enough delay so the enemy doesn't glitch onto the canyon
			if (this.movementLocked &&
				frameCount / 120 == parseInt(frameCount / 120)) {
				//we unlock its movement after a delay
				this.movementLocked = false;
			}
		}
		//we move every enemys xpos by its speed..
		this.xPos += this.speed;
	}
	//here we determine if the player killed the enemy...
	killEnemy() {
		//if the played is ontop of the enemies head...
		if (gameCharWorldX > this.xPos &&
			gameCharWorldX < this.xPos + this.width &&
			gameCharY < this.yPos - 2 &&
			gameCharY > this.yPos - 14) {
			//we set its isdead property to true,
			this.isDead = true;
			//play a death sound as long as sounds aren't off
			if(!allSoundOff)
			{
				enemyDeathSound.play();
			}
			
			//and increase the players dogScore
			dogScore++;
		}

	}
	//here we draw every enemy, they have two animations, facing right and left, so we determine which one to 
	//draw as well
	drawEnemy() {

		//if the enemy is attacking the player...
		if (this.attackingPlayer) {
			//we simply make the enemy face the player regardless of where its moving
			this.enemyRightAnimation = gameCharWorldX < this.xPos + this.width / 2 ? false : true;
			//and make its eyes red
			this.eyeWhites = color(255, 0, 0);
		}
		//otherwise if the enemy is not attacking the player...
		else {
			//we allow its animation to be chosen by the direction it is going
			this.enemyRightAnimation = this.speed > 0 ? true : false;
			//and we make its eyes white.
			this.eyeWhites = color(255)
		}

		//if enemyRightAnimation (we show that animation...)
		noStroke();
		fill(160, 82, 45)
		if (this.enemyRightAnimation) {
			push();
			translate(this.width, 0);
			rect(this.xPos - 40, this.yPos + 25, 4, 30);
			rect(this.xPos - 45, this.yPos + 25, 4, 30);
			rect(this.xPos - 15, this.yPos + 25, 4, 30);
			rect(this.xPos - 21, this.yPos + 25, 4, 30);
			rect(this.xPos - 60, this.yPos + 16, 15, 5);
			ellipse(this.xPos - 30, this.yPos + 20, 40, 20);
			ellipse(this.xPos - 10, this.yPos + 10, 20, 20);
			fill(this.eyeWhites);
			ellipse(this.xPos - 5, this.yPos + 10, 8, 8);
			fill(0);
			ellipse(this.xPos - 3, this.yPos + 10, 2, 2);
			ellipse(this.xPos - 12, this.yPos + 13, 10, 20);
			pop();
		}
		//otherwise, if its not the right animation its aught to be left animation!
		//thats the code below
		else {
			rect(this.xPos + 35, this.yPos + 25, 4, 30);
			rect(this.xPos + 43, this.yPos + 25, 4, 30);
			rect(this.xPos + 13, this.yPos + 25, 4, 30);
			rect(this.xPos + 21, this.yPos + 25, 4, 30);
			rect(this.xPos + 45, this.yPos + 16, 15, 5);
			ellipse(this.xPos + 30, this.yPos + 20, 40, 20);
			ellipse(this.xPos + 10, this.yPos + 10, 20, 20);
			fill(this.eyeWhites);
			ellipse(this.xPos + 5, this.yPos + 10, 8, 8);
			fill(0);
			ellipse(this.xPos + 3, this.yPos + 10, 2, 2);
			ellipse(this.xPos + 12, this.yPos + 13, 10, 20);
		}
		//every time we draw the enemy we also call its moveEnemy function to move its position
		this.moveEnemy();

	}
	//this method should be called ALWAYS
	//as it it timed with parseint, it shoots tennisballs at the player
	attackPlayer(direction) {
		//if the enemy hasn't shot their max projectiles and...
		if (this.projectiles.length < this.maxProjectiles &&

			//it has been 2/3rds of a second...
			frameCount / 40 == parseInt(frameCount / 40)) {

			//we give it a 1/2 chance to attack...
			//note the weird sguigly lines do exactly the same thing as Math.floor(),
			//its just a fancier shorthand...
			if (~~random(2) == 1) {
				//if the enemy is facing left we shoot a projectile to the left (aka the negative speed)
				let projectileSpeed = direction == 'left' ? -2 : 2

				//we create a new projectile with the projectile speed above and the same xpos as the enemy.
				//Its width and height get set to half of the enemies width and height
				this.projectiles.push(new projectile(projectileSpeed, this.xPos, this.width / 2, this.height / 2));
			}
		}
	}

	//here we check if the enemy can see the player, and if so we call its attackPlayer function
	seesPlayer() {
		//if the distance between the enemy and the player is less then its vision
		if (dist(this.xPos + this.width / 2, 0, gameCharWorldX, 0) < this.vision) {
			//we set the attackingplayer attribute to true
			this.attackingPlayer = true;

			//if the players x coordinates are greater then the enemies
			if (gameCharWorldX > this.xPos) {
				//this means the player is on the right & its movement is unlocked, 
				//so move the enemy the left(if the enemy isn't already moving that way)
				if (this.speed > 0 && !this.movementLocked) { this.speed *= -1; }

				//The player is on right, attack right
				this.attackPlayer('right');
			}
			//if the players x coordinates are less then the enemies
			if (gameCharWorldX < this.xPos) {

				//this means the player is on the left & its movement is unlocked, 
				//so move the enemy the right(if the enemy isn't already moving that way)
				if (this.speed < 0 && !this.movementLocked) { this.speed *= -1; }

				//The player is on left, attack left
				this.attackPlayer('left');
			}
		}
		else {
			//if it doesnt see the player it is not attacking, therefore we set attackingPlayer to false
			this.attackingPlayer = false;
		}
	}

}

//the function that gets called every time we restart the game (when a player dies, or a new level, or the game 
//starts for the first time...)
function startGame() {
	//victoryCount is used for our victory animation when the player does their fun dance
	victoryCount = 0;

	//we set the gameCharX and gameCharY to appropiate values 
	gameCharX = width / 2;
	gameCharY = floorPosY;

	//we set our characters run speed (game was designed at speed 4)
	gameCharSpeed = 4;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameCharWorldX = gameCharX - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = isRight = isFalling = isPlummeting = isDead = false;

	//jump variables
	//the player is not jumping by default
	isJumping = false;
	//GAME WAS DESIGNED WITH A JUMPSPEED OF 8
	jumpSpeed = 8;
	//GAME WAS DESIGNED WITH A MAXJUMP OF 100
	maxJump = 100;
	//Our variables to work our jump f8unction(to measure distances)
	jumpStartY = distCharJumpMax = 0;

	// our variable to kill theplayer if  they were hit by a projectile
	projectileKilledPlayer = false;

	//end level variables, the curtain position and if its closed or not
	curtainY = 0;
	curtainClosed = false;

	//we set our scores to zero
	carrotScore = dogScore = 0;

	//here we set/reset our variables for the cool swirly animation after you complete a level
	multHorizontal = x = 0;

	//our infinity function variables must be set to zero
	cosinf = sininf = 0;

	//this is used to move the flagpole up towards the player
	flagRaiser = 0;

	//if the final boss is killed this should be true, otherwise always false
	finalBossKilled = false;

	//when true lightning will strike and blind the player
	lightningHasStruck = false;

	seasonHandler()//updates the season to be the one corresponding to the current level

	// here we store all the level specficic data.
	levels = {
		//we seperate each level with its level number
		'1': {
			//they each have a canyons array containing canyon objects
			canyons: [
				{ xPos: -500, width: 400, playerFallenInto: false },
				{ xPos: 1800, width: 100, playerFallenInto: false },
				{ xPos: 2800, width: 1000, playerFallenInto: false },
			],
			//a collectible array containing collectable objects
			collectables:
				[
					{ xPos: 1400, yPos: 460, isFound: false },
				],
			//a platforms array containing platforms objects
			platforms:
				[
					{ xPos: 2800, yPos: floorPosY - 50, width: 100, onPlatform: false },
					{ xPos: 3000, yPos: floorPosY - 90, width: 100, onPlatform: false },
					{ xPos: 3200, yPos: floorPosY - 120, width: 100, onPlatform: false },
					{ xPos: 3400, yPos: floorPosY - 150, width: 100, onPlatform: false },
					{ xPos: 3600, yPos: floorPosY - 180, width: 100, onPlatform: false },
				],
			//a cutscene array for cutscene objects
			cutscenes:
				[
					{ xPos: 500, text: "Use A and S to move, ESC to pause, and press C to quit dialogue.", hasTriggered: false },
					{ xPos: 1400, text: "This is a carrot... obviously. Collect it to add to your score!", hasTriggered: false },
					{ xPos: 1800, text: "This is a canyon, if you fall into it you die! Jump over it using the 'W' key.", hasTriggered: false },
					{ xPos: 2800, text: "These are platforms, you can jump on them to cross the canyon!", hasTriggered: false },
					{ xPos: 5000, text: "This is the flagpole, jump on it to finish level one.", hasTriggered: false }
				],
			//a flagpole object
			flagpole: {
				xPos: 5000,
				isReached: false,
				isRaised: false
			},
			//and an array if we decide we want enemies on the level.
			enemies: [
			]

		},
		//all levels below are the same just with different values, therefore it should be easy to understand from here...
		//see lvl 3 enemies array for a brief walkdown of how that works
		'2': {
			canyons: [
				{ xPos: -400, width: 500, playerFallenInto: false },
				{ xPos: 1300, width: 2000, playerFallenInto: false },
				{ xPos: 4000, width: 100, playerFallenInto: false },
				{ xPos: 4500, width: 100, playerFallenInto: false },
				{ xPos: 5000, width: 100, playerFallenInto: false },
				{ xPos: 5500, width: 100, playerFallenInto: false },
				{ xPos: 6000, width: 2000, playerFallenInto: false },
			],
			collectables:
				[
					{ xPos: 2750, yPos: 150, isFound: false },
					{ xPos: 3100, yPos: 150, isFound: false },

					{ xPos: 3250, yPos: 150, isFound: false },
					{ xPos: 3300, yPos: 150, isFound: false },
					{ xPos: 3350, yPos: 150, isFound: false },
					{ xPos: 3400, yPos: 150, isFound: false },


					{ xPos: 4100, yPos: 350, isFound: false },
					{ xPos: 4600, yPos: 350, isFound: false },
					{ xPos: 5600, yPos: 350, isFound: false },

				],
			platforms:
				[
					//big canyon 1 platforms (pro)
					{ xPos: 1550, yPos: floorPosY - 120, width: 30, onPlatform: false },
					{ xPos: 1775, yPos: floorPosY - 160, width: 30, onPlatform: false },
					{ xPos: 2000, yPos: floorPosY - 200, width: 30, onPlatform: false },
					{ xPos: 2225, yPos: floorPosY - 240, width: 30, onPlatform: false },
					{ xPos: 2450, yPos: floorPosY - 280, width: 30, onPlatform: false },
					{ xPos: 2500, yPos: floorPosY - 240, width: 100, onPlatform: false },
					{ xPos: 2800, yPos: floorPosY - 280, width: 30, onPlatform: false },
					{ xPos: 2850, yPos: floorPosY - 240, width: 100, onPlatform: false },
					{ xPos: 3150, yPos: floorPosY - 280, width: 30, onPlatform: false },
					{ xPos: 3200, yPos: floorPosY - 240, width: 250, onPlatform: false },

					//big canyon 1 platforms(easy)
					{ xPos: 1300, yPos: floorPosY - 60, width: 100, onPlatform: false },
					{ xPos: 1400, yPos: floorPosY - 20, width: 350, onPlatform: false },
					{ xPos: 1900, yPos: floorPosY - 20, width: 100, onPlatform: false },
					{ xPos: 2200, yPos: floorPosY - 20, width: 100, onPlatform: false },
					{ xPos: 2500, yPos: floorPosY - 20, width: 100, onPlatform: false },
					{ xPos: 2800, yPos: floorPosY - 20, width: 100, onPlatform: false },
					{ xPos: 3100, yPos: floorPosY - 20, width: 100, onPlatform: false },

					//big canyon 2 platforms
					{ xPos: 6200, yPos: floorPosY - 40, width: 100, onPlatform: false },
					{ xPos: 6500, yPos: floorPosY - 50, width: 100, onPlatform: false },
					{ xPos: 6800, yPos: floorPosY - 60, width: 100, onPlatform: false },
					{ xPos: 7100, yPos: floorPosY - 70, width: 100, onPlatform: false },
					{ xPos: 7400, yPos: floorPosY - 80, width: 100, onPlatform: false },
					{ xPos: 7700, yPos: floorPosY - 90, width: 100, onPlatform: false },
					{ xPos: 8000, yPos: floorPosY - 100, width: 100, onPlatform: false },



				],
			cutscenes:
				[
				],
			flagpole: {
				xPos: 8200,
				isReached: false,
				isRaised: false

			},
			enemies: [
			]

		},
		'3': {

			canyons: [
				{ xPos: -400, width: 500, playerFallenInto: false },
				{ xPos: 1300, width: 100, playerFallenInto: false },
				{ xPos: 1700, width: 1000, playerFallenInto: false },
				{ xPos: 3200, width: 1000, playerFallenInto: false },
				{ xPos: 6000, width: 500, playerFallenInto: false },
				{ xPos: 7500, width: 500, playerFallenInto: false },


			],
			collectables:
				[
					{ xPos: 5200, yPos: 400, isFound: false },
					{ xPos: 5600, yPos: 400, isFound: false },
					{ xPos: 6100, yPos: 400, isFound: false },

				],
			platforms:
				[
					//big canyon 1 platforms
					{ xPos: 1800, yPos: floorPosY - 60, width: 100, onPlatform: false },
					{ xPos: 2100, yPos: floorPosY - 70, width: 80, onPlatform: false },
					{ xPos: 2400, yPos: floorPosY - 70, width: 60, onPlatform: false },
					{ xPos: 2650, yPos: floorPosY - 70, width: 60, onPlatform: false },
					//big canyon 2 platforms
					{ xPos: 3300, yPos: floorPosY - 50, width: 70, onPlatform: false },
					{ xPos: 3500, yPos: floorPosY - 70, width: 70, onPlatform: false },
					{ xPos: 3800, yPos: floorPosY - 70, width: 70, onPlatform: false },
					{ xPos: 4000, yPos: floorPosY - 70, width: 70, onPlatform: false },

					{ xPos: 6000, yPos: floorPosY - 70, width: 50, onPlatform: false },
					{ xPos: 6200, yPos: floorPosY - 70, width: 40, onPlatform: false },
					{ xPos: 6400, yPos: floorPosY - 70, width: 40, onPlatform: false },
				],
			cutscenes:
				[
					{ xPos: 3000, text: "A stray dog, be careful it throws tennis balls! Jump on it to save it!", hasTriggered: false }

				],
			flagpole: {
				xPos: 7000,
				isReached: false,
				isRaised: false
			},
			enemies: [
				//one thing to note is we create a new Enemy directly inside of the array here. So to add a enemy to a level
				//simply add the appropiate stats (speed, xpos, width, height, vision(optional))
				new Enemy(speed = 0.5, xPos = 2800, 50, 50),
				new Enemy(speed = 1, xPos = 5000, 50, 50),
				new Enemy(speed = 1.1, xPos = 5500, 50, 50),
				new Enemy(speed = 1.2, xPos = 6000, 50, 50)
			]

		},
		'4': {
			canyons: [
				{ xPos: -400, width: 500, playerFallenInto: false },
				{ xPos: 1300, width: 1500, playerFallenInto: false },
				{ xPos: 3500, width: 2000, playerFallenInto: false },
				{ xPos: 6000, width: 150, playerFallenInto: false },
				{ xPos: 6500, width: 150, playerFallenInto: false },
				{ xPos: 7000, width: 150, playerFallenInto: false },
			],
			collectables:
				[
					{ xPos: 1900, yPos: 100, isFound: false },
					{ xPos: 2150, yPos: 100, isFound: false },
					{ xPos: 2400, yPos: 100, isFound: false },
					{ xPos: 2600, yPos: 100, isFound: false },
					{ xPos: 6150, yPos: 350, isFound: false },
					{ xPos: 6650, yPos: 350, isFound: false },

				],
			platforms:
				[
					//big canyon 1 platforms
					{ xPos: 1300, yPos: floorPosY - 60, width: 50, onPlatform: false },
					{ xPos: 1500, yPos: floorPosY - 130, width: 50, onPlatform: false },
					{ xPos: 1300, yPos: floorPosY - 200, width: 50, onPlatform: false },
					{ xPos: 1500, yPos: floorPosY - 270, width: 50, onPlatform: false },
					{ xPos: 1750, yPos: floorPosY - 270, width: 50, onPlatform: false },
					{ xPos: 2000, yPos: floorPosY - 270, width: 50, onPlatform: false },
					{ xPos: 2250, yPos: floorPosY - 270, width: 50, onPlatform: false },
					{ xPos: 2500, yPos: floorPosY - 270, width: 50, onPlatform: false },


					{ xPos: 1700, yPos: floorPosY - 70, width: 100, onPlatform: false },
					{ xPos: 2000, yPos: floorPosY - 70, width: 100, onPlatform: false },
					{ xPos: 2300, yPos: floorPosY - 70, width: 100, onPlatform: false },
					{ xPos: 2600, yPos: floorPosY - 70, width: 100, onPlatform: false },

					//big canyon 2 platforms
					{ xPos: 3700, yPos: floorPosY - 60, width: 70, onPlatform: false },
					{ xPos: 3700, yPos: floorPosY - 140, width: 70, onPlatform: false },
					{ xPos: 3700, yPos: floorPosY - 220, width: 70, onPlatform: false },
					{ xPos: 3700, yPos: floorPosY - 300, width: 70, onPlatform: false },
					{ xPos: 3950, yPos: floorPosY - 300, width: 70, onPlatform: false },
					{ xPos: 4100, yPos: floorPosY - 200, width: 70, onPlatform: false },
					{ xPos: 4350, yPos: floorPosY - 240, width: 70, onPlatform: false },
					{ xPos: 4500, yPos: floorPosY - 140, width: 70, onPlatform: false },
					{ xPos: 4750, yPos: floorPosY - 180, width: 70, onPlatform: false },
					{ xPos: 5000, yPos: floorPosY - 220, width: 70, onPlatform: false },
					{ xPos: 5250, yPos: floorPosY - 260, width: 70, onPlatform: false },


				],
			cutscenes:
				[
				],
			flagpole: {
				xPos: 8000,
				isReached: false,
				isRaised: false
			},
			enemies: [
				new Enemy(speed = 0.5, xPos = 2900, 50, 50, 170),
				new Enemy(speed = 1, xPos = 5700, 50, 50, 210),
				//the 250 at the end is the vision of the Enemy. The normal vision is 150

			]

		},

		'5': {
			canyons: [
				{ xPos: -400, width: 500, playerFallenInto: false },
				{ xPos: 1300, width: 500, playerFallenInto: false },
				{ xPos: 2300, width: 500, playerFallenInto: false },
				{ xPos: 3600, width: 100, playerFallenInto: false },
				{ xPos: 4200, width: 100, playerFallenInto: false },
				{ xPos: 4800, width: 100, playerFallenInto: false },
				{ xPos: 6000, width: 100, playerFallenInto: false },
				{ xPos: 7000, width: 2500, playerFallenInto: false },
			],
			collectables:
				[
					{ xPos: 2000, yPos: 400, isFound: false },
					{ xPos: 4350, yPos: 350, isFound: false },
					{ xPos: 7150, yPos: 125, isFound: false },
					{ xPos: 7150, yPos: 125, isFound: false },
					{ xPos: 8925, yPos: 120, isFound: false },

				],
			platforms:
				[



					// canyon 1 platforms
					{ xPos: 1500, yPos: floorPosY - 60, width: 70, onPlatform: false },
					{ xPos: 1800, yPos: floorPosY - 60, width: 70, onPlatform: false },

					// canyon 2 platforms
					{ xPos: 2400, yPos: floorPosY - 60, width: 70, onPlatform: false },
					{ xPos: 2700, yPos: floorPosY - 60, width: 70, onPlatform: false },

					//BIG canyon 3 platforms
					{ xPos: 7250, yPos: floorPosY - 30, width: 70, onPlatform: false },
					{ xPos: 7500, yPos: floorPosY - 70, width: 70, onPlatform: false },
					{ xPos: 7700, yPos: floorPosY - 130, width: 70, onPlatform: false },
					{ xPos: 7500, yPos: floorPosY - 190, width: 70, onPlatform: false },
					{ xPos: 7250, yPos: floorPosY - 250, width: 70, onPlatform: false },
					{ xPos: 7500, yPos: floorPosY - 310, width: 70, onPlatform: false },
					{ xPos: 7750, yPos: floorPosY - 310, width: 70, onPlatform: false },
					{ xPos: 8000, yPos: floorPosY - 310, width: 70, onPlatform: false },
					{ xPos: 8250, yPos: floorPosY - 310, width: 70, onPlatform: false },
					{ xPos: 8400, yPos: floorPosY - 210, width: 70, onPlatform: false },
					{ xPos: 8550, yPos: floorPosY - 110, width: 70, onPlatform: false },
					{ xPos: 8700, yPos: floorPosY - 20, width: 70, onPlatform: false },
					{ xPos: 8900, yPos: floorPosY - 40, width: 70, onPlatform: false },
					{ xPos: 8900, yPos: floorPosY - 120, width: 70, onPlatform: false },
					{ xPos: 8900, yPos: floorPosY - 200, width: 70, onPlatform: false },
					{ xPos: 8900, yPos: floorPosY - 280, width: 70, onPlatform: false },
					{ xPos: 9200, yPos: floorPosY - 180, width: 70, onPlatform: false },

					//final boss platforms
					{ xPos: 11000, yPos: floorPosY - 60, width: 70, onPlatform: false },
					{ xPos: 11200, yPos: floorPosY - 140, width: 70, onPlatform: false },
					{ xPos: 11000, yPos: floorPosY - 200, width: 70, onPlatform: false },
					{ xPos: 10800, yPos: floorPosY - 280, width: 70, onPlatform: false },
					{ xPos: 11000, yPos: floorPosY - 340, width: 70, onPlatform: false },
					{ xPos: 11200, yPos: floorPosY - 340, width: 70, onPlatform: false },

				],
			cutscenes:
				[
				],
			flagpole: {
				isReached: false
			},
			enemies: [
				//the 250 at the end is the vision of the boss. The normal vision is 150
				new Enemy(speed = 0.5, xPos = 1900, 50, 50, 250),
				new Enemy(speed = 1, xPos = 3000, 50, 50, 300),
				new Enemy(speed = 1.5, xPos = 3900, 50, 50, 300),
				new Enemy(speed = 1.5, xPos = 5000, 50, 50, 300),
			]

		},
		'6': {
			canyons: [
				{ xPos: -400, width: 500, playerFallenInto: false },
				{ xPos: 1300, width: 500, playerFallenInto: false },
			],
			collectables:
				[
					{ xPos: 300, yPos: 400, isFound: false },
					{ xPos: 400, yPos: 400, isFound: false },
					{ xPos: 500, yPos: 400, isFound: false },
					{ xPos: 600, yPos: 400, isFound: false },
					{ xPos: 700, yPos: 400, isFound: false },
					{ xPos: 800, yPos: 400, isFound: false },
					{ xPos: 900, yPos: 400, isFound: false },
					{ xPos: 1000, yPos: 400, isFound: false },
					{ xPos: 1200, yPos: 400, isFound: false },
					{ xPos: 1300, yPos: 400, isFound: false },

				],
			platforms:
				[
				],
			cutscenes:
				[
				],
			flagpole: {
			},
			enemies: [
			]

		}


	}


	//we set our maxPossible scores to zero, and then populate them with the data above.
	maxPossibleCarrotScore = maxPossibleDogScore = 0;
	//we iterate through each level in the levels array
	for (const level in levels) {
		//and count every collectable, and add it to our maxPossibleCarrotScore
		maxPossibleCarrotScore += levels[level].collectables.length;

		//and also count every enemy, and add it to our maxPossibleCarrotScore
		maxPossibleDogScore += levels[level].enemies.length;
	}

	//we set our game objects to equal those coresponding to the current level
	[canyons, collectables,
		platforms, cutscenes,
		flagpole, enemies] = Object.values(levels[currentLevel]);
	totalEnemies = enemies.length;

	//we initialize our cloud and mountain array..
	clouds = []
	mountains = []
	//we fill the mountains array, and clouds array with some randomized values
	for (let i = 0; i < 25; i++) {
		mountains.push({ xPos: 0 + (i * 500), size: random(-5, -2) });
		clouds.push({ xPos: 0 + (i * 500 + random(0, 300)), yPos: 0, size: 0.8 });
	}


	//we initialize our trees array
	trees = [];
	//and fill it with trees naturally generated between canyons
	generateTrees()

	//only when its level 5 do we load in the final boss object
	if (currentLevel == 5) {
		//this is a awkward place to have the final boss, but its the only place that makes sense...
		//you cant put this outside of setup as we use createVector... so unfortunately we have to throw it in either here,
		// or directly into startgame...
		finalBoss = {
			//here we set some basic width, height and position variables
			width: 240,
			height: 300,
			xPos: 11300,
			yPos: floorPosY - 300, //must subtract the finalboss height from the ypos, for it to remain on the ground

			//maximum homing tennis balls that can be alive at a time
			maxTennisBalls: 2,
			//the array that holds all the homing tennis balls
			tennisBalls: [],
			//the bosses vision
			vision: 800,
			//The boss takes note of the players location, and uses this for its homing tennis ball missles
			playerLocation: createVector(gameCharWorldX, gameCharY),
			//the tennis ball lifespan before it dies. (460/60frames = 8 seconds is the tennisBallsLifespan) 
			tennisBallsLifespan: 480,
			//the maximum acceleration of the tennis balls
			tennisBallMaxAcceleration: 2,
			//we draw the final boss
			drawFinalBoss() {
				fill(184, 109, 41);
				stroke(0);
				strokeWeight(2);
				push();
				//we translate to the middle of the finalboss
				translate(this.xPos + this.width / 2, this.yPos + 60);
				//we create a vector that uses the gameCharWorldX in its x - the gamechars position
				//and then we use the gameCharY for its y pos - this.yPos
				//we do this to allow the eyes to follow the player
				var eyes = createVector(gameCharWorldX - this.xPos, gameCharY - this.yPos);
				//we normalize it to make it a unit vector ( a number between 0 and 1)
				eyes.normalize();
				// and multiply the vector by the scalar 6 (making the distance between the iris and the whites of the eye larger)
				eyes.mult(6);

				//left ear
				push();
				//we translate and rotate to allow us to easily rotate each piece that we need to
				translate(-80, -25);
				rotate(PI / 1.3);
				ellipse(0, 0, 100, 30);
				pop();
				//right ear
				push();
				translate(80, -25);
				rotate(PI / -1.3);
				ellipse(0, 0, 100, 30);
				pop();
				push();
				//left foot
				translate(-80, +200);
				rotate(PI / 1.3);
				ellipse(0, 0, 100, 60);
				pop();
				//right foot
				push();
				translate(80, +200);
				rotate(PI / -1.3);
				ellipse(0, 0, 100, 60);
				pop();
				//body
				fill(184, 109, 41);
				ellipse(0, +140, 200, 180);
				//left arm & right arm
				ellipse(40, 180, 40, 100);
				ellipse(-40, 180, 40, 100);
				//head
				fill(184, 109, 41);
				ellipse(0, 0, 125, 125);
				//eye whites
				fill(255);
				ellipse(-25, -20, 25, 25);
				ellipse(25, -20, 25, 25);
				fill(0);
				//pupils
				ellipse(-25 + eyes.x, -20 + eyes.y, 10, 10);
				ellipse(25 + eyes.x, -20 + eyes.y, 10, 10);
				//nose
				fill(255);
				ellipse(0, 10, 25, 25);
				//nose holes
				fill(0);
				ellipse(-5, 10, 5, 5);
				ellipse(5, 10, 5, 5);
				//mout
				noFill();
				stroke(0);
				strokeWeight(3);
				arc(-13, +25, 25, 25, 0, HALF_PI * 1.5);
				arc(+13, +25, 25, 25, 45, HALF_PI * 2);

				pop();
			},
			//this method checks if the player killed the boss or if the boss killed the palyer.
			killFinalBoss() {
				//if the player stomps on the bosses head
				if (gameCharWorldX > this.xPos &&
					gameCharWorldX < this.xPos + this.width &&
					gameCharY < this.yPos &&
					gameCharY > this.yPos - 5) {

					//we set finalBossKilled to true, therefore ending the level just like if a flagpole was reached
					finalBossKilled = true;
					//we play the next level sound as long as all sounds aren't off
					if (!allSoundOff) {
						nextLevelSound.play();
					}
					//we kill the boss by setting it to null, 
					finalBoss = null;

				}
				//if the player walks into the boss we kill the player
				else if (gameCharWorldX > this.xPos &&
					gameCharWorldX < this.xPos + this.width &&
					gameCharY > this.yPos) {
					//we use proejctileKilledPlayer to simply kill the player (although it isn't a projectile amd
					//is instead the final bosses body, this boolean works perfectly in this case and is still easy
					//to understand...)
					projectileKilledPlayer = true;
				}
			},
			//the method that deals with the boss being able to see the player
			seesPlayer() {
				//if the player is within the final bosses vision...
				if (dist(gameCharWorldX, 0, this.xPos, 0) < this.vision) {
					//we allow it to shoot homing tennis balls
					this.shootHomingTennisball();
				}
			},
			//the method that deals with shooting the homming tennis balls
			shootHomingTennisball() {
				//if the current amount of active homing tennis balls is less then the max amount...
				if (this.tennisBalls.length < this.maxTennisBalls) {
					//every three seconds we shoot a missile
					if (frameCount / 180 == parseInt(frameCount / 180)) {
						//we push a new tennisball into the tennisBalls array
						this.tennisBalls.push(
							{
								//the coords make the ball come out of the dogs mouth
								coords: createVector(this.xPos + this.width / 2, this.yPos + 100),
								//size of the tennis ball
								size: 30,
								//its starting acceleration values for x and y
								accelerationX: 0,
								accelerationY: 0,
								//the tennis balls time alive, which starts at zero
								timeAlive: 0,
							})
					}
				}
			},
			//this method updates the player location that it uses to aim missiles
			aimHomingTennisBall() {
				this.playerLocation.x = gameCharWorldX;
				this.playerLocation.y = gameCharY - 20;

			},
			//this method moves each tennis ball and updates it acceleration
			moveTennisBall(tennisBall) {
				//the acceleration that each ball starts with
				var accelerationIncrease = 0.2
				//we update the acceleration of the ball x/60 per second
				if (frameCount / 5 == parseInt(frameCount / 5)) {
					//if the distance between the ball and the player is greater then 100 we give a big increase
					//to acceleration. If we didn't do this, tennis balls would often orbit around the player so
					//this is a minor bug fix and a big increase in accuracy for the finalBoss
					if (dist(tennisBall.coords.x, tennisBall.coords.y, gameCharWorldX, gameCharY) > 100) {
						accelerationIncrease = 1;
					}

					//if ball is to right of player
					if (tennisBall.coords.x > this.playerLocation.x) {
						//we accelerate it towards the left
						tennisBall.accelerationX = max(tennisBall.accelerationX - accelerationIncrease, -this.tennisBallMaxAcceleration);
					}
					//if the ball is to the left of the player
					else if (tennisBall.coords.x < this.playerLocation.x) {
						//we accelerate it towards the right
						tennisBall.accelerationX = min(tennisBall.accelerationX + accelerationIncrease, this.tennisBallMaxAcceleration);
					}

					//if ball is above the player
					if (tennisBall.coords.y < this.playerLocation.y) {
						//accerlate ball down
						tennisBall.accelerationY = min(tennisBall.accelerationY + accelerationIncrease, this.tennisBallMaxAcceleration);

						//if the ball is underneath the player
					}
					else if (tennisBall.coords.y > this.playerLocation.y) {
						//we accelerate ball up
						tennisBall.accelerationY = max(tennisBall.accelerationY - accelerationIncrease, -this.tennisBallMaxAcceleration);
					}

				}
				//we then add the acceleration to the x and y coords of the tennis ball(this is the homing missle effect)
				tennisBall.coords.x += tennisBall.accelerationX;
				tennisBall.coords.y += tennisBall.accelerationY;
			},
			//this method draws the tennis ball
			drawTennisBall(tennisBall) {
				// we draw the tennis ball with the coords and with its size
				noStroke();
				fill(223, 255, 79);
				ellipse(tennisBall.coords.x, tennisBall.coords.y, tennisBall.size, tennisBall.size);

			},
			//this method deals with killing old tennis balls
			killHomingTennisBall() {
				//if the oldest tennis ball          (we only check the oldest one as they expire in order from oldest -> newest)
				// is older then the lifespan limit...
				if (this.tennisBalls[0].timeAlive > this.tennisBallsLifespan) {
					//we remove it from the tennis ball array (aka we kill it from existence in the game)
					this.tennisBalls.shift();
				}
			},
			//this method checks if a tennis ball has killed a player
			checkIfKilledPlayer(tennisBall) {
				if (dist(tennisBall.coords.x, tennisBall.coords.y, this.playerLocation.x, this.playerLocation.y) < tennisBall.size) {
					projectileKilledPlayer = true;
				}

			},
			//the main method that makes the final boss work
			activateFinalBoss() {
				//we draw the final boss
				this.drawFinalBoss();
				//we keep checking if the final boss sees the player (if it does it will fire a homing tennis ball)
				this.seesPlayer();
				//we check if the player ran into the final boss(killing the player) or stomped on it(killing the final boss)
				this.killFinalBoss();
				//as long as their is one alive tennis ball...
				if (this.tennisBalls.length > 0) {
					//for each alive tennis ball...
					for (const tennisBall of this.tennisBalls) {
						//we updates its movement, 
						this.moveTennisBall(tennisBall);
						//we draw its new position,
						this.drawTennisBall(tennisBall);
						//and we check if its killed the player
						this.checkIfKilledPlayer(tennisBall);
						//we then increment its timeAlive (this gets +60 per second as its 60 fps)
						tennisBall.timeAlive++;
					}
					//we then re aim are homing tennis balls onto the players location
					this.aimHomingTennisBall();
					//and we check if a tennis ball killed the player
					this.killHomingTennisBall();
				}
			}
		}
	}

}
