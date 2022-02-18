import { describe, expect, test } from '@jest/globals' 
import { createContainsObject, gameBoard, updateBoardContents } from '../gameboard'
import * as ships from '../ships'
import { fireMissile, AIObj, AIReact } from '../AI'

const _fullBoardGenerator = function(){
    let defense = ships.defenseShip
    let board = new gameBoard('full');
    let contains = createContainsObject(board)
    let allKeys = []
    for(let key of Object.keys(contains)){
        contains[key] = defense()
        allKeys.push(key)
    }
    board = updateBoardContents(board,contains)
    return{
        board,
        allKeys
    }
}


const _testBoardGenerator = function(someKey, someBorderRadius){
    let planting = ships.plantingShip
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
    let containsObj = createContainsObject(testBoard)
    for(let key of targetKeys){
        containsObj[key] = planting()
    }
    testBoard = updateBoardContents(testBoard,containsObj)
    return {
        testBoard,
        targetKeys
    }    
}

const _checkDamage = function(someBoard , targetKeys){ 
    for (let key of targetKeys){
        if(someBoard.board[key].contains.damage === 1){
            return true
        }
    }
    return false
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
                hit: null
                
            }
        )
    })
    
    test('Able to update player gameState', () => {
        const monkeyOnBoard = new gameBoard('test monkey')
        monkeyOnBoard.board.F1.contains = Object.assign({}, {name: 'monkey'})
        const player2 =  new AIObj(monkeyOnBoard)
        expect(player2).toEqual(
            {
                triangulation: false,
                phase: 0,
                gameState: monkeyOnBoard,
                hit: null
            }
        )
        expect(player2.gameState.board.F1.contains).toEqual({
               name: 'monkey'
        })
    })

//Note: when you finish this, check fire missile tests because they are likely redundant and will need to be removed.
    const planting = ships.plantingShip
    let someGameBoard = new gameBoard('some')
    someGameBoard.board.B4.contains = planting()
    let missileFired = fireMissile('B4', someGameBoard)

    test('fireMissile damages a ship if it hits it',() => {
        expect(missileFired.board.B4.contains.damage).toBe(1)

    })
    test('fireMissile returns the same gameBoard if there is no impact',() => {
        let secondMissileFired = fireMissile('A5',missileFired)
        expect(secondMissileFired).toEqual(missileFired)
        expect(secondMissileFired.board.A5.contains).toEqual(null)
    })

    test('AI React returns an AI Object with a valid gameState',() => {
        let fullBoard = _fullBoardGenerator().board
        let allKeys = _fullBoardGenerator().allKeys
        let aiObject1 = new AIObj()
        let aiObject2 = new AIObj(fullBoard)
        expect(AIReact(aiObject1)).toEqual(aiObject1)
        let newState = AIReact(aiObject2).gameState
        expect(_checkDamage(newState, allKeys)).toBe(true)

    })

    test('AI React returns an AI Object with mode set to triangulation, sets phase to 1 and stores hit location when missile hits a target', () => {
        let aiObject3 = new AIObj(_fullBoardGenerator().board)
        let newObj = AIReact(aiObject3)
        expect(newObj.triangulation).toBe(true)
        expect(_fullBoardGenerator().allKeys).toContain(newObj.hit)
        expect(newObj.phase).toBe(1)

    })

    test('AI React when receiving an AI Object set to triangulation, returns an AI Object reverted to default settings if a ship has just been sunk', () => {
        
        let aiObject4 = (function(){
            let firstFull = _fullBoardGenerator().board
            let allKeys = _fullBoardGenerator().allKeys
            let contObj = createContainsObject(firstFull)
            for(let key of allKeys){contObj[key].breakPoint = 1}
            let actualFull = updateBoardContents(firstFull, contObj)
            let someAIobj = new AIObj(actualFull)
            someAIobj.triangulation = true;
            someAIobj.hit = 'A1';
            someAIobj.phase = 1;
            return someAIobj
        })()


        let anotherObj = AIReact(aiObject4)
        expect(anotherObj.triangulation).toBe(false)
        expect(anotherObj.hit).toBe(null)
        expect(anotherObj.phase).toBe(0)

    })

    test('AI React when receiving an AI Object set to triangulation, returns an AI Object reverted to default settings if phase is currently 2', () => {
        let thisNewObj = new AIObj()
        thisNewObj.triangulation = true; 
        thisNewObj.hit = 'A1'
        thisNewObj.phase = 2;
        let updatedNewObj = AIReact(thisNewObj)

        expect(updatedNewObj.triangulation).toBe(false)
        expect(updatedNewObj.hit).toBe(null)
        expect(updatedNewObj.phase).toBe(0)

    })


    test('AI React when receiving an AI Object set to triangulation, with phase at 1, fires at either hit location or legal moves of hit location', () => {
        let phase1Obj = new AIObj(_testBoardGenerator('A1',1).testBoard)
        let updatedPhase1 = AIReact(phase1Obj)
        updatedPhase1.triangulation = true;
        updatedPhase1.phase = 1;
        updatedPhase1.hit = 'A1';

        expect(_checkDamage(updatedPhase1.gameState,_testBoardGenerator('A1',1).targetKeys))


    })

    test(
    'AI React when receiving an AI Object set to triangulation, with phase at 2, fires at either hit location or legal moves of hit location or legal moves of legal moves of hit location'
    , () => {
        let phase2Obj = new AIObj(_testBoardGenerator('C3',2).testBoard)
        let updatedPhase2 = AIReact(phase2Obj)
        updatedPhase2.triangulation = true;
        updatedPhase2.phase = 2;
        updatedPhase2.hit = 'C3';

        expect(_checkDamage(updatedPhase2.gameState,_testBoardGenerator('C3',2).targetKeys))

    })

    test('AI React when receiving an AI Object set to triangulation, and has a hit, stores new hit location and returns phases to 1', () => {
        let hitObject = new AIObj(_fullBoardGenerator().board)
        hitObject.triangulation = true;
        hitObject.hit = 'C3';
        hitObject.phase = 2;
        let updatedHitObj = AIReact(hitObject)
        
        expect(_fullBoardGenerator().allKeys).toContain(updatedHitObj.hit)
        expect(updatedHitObj.triangulation).toBe(true)
        expect(updatedHitObj.phase).toBe(1)

    })

    test('AI React when receiving an AI Object set to triangulation, with phase at 1, has missile blocked then fires at hit location', () => {

        let missileObj = new AIObj(_fullBoardGenerator().board)
        missileObj.triangulation = true;
        missileObj.hit = 'C3';
        missileObj.phase = 1;
        missileObj.gameState.state = 'missile blocked';
        missileObj.gameState.board.C3.contains.breakPoint = 7
        let count = 0
        let updatedMissileObj = missileObj
        while(count <= 4){
            updatedMissileObj = _genNewObj(updatedMissileObj)
            updatedMissileObj.phase = 1
            updatedMissileObj.gameState.state = 'missile blocked'
            count += 1
            expect(updatedMissileObj.gameState.board.C3.contains.damage).toBe(count)
        }
        expect(updatedMissileObj.gameState.board.C3.contains.damage).toBe(5)

    })

    test('AI React when receiving an AI Object set to triangulation, with phase at 2, has missile blocked, then fires at one of hit location or hit legal Moves', () => {

        let missileObj = new AIObj(_fullBoardGenerator().board)
        missileObj.triangulation = true;
        missileObj.hit = 'C3';
        missileObj.phase = 2;
        missileObj.gameState.state = 'missile blocked';
        missileObj.gameState.board.C3.contains.breakPoint = 7
        let count = 0
        let updatedMissileObj = missileObj
        while(count <= 4){
            updatedMissileObj = _genNewObj(updatedMissileObj)
            updatedMissileObj.phase = 2
            updatedMissileObj.gameState.state = 'missile blocked'
            count += 1
            expect(updatedMissileObj.gameState.board.C3.contains.damage).toBe(count)
        }
        expect(updatedMissileObj.gameState.board.C3.contains.damage).toBe(5)
    })
})