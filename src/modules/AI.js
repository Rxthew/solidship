import { gameBoard, createContainsObject, updateBoardContents, defaultConfig } from "./gameboard"
const [getBoardLegalMoves, getState, newBoard] = [defaultConfig.getBoardLegalMoves, defaultConfig.getState, defaultConfig.newBoard]
const [getBoard, getBoardContains] = [defaultConfig.getBoard, defaultConfig.getBoardContains]


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

const _missileBlockingCheck = function(board, target, legalKeyGen = (akeyVar) => getBoardLegalMoves(board, akeyVar)){
    if(Object.prototype.hasOwnProperty.call(board,'missileBlocked')){
        let keys = board.missileBlocked 
        let blockedTargets = (function(){
            let trgts = [];
            for(let key of keys){
                trgts = [...trgts, ...legalKeyGen(key)]
            }
            return trgts
            
        })()
        if(blockedTargets.includes(target)){
            //
        }
        
            
    }
    return board

}


export const AIReact = function(currentAIObject, gs=getState, gbs=[newBoard,getBoard,getBoardLegalMoves]){
    
    let currentGameState = currentAIObject.gameState
    let currentState = gs(currentGameState)
    let ngb = gbs[0];
    

    if(Object.keys(_stateOptions).includes(currentState)){
        let newObject = new AIObj(currentGameState)
        newObject = Object.assign(newObject,_configureMode(currentState,currentAIObject.phase,currentAIObject.hit,currentAIObject.target))
        return newObject
    }

    if(currentAIObject.triangulation){ 
        let key = _triangulateKeyGenerator(currentAIObject.hit, currentAIObject.phase)
        let newGameState = { gameState: ngb(`${key}`)}
        let newTarget = {target : `${key}`}
        let newObject = new AIObj()
        newObject = Object.assign(newObject, currentAIObject, newGameState, newTarget )
        return newObject
    }
    let key = _generatePseudoRandomKey() 
    let newGameState = { gameState: ngb(`${key}`)}
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

const _hitCheckingMechanism = function(key, currentBoard, nb=newBoard, gb=getBoard, getKey=getBoardContains){

    if(Object.prototype.hasOwnProperty.call(currentBoard, 'missileBlocked')){
        let blocked = nb('missile blocked')
        let blockedBoard = gb(blocked)
        let blockedContainsObj = createContainsObject(currentBoard)
        delete blockedContainsObj['missileBlocked']
        updateBoardContents(blockedBoard, blockedContainsObj)
        return blocked
    }
    
    let loc = getKey(currentBoard, key)
    if(loc === null){
        let missed = nb('missile missed ship');
        let missedBoard = gb(missed)
        let missedContainsObj = createContainsObject(currentBoard)
        updateBoardContents(missedBoard, missedContainsObj)
        return missed
    }
    
    let updatedValue = Object.assign(Object.create(Object.getPrototypeOf(loc)),loc)
    updatedValue = _generateDamage(updatedValue)
    let vesselStatus = updatedValue === null ? nb('missile sunk ship') : nb('missile hit ship')
    let containsObj = createContainsObject(currentBoard, key, updatedValue)
    let boardWithUpdatedVessel = gb(vesselStatus)

    updateBoardContents(boardWithUpdatedVessel,containsObj)

    return vesselStatus
}


export const updateStatus = function(currentAIObject, gs=getState, gbs=[newBoard,getBoard,getBoardContains]){
    let [ngb,gb,getKey] = [gbs[0],gbs[1],gbs[2]]
    let currentGameState = currentAIObject.gameState;
    let currentState = gs(currentGameState);
    let currentBoard = gb(currentGameState)
    let keys = Object.keys(currentBoard)
    if(keys.includes(currentState)){
        let updatedAIObject = new AIObj()
        updatedAIObject = Object.assign(updatedAIObject, currentAIObject, {gameState: _hitCheckingMechanism(currentState, currentBoard,ngb,gb,getKey)})
        return updatedAIObject
    }
    else{
        return currentAIObject

    }    
    
}

export const sendStatus = function(currentAIObject, gs=getState){
    let currentGameState = currentAIObject.gameState
    let currentState = gs(currentGameState)
    if(Object.keys(_stateOptions).includes(currentState)){
        return

    }
    
}

