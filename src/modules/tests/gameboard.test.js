import { test,expect,describe } from '@jest/globals';
import * as gameboard from '../gameboard';

let [gameBoard, defaultC ] = [gameboard.gameBoard, gameboard.defaultConfig ]
let [createContainsObject, updateBoardContents] = [gameboard.createContainsObject, gameboard.updateBoardContents]

test('expect an empty board',() => {
expect(new gameBoard('new')).toEqual(
    {
        state: 'new',
        plants : 0,
        wreckage : 0,
        board: {
            A1 : {
                legalMoves:['B1','A2','B2'], 
                contains: null
            },
            B1 : {
                legalMoves:['A1','C1','A2','B2','C2'],
                contains: null
            },
            C1 : {
                legalMoves:['B1','D1','B2','C2','D2'],
                contains: null
            },
            D1 : {
                legalMoves:['C1','E1','C2','D2','E2'],
                contains: null                
            }, 
            E1 : {
                legalMoves:['D1','F1','D2','E2','F2'],
                contains: null
            },
            F1 : {
                legalMoves:['E1','E2','F2'],
                contains: null
            },
            A2 : {
                legalMoves:['A1','B1','B2','A3','B3'],
                contains: null
            },
            B2 : {
                legalMoves:['A1','B1','C1','A2','C2','A3','B3','C3'],
                contains: null
            }, 
            C2 : {
                legalMoves:['B1','C1','D1','B2','D2','B3','C3','D3'],
                contains: null
            }, 
            D2 : {
                legalMoves:['C1','D1','E1','C2','E2','C3','D3','E3'],
                contains: null
            }, 
            E2 : {
                legalMoves:['D1','E1','F1','D2','F2','D3','E3','F3'],
                contains: null
            },
            F2 : {
                legalMoves:['E1','F1','E2','E3','F3'],
                contains: null
            },
            A3 : {
                legalMoves:['A2','B2','B3','A4','B4'],
                contains: null
            },
            B3 : {
                legalMoves:['A2','B2','C2','A3','C3','A4','B4','C4'],
                contains: null
            },
            C3 : {
                legalMoves:['B2','C2','D2','B3','D3','B4','C4','D4'],
                contains: null
            },
            D3 : {
                legalMoves:['C2','D2','E2','C3','E3','C4','D4','E4'],
                contains: null
            },
            E3 : {
                legalMoves:['D2','E2','F2','D3','F3','D4','E4','F4'],
                contains: null
            },
            F3 : {
                legalMoves:['E2','F2','E3','E4','F4'],
                contains: null
            },
            A4 : {
                legalMoves:['A3','B3','B4','A5','B5'],
                contains: null
            },
            B4 : {
                legalMoves:['A3','B3','C3','A4','C4','A5','B5','C5'],
                contains: null
            },
            C4 : {
                legalMoves:['B3','C3', 'D3','B4','D4','B5','C5','D5'],
                contains: null
            },
            D4 : {
                legalMoves:['C3','D3', 'E3','C4','E4','C5','D5','E5'],
                contains: null
            },
            E4 : {
                legalMoves:['D3','E3', 'F3','D4','F4','D5','E5','F5'],
                contains: null
            },
            F4 : {
                legalMoves:['E3','F3', 'E4','E5','F5'],
                contains: null
            },
            A5 : {
                legalMoves:['A4','B4','B5','A6','B6'],
                contains: null
            },
            B5 : {
                legalMoves:['A4','B4','C4','A5','C5','A6','B6','C6'],
                contains: null
            },
            C5 : {
                legalMoves:['B4','C4','D4','B5','D5','B6','C6','D6'],
                contains: null
            },
            D5 : {
                legalMoves:['C4','D4','E4','C5','E5','C6','D6','E6'],
                contains: null
            },
            E5 : {
                legalMoves:['D4','E4','F4','D5','F5','D6','E6','F6'],
                contains: null
            },
            F5 : {
                legalMoves:['E4','F4', 'E5','E6','F6'],
                contains: null
            },
            A6 : {
                legalMoves:['A5','B5','B6'],
                contains: null
            },
            B6 : {
                legalMoves:['A5','B5','C5','A6','C6'],
                contains: null
            }, 
            C6 : {
                legalMoves:['B5','C5','D5','B6','D6'],
                contains: null
            }, 
            D6 : {
                legalMoves:['C5','D5','E5','C6','E6'],
                contains: null
            },
            E6 : {
                legalMoves:['D5','E5','F5','D6','F6'],
                contains: null
            },
            F6 : {
                legalMoves:['E5','F5','E6'],
                contains: null
            }
        }
        
    }
)})

describe('Custom transformers, getters and setters work as expected', () => {
    let gb = new gameBoard().board
    gb.A1.contains = 'pop'
    test('Get contains prop from gameboard when a key is passed in', () => {
        expect(defaultC.getBoardContains(gb,'A1')).toBe('pop')
        expect(defaultC.getBoardContains(gb,'F3')).toBe(null)         
                       

    })

    test('Set contains prop of gameboard when a key is passed in',() => {
        defaultC.setBoardContains(gb,'F3','push')
        expect(gb['F3'].contains).toBe('push')
        defaultC.setBoardContains(gb,'F3', null)
        expect(gb['F3'].contains).toBe(null)
    })


    test('Get legal moves prop of gameboard when a key is passed in', () => {
        expect(defaultC.getBoardLegalMoves(gb,'A1')).toEqual(['B1','A2','B2'])
        expect(defaultC.getBoardLegalMoves(gb,'F6')).toEqual(['E5','F5','E6']) 

    })

    test('Initialise gameBoard with a function if only state passed', () => {  
        let someState = defaultC.newBoard('first state')
        expect(someState).toEqual(new gameBoard('first state'))
        someState.state = 'second state'
        expect(someState).toEqual(new gameBoard('second state'))
    })

    test('get state from a gameBoard', () => {
        let stateX = new gameBoard('x');
        expect(defaultC.getState(stateX)).toBe('x')
        let stateY = new gameBoard('y')
        expect(defaultC.getState(stateY)).toBe('y')
    })

    test('get board from a gameBoard', () => {
        let boardZ = new gameBoard('z');
        expect(defaultC.getBoard(boardZ)).toEqual(boardZ.board)
        let boardW = new gameBoard('w')
        expect(defaultC.getBoard(boardW)).toEqual(boardW.board)
    })

    test('get plant count from a gameBoard',() => {
        let plantBoard = new gameBoard('plants!');
        expect(defaultC.getPlantCount(plantBoard)).toBe(0)
        expect(plantBoard.plants).toBe(0)

    })

    test('set plant count on a gameBoard',() => {
        let plantBoard2 = new gameBoard('plants!')
        defaultC.setPlantCount(plantBoard2,23)
        expect(plantBoard2.plants).toBe(23)

    })

    test('get wreckage count from a gameBoard', () => {
        let wreckBoard = new gameBoard('wrecked');
        expect(defaultC.getWreckCount(wreckBoard)).toBe(0)
        expect(wreckBoard.wreckage).toBe(0)

    })

    test('set wreckage count on  a gameBoard', () => {
        let wreckBoard2 = new gameBoard('wrecked again')
        defaultC.setWreckCount(wreckBoard2,233)
        expect(wreckBoard2.wreckage).toBe(233)

    })

})


describe('test the mechanisms used to update the board', () => {

    test('create corresponding contains Object with correct details', () => {
        let someNewGame = new gameBoard('some new game');
        let contains = createContainsObject(someNewGame.board)
        expect(contains.A6).toBe(null)
        expect(contains.A5).toBe(null)
        expect(contains.B6).toBe(null)
        expect(contains.F6).toBe(null)
    
    })

    let anotherNewGame = new gameBoard('another new game')
    let containsGame = createContainsObject(anotherNewGame.board)
    containsGame.A1 = { ts : 'this string'}

    test('ensure contains Object does not mutate the original gameBoard', () => {
        expect(containsGame.A1).toEqual({ ts : 'this string'})
        expect(anotherNewGame.board.A1.contains).toEqual(null)    
        
    })

    test('createContainsObject also works when update parameters are passed', () => {
        let newContainsGame = createContainsObject(anotherNewGame.board, 'A1', 'this is another string')
        expect(newContainsGame.A1).toEqual('this is another string')
        expect(containsGame.A1).toEqual({ ts : 'this string'})
        expect(anotherNewGame.board.A1.contains).toEqual(null)
    })

    let someFreshBoard = new gameBoard('fresh board')

    test('create a new gameBoard and then update the contents to match the new contains object', () => {
        expect(updateBoardContents(someFreshBoard.board,containsGame).A1.contains).toEqual({ ts : 'this string'})
    })

    test('no mutation when I change contains Object', () => {
        containsGame.A1 = null
        expect(someFreshBoard.board.A1.contains).toEqual({ts : 'this string'})
   })
   
})



