import { describe, expect, test } from '@jest/globals' 
import { gameBoard, updateBoardContents } from '../gameboard'
import * as ships from '../ships'
import { fireMissle } from '../AI'

describe('AI testing', () => {
    const planting = ships.plantingShip
    let regGameBoard = new gameBoard('full')
    let fullContainsObject = (function(){
        const boardObj = regGameBoard.board
        let containsObj = {}
        for(let key of Object.keys(boardObj)){
            containsObj[key].contains = Object.assign(containsObj, {[key]: planting()})
        }
        return containsObj
    })()
    let fullGameBoard = updateBoardContents(regGameBoard,fullContainsObject)

    test('fireMissile damages a ship if it hits it',() => {
        //expect firemissie not to equal fullGameBoard

    })
    test('fireMissile returns the same gameBoard if there is no impact',() => {
        
    })
})