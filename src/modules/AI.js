import { gameBoard, createContainsObject,updateBoardContents } from "./gameboard"

export const AIObj = class {
    constructor(gameState=new gameBoard('new game'),mode='general',phase=null, hit=null){
        this.gameState = gameState,
        this.mode = mode,
        this.phase = phase,
        this.hit = hit
    }
}

export const fireMissile = function(key, currentBoard){
    let loc = currentBoard.board[key].contains
    if(loc === null){
        return currentBoard
    }
    let updatedValue = Object.assign(Object.create(Object.getPrototypeOf(loc)),loc)
    updatedValue.damage += 1;
    let vesselDamaged = new gameBoard('vessel hit')
    let containsObj = createContainsObject(currentBoard,key, updatedValue)
    vesselDamaged = updateBoardContents(vesselDamaged,containsObj)
    return vesselDamaged
}