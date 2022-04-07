import { defaultConfig} from './gameboard.js'
import { gameEvents } from './gamestate.js'
import * as ships from './ships.js'


const standardShipStore = {
    'Basic' : function(){return new ships.basicShip()},
    'Basic (Legacy)' : function(){return new ships.basicLegacyShip()},
    'Legacy' : ships.legacyShip,
    'Planting' : ships.plantingShip,
    'Defense' : ships.defenseShip,
    'Relay' : ships.relayShip,
    'Clearing' : ships.clearingShip
}

const intermediateStorage = {
    modify : false,
    extend : false,
    path : null
}

const _buildBoard = function(){
    const lets = ['A','B','C','D','E','F']
    const nums = ['1','2','3','4','5','6']

    const gameBoard = document.createElement('table')
    gameBoard.classList.add('gamezone')
    const gameBody = document.createElement('tbody')
    const rowHead = document.createElement('tr')
    const whiteSpace = document.createElement('th')
    rowHead.appendChild(whiteSpace)
    
    gameBoard.appendChild(gameBody)

    for(let elem of lets){
        let th = document.createElement('th')
        th.textContent = elem
        rowHead.appendChild(th)
    }
    gameBody.appendChild(rowHead)
    for(let elem of nums){
        let tr = document.createElement('tr')
        let th = document.createElement('th')
        th.textContent = elem
        tr.appendChild(th)
        for(let letr of lets){
            let td = document.createElement('td')
            tr.appendChild(td)
            td.classList.add(`${letr}${elem}`) 
        }
        gameBody.appendChild(tr)
    }
    return gameBoard
}



export const actionParser = function(event,somePubFunc, someGb){
    if(event.target.textContent === ''){
        return
    }
    let keys = Object.keys(someGb)
    for(let elem of keys){
        if(event.target.classList.contains(elem)){
            somePubFunc('filterAction', elem)
        }
    }

}

const createMainConsole = function(){
    let mainConsole = document.createElement('div')
    mainConsole.classList.add('mainConsole')
    document.body.appendChild(mainConsole)
    return mainConsole

}

const _optionsUISetup = function(){
    if(document.querySelector('.options')){
        document.querySelector('.options').remove()
    }
    let options = document.createElement('div')
    let title = document.createElement('span')
    options.classList.add('options')
    title.classList.add('optionTitle')
    options.appendChild(title)
    document.querySelector('mainConsole').appendChild(options)
    return options

}

const _shipStore = function(shipsObj=standardShipStore){
    let store = document.createElement('div')
    store.classList.add('shipStore')
    let choices = Object.keys(shipsObj)
    for (let elem of choices){
        let ship = document.createElement('span')
        ship.textContent = elem
        ship.classList.add('shipOption')
        //ship.onclick = when clicked, series of happenings: first initialises the object value associated with key chosen.
        // Then prompts the user to click on an empty place in the grid to place the ship on. Then re-renders the gameboard
        //and the console. Also: if user fails to click on an empty grid item, user is prompted with an error and the next
        // click re renders everything. If user fails to click in the gameboard and click anywhere else: re-render everything. 
        store.appendChild(ship) 
    }

}

const _componentStore = function(componentsObj=ships.components){
    //remember componentsObj still need to initialise. 
    
}


const createOptionsConsole = function(optionsObj,params){
    let options = _optionsUISetup()
    let allOptions = Object.keys(optionsObj)
    for(let elem of allOptions){
        let opt = document.createElement('span')
        opt.classList.add('option')
        opt.textContent = elem
        opt.onclick = function(){
            optionsObj[elem](...params)
            opt.onclick = null //to fix in line with other events. 
        }
        options.appendChild(opt)
    }    
}

const _createViewConsole = function(){
    if(document.querySelector('.viewConsole')){
        document.querySelector('.viewConsole').remove()
    }
    let viewConsole = document.createElement('div')
    viewConsole.classList.add('viewConsole')
    document.querySelector('.mainConsole').appendChild(viewConsole) 
    return document.querySelector('.viewConsole')

}

const _shipKeyToUserElement = function(ship,someGb,someGetCont=defaultConfig.getBoardContains,publish=gameEvents.publish){
    let shipProps = Object.keys(ship)
    let props = []
        for(let elem of shipProps){
            let prop = document.createElement('div')
            let title = document.createElement('span')
            prop.classList.add('property')
            title.classList.add('propertyTitle')        
            title.textContent = elem
            title.onclick = function(event){
                publish('viewShipProperty', event,someGb,someGetCont) 
                title.onclick = null}   
            prop.appendChild(title)
            props.push(prop)
        }
        return props
}


const _chartShipObjPath = function(event){
    let parent = event.target.parentElement
    let path = [event.target.textContent]
    while(parent !== document.querySelector('.viewConsole')){
        if(parent === document.querySelector('body')){
            return
        }      
        
        parent = parent.parentElement
        let children = Array.from(parent.children)
        children = children.filter(child => child.classList.contains('propertyTitle'))
        if(children.length === 0){
            return path
        }
        path.unshift(children[0].textContent)
    }
    return path
}


const _shipValueToUserElement = function(shipObj,val){
    const parent = shipObj
    if(Array.isArray(val)){
        let container = document.createElement('div')
        container.classList.add('container')
        for(let elem of val){
            let uiElement = document.createElement('span')
            uiElement.classList.add('element')
            uiElement.textContent = elem
            container.appendChild(uiElement)
        }
        parent.appendChild(container)
    }
    else if(typeof val === 'string' || typeof val === 'number'){
        let uiElement = document.createElement('span')
        uiElement.classList.add('element')
        uiElement.textContent = val
        parent.appendChild(uiElement)
    }
    return parent
}



const _displayInitShipProperties = function(event,someGb,someGetCont){
    if(event.target.textContent === ''){
        return
    }
    let viewConsole = _createViewConsole()
    let keys = Object.keys(someGb)
    for (let elem of keys){
        if(event.target.classList.contains(elem)){
            let ship = someGetCont(someGb,elem)
            let shipKeys = _shipKeyToUserElement(ship,someGb,someGetCont)
            for(let shipKey of shipKeys){
                shipKey.classList.add(`${elem}`)
                viewConsole.id = `${elem}`
                viewConsole.appendChild(shipKey)
            }
        }
    }
    return viewConsole
}

const _displayFurtherShipProperties = function(event, someGb, someGetCont){
    let path = _chartShipObjPath(event)
    let key = document.querySelector('.viewConsole').id
    let finalTarget = someGetCont(someGb,key)
    for(let elem of path){
        finalTarget = finalTarget[elem]
    }
    if(Array.isArray(finalTarget) || typeof finalTarget === 'string' || typeof finalTarget === 'number'){
        return _shipValueToUserElement(event.target.parentElement,finalTarget)
    }
    else if(typeof finalTarget === 'object'){
        let shipKeys = _shipKeyToUserElement(finalTarget,someGb,someGetCont)
        for(let shipKey of shipKeys){
            event.target.parentElement.appendChild(shipKey)
        }
        return

    }

}

const upgradeShipUI = {
    modificationActive : function(event){
        if(event.target.classList.contains('mod')){
            event.target.classList.add('active')

        }

    },
    highlightKeys  : function(event){
        if(intermediateStorage.modification && event.target.classList.includes('propertyTitle')){
            event.target.classList.add('highlight')
        }
    },
    propertyToModifyIdentified : function(event){
        if(event.target.classList.contains('mod') && event.target.classList.contains('active')){
            event.target.classList.remove('active')
            //still need to get highlighted keys as path
            //transition screen to the components shop
            //after component is chosen...
        }
    }


}

export const renderState = function(someGb, someGetCont=defaultConfig.getBoardContains, publish=gameEvents.publish){
    let newBoard = _buildBoard()
    if(document.querySelector('.gamezone')){
        document.querySelector('.gamezone').remove()
    }
    document.body.appendChild(newBoard)
    
    for (let elem of Object.keys(someGb)){
        if(document.querySelector(`.${elem}`) && someGetCont(someGb,elem)){
            document.querySelector(`.${elem}`).textContent = 'S' //to modify later
            document.querySelector(`.${elem}`).onclick = function(event) {
            publish('viewShip',event,someGb,someGetCont);
            document.querySelector(`.${elem}`).onclick = null} 
        }
    }   
}

export const subscribeUIEvents = function(someSubFunc=gameEvents.subscribe){
    someSubFunc('viewShip', _displayInitShipProperties)
    someSubFunc('viewShipProperty',_displayFurtherShipProperties)


}
