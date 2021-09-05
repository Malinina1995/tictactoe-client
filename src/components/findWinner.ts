import { GameSymbol } from './GameSymbol';
import { winPosition } from "./winPosition";

export function findWinner(squares: Array<GameSymbol>, refreshHistory: (winner: GameSymbol) => void): GameSymbol {

    for (let i = 0; i < winPosition.length; i++) {
        const [a, b, c] = winPosition[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            refreshHistory(squares[a]);
            return squares[a]
        }
    }

    if (squares.every(value => value)) {
        refreshHistory(null);
    }
    return null;
}
