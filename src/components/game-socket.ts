import {io, Socket} from "socket.io-client";
import {DefaultEventsMap} from "socket.io-client/build/typed-events";
import {FieldChangeHandler, ResultHandler} from "./TicTacToeGame";
import {GameSymbol} from "./GameSymbol";
import {GameResult} from "./GameResult";

type SetCodeHandler = (code: number) => void;
type ErrorHandler = (error: string) => void;

export class GameSocket {
    private socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
    private fieldChangeHandler?: FieldChangeHandler;
    private resultHandler?: ResultHandler;
    private setCodeHandler?: SetCodeHandler;
    private errorHandler?: ErrorHandler;

    constructor(private wsAddress: string = "ws://localhost:3001") {}

    start() {
        this.socket = io(this.wsAddress, {reconnection: false});
        this.socket.on('connect', () => {});
        this.socket.on('fieldChange', (squares: GameSymbol[]) => {
            this.fieldChangeHandler && this.fieldChangeHandler(squares);
        });
        this.socket.on('finishGame', (winner: GameResult) => {
            this.resultHandler && this.resultHandler(winner);
        });
        this.socket.on('setCode', (code: number) => {
            this.setCodeHandler && this.setCodeHandler(code);
        });
        this.socket.on('error', (error: string) => {
            this.errorHandler && this.errorHandler(error);
        });
    }

    startNewGame() {
        this.socket?.emit('startNewGame');
    }

    sendStep(index: number): void {
        this.socket?.emit('step', index);
    }

    subscribeOnFieldChange(handler: FieldChangeHandler) {
        this.fieldChangeHandler = handler;
    }

    subscribeOnFinishGame(handler: ResultHandler) {
        this.resultHandler = handler;
    }

    subscribeOnSetCode(handler: SetCodeHandler) {
        this.setCodeHandler = handler;
    }

    subscribeOnError(handler: ErrorHandler) {
        this.errorHandler = handler;
    }

    getCode(code: string) {
        this.socket?.emit('getCode', code);
    }

    createRoom(): void {
        this.socket?.emit('createRoom');
    }
}
