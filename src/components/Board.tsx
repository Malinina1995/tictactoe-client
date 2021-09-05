import React, {Component} from "react";
import {Square} from "./Square";
import {GameSymbol} from "./GameSymbol";

type BoardProps = {
    squares: Array<GameSymbol>;
    onClick: (i: number) => void;
}

export class Board extends Component<BoardProps> {
    private squares: number[][] = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

    renderSquare(i: number) {
        return (
            <Square
                value={this.props.squares[i]}
                key={i}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div className='marginTop'>
                {this.squares.map((square) =>
                    <div className='flexSquares' key={square.toString()}>
                        {
                            square.map((box) => this.renderSquare(box))
                        }
                    </div>
                )}
            </div>
        );
    }
}
