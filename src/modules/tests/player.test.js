import {test,expect,describe} from "@jest/globals";
import { gameBoard } from "../gameboard";
import {playerObj, placeShip} from '../player';
import {legacyShip,plantingShip} from '../ships'


test('Player object has correct properites', () => {
    expect(new playerObj('player1')).toEqual(
        {
            name: 'player1',
            gameState: new gameBoard('new game')
        }
    )
})

test('Able to update player gameState', () => {
    const monkeyOnBoard = new gameBoard('test monkey')
    monkeyOnBoard.board.F1.contains = Object.assign({}, {name: 'monkey'})
    const player2 =  new playerObj('player2', monkeyOnBoard)
    expect(player2).toEqual(
        {
            name: 'player2',
            gameState: monkeyOnBoard
        }
    )
    expect(player2.gameState.board.F1.contains).toEqual({
           name: 'monkey'
    })
})

describe('testing placeShip function', () => {

    let first = new gameBoard('ship placed')
    let legacy = legacyShip()
    let target = first.board.A3
    placeShip(target,first,legacy)

    test('return a new gameBoard with a correctly placed ship',() => {
        expect(target.contains).toEqual(legacy)
    })
    
    let planting = plantingShip()
    placeShip(target,first,planting)

    test('return a new gameBoard with the ship that was previously in place', () => {
        expect(target.contains).toEqual(legacy)
    })


    let target1 = first.board.A4
    placeShip(target1,first,null)

    test('expect null when passing a \'null\' ship to an empty object', () => {
        expect(target1.contains).toEqual(null)
    })

    placeShip(target1,first,{isSunk: 'not sunk', damage: 44, type:'non-existing' })

    test('expect null when passing an ship object with missing properties', () => {
        expect(target1.contains).toEqual(null)
        placeShip(target1,first,{damage: 44, type: 'non-existing', breakPoint: 'someBreakPoint'})
        expect(target1.contains).toEqual(null)
    })


})



