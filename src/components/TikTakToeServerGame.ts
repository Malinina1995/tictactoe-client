import {GameSocket} from "./game-socket";
import {AbstractTicTacToeGame} from "./TicTacToeGame";
import {GameSymbol} from "./GameSymbol";
import {GameResult} from "./GameResult";

export class TikTakToeServerGame extends AbstractTicTacToeGame {

    constructor(private gameSocket: GameSocket) {
        super();
        gameSocket.start();
        gameSocket.subscribeOnFieldChange((squares: GameSymbol[]): void => {
            this.notifyFieldChange(squares);
        });
        gameSocket.subscribeOnFinishGame((winner: GameResult): void => {
            this.notifyResult(winner);
        });
    }

    start(): void {
        this.gameSocket.startNewGame();
    }

    setStep(index: number): void {
        this.gameSocket.sendStep(index);
    }
}
