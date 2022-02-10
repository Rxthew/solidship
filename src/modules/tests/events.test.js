import { expect, test } from '@jest/globals';
import {events} from '../events'

const eventsInstance = events();



let addToArray = function(someArr){
    someArr.push(2)
    return someArr

}

let addToArrays = function(...someArrs){
    for (let arr of someArrs){
        addToArray(arr)
    }
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

test('remove the right specific handler from event', () => { 
   let aSampleArray3 = []
   const genArray  = function(someEvent){
    eventsInstance.subscribe(someEvent,addToArray, aSampleArray3)
    eventsInstance.subscribe(someEvent,addMoreToArray, aSampleArray3)
    eventsInstance.subscribe(someEvent,addToArray,aSampleArray3)
    eventsInstance.subscribe(someEvent, addMoreToArray, aSampleArray3)
   }

    genArray('thisEvent3')
    eventsInstance.removeHandler('thisEvent3',addToArray,2)
    eventsInstance.publish('thisEvent3')
    expect(aSampleArray3).toEqual([2,3,3])

    aSampleArray3 = []
    

    genArray('thisEvent4')
    
    eventsInstance.removeHandler('thisEvent4',addToArray,1)
    eventsInstance.publish('thisEvent4')
    
    expect(aSampleArray3).toEqual([3,2,3])

})

test('remove all duplicate handlers when no occurrence specified', () => {
    let aSampleArray4  = [];
    eventsInstance.subscribe('thisEvent5',addMoreToArray,aSampleArray4)
    eventsInstance.subscribe('thisEvent5',addToArray,aSampleArray4)
    eventsInstance.subscribe('thisEvent5',addMoreToArray,aSampleArray4)
    eventsInstance.removeHandler('thisEvent5',addMoreToArray)
    eventsInstance.publish('thisEvent5')
    
    expect(aSampleArray4).toEqual([2])   
})

test('selectivly publishes the right handlers with/without occurrence', () => {
    let aSampleArray5  = [];
    eventsInstance.subscribe('thisEvent6',addMoreToArray,aSampleArray5)
    eventsInstance.subscribe('thisEvent6',addToArray,aSampleArray5)
    eventsInstance.subscribe('thisEvent6',addMoreToArray,aSampleArray5)
    
    eventsInstance.selectivePublish('thisEvent6',addMoreToArray) 
    expect(aSampleArray5).toEqual([2])
    let aSampleArray6 = []
    eventsInstance.subscribe('thisEvent7',addMoreToArray,aSampleArray6)
    eventsInstance.subscribe('thisEvent7',addToArray,aSampleArray6)
    eventsInstance.subscribe('thisEvent7',addMoreToArray,aSampleArray6)
    eventsInstance.selectivePublish('thisEvent7',addToArray)
    expect(aSampleArray6).toEqual([3,3])
    eventsInstance.selectivePublish('thisEvent7',addMoreToArray,2)
    expect(aSampleArray6).toEqual([3,3,3,2])
    
})

test('publishes with own params passed into it then with any params stored for that particular object',() => {
    let aSampleArray7 = [];
    let aSampleArray8 = [];

    eventsInstance.subscribe('thisEvent8',addToArrays, aSampleArray8);
    eventsInstance.publish('thisEvent8',aSampleArray7)
    expect(aSampleArray7).toEqual([2])
    expect(aSampleArray8).toEqual([2])
    

})