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
        targetLoc.contains = Object.assign({},ship)
        return targetLoc.contains
    }
    return targetLoc.contains
}
   

export const placeShip = function(targetLoc,gameBoard,ship){
    
    ship = _checkShipObject(ship)
    targetLoc = _checkTargetLoc(targetLoc,ship)    
    gameBoard = Object.assign({}, gameBoard)
    return gameBoard 

}
