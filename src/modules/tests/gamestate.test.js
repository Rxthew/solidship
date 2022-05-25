import { describe,test,expect} from "@jest/globals";
import { updateState, isGameOver,gameEvents } from "../gamestate";
import { gameBoard} from '../gameboard'




test('state of gameBoard updates', () => {
const somePlayer = {
    randomMethod : 'randomMethod',
    gameState : {}
}
const newGame = new gameBoard('new game')
let updatedPlayer = updateState(somePlayer, newGame)
expect(updatedPlayer.gameState).toEqual(newGame)

const firstMove = new gameBoard('first move')
let firstMovePlayer = updateState(somePlayer,firstMove)
expect(firstMovePlayer.gameState).toEqual(firstMove)
})

describe('testing isGameOver',() => {
    let check = 0
    let dummyPublisher = function(gs){
        if(gs.state === 'Player Won'){
            check+= 2          
        }
        else if(gs.state === 'Player Lost'){
            check+= 1
        }
    return
    }
    gameEvents.subscribe('renderGameState', dummyPublisher)

    test('expect player to win if gameboard fully populated and plant count >== 100', () => {
        let winner = new gameBoard()
        for (let zone of Object.keys(winner.board)){
            winner.board[`${zone}`].contains = {ship : 'placeholder'}
        }
        winner.plants = 100 
        isGameOver(winner)
        expect(check).toBe(2)
        winner.plants = 101
        isGameOver(winner)
        expect(check).toBe(4)
        winner.plants = 99
        isGameOver(winner)
        expect(check).toBe(4)

    })

    test('expect player to lose if gameboard empty', () => {
        let loser = new gameBoard()
        isGameOver(loser)
        expect(check).toBe(5)

    })

    test('expect player to lose if wreckage is 100 and over', () => {
        let loserTheSecond = new gameBoard()
        loserTheSecond.board.A1.contains = {ship : 'placeholder'}

        loserTheSecond.wreckage = 99
        isGameOver(loserTheSecond)
        expect(check).toBe(5)

        loserTheSecond.wreckage = 100
        isGameOver(loserTheSecond)
        expect(check).toBe(6)

        loserTheSecond.wreckage = 101
        isGameOver(loserTheSecond)
        expect(check).toBe(7)
    })

    test('expect nothing to happen if the above conditions not met', () => {
        let ongoingBoard = new gameBoard()

        ongoingBoard.board.A1.contains = {ship : 'placeholder'}
        isGameOver(ongoingBoard)
        expect(check).toBe(7)

        for (let zone of Object.keys(ongoingBoard.board)){
            ongoingBoard.board[`${zone}`].contains = {ship : 'placeholder'}
        }

        isGameOver(ongoingBoard)
        expect(check).toBe(7)

        ongoingBoard.plants = 99
        ongoingBoard.wreckage = 99

        isGameOver(ongoingBoard)
        expect(check).toBe(7)

        
    })


    

})