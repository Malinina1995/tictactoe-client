import {GameResult} from "./GameResult";
import {GameSymbol} from "./GameSymbol";

export type FieldChangeHandler = (squares: GameSymbol[]) => void;
export type ResultHandler = (winner: GameResult) => void;

export abstract class AbstractTicTacToeGame implements TicTacToeGame {
    private fieldChangeHandler?: FieldChangeHandler;
    private resultHandler?: ResultHandler;

    protected notifyFieldChange(squares: GameSymbol[]): void {
        this.fieldChangeHandler && this.fieldChangeHandler(squares);
    }

    protected notifyResult(winner: GameResult): void {
        this.resultHandler && this.resultHandler(winner);
    }

    subscribeOnFieldChange(handler: FieldChangeHandler): void {
        this.fieldChangeHandler = handler;
    }

    subscribeOnGameFinish(handler: ResultHandler): void {
        this.resultHandler = handler;
    }

    abstract setStep(index: number): void;
    abstract start(): void;
}

export interface TicTacToeGame {
    start(): void;
    setStep(index: number): void;
    subscribeOnFieldChange(handler: FieldChangeHandler): void;
    subscribeOnGameFinish(handler: ResultHandler): void;
}
