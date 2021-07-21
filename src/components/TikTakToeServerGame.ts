import {GameSocket} from "./game-socket";
import {AbstractTicTacToeGame} from "./TicTacToeGame";

export class TikTakToeServerGame extends AbstractTicTacToeGame {
    constructor(private gameSocket: GameSocket) {
        super();
        gameSocket.start();
    }

    start(): void {
// новая игра
    }

    setStep(index: number): void {

    }
}
