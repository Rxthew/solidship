import { defaultConfig} from './gameboard.js'
import { gameEvents } from './gamestate.js'
import * as ships from './ships.js'

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
        }
        gameBody.appendChild(tr)
    }
    return gameBoard
}


const createMainConsole = function(){
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
        let prop = event.target.textContent
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
            path.unshift(children[0].textContent)      
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
        title.textContent = key 
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
                uiElement.textContent = elem
                container.appendChild(uiElement)
            }
            par.appendChild(container)
        }
        else if(typeof val === 'string' || typeof val === 'number'){
            let uiElement = document.createElement('span')
            uiElement.classList.add(`${valName}`)
            uiElement.textContent = val
            par.appendChild(uiElement)
        }
        return
    },        
}
      

const displayShip = function(event, someGb, someGetCont=defaultConfig.getBoardContains){
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

const _recordComponentPaths = function(obj){
    let paths = []
    let confirmedPaths = []

    let initialInjection = recordPathHelpers().initialInjection
    initialInjection(obj,paths)

    confirmedPaths = recordPathHelpers().finalisePath(obj,paths,confirmedPaths)
    return confirmedPaths

}

const _componentFilter = function(componentsObj=ships.components){
    let allPropTitles = Array.from(document.querySelectorAll('propertyTitle')).map(title => title.textContent)
    if(allPropTitles.includes('action')){
        let allProps = Array.from(document.querySelectorAll('propertyTitle'))
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
        let finalTarget = componentsObj()
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


const activateModifyProperties = function(event, params, publish=gameEvents.publish){
    const shipLoc = params[0].target.id
    const gb = params[1]
    let path = [recordPathHelpers().chartPath(event)]
    let changeConfig = ['modify', path[0]]
    _componentStore(_componentFilter(ships.components),path)
    let finalOptions = Array.from(document.querySelectorAll('.compPropertyTitle'))
    for(let opt of finalOptions){
        let par = opt.parentElement
        let children = Array.from(par.children).filter(child => child.classList.contains('compContainer') || child.classList.contains('compElement'))
        if(children.length > 0){
            opt.onclick = function(){
                publish('playerAction',gb, undefined, shipLoc, [...changeConfig, opt.textContent]) 
            } 
        }
         //remember to revise this if playerAction is not the right event name &/or other changes. 
    }
}

const _finaliseExtendComp = function(event){
    
}


const _generateOptionsObject = function(componentsObj=ships.components){

    const _doneButton = function(){
        const Done = document.createElement('button')
        Done.classList.add('done')
        Done.textContent = 'Done'
        Done.onclick = null//edit
        return Done
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
        'Build New Ship' : function(){

        }
    }

    const ship = {
        'Move Ship' : function(){

        },
        'Modify Ship' : function(...params){
            const propTitles = document.querySelectorAll('.propertyTitle')
            const props = Array.from(propTitles).map(elem => elem.textContent)
            let compStore = componentsObj()
            for(let prop of props){
                for(let elem of Object.keys(compStore)){
                    if(props.includes(elem)){
                        let ind = props.indexOf(elem)
                        let propChildren = Array.from(propTitles[ind].parentElement.children).filter(key => key.classList.contains('property'))
                        if(propChildren.length === 0){
                            propTitles[ind].classList.add('Mod')
                            propTitles[ind].onclick = function(e){
                                activateModifyProperties(e, params)
                            }
                        }                 
                    }
                    compStore = compStore[prop]
                }
            }     
        },
        'Extend Ship' : function(...params){
            _componentStore()
            let store = document.querySelector('.componentStore')
            store.appendChild(_doneButton())
            let checkAgainst = Array.from(document.querySelectorAll('.propertyTitle')).map(elem => elem.textContent)
            let compPropTitles = Array.from(document.querySelectorAll('.compPropertyTitle'))
            let toVet = compPropTitles.map(elem => elem.textContent)
            for(let elem of toVet){
                if(checkAgainst.includes(elem)){
                compPropTitles[toVet.indexOf(elem)].classList.add('unavailable')
            }
            //else if(elem leads to a value){
                //onclick ->
                //upgradeShip with mode set to etc etc. 
                //consume NO turns
                //then reload the exact same page, the upgraded item should be unavailable. 
                //Done/Cancel button ought to be availble
                //prior to this reload, there should be a checking mechanism which applies to see if there are any properties available for the ship to extend.
                //if there are none, it should not be available as an option. 
            //}
            _availabilityGuard(...params) //revise when finishing. 
    }

        },
        'Extend Component' : function(){

         },
        'Effect Ship Action' : function(event, someGb, someGetCont=defaultConfig.getBoardContains){
            const key = event.target.id;
            const ship = someGetCont(someGb,key)

        },

    }

    const filterOptions = function(){
        let view = document.querySelector('.viewConsole');
        if(!view){
            return {
                defaultOpts
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
            }
            optCons.appendChild(opt)
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
            } 
        }
    }   
}

export const subscribeUIEvents = function(someSubFunc=gameEvents.subscribe){
    someSubFunc('viewShip', displayShip)
    someSubFunc('viewShip', createOptionsConsole)


}
