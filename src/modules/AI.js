import { gameBoard, createContainsObject,updateBoardContents } from "./gameboard"

export const AIObj = class {
    constructor(gameState=new gameBoard('new game'),triangulation=false,phase=0, hit=null){
        this.gameState = gameState,
        this.triangulation = triangulation,
        this.phase = phase,
        this.hit = hit
    }
}

const _fireMissile = function(key, currentBoard){
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

const _generatePseudoRandomKey = function(){
    const columns = ['A','B','C','D','E','F']
    const rows = ['1','2','3','4','5','6']
    let columnIndex = Math.floor(Math.random() * columns.length) 
    let rowIndex = Math.floor(Math.random() * rows.length)
    return `${columns[columnIndex]}${rows[rowIndex]}`
}
console.log(_generatePseudoRandomKey())

export const AIReact = function(){
    return
}