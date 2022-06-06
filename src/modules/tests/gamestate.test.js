import { describe,test,expect} from "@jest/globals";
import { updateState, isGameOver,gameEvents,firstHappeningSensor,logCounts,thresholdSensor, gameTime } from "../gamestate";
import { gameBoard} from '../gameboard'


test('state of gameBoard updates', () => {
const somePlayer = {
    randomMethod : 'randomMethod',
    gameState : {}
}
const newGame = new gameBoard('new game')
let updatedPlayer = updateState(somePlayer, newGame)
expect(updatedPlayer.gameState).toEqual(newGame)

const firstMove = new gameBoard('first move')
let firstMovePlayer = updateState(somePlayer,firstMove)
expect(firstMovePlayer.gameState).toEqual(firstMove)
})

describe('testing isGameOver',() => {
    let check = 0
    let dummyPublisher = function(gs){
        if(gs.state === 'Player Won'){
            check+= 2          
        }
        else if(gs.state === 'Player Lost'){
            check+= 1
        }
    return
    }
    gameEvents.subscribe('renderGameState', dummyPublisher)

    test('expect player to win if gameboard fully populated and plant count >== 200', () => {
        let winner = new gameBoard()
        for (let zone of Object.keys(winner.board)){
            winner.board[`${zone}`].contains = {ship : 'placeholder'}
        }
        winner.plants = 200 
        isGameOver(winner)
        expect(check).toBe(2)
        winner.plants = 201
        isGameOver(winner)
        expect(check).toBe(4)
        winner.plants = 199
        isGameOver(winner)
        expect(check).toBe(4)

    })


    test('expect player to lose if gameboard empty', () => {
        let loser = new gameBoard()
        isGameOver(loser)
        expect(check).toBe(5)

    })

    test('expect player to lose if wreckage is 100 and over', () => {
        let loserTheSecond = new gameBoard()
        loserTheSecond.board.A1.contains = {ship : 'placeholder'}

        loserTheSecond.wreckage = 199
        isGameOver(loserTheSecond)
        expect(check).toBe(5)

        loserTheSecond.wreckage = 200
        isGameOver(loserTheSecond)
        expect(check).toBe(6)

        loserTheSecond.wreckage = 201
        isGameOver(loserTheSecond)
        expect(check).toBe(7)
    })

    test('expect nothing to happen if the above conditions not met', () => {
        let ongoingBoard = new gameBoard()

        ongoingBoard.board.A1.contains = {ship : 'placeholder'}
        isGameOver(ongoingBoard)
        expect(check).toBe(7)

        for (let zone of Object.keys(ongoingBoard.board)){
            ongoingBoard.board[`${zone}`].contains = {ship : 'placeholder'}
        }

        isGameOver(ongoingBoard)
        expect(check).toBe(7)

        ongoingBoard.plants = 199
        ongoingBoard.wreckage = 199

        isGameOver(ongoingBoard)
        expect(check).toBe(7)

        
    })

    test('expect game to continue if gameboard fully populated and plant count >== 200 BUT wreckage is greater than 5~', () => {
        let nearlywin = new gameBoard()
        for (let zone of Object.keys(nearlywin.board)){
            nearlywin.board[`${zone}`].contains = {ship : 'placeholder'}
        }
        nearlywin.plants = 200 
        nearlywin.wreckage = 6
        isGameOver(nearlywin)
        expect(check).toBe(7)

    })
    
    test('expect nothing to happen if anything other than an object is passed as a parameter', () => {
        isGameOver(12)
        isGameOver('testing')
        expect(check).toBe(7)
    })

})

test('testing firstHappeningSensor should publish only prescribed strings & once only', () => {
    let testArray = []
    let testFunction = function(someKey){
        if(someKey === 'test'){
            return 'test passed'
        }
    }
    let dumbPublish = function(eventName,key){
        if(eventName === 'renderLog'){
            testArray.push(testFunction(key))
        }
        return testArray
    }
    expect(firstHappeningSensor('some test',dumbPublish)).toEqual([])
    expect(testArray).toEqual([])

    expect(firstHappeningSensor('test',dumbPublish)).toEqual(['test'])
    expect(testArray).toEqual(['test passed'])

    expect(firstHappeningSensor('some test',dumbPublish)).toEqual(['test'])
    expect(testArray).toEqual(['test passed'])

    expect(firstHappeningSensor('test',dumbPublish)).toEqual(['test'])
    expect(testArray).toEqual(['test passed'])

    expect(firstHappeningSensor('missile hit ship',dumbPublish)).toEqual(['test'])
    expect(testArray).toEqual(['test passed'])

    expect(firstHappeningSensor('effect clear action',dumbPublish)).toEqual(['test'])
    expect(testArray).toEqual(['test passed'])

    expect(firstHappeningSensor(5,dumbPublish)).toEqual(['test'])
    expect(testArray).toEqual(['test passed'])

    expect(firstHappeningSensor({},dumbPublish)).toEqual(['test'])
    expect(testArray).toEqual(['test passed'])
      

})

test('testing logCounts -> fires renderLog with array of values to be rendered, if param is not an object then does nothing', () => {
    let testArray2 = []
    let logCountsBoard = new gameBoard()
    let dumbLog = function(obj){
        if(obj[0] === logCountsBoard.wreckage && obj[1] === logCountsBoard.plants && obj[2] === gameTime.days){
            testArray2.push(0)
        }
        return
    }
    gameEvents.subscribe('renderLog',dumbLog)
    logCounts('default action')
    expect(testArray2).toEqual([])
    logCounts(logCountsBoard)
    expect(testArray2).toEqual([0])
    logCounts('missile sunk ship')
    expect(testArray2).toEqual([0])
    gameTime.days = 0
    

})

test('testing thresholdSensor -> sense event fires if next threshold is reached or exceeded (does nothing if object not passed in as first param)', () => {
    let testArray3 = []
    let thresholdGb = new gameBoard()
    let dumbSense = function(str){
        if(str.substring(0,5) === 'first'){
            testArray3.push(1)
        }
        return testArray3
    }
    gameEvents.subscribe('senseEvent', dumbSense)
    thresholdSensor(thresholdGb)
    expect(testArray3).toEqual([])
    thresholdGb.wreckage = 2
    thresholdGb.plants = 1
    thresholdSensor(thresholdGb)
    expect(testArray3).toEqual([1,1])
    logCounts(thresholdGb)
    thresholdSensor(thresholdGb)
    expect(testArray3).toEqual([1,1,1])
    thresholdSensor(22)
    thresholdSensor('missile hit ship')
    expect(testArray3).toEqual([1,1,1])
    
})