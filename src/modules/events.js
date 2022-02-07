export const events = function(){
    
    const _handlersObject = class{
        constructor(handler, ...args){
            this.handler = handler
            this.params = [...args]

        }

    }

    const _myEvents = {
         _events : {}
    }

    const _checkEvent = function(name){

        const _isEventHere = function(){
            return Object.prototype.hasOwnProperty.call(_myEvents._events, name)
        }
        if (!_isEventHere()){
           return Object.assign(_myEvents._events, _myEvents._events[name] = []);
       }
    }
    
    const _occurrenceToIndex = function(someArray, elem, sequenceOccurrence){
        let index = 0
         for(let occurrence = 0; occurrence < sequenceOccurrence; occurrence++){
             let lastInd = index;
             index = someArray.indexOf(elem,lastInd);   
         }
         return index
    }

    const _determineIndex = function(index, someArray, elem, sequenceOccurrence){
        if(index || index===0){
            return index
        }
        if(sequenceOccurrence === false){
            return false
        }
        return _occurrenceToIndex(someArray, elem, sequenceOccurrence)

    }

    const _reduceHandlersObj = function(someArr){
        const copyArr = [...someArr];
        const newArr = copyArr.map(elem => elem.handler ? elem.handler : false)
        return newArr;

        }


    const removeHandler = function(name, handlerToRemove, index=false, sequenceOccurrence=false){

        _checkEvent(name) //separate selection routine from removal. Should be just name, handlertorm and index.
        
        const handlersArray = _reduceHandlersObj(_myEvents._events[name])
        let finalIndex = _determineIndex(index,handlersArray,handlerToRemove,sequenceOccurrence)

        if(finalIndex !== false){
            _myEvents._events[name] = _myEvents._events[name].filter(elem => elem !== _myEvents._events[name][finalIndex])

            return 
        }

        _myEvents._events[name] = _myEvents._events[name].filter(elem => elem.handler !== handlerToRemove)

        return

    };

    const publish = function(name){ 
       
        _checkEvent(name)

        _myEvents._events[name].forEach(function(h){
                h.handler(...h.params)
        })
        return
        
    };

    const subscribe = function(name, newHandler, ...optionalArgs){

        _checkEvent(name) 

        _myEvents._events[name] = [..._myEvents._events[name], new _handlersObject(newHandler, ...optionalArgs)] 
        return 
        
    };

    const selectivePublish = function(eventName, ...suppressedHandlers){ 
         
        _checkEvent(eventName) //use selection routine for this and update.
        
        let temporaryArray = [..._myEvents._events[eventName]]

        for (let evHandler of suppressedHandlers){
            temporaryArray = temporaryArray.filter(elem =>
                elem.handler !== evHandler)
        }
            
            
        temporaryArray.forEach(function(h){
            h.handler(...h.params)
        })
        return
    }

    //add a subscribe 


            
    return {
        publish,
        subscribe,
        removeHandler,
        selectivePublish
    }    
}
