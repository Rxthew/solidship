import { describe, expect, test } from '@jest/globals' 
import { gameBoard } from '../gameboard'
import * as ships from '../ships'
import { fireMissile } from '../AI'

describe('AI testing', () => {
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