import {integrateChild} from '../utils.js'


const creations = {
     main : function(){
        if(document.querySelector('.mainConsole')){
            document.querySelector('.mainConsole').remove()
        }
        let mainConsole = document.createElement('div')
        mainConsole.classList.add('mainConsole')
        return mainConsole
    },
    nav : function(){
        let nav = document.createElement('nav')
        nav.id = 'navBar'
        nav.onClick = toggleNone
        return nav
    },

    view : function(){
        if(document.querySelector('.viewConsole')){
            document.querySelector('.viewConsole').remove()
        }
        let viewConsole = document.createElement('div')
        viewConsole.classList.add('viewConsole')
        return viewConsole
    },

    ship : function(){
        if(document.querySelector('#ship')){
            document.querySelector('#ship').remove()
        }
        let shipConsole = document.createElement('div')
        shipConsole.id = 'ship'
        return shipConsole
    }

}


const toggleNone = function(event){
    if(event.target === event.currentTarget){
        return
    }
    const view = document.querySelector('.viewConsole')
    const viewChildren = [...view.children]
    return viewChildren.map(child => !event.target.classList.contains(child.id) ? child.classList.toggle('toggleNone',true) : child.classList.toggle('toggleNone',false))

}

const uiButton = function(uiContainer){
    const button = document.createElement(button)
    button.classList.add(uiContainer.id) 
    button.textContent = uiContainer.id
    return button

}

const pushUIElement = function(uiContainer){
    const view = document.querySelector('.viewConsole');
    return integrateChild(view,uiContainer)

}

const toggleSetup = function(uiContainer){
    const nav = document.querySelector('nav')
    return integrateChild(nav,uiButton(uiContainer))
}

export const finishers = {
    main : () => integrateChild(document.querySelector('main'),creations.main()),
    nav : () => integrateChild(document.querySelector('.mainConsole'),creations.nav()),
    view : () => integrateChild(document.querySelector('.mainConsole'),creations.view()),
    ship : () => {
        const shipConsole = creations.ship();
        pushUIElement(shipConsole)
        toggleSetup(shipConsole)
    }
}







