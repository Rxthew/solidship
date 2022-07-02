import * as ships from '../ships'
import recordPathHelpers from 'paths.js'
import { defaultConfig } from '../gameboard'
import { revealProps } from '../utils'
import {finishers} from './consoles'

const recordPaths = function(someGb,key,someGetCont=defaultConfig.getBoardContains){
    let paths = []
    let confirmedPaths = []
    let obj = someGetCont(someGb,key)
    
    
    let initialInjection = recordPathHelpers().initialInjection
    initialInjection(obj,paths)

    confirmedPaths = recordPathHelpers().finalisePath(obj,paths,confirmedPaths)
    return confirmedPaths
}


const primaryMarker = function(par){
    let container = Array.from(par.children).filter(child => child.classList.contains('container'))
    let referencePoint = container.length > 0 ? container[0] : par
    let children = Array.from(referencePoint.children).filter(child => child.classList.contains('element'))
    if(children.length > 0){
        let primary = children[0]
        if(!primary.classList.contains('primary')){
            primary.classList.add('primary')
        }   
    }
    return
}
                    

export const displayShip = function(event, someGameState, someGetCont=defaultConfig.getBoardContains, gb=defaultConfig.getBoard){
    let someGb= gb(someGameState)
    let key = event.target.closest('td').id
    let paths = recordPaths(someGb, key,someGetCont)
    const shipConsole = finishers.ship() 
    let shipObj = someGetCont(someGb,key)
    
    for(let path of paths){
        let finalTarget = shipObj
        let parent = shipConsole 
        for (let elem of path){
            if(elem === path[path.length - 1]){
                parent = revealProps.determineUIKey(parent,elem) 
                let value = finalTarget[elem]
                value = revealProps.valueToUIelement(parent,value)
                if(elem === 'action' || elem === 'messagingProtocol'){
                    primaryMarker(parent)
                }
            }  
            else {
                parent = revealProps.determineUIKey(parent,elem) 
            }
            finalTarget = finalTarget[elem]
        }
    }
    return shipConsole 
}

export const standardShipStore = {
    'Basic' : function(){return new ships.basicShip()},
    'Basic (Legacy)' : function(){return new ships.basicLegacyShip()},
    'Legacy' : ships.legacyShip,
    'Planting' : ships.plantingShip,
    'Defense' : ships.defenseShip,
    'Clearing' : ships.clearingShip
 //**Relay method below has been retained here for the sake of completion only. In practice, this is not available.*/
 // 'Relay' : ships.relayShip,
 //***/
    
}

export const shipStore = function(shipsObj=standardShipStore){
    if(document.querySelector('#store')){
        document.querySelector('#store').remove()
    }
    let store = document.createElement('div')
    store.classList.add('shipStore')
    let choices = Object.keys(shipsObj)
    for (let elem of choices){
        let ship = document.createElement('span')
        ship.textContent = elem
        ship.classList.add('shipOption')
        store.appendChild(ship) 
    }
    return store

}


