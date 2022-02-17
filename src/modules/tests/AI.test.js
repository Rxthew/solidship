import { describe, expect, test } from '@jest/globals' 
import { gameBoard } from '../gameboard'
import * as ships from '../ships'
import { fireMissile, AIObj } from '../AI'

describe('AI testing', () => {

    test('AI object has correct properites', () => {
        expect(new AIObj()).toEqual(
            {
                mode: 'general',
                phase: null,
                gameState: new gameBoard('new game')
            }
        )
    })
    
    test('Able to update player gameState', () => {
        const monkeyOnBoard = new gameBoard('test monkey')
        monkeyOnBoard.board.F1.contains = Object.assign({}, {name: 'monkey'})
        const player2 =  new AIObj(monkeyOnBoard)
        expect(player2).toEqual(
            {
                mode: 'general',
                phase: null,
                gameState: monkeyOnBoard
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
})