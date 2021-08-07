import React from 'react';
import Swal from "sweetalert2";
import {Autorenew} from "@material-ui/icons";
import {AppBar, IconButton, Toolbar, Typography} from "@material-ui/core";
import {Board} from "./Board";
import {GameSymbol} from "./GameSymbol";
import {GameRole} from "./GameRole";
import {GameSocket} from "./game-socket";
import {GameType} from './GameType';
import {TicTacToeGame} from "./TicTacToeGame";
import {TikTakToeServerGame} from "./TikTakToeServerGame";
import {TikTakToeClientGame} from "./TikTakToeClientGame";

type GameState = {
    squares: GameSymbol[];
    history: string[];
    winUser: number;
    winComputer: number;
    type?: GameType;
    game?: TicTacToeGame;
    gameWasFinish?: boolean;
    gameCode?: number;
    error?: string;
    creator?: boolean;
}

const gameSocket = new GameSocket('ws://192.168.10.18:3001');
const serverGame = new TikTakToeServerGame(gameSocket);

export class Game extends React.Component<unknown, GameState> {
    constructor(props: unknown) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            history: [],
            winUser: 0,
            winComputer: 0,
        };
    }

    componentDidMount() {
        gameSocket.subscribeOnSetCode((code: number) => {
            if (this.state.creator) {
                this.setState({
                    gameCode: code
                });
                Swal.fire(`Код для входа ${this.state.gameCode}, назовите его вашему сопернику`);
            }
        });
        gameSocket.subscribeOnError((error: string) => {
            if (this.state.creator === false) {
                this.setState({
                    error
                });
                Swal.fire({
                    icon: 'error',
                    title: error,
                    confirmButtonText: 'Ok'
                }).then(() => {
                    this.startNewGameHandler();
                });
            }
        });
        this.startNewGameHandler();
    }

    startNewGameHandler = async () => {
        let game: TicTacToeGame;
        //this.checkWinner();
        this.setState({
            squares: Array(9).fill(null),
            error: '',
            creator: undefined
        });
        const type = await this.alertSelectWindow<GameType>({
            networkGame: "Сетевая игра",
            localGame: "Локальная игра"
        }, 'Выберите тип игры:');
        if (type === "networkGame") {
            game = serverGame;
            const hasCode = await this.alertSelectWindow<string>({
                join: 'Присоединиться',
                create: 'Создать комнату'
            }, 'Вы хотите хотите присоединиться к игроку или создать новую комнату?');
            if (hasCode === 'join') {
                const { value: code } = await Swal.fire({
                    title: 'Введите код для входа в игровую комнату',
                    input: 'number',
                    showCancelButton: false,
                    inputValidator: (value): any => {
                        if (!value) {
                            return 'Введите код!'
                        }
                    }
                });
                this.setState({
                    creator: false
                });
                gameSocket.getCode(code);
            } else {
                this.setState({
                    creator: true
                });
                gameSocket.createRoom();
            }
        } else {
            const role = await this.alertSelectWindow<GameRole>({
                computer: 'Компьютер',
                user: 'Пользователь'
            }, 'Кто будет ходить первый?');
            if (!role) {
                return;
            }

            game = new TikTakToeClientGame(role);
        }
        game.subscribeOnFieldChange((squares): void => {
            this.setState({
                squares
            });
        });
        game.subscribeOnGameFinish((result): void => {
            switch (result) {
                case "user_1":
                    this.refreshHistory("X");
                    break;
                case "user_2":
                    this.refreshHistory("O");
                    break;
                case "standoff":
                    this.refreshHistory(null);
                    break;
            }
        });
        if (!this.state.error) {
            this.setState({
                game,
                type,
                winComputer: this.state.type !== type ? 0 : this.state.winComputer,
                winUser:  this.state.type !== type ? 0 : this.state.winUser,
                history: this.state.type !== type ? [] : this.state.history,
                gameWasFinish: false,
                error: ''
            }, () => game.start())
        }
    };

    async alertSelectWindow<T>(resolvedParams: unknown, text: string): Promise<T | null> {
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

    handleClick(i: number): void {
        if (!this.state.gameWasFinish) {
            this.state.game?.setStep(i);
        }
    }

    refreshHistory(winner: GameSymbol): void {
        let allHistory = this.state.history.slice();
        if (winner) {
            let whoIsWinner = winner === 'X' ? 'user' : 'computer';
            if (this.state.type === 'networkGame') {
                whoIsWinner = winner === 'X' ? 'X' : 'O';
            }
            allHistory.unshift("Winner: " + whoIsWinner);
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
                history: allHistory,
                gameWasFinish: true
            });
        } else {
            allHistory.unshift('standoff');
            this.setState({
                history: allHistory,
                gameWasFinish: true
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
                                TicTacToe
                            </Typography>
                            <IconButton onClick={this.startNewGameHandler}>
                                <Autorenew className='buttonStyle'/>
                            </IconButton>
                        </div>
                    </Toolbar>
                </AppBar>
                <div className='fontStyle'>
                    <h1>Итоговый счет</h1>
                    {
                        this.state.type &&
                        <div className='countStyle'>
                        {this.state.type === 'networkGame' ? 'User 1' : 'User'}: {this.state.winUser}
                        <span
                            className='countMargin'>{this.state.type === 'networkGame' ? 'User 2' : 'Computer'}: {this.state.winComputer}</span>
                        </div>
                    }
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
