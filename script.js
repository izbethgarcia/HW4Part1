const board = document.getElementById("gameBoard");
const movesText = document.getElementById("moves");
const timeText = document.getElementById("time");
const message = document.getElementById("message");
const difficulty = document.getElementById("difficulty");
const restart = document.getElementById("restart");
const globalMovesText = document.getElementById("globalMoves");


const GAME_KEY = "memoryGameState";         
const GLOBAL_MOVES_KEY = "memoryGlobalMoves"; 

let cards = [];
let firstCard = null;
let secondCard = null;
let moves = 0;
let matches = 0;
let time = 0;
let timer;
let lockBoard = false; 


function saveGameState() {
  const state = {
    cards,
    moves,
    matches,
    time,
    difficulty: difficulty.value
  };
  sessionStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function loadGameState() {
  const saved = sessionStorage.getItem(GAME_KEY);
  return saved ? JSON.parse(saved) : null;
}



function updateGlobalMovesDisplay() {
  const total = Number(localStorage.getItem(GLOBAL_MOVES_KEY) || 0);
  globalMovesText.textContent = total;
}

function addGlobalMove() {
  const total = Number(localStorage.getItem(GLOBAL_MOVES_KEY) || 0) + 1;
  localStorage.setItem(GLOBAL_MOVES_KEY, total);
  globalMovesText.textContent = total;
}


window.addEventListener("storage", (event) => {
  if (event.key === GLOBAL_MOVES_KEY) {
    updateGlobalMovesDisplay();
  }
});


function createCards(pairCount) {
  const symbols = ["❤️","💖","💘","💕","💝","🌹","😍","😘","💌","🥰","💞","😻"];
  const chosen = symbols.slice(0, pairCount);

  return chosen.concat(chosen).map(symbol => ({
    symbol,
    matched: false,
    flipped: false
  })).sort(() => Math.random() - 0.5);
}


function drawBoard(columns) {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${columns}, 80px)`;

  for (let i = 0; i < cards.length; i++) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.dataset.index = i;
    cardDiv.addEventListener("click", flip);


    if (cards[i].flipped || cards[i].matched) {
      cardDiv.textContent = cards[i].symbol;
      cardDiv.classList.add("flipped");
    }
    if (cards[i].matched) cardDiv.classList.add("matched");

    board.appendChild(cardDiv);
  }
}


function flip(event) {
  const index = event.target.dataset.index;
  const card = cards[index];

  if (lockBoard || card.flipped || card.matched) return;
  if (firstCard && firstCard.index == index) return;

  card.flipped = true;
  event.target.textContent = card.symbol;
  event.target.classList.add("flipped");

  if (!firstCard) {
    firstCard = { card, element: event.target, index };
    saveGameState();
  } else {
    secondCard = { card, element: event.target, index };
    moves++;
    movesText.textContent = moves;
    addGlobalMove();
    lockBoard = true;
    saveGameState();
    checkMatch();
  }
}


function checkMatch() {
  if (firstCard.card.symbol === secondCard.card.symbol) {
    firstCard.card.matched = true;
    secondCard.card.matched = true;
    firstCard.element.classList.add("matched");
    secondCard.element.classList.add("matched");
    matches++;
    resetTurn();
    lockBoard = false;
    saveGameState();
    if (matches === cards.length / 2) endGame();
  } else {
    setTimeout(() => {
      firstCard.card.flipped = false;
      secondCard.card.flipped = false;
      firstCard.element.textContent = "";
      secondCard.element.textContent = "";
      firstCard.element.classList.remove("flipped");
      secondCard.element.classList.remove("flipped");
      resetTurn();
      lockBoard = false;
      saveGameState();
    }, 1000);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
}


function startTimer() {
  clearInterval(timer);
  timeText.textContent = time;

  timer = setInterval(() => {
    time++;
    timeText.textContent = time;
    saveGameState();
  }, 1000);
}


function endGame() {
  clearInterval(timer);
  message.textContent = "🎉 Game Over!";
  saveGameState();
}


function startGame(forceNew = false) {
  message.textContent = "";
  updateGlobalMovesDisplay();


  if (!forceNew) {
    const saved = loadGameState();
    if (saved) {
      cards = saved.cards;
      moves = saved.moves;
      matches = saved.matches;
      time = saved.time;
      difficulty.value = saved.difficulty;

      movesText.textContent = moves;
      timeText.textContent = time;

      let columns = 4;
      if (difficulty.value === "medium") columns = 5;
      if (difficulty.value === "hard") columns = 6;

      drawBoard(columns);
      startTimer();
      return;
    }
  }


  moves = 0;
  matches = 0;
  time = 0;
  lockBoard = false;
  resetTurn();
  movesText.textContent = 0;

  let pairs = 8;
  let columns = 4;
  if (difficulty.value === "medium") { pairs = 10; columns = 5; }
  if (difficulty.value === "hard") { pairs = 12; columns = 6; }

  cards = createCards(pairs);
  drawBoard(columns);
  saveGameState();
  startTimer();
}


restart.addEventListener("click", () => startGame(true));
difficulty.addEventListener("change", () => startGame(true));


startGame();

