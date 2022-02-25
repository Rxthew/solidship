import { test,expect} from "@jest/globals";
import { updateState } from "../gamestate";
import { gameBoard} from '../gameboard'




test('state of gameBoard updates', () => {
const somePlayer = {
    randomMethod : 'randomMethod',
    gameState : {}
}
const newGame = new gameBoard('new game')
let updatedPlayer = updateState(newGame, somePlayer)
expect(updatedPlayer.gameState).toEqual(newGame)

const firstMove = new gameBoard('first move')
let firstMovePlayer = updateState(firstMove,somePlayer)
expect(firstMovePlayer.gameState).toEqual(firstMove)
})

