import { createSkip, populateOptionsConsole  } from './UI modules/options'
import { defaultConfig } from './gameboard'
import { displayShip } from './UI modules/uiship'
import { finishers } from './UI modules/consoles'
import { gameEvents, gameLoop } from './gamestate.js'
import { UIBoard } from './UI modules/uiboard'

//*** To be reviewed
const renderAIEffect = function(){
    return
}

const renderPlayerEffect = function(){
    return
}

export const createDispatchLog = function(){
    const dispatchElements = (function(){
        const logContainer = document.createElement('section')
        const log = document.createElement('div')
        return {
            logContainer,
            log,
        }
    })()

    document.querySelector('main').appendChild(dispatchElements.logContainer)
    dispatchElements.logContainer.appendChild(dispatchElements.log)
}

export const printLog = function(str,type='regular'){
    let printMode = {
        regular : function(){
            //add  text as a span

        },
        error : function(){
            //add text as a span with classList as an error.
            

        }

    }
    const solidImplement = function(type){
        printMode['regular']()
        document.querySelector(`#${type}ltr`).classList.contains('collected') ? document.querySelector(`#${type}ltr`).classList.add('collected') : false
    }
    type.length > 1 ? printMode[type]() : solidImplement(type)
    return

}

export const printValues = function(counts){
    if(Array.isArray(counts)){
        let globalWreckage = document.querySelector('#globalWreckage')
        let globalPlants = document.querySelector('#globalPlants')
        let days = document.querySelector('#days')
        globalWreckage.textContent, globalPlants.textContent, days.textContent = counts
    }
    return

}

//*** end "To be reviewed"

const intiialiseMainConsole = function(){
    finishers.main()
    return document.querySelector('.mainConsole')
}

const initialiseNavBar = function(){
    finishers.nav()
    return document.querySelector('#navBar')
}

const initialiseViewConsole = function(){
    finishers.view()
    return document.querySelector('.viewConsole')
}

const initialiseOptionsConsole = function(...params){
    finishers.opts()
    populateOptionsConsole(...params)
    return document.querySelector('#opts')
    
}


export const renderState = function(someGameState, someGetCont=defaultConfig.getBoardContains, gb=defaultConfig.getBoard, publish=gameEvents.publish){
    UIBoard(someGameState,someGetCont,gb,publish)
    intiialiseMainConsole()
    initialiseNavBar()
    initialiseViewConsole()
    initialiseOptionsConsole(null,someGameState,someGetCont,gb)
    createSkip()   
}


export const landingPage = function(){

    const initNodes = (function(){
        const gameContainer = document.createElement('main')
        const header = document.createElement('header')
        const headline = document.createElement('h1')
        const playerNameForm = document.createElement('form')
        const formContainer = document.createElement('div')
        const playerLabel = document.createElement('label')
        const playerInput = document.createElement('input')
        const playerSubmit = document.createElement('button')
        return {
            gameContainer,
            header,
            headline,
            playerNameForm,
            formContainer,
            playerLabel,
            playerInput,
            playerSubmit
        }
    })()
    
    const setTextContent = function(){
        initNodes.headline.textContent = 'SOLIDSHIP' 
        initNodes.playerLabel.textContent = 'What is your name?'
        initNodes.playerSubmit.textContent = 'Submit'
    }

    const setAttributes = function(){
        initNodes.playerLabel.setAttribute('for','playerName')
        initNodes.playerInput.id = 'playerName'
        initNodes.playerInput.setAttribute('name','playerName')
        initNodes.playerInput.setAttribute('required','required')
        initNodes.playerInput.setAttribute('autocomplete','off')
        initNodes.playerSubmit.type = 'submit'
        initNodes.playerNameForm.onsubmit = function(){
            initNodes.playerNameForm.remove()
            gameLoop(initNodes.playerInput.value)
        }

    }

    const appendNodes = function(){
        document.body.appendChild(initNodes.gameContainer)
        initNodes.gameContainer.appendChild(initNodes.header)
        initNodes.gameContainer.appendChild(initNodes.playerNameForm)
        initNodes.header.appendChild(initNodes.headline)
        initNodes.playerNameForm.appendChild(initNodes.playerLabel)
        initNodes.playerNameForm.appendChild(initNodes.formContainer)
        initNodes.formContainer.appendChild(initNodes.playerInput)
        initNodes.formContainer.appendChild(initNodes.playerSubmit)
    }

    setTextContent()
    setAttributes()
    appendNodes()
    return
}

export const subscribeUIEvents = function(someSubFunc=gameEvents.subscribe){
    someSubFunc('initGame',createDispatchLog)
    someSubFunc('renderGameState', renderState)
    someSubFunc('viewShip', displayShip)
    someSubFunc('viewShip', initialiseOptionsConsole)

    
}