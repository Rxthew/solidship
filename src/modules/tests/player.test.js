import {test,expect,describe} from "@jest/globals";
import { gameBoard } from "../gameboard";
import {playerObj, placeShip,moveShip} from '../player';
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
    let target = 'A3'
    let newFirst = placeShip(target,first,legacy)

    test('return a new gameBoard with a correctly placed ship',() => {
        expect(newFirst.board[target].contains).toEqual(legacy)
    })
    
    let planting = plantingShip()
    let anotherBoard = placeShip(target,newFirst,planting)

    test('return a new gameBoard with the ship that was previously in place', () => {
        expect(anotherBoard.board[target].contains).toEqual(legacy)
    })

    let target1 = 'A4'
    let newFirst2 = placeShip(target1,first,null)

    test('expect null when passing a \'null\' ship to an empty object', () => {
        expect(newFirst2.board[target1].contains).toEqual(null)
    })

    let newFirst3 = placeShip(target1,newFirst2,{isSunk: 'not sunk', damage: 44, type:'non-existing' })

    test('expect null when passing a ship object with missing properties', () => {
        expect(newFirst3.board[target1].contains).toEqual(null)
        let newFirst4 = placeShip(target1,newFirst3,{damage: 44, type: 'non-existing', breakPoint: 'someBreakPoint'})
        expect(newFirst4.board[target1].contains).toEqual(null)
    })

})

describe('testing moveShip function', () => {
    let first = new gameBoard('place a ship')
    let legacy = legacyShip()
    let source = 'A5'

    let second = placeShip(source,first,legacy)


    test('Move illegal should return same gameBoard', () => {
        expect(moveShip('F6',second,source)).toEqual(second)
        expect(second.board['F6'].contains).toEqual(null)
        expect(second.board[source].contains).toEqual(legacy)

    })
    let third = moveShip('A6',placeShip(source,second,legacy),source)
    test('Legal move should return a new gameBoard', () => {
        expect(third.board['A6'].contains).toEqual(legacy)
        expect(third.board[source].contains).toEqual(null)
    })
    let fourth = moveShip('A5',third,'A6')
    test('move back returns previous results',() => {
        expect(fourth.board['A6'].contains).toEqual(null)
        expect(fourth.board['A5'].contains).toEqual(legacy)
    })
    
    
})



