import { componentActionFilter, componentPathFilters, componentStore } from "./uicomponents"
import { components } from '../ships'
import { defaultConfig } from '../gameboard'
import { finishers } from './consoles'
import { gameEvents } from '../gamestate'
import { integrateChild } from "../utils"
import recordPathHelpers from "./paths"
import { shipStore, standardShipStore } from './uiship'

const activateModifyProperties = function(event, params, publish=gameEvents.publish){
    
    const shipLoc = params[0].target.id
    let gameState = params[1]
    let getBoard = params[3]
    let gb = getBoard(gameState)
    const paths = _filterComponentPaths(event)
    componentStore(componentActionFilter(),paths)
    let finalOptions = Array.from(document.querySelectorAll('.compPropertyTitle'))
    for(let opt of finalOptions){
        let par = opt.parentElement
        let children = Array.from(par.children).filter(child => child.classList.contains('compContainer') || child.classList.contains('compElement'))
        if(children.length > 0){
            opt.onclick = function(ev){
                const path = recordPathHelpers().chartPath(ev,'componentStore','compPropertyTitle').filter(option => option !== opt.id)
                const changeConfig = ['modify',path,opt.id]
                publish('playerAction','modify',[gb, shipLoc, changeConfig, gameState]) 
            } 
        }
         //remember to revise this if playerAction is not the right event name &/or other changes. 
         //Also need to add a cancelAction event in body later.
    }
}

const activateExtendComponent = function(event, params, publish=gameEvents.publish){
    const shipLoc = params[0].target.closest('td').id
    let gameState = params[1]
    let getBoard = params[3]
    let gb = getBoard(gameState)
    const paths = _filterComponentPaths(event)
    componentStore(componentActionFilter(),paths)
    let finalOptions = Array.from(document.querySelectorAll('.compPropertyTitle'))
    for(let opt of finalOptions){
        let par = opt.parentElement
        let children = Array.from(par.children).filter(child => child.classList.contains('compContainer'))
        if(children.length > 0){
            opt.onclick = function(ev){
                const path = recordPathHelpers().chartPath(ev,'componentStore','compPropertyTitle').filter(option => option !== opt.id)
                const changeConfig = ['extend component',path,opt.id]
                publish('playerAction','extend component',[gb,shipLoc, changeConfig,gameState])
            }
        }
        //remember to revise this if playerAction is not the right event name &/or other changes. 
         //Also need to add a cancelAction event in body later.
    }

}

const activateActionChoice = function(event,params,publish=gameEvents.publish){
    const shipLoc = params[0].target.closest('td').id
    const gs = params[1]
    const getCont = params[2]
    const getB = params[3]
    publish('playerAction', 'action', [[gs,getCont,getB] , shipLoc, event.target.id])
    //Note the above was written before the all-encompassing function that parses actions was designed. So review once that is done esp. re: parameter order. 

    
}

const extendShipPublisher = function(event,params,publish=gameEvents.publish){

    if(!event.target.classList.contains('.compProperyTitle')){
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
    //Note: in order for this to work, it is vimp that gb refers to an updated gameboard each time, even if it is not rendered yet.
    //Otherwise it will keep referring to the same gameboard 
}




const _generateOptionsObject = function(componentsObj=components, getLgl=defaultConfig.getBoardLegalMoves,publish=gameEvents.publish){

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

            const preparePlaceShip = function(shipChoice){
                const gameZone = document.querySelector('.gamezone')
                const zones = Array.from(document.querySelectorAll('.zone'))
                zones.map(zone => !zone.classList.contains('ship') ? zone.classList.add('moveHighlight') : false)

                gameZone.onclick = function(zoneEvent){
                    if(zoneEvent.target.classList.contains('.moveHighlight')){
                        publish('playerAction', 'build',[...prepareBuildArguments(shipChoice, zoneEvent.target)])
                    }
                    else{
                        const highlights = Array.from(document.querySelectorAll('.moveHighlight'))
                        highlights.map(zone => zone.classList.remove('moveHighlight'))
                    }
                }
            }

            const store = initialiseShipStore()
            store.onclick = function(event){
                if(event.target.classList.contains('shipOption')){
                    preparePlaceShip(event.target.textContent)
                }

            }
            
        }
    }

    const ship = {
        'Move Ship' : function(...params){

            const prepareMoveArguments = function(targetLocation){
                const [gs,getB] = [params[1], params[3]]
                const [gb, shipZone] = [getB(gs),params[0].target.closest('td').id]
                const legals = [...getLgl(gb,shipZone)]
                legals.map(zone => !zone.classList.contains('ship') ? zone.classList.add('moveHighlight') : false )
                return [
                    gb,
                    shipZone,
                    targetLocation,
                    gs
                ]
            }

            const gameZone = document.querySelector('.gamezone')
            gameZone.onclick = function(event){
                if(event.target.classList.contains('moveHighlight')){
                    publish('playerAction','move',[...prepareMoveArguments(event.target)])
                }
                else{
                    const highlights = Array.from(document.querySelectorAll('.moveHighlight'))
                    highlights.map(zone => zone.classList.remove('moveHighlight'))
                }

            }

        },
        'Modify Ship' : function(...params){
            const markPropertiesToModify = function(){
                const elements = Array.from(document.querySelectorAll('.element'))
                const properties = elements.map(node => node.closest('.property'))
                const titles = properties.map(property => [...property.children].filter('.propertyTitle')[0])
                titles.map(title => title.classList.add('Mod'))
                return 
            }

            const unmarkPropertiesToModify = function(){
                const titles = Array.from(document.querySelectorAll('.Mod'))
                titles.map(node => node.classList.remove('Mod'))
            }

            markPropertiesToModify()
            const shipConsole = document.querySelector('#ship')
            shipConsole.onclick = function(event){
                if(event.target.classList.contains('Mod')){
                    activateModifyProperties(event, params)
                    unmarkPropertiesToModify()
                }
                
            }

        },
        'Extend Ship' : function(...params){
            const intitialiseComponentStore = function(){
                const paths = componentPathFilters['Extend Ship']()
                componentStore(componentActionFilter(),paths)
            }

            const appendDoneButton = function(){
                const store = document.querySelector('.componentStore')
                const gs = params[1]
                integrateChild(store,doneButton())
                store.onclick = function(event){
                    if(event.target.classList.contains('done')){
                        publish('playerAction','extend ship', [gs])
                    }
                }
            }

            const addExtendShipListener = function(){
                document.querySelector('.componentStore').onclick = function(e){
                    extendShipPublisher(e, params)
                }
            }
            
            intitialiseComponentStore()
            appendDoneButton()
            addExtendShipListener()
            

        },
        'Extend Component' : function(...params){
            let propTitles = []
            const allContainerParents = Array.from(document.querySelectorAll('.container')).map(cont => cont.parentElement)
            const propParents = allContainerParents.filter(par => par.classList.contains('property'))
            const propChildren = propParents.map(parent => Array.from(parent.children))
            for(let arr of propChildren){
                arr = arr.filter(child => child.classList.contains('propertyTitle'))
                propTitles = [...propTitles,...arr]
            }
            for(let title of propTitles){
                title.classList.add('Ext')
                title.onclick = function(e){
                    activateExtendComponent(e,params)
                    //document.querySelector('.toggleHide').classList.remove('toggleHide') review.
                }
            }
                    //cancelAction should remove toggleHide
         },
        'Effect Ship Action' : function(...params){
            let allPropTitles = Array.from(document.querySelectorAll('.propertyTitle')).map(title => title.id)
            let actions = []
            let main = document.querySelector('.mainConsole')
            if(allPropTitles.includes('action')){
                let allProps = Array.from(document.querySelectorAll('.propertyTitle'))
                let actPar = allProps[allPropTitles.indexOf('action')].parentElement
                let actChildren = Array.from(actPar.children)
                for(let elem of Array.from(actChildren)){
                    if(elem.classList.contains('container')){
                        actions = [...Array.from(elem.children).map(elem => elem.textContent)]
                    }
                }
            let choices = document.createElement('div')
            choices.classList.add('choices')
            for(let elem of actions){
                let choice = document.createElement('span')
                choice.textContent = elem
                choice.id = elem
                choice.classList.add('choice')
                choice.onclick = function(e){
                    activateActionChoice(e,params)
                }
                choices.appendChild(choice)
            }
            main.appendChild(choices)
        }


        },//cancelAction should remove toggleHide.

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