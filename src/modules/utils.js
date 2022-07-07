const camelMatcher = /[a-z]+([A-Z][a-z]+)*[A-Z]?/g

export const camelPhraseParser = function(str){
    str = (str).toString()
    if(str.match(camelMatcher)){
        return fromCamelToNorm(str)
    }
    else if(str.match(/(\s)/g)){
        return fromNormToCamel(str)
    }
    return str   
}

const fetchAsset = async function(assetName){
    try {
        const image = new Request(`../src/assets/${assetName}`)
        const response = await fetch(image)
        const data = await response.text()
        return data
    }
    catch (error){
        console.log(error)

    }
}

const fromCamelToNorm = function(str){
    let newStrArr = str.split('')
    let first = newStrArr[0]
    newStrArr = [...newStrArr]
    newStrArr.splice(0,1)
    let currInd = 0
    for(let elem of newStrArr){
        currInd += 1
        if(currInd === newStrArr.length - 1){
            break
        }
        if(elem === elem.toUpperCase()){
            newStrArr = [...newStrArr]
            newStrArr.splice(currInd-1,0,' ')
            currInd += 1 
        }
    }
    let newStr = [first.toUpperCase(), ...newStrArr].join('')
    return newStr        
}

const fromNormToCamel = function(str){
    let newStrArr = str.split('')
    let first = newStrArr[0]
    newStrArr = [...newStrArr]
    newStrArr.splice(0,1)
    newStrArr = [...newStrArr.filter(lett => lett !== ' ')]
    newStrArr = [first.toLowerCase(), ...newStrArr]
    let newStr = newStrArr.join('')
    return newStr

}


export const integrateChild = function(parent,child){
    parent.appendChild(child)
    return {
        'parent': parent,
        'child' : child
    }
}

export const renderImage = async function(node,assetName){
    try {
        const data = await fetchAsset(assetName)
        node.innerHTML = data
    }
    catch(error){
        console.log(error)
    }
}

export const revealProps = {
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

        const edgeCases = ['breakpoint', 'count', 'damage', 'mode' , 'plants', 'plantCount', 'reinforcedBreakpoint', 'wreckage', 'wreckageCount']
        const edgeClass = function(key){
            const compStaticKeys = ['plantCount','wreckageCount']
            return compStaticKeys.includes(key) ? 'compStaticTitle' : 'staticTitle'
        }
                    
        let prop = document.createElement('div')
        let title = document.createElement('span')
        edgeCases.includes(key) ? prop.classList.add('static') : prop.classList.add(`${propName}`)
        prop.classList.add(`${key}`)
        edgeCases.includes(key) ? title.classList.add(edgeClass(key)) : title.classList.add(`${propTitleName}`)
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
                isNaN(elem) ? uiElement.id = elem : false
                uiElement.textContent = elem
                container.appendChild(uiElement)
            }
            par.appendChild(container)
            return container
        }
        else {
            let uiElement = document.createElement('span')
            uiElement.classList.add(`${valName}`)
            isNaN(val) ? uiElement.id = val : false
            uiElement.textContent = camelPhraseParser(val)
            par.appendChild(uiElement)
            return uiElement
        }
        
    }        
}


