import React, { useState } from 'react';
import './css/player.css';
import { store } from '../store';


export function Player(props) {
    const [activePlayer, updateActivePlayer] = useState(store.getState().currentActivePlayer);
    const playerNr = props.playerNr;
    let backgroundColor = 'white';

    if (activePlayer === playerNr) {
        backgroundColor = '#575757';
    }

    store.subscribe( () => {
        updateActivePlayer(store.getState().currentActivePlayer);
    })

    return (
        <div className="player"> <span style={{backgroundColor}}>Player {playerNr}</span> </div>
    )
}
