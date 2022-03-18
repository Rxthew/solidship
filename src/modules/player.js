import { gameBoard, defaultConfig, createContainsObject,updateBoardContents } from "./gameboard"

const [getBrdCont, setBrdCont, newBrd, getBrd] = [defaultConfig.getBoardContains, defaultConfig.setBoardContains, defaultConfig.newBoard, defaultConfig.getBoard]
const legal = defaultConfig.getBoardLegalMoves

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


const _removeShip = function(currentBoard, newGameBoard=new gameBoard().board, sourceKey, getShip=getBrdCont, setCont = setBrdCont){
    if(Object.is(null,_checkShipObject(getShip(currentBoard,sourceKey)))){
        return currentBoard
    }
    let containsObject = createContainsObject(currentBoard,sourceKey,null, getShip);
    newGameBoard = updateBoardContents(newGameBoard,containsObject, setCont)

    return newGameBoard

}

const _checkMoveLegality = function(currentBoard, sourceKey,targetKey, getSourceLegalMoves=defaultConfig.getBoardLegalMoves){
     const legalMoves = [...getSourceLegalMoves(currentBoard, sourceKey)]

     if(legalMoves.includes(targetKey) === false){
         return false
     }

     return true
}


export const moveShip = function(currentBoard, newGameBoard=new gameBoard().board, sourceKey, targetKey, getShip=getBrdCont, ngb=newBrd, gb=getBrd){
    
    if(Object.prototype.hasOwnProperty.call(currentBoard, 'error')){
        return currentBoard
    }
    if(_checkMoveLegality(currentBoard,sourceKey, targetKey) === false){
        return {
            error: 'This move is illegal'
        }
    }
    
    let ship = getShip(currentBoard, sourceKey) 
    newGameBoard = gb(placeShip(currentBoard,newGameBoard,ship,targetKey))

    if(Object.prototype.hasOwnProperty.call(newGameBoard, 'error')){
        return newGameBoard
    }
    
    let finalBoard = ngb('ship move action')
    let nullBoard = ngb('remove ship')
    Object.assign(gb(finalBoard),  _removeShip(newGameBoard,gb(nullBoard),sourceKey)) 
    return finalBoard
     
}

export const placeShip = function(currentBoard, newGameBoard, ship, targetKey, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont){
    ship = _checkShipObject(ship)
    if(Object.prototype.hasOwnProperty.call(ship, 'error')){
        return ship
    }
    let updateValue = _checkTargetLoc(currentBoard,ship,targetKey)
    if(Object.prototype.hasOwnProperty.call(updateValue, 'error')){
        return updateValue
    }
    
    let containsObject = createContainsObject(currentBoard, targetKey, updateValue, getCont)
    newGameBoard = ngb('ship place action');
    let board = gb(newGameBoard)
    Object.assign(board, updateBoardContents(board, containsObject, setCont)) 

    return newGameBoard 

}

export const blockMissileAction = function(currentBoard, newGameBoard, shipLocation, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont, lgl=legal){
    newGameBoard = ngb('missile block action');
    let board = gb(newGameBoard);
    let blocked = {missileBlocked : [shipLocation, ...lgl(board,shipLocation)]}
    let cont = createContainsObject(currentBoard,null,null,getCont)
    if(currentBoard.missileBlocked){
        blocked.missileBlocked = [...currentBoard.missileBlocked,...blocked.missileBlocked]
        delete cont.missileBlocked
    }
    updateBoardContents(board,cont, setCont)
    Object.assign(board,blocked)
    return newGameBoard
}



const _unwrapChanges = function(actualShip, mode, keys, change, getChangedShip){
    let newShip = Object.create(Object.getPrototypeOf(actualShip))
    Object.assign(newShip,actualShip)
    let newerShip = getChangedShip(newShip, keys, change)

    if(mode === 'extend'){
        let targetKey = keys[keys.length - 1]
        let finalTarget = newShip;
        for(let elem of keys){
            if(targetKey === elem){
                finalTarget[targetKey].push(newerShip[targetKey][0])
            }
            finalTarget = finalTarget[elem]
            newerShip = newerShip[elem]
        }
        return newShip
    }
    return newerShip
    
}

export const upgradeShip =  function(currentBoard, newGameBoard, shipLocation, changeConfig, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont){
    const shipToChange = getCont(currentBoard,shipLocation)
    const changedShip = _unwrapChanges(shipToChange, ...changeConfig)
    if(changedShip.error){
        return changedShip.error
    }
    newGameBoard = ngb('upgrade ship action')
    let cont = createContainsObject(currentBoard,shipLocation,changedShip, getCont)
    updateBoardContents(gb(newGameBoard),cont,setCont)
    return newGameBoard


}






