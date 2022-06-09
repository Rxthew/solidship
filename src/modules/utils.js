let camelMatcher = /[a-z]+([A-Z][a-z]+)*[A-Z]?/g

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

const _fetchAsset = async function(assetName){
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

export const renderImage = async function(node,assetName){
    try {
        const data = await _fetchAsset(assetName)
        node.innerHTML = data
    }
    catch(error){
        console.log(error)
    }
}
