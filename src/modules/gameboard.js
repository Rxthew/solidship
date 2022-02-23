
export const gameBoard = class {
    board = {
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
        

    constructor(state='new game'){
        this.state = state
    }
}

export const getBoardContainsDefault = function(gb,key){
    return gb[key].contains
    
} 


export const setBoardContainsDefault = function(gb,key,value){
    gb[key].contains = value

    return gb
}

export const getBoardLegalMovesDefault = function(gb,key){
    return gb[key].legalMoves

}

 
export const createContainsObject = function(board, updatedKey, updatedValue, getContents=getBoardContainsDefault){
    let newContainsObject = {};
    for (let key of Object.keys(board)){
        if(key === updatedKey){
            Object.assign(newContainsObject, {[key]: updatedValue})
        }
        else{
        Object.assign(newContainsObject, {[key]:getContents(board,key)})
        }
    }
    return newContainsObject
}



export const updateBoardContents = function(currentBoard, containsObject,setContents= setBoardContainsDefault){
    for (let key of Object.keys(containsObject)){
        if(Object.is(containsObject[key], null)){
            setContents(currentBoard,key,null)
        }
        else{
            let value = Object.assign(Object.create(Object.getPrototypeOf(containsObject[key])), containsObject[key])
            setContents(currentBoard,key,value) 
        }
        
    }
    return currentBoard
}

