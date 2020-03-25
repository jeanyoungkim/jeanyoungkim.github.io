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

// The columns are labeled "B" (numbers 1–15), "I" (numbers 16–30), "N" (numbers 31–45), "G" (numbers 46–60), and "O" (numbers 61–75).[7]

const renderBoard = () => {
  indexArray.forEach(i => {
    const tileContent = `<p data-index="${i}" class="tile-contents"></p></div>`;
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
  indexArray.forEach(i => {
    const columnNumber = i % 5;
    const { min, max } = columnInfo[columnNumber];
    const tileContent =
      i === freeIndex ? "free" : getRandomNumberBetween(min, max);
    tiles[i].innerText = tileContent;
  });
};

generateNumbers();
