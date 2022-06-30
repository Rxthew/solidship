import { integrateChild, renderImage } from "../utils";

 const buildBoard = function(){
    if(document.querySelector('.gamezone')){
        document.querySelector('.gamezone').remove()
    }
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

const renderShipImage = async function(node,assetName){ 
    try {
        node.classList.contains('ship') ? await renderImage(node,assetName) : false

    }
    catch(error){
        console.log(error)
    }
}

export const UIBoard = function(someGameState, someGetCont, gb, publish){
    const someGb = gb(someGameState);
    const newBoard = integrateChild(document.querySelector('main'),buildBoard())
    newBoard.onclick = function(event) {
        if(event.target.classList.contains('ship')){
            publish('viewShip',event,someGameState,someGetCont,gb);
        }} 
    for (let elem of Object.keys(someGb)){ 
        if(document.querySelector(`#${elem}`) && someGetCont(someGb,elem)){
            document.querySelector(`#${elem}`).classList.add('ship')
            renderShipImage(document.querySelector(`#${elem}`),'ship.svg')
        }
    }
}



