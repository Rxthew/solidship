import { events } from './events.js';
import { gameBoard } from './gameboard.js';




export const gameEvents = events()
export const gameState = new gameBoard()


export const updateState = function(newState, receiver){
    receiver = Object.assign({},receiver)
    receiver.gameState = Object.assign({}, newState)
    return receiver
}

//see triggerAIEvts, before that publish updateState? 






