import { describe, expect, test } from '@jest/globals' 
import { createContainsObject, gameBoard, defaultConfig } from '../gameboard'
import {AIObj, AIReact, updateStatus, sendStatus, gameAI, updateAIWrapper } from '../AI'
import { plantingShip, legacyShip, clearingShip } from '../ships'


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

    test('AI React when receiving an AI Object set to triangulation, and has a missile blocked, behaves the same way as if hit', () => {
        let blockedObject = new AIObj()
        blockedObject.triangulation = true;
        blockedObject.hit = 'C3';
        blockedObject.phase = 2;
        blockedObject.target = 'B3'
        blockedObject.gameState.state = 'missile blocked'
        let updatedBlockedObj = AIReact(blockedObject)
        
        expect(updatedBlockedObj.triangulation).toBe(true)
        expect(updatedBlockedObj.phase).toBe(1)
        expect(updatedBlockedObj.hit).toBe('B3')

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

    test('updateStatus w/missed missile increases wreckage count by 1', () => {
        let missedAI = new AIObj()
        let missedGb = new gameBoard('A6')
        missedGb.wreckage = 2
        missedAI.gameState = missedGb
        expect(updateStatus(missedAI).gameState.wreckage).toBe(3)

    })

    test('updateStatus returns an AI Obj with a valid gameboard which reflects damage done to ship and a missile hit ship state if ship hit',() => {
        let AI2 = new AIObj()
        let aiGameBoard2 = new gameBoard('C2')
        aiGameBoard2.board['C2'].contains = plantingShip()
        AI2.gameState = aiGameBoard2

        expect(updateStatus(AI2).gameState.board['C2'].contains.damage).toBe(1)
        expect(updateStatus(AI2).gameState.state).toBe('missile hit ship')

    })

    test('updateStatus w/missile hit increases wreckage count by 2', () => {
        let hitAI = new AIObj()
        let hitGb = new gameBoard('C2')
        hitGb.board['C2'].contains = legacyShip()
        hitGb.wreckage = 2
        hitAI.gameState = hitGb

        expect(updateStatus(hitAI).gameState.wreckage).toBe(4)
        
    })

    test('updateStatus returns an AI Obj with a valid gameboard which replaces ship with null and a missile sunk ship state if ship sinks from a hit',() => {
        let AI3 = new AIObj()
        let aiGameBoard3 = new gameBoard('B3')
        let plant = plantingShip()
        plant.damage = plant.breakpoint - 1
        aiGameBoard3.board['B3'].contains = plant
        AI3.gameState = aiGameBoard3
        
        expect(updateStatus(AI3).gameState.board['B3'].contains).toBe(null)
        expect(updateStatus(AI3).gameState.state).toBe('missile sunk ship')

    })

    test('updateStatus w/missile sinking random ship increases wreckage count by 5', () => {
        let sunkAI = new AIObj()
        let sunkGb = new gameBoard('B3')
        let l = legacyShip()
        l.damage = l.breakpoint - 1
        sunkGb.board['B3'].contains = l
        sunkGb.wreckage = 3
        sunkAI.gameState = sunkGb
        expect(updateStatus(sunkAI).gameState.wreckage).toBe(8)
        
    })

    test('updateStatus w/missile sinking planting ship decreases plant count by amount held by ship, if any, (& no negaive numbers)', () => {
        let hugePlants = plantingShip()
        hugePlants.properties.equipment.count.plants = 50
        hugePlants.damage = hugePlants.breakpoint - 1

        let sunkAI2 = new AIObj()
        let sunkGb2 = new gameBoard('B3')
        let sunkGb3 = new gameBoard('B3')
        sunkGb2.plants = 51
        sunkGb3.plants = 10
        sunkGb2.board['B3'].contains = hugePlants
        sunkGb3.board['B3'].contains = hugePlants
        sunkAI2.gameState = sunkGb2
        expect(updateStatus(sunkAI2).gameState.plants).toBe(1)
        sunkAI2.gameState = sunkGb3
        expect(updateStatus(sunkAI2).gameState.plants).toBe(0)
        sunkAI2.gameState = new gameBoard('A6')
        sunkAI2.gameState.board.A6.contains = plantingShip()
        sunkAI2.gameState.plants = 5;
        expect(updateStatus(sunkAI2).gameState.plants).toBe(5)

        
    })

    test('updateStatus w/missile sinking clearing ship increases wreckage count by amount held by ship (+ the usual sinking amount)', () => {
        let clearer = clearingShip();
        clearer.properties.equipment.count.wreckage = 10
        let clearer2 = clearingShip();
        clearer2.properties.equipment.count.wreckage = 4

        clearer.damage = clearer.breakpoint - 1
        clearer2.damage = clearer2.breakpoint - 1


        let sunkAI3 = new AIObj()
        let sunkGb4 = new gameBoard('B3')
        sunkGb4.wreckage = 5
        sunkGb4.board.B3.contains = clearer
        let sunkGb5 = new gameBoard('B5')
        sunkGb5.board.B5.contains = clearer2
        sunkAI3.gameState = sunkGb4
        expect(updateStatus(sunkAI3).gameState.wreckage).toBe(20)
        sunkAI3.gameState = sunkGb5
        expect(updateStatus(sunkAI3).gameState.wreckage).toBe(9)


        
    })

    test('updateStatus receives board with blocked targets, where the key is within range of those, then returns the same board (w/out trgts) with a missile blocked state', () => {
        let toBeBlocked = new AIObj()
        toBeBlocked.gameState.state = 'F5'
        toBeBlocked.target = 'F5'
        let toBeBlocked1 = new AIObj()
        toBeBlocked1.gameState.state = 'B6'
        toBeBlocked1.target = 'B6'
        let blockedTargets = ['F5','B6','C2']
        toBeBlocked.gameState.board['missileBlocked'] = blockedTargets
        toBeBlocked.gameState.board['A5'].contains = plantingShip()
        toBeBlocked1.gameState.board['missileBlocked'] = blockedTargets
        let newTry = updateStatus(toBeBlocked)
        let newTry2 = updateStatus(toBeBlocked1)
        expect(Object.prototype.hasOwnProperty.call(newTry.gameState.board, 'missileBlocked')).toBe(false)
        expect(Object.prototype.hasOwnProperty.call(newTry2.gameState.board, 'missileBlocked')).toBe(false)
        expect(newTry.gameState.board['A5'].contains).toEqual(plantingShip())
        expect(newTry.gameState.state).toBe('missile blocked')
        expect(newTry2.gameState.state).toBe('missile blocked')
        
        
    })

    test('updateStatus w/missile blocked increases wreckage count by 2', () => {
        let blockedWreck = new AIObj()
        blockedWreck.gameState.state = 'C4'
        blockedWreck.target = 'C4'
        blockedWreck.gameState.wreckage = 2
        blockedWreck.gameState.board['missileBlocked'] = ['C4']
        expect(updateStatus(blockedWreck).gameState.wreckage).toBe(4)
        
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
        let targets = ['updateAIObj','updateGameState','renderGameState','renderImpact','senseEvent']
        checkArray.push(targets.indexOf(someStr))
        return
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



    test('expect sendStatus to publish specific events, but only if the AI Object gameboard state is about missile status', () => {
        sendStatus(aiObjWithMissile, getState, fakeEventPublisher)
        expect(checkArray).toEqual([0,1,2,3,4])
        sendStatus(aiObjWithMissile2, getState, fakeEventPublisher)
        expect(checkArray).toEqual([0,1,2,3,4,0,1,2,3,4])
        sendStatus(aiObjWithTargetKey,getState,fakeEventPublisher)
        expect(checkArray).toEqual([0,1,2,3,4,0,1,2,3,4])
        sendStatus(aiObjWithTargetKey2,getState,fakeEventPublisher)
        expect(checkArray).toEqual([0,1,2,3,4,0,1,2,3,4])

    })

}) 

test('updateAIWrapper takes a function which produces an AI Object, invokes that function sets gameAI to the resulting AI Object', () =>{
    const turnIntoTestMonkey = function(aiobj){
        aiobj.gameState.state = 'test monkey'
        return aiobj
    }
    
    updateAIWrapper(turnIntoTestMonkey)
    expect(gameAI.sessionAI.gameState.state).toBe('test monkey')
    updateAIWrapper(AIReact)
    expect(gameAI.sessionAI.gameState.state.length).toBe(2)

})
