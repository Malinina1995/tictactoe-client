import {GameSymbol} from "./GameSymbol";
import {GameRole} from "./GameRole";
import {findWinningPosition} from "./findWinningPosition";
import {getRandomPosition} from "./getRandomPosition";
import {findWinner} from "./findWinner";
import {AbstractTicTacToeGame} from "./TicTacToeGame";

export class TikTakToeClientGame extends AbstractTicTacToeGame {
    private squares: GameSymbol[] = Array(9).fill(null);
    private gameWasFinish: boolean = false;

    constructor(private whoFirst: GameRole) {
        super();
    }

    start(): void {
        if (this.whoFirst === 'computer') {
            this.computerStep();
        }
    }

    private computerStep(): void {
        if (!this.gameWasFinish) {
            const squares = this.squares.slice();
            const compWinningPosition = findWinningPosition("user", squares);
            const userWinningPosition = findWinningPosition("computer", squares);

            let position;
            if (compWinningPosition === -1 && userWinningPosition === -1) {
                position = getRandomPosition(squares);
            } else if (userWinningPosition !== -1) {
                position = userWinningPosition;
            } else {
                position = compWinningPosition;
            }
            squares[position] = "O";
            this.squares = squares;
            this.notifyFieldChange(squares);

            this.checkWinner();
        }
    }

    setStep(index: number): void {
        const squares = this.squares.slice();
        let winner = this.checkWinner();
        if (winner || squares[index]) {
            return;
        }
        squares[index] = "X";
        this.squares = squares;
        this.notifyFieldChange(squares);

        winner = this.checkWinner();
        if (winner) {
            return;
        }
        this.computerStep();
    }

    private checkWinner(): GameSymbol {
        return findWinner(this.squares, (win) => {
            switch (win) {
                case "X":
                    this.gameWasFinish = true;
                    this.notifyResult('user_1');
                    break;
                case "O":
                    this.gameWasFinish = true;
                    this.notifyResult('user_2');
                    break;
                default:
                    this.gameWasFinish = true;
                    this.notifyResult('standoff');
                    break;
            }
        });
    }
}
