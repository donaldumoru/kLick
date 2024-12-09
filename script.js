'use strict';

let letterL = document.querySelector('.tilt-letter-l');
let playBtn = document.querySelector('.play-btn');
let landingPage = document.querySelector('.welcome-page');
let gameContainer = document.querySelector('.game-container');
document.body.classList.add('home-body');
letterL.style.transform = 'rotate(20deg)';
let landingAnimation;

let boxes = document.querySelectorAll('.box');
let pictureBox = document.querySelector('.picture-container');
let optionsContainer = document.querySelector('.options-wrapper');
let timeDisplay = document.querySelector('.timer');
let displayBoxesRevealed = document.querySelector('.boxes-revealed');
let displayChancesLeft = document.querySelector('.chances');
let answerOptionsArray = [];
let shuffleArray = [];
let count = 15;
let timeElapsed = 0;
let totalBoxes = 16;
let boxClicks = 0;
let chances = 2;
let maxTime = 15;
let maxTimePoints = 50;
let maxBoxPoints = 50;
let timeScore = 0;
let boxScore = 0;
let score = 0;
let timer;
let totalScore = 0;
let playAgainBtn = document.querySelector('.play-again-btn');

let playerTotalScoreArr = [];

const animateLetter = function () {
  gameContainer.style.display = 'none';
  landingAnimation = setInterval(function () {
    setInterval(function () {
      if (letterL.style.transform === 'rotate(20deg)') {
        letterL.style.transform = 'rotate(-20deg)';
      } else {
        letterL.style.transform = 'rotate(20deg)';
      }
    }, 1000);
  }, 2000);
};

animateLetter();

const playGame = function () {
  clearInterval(landingAnimation);
  landingPage.style.display = 'none';
  document.body.classList.add('game-body');
  document.body.classList.remove('home-body');
  gameContainer.style.display = 'flex';
};

playBtn.addEventListener('click', playGame);

// COUNTDOWN TIMER TO MANAGE GAME PLAY
const countdownTimer = function () {
  count = 15;
  timer = setInterval(function () {
    count--;

    if (count === 0) {
      // RESET COUNT BACK TO 10
      count = 15;
      generateRandomPlayerName('players.json').then(playerName => {
        getPlayerImage(playerName);
      });

      playerTotalScoreArr.push(0);

      // SET ALL BOXES BACK TO WHITE
      makeBoxesWhite();
      console.log(playerTotalScoreArr);
    } else {
      timeDisplay.textContent = `${count}`;
    }
  }, 1000);
};

countdownTimer();

// FUNCTION TO REMOVE WHITE BOX ON CLICK
const makeBoxesTransparent = function (boxes) {
  boxes.forEach(function (box) {
    box.addEventListener('click', function () {
      if (!box.classList.contains('transparent-box')) {
        box.classList.add('transparent-box');
        boxClicks++;
        displayBoxesRevealed.textContent = `${boxClicks}`;
      }
    });
  });
};
makeBoxesTransparent(boxes);

// FUNCTION TO MAKE ALL BOXES WHITE AGAIN
const makeBoxesWhite = function () {
  boxes.forEach(function (box) {
    if (box.classList.contains('transparent-box')) {
      box.classList.remove('transparent-box');
    }
  });
};

// FUNCTION TO RANDOMIZE ANY GIVEN ARRAY
const randomizeArray = function (arr) {
  const copyArr = [...arr];
  let currentIndex = copyArr.length;

  while (currentIndex !== 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // SWAP WITH CURRENT ELEMENT
    [copyArr[currentIndex], copyArr[randomIndex]] = [
      copyArr[randomIndex],
      copyArr[currentIndex],
    ];
  }

  return copyArr;
};

// FUNCTION TO GENERATE RANDOM NUMBERS
const generateRandomNumber = function (arr) {
  return Math.floor(Math.random() * arr.length);
};

// GENERATE RANDOM PLAYER NAME
const generateRandomPlayerName = function (list) {
  displayChancesLeft.textContent = `${chances}`;

  return fetch(list)
    .then(response => response.json())
    .then(list => {
      let randomNumber = generateRandomNumber(list.footballers);
      let playerName = list.footballers[randomNumber];
      answerOptionsArray.push(playerName);

      // FILL UP THE ANSWERS OPTIONS ARRAY WITH RANDOM PLAYER NAMES BY PASSING HTML OPTIONS, OPTIONS ARRAY AND LIST OF PLAYER NAMES AS PARAMETERS
      fillUpOptions(answerOptionsArray, list);

      // RANDOMIZE OPTIONS BY PASSING ANSWER OPTIONS ARRAY AS A PARAMETER TO RANDOMIZE ARRAY
      shuffleArray = randomizeArray(answerOptionsArray);

      // POPULATE OPTIONS AND CALL FUNCTION TO CHECK IF PLAYER ANSWERED CORRECTLY
      checkCorrectAnswer(populateOptions(shuffleArray), playerName);

      if (playerName.includes(' ')) {
        console.log(playerName);
        return playerName.replaceAll(' ', '_');
      } else {
        console.log(playerName);
        return playerName;
      }
    })
    .catch(error => {
      console.error('Error fetching the player list:', error);
    });
};

// GET IMAGE BASED ON GENERATED RANDOM NAME
function getPlayerImage(name) {
  fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${name}`)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      //   console.log(data);
      //   console.log(data.player[0].strCutout);

      displayPicture(data);
    })
    .catch(error => console.error('Unable to fetch data:', error));
}

generateRandomPlayerName('players.json').then(playerName => {
  getPlayerImage(playerName);
});

// FUNCTION TO DISPLAY PICTURE FROM FETCHED DATA
const displayPicture = function (data) {
  const transformPositions = ['90deg', '180deg', '270deg', '0deg'];
  let positionToUse =
    transformPositions[generateRandomNumber(transformPositions)];

  pictureBox.style.backgroundImage = `url(${data.player[0].strCutout})`;
  pictureBox.style.transform = `rotate(${positionToUse})`;
};

// FUNCTION TO FILL UP THE OPTIONS ARRAY
const fillUpOptions = function (arr, list) {
  for (let i = 0; i < 4 - 1; i++) {
    arr.push(
      list.footballers[Math.floor(Math.random() * list.footballers.length)]
    );
  }
};

// FUNCTION TO POPULATE OPTIONS
const populateOptions = function (arr) {
  optionsContainer.innerHTML = '';

  let options = [];
  for (let i = 0; i < arr.length; i++) {
    let option = document.createElement('p');
    option.classList.add('option');
    option.textContent = arr[i];
    optionsContainer.appendChild(option);
    options.push(option);
  }

  return options;
};

const checkCorrectAnswer = function (options, correctName) {
  options.forEach(function (option) {
    option.addEventListener('click', function () {
      if (option.textContent === correctName) {
        console.log('correct');
        generateRandomPlayerName('players.json').then(playerName => {
          getPlayerImage(playerName);
        });

        timeElapsed = maxTime - count;
        makeBoxesWhite();

        score = calculateScores();

        if (playerTotalScoreArr.length === 5) {
          //   console.log(playerTotalScoreArr);

          for (let i = 0; i < playerTotalScoreArr.length; i++) {
            totalScore += playerTotalScoreArr[i];
          }

          console.log(`Your score is ${totalScore}`);
        }

        resetGameState();
      } else {
        chances--;

        displayChancesLeft.textContent = chances;
      }

      if (chances === 0) {
        for (let i = 0; i < playerTotalScoreArr.length; i++) {
          totalScore += playerTotalScoreArr[i];
        }

        console.log(`Game over. Your score is ${totalScore}`);
      }
    });

    shuffleArray = [];
    answerOptionsArray = [];
  });
};

const calculateScores = function () {
  // PASS PARAMETERS TO CALCULATE TIME AND BOX SCORE
  timeScore = calculateTimeSpent(timeElapsed, maxTime, maxTimePoints);
  boxScore = calculateBoxesRevealed(boxClicks, totalBoxes, maxBoxPoints);

  score = timeScore + boxScore;

  console.log(score);

  // SAVE SCORE TO ARRAY TO CALCULATE TOTAL SCORE
  playerTotalScoreArr.push(score);
  return score;
};

// FUNCTION TO CALCULATE TIME SCORE FOR EACH QUESTION
const calculateTimeSpent = function (timeSpent, maxTime, maxTimePoints) {
  return Math.floor(Math.round((1 - timeSpent / maxTime) * maxTimePoints));
};

// FUNCTION TO CALCULATE BOXES REVEALED SCORE ON EACH QUESTION
const calculateBoxesRevealed = function (
  boxesRevealed,
  totalBoxes,
  maxBoxPoints
) {
  return Math.floor(
    Math.round((1 - boxesRevealed / totalBoxes) * maxBoxPoints)
  );
};

const playAgain = function () {
  generateRandomPlayerName('players.json').then(playerName => {
    getPlayerImage(playerName);
  });

  resetGameState();
  playerTotalScoreArr = [];
  chances = 2;
};

// RESET GAME STATE
const resetGameState = function () {
  boxClicks = 0;
  timeElapsed = 0;
  count = 15;
  totalScore = 0;
  displayBoxesRevealed.textContent = boxClicks;
  displayChancesLeft.textContent = `${chances}`;
};

playAgainBtn.addEventListener('click', playAgain);
