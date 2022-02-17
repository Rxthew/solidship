import { test,expect } from "@jest/globals";
import { updateState } from "../gamestate";
import { gameBoard} from '../gameboard'



test('state of gameBoard updates', () => {
const somePlayer = {
    randomMethod : 'randomMethod',
    state : {}
}
const newGame = new gameBoard('new game')
let updatedPlayer = updateState(somePlayer, newGame)
expect(updatedPlayer.state).toEqual(newGame.state)

const firstMove = new gameBoard('first move')
let firstMovePlayer = updateState(somePlayer,firstMove)
expect(firstMovePlayer.state).toEqual(firstMove.state)
})