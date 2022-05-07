import { events } from './events.js';
import {gameBoard} from './gameboard.js'
import {subscribePlayerEvts} from './player.js'
import { subscribeAIEvts } from './AI.js';
import { subscribeUIEvents } from './UI.js'


export const gameEvents = events()
const newGs = new gameBoard('new game')

export const updateState = function(receiver,newState){
    receiver = Object.assign({},receiver)
    receiver.gameState = Object.assign({}, newState)
    return receiver
}

export const gameLoop = function(playerName){ //this should be some input value from the intial screen. 
    subscribeAllEvents()
    gameEvents.publish('initGame', playerName) //Note: re this line , hop over to the UI.js and subscribe renderState to initGame
    //now you need to make a new initial gameState, update that state for player and ai and then ->
    //publish(renderGameState, newgs)
    gameEvents.publish('updateGameState',updateState,newGs)
    gameEvents.publish('renderGameState',newGs )                                                
    
}


export const subscribeAllEvents = function(){
    subscribePlayerEvts(gameEvents.subscribe)
    subscribeAIEvts(gameEvents.subscribe)
    subscribeUIEvents(gameEvents.subscribe)
}






