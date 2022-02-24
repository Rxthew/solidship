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
    let newFirst = placeShip(new gameBoard().board,first.board,legacy,target)
    

    test('return a new gameBoard with a correctly placed ship',() => {
        expect(newFirst.board[target].contains).toEqual(legacy)
    })
    
    let planting = plantingShip()
    let anotherBoard = placeShip(newFirst.board,new gameBoard('ship placed').board,planting,target)

    test('return occupied zone error', () => {
        expect(anotherBoard).toEqual({error: 'This zone is occupied'})
    })

    let target1 = 'A4'
    let newFirst2 = placeShip(first.board, new gameBoard('ship placed').board,null,target1)

    test('expect error when passing a \'null\' ship to an empty object', () => {
        expect(newFirst2).toEqual({error: 'Ship has missing properties'})
    })

    let newFirst3 = placeShip(new gameBoard().board, new gameBoard('ship placed').board,{isSunk: 'not sunk', damage: 44, type:'non-existing' },target1)

    test('expect error when passing a ship object with missing properties', () => {
        expect(newFirst3).toEqual({error: 'Ship has missing properties'})
        let newFirst4 = placeShip(new gameBoard().board, new gameBoard().board,{damage: 44, type: 'non-existing', breakPoint: 'someBreakPoint'},target1)
        expect(newFirst4).toEqual({error: 'Ship has missing properties'})
    })

})

describe('testing moveShip function', () => {
    let first = new gameBoard().board
    let legacy = legacyShip()
    let source = 'A5'

   
    let second = placeShip(first,new gameBoard().board,legacy,source).board
    

    test('Move illegal should return error', () => {
        expect(moveShip(second,new gameBoard().board,source,'F6')).toEqual({error: 'This move is illegal'})
        expect(second['F6'].contains).toEqual(null)
        expect(second[source].contains).toEqual(legacy)

    })

    
    let third = moveShip(placeShip(new gameBoard().board,new gameBoard().board,legacy,source).board,new gameBoard().board,source,'A6')
    test('Legal move should return a new gameBoard', () => {
        expect(third.board['A6'].contains).toEqual(legacy)
        expect(third.board[source].contains).toEqual(null)
    })
    let fourth = moveShip(third.board,new gameBoard().board,'A6','A5')
    test('move back returns previous results',() => {
        expect(fourth.board['A6'].contains).toEqual(null)
        expect(fourth.board['A5'].contains).toEqual(legacy)
    })
    
    
})






