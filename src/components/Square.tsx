import React from 'react';

export function Square(props) {
    return (
        <button className='squares' onClick={() => props.onClick()}>
            {props.value}
        </button>
    );
}
