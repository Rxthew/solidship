import {test,expect,describe} from "@jest/globals";
import { gameBoard, } from "../gameboard";
import {playerObj, placeShip, moveShip, playerReact} from '../player';
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

describe('testing playerReact function',() => {
    
    test('Player React returns a valid gameState which returns the same gameBoard and a missile missed ship state if there is no impact',() => {
        let aiGameBoard = new gameBoard('A1')
        expect(playerReact(aiGameBoard).gameState.board).toEqual(aiGameBoard.board)
        expect(playerReact(aiGameBoard).gameState.state).toBe('missile missed ship')

    })

    test('Player React returns a valid gameState which reflects damage done to ship and a missile hit ship state if ship hit',() => {
        let aiGameBoard2 = new gameBoard('C2')
        aiGameBoard2.board['C2'].contains = plantingShip()

        expect(playerReact(aiGameBoard2).gameState.board['C2'].contains.damage).toBe(1)
        expect(playerReact(aiGameBoard2).gameState.state).toBe('missile hit ship')

    })

    test('Player React returns a valid gameState which replaces ship with null and a missile sunk ship state if ship sinks from a hit',() => {
        let aiGameBoard3 = new gameBoard('B3')
        let plant = plantingShip()
        plant.damage = plant.breakPoint - 1
        aiGameBoard3.board['B3'].contains = plant
        
        expect(playerReact(aiGameBoard3).gameState.board['B3']).toBe(null)
        expect(playerReact(aiGameBoard3).gameState.state).toBe('missile sunk ship')

    })


    test('if PlayerReact is passed placeShip function returns a new gameboard with a correctly placed ship (+ state)', () => {
        let first = new gameBoard('ship placed')
        let legacy = legacyShip()
        let target = 'A3'
        let newReact = playerReact(placeShip(target,first,legacy)) 

        expect(newReact.gameState.board[target].contains).toEqual(legacy)

    })

    test('if PlayerReact is passed moveShip function in a legal move returns a new gameBoard with newly positioned ship',() => {
        let first = new gameBoard('place a ship')
        let legacy = legacyShip()
        let source = 'A5'
    
        let second = placeShip(source,first,legacy)
        let third = moveShip('A6',placeShip(source,second,legacy),source)
        
        expect(third.board['A6'].contains).toEqual(legacy)
        expect(third.board[source].contains).toEqual(null)
        
        let fourth = moveShip('A5',third,'A6')
        
        expect(fourth.board['A6'].contains).toEqual(null)
        expect(fourth.board['A5'].contains).toEqual(legacy)
        

    })


    test(
        'Key in board state passed in Player React corresponds to a key/legal moves of key where a defense ship is, and missileBlock func passed in. Expect same board with missile blocked state', () => {
        
        
            })
})






