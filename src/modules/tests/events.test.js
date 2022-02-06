import { expect, test } from '@jest/globals';
import {events} from '../events'

const eventsInstance = events();

test('custom event fires with expected result', () => {
    let aSampleArray = []
    let addToArray = function(someArr){
        someArr.push(2)
        return someArr

    }
    eventsInstance.subscribe('thisEvent',addToArray, aSampleArray)
    eventsInstance.publish('thisEvent')
    expect(aSampleArray).toEqual([2])
})