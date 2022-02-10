import { test,expect } from "@jest/globals";
import { updateState } from "../gamestate";
import { gameBoard} from '../gameboard'



test('state of gameBoard updates', () => {
const somePlayer = {
    randomMethod : 'randomMethod',
    gameState : {}
}
const newGame = new gameBoard('new game')
updateState(somePlayer.gameState, newGame)
expect(somePlayer.gameState).toEqual(newGame)

const firstMove = new gameBoard('first move')
updateState(somePlayer.gameState,firstMove)
expect(somePlayer.gameState).toEqual(firstMove)
})