import { gameBoard, createContainsObject, updateBoardContents, defaultConfig } from "./gameboard"
const [getLgalMovs, getSt, newBrd] = [defaultConfig.getBoardLegalMoves, defaultConfig.getState, defaultConfig.newBoard]
const [getBrd, getBCont, setBCont] = [defaultConfig.getBoard, defaultConfig.getBoardContains, defaultConfig.setBoardContains]
const [getW, setW, getP, setP] = [defaultConfig.getWreckCount, defaultConfig.setWreckCount, defaultConfig.getPlantCount, defaultConfig.setPlantCount]
import {gameEvents, updateState} from "./gamestate"
import {getShipCount} from "./ships"
const getC = getShipCount


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

    '2' : function(someHitKey, someTargets, someTargetIndex, legalKeyGen = (akeyVar) => getLgalMovs(new gameBoard().board, akeyVar)){
        let pivot = Math.floor((Math.random() * 10))
        if(pivot <= 2){
            return someTargets[someTargetIndex]
        }
        else if(pivot <= 4){
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
    'missile blocked' : _missileHitMode,
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


export const AIReact = function(currentAIObject, gs=getSt, gbs=[newBrd,getBrd,getW,getP]){
    
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
        Object.assign(newGameState.gameState, {wreckage : getW(currentGameState)}, {plants : getP(currentGameState)})
        let newTarget = {target : `${key}`}
        let newObject = new AIObj()
        newObject = Object.assign(newObject, currentAIObject, newGameState, newTarget )
        return newObject
    }
    let key = _generatePseudoRandomKey() 
    let newGameState = { gameState: ngb(`${key}`)}
    Object.assign(gb(newGameState.gameState), gb(currentGameState))
    Object.assign(newGameState.gameState, {wreckage : getW(currentGameState)}, {plants : getP(currentGameState)})
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
     return _sunkVesselCheckUpdate(hitShip.isSunk(hitShip.damage, hitShip.breakpoint), hitShip)
}

const _missileBlockingCheck = function(board, target, getCont=getBCont, setCont=setBCont){
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

const _wreckageCounter = function(someBoard, getState, getWreckage, setWreckage, newBoard){
    const state = getState(someBoard)
    const options = Object.keys(_stateOptions)
    const values = [2,2,5,1]
    let rubric = {}
    for(let x = 0; x < options.length; x++){
        rubric[options[x]] = values[x]
    }
    const currentWreckage = getWreckage(someBoard)
    const newWreckage = currentWreckage + rubric[state]
    const newGB = newBoard()
    Object.assign(newGB, someBoard)
    return setWreckage(newGB, newWreckage)
}

const _discountContribution = function(someBoard, someCount, getState, getWreckage, setWreckage, getPlants, setPlants, newBoard){

    let newB = newBoard('missile sunk ship');
    Object.assign(newB, someBoard)

    const _discountPlants = function(){
        let shipRef = someCount.plants;
        let boardRef = getPlants(someBoard);
        let newRef = boardRef - shipRef
        
        if(newRef < 0){
            setPlants(newB, 0)
            
        }
        else{
            setPlants(newB, newRef)
        }
        
    }

    const _discountWreckage = function(){
        let shipRef = someCount.wreckage;
        let boardRef = getWreckage(someBoard);
        let newRef = boardRef + shipRef
        setWreckage(newB, newRef)
    }
    
    if(getState(someBoard) === 'missile sunk ship'){
        const props = {'plants' : _discountPlants,
                       'wreckage': _discountWreckage};
        for(let elem of Object.keys(props)){
            if(Object.prototype.hasOwnProperty.call(someCount, elem)){
                props[elem]()
            }
        }
        return newB

    }
    return someBoard

}

   
const _hitCheckingMechanism = function(key, currentGameState, currentBoard, gs=getSt, nb=newBrd, gb=getBrd, getKey=getBCont, setKey=setBCont,gw=getW,sw=setW,gp=getP,sp=setP, gc=getC){
    
    const currentBoardChecked = _missileBlockingCheck(currentBoard,key,getKey,setKey)
    if(Object.prototype.hasOwnProperty.call(currentBoardChecked, 'missileBlocked')){
        let blocked = nb('missile blocked')
        Object.assign(blocked, {wreckage : gw(currentGameState)}, {plants: gp(currentGameState)})
        let blockedBoard = gb(blocked)
        let blockedContainsObj = createContainsObject(currentBoardChecked,null,null,getKey)
        delete blockedContainsObj.missileBlocked
        updateBoardContents(blockedBoard, blockedContainsObj, setKey)
        blocked = _wreckageCounter(blocked, gs, gw, sw,nb)
        return blocked
    }
    
    let loc = getKey(currentBoardChecked, key)
    if(loc === null){
        let missed = nb('missile missed ship');
        Object.assign(missed, {wreckage : gw(currentGameState)},{plants: gp(currentGameState)})
        let missedBoard = gb(missed)
        let missedContainsObj = createContainsObject(currentBoardChecked, null,null, getKey)
        updateBoardContents(missedBoard, missedContainsObj, setKey)
        missed = _wreckageCounter(missed, gs, gw, sw, nb)
        return missed
    }
    
    let updatedValue = Object.assign(Object.create(Object.getPrototypeOf(loc)),loc)
    let shipActionCount = gc(updatedValue) 
    updatedValue = _generateDamage(updatedValue)
    let vesselStatus = updatedValue === null ? nb('missile sunk ship') : nb('missile hit ship')
    Object.assign(vesselStatus,{wreckage : gw(currentGameState)},{plants: gp(currentGameState)})
    vesselStatus = _wreckageCounter(vesselStatus, gs, gw, sw, nb)
    vesselStatus = _discountContribution(vesselStatus, shipActionCount,gs,gw,sw,gp,sp,nb)
    let containsObj = createContainsObject(currentBoardChecked, key, updatedValue, getKey)
    let boardWithUpdatedVessel = gb(vesselStatus)

    updateBoardContents(boardWithUpdatedVessel,containsObj, setKey)

    return vesselStatus
}


export const updateStatus = function(currentAIObject, gs=getSt, gbs=[newBrd,getBrd,getBCont,setBCont,getW,setW,getP,setP],gc=getC){
    let gb = gbs[1]
    let currentGameState = currentAIObject.gameState;
    let currentState = gs(currentGameState);
    let currentBoard = gb(currentGameState)
    let keys = Object.keys(currentBoard)
    if(keys.includes(currentState)){
        let updatedAIObject = new AIObj()
        updatedAIObject = Object.assign(updatedAIObject, currentAIObject, {gameState: _hitCheckingMechanism(currentState, currentGameState, currentBoard, gs, ...gbs,gc)})
        return updatedAIObject
    }
    else{
        return currentAIObject

    }    
    
}

export const sendStatus = function(currentAIObject, gs=getSt,publish=gameEvents.publish, us=updateState){
    
    let currentGameState = currentAIObject.gameState
    let currentState = gs(currentGameState)
    if(Object.keys(_stateOptions).includes(currentState)){
        publish('updateAIObj', AIReact) 
        publish('updateGameState',us, currentGameState)
        publish('renderGameState',currentGameState)
        publish('renderImpact', currentGameState, gameAI.sessionAI.target)
        publish('senseEvent', currentGameState)
        let updatedStateAIObj = us(AIReact(currentAIObject),currentGameState) 
        return updatedStateAIObj
    }
    return 
}


export let gameAI = {sessionAI : new AIObj()}

export const updateAIWrapper = function(someFunc,...params){
    gameAI.sessionAI = someFunc(gameAI.sessionAI, ...params)
    console.log(gameAI.sessionAI.target)
    return
}

export const triggerAIEvts = function(somePubFunc=gameEvents.publish, aiReactParams=[getSt, [newBrd,getBrd,getW,getP]],updateStatParams=[getSt, [newBrd,getBrd,getBCont,setBCont,getW,setW,getP,setP],getC], sendStatParams=[getSt,somePubFunc=gameEvents.publish, updateState]){
    somePubFunc('updateAIObj', AIReact, ...aiReactParams)
    somePubFunc('updateAIObj', updateStatus,...updateStatParams)
    somePubFunc('updateAIObj', sendStatus,...sendStatParams)
    return
}

export const subscribeAIEvts = function(someSubFunc=gameEvents.subscribe){
    someSubFunc('updateGameState',updateAIWrapper)
    someSubFunc('updateAIObj',updateAIWrapper)
    someSubFunc('triggerAI', triggerAIEvts)
    return    

}



