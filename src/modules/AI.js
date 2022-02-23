import { gameBoard, getBoardLegalMovesDefault } from "./gameboard"


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

    '2' : function(someHitKey, someTargets, someTargetIndex, legalKeyGen = (akeyVar) => getBoardLegalMovesDefault(new gameBoard().board, akeyVar)){
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

const _configureMode = function(someGameBoard, phase, hit, target){

    let state = someGameBoard.state
    
    let propsObj = {
        phase,
        hit,
        target
    }  

    return _stateOptions[state](propsObj)

}


export const AIReact = function(currentAIObject, gb=function(someStr){return new gameBoard(someStr)}){
    let currentGameState = currentAIObject.gameState;
    if(Object.keys(_stateOptions).includes(currentGameState.state)){
        let newObject = new AIObj(currentGameState)
        newObject = Object.assign(newObject,_configureMode(currentGameState,currentAIObject.phase,currentAIObject.hit,currentAIObject.target))
        return newObject
    }

    if(currentAIObject.triangulation){ 
        let key = _triangulateKeyGenerator(currentAIObject.hit, currentAIObject.phase)
        let newGameState = { gameState: gb(`${key}`)}
        let newTarget = {target : `${key}`}
        let newObject = new AIObj()
        newObject = Object.assign(newObject, currentAIObject, newGameState, newTarget )
        return newObject
    }
    let key = _generatePseudoRandomKey() 
    let newGameState = { gameState: gb(`${key}`)}
    let newTarget = {target : `${key}`}
    let newObject = new AIObj()
    newObject = Object.assign(newObject, currentAIObject, newGameState, newTarget )
    return newObject
}