import { events } from './events.js';

export const gameEvents = events()


export const updateState = function(receiver, newState){
    receiver.gameState = Object.assign({}, newState)
    return receiver
}



