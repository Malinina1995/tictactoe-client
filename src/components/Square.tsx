import React from 'react';
import {GameSymbol} from "./GameSymbol";

type SquareProps = {
    onClick: () => void;
    value: GameSymbol
}

export const Square: React.FC<SquareProps> = (props) => {
    return (
        <button className='squares' onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}
