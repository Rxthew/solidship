import { events } from './events.js';
import {gameBoard, defaultConfig} from './gameboard.js'
import { legacyShip } from './ships.js';
import {subscribePlayerEvts} from './player.js'
import { subscribeAIEvts } from './AI.js';
import { subscribeUIEvents } from './UI.js'


export const gameEvents = events()
const newGs = (function(){
    let gs = new gameBoard('new game');
    let board = defaultConfig.getBoard(gs)
    defaultConfig.setBoardContains(board,'B3',legacyShip())
    defaultConfig.setBoardContains(board,'D3',legacyShip())
    return gs

})()

export const updateState = function(receiver,newState){
    receiver = Object.assign({},receiver)
    receiver.gameState = Object.assign({}, newState)
    return receiver
}

export const isGameOver = function(gs, getW=defaultConfig.getWreckCount, getP=defaultConfig.getPlantCount, publish=gameEvents.publish, getB=defaultConfig.getBoard, getCont = defaultConfig.getBoardContains){
    if(typeof gs !== 'object'){
        return
    }
    const currentWreckage = getW(gs)
    const currentPlants = getP(gs)
    const board = getB(gs)
    let shipCount = 0
    for(let zone of Object.keys(board)){
        if(getCont(board,zone) !== null){
            shipCount++
        }
    }
    if(shipCount === 36 && currentPlants >= 200 && currentWreckage <= 5){
        publish('renderGameState', new gameBoard('Player Won'))
        return
    }
    else if(shipCount === 0 || currentWreckage >= 200 ){
        publish('renderGameState',new gameBoard('Player Lost'))
        return
    }
    return
    
}

const _eventsToRespondTo = {
    'test' : () => 'test',
    'new game' :  () => 
        'Dispatch : Hello there. We are the dispatch '+
         'crew.\nOur remit is to explain what is going '+
         'on\nby providing status updates. '+
         '\n\nLet us begin by reminding you what the mission'+
         '\nis and what tasks we need to complete to'+
         '\nfulfil it',
    
}

let _alreadyHappened = []

export const firstHappeningSensor = function(str, publish=gameEvents.publish){ 
    if(_alreadyHappened.includes(str)){
        return _alreadyHappened
    }
    else if(Object.keys(_eventsToRespondTo).includes(str)){
        _alreadyHappened = [..._alreadyHappened,str]
        publish('renderLog', _eventsToRespondTo[str]())
        return _alreadyHappened
    }
    return _alreadyHappened
}

export let gameTime = {days : 0}

export const logCounts = function(gs,getW=defaultConfig.getWreckCount,getP=defaultConfig.getPlantCount,publish=gameEvents.publish){
    if(typeof gs !== 'object'){
        return
    }
    const currentCounts =  [getW(gs), getP(gs),++gameTime.days]
    publish('renderLog',currentCounts)

}

const _thresholds = ( () => {
    const _wreckageThresholds = new Map()
    const _plantThresholds = new Map()
    const _daysThresholds = new Map()

    _wreckageThresholds.set(1,'first wreckage')
    _plantThresholds.set(1,'first plant')
    _daysThresholds.set(1,'first day') 


    return [
        _wreckageThresholds,
        _plantThresholds,
        _daysThresholds
    ]

})()

export const thresholdSensor = function(gs,getW=defaultConfig.getWreckCount,getP=defaultConfig.getPlantCount,publish=gameEvents.publish){
    if(typeof gs !== 'object'){
        return
    }
    const currentCounts =  [getW(gs), getP(gs),gameTime.days]
    for(let ind = 0; ind < currentCounts.length; ind++){
        let val = currentCounts[ind]
        let thresholdOrder = _thresholds[ind].keys()
        let valueToCheck = thresholdOrder.next().value
        if(valueToCheck <= val){
            publish('senseEvent',_thresholds[ind].get(valueToCheck))
            _thresholds[ind].delete(valueToCheck)
        }       
    }
    return
}


export const subscribeAllEvents = function(){
    gameEvents.subscribe('senseEvent', isGameOver)
    gameEvents.subscribe('senseEvent', firstHappeningSensor)
    gameEvents.subscribe('senseEvent', logCounts)
    gameEvents.subscribe('senseEvent', thresholdSensor)
    subscribePlayerEvts(gameEvents.subscribe)
    subscribeAIEvts(gameEvents.subscribe)
    subscribeUIEvents(gameEvents.subscribe)
}

export const gameLoop = function(playerName){ //this should be some input value from the intial screen. 
    subscribeAllEvents()
    gameEvents.publish('initGame', playerName) //Note: re this line , hop over to the UI.js and subscribe renderState to initGame
    //now you need to make a new initial gameState, update that state for player and ai and then ->
    //publish(renderGameState, newgs)
    gameEvents.publish('updateGameState',updateState,newGs)
    gameEvents.publish('renderGameState',newGs )                                                
    
}




