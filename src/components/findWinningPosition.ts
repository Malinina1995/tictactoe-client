import { GameSymbol } from "./GameSymbol";
import { GameRole } from "./GameRole";
import { winningPosition } from "./winningPosition";

export function findWinningPosition(role: GameRole, squares: GameSymbol[]): number {
  const mark = role === "user" ? "X" : "O"
  for (let i = 0; i < winningPosition.length; i++) {
    const [a, b, c] = winningPosition[i];
    if (squares[a]=== mark && squares[b] === mark) {
      if(!squares[c]){
        return c;
      } else {
        continue;
      }
    }
  }
  return -1;
}
