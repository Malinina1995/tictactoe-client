import {GameSymbol} from "./GameSymbol";

export function getRandomPosition(squares: GameSymbol[]): number {
  if (!squares.some(v => !v))
    throw new Error('No way');

  let maxIter = 10_000;
  do {
    maxIter--;
    const position = randomSquares();
    if (!squares[position]) {
      return position;
    }
  } while (maxIter);

  throw new Error('Pizdec');
}

function randomSquares(): number {
  return Math.round(Math.random() * 8);
}
