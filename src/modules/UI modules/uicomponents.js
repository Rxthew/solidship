import recordPathHelpers from './paths'
import { components } from '../ships'
import { revealProps, numeralPropStatus } from '../utils'


const recordComponentPaths = function(obj){
    let paths = []
    let confirmedPaths = []

    let initialInjection = recordPathHelpers().initialInjection
    initialInjection(obj,paths)

    confirmedPaths = recordPathHelpers().finalisePath(obj,paths,confirmedPaths)
    return confirmedPaths

}

export const componentActionFilter = function(componentsObj=components){
    const primaryAction = Array.from(document.querySelectorAll('.primaryMarker')).filter(element => element.closest('.action'))
    if(primaryAction.length > 0){
        const firstAct = primaryAction.textContent
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

export const componentPathFilters = {
    'Extend Component' : function(event,componentsObj=componentActionFilter(components)){
        let initPath = recordPathHelpers().chartPath(event)
        let allPaths = recordComponentPaths(componentsObj)
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
    },
    'Extend Ship' : function(componentsObj=componentActionFilter(components)){
        const allPaths = recordComponentPaths(componentsObj)
        const toCheckAgainst = Array.from(document.querySelectorAll('.propertyTitle')).map(title => title.id)
        let newPaths = []
        for(let path of allPaths){
            let newPath = [...path].filter(elem => !toCheckAgainst.includes(elem))
            newPaths = newPath.length > 0 ? [...newPaths, newPath] : newPaths
        }
        const setPaths = [...new Set(newPaths)]
        if(setPaths.length > 0){
            return setPaths
        }
        return false
    }

}



export const componentStore = function(componentsObj=componentActionFilter(components),path=recordComponentPaths(componentsObj)){
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
                value = revealProps.valueToUIelement(parent,value,'compContainer','compElement')
                numeralPropStatus(value,parent,'compPropertyTitle','compProperty','compElement')
            }
            else {
                parent = revealProps.determineUIKey(parent,elem, 'compProperty','compPropertyTitle') 
            }
            finalTarget = finalTarget[elem]
        }
    
    }
    main.appendChild(store)

     
}
