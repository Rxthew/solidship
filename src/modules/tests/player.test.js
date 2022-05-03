import {test,expect,describe} from "@jest/globals";
import { gameBoard } from "../gameboard";
import {playerObj, placeShip, moveShip, blockMissileAction, upgradeShip, effectFarm,effectClear,effectPlayerAction} from '../player';
import {basicShip,legacyShip,plantingShip,clearingShip,getChangedShip} from '../ships'


test('Player object has correct properites', () => {
    expect(new playerObj('player1')).toEqual(
        {
            name: 'player1',
            gameState: new gameBoard('new game')
        }
    )
})

test('Able to update player gameState', () => {
    const monkeyOnBoard = new gameBoard('test monkey')
    monkeyOnBoard.board.F1.contains = Object.assign({}, {name: 'monkey'})
    const player2 =  new playerObj('player2', monkeyOnBoard)
    expect(player2).toEqual(
        {
            name: 'player2',
            gameState: monkeyOnBoard
        }
    )
    expect(player2.gameState.board.F1.contains).toEqual({
           name: 'monkey'
    })
})

describe('testing placeShip function', () => {

    let first = new gameBoard().board
    let legacy = legacyShip()
    let target = 'A3'
    let newFirst = placeShip(first,legacy,target)
    

    test('return a new gameBoard with a correctly placed ship',() => {
        expect(newFirst.board[target].contains).toEqual(legacy)
    })
    
    let planting = plantingShip()
    let anotherBoard = placeShip(newFirst.board,planting,target)

    test('return occupied zone error', () => {
        expect(anotherBoard).toEqual({error: 'This zone is occupied'})
    })

    let target1 = 'A4'
    let newFirst2 = placeShip(first,null,target1)

    test('expect error when passing a \'null\' ship to an empty object', () => {
        expect(newFirst2).toEqual({error: 'Ship has missing properties'})
    })

    let newFirst3 = placeShip(new gameBoard().board,{isSunk: 'not sunk', damage: 44, type:'non-existing' },target1)

    test('expect error when passing a ship object with missing properties', () => {
        expect(newFirst3).toEqual({error: 'Ship has missing properties'})
        let newFirst4 = placeShip(new gameBoard().board, {damage: 44, type: 'non-existing', breakpoint: 'someBreakPoint'},target1)
        expect(newFirst4).toEqual({error: 'Ship has missing properties'})
    })

})

describe('testing moveShip function', () => {
    let first = new gameBoard().board
    let legacy = legacyShip()
    let source = 'A5'

   
    let second = placeShip(first,legacy,source).board
    

    test('Move illegal should return error', () => {
        expect(moveShip(second,source,'F6')).toEqual({error: 'This move is illegal'})
        expect(second['F6'].contains).toEqual(null)
        expect(second[source].contains).toEqual(legacy)

    })

    
    let third = moveShip(placeShip(new gameBoard().board,legacy,source).board,source,'A6')
    test('Legal move should return a new gameBoard', () => {
        expect(third.board['A6'].contains).toEqual(legacy)
        expect(third.board[source].contains).toEqual(null)
    })
    let fourth = moveShip(third.board,'A6','A5')
    test('move back returns previous results',() => {
        expect(fourth.board['A6'].contains).toEqual(null)
        expect(fourth.board['A5'].contains).toEqual(legacy)
    })
    
    
})

describe('testing missile block action',() => {
    const missileFree = new gameBoard()
    const blocked1 = blockMissileAction(missileFree.board,'A5')
    const blocked2 = blockMissileAction(missileFree.board,'F6')
    test('expect board to identify which zones are blocked, based on ship location', () => {
        expect(blocked1.board.missileBlocked).toEqual(['A5', ...blocked1.board['A5'].legalMoves])
        expect(blocked2.board.missileBlocked).toEqual(['F6', ...blocked2.board['F6'].legalMoves])
    })
    test('expect board state to change to missile block action', () => {
        expect(blocked1.state).toBe('missile block action')
        expect(blocked2.state).toBe('missile block action')

    })

    test('if blocked zones exist already on current board, then adds to them',() => {
        let blocked3 = blockMissileAction(blocked1.board, 'C3')
        expect(blocked3.board.missileBlocked).toEqual([...blocked1.board.missileBlocked, 'C3', ...blocked1.board['C3'].legalMoves])
    })

})

describe('testing upgradeShip (both re modification & re extending', () => {
       let upgradeBoard = new gameBoard();
       upgradeBoard = placeShip(upgradeBoard.board,plantingShip(),'A6')
       upgradeBoard = placeShip(upgradeBoard.board,plantingShip(),'B2')
       upgradeBoard = placeShip(upgradeBoard.board,new basicShip(),'C2')
       test('plantingShip action is modified to legacy',() => {
        upgradeBoard = upgradeShip(upgradeBoard.board,'A6',['modify',['action'],'legacy',getChangedShip])
        expect(upgradeBoard.state).toBe('upgrade ship action')
        expect(upgradeBoard.board.B2.contains).toEqual(plantingShip())
        expect(upgradeBoard.board.A6.contains.type).toBe('planting')
        expect(upgradeBoard.board.A6.contains.action).toEqual(['legacy'])

       })
       test('plantingShip action comp is extended to include legacy', () => {
        upgradeBoard = upgradeShip(upgradeBoard.board,'B2',['extend component',['action'],'legacy',getChangedShip])
        expect(upgradeBoard.state).toBe('upgrade ship action')
        expect(upgradeBoard.board.B2.contains.action).toEqual(['seagrass planting', 'legacy'])
       })
       test('basicShip can be extended with action property to legacy',() => {
           upgradeBoard = upgradeShip(upgradeBoard.board,'C2',['extend ship',['action'],'legacy',getChangedShip])
           expect(upgradeBoard.state).toBe('upgrade ship action')
           expect(upgradeBoard.board.C2.contains.action).toEqual(['legacy'])
       })
       test('if there is an error the function generates it',() => {
         let upgradeBoard2 = placeShip(upgradeBoard.board,new basicShip(),'F2')
         upgradeBoard2 = upgradeShip(upgradeBoard2.board,'F2',['modify',['properties','messagingProtocol'],'integrated',getChangedShip])  
         expect(upgradeBoard2).toBe('Ship does not have a valid action property')
       })
       

})

describe('testing effectFarm & effectClear', () => {
    let greatBigGB = new gameBoard();
    let aPlant = plantingShip()
    let anothPlant = plantingShip()
    anothPlant.properties.equipment.type = ['modern']
    greatBigGB.board.B1.contains = aPlant
    greatBigGB.board.C4.contains = anothPlant
    greatBigGB.board.C4.contains.properties.equipment.count.wreckage = 0 
    greatBigGB.wreckage = 4
    let aWreck = clearingShip()
    let anothWreck = clearingShip()
    anothWreck.properties.equipment.type = ['modern']
    greatBigGB.board.B5.contains = aWreck
    greatBigGB.board.C5.contains = anothWreck

    const firstIter = effectFarm(greatBigGB.board, 'B1', greatBigGB)
    
    const secondIter = effectFarm(firstIter.board, 'C4', firstIter )

    

    const thirdIter = effectClear(secondIter.board, 'B5', secondIter)
    const fourthIter = effectClear(thirdIter.board, 'C5', thirdIter)
    const fifthIter = effectClear(fourthIter.board, 'C4', fourthIter)
    

    test('effectFarm returns a new gameBoard, if equipment type is legacy, adds to plant count by 1',() => {
        expect(firstIter.board.B1.contains.properties.equipment.count.plants).toBe(1)
        expect(secondIter.board.B1.contains.properties.equipment.count.plants).toBe(1)

    })
    test('effectFarm returns a new gameBoard, if equipment type is modern, adds to plant count by 2',() => {
        expect(firstIter.board.C4.contains.properties.equipment.count.plants).toBe(0)
        expect(secondIter.board.C4.contains.properties.equipment.count.plants).toBe(2)
        
    })
    test('effectFarm returns a new gameBoard, if equipment type is legacy, adds to global plant count by 1',() => {
        expect(greatBigGB.plants).toBe(0)
        expect(firstIter.plants).toBe(1)
        
        
    })
    test('effectFarm returns a new gameBoard, if equipment type is modern, adds to global plant count by 2',() => {
        expect(secondIter.plants).toBe(3)
        
    })
    test('effectClear returns a new gameBoard, if equipment type is legacy, adds to wreckage count by 1',() => {
        expect(thirdIter.board.B5.contains.properties.equipment.count.wreckage).toBe(1)

    })
    test('effectClear returns a new gameBoard, if equipment type is modern, adds to wreckage count by 2',() => {
        expect(fourthIter.board.C5.contains.properties.equipment.count.wreckage).toBe(2)

        
    })
    test('effectClear returns a new gameBoard, equipment type is valid but does not add to wreckage if there is none to be added from the board',() => {
        expect(fifthIter.board.C4.contains.properties.equipment.count.wreckage).toBe(1)
        expect(fifthIter.board.C4.contains.properties.equipment.count.plants).toBe(2)

        
    })
    test('effectClear returns a new gameBoard, if equipment type is legacy, removes from global wreckage by 1 (no negatives)',() => {
        expect(greatBigGB.wreckage).toBe(4)
        expect(firstIter.wreckage).toBe(4)
        expect(secondIter.wreckage).toBe(4)
        expect(thirdIter.wreckage).toBe(3)
        
    })
    test('effectClear returns a new gameBoard, if equipment type is modern, removes from global wreckage by 2 (no negatives)',() => {
        expect(fourthIter.wreckage).toBe(1)
        expect(fifthIter.wreckage).toBe(0)
        
    })
})

describe('testing effectPlayerAction("ePA")', () => {
    let num = 0
    const publisherDummy = function(str){
        let evts = ['renderError','updateGameState','renderGameState','triggerAI']
        num += evts.indexOf(str)
        return 
    }
    test('ePA with right params re: upgrade should publish right evts (i.e mod & ext comp = upgamestate, rendergamestate, triggerai & ext ship just render & trig. + error)',() => {
        let gb = new gameBoard.board()
        gb.A4.contains = plantingShip()

        effectPlayerAction('modify',[gb,'A4',['modify', ['action'],'defense']],publisherDummy)
        expect(num).toBe(6)

        effectPlayerAction('modify',[gb,'A4',['modify', ['properties','equipment','type'],'modern']],publisherDummy) 
        expect(num).toBe(12)

        delete gb.A4.contains.action 

        effectPlayerAction('modify',[gb,'A4',['modify', ['properties','messagingProtocol'],'integrated']],publisherDummy)
        expect(num).toBe(12)

        gb.A4.contains = plantingShip()

        effectPlayerAction('extend component', [gb,'A4',['extend component',['action'],'legacy']],publisherDummy)
        expect(num).toBe(18)

        effectPlayerAction('extend ship', null ,publisherDummy)
        expect(num).toBe(23)

    })
    test('ePA with right params re: build/placeship & moveship should publish upgamestate + render + trigger',() => {
        let gb = new gameBoard().board;

        effectPlayerAction('build',[gb,legacyShip(),'B5'],publisherDummy)
        expect(num).toBe(6)

        gb.B6.contains = legacyShip()

        effectPlayerAction('build',[gb,legacyShip(),'B6'],publisherDummy)
        expect(num).toBe(6)

        effectPlayerAction('build',[gb, null,'F2'],publisherDummy)
        expect(num).toBe(6)

        effectPlayerAction('move',[gb,legacyShip(),'B6','C6'],publisherDummy)
        expect(num).toBe(12)

        gb.A1.contains = clearingShip()

        effectPlayerAction('move',[gb,clearingShip(),'A1','B1'],publisherDummy)
        expect(num).toBe(12)


    })

})






