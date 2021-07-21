import React from 'react';
import Swal from "sweetalert2";
import {findWinner} from "./findWinner";
import {findWinningPosition} from "./findWinningPosition";
import {getRandomPosition} from "./getRandomPosition";
import {Autorenew} from "@material-ui/icons";
import {AppBar, IconButton, Toolbar, Typography} from "@material-ui/core";
import {Board} from "./Board";
import {GameSymbol} from "./GameSymbol";
import {GameRole} from "./GameRole";
import {GameSocket} from "./game-socket";
import { GameType } from './GameType';
import {GameResult} from "./GameResult";

type GameState = {
    squares: GameSymbol[];
    play: string;
    history: string[];
    winUser: number;
    winComputer: number;
}

type FieldChangeHandler = (squares: GameSymbol[]) => void;
type ResultHandler = (winner: GameResult) => void;

interface TicTacToeGame {
    setStep(index: number): void;
    subscribeOnFieldChange(handler: FieldChangeHandler): void;
    subscribeOnGameFinish(handler: (winner: GameResult) => void): void;
}

class TikTakToeServerGame implements TicTacToeGame {
    constructor(private gameSocket: GameSocket) {
        gameSocket.start();
    }

    setStep(index: number): void {

    }

    subscribeOnFieldChange(handler: (squares: GameSymbol[]) => void): void {

    }

    subscribeOnGameFinish(handler: (winner: GameResult) => void): void {
    }
}

class TikTakToeClientGame implements TicTacToeGame {
    private squares: GameSymbol[] = Array(9).fill(null);
    private fieldChangeHandler?: FieldChangeHandler;
    private resultHandler?: ResultHandler;

    constructor(whoFirst: GameRole) {
        if (whoFirst === 'computer') {
            this.computerStep();
        }
    }

    private computerStep(): void {
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
        this.notifyFieldChange();

        this.checkWinner();
    }

    setStep(index: number): void {
        const squares = this.squares.slice();
        const winner = this.checkWinner();
        if (winner || squares[index]) {
            return;
        }
        squares[index] = "X";
        this.squares = squares;
        this.notifyFieldChange();

        this.checkWinner();
    }

    private checkWinner(): GameSymbol {
        return findWinner(this.squares, (win) => {
            switch (win) {
                case "X":
                    this.notifyResult('user_1');
                    break;
                case "O":
                    this.notifyResult('user_2');
                    break;
                default:
                    this.notifyResult('standoff');
                    break;
            }
        });
    }

    private notifyFieldChange(): void {
        this.fieldChangeHandler && this.fieldChangeHandler(this.squares);
    }

    private notifyResult(winner: GameResult): void {
        this.resultHandler && this.resultHandler(winner);
    }

    subscribeOnFieldChange(handler: FieldChangeHandler): void {
        this.fieldChangeHandler = handler;
        this.notifyFieldChange();
    }

    subscribeOnGameFinish(handler: ResultHandler): void {
        this.resultHandler = handler;
    }
}

export class Game extends React.Component<unknown, GameState> {
    constructor(props: unknown) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            play: "",
            history: [],
            winUser: 0,
            winComputer: 0,
        };
    }

    componentDidMount() {
        this.setState({
            play: "play #" + Math.round(Math.random() * 1000)
        });
        this.startNewGameHandler();
    }

    startNewGameHandler = async () => {
        //this.checkWinner();
        this.setState({
            play: "Play № " + Math.round(Math.random() * 1000),
            squares: Array(9).fill(null)
        });
        const type = await this.alertSelectWindow<GameType>({
            networkGame: "Сетевая игра",
            localGame: "Локальная игра"
        }, 'Выберите тип игры:');
        if (type === "networkGame") {
            new TikTakToeServerGame(new GameSocket());
        } else {
            const role = await this.alertSelectWindow<GameRole>({
                computer: 'Компьютер',
                user: 'Пользователь'
            }, 'Кто будет ходить первый?');
            if (role === "computer") {
                this.computerStep(this.state);
            }
        }
    };

    async alertSelectWindow<T>(resolvedParams: unknown, text: string): Promise<T|null> {
        const inputOptions = new Promise(resolve => {
            setTimeout(() => {
                resolve(resolvedParams);
            }, 0);
        });

        const {value: type} = await Swal.fire({
            title: text,
            input: "radio",
            inputOptions: inputOptions,
            inputValidator: value => {
                if (!value) {
                    return "You need to choose something!";
                }
                return null;
            }
        });

        if (!type) {
            return Promise.resolve(null);
        }

        return type;
    }

    computerStep(state: GameState): void {
        const squares = state.squares.slice();
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

        this.setState({
            squares: squares
        }, () => this.checkWinner());
    }

    handleClick(i: number): void {
        const squares = this.state.squares.slice();
        const winner = this.checkWinner();
        if (winner || squares[i]) {
            return;
        }
        squares[i] = "X";
        this.setState(
            {
                squares: squares
            },
            () => {
                if (!this.checkWinner() && this.stepExists()) {
                    this.computerStep(this.state);
                }
            }
        );
    }

    checkWinner() {
        return findWinner(this.state.squares, (win) => this.refreshHistory(win));
    }

    stepExists(): boolean {
        return this.state.squares.some(v => !v);
    }

    refreshHistory(winner: GameSymbol): void {
        let allHistory = this.state.history.slice();
        if (winner) {
            const whoIsWinner: GameRole = winner === 'X' ? 'user' : 'computer';
            allHistory.unshift(this.state.play + " winner: " + whoIsWinner);
            if (winner === "X") {
                this.setState({
                    winUser: this.state.winUser + 1
                });
            } else {
                this.setState({
                    winComputer: this.state.winComputer + 1
                });
            }
            this.setState({
                history: allHistory
            });
        } else {
            allHistory.unshift('standoff');
            this.setState({
                history: allHistory
            });
        }
    }

    render() {
        return (
            <div>
                <AppBar position="static">
                    <Toolbar className='flexToolbar'>
                        <div className="flexToolbar-wrapper">
                            <Typography variant="h6">
                                {this.state.play}
                            </Typography>
                            <IconButton onClick={this.startNewGameHandler}>
                                <Autorenew className='buttonStyle'/>
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <div className='fontStyle'>
                    <h1>Итоговый счет</h1>
                    <div className='countStyle'>User: {this.state.winUser} Computer:{this.state.winComputer}</div>
                </div>
                <Board
                    squares={this.state.squares}
                    onClick={i => this.handleClick(i)}
                />
                <div>
                    <h3>История игр</h3>
                    <div className='history'>
                        {this.state.history.map(h => {
                            return <div className='partHistory' key={Math.random() * 10000}>{h}</div>;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
