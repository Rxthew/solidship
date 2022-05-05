import { gameBoard, defaultConfig, createContainsObject,updateBoardContents } from "./gameboard"
import { gameEvents, updateState } from "./gamestate"
import { getShipCount,setShipCount,getEquipmentType, setNewShip, checkMessagingProtocol, checkEquipment} from "./ships"
import { camelPhraseParser } from "./utils"

const [getBrdCont, setBrdCont, newBrd, getBrd] = [defaultConfig.getBoardContains, defaultConfig.setBoardContains, defaultConfig.newBoard, defaultConfig.getBoard]
const [legal,getP,setP,getW,setW] = [defaultConfig.getBoardLegalMoves, defaultConfig.getPlantCount, defaultConfig.setPlantCount, defaultConfig.getWreckCount, defaultConfig.setWreckCount]
const [getSc, setSc, getEt,setNs] = [getShipCount,setShipCount, getEquipmentType,setNewShip]

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
    
    const properties = ['isSunk', 'damage', 'breakpoint','type']
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


const _removeShip = function(currentBoard, newGameBoard=new gameBoard().board, sourceKey, getShip=getBrdCont, setCont=setBrdCont){
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


export const moveShip = function(currentBoard, sourceKey, targetKey, getShip=getBrdCont, ngb=newBrd, gb=getBrd){
    
    if(Object.prototype.hasOwnProperty.call(currentBoard, 'error')){
        return currentBoard
    }
    if(_checkMoveLegality(currentBoard,sourceKey, targetKey) === false){
        return {
            error: 'This move is illegal'
        }
    }
    
    let ship = getShip(currentBoard, sourceKey) 
     let newGameBoard = gb(placeShip(currentBoard,ship,targetKey))

    if(Object.prototype.hasOwnProperty.call(newGameBoard, 'error')){
        return newGameBoard
    }
    
    let finalBoard = ngb('ship move action')
    let nullBoard = ngb('remove ship')
    Object.assign(gb(finalBoard),  _removeShip(newGameBoard,gb(nullBoard),sourceKey)) 
    return finalBoard
     
}

export const placeShip = function(currentBoard, ship, targetKey, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont){
    ship = _checkShipObject(ship)
    if(Object.prototype.hasOwnProperty.call(ship, 'error')){
        return ship
    }
    let updateValue = _checkTargetLoc(currentBoard,ship,targetKey)
    if(Object.prototype.hasOwnProperty.call(updateValue, 'error')){
        return updateValue
    }
    
    let containsObject = createContainsObject(currentBoard, targetKey, updateValue, getCont)
    let newGameBoard = ngb('ship place action');
    let board = gb(newGameBoard)
    Object.assign(board, updateBoardContents(board, containsObject, setCont)) 

    return newGameBoard 

}

export const blockMissileAction = function(currentBoard, shipLocation, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont, lgl=legal){
    let newGameBoard = ngb('missile block action');
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

    if(mode === 'extend component'){
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

export const upgradeShip =  function(currentBoard, shipLocation, changeConfig, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont){
    const shipToChange = getCont(currentBoard,shipLocation)
    const changedShip = _unwrapChanges(shipToChange, ...changeConfig)
    if(changedShip.error){
        return changedShip.error
    }
    let newGameBoard = ngb('upgrade ship action')
    let cont = createContainsObject(currentBoard,shipLocation,changedShip, getCont)
    updateBoardContents(gb(newGameBoard),cont,setCont)
    return newGameBoard


}

const _countIncrementByType = {
    'legacy' : 1,
    'modern' : 2
}


export const effectFarm = function(currentBoard, shipLoc, currentGameState, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont,gp=getP,sp=setP, gw=getW, gc=getSc, sc=setSc, gte=getEt, newS=setNs){
    
    let newGameBoard = ngb()
    const ship = getCont(currentBoard,shipLoc)
    let type = gte(ship)

    const _incrementShip = function(){
        let currentShipCount = gc(ship)
        let newShipCount = currentShipCount.plants + _countIncrementByType[type]
        let newShip = newS(ship,['properties','equipment','count'])    
        newShip = sc(newShip,{plants : newShipCount})        
        return newShip
    }

    const _incrementState = function(){
        const plantCount = gp(currentGameState)
        const newPlantCount = plantCount + _countIncrementByType[type]
        Object.assign(newGameBoard, {wreckage : gw(currentGameState)} ,{state : 'effect farm action'}) 
        newGameBoard = sp(newGameBoard,newPlantCount)
        return newGameBoard

    }
    newGameBoard = _incrementState()
    
    let cont = createContainsObject(currentBoard,shipLoc, _incrementShip(),getCont)

    updateBoardContents(gb(newGameBoard),cont,setCont)
    
    return newGameBoard

}

export const effectClear = function(currentBoard, shipLoc, currentGameState, getCont=getBrdCont, ngb=newBrd, gb=getBrd, setCont=setBrdCont,gw=getW, sw=setW, gp=getP, gc=getSc, sc=setSc, gte=getEt, newS=setNs){
    let newGameBoard = ngb()
    const ship = getCont(currentBoard, shipLoc)
    let type = gte(ship)
    const wreckCount = gw(currentGameState)
    const provisoryWreckCount =  wreckCount - _countIncrementByType[type] 

    const _incrementShip = function(){
        let currentShipCount = gc(ship)
        let actualWreckCount = provisoryWreckCount <= 0 ? wreckCount : _countIncrementByType[type]
        let newShipCount = currentShipCount.wreckage + actualWreckCount
        let newShip = newS(ship,['properties','equipment','count'])
        newShip = sc(newShip, {wreckage : newShipCount})
        return newShip
    }

    const _decrementState = function(){
        const newWreckCount = provisoryWreckCount <= 0 ? 0 : provisoryWreckCount
        Object.assign(newGameBoard, {plants : gp(currentGameState)}, {state : 'effect clear action'})
        newGameBoard = sw(newGameBoard, newWreckCount)
        return newGameBoard 
    }

    newGameBoard = _decrementState()
    let cont = createContainsObject(currentBoard, shipLoc, _incrementShip(),getCont)
    updateBoardContents(gb(newGameBoard),cont,setCont)
    return newGameBoard
}


let player1 = {sessionPlayer : null}

export const updatePlayerWrapper = function(someFunc, ...params){
    player1.sessionPlayer = someFunc(player1.sessionPlayer,...params)
    return player1
}

export const effectPlayerAction = function(instruction, params, pub=gameEvents.publish, ups=updateState, checkMess=checkMessagingProtocol,checkEq=checkEquipment){
    

    const _effectAction = {
        action : function(paramArray){
            const [tools,loc,actionChoice] = paramArray
            const filterAction = function(){
                let [currState,getContains,getBoard] = tools
                let board = getBoard(currState)
                let ship = getContains(board,loc)
                if(Object.prototype.hasOwnProperty.call(checkMess(ship),'error')){
                    pub('renderError',checkMess(ship))
                    pub('triggerAI')
                }
                if(Object.prototype.hasOwnProperty.call(checkEq(ship),'error')){
                    pub('renderError',checkEq(ship))
                    pub('triggerAI')
                }

                

                

                //checkProtocol
               

                actObj = {
                    

                }
                if(Object.prototype.hasOwnProperty.call(actObj[actionChoice],'error'){
                    pub('renderError',checkMessagingProtocol(ship))
                    pub('triggerAI')
                }
                return actObj[actionChoice]

            }
            filterAction()

        },
        build : function(paramArray){

        },
        move : function(paramArray){

        },
        modify : function(paramArray){

        },
        'extend component' : function(){

        },
        'extend ship' : function(){

        }
    }    
    
    _effectAction[instruction](params)

 //use camelPhraseParser   
//Note 1:
//Functions placeShip,upgradeShip,blockmissileact and moveShip take gameboard.board
//Functions effectClear and effectFarm take both board and gameboard

//Note 2: (blurb of some of the latter parts of the func)

//effectPlayerAction -> pass trigger & gameState
//involves following lines at the end:
//[
//filterAction to see if the action results in an error. If yes:
//publish('renderError', playerObj.gameState) Note: remember renderError needs Log, and then use triggerAIEvts.
//]
//publish('updateGameState', updateState, newGameState)
//triggerAIEvts()


//Note 3
    //remember 'action' & 'extend ship' params need customisation. (extendship should just be render of gs) & (modify triggeraievts 2x)
    //pub('updateGameState', ups, <to fill in>)
    //pub('renderGameState', player1.sessionPlayer.gameState)
//    return
}

const _extendShipSequence = function(paramsArray, ups=updateState, pub=gameEvents.publish){
    let newGb = upgradeShip(...paramsArray)
    pub('updateGameState', ups,newGb)
    return newGb
}

export const subscribePlayerEvts = function(someSubFunc=gameEvents.subscribe){
    someSubFunc('initGame', function(name){player1.sessionPlayer = new playerObj(name)}),
    someSubFunc('extendShip', _extendShipSequence)
    someSubFunc('updateGameState', updatePlayerWrapper)
    
}




 







