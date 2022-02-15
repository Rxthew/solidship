import { gameBoard } from "./gameboard"
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
        targetLoc.contains = Object.assign(Object.create(Object.getPrototypeOf(ship)),ship)
        return targetLoc.contains
    }
    return targetLoc.contains
}


const _removeShip = function(gameBoard,sourceKey){
    let sourceLoc = gameBoard.board[sourceKey]
    if(Object.is(null,_checkShipObject(sourceLoc.contains))){
        return gameBoard
    }
    sourceLoc = Object.assign(sourceLoc, {contains: null})
    gameBoard = Object.assign({},gameBoard)
    return gameBoard

}

const _checkMoveLegality = function(targetKey, gameBoard, sourceKey){
     let sourceLoc = gameBoard.board[sourceKey];
     
     const legalMoves = [...sourceLoc.legalMoves]

     if(legalMoves.includes(targetKey) === false){
         return false
     }

     return true
}

export const moveShip = function(targetKey,gameBoard,sourceKey){
    if(_checkMoveLegality(targetKey,gameBoard,sourceKey) === false){
        return gameBoard
    }
    let ship = gameBoard.board[sourceKey].contains
    
    let newBoard = placeShip(targetKey,gameBoard,ship)
    let shipEntries = Object.values(ship)
    for(let prop of Object.values(newBoard.board[targetKey].contains)){
        if(shipEntries.includes(prop) === false){
            console.log(shipEntries)
            console.log(prop)
            return gameBoard
        }       
    }
    newBoard = _removeShip(newBoard,sourceKey)
    return newBoard 

}

export const placeShip = function(targetKey,gameBoard,ship){
    
    
    ship = _checkShipObject(ship)
    let targetLoc = gameBoard.board[targetKey]
    _checkTargetLoc(targetLoc,ship)
         
    gameBoard = Object.assign({}, gameBoard) 

    return gameBoard 

}




