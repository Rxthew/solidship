import { gameBoard, createContainsObject,updateBoardContents } from "./gameboard"

export const AIObj = class {
    constructor(gameState=new gameBoard('new game'),triangulation=false,phase=0, hit=null){
        this.gameState = gameState,
        this.triangulation = triangulation,
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

export const AIReact = function(){
    return
}