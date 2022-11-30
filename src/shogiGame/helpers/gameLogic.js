const pieceUpgradeMap = { pawn:'promotedPawn', silverGeneral:'promitedSilverGeneral', rook:'promotedRook', bishop:'promotedBishop', knight:'promotedKnight', lance:'promotedLance' };

export const defaultBoardState = [
    [{p:2, piece:'lance', state:null}, {p:2, piece:'knight', state:null}, {p:2, piece:'silverGeneral', state:null}, {p:2, piece:'goldGeneral', state:null}, {p:2, piece:'king', state:null}, {p:2, piece:'goldGeneral', state:null}, {p:2, piece:'silverGeneral', state:null}, {p:2, piece:'knight', state:null}, {p:2, piece:'lance', state:null}],
    [null, {p:2, piece:'rook', state:null}, null, null, null, null, null, {p:2, piece:'bishop', state:null}, null],
    [{p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}, {p:2, piece:'pawn', state:null}],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    [{p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}, {p:1, piece:'pawn', state:null}],
    [null, {p:1, piece:'bishop', state:null}, null, null, null, null, null, {p:1, piece:'rook', state:null}, null],
    [{p:1, piece:'lance', state:null}, {p:1, piece:'knight', state:null}, {p:1, piece:'silverGeneral', state:null}, {p:1, piece:'goldGeneral', state:null}, {p:1, piece:'king', state:null}, {p:1, piece:'goldGeneral', state:null}, {p:1, piece:'silverGeneral', state:null}, {p:1, piece:'knight', state:null}, {p:1, piece:'lance', state:null}]
];

export function calcStep(cellKey, currentActivePlayer, boardState){
    const v = Number(cellKey[0])    // coordinate order implementation -> vertical horizontal
    const h = Number(cellKey[2])

    const newBoardState = Object.assign({}, boardState);   // new object required in order to change the component state

    if (boardState.phase === 'active') {   // active phase logic
        if (boardState.board[v][h] === null || boardState.board[v][h].p !== currentActivePlayer) {
            return  { newBoardState:boardState, stepSuccess:false }   // original board retunred -> component won't be rerendered
        }

        const possibleMoves = calcPossibleMoves(v, h, newBoardState.board);

        for(let i of possibleMoves){
            const cellToStep = newBoardState.board[v+i[0]] && newBoardState.board[v+i[0]][h+i[1]];

            if (cellToStep === undefined) {   // ignoring off table moves
                continue;
            }

            if (cellToStep === null) {
                newBoardState.board[v+i[0]][h+i[1]] = {state:'step'};
                continue;
            }

            if (cellToStep.p !== newBoardState.board[v][h].p) {
                newBoardState.board[v+i[0]][h+i[1]].state = 'kill';
            }
        }

        newBoardState.board[v][h].state = 'selected';
        newBoardState.phase = 'moving';
        newBoardState.msgStatus = { moveOk:true, winner:false };

        return { newBoardState, stepSuccess:false };
    }

    if (boardState.phase === 'moving') {   // moving phase logic
        if (newBoardState.board[v][h] !== null && newBoardState.board[v][h].state === 'selected') {   // clicking on selected piece is an ok move
            return { newBoardState:resetBoardToActive(newBoardState), stepSuccess:false };
        }

        if (newBoardState.board[v][h] === null || !['step', 'kill'].includes(newBoardState.board[v][h].state)) {    // not an ok move
            newBoardState.msgStatus.moveOk = false;
            return { newBoardState:resetBoardToActive(newBoardState), stepSuccess:false };     // reset board to active phase if not stepped on possible move cell
        }

        const { selected } = getSelectedCell(newBoardState);  // making the step
        newBoardState.board[selected.v][selected.h] = null;
        selected.val.state = null;
        newBoardState.board[v][h] = selected.val;
        const upgradePiece = pieceShouldUpgrade(newBoardState, v, h);    // upgrade if possible after the step

        if (upgradePiece) {
            newBoardState.board[v][h].piece = upgradePiece;
        }

        updateWinner(newBoardState)         // update winner after the step
        return { newBoardState:resetBoardToActive(newBoardState), stepSuccess:true };
    }
}

function calcPossibleMoves(v, h, board){
    const player = board[v][h].p;
    const piece = board[v][h].piece;

    switch (piece) {
        case 'pawn': case 'promotedPawn':
            return pawnMoves(player, piece);
        case 'silverGeneral': case 'promitedSilverGeneral':
            return silverGeneralMoves(player, piece);
        case 'rook': case 'promotedRook':
            return rookMoves(player, piece, board, v, h);
        case 'bishop': case 'promotedBishop':
            return bishopMoves(player, piece, board, v, h);
        case 'knight': case 'promotedKnight':
            return knightMoves(player, piece);
        case 'lance': case 'promotedLance':
            return lanceMoves(player, piece, board, v, h);
        case 'goldGeneral':
            return goldGeneralMoves(player);
        case 'king':
            return kingMoves();
        default:
            return null;
    }
}

function pawnMoves(player, piece) {
    const possibleMoves = [[-1, 0]];

    if (piece === 'promotedPawn') {
        possibleMoves.push([-1, 1], [0, 1], [1, 0], [0, -1], [-1, -1]);
    }
    if (player === 1) {
        return possibleMoves;
    }

    return inverseMoves(possibleMoves);
}

function silverGeneralMoves(player, piece) {
    let possibleMoves = [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 1]];

    if (piece === 'promitedSilverGeneral') {
        possibleMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]];
    }
    if (player === 1) {
        return possibleMoves;
    }

    return inverseMoves(possibleMoves);
}

function goldGeneralMoves(player) {
    const possibleMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]];

    if (player === 1) {
        return possibleMoves;
    }

    return inverseMoves(possibleMoves);
}

function knightMoves(player, piece) {
    let possibleMoves = [[-2, -1], [-2, 1]];

    if (piece === 'promotedKnight') {
        possibleMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]];
    }
    if (player === 1) {
        return possibleMoves;
    }

    return inverseMoves(possibleMoves);
}

function lanceMoves(player, piece, board, v, h) {
    let possibleMoves = [
        [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0], [-8, -8]]
    ];

    if (piece === 'promotedLance') {
        possibleMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0]];
        if (player === 1) {
            return  possibleMoves;
        }

    return inverseMoves(possibleMoves);
    }
    if (player === 1) {
        return calcPossibleContinousMoves(v, h, possibleMoves, board);
    }

    return calcPossibleContinousMoves(v, h,[inverseMoves(possibleMoves[0])], board);
}

function rookMoves(player, piece, board, v, h) {
    let possibleMoves = [
        [[-1, 0], [-2, 0], [-3, 0], [-4, 0], [-5, 0], [-6, 0], [-7, 0], [-8, 0]],
        [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0]],
        [[0, -1], [0, -2], [0, -3], [0, -4], [0, -5], [0, -6], [0, -7], [0, -8]],
        [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8]]
        
    ];

    if (piece === 'promotedRook') {
        possibleMoves = calcPossibleContinousMoves(v, h, possibleMoves, board)
        possibleMoves.push([-1, -1], [-1, 1], [1, 1], [1, -1])
        return possibleMoves
    }

    return calcPossibleContinousMoves(v, h, possibleMoves, board);
}

function bishopMoves(player, piece, board, v, h) {
    let possibleMoves = [
        [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7], [-8, -8]],
        [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8]],
        [[-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-7, 7], [-8, 8]],
        [[1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [7, -7], [8, -8]]
    ];

    if (piece === 'promotedBishop') {
        possibleMoves = calcPossibleContinousMoves(v, h, possibleMoves, board)
        possibleMoves.push([-1, 0], [0, 1], [1, 0], [0, -1])
        return possibleMoves
    }

    return calcPossibleContinousMoves(v, h, possibleMoves, board);
}

function kingMoves(){
    return [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]];
}

function inverseMoves(moves) {   // inverses possible moves for player 2
    for (const element of moves) {
        for (let i = 0; i < 2; i++) {
            if (element[i] === 0) {
                continue;
            }
            element[i] = -element[i];
        }
    }

    return moves
}

function calcPossibleContinousMoves(v, h, moves, board) {
    const possibleContinousMoves = [];

    for (let i of moves) {
        for(let k of i) {
            possibleContinousMoves.push([k[0], k[1]])
            if (board[v+k[0]] === undefined || board[v+k[0]][h+k[1]] === undefined ||
                (board[v+k[0]][h+k[1]] !== null && board[v+k[0]][h+k[1]] !== undefined && 
                board[v+k[0]][h+k[1]].state === null)) {
                break;
            }
        }
    }

    return possibleContinousMoves;
}

function resetBoardToActive(board) {
    board.phase = 'active';

    for (const element of board.board) {
        for (let i = 0; i < element.length; i++) {
            if (element[i] === null ) {
                continue;
            }
            if (element[i].p === undefined) {
                element[i] = null;
                continue;
            }
            element[i].state = null;
        }
    }

    return board;
}

function getSelectedCell(board) {
    for (let i = 0; i < board.board.length; i++) {
        for (let k = 0; k < board.board[i].length; k++) {
            if (board.board[i][k] === null) {
                continue;
            }

            if (board.board[i][k].state === 'selected') {
                return { selected:{v:i, h:k, val:board.board[i][k]} };
            }
        }
    }
}

function updateWinner(boardStatus) {
    let p1Pieces = 0;
    let p2Pieces = 0;

    for(const i of boardStatus.board) {
        for(const cell of i) {
            if (cell === null) {
                continue;
            }
            if (cell.p === 1) {
                p1Pieces++;
            } else if (cell.p === 2) {
                p2Pieces++;
            }
        }
    }

    if (p1Pieces <= 0) {
        boardStatus.msgStatus.winner = 2;
    } else if (p2Pieces <= 0) {
        boardStatus.msgStatus.winner = 1;
    } else {
        boardStatus.msgStatus.winner = false;
    }
}

function pieceShouldUpgrade(board, v, h) {
    const player = board.board[v][h].p;
    const piece = board.board[v][h].piece;

    if (!(piece in pieceUpgradeMap)) {
        return false;
    }
    if (player === 1 && v < 3) {
        return pieceUpgradeMap[piece];
    }
    if (player === 2 && v > 5) {
        return pieceUpgradeMap[piece];
    }

    return false
}
