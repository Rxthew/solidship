

let camelMatcher = '/[a-z]+((([A-Z][a-z]+))*[A-Z]?/g'
let phraseMatcher = '/[A-Z][a-z]+(\\s)[A-Z][a-z]+/g' //make it so that it's more than 1


const fromCamelToNorm = function(str){
    let newStrArr = str.split('')
    let first = newStrArr[0]
    newStrArr = [first.toUpperCase(), ...newStrArr.filter(lett => newStrArr.indexOf(lett) !== 0)] //incomplete...fix

}

const fromNormToCamel = function(str){
    let newStrArr = str.split('')
    let first = newStrArr[0]
    newStrArr = [first.toLowerCase(), ...newStrArr.filter(lett => newStrArr.indexOf(lett) !== 0 && lett !== ' ')]
    let newStr = newStrArr.join('')
    return newStr

}