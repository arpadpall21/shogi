import React from 'react';
import './css/main.css'
import { Board } from './board'
import { Player } from './player'

export function ShogiGame(prop) {
    return (
        <div className="gameContainer">
            <Player playerNr={1}/>
            <Board />
            <Player playerNr={2}/>
        </div>
    )
}
