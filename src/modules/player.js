import { gameBoard, defaultConfig, createContainsObject,updateBoardContents } from "./gameboard"


export const playerObj =  class {
    constructor(name,gameState=new gameBoard('new game')){
        this.name = name,
        this.gameState = gameState
    }
}


const _checkShipObject = function(ship){
    if (Object.is(ship,null)){
        return {error: 'Ship has missing properties'}
        }
    
    const properties = ['isSunk', 'damage', 'breakPoint','type']
    for (let property of properties){
        if(property in ship === false){
            return {error: 'Ship has missing properties'}
        }
    }
    return ship
}


const _checkTargetLoc = function(board,ship,key,getBoardContents = defaultConfig.getBoardContains){
    
    if(getBoardContents(board,key) === null){
        let updateValue = Object.assign(Object.create(Object.getPrototypeOf(ship)),ship)
        return updateValue
    }
    return {error : 'This zone is occupied'}
}


const _removeShip = function(currentBoard, newGameBoard=new gameBoard().board, sourceKey, getShip=defaultConfig.getBoardContains){
    if(Object.is(null,_checkShipObject(getShip(currentBoard,sourceKey)))){
        return currentBoard
    }
    let containsObject = createContainsObject(currentBoard,sourceKey,null);
    newGameBoard = updateBoardContents(newGameBoard,containsObject)

    return newGameBoard

}

const _checkMoveLegality = function(currentBoard, sourceKey,targetKey, getSourceLegalMoves=defaultConfig.getBoardLegalMoves){
     const legalMoves = [...getSourceLegalMoves(currentBoard, sourceKey)]

     if(legalMoves.includes(targetKey) === false){
         return false
     }

     return true
}


export const moveShip = function(currentBoard, newGameBoard=new gameBoard().board, sourceKey, targetKey, getShip=defaultConfig.getBoardContains, gb=defaultConfig.transformBoard){
    
    if(Object.prototype.hasOwnProperty.call(currentBoard, 'error')){
        return currentBoard
    }
    if(_checkMoveLegality(currentBoard,sourceKey, targetKey) === false){
        return {
            error: 'This move is illegal'
        }
    }
    
    let ship = getShip(currentBoard, sourceKey) 
    newGameBoard = gb(null,placeShip(currentBoard,newGameBoard,ship,targetKey))

    if(Object.prototype.hasOwnProperty.call(newGameBoard, 'error')){
        return newGameBoard
    }
    
    let finalBoard = gb('ship move action')
    let nullBoard = gb('remove ship')
    Object.assign(gb(null,finalBoard),  _removeShip(newGameBoard,gb(null, nullBoard),sourceKey))
    return finalBoard
     
}

export const placeShip = function(currentBoard, newGameBoard, ship, targetKey, gb= defaultConfig.transformBoard){
    ship = _checkShipObject(ship)
    if(Object.prototype.hasOwnProperty.call(ship, 'error')){
        return ship
    }
    let updateValue = _checkTargetLoc(currentBoard,ship,targetKey)
    if(Object.prototype.hasOwnProperty.call(updateValue, 'error')){
        return updateValue
    }
    
    let containsObject = createContainsObject(currentBoard, targetKey, updateValue)
    newGameBoard = gb('ship place action');
    let board = gb(null, newGameBoard)
    Object.assign(board, updateBoardContents(board, containsObject)) 

    return newGameBoard 

}






