import { defaultConfig} from './gameboard.js'
import { gameEvents } from './gamestate.js'
import * as ships from './ships.js'
import { camelPhraseParser } from './utils.js'

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
            td.id = `${letr}${elem}`
            td.classList.add('zone') 
        }
        gameBody.appendChild(tr)
    }
    return gameBoard
}

const _skipTurn = function(){
    let skip = document.createElement('button')
    skip.textContent = 'Skip Turn'
    skip.classList.add('skip')
    skip.onclick = //still to fill in. incroporate in context of effectAction
    document.querySelector('.mainConsole').appendChild(skip)
    return skip

}


const createMainConsole = function(){
    if(document.querySelector('.mainConsole')){
        document.querySelector('.mainConsole').remove()
    }
    let mainConsole = document.createElement('div')
    mainConsole.classList.add('mainConsole')
    document.body.appendChild(mainConsole)
    return mainConsole

}


const recordPathHelpers = function(){

    let addNewPath = function(obj, currentPath, prop, paths){
        let first = obj
        if(currentPath){
            for(let elem of currentPath){
                if(elem === currentPath[currentPath.length - 1]){
                    paths.push([...currentPath, prop])
                }
                first = first[elem]
            } 
        }
        else{
            paths.push([prop])

        }
    }

    let initialInjection = function(obj,paths){
        for(let elem of Object.keys(obj)){
            addNewPath(obj,null,elem,paths)
        }
    }

    let finalisePath = function(obj,paths,confirmedPaths){
        let first = obj
            for(let path of paths){
                for(let elem of path){
                    if(elem === path[path.length - 1]){
                        if(Array.isArray(first[elem]) || typeof first[elem] === 'string' || typeof first[elem] === 'number'){
                             confirmedPaths = [...confirmedPaths, path]
                             delete paths[paths.indexOf(path)]      
                        }
                        else if(typeof first[elem] === 'object'){
                            let newCheckPoints = Object.keys(first[elem])
                            for(let checkPoint of newCheckPoints){
                                addNewPath(obj,path,checkPoint,paths)
                            }
                            delete paths[paths.indexOf(path)]
                        }
                    }
                    first = first[elem]
                }
                first = obj
            }
            paths = paths.filter(path => path !== undefined)
            return  confirmedPaths 
    }

    let chartPath = function(event, initParent='viewConsole', propTitle='propertyTitle'){
        let parent = event.target.parentElement
        let prop = event.target.id
        let path = [prop]
        while(parent !== document.querySelector(`.${initParent}`)){
            if(parent === document.querySelector('body')){
                return
            }
            parent = parent.parentElement
            let children = Array.from(parent.children)
            children = children.filter(child => child.classList.contains(`${propTitle}`))
            if(children.length === 0){
                return path
            } 
            path.unshift(children[0].id)      
        }
        return path
    }    
    return {
        addNewPath,
        initialInjection,
        finalisePath,
        chartPath
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


const _recordPaths = function(someGb,key, someGetCont=defaultConfig.getBoardContains){
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
        }
        else if(typeof val === 'string' || typeof val === 'number'){
            let uiElement = document.createElement('span')
            uiElement.classList.add(`${valName}`)
            uiElement.id = val
            uiElement.textContent = camelPhraseParser(val)
            par.appendChild(uiElement)
        }
        return
    },        
}

const _primaryMarker = function(par){
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
        
      
      

const displayShip = function(event, someGameState, someGetCont=defaultConfig.getBoardContains, gb=defaultConfig.getBoard){
    let someGb= gb(someGameState)
    let key = event.target.id
    let paths = _recordPaths(someGb, key,someGetCont)
    let viewConsole = _createViewConsole()
    let shipObj = someGetCont(someGb,key)
    
    for(let path of paths){
        let finalTarget = shipObj
        let parent = viewConsole
        for (let elem of path){
            if(elem === path[path.length - 1]){
                parent = revealProps.determineUIKey(parent,elem)
                let value = finalTarget[elem]
                revealProps.valueToUIelement(parent,value)
                if(elem === 'action' || elem === 'messagingProtocol'){
                    _primaryMarker(parent)
                }
            }  
            else {
                parent = revealProps.determineUIKey(parent,elem)
            }
            finalTarget = finalTarget[elem]
        }
    }
    return viewConsole
    
}

const standardShipStore = {
    'Basic' : function(){return new ships.basicShip()},
    'Basic (Legacy)' : function(){return new ships.basicLegacyShip()},
    'Legacy' : ships.legacyShip,
    'Planting' : ships.plantingShip,
    'Defense' : ships.defenseShip,
    'Relay' : ships.relayShip,
    'Clearing' : ships.clearingShip
}

const _shipStore = function(shipsObj=standardShipStore){
    if(document.querySelector('.shipStore')){
        document.querySelector('.shipStore').remove()
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

const _recordComponentPaths = function(obj){
    let paths = []
    let confirmedPaths = []

    let initialInjection = recordPathHelpers().initialInjection
    initialInjection(obj,paths)

    confirmedPaths = recordPathHelpers().finalisePath(obj,paths,confirmedPaths)
    return confirmedPaths

}

const _componentFilter = function(componentsObj=ships.components){
    let allPropTitles = Array.from(document.querySelectorAll('.propertyTitle')).map(title => title.id)
    if(allPropTitles.includes('action')){
        let allProps = Array.from(document.querySelectorAll('.propertyTitle'))
        let act = allProps[allPropTitles.indexOf('action')].parentElement
        const firstAct = (function(){
            for(let elem of Array.from(act.children)){
                if(elem.classList.contains('container')){
                    let action = Array.from(elem.children)[0]
                    return action.textContent
                }
            }
        })()
        return componentsObj(firstAct) 
    }
    else{
        let comp = componentsObj()
        for(let key of Object.keys(comp)){
            if(key !== 'action'){
                delete comp[key]
            }
        }
        return comp
    }
}




const _componentStore = function(componentsObj=_componentFilter(ships.components),path=_recordComponentPaths(componentsObj)){
    if(document.querySelector('.optConsole')){
        document.querySelector('.optConsole').remove()
    }
    
    let store = document.createElement('div')
    store.classList.add('componentStore')
    let main = document.querySelector('.mainConsole')
    for(let iteration of path){
        let finalTarget = componentsObj
        let parent = store
        for (let elem of iteration){
            if(elem === iteration[iteration.length - 1]){
                parent = revealProps.determineUIKey(parent,elem,'compProperty','compPropertyTitle')
                let value = finalTarget[elem]
                revealProps.valueToUIelement(parent,value,'compContainer','compElement')
            }
            else {
                parent = revealProps.determineUIKey(parent,elem, 'compProperty','compPropertyTitle')
            }
            finalTarget = finalTarget[elem]
        }
    
    }
    main.appendChild(store)

     
}

const _filterComponentPaths = function(event,componentsObj=_componentFilter(ships.components)){
    let initPath = recordPathHelpers().chartPath(event)
    let allPaths = _recordComponentPaths(componentsObj)
    let allCopy = [...allPaths]
    let ind = 0
    for(let arr of allCopy){
        for(let elem of initPath){
                if(arr[initPath.indexOf(elem)] !== elem){
                    delete allPaths[ind]
                }
            }
            ind++
        }
        allPaths = allPaths.filter(arr => arr !== undefined)
        return allPaths
}


const activateModifyProperties = function(event, params, publish=gameEvents.publish){
    
    const shipLoc = params[0].target.id
    let gameState = params[1]
    let getBoard = params[3]
    let gb = getBoard(gameState)
    const paths = _filterComponentPaths(event)
    _componentStore(_componentFilter(ships.components),paths)
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
    const shipLoc = params[0].target.id
    let gameState = params[1]
    let getBoard = params[3]
    let gb = getBoard(gameState)
    const paths = _filterComponentPaths(event)
    _componentStore(_componentFilter(ships.components),paths)
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
    const shipLoc = params[0].target.id
    const gs = params[1]
    const getCont = params[2]
    const getB = params[3]
    publish('playerAction', 'action', [[gs,getCont,getB] , shipLoc, event.target.id])
    //Note the above was written before the all-encompassing function that parses actions was designed. So review once that is done esp. re: parameter order. 

    
}

const extendShipPublisher = function(event,params,publish=gameEvents.publish){
    const shipLoc = params[0].target.id
    let gameState = params[1]
    let getBoard = params[3]
    let gb = getBoard(gameState)
    let path = recordPathHelpers().chartPath(event)
    let changeConfig = ['extend ship', path]
    publish('extendShip',[gb,shipLoc, [...changeConfig, event.target.id],gameState])
    event.target.classList.add('unavailable')
     return
    //Note: in order for this to work, it is vimp that gb refers to an updated gameboard each time, even if it is not rendered yet.
    //Otherwise it will keep referring to the same gameboard 
}




const _generateOptionsObject = function(componentsObj=ships.components, getLgl=defaultConfig.getBoardLegalMoves,publish=gameEvents.publish){

    const _doneButton = function(){
        const Done = document.createElement('button')
        Done.classList.add('done')
        Done.textContent = 'Done'
        return Done
    }

    const _missingProperties = function(event){
        event.target.classList.remove('toggleHide')
        let children = Array.from(event.target.parentElement.children)
        const checkForNote = function(){
            return children.some(elem => elem.classList.contains('missPropNote'))
        }
        
        if(event.target.classList.contains('unavailable') && checkForNote()){
            let existingNote = children.filter(elem => elem.classList.contains('missPropNote'))[0]
            existingNote.classList.toggle('toggleHide')
        }
        event.target.classList.add('unavailable')
        let note = document.createElement('span')
        note.classList.add('missPropNote')
        note.textContent = 'This option cannot be exercised with the properties available.'        
        event.target.parentElement.appendChild(note)
        return note
    }

    const _availabilityGuard = function(...params){
        let store = document.querySelector('.componentStore')
        let main = document.querySelector('.mainConsole')
        let titles = Array.from(document.querySelectorAll('.compPropertyTitle'))
        for(let elem of titles){
            if(!elem.classList.contains('unavailable')){
                return
            }
        }
        store.remove()
        let deadEnd = document.createElement('div')
        let noneAvail = document.createElement('span')
        noneAvail.textContent = 'Ship has all available components. Please return to previous page.'
        let ret = _doneButton()
        ret.onclick = createOptionsConsole(...params) 
        ret.textContent = 'Return'
        deadEnd.appendChild(noneAvail)
        main.appendChild(deadEnd)
    }
    
    const defaultOpts = {
        'Build New Ship' : function(...params){
            let gameState = params[1]
            let getB = params[3]
            let gb = getB(gameState)
            document.querySelector('.mainConsole').appendChild(_shipStore())
            const ships = Array.from(document.querySelectorAll('.shipOption'))
            const zones = Array.from(document.querySelectorAll('.zone'))
            const _prepPlaceShip = function(chosenShip){
                for (let zone of zones){
                    if(zone.classList.contains('ship')){
                        continue
                    }
                    zone.classList.add('moveHighlight')
                    
                    zone.onclick = function(){
                        publish('playerAction','build',[gb,standardShipStore[chosenShip](),zone.id,gameState])
                        
                    }
                }
            }
            for(let ship of ships){
                ship.onclick = function(){
                    _prepPlaceShip(ship.textContent)
                    
                }
            }
        }

    //remember to revise this if playerAction is not the right event name &/or other changes. 
    //Also need to add a cancelAction event in body later.   
    }//cancelAction should remove toggleHide.

    const ship = {
        'Move Ship' : function(...params){
            let gs = params[2]
            let getB = params[4]
            let gb = getB(gs)
            let shipLoc = params[1].target.id
            let legals = [...getLgl(gb,shipLoc)] 
            for(let elem of legals){
                if(document.querySelector(`#${elem}`).classList.contains('ship')){
                    continue
                }
                else{
                    document.querySelector(`#${elem}`).classList.add('moveHighlight')
                    document.querySelector(`#${elem}`).onclick = function(){
                        publish('playerAction','move',[gb, shipLoc, elem,gs])
                    }
                    //remember to revise this if playerAction is not the right event name &/or other changes. 
                    //Also need to add a cancelAction event in body later.
                    //cancelAction should remove toggleHide.
                }
            }



        },
        'Modify Ship' : function(...params){
            const propTitles = document.querySelectorAll('.propertyTitle')
            const props = Array.from(propTitles).map(elem => elem.id)
            let compStore = componentsObj()
            let compStoreKeys = Object.keys(compStore)
            let ind = 0
            for(let prop of props){
                if(compStoreKeys.includes(prop)){
                    let propChildren = Array.from(propTitles[ind].parentElement.children).filter(key => key.classList.contains('property'))
                    if(propChildren.length === 0 || prop === 'count'){
                        propTitles[ind].classList.add('Mod')
                        propTitles[ind].onclick = function(e){
                            activateModifyProperties(e, params)
                        }
                    }
                    else {
                        compStore = compStore[prop]
                        compStoreKeys = Object.keys(compStore)
                    }
                     
                }
                ind++
               
            }

        },
        'Extend Ship' : function(...params){
            _componentStore()
            let store = document.querySelector('.componentStore')
            let Done = _doneButton()
            let gs = params[1]
            store.appendChild(Done)
            Done.onclick = publish('playerAction','extend ship', [gs]) 
            let checkAgainst = Array.from(document.querySelectorAll('.propertyTitle')).map(elem => elem.id)
            let compPropTitles = Array.from(document.querySelectorAll('.compPropertyTitle'))
            let toVet = compPropTitles.map(elem => elem.id)
            for(let elem of toVet){
                let compPropElem =  compPropTitles[toVet.indexOf(elem)]
                let par = compPropElem.parentElement
                let children = Array.from(par.children).filter(child => child.classList.contains('compContainer') || child.classList.contains('compElement'))
                if(checkAgainst.includes(elem)){
                    compPropElem.classList.add('unavailable')
                }
                else if(children.length > 0){
                    compPropElem.onclick = function(e){
                        extendShipPublisher(e, params)
                        //Remember need to add a cancelAction event in body later.
                        //cancelAction should remove toggleHide.
                    }
                }
            }
            _availabilityGuard(...params) //revise when finishing.

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
        [document.querySelector('.viewConsole'), function(){
            return {defaultOpts}
        }],
        [document.querySelector('.property'), function(){
            delete ship['Modify Ship']
            ship['Effect Ship Action'] = _missingProperties
            delete ship['Extend Component']
            return {
                defaultOpts,
                ship
            }
        }],
        [document.querySelector('.container'), function(){
            delete ship['Extend Component']
            return {
                defaultOpts,
                ship
            }
        }],
        [Array.from(document.querySelectorAll('.propertyTitle')).filter(tit => tit.id === 'action')[0], function(){
            ship['Effect Ship Action'] = _missingProperties
            return {
                    defaultOpts,
                    ship
                }
            
        }],
        [Array.from(document.querySelectorAll('.propertyTitle')).filter(tit => tit.id === 'messagingProtocol')[0],function(){
            delete ship['Effect Ship Action']
            return {
                defaultOpts,
                ship
            }
        }],
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


const createOptionsConsole = function(...params){
    let optionsObject = _generateOptionsObject()
    if(document.querySelector('.optConsole')){
        document.querySelector('.optConsole').remove()
    }
    
    let main = document.querySelector('.mainConsole')
    let optCons = document.createElement('div')
    optCons.classList.add('optConsole')
    main.appendChild(optCons)
    let keys = Object.keys(optionsObject)
    for(let key of keys){
        let options = Object.keys(optionsObject[key])
        for (let option of options){
            let opt = document.createElement('div')
            opt.classList.add('option')
            let title = document.createElement('span')
            title.classList.add('optTitle')
            title.textContent = option
            title.onclick = function(){// to revise
                optionsObject[key][option](...params) 
                title.classList.add('toggleHide')
            }
            opt.appendChild(title)
            optCons.appendChild(opt)
        }
    }

}

const renderAIEffect = function(){
    return
}

const renderPlayerEffect = function(){
    return
}


export const renderState = function(someGameState, someGetCont=defaultConfig.getBoardContains, gb=defaultConfig.getBoard, publish=gameEvents.publish){
    let someGb = gb(someGameState)
    let newBoard = _buildBoard()
    if(document.querySelector('.gamezone')){
        document.querySelector('.gamezone').remove()
    }
    document.body.appendChild(newBoard)
    createMainConsole()
    createOptionsConsole(null,someGameState,someGetCont,gb)
    _skipTurn()
    for (let elem of Object.keys(someGb)){ 
        if(document.querySelector(`#${elem}`) && someGetCont(someGb,elem)){
            document.querySelector(`#${elem}`).classList.add('ship')
            document.querySelector(`#${elem}`).textContent = 'S' //to modify later
            document.querySelector(`#${elem}`).onclick = function(event) {
            publish('viewShip',event,someGameState,someGetCont,gb);
            } 
        }
    }   
}

export const subscribeUIEvents = function(someSubFunc=gameEvents.subscribe){
    someSubFunc('renderGameState', renderState)
    someSubFunc('viewShip', displayShip)
    someSubFunc('viewShip', createOptionsConsole)

    
}
