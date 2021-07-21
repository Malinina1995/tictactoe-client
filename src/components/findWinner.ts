import { GameSymbol } from './GameSymbol';

export function findWinner(squares: Array<GameSymbol>, refreshHistory: (winner: GameSymbol) => void): GameSymbol {
    const win = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < win.length; i++) {
        const [a, b, c] = win[i];
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
