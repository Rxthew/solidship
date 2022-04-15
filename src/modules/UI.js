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
    let store = document.createElement('div')
    store.classList.add('componentStore')
    let choices = Object.keys(componentsObj())

    //remember componentsObj still need to initialise. 
    
}

const optionsObject = {
    ship : {
        'Move Ship' : function(){

        },
        'Modify Ship' : function(componentsObj=ships.components){
            const propTitles = document.querySelectorAll('.propertyTitle')
            const props = Array.from(propTitles).map(elem => elem.textContent)
            let compStore = componentsObj()
            for(let prop of props){
                for(let elem of Object.keys(compStore)){
                    if(props.includes(elem)){
                        let ind = props.indexOf(elem)
                        propTitles[ind].classList.add('Mod')
                    }
                    compStore = compStore[prop]
                }
            }     
        },
        'Extend Ship' : function(){

        },
        'Effect Ship Action' : function(event, someGb, someGetCont=defaultConfig.getBoardContains){
            const key = event.target.id;
            const ship = someGetCont(someGb,key)

        },
    },
    default : {
        'Build New Ship' : function(){

        }
    }

}

const createOptionsConsole = function(...params){
    if(document.querySelector('.optConsole')){
        document.querySelector('.optConsole').remove()
    }
    let view = document.querySelector('.viewConsole');
    let main = document.querySelector('.mainConsole')
    let optCons = document.createElement('div')
    optCons.classList.add('optConsole')
    main.appendChild(optCons)
    let keys = Object.keys(optionsObject)
    if(!view){
        keys = keys.filter(key => key !== 'ship')
    }
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



const _createViewConsole = function(){
    if(document.querySelector('.viewConsole')){
        document.querySelector('.viewConsole').remove()
    }
    let viewConsole = document.createElement('div')
    viewConsole.classList.add('viewConsole')
    document.querySelector('.mainConsole').appendChild(viewConsole) 
    return document.querySelector('.viewConsole')

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
    return {
        addNewPath,
        initialInjection,
        finalisePath
    }

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

const revealShipProps = {
    determineUIKey : function(parent, key){
        let children = Array.from(parent.children)
        for(let child of children){
            if(child.classList.contains(key)){
                return child
            }
        }
        return this.keyToUIelement(parent,key)


    },
    keyToUIelement : function(parent,key){
        let prop = document.createElement('div')
        let title = document.createElement('span')
        prop.classList.add('property')
        prop.classList.add(`${key}`)
        title.classList.add('propertyTitle')        
        title.textContent = key 
        prop.appendChild(title)
        parent.appendChild(prop)
        return prop
        },
    valueToUIelement : function(par,val){
        if(Array.isArray(val)){
            let container = document.createElement('div')
            container.classList.add('container')
            for(let elem of val){
                let uiElement = document.createElement('span')
                uiElement.classList.add('element')
                uiElement.textContent = elem
                container.appendChild(uiElement)
            }
            par.appendChild(container)
        }
        else if(typeof val === 'string' || typeof val === 'number'){
            let uiElement = document.createElement('span')
            uiElement.classList.add('element')
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
                parent = revealShipProps.determineUIKey(parent,elem)
                let value = finalTarget[elem]
                revealShipProps.valueToUIelement(parent,value)
            }
            else {
                parent = revealShipProps.determineUIKey(parent,elem)
            }
            finalTarget = finalTarget[elem]
        }
    }
    return viewConsole
    
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
