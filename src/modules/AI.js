import { gameBoard, createContainsObject,updateBoardContents } from "./gameboard"


export const AIObj = class {
    constructor(gameState=new gameBoard('new game'),triangulation=false,phase=0, hit=null){
        this.gameState = gameState,
        this.triangulation = triangulation,
        this.phase = phase,
        this.hit = hit
    }
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

const _fireMissile = function(key, currentBoard){
    let loc = currentBoard.board[key].contains
    if(loc === null){
        return currentBoard
    }
    let updatedValue = Object.assign(Object.create(Object.getPrototypeOf(loc)),loc)
    updatedValue = _generateDamage(updatedValue)
    let vesselStatus = updatedValue === null ? new gameBoard('vessel sunk') : new gameBoard('vessel hit')
    let containsObj = createContainsObject(currentBoard,key, updatedValue)
    vesselStatus = updateBoardContents(vesselStatus,containsObj)
    return vesselStatus
}

const _generatePseudoRandomKey = function(){
    const columns = ['A','B','C','D','E','F']
    const rows = ['1','2','3','4','5','6']
    let columnIndex = Math.floor((Math.random() * columns.length)) 
    let rowIndex = Math.floor((Math.random() * rows.length))
    return `${columns[columnIndex]}${rows[rowIndex]}`
}

const _decisionByPhaseNo = {
    
    '1' : function(someHitKey, someTargets, someTargetIndex){
        if(Math.floor((Math.random() * 2)) === 0){
            return someHitKey
        }    
        return someTargets[someTargetIndex]
    },

    '2' : function(someHitKey, someTargets, someTargetIndex){
        let aBoard = new gameBoard('a board')
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
                widerTarget = [...widerTarget, ...aBoard.board[key].legalMoves]
            }
            widerTarget = [...new Set(widerTarget)]
            let widerTargetIndex = Math.floor((Math.random() * widerTarget.length))
            return widerTarget[widerTargetIndex] 
        }    
    },

    '3': function(someHitKey){
        return someHitKey

    },

    '4': function(someHitKey, someTargets, someTargetIndex){
        someHitKey = false
        return someTargets[someTargetIndex]

    }
}

const _triangulateKeyGenerator = function(hitKey, phaseNo=1, missileBlocked=false){
    
    let someBoard = new gameBoard('some board')
    let targetKeys = [...someBoard.board[hitKey].legalMoves]
    let targetIndex = Math.floor((Math.random() * targetKeys.length))
    if(missileBlocked){
        phaseNo += 2
        return _decisionByPhaseNo[phaseNo.toString()](hitKey,targetKeys,targetIndex)
    }
    return _decisionByPhaseNo[phaseNo.toString()](hitKey,targetKeys,targetIndex)      
}

const _configureMode = function(someGameBoard, triangulation, phase, hit, newHit){
    
    if(someGameBoard.state === 'vessel hit'){
        triangulation = true
        phase = 1
        hit = newHit
        return {
            triangulation,
            phase,
            hit
        }
    }

    else if(someGameBoard.state === 'vessel sunk' || phase === 2){
        triangulation = false
        phase = 0
        hit = null
        return {
            triangulation,
            phase,
            hit     
        }
    }

    else if(triangulation){
        phase += 1
        return {
            triangulation,
            phase,
            hit     
        }
    }
        
    return {
         triangulation,
         phase,
         hit     
     }
}


export const AIReact = function(){
    return
}