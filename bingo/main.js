const board = document.querySelector(".board");
const numTiles = 25;

const generateBoard = () => {
  let tiles = "";
  [...Array(numTiles).keys()].map(i => {
    const tileMarkup = `<div class="tile"><p data-index="${i}" class="tile-contents"></p></div>`;
    tiles += tileMarkup;
    return tiles;
  });
  board.innerHTML = tiles;
};

generateBoard();
