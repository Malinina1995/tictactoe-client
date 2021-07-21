export function getRandomPosition(squares) {
  for (let i = 0; i < squares.length; i++) {
    const position = randomSquares();
    if (!squares[position]) {
      return position;
    } else {
      continue;
    }
  }
}

function randomSquares() {
  return Math.round(Math.random() * 8);
}
