import React, { Component } from "react";
import { Square } from "./Square";
import {GameSymbol} from "./GameSymbol";

type BoardProps = {
    squares: Array<GameSymbol>;
    onClick: (i: number) => void;
}

export class Board extends Component<BoardProps> {
  renderSquare(i: number) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div className='marginTop'>
        <div className='flexSquares'>
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className='flexSquares'>
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className='flexSquares'>
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}
