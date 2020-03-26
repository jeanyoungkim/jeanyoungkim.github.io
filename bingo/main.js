const board = document.querySelector(".board");
const numTiles = 25;
const numColumns = 5;
const indexArray = [...Array(numTiles).keys()];
const freeIndex = 12;

const columnInfo = [
  { label: "B", min: 1, max: 15 },
  { label: "I", min: 16, max: 30 },
  { label: "N", min: 31, max: 45 },
  { label: "G", min: 46, max: 60 },
  { label: "O", min: 61, max: 75 }
];

const renderBoard = () => {
  indexArray.forEach(i => {
    const tileContent = `<input class="tile-input" type="checkbox" id="${i}" name="" value=""><label for="" class="tile-contents"></label>`;
    const tile = document.createElement("div");
    tile.classList.add("tile");
    if (i === freeIndex) tile.classList.add("free");
    tile.innerHTML = tileContent;
    board.appendChild(tile);
  });
};

renderBoard();

const getRandomNumberBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateNumbers = () => {
  const tiles = document.querySelectorAll(".tile-contents");
  const tileInputs = document.querySelectorAll(".tile-input");
  indexArray.forEach(i => {
    const columnNumber = i % 5;
    const { min, max } = columnInfo[columnNumber];
    const tileContent =
      i === freeIndex ? "free" : getRandomNumberBetween(min, max);
    tileInputs[i].name = tileContent;
    tileInputs[i].value = tileContent;
    tiles[i].htmlFor = tileContent;
    tiles[i].innerText = tileContent;
  });
};

generateNumbers();
