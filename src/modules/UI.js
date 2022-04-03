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


const _createConsole = function(){
    if(document.querySelector('.console')){
        document.querySelector('.console').remove()
    }
    let console = document.createElement('div')
    console.classList.add('console')
    document.body.appendChild(console)
    return document.querySelector('.console')

}

const _shipKeyToUserElement = function(ship){
    let shipProps = Object.keys(ship)
    let props = []
        for(let elem of shipProps){
            let prop = document.createElement('div')
            let title = document.createElement('span')
            prop.classList.add('property')
            title.classList.add('propertyTitle')
            title.textContent = elem
            prop.appendChild(title)
            props.push(prop)
        }
        return props
}

const _shipValueToUserElement = function(shipObj,propArr){
    const parent = propArr[0]
    let value = Object.values(shipObj)[0]
    if(Array.isArray(value)){
        let container = document.createElement('div')
        container.classList.add('container')
        for(let elem of value){
            let uiElement = document.createElement('span')
            uiElement.classList.add('element')
            uiElement.textContent = elem
            container.appendChild(uiElement)
        }
        parent.appendChild(container)
    }
    else if(typeof value === 'string'){
        let uiElement = document.createElement('span')
        uiElement.classList.add('element')
        uiElement.textContent = value
        parent.appendChild()
    }
    let newPropArr = [parent]
    return newPropArr
}




const _displayShipProperties = function(event,someGb,someGetCont){
    if(event.target.textContent === ''){
        return
    }
    let console = _createConsole()
    let keys = Object.keys(someGb)
    for (let elem of keys){
        if(event.target.classList.contains(elem)){
            let ship = someGetCont(someGb,elem)
            let shipKeys = _shipKeyToUserElement(ship)
            for(let shipKey of shipKeys){
                shipKey.classList.add(`${elem}`)
                console.appendChild(shipKey)
            }
        }
    }
    return console
}

export const renderState = function(someGb, someGetCont){
    let newBoard = _buildBoard()
    if(document.querySelector('.gamezone')){
        document.querySelector('.gamezone').remove()
    }
    document.body.appendChild(newBoard)
    
    for (let elem of Object.keys(someGb)){
        if(document.querySelector(`.${elem}`) && someGetCont(someGb,elem)){
            document.querySelector(`.${elem}`).textContent = 'S'
        }
    }   
}

