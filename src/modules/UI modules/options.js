import { componentActionFilter, componentPathFilters, componentStore } from "./uicomponents"
import { defaultConfig } from '../gameboard'
import { finishers, toggleToConsole } from './consoles'
import { gameEvents } from '../gamestate'
import { integrateChild } from "../utils"
import recordPathHelpers from "./paths"
import { shipStore, standardShipStore } from './uiship'

const createComponentStore = function(someEvent){
    const paths = componentPathFilters['Extend Component'](someEvent)
    const store = componentStore(componentActionFilter(),paths)
    return store

}

const activateModifyProperties = function(event, params, publish=gameEvents.publish){


    const createModifyListener = function(event){
        const properties = Array.from(document.querySelectorAll('.compElement')).map(element => element.closest('.compProperty'))
        const targets = properties.map(property => Array.from(property.children).filter(child => child.classList.contains('compPropertyTitle'))[0])
        if(targets.includes(event.target)){
            publish(...prepareModifyArguments(event))
        }
    }

    const createChangeConfig = function(clickEvent){
        const path = function(){
            return recordPathHelpers().chartPath(clickEvent,'componentStore','compPropertyTitle').filter(option => option !== clickEvent.target.id)
        }
        return [
            'modify',
            path(),
            clickEvent.target.id
        ]
        
    }
    
    const prepareModifyArguments = function(clickEvent){
        const [shipLocation, gameState, getBoard] = [params[0].target.closest('td').id, params[1], params[3]]
        const gb = getBoard(gameState)
        return [
            'playerAction',
            'modify',
            [
                gb,
                shipLocation,
                createChangeConfig(clickEvent),
                gameState

            ]
        ]

    }

    const store = createComponentStore(event)
    store.addEventListener('click',createModifyListener)
    finishers['store'](store)
    
}

const activateExtendComponent = function(event, params, publish=gameEvents.publish){
    
    const createExtendConfig = function(clickEvent){
        const path = function(){
            return recordPathHelpers().chartPath(clickEvent,'componentStore','compPropertyTitle').filter(option => option !== clickEvent.target.id)
        }
        return [
            'extend component',
            path(),
            clickEvent.target.id
        ]
        
    }

    const prepareExtendArguments = function(clickEvent){
        const [shipLocation, gameState, getBoard] = [params[0].target.closest('td').id, params[1], params[3]]
        const gb = getBoard(gameState)
        return [
            'playerAction',
            'extend component',
            [
                gb,
                shipLocation,
                createExtendConfig(clickEvent),
                gameState

            ]
        ]

    }

    const createExtendListener = function(event){
        const properties = Array.from(document.querySelectorAll('.compElement')).map(element => element.closest('.compProperty'))
        const targets = properties.map(property => Array.from(property.children).filter(child => child.classList.contains('compPropertyTitle'))[0])
        if(targets.includes(event.target)){
            publish(...prepareExtendArguments(event))
        }
    }

    const store = createComponentStore(event)
    store.addEventListener('click',createExtendListener)
    finishers['store'](store)

}

const activateActionChoice = function(event,params,publish=gameEvents.publish){
    const shipLoc = params[0].target.closest('td').id
    const gs = params[1]
    const getCont = params[2]
    const getB = params[3]
    publish('playerAction', 'action', [[gs,getCont,getB] , shipLoc, event.target.id]) 
    
}

const extendShipPublisher = function(event,params,publish=gameEvents.publish){
    if(!event.target.classList.contains('compPropertyTitle') && !event.target.classList.contains('compStaticTitle')){
        return
    }
    else if(Array.from(event.target.parentElement.children).some(child => child.classList.contains('compProperty'))){
        return
    }
    
    const prepareArguments = function(){
        const shipLoc = params[0].target.closest('td').id
        const getBoard = params[3]
        const path = recordPathHelpers().chartPath(event,'componentStore','compPropertyTitle').filter(option => option !== event.target.id)
        const changeConfig = ['extend ship',path,event.target.id]
        return [getBoard, shipLoc, changeConfig]
    }

    const removeOldChoiceMarking = function(){
        const grandparent = event.target.parentElement.parentElement
        let allChoices = Array.from(document.querySelectorAll('.Mod'))
        if(allChoices.length === 0){return}
        for(let choice of allChoices){
            if(choice.parentElement.parentElement === grandparent){
                choice.classList.remove('Mod')
            }
            else if(grandparent.parentElement.classList.contains('count') && choice.parentElement.parentElement.parentElement.classList.contains('count')){
                choice.classList.remove('Mod')
            }
            return
        }
    }

    publish('extendShip',[...prepareArguments()])
    removeOldChoiceMarking()
    event.target.classList.add('Mod')
    return

}




const generateOptionsObject = function(getLgl=defaultConfig.getBoardLegalMoves,publish=gameEvents.publish){

    const doneButton = function(){
        const done = document.createElement('button')
        done.classList.add('done')
        done.textContent = 'Done'
        return done
    }

    
    const defaultOpts = {
        'Build New Ship' : function(...params){

            const initialiseShipStore = function(){
                const store = shipStore()
                finishers['store'](store)
                return document.querySelector('#store')

            }

            const prepareBuildArguments = function(shipChoice, zone){
                const [gameState, getB] = [params[1], params[3]]
                const gb = getB(gameState)
                return [
                    gb,
                    standardShipStore[shipChoice](),
                    zone.id,
                    gameState,
                ]
            }

            const addBuildHighlights = function(){
                const zones = Array.from(document.querySelectorAll('.zone'))
                zones.map(zone => !zone.classList.contains('ship') ? zone.classList.add('moveHighlight') : false)
            }

            const preparePlaceShip = function(shipChoice){
                const gameZone = document.querySelector('.gamezone')
                const markHighlights = function(zoneEvent){
                    if(zoneEvent.target.classList.contains('moveHighlight')){
                        publish('playerAction', 'build',[...prepareBuildArguments(shipChoice, zoneEvent.target)])
                    }
                    else{
                        const highlights = Array.from(document.querySelectorAll('.moveHighlight'))
                        highlights.map(zone => zone.classList.remove('moveHighlight'))
                    }
                }
                gameZone.addEventListener('click',markHighlights) 
            }

            const store = initialiseShipStore()
            addBuildHighlights()
            store.addEventListener('click', function(event){
                if(event.target.classList.contains('shipOption')){
                    preparePlaceShip(event.target.textContent)
                }

            }) 
            
        }
    }

    const ship = {
        'Move Ship' : function(...params){

            const [gs,getB] = [params[1], params[3]]
            const [gb, shipZone] = [getB(gs),params[0].target.closest('td').id]

            const addMoveHighlights = function(){
                const legals = [...getLgl(gb,shipZone)].map(id => document.getElementById(id))
                legals.map(zone => !zone.classList.contains('ship') ? zone.classList.add('moveHighlight') : false )

            }

            const prepareMoveArguments = function(targetLocation){
                return [
                    gb,
                    shipZone,
                    targetLocation,
                    gs
                ]
            }


            const gameZone = document.querySelector('.gamezone')
            const makeMove = function(event){
                if(event.target.classList.contains('moveHighlight')){
                    publish('playerAction','move',[...prepareMoveArguments(event.target.id)])
                }
                else{
                    const highlights = Array.from(document.querySelectorAll('.moveHighlight'))
                    highlights.map(zone => zone.classList.remove('moveHighlight'))
                }

            }
            gameZone.addEventListener('click', makeMove)
            addMoveHighlights()

        },
        'Modify Ship' : function(...params){
            const markPropertiesToModify = function(){
                const elements = Array.from(document.querySelectorAll('.element'))
                const properties = elements.map(node => node.closest('.property')).filter(node => node !== null)
                const titles = properties.map(property => [...property.children].filter(child => child.classList.contains('propertyTitle'))[0])
                titles.map(title => title.classList.add('Mod'))
                return 
            }

            const unmarkPropertiesToModify = function(){
                const titles = Array.from(document.querySelectorAll('.Mod'))
                titles.map(node => node.classList.remove('Mod'))
            }

            markPropertiesToModify()
            toggleToConsole('opts','ship')
            const shipConsole = document.querySelector('#ship')
            
            const activateModify = function(event){
                if(event.target.classList.contains('Mod')){
                    activateModifyProperties(event, params)
                    unmarkPropertiesToModify()
                }    
            }
            shipConsole.addEventListener('click',activateModify)

        },
        'Extend Ship' : function(...params){
            const intitialiseComponentStore = function(){
                const paths = componentPathFilters['Extend Ship']()
                const store = componentStore(componentActionFilter(),paths)
                finishers.store(store)
            }

            const appendDoneButton = function(){
                const store = document.querySelector('.componentStore')
                const gs = params[1]
                integrateChild(store,doneButton())

                const extendShipActivate = function(event){
                    if(event.target.classList.contains('done')){
                        publish('playerAction','extend ship', [gs])
                    }
                }
                store.addEventListener('click',extendShipActivate)  
            }

            const addExtendShipListener = function(){
                document.querySelector('.componentStore').addEventListener('click', function(e){
                    extendShipPublisher(e, params)
                })
            }
            
            intitialiseComponentStore()
            appendDoneButton()
            addExtendShipListener()
            

        },
        'Extend Component' : function(...params){

            const markPropertiesToExtend = function(){
                const elements = Array.from(document.querySelectorAll('.element'))
                const properties = elements.map(node => node.closest('.property')).filter(node => node !== null)
                const titles = properties.map(property => [...property.children].filter(child => child.classList.contains('propertyTitle'))[0])
                titles.map(title => title.classList.add('Ext'))
                return 
            }

            const unmarkPropertiesToExtend = function(){
                const titles = Array.from(document.querySelectorAll('.Ext'))
                titles.map(node => node.classList.remove('Ext'))
            }

            markPropertiesToExtend()
            toggleToConsole('opts','ship')
            const shipConsole = document.querySelector('#ship')
            const activateExtend = function(event){
                if(event.target.classList.contains('Ext')){
                    activateExtendComponent(event, params)
                    unmarkPropertiesToExtend()
                }    
            }
            shipConsole.addEventListener('click',activateExtend)

         },
        'Effect Ship Action' : function(...params){
            const action = Array.from(document.querySelectorAll('.action')).filter(node => node.classList.contains('property'))[0]
            
            if(!action){
                return
            }
            const initialiseChoices = function(){
                if(document.querySelector('.choices')){
                    document.querySelector('.choices').remove()
                }
                const choices = document.createElement('div')
                choices.classList.add('choices')
                return choices
            }
            const choices = initialiseChoices()
            const choiceConvertor = function(str){
                const choice = document.createElement('span')
                choice.textContent = str
                choice.id = str
                choice.classList.add('choice')
                choices.appendChild(choice)
                return choice
            }

            const retrieveActions = function(){
                const container = Array.from(document.querySelectorAll('.container')).filter(node => node.closest('.action') && node.closest('.property'))[0]
                const actions = Array.from(container.children).map(node => choiceConvertor(node.textContent))
                return actions
            }

            const actions = retrieveActions()
            const revealActions = function(clickEvent){
                if(actions.includes(clickEvent.target)){
                    activateActionChoice(clickEvent,params)
                }
            }
            choices.addEventListener('click',revealActions)
            document.querySelector('#opts').appendChild(choices)

        }

    }
    const toFilterList = [
        [document.querySelector('#ship'), function(){
            return {defaultOpts}
        }],
        [Array.from(document.querySelectorAll('.propertyTitle')).some(tit => tit.id === 'action'), function(){
            delete ship['Effect Ship Action'] 
            delete ship['Extend Component']
            delete ship['Modify Ship']
            return {
                    defaultOpts,
                    ship
                }
            
        }],
        [Array.from(document.querySelectorAll('.propertyTitle')).some(tit => tit.id === 'messagingProtocol'),function(){
            delete ship['Effect Ship Action']
            return {
                defaultOpts,
                ship
            }
        }],
        [componentPathFilters['Extend Ship'](), function(){
            delete ship['Extend Ship']
            return {
                defaultOpts,
                ship
            }
        }]
    ]
 
    const filterOptions = function(){
        for(let elem of toFilterList){
            if (!elem[0]){
                return elem[1]()
            }
        }
        return {
            defaultOpts,
            ship
        }
    }
    
    return filterOptions()

}

export const populateOptionsConsole = function(...params){
    const optParent = document.querySelector('#opts')
    const optionsObject = generateOptionsObject()

    const keys = Object.keys(optionsObject)
    for(let key of keys){
        let options = Object.keys(optionsObject[key])
        for (let option of options){
            let opt = document.createElement('div')
            opt.classList.add('option')
            let title = document.createElement('span')
            title.classList.add('optTitle')
            title.textContent = option
            title.onclick = function(){
                optionsObject[key][option](...params) 
            }
            opt.appendChild(title)
            optParent.appendChild(opt)
        }
    }

}

export const createSkip = function(publish=gameEvents.publish){
    const main = document.querySelector('.mainConsole')
    const skip = document.createElement('button')
    skip.textContent = 'Skip'
    skip.classList.add('skip')
    integrateChild(main,skip)
    main.addEventListener('click', (event) => event.target.classList.contains('skip') ? publish('triggerAI') : false )
}
