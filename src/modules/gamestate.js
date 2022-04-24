import { events } from './events.js';
import { gameBoard } from './gameboard.js';
import { subscribeAIEvts } from './AI.js';
import { subscribeUIEvents } from './UI.js'




export const gameEvents = events()
export const gameState = new gameBoard()


export const updateState = function(receiver,newState){
    receiver = Object.assign({},receiver)
    receiver.gameState = Object.assign({}, newState)
    return receiver
}




//gameLoop(name i.e input.value){
    //let playerObj = new playerObj(name)
    //publish('initGame', playerObj.gameState) //Note: re this line , hop over to the UI.js and subscribe renderState to initGame                                                
    ////subFunc('updateGameState', playerObj.gameState)
    //subAllEvts()


//}


export const subscribeAllEvents = function(){
    subscribeAIEvts(gameEvents.subscribe)
    subscribeUIEvents(gameEvents.subscribe)
}






