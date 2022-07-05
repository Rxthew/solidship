import {integrateChild} from '../utils.js'


const creations = {
     main : function(){
        if(document.querySelector('.mainConsole')){
            document.querySelector('.mainConsole').remove()
        }
        const mainConsole = document.createElement('div')
        mainConsole.classList.add('mainConsole')
        return mainConsole
    },
    nav : function(){
        if(document.querySelector('#navBar')){
            document.querySelector('#navBar').remove()
        }
        const nav = document.createElement('nav')
        nav.id = 'navBar'
        nav.onclick = toggleNone
        return nav
    },

    view : function(){
        if(document.querySelector('.viewConsole')){
            document.querySelector('.viewConsole').remove()
        }
        const viewConsole = document.createElement('div')
        viewConsole.classList.add('viewConsole')
        return viewConsole
    },

    opts : function(){
        if(document.querySelector('#opts')){
            document.querySelector('#opts').remove()
        }
        const optConsole = document.createElement('div')
        optConsole.id = 'opts'
        return optConsole
    },

    ship : function(){
        if(document.querySelector('#ship')){
            document.querySelector('#ship').remove()
        }
        const shipConsole = document.createElement('div')
        shipConsole.id = 'ship'
        return shipConsole
    },
    store : function(){
        if(document.querySelector('#store')){
            document.querySelector('store').remove()
        }
        const store = document.createElement('div')
        store.id = 'store'
        return store
    }

}


const toggleNone = function(event){
    if(event.target === event.currentTarget){
        return
    }
    const view = document.querySelector('.viewConsole')
    const viewChildren = [...view.children]
    return viewChildren.map(child => event.target.dataset.id !== child.id ? child.classList.toggle('toggleNone',true) : child.classList.toggle('toggleNone',false))
    

}


const uiButton = function(uiContainer){
    if(document.querySelector(`[data-id=${uiContainer.id}]`)){
        document.querySelector(`[data-id=${uiContainer.id}]`).remove()
    }
    const button = document.createElement('button')
    button.dataset.id = uiContainer.id 
    button.textContent = uiContainer.id
    return button

}

const pushUIElement = function(uiContainer){
    const view = document.querySelector('.viewConsole');
    return integrateChild(view,uiContainer)

}

const toggleSetup = function(uiContainer){
    const nav = document.querySelector('#navBar')
    return integrateChild(nav,uiButton(uiContainer))
}

export const finishers = {
    main : () => integrateChild(document.querySelector('main'),creations.main()),
    nav : () => integrateChild(document.querySelector('.mainConsole'),creations.nav()),
    view : () => integrateChild(document.querySelector('.mainConsole'),creations.view()),
    opts: () => {
        const optConsole = creations.opts()
        pushUIElement(optConsole)
        toggleSetup(optConsole)
    },
    ship : () => {
        const shipConsole = creations.ship();
        pushUIElement(shipConsole)
        toggleSetup(shipConsole)
    },
    store : (storeType) => {
        const store = creations.store()
        integrateChild(store,storeType)
        pushUIElement(store)
        toggleSetup(store)
    }
}

export const toggleToConsole = function(currentConsole,targetConsole,optionalType){
    if(!document.querySelector(`#${currentConsole}`)){
        return
    } 
    document.querySelector(`#${currentConsole}`).classList.toggle('toggleNone',true)
    if(document.querySelector(`#${targetConsole}`)){
        document.querySelector(`#${targetConsole}`).classList.toggle('toggleNone',false)
    }
    else{
        finishers[`${targetConsole}`](optionalType)
    }
    return
}





