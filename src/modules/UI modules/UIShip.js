import recordPathHelpers from 'paths.js'
import { defaultConfig } from '../gameboard'
import { camelPhraseParser } from '../utils'
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

const revealProps = {
    determineUIKey : function(parent, key, propName='property',propTitleName='propertyTitle'){
        let children = Array.from(parent.children)
        for(let child of children){
            if(child.classList.contains(key)){
                return child
            }
        }
        return this.keyToUIelement(parent,key,propName,propTitleName)


    },
    keyToUIelement : function(parent,key,propName='property',propTitleName='propertyTitle'){
        let prop = document.createElement('div')
        let title = document.createElement('span')
        prop.classList.add(`${propName}`)
        prop.classList.add(`${key}`)
        title.classList.add(`${propTitleName}`)
        title.id = key        
        title.textContent = camelPhraseParser(key) 
        prop.appendChild(title)
        parent.appendChild(prop)
        return prop
        },
    valueToUIelement : function(par,val,valContainerName='container',valName='element'){
        if(Array.isArray(val)){ 
            let container = document.createElement('div')
            container.classList.add(`${valContainerName}`)
            for(let elem of val){
                let uiElement = document.createElement('span')
                uiElement.classList.add(`${valName}`)
                uiElement.id = elem
                uiElement.textContent = elem
                container.appendChild(uiElement)
            }
            par.appendChild(container)
            return container
        }
        else if(typeof val === 'string'){
            let uiElement = document.createElement('span')
            uiElement.classList.add(`${valName}`)
            uiElement.id = val
            uiElement.textContent = camelPhraseParser(val)
            par.appendChild(uiElement)
            return uiElement
        }
        else if(typeof val === 'number'){
            let uiElement = document.createElement('span')
            uiElement.classList.add(`numeral`)
            uiElement.textContent = camelPhraseParser(val)
            par.appendChild(uiElement)
            return uiElement
        }
        
    },        
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

const numeralPropStatus = function(val,par,titleType='propertyTitle',parType='property', parNewType='element'){
    let ruledOut = ['damage','breakpoint','reinforcedBreakpoint']
    if(val.classList.contains('numeral')){
        let title = Array.from(par.children).filter(sib => sib.classList.contains(`${titleType}`))[0]
        if(!ruledOut.includes(title.id)){
            par.classList.remove(`${parType}`)
            par.classList.add(`${parNewType}`)
            title.classList.remove(`${titleType}`)
            title.classList.add('countTitle')
        }
    }

}
                    

const displayShip = function(event, someGameState, someGetCont=defaultConfig.getBoardContains, gb=defaultConfig.getBoard){
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
                numeralPropStatus(value,parent)
            }  
            else {
                parent = revealProps.determineUIKey(parent,elem) 
            }
            finalTarget = finalTarget[elem]
        }
    }
    return shipConsole 
}

export default displayShip
