import { events } from './events.js';



export const gameEvents = events()


export const updateState = function(newState, receiver){
    receiver = Object.assign({},receiver)
    receiver.gameState = Object.assign({}, newState)
    return receiver
}



