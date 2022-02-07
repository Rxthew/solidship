import { expect, test } from '@jest/globals';
import {events} from '../events'

const eventsInstance = events();

let addToArray = function(someArr){
    someArr.push(2)
    return someArr

}

let addMoreToArray = function(someArr){
    someArr.push(3)
    return someArr
}

test('custom event calls handler', () => {
    let aSampleArray = []
    
    eventsInstance.subscribe('thisEvent',addToArray, aSampleArray)
    eventsInstance.publish('thisEvent')
    expect(aSampleArray).toEqual([2])
})

test('custom event calls multiples handlers in expected order', () => {
    let aSampleArray2 = []

    eventsInstance.subscribe('thisEvent2',addToArray, aSampleArray2)
    eventsInstance.subscribe('thisEvent2',addMoreToArray, aSampleArray2)
    eventsInstance.publish('thisEvent2')
    expect(aSampleArray2).toEqual([2,3])

})

//test('remove the right handler from event', () => { Refactor
//    let aSampleArray3 = []
//    let addToArraySecond = addToArray

//    eventsInstance.subscribe('thisEvent3',addToArray, aSampleArray3)
//    eventsInstance.subscribe('thisEvent3',addMoreToArray, aSampleArray3)
//    eventsInstance.subscribe('thisEvent3',addToArraySecond,aSampleArray3)
//    eventsInstance.subscribe('thisEvent3', addMoreToArray, aSampleArray3)
//    eventsInstance.removeHandler('thisEvent3',addToArraySecond)
//    eventsInstance.publish('thisEvent3')
//    expect(aSampleArray3).toEqual([3,3])
//})

