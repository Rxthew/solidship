import { describe, expect, test } from '@jest/globals' 
import { createContainsObject, gameBoard, updateBoardContents } from '../gameboard'
import * as ships from '../ships'
import { fireMissile, AIObj } from '../AI'

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
    return testBoard
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
    test('AI React returns an AI Object with a different but valid gameboard key every time',() => {

    })

    test('AI React returns an AI Object with mode set to triangulation, sets phase to 1 and stores hit location when missile hits a target', () => {

    })

    test('AI React when receiving an AI Object set to triangulation, returns an AI Object reverted to default settings if a ship has just been sunk', () => {

    })

    test('AI React when receiving an AI Object set to triangulation, returns an AI Object reverted to default settings if phase is currently 2', () => {

    })

    test('AI React when receiving an AI Object set to triangulation, and has a hit, stores new hit location and returns phases to 1', () => {

    })

    test('AI React when receiving an AI Object set to triangulation, with phase at 1, fires at either hit location or legal moves of hit location', () => {

    })

    test(
    'AI React when receiving an AI Object set to triangulation, with phase at 2, fires at either hit location or legal moves of hit location or legal moves of legal moves of hit location'
    , () => {

    })

    test('AI React when receiving an AI Object set to triangulation, with phase at 1, has missile blocked then fires at hit location', () => {
        

    })

    test('AI React when receiving an AI Object set to triangulation, with phase at 2, has missile blocked, then fires at one of hit location or hit legal Moves', () => {

    })
})