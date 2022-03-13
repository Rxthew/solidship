import { describe, expect, test } from '@jest/globals' 
import { createContainsObject, gameBoard, defaultConfig } from '../gameboard'
import {AIObj, AIReact, updateStatus, sendStatus } from '../AI'
import { plantingShip } from '../ships'


const _allKeys = function(){
    let board = new gameBoard().board;
    let contains = createContainsObject(board)
    let allKeys = []
    for(let key of Object.keys(contains)){
        allKeys.push(key)
    }
    return allKeys
    
}


const _targetKeys = function(someKey, someBorderRadius){
    let testBoard = new gameBoard('test')
    let targetKeys = [someKey]
    if(someBorderRadius === 1){
      targetKeys = [...targetKeys, ...testBoard.board[someKey].legalMoves]
    }
    else if(someBorderRadius === 2){
       for (let key of testBoard.board[someKey].legalMoves){
           targetKeys = [...targetKeys, key, ...testBoard.board[key].legalMoves]
       }
       targetKeys = [...new Set(targetKeys)]
    }
    return targetKeys
        
}

let _genNewObj = function(resultObj){
    let updated = AIReact(resultObj)
    return updated
}


describe('AI testing', () => {

    test('AI object has correct properites', () => {
        expect(new AIObj()).toEqual(
            {   
                gameState: new gameBoard('new game'),
                triangulation: false,
                phase: 0,
                hit: null, 
                target: null,
                
            }
        )
    })
    
    test('Able to update player gameState', () => {
        const monkeyOnBoard = new gameBoard('test monkey')
        monkeyOnBoard.board.F1.contains = Object.assign({}, {name: 'monkey'})
        const player2 =  new AIObj(monkeyOnBoard)
        expect(player2).toEqual(
            {
                gameState: monkeyOnBoard,
                triangulation: false,
                phase: 0,
                hit: null,
                target: null
            }
        )
        expect(player2.gameState.board.F1.contains).toEqual({
               name: 'monkey'
        })
    })

    test('AI React returns an AI Object with a valid gameState which returns the same gameBoard & identifies the target attempted',() => {
        let aiObject1 = new AIObj()
        expect(AIReact(aiObject1).gameState.board).toEqual(aiObject1.gameState.board)
        expect(_allKeys()).toContain(AIReact(aiObject1).gameState.state)
        expect(_allKeys()).toContain(AIReact(aiObject1).target)
        
    })

    test('AI React receiving missed target status returns same AI Object ',() => {
        let newAiObject1 = new AIObj()
        newAiObject1.gameState.state = 'missile missed ship'
        expect(AIReact(newAiObject1)).toEqual(newAiObject1)
        
    })


    test('AI React returns an AI Object with same gameState, mode set to triangulation, sets phase to 1 and stores hit location when missile hits a target or is blocked', () => {
        let aiObject3 = new AIObj()
        aiObject3.gameState.state = 'missile hit ship'
        aiObject3.target = 'A1'
        let newObj = AIReact(aiObject3)
        expect(newObj.gameState).toEqual(aiObject3.gameState)
        expect(newObj.triangulation).toBe(true)
        expect(newObj.hit).toBe('A1')
        expect(newObj.phase).toBe(1)

        let anotherAiObject3 = new AIObj()
        anotherAiObject3.gameState.state = 'missile blocked'
        anotherAiObject3.target = 'A1'

        let newerObj = AIReact(anotherAiObject3)
        expect(newerObj.gameState).toEqual(anotherAiObject3.gameState)
        expect(newerObj.triangulation).toBe(true)
        expect(newerObj.hit).toBe('A1')
        expect(newerObj.phase).toBe(1)

    })


    test('AI React returns an AI Object with same gameState, with triangulation true and phase 1, sets phase to 2 when missile misses a target', () => {
        let newAiObject3 = new AIObj()
        newAiObject3.gameState.state = 'missile missed ship'
        newAiObject3.triangulation = true
        newAiObject3.phase = 1
        newAiObject3.hit = 'A1'
        newAiObject3.target = 'B1'

        let newObj = AIReact(newAiObject3)
        expect(newObj.gameState).toEqual(newAiObject3.gameState)
        expect(newObj.triangulation).toBe(true)
        expect(newObj.target).toBe('B1')
        expect(newObj.hit).toBe('A1')
        expect(newObj.phase).toBe(2)

    })

    test('AI React when receiving an AI Object set to triangulation, returns an AI Object (same gameState) reverted to default settings if a ship has just been sunk', () => {
        
        let aiObject4 = new AIObj()
        aiObject4.triangulation = true
        aiObject4.hit = 'A1'
        aiObject4.target = 'A1'
        aiObject4.phase = 1
        aiObject4.gameState.state = 'missile sunk ship'


        let anotherObj = AIReact(aiObject4)
        expect(anotherObj.triangulation).toBe(false)
        expect(anotherObj.hit).toBe(null)
        expect(anotherObj.phase).toBe(0)
        expect(anotherObj.target).toBe('A1')
        expect(anotherObj.gameState).toEqual(aiObject4.gameState)

    })

    test('AI React when receiving an AI Object set to triangulation, returns an AI Object (same gameState) reverted to default settings if phase is currently 2 or more', () => {
        let thisNewObj = new AIObj()
        thisNewObj.triangulation = true; 
        thisNewObj.hit = 'A1';
        thisNewObj.target = 'B1'
        thisNewObj.phase = 2;
        thisNewObj.gameState.state = 'missile missed ship'
        let updatedNewObj = AIReact(thisNewObj)

        expect(updatedNewObj.triangulation).toBe(false)
        expect(updatedNewObj.hit).toBe(null)
        expect(updatedNewObj.phase).toBe(0)
        expect(updatedNewObj.target).toBe('B1')
        expect(updatedNewObj.gameState).toEqual(thisNewObj.gameState)


    })


    test('AI React when receiving an AI Object set to triangulation, with phase at 1, fires at either hit location or legal moves of hit location', () => {
        let phase1Obj = new AIObj()
        phase1Obj.triangulation = true;
        phase1Obj.phase = 1;
        phase1Obj.hit = 'A1';
        phase1Obj.target = 'A1';
        let updatedPhase1 = phase1Obj
        let i = 0
        let count = 0
        while( i <= 99){
            updatedPhase1 = _genNewObj(updatedPhase1)
            updatedPhase1.gameState.state = 'new game'
            updatedPhase1.triangulation = true;
            updatedPhase1.phase = 1
            updatedPhase1.hit = 'A1'
            count = updatedPhase1.target === 'A1' ? count : ++count 
            expect(_targetKeys('A1',1)).toContain(updatedPhase1.target)
            i++
        }
        expect(count).toBeGreaterThan(0)

        


    })

    test(
    'AI React when receiving an AI Object set to triangulation, with phase at 2, fires at either hit location or legal moves of hit location or legal moves of legal moves of hit location'
    , () => {
        let phase2Obj = new AIObj()
        phase2Obj.triangulation = true;
        phase2Obj.phase = 2;
        phase2Obj.hit = 'C3';
        phase2Obj.target = 'D3';
        let updatedPhase2 = phase2Obj
        let i = 0
        let targetCount = 0
        let onlyFirstOrderLegalsCount = 0
        while( i <= 99){
            updatedPhase2 = _genNewObj(updatedPhase2)
            updatedPhase2.gameState.state = 'new game'
            updatedPhase2.triangulation = true;
            updatedPhase2.phase = 2
            updatedPhase2.hit = 'C3'
            targetCount = updatedPhase2.target === 'C3' ? targetCount : ++targetCount
            onlyFirstOrderLegalsCount = _targetKeys('C3',1).includes(updatedPhase2.target) ? onlyFirstOrderLegalsCount : ++onlyFirstOrderLegalsCount 
            expect(_targetKeys('C3',2)).toContain(updatedPhase2.target)
            i++
        }
        expect(targetCount).toBeGreaterThan(0)
        expect(onlyFirstOrderLegalsCount).toBeGreaterThan(0)

    })

    test('AI React when receiving an AI Object set to triangulation, and has a hit, stores new hit location and returns phases to 1', () => {
        let hitObject = new AIObj()
        hitObject.triangulation = true;
        hitObject.hit = 'C3';
        hitObject.phase = 2;
        hitObject.target = 'D3'
        hitObject.gameState.state = 'missile hit ship'
        let updatedHitObj = AIReact(hitObject)
        
        expect(updatedHitObj.triangulation).toBe(true)
        expect(updatedHitObj.phase).toBe(1)
        expect(updatedHitObj.hit).toBe('D3')

    })

    test('AI React when receiving an AI Object set to triangulation, and has a missile blocked, retains previous hit location and returns phases to 1', () => {
        let blockedObject = new AIObj()
        blockedObject.triangulation = true;
        blockedObject.hit = 'C3';
        blockedObject.phase = 2;
        blockedObject.target = 'B3'
        blockedObject.gameState.state = 'missile blocked'
        let updatedBlockedObj = AIReact(blockedObject)
        
        expect(updatedBlockedObj.triangulation).toBe(true)
        expect(updatedBlockedObj.phase).toBe(1)
        expect(updatedBlockedObj.hit).toBe('C3')

    })
 
})

describe('testing updateStatus function',() => {
    
    test('updateStatus returns same AI Obj if gameState state is not a key',() => {
        let AI0 = new AIObj()
        let aiGameBoard0 = new gameBoard('missile blocked Panda')
        aiGameBoard0.board['B3'] = {'Panda': 'Panda'}
        AI0.gameState = aiGameBoard0
        expect(updateStatus(AI0).gameState.board).toEqual(aiGameBoard0.board)
        expect(updateStatus(AI0).gameState.state).toBe('missile blocked Panda')

    })


    test('updateStatus returns an AI Obj with the same gameBoard and a missile missed ship state if there is no impact',() => {
        let AI1 = new AIObj()
        let aiGameBoard = new gameBoard('A1')
        AI1.gameState = aiGameBoard
        expect(updateStatus(AI1).gameState.board).toEqual(aiGameBoard.board)
        expect(updateStatus(AI1).gameState.state).toBe('missile missed ship')

    })

    test('updateStatus returns an AI Obj with a valid gameboard which reflects damage done to ship and a missile hit ship state if ship hit',() => {
        let AI2 = new AIObj()
        let aiGameBoard2 = new gameBoard('C2')
        aiGameBoard2.board['C2'].contains = plantingShip()
        AI2.gameState = aiGameBoard2

        expect(updateStatus(AI2).gameState.board['C2'].contains.damage).toBe(1)
        expect(updateStatus(AI2).gameState.state).toBe('missile hit ship')

    })

    test('updateStatus returns an AI Obj with a valid gameboard which replaces ship with null and a missile sunk ship state if ship sinks from a hit',() => {
        let AI3 = new AIObj()
        let aiGameBoard3 = new gameBoard('B3')
        let plant = plantingShip()
        plant.damage = plant.breakPoint - 1
        aiGameBoard3.board['B3'].contains = plant
        AI3.gameState = aiGameBoard3
        
        expect(updateStatus(AI3).gameState.board['B3'].contains).toBe(null)
        expect(updateStatus(AI3).gameState.state).toBe('missile sunk ship')

    })

    test('updateStatus receives board with blocked targets, where the key is within range of those, then returns the same board (w/out trgts) with a missile blocked state', () => {
        let toBeBlocked = new AIObj()
        toBeBlocked.gameState.state = 'F5'
        toBeBlocked.target = 'F5'
        let blockedTargets = ['C2','D3', 'C4','E4','A1','F6']
        toBeBlocked.gameState.board['missileBlocked'] = blockedTargets
        toBeBlocked.gameState.board['A5'].contains = plantingShip()
        let blockedTargetsAndLegals = (function(){
            let finArr = [];
            for(let elem of blockedTargets){
                finArr = [...finArr, elem, ...new gameBoard().board[elem].legalMoves]
            }
            finArr = [...new Set([...finArr])]
            return finArr
        })()
        let i = 0;
        while(i <= 100){
            let newTry = updateStatus(toBeBlocked)
            if(blockedTargetsAndLegals.includes(newTry.target)){
                expect(Object.prototype.hasOwnProperty.call(newTry.gameState.board, 'missileBlocked')).toBe(false)
                expect(newTry.gameState.board['A5'].contains).toEqual(plantingShip())
                expect(newTry.gameState.state).toBe('missile blocked')
                return
            }
        }
    })

    test('updateStatus receives board with blocked targets, where the key is not in range, then behaves normally and removes them from the board', () => {
        let toBeBlocked2 = new AIObj()
        toBeBlocked2.gameState.state = 'F5'
        toBeBlocked2.gameState.board['missileBlocked'] = []
        toBeBlocked2.gameState.board['A3'].contains = plantingShip()
        expect(Object.prototype.hasOwnProperty.call(updateStatus(toBeBlocked2).gameState.board,'missileBlocked')).toBe(false)
        expect(updateStatus(toBeBlocked2).gameState.board['A3'].contains).toEqual(plantingShip())
      
    })

})

describe('testing sendStatus function', () => {
    
    const checkArray = []
    const fakeEventPublisher = function(someStr){
        if(someStr === 'updatePlayerState'){
            checkArray.push(1) 
        }
        else if(someStr === 'updateAIObject'){
            checkArray.push(2)
        } 
    }

    let getState = defaultConfig.getState

    const aiObjWithTargetKey = new AIObj()
    aiObjWithTargetKey.gameState.state = 'B5'

    const aiObjWithMissile = new AIObj()
    aiObjWithMissile.gameState.state = 'missile blocked'

    const aiObjWithTargetKey2 = new AIObj()
    aiObjWithTargetKey2.gameState.state = 'F3'

    const aiObjWithMissile2 = new AIObj()
    aiObjWithMissile2.gameState.state = 'missile hit ship'

    test('expect sendStatus to publish player state if the AI Object gameboard state is a target key', () => {
        sendStatus(aiObjWithTargetKey, getState, undefined, fakeEventPublisher)
        expect(checkArray[checkArray.length - 1]).toBe(1) 
        sendStatus(aiObjWithTargetKey2,getState, undefined, fakeEventPublisher) 
        expect(checkArray[checkArray.length - 1]).toBe(1)                                                                            
    })

    test('expect sendStatus to re-publish AI Object state if the AI Object gameboard state is about missile status', () => {
        sendStatus(aiObjWithMissile, getState, undefined, fakeEventPublisher)
        expect(checkArray[checkArray.length - 1]).toBe(2)
        sendStatus(aiObjWithMissile2, getState, undefined, fakeEventPublisher)
        expect(checkArray[checkArray.length - 1]).toBe(2)

    })

}) 
