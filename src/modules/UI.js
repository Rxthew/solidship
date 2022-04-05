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

}

const optionsView = {
    default : function(){

    },
    ship : function(){

    }
}

const createOptionsConsole = function(){

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

const _shipKeyToUserElement = function(ship,someGb,someGetCont){
    let shipProps = Object.keys(ship)
    let props = []
        for(let elem of shipProps){
            let prop = document.createElement('div')
            let title = document.createElement('span')
            prop.classList.add('property')
            title.classList.add('propertyTitle')
            title.textContent = elem
            title.onclick = function(event){
                _displayFurtherShipProperties(event,someGb,someGetCont) //Note: modify to be in line with other events
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

export const renderState = function(someGb, someGetCont){
    let newBoard = _buildBoard()
    if(document.querySelector('.gamezone')){
        document.querySelector('.gamezone').remove()
    }
    document.body.appendChild(newBoard)
    
    for (let elem of Object.keys(someGb)){
        if(document.querySelector(`.${elem}`) && someGetCont(someGb,elem)){
            document.querySelector(`.${elem}`).textContent = 'S' //to modify later
            document.querySelector(`.${elem}`).onclick = function(event) {_displayInitShipProperties(event, someGb, someGetCont);
            document.querySelector(`.${elem}`).onclick = null} //to modify later in line with other events. 
        }
    }   
}

