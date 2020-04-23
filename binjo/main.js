const board = document.querySelector(".board");
const numTiles = 25;
const numColumns = 5;
const indexArray = [...Array(numTiles).keys()];
const freeIndex = 12;
let selectedIndices = [];
let tiles;

const columnInfo = [
  { label: "B", min: 1, max: 15 },
  { label: "I", min: 16, max: 30 },
  { label: "N", min: 31, max: 45 },
  { label: "G", min: 46, max: 60 },
  { label: "O", min: 61, max: 75 },
];

const winningCombinations = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

const numNameMap = {
  1: "Jan",
  5: "Bella",
  8: "Livy",
  12: "John",
  16: "Paula",
  23: "Molly",
  28: "Conor",
  31: "Stacy",
  36: "Abby",
  40: "Rory",
  46: "Esme",
  50: "Barrett",
  55: "Liz",
  61: "Juniper",
  70: "Ryan",
  75: "Tess",
};

const renderBoard = () => {
  indexArray.forEach((i) => {
    const tileMarkup = `<input class="tile-input" type="checkbox" id="${i}" name="" value=""><span class="checkbox"></span><label for="" class="tile-contents"></label>`;
    const tile = document.createElement("div");
    tile.classList.add("tile");
    if (i === freeIndex) tile.classList.add("free");
    tile.innerHTML = tileMarkup;
    board.appendChild(tile);
  });
  tiles = document.querySelectorAll(".tile");
};

const addEventListeners = () => {
  tiles.forEach((tile) => {
    tile.addEventListener("change", (e) => {
      const changedTile = e.target;
      const id = parseInt(changedTile.id);
      if (changedTile.checked) {
        selectedIndices.push(id);
      } else {
        console.log("nuuu remove", selectedIndices, id);
        selectedIndices = selectedIndices.filter((i) => i !== id);
      }
      console.log(selectedIndices);
    });
  });
};

const getRandomNumberBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateNumbers = () => {
  const tileContents = document.querySelectorAll(".tile-contents");
  const tileInputs = document.querySelectorAll(".tile-input");

  indexArray.forEach((i) => {
    const columnNumber = i % 5;
    const { min, max } = columnInfo[columnNumber];
    const randomNum = getRandomNumberBetween(min, max);
    const name = numNameMap[randomNum];
    const tileContent = i === freeIndex ? "free" : name || randomNum;
    if (name) {
      tiles[i].classList.add("responsive-font");
    }
    tileInputs[i].name = tileContent;
    tileInputs[i].value = tileContent;
    tileContents[i].htmlFor = tileContent;
    tileContents[i].innerText = tileContent;
  });
};

const init = () => {
  renderBoard();
  addEventListeners();
  generateNumbers();
};

init();
