import { gameBoard, createContainsObject, updateBoardContents, defaultConfig } from "./gameboard"
const [getBoardLegalMoves, getState, newBoard] = [defaultConfig.getBoardLegalMoves, defaultConfig.getState, defaultConfig.newBoard]
const [getBoard, getBoardContains, setBoardContains] = [defaultConfig.getBoard, defaultConfig.getBoardContains, defaultConfig.setBoardContains]
import {gameEvents} from "./gamestate"


export const AIObj = class {
    constructor(gameState=new gameBoard('new game'),triangulation=false,phase=0, hit=null, target=null ){
        this.gameState = gameState,
        this.triangulation = triangulation,
        this.phase = phase,
        this.hit = hit,
        this.target = target
    }
}

const _generatePseudoRandomKey = function(){
    const centralColumns = ['B','C','D','E']
    const centralRows = ['2','3','4','5']
    const wholeColumns = ['A','B','C','D','E','F']
    const wholeRows = ['1','2','3','4','5','6']

    let columnChoice = Math.floor((Math.random() * 10)) <= 1 ? centralColumns : wholeColumns 
    let rowChoice = Math.floor((Math.random() * 10)) <= 1 ? centralRows : wholeRows

    let columnIndex = Math.floor((Math.random() * columnChoice.length)) 
    let rowIndex = Math.floor((Math.random() * rowChoice.length))

    return `${columnChoice[columnIndex]}${rowChoice[rowIndex]}`
}


const _decisionByPhaseNo = { 
    
    '1' : function(someHitKey, someTargets, someTargetIndex){
        if(Math.floor((Math.random() * 10)) <= 5){
            return someHitKey
        }    
        return someTargets[someTargetIndex]
    },

    '2' : function(someHitKey, someTargets, someTargetIndex, legalKeyGen = (akeyVar) => getBoardLegalMoves(new gameBoard().board, akeyVar)){
        let pivot = Math.floor((Math.random() * 10))
        if(pivot <= 4){
            return someTargets[someTargetIndex]
        }
        else if(pivot <= 6){
            return someHitKey
        }
        else{
            let widerTarget = []
            for (let key of someTargets){
                widerTarget = [...widerTarget, ...legalKeyGen(key)]
            }
            widerTarget = [...new Set(widerTarget)]
            let widerTargetIndex = Math.floor((Math.random() * widerTarget.length))
            return widerTarget[widerTargetIndex] 
        }    
    },
}

const _triangulateKeyGenerator = function(hitKey, phaseNo=1,someBoard=new gameBoard('some board'),targetKeys=[...someBoard.board[hitKey].legalMoves]){
    let targetIndex = Math.floor((Math.random() * targetKeys.length))
    return _decisionByPhaseNo[phaseNo.toString()](hitKey,targetKeys,targetIndex)      
}


const _missileHitMode = function(propsObj){
        
    return {
        triangulation : true,
        phase : 1,
        hit : propsObj.target,
        target : propsObj.target
    }

}

const _missileBlockedMode = function(propsObj){
    
    if(propsObj.hit === null){
        return {
            triangulation : true,
            phase : 1,
            hit : propsObj.target,
            target : propsObj.target
        }
    }
    return {
        triangulation : true,
        phase : 1,
        hit : propsObj.hit,
        target : propsObj.target
    }


}

const _shipSunkMode = function(propsObj){
    return {
        triangulation : false,
        phase : 0,
        hit : null,
        target : propsObj.target
    }

}

const _missedMissileMode = function(propsObj){
    if (propsObj.phase === 1){
        return {
            triangulation: true,
            phase : 2,
            hit : propsObj.hit,
            target : propsObj.target
        }

    }
    return {
        triangulation : false,
        phase : 0,
        hit : null,
        target : propsObj.target
    }
    

}

const _stateOptions = {

    'missile hit ship' : _missileHitMode,
    'missile blocked' : _missileBlockedMode,
    'missile sunk ship': _shipSunkMode,
    'missile missed ship':  _missedMissileMode
}

const _configureMode = function(someState, phase, hit, target){

    
    let propsObj = {
        phase,
        hit,
        target
    }  

    return _stateOptions[someState](propsObj)

}


export const AIReact = function(currentAIObject, gs=getState, gbs=[newBoard,getBoard]){
    let currentGameState = currentAIObject.gameState
    let currentState = gs(currentGameState)
    const [ngb,gb] = gbs;
    

    if(Object.keys(_stateOptions).includes(currentState)){
        let newObject = new AIObj(currentGameState)
        newObject = Object.assign(newObject,_configureMode(currentState,currentAIObject.phase,currentAIObject.hit,currentAIObject.target))
        return newObject
    }

    if(currentAIObject.triangulation){ 
        let key = _triangulateKeyGenerator(currentAIObject.hit, currentAIObject.phase)
        let newGameState = { gameState: ngb(`${key}`)}
        Object.assign(gb(newGameState.gameState), gb(currentGameState))
        let newTarget = {target : `${key}`}
        let newObject = new AIObj()
        newObject = Object.assign(newObject, currentAIObject, newGameState, newTarget )
        return newObject
    }
    let key = _generatePseudoRandomKey() 
    let newGameState = { gameState: ngb(`${key}`)}
    Object.assign(gb(newGameState.gameState), gb(currentGameState))
    let newTarget = {target : `${key}`}
    let newObject = new AIObj()
    newObject = Object.assign(newObject, currentAIObject, newGameState, newTarget )
    return newObject
}

const _sunkVesselCheckUpdate = function(vesselSunk, vessel){ 
    if(vesselSunk){
        return null
    }
    return vessel
}

const _generateDamage = function(hitShip,hitValue=1){
     hitShip.damage += hitValue
     return _sunkVesselCheckUpdate(hitShip.isSunk(hitShip.damage, hitShip.breakPoint), hitShip)
}

const _missileBlockingCheck = function(board, target, getCont=getBoardContains, setCont=setBoardContains){
    if(Object.prototype.hasOwnProperty.call(board,'missileBlocked')){
        let keys = board.missileBlocked 
        const newBoard = Object.assign({},board)
        delete newBoard.missileBlocked
        const newContainsObj = createContainsObject(newBoard, null, null, getCont)
        updateBoardContents(newBoard,newContainsObj, setCont)

        if(keys.includes(target)){
            newBoard.missileBlocked = true
            return newBoard         
        }
        return newBoard
        
    }
    const oldBoard = Object.assign({},board)
    const oldContainsObj = createContainsObject(board, null, null, getCont)
    updateBoardContents(oldBoard,oldContainsObj, setCont)

    return oldBoard

}

const _hitCheckingMechanism = function(key, currentBoard, nb=newBoard, gb=getBoard, getKey=getBoardContains, setKey=setBoardContains){
    
    const currentBoardChecked = _missileBlockingCheck(currentBoard,key,getKey,setKey)
    if(Object.prototype.hasOwnProperty.call(currentBoardChecked, 'missileBlocked')){
        let blocked = nb('missile blocked')
        let blockedBoard = gb(blocked)
        let blockedContainsObj = createContainsObject(currentBoardChecked,null,null,getKey)
        delete blockedContainsObj.missileBlocked
        updateBoardContents(blockedBoard, blockedContainsObj, setKey)
        return blocked
    }
    
    let loc = getKey(currentBoardChecked, key)
    if(loc === null){
        let missed = nb('missile missed ship');
        let missedBoard = gb(missed)
        let missedContainsObj = createContainsObject(currentBoardChecked, null,null, getKey)
        updateBoardContents(missedBoard, missedContainsObj, setKey)
        return missed
    }
    
    let updatedValue = Object.assign(Object.create(Object.getPrototypeOf(loc)),loc)
    updatedValue = _generateDamage(updatedValue)
    let vesselStatus = updatedValue === null ? nb('missile sunk ship') : nb('missile hit ship')
    let containsObj = createContainsObject(currentBoardChecked, key, updatedValue, getKey)
    let boardWithUpdatedVessel = gb(vesselStatus)

    updateBoardContents(boardWithUpdatedVessel,containsObj, setKey)

    return vesselStatus
}


export const updateStatus = function(currentAIObject, gs=getState, gbs=[newBoard,getBoard,getBoardContains,setBoardContains, getBoardLegalMoves]){
    let gb = gbs[1]
    let currentGameState = currentAIObject.gameState;
    let currentState = gs(currentGameState);
    let currentBoard = gb(currentGameState)
    let keys = Object.keys(currentBoard)
    if(keys.includes(currentState)){
        let updatedAIObject = new AIObj()
        updatedAIObject = Object.assign(updatedAIObject, currentAIObject, {gameState: _hitCheckingMechanism(currentState, currentBoard, ...gbs)})
        return updatedAIObject
    }
    else{
        return currentAIObject

    }    
    
}

export const sendStatus = function(currentAIObject, gs=getState, gbs=[newBoard,getBoard,getBoardContains,setBoardContains,getBoardLegalMoves],publish=gameEvents.publish){
    
    let currentGameState = currentAIObject.gameState
    let currentState = gs(currentGameState)
    if(Object.keys(_stateOptions).includes(currentState)){
        publish('updateAIObject',gs,gbs,publish)
        return
    }
    publish('updatePlayerState',currentGameState)
    //To include:
    //check if game over, and if so reset.
    //renderState
    return 
}

export let gameAI = {sessionAI : new AIObj()}

export const updateAIWrapper = function(someFunc,...params){
    gameAI.sessionAI = someFunc(gameAI.sessionAI, ...params)
    return
}
