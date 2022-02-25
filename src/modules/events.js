

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

    const _handlerIndexByOccurrenceOrder = function(someArray, elem, sequenceOccurrence){

        let index = 0
        let lastInd = index
            for(let occurrence = 0; occurrence < sequenceOccurrence; occurrence++){                                           
                 index = someArray.indexOf(elem,lastInd);
                 lastInd = index + 1
             }
         return index
                 
    }


    const _reduceHandlersObj = function(someArr){
        const copyArr = [...someArr];
        const newArr = copyArr.map(elem => elem.handler ? elem.handler : false)
        return newArr;

        }

    const _removeSpecificHandler = function(name, handlerToRemove, sequenceOccurrence, someArray){
    
    const handlersArray = _reduceHandlersObj(someArray)
    const _specificIndex = _handlerIndexByOccurrenceOrder(handlersArray,handlerToRemove,sequenceOccurrence)
    someArray = someArray.filter((elem,index) => index !== _specificIndex )
    
    
    return someArray

}

    const removeHandler = function(name, handlerToRemove, sequenceOccurrence=false){

        _checkEvent(name)
        
        if(typeof sequenceOccurrence === 'number'){
            _myEvents._events[name] =  _removeSpecificHandler(name, handlerToRemove, sequenceOccurrence,_myEvents._events[name])
           
            return 
        } 

        _myEvents._events[name] = _myEvents._events[name].filter(elem => elem.handler !== handlerToRemove)

        return

    };

    const selectivePublish = function(eventName, suppressedHandler,sequenceOccurrence=false, ...params){

        _checkEvent(eventName)
        
        let _temporaryArray = [..._myEvents._events[eventName]]
        let _temporaryPublisher = function(_someArray){
            _someArray.forEach(function(h){
                h.handler(...params,...h.params)
        })}


        if(typeof sequenceOccurrence === 'number'){
           _temporaryArray =  _removeSpecificHandler(eventName,suppressedHandler,sequenceOccurrence,_temporaryArray)
            return _temporaryPublisher(_temporaryArray)
        }

        _temporaryArray = _temporaryArray.filter(elem => elem.handler !== suppressedHandler);
        _temporaryPublisher(_temporaryArray)
        return
    }

    
    const subscribe = function(name, newHandler, ...optionalArgs){

        _checkEvent(name) 

        _myEvents._events[name] = [..._myEvents._events[name], new _handlersObject(newHandler, ...optionalArgs)] 
        return 
        
    };

    const publish = function(name, ...params){ 
       
        _checkEvent(name)

        _myEvents._events[name].forEach(function(h){
                h.handler(...params,...h.params)
        })
        return
        
    };

            
    return {
        publish,
        subscribe,
        removeHandler,
        selectivePublish
    }    
}
