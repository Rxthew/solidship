import { gameBoard,createContainsObject,updateBoardContents } from "./gameboard"
//import * as ships from './ships' 

//const [legacyShip, plantingShip, relayShip, defenseShip] = [ships.legacyShip, ships.plantingShip, ships.relayShip, ships.defenseShip]

export const playerObj =  class {
    constructor(name,gameState=new gameBoard('new game')){
        this.name = name,
        this.gameState = gameState
    }
}


const _checkShipObject = function(ship){
    if (Object.is(ship,null)){
        return null
        }
    
    const properties = ['isSunk', 'damage', 'breakPoint','type']
    for (let property of properties){
        if(property in ship === false){
            return null
        }
    }
    return ship
}


const _checkTargetLoc = function(targetLoc,ship){
    
    if(targetLoc.contains === null && Object.is(ship,null)===false){
        let updateValue = Object.assign(Object.create(Object.getPrototypeOf(ship)),ship)
        return updateValue
    }
    return targetLoc.contains
}


const _removeShip = function(currentBoard,sourceKey){
    let sourceLoc = currentBoard.board[sourceKey]
    if(Object.is(null,_checkShipObject(sourceLoc.contains))){
        return currentBoard
    }
    let finalBoard = new gameBoard('remove ship action')
    let containsObject = createContainsObject(currentBoard,sourceKey,null);
    finalBoard = updateBoardContents(finalBoard,containsObject)

    return finalBoard

}

const _checkMoveLegality = function(targetKey, currentBoard, sourceKey){
     let sourceLoc = currentBoard.board[sourceKey];
     
     const legalMoves = [...sourceLoc.legalMoves]

     if(legalMoves.includes(targetKey) === false){
         return false
     }

     return true
}


export const moveShip = function(targetKey,currentBoard,sourceKey){
    if(_checkMoveLegality(targetKey,currentBoard,sourceKey) === false){
        return currentBoard
    }
    let ship = currentBoard.board[sourceKey].contains
    let newBoard = placeShip(targetKey,currentBoard,ship)
    
    
    let finalBoard = _removeShip(newBoard,sourceKey)
    return finalBoard
    
    
     

}

export const placeShip = function(targetKey,currentBoard,ship){
    ship = _checkShipObject(ship)
    let targetLoc = currentBoard.board[targetKey]
    let updateValue = _checkTargetLoc(targetLoc,ship)
    
         
    let newGameBoard = new gameBoard('place ship action')
    let containsObject = createContainsObject(currentBoard, targetKey, updateValue)
    newGameBoard = updateBoardContents(newGameBoard, containsObject)

    return newGameBoard 

}




