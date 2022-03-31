const _buildBoard = function(){
    const gameBoard = document.createElement('table')
    const gameBody = document.createElement('tbody')
    gameBoard.appendChild(gameBody)
    const lets = ['A','B','C','D','E','F']
    const nums = ['1','2','3','4','5','6']
    const rowHead = document.createElement('tr')
    let whiteSpace = document.createElement('th')
    rowHead.appendChild(whiteSpace)
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
            td.className = `${letr}${elem}`
        }
        gameBody.appendChild(tr)
    }
}


export const renderState = function(someGb, someGetCont){


}