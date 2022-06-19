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
        'Dispatch : Hello there. We are the Dispatch '+
         'crew. Our remit is to explain what is going '+
         'on by providing status updates.'+
         '\n\nLet us begin by reminding you what the mission'+
         'is and what tasks we need to complete to'+
         'fulfil it. '+
         '\n\nAs you know these are international waters, and '+
         'we are looking to cultivate seagrass on this seabed. '+
         'You see, seagrass accounts for 10% of the ocean\'s '+ //link this part
         'capacity to store carbon. This aligns perfectly with '+
         'our goal to fight climate change.'+
         '\n\nIt is also important for marine conservation and '+
         'biodiversity, and this location has recently been added '+
         'to the growing index of our Restoration Plan. With this, '+
         'we shall be making an impact on a global level.'+
         '\n\nWe are making good progress, but you see...There\'s a problem'+
         '\n\nBig Oil has an interest in this territory because they believe '+
         'that there is petroleum underneath the sea floor.'+ 
         '\n\nNaturally, they are determined to mine the area to the point of '+
         'an ecological disaster. We have lawyers doing their best to settle '+
         'the matter legally, but it is taking a long time. In the mean time '+
         'a naval paramilitary group has been firing at our vessels. Big Oil '+
         'is doing everything to bully us off the area.'+
         '\n\nThat is where you come in. With you on our side, we can turn the'+
         'tide against them. We have provided you with two ships to start with '+
         'They are legacy warships, but we are a peaceful organisation and that '+
         'means that we cannot engage violently, therefore these have been stripped '+
         'of their attacking capacity. Their value is that they have a relatively high '+
         'breakpoint so they can endure more damage than a standard ship. '+
         '\n\nTo win this we need to achieve 3 objectives:'+
         '\n\n1. Numbers. We fill the whole area with our ships.'+
         '\n\n2. Protect the sea. We need to keep wreckage down to a minimum of X units.'+ //replace X
         '\n\n3. Continue the restoration effort. We need to have a minimum of Y units of seagrass'+//replace Y
         '\n\n We do this, and victory is ours, but if the enemy sinks all our ships, or the'+
         'wreckage rises above Z units then Big Oil will have won.'+//replace Z
         '\n\nThe odds are stacked against us, so we need to minimise time spent building and maintaining ships. '+
         'Remember, each day is precious so we must not waste them. To help you with designing the ships, we have '+
         'hired two consultants who will assist you during this campaign. Meet Tim and Audrey:'+
         '\n\nTim: Hello there! I\'m Tim.'+
         '\n\nAudrey: and this is Audrey. Pleasure to meet you.'+
         '\n\nDispatch: These two come from different backgrounds, take their advice with a grain of salt they will '+
         'sometimes disagree, and that is when you have to make a choice, but when they do agree then it is generally '+
         'a good idea to go along with it. You can also choose to discard their opinions completely if you wish.'+
         '\n\nWe shall leave you to it for now, but have a click around the consoles and we\'ll give you guidance on what you\re '+
         'working with, depending on what you click.',
    
    'missile missed ship' : () => 
        'Dispatch : It looks like the enemy has missed our ship. When that happens you will be getting a "missile missed ship" '+
        'status from us here in the log. \n\nThis is the best case scenario for us when the enemy attacks, but it does not come '+
        'a cost. Observe that the wreckage count has gone up. Therefore even when the enemy is off the mark, we still pay a '+
        'price since our mission is the protection of the seabed. Our fleet is just the means to achieve that objective.'+
        '\n\nNot to worry. I am sure that our clearing ships are up to the task. Right?'

    
          
    
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




