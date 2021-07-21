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
    play: string;
    history: string[];
    winUser: number;
    winComputer: number;
    game?: TicTacToeGame
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
        let game: TicTacToeGame;
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
            game = new TikTakToeServerGame(new GameSocket());
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
        this.setState({
            game
        }, () => game.start());
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
        this.state.game?.setStep(i);
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
