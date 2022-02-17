import { test,expect } from "@jest/globals";
import { updateState } from "../gamestate";
import { gameBoard} from '../gameboard'
import { playerObj } from "../player";



test('state of gameBoard updates', () => {
const newGame = new gameBoard('new game now!')
const somePlayer = new playerObj('some player')
let updatedPlayer = updateState(somePlayer, newGame)
expect(updatedPlayer.gameState).toEqual(newGame)

const firstMove = new gameBoard('first move')
let firstMovePlayer = updateState(somePlayer,firstMove)
expect(firstMovePlayer.gameState).toEqual(firstMove)
})