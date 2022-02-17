import { events } from './events.js';

export const gameEvents = events()


export const updateState = function(receiver, newState){
    receiver = Object.assign({},receiver, newState)
    return receiver
}



