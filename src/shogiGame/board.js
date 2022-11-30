import React, { useState } from 'react';
import './css/board.css';
import { MessageBox } from './msgBox';
import { store, incrementMoves } from '../store';
import { defaultBoardState, calcStep } from './helpers/gameLogic';
import pieceCollection from './helpers/pieceCollection';


export function Board() {
    const [boardState, updateBoardState] = useState({board:defaultBoardState, phase:'active', msgStatus:{moveOk:true, winner:false}});
    const currentActivePlayer = store.getState().currentActivePlayer;
    const tableSize = Number.parseInt(((window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth) / 100 * 75), 10);

    function pieceMoveHandler(ev) {
        ev.preventDefault();

        const cellKey = ev.currentTarget.getAttribute('cellkey');
        const { newBoardState, stepSuccess } = calcStep(cellKey, currentActivePlayer, boardState);

        if (stepSuccess) {
            store.dispatch(incrementMoves());
        }

        updateBoardState(newBoardState);
    }

    let rowIdx = -1;
    return (
        <div className="boardContainer" style={{position:'relative'}}>
            {<MessageBox msgStatus={boardState.msgStatus} />}
            <table className='shogiBoard' style={{width:tableSize, height:tableSize}}>
                <tbody>
                {boardState.board.map( r => {
                    rowIdx++;
                    let cellIdx = -1;

                    return <tr key={rowIdx}>
                        {r.map( d => {
                            cellIdx++;
                            const cellId = `${rowIdx}-${cellIdx}`;

                            if (d) {
                                let backgroundColor = undefined;

                                if (d.state) {
                                    switch (d.state) {
                                        case 'selected':
                                            backgroundColor = '#575757';
                                            break;
                                        case 'step':
                                            backgroundColor = 'lightgreen';
                                            break;
                                        case 'kill':
                                            backgroundColor = 'orangeRed';
                                            break;
                                        default:
                                            backgroundColor = '#d69f74';
                                    }
                                }

                                let className = 'pieceImg';
                                if (d.p === 2) {
                                    className += ' rottatePieceImg';
                                }

                                return <td key={cellId} cellkey={cellId} style={{backgroundColor}} onClick={pieceMoveHandler}>
                                    <img className={className} draggable='false' src={pieceCollection[d.piece]} alt=''></img> 
                                </td>
                            }

                            return <td key={cellId} cellkey={cellId} onClick={pieceMoveHandler}> </td>
                        })}
                    </tr>
                })}
                </tbody>
            </table>
        </div>
    )
}