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
            for(let occurrence = 0; occurrence < sequenceOccurrence; occurrence++){
                 let lastInd = index;
                 index = someArray.indexOf(elem,lastInd);   
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
            let evtsArray = _myEvents._events[name];
            _removeSpecificHandler(name, handlerToRemove, sequenceOccurrence,evtsArray)
            return 
        } 

        _myEvents._events[name] = _myEvents._events[name].filter(elem => elem.handler !== handlerToRemove)

        return

    };

    const selectivePublish = function(eventName, suppressedHandler,sequenceOccurrence=false){

        _checkEvent(eventName)
        
        let _temporaryArray = [..._myEvents._events[eventName]]
        let _temporaryPublisher = function(){
            _temporaryArray.forEach(function(h){
                h.handler(...h.params)
        })}

        if(typeof sequenceOccurrence === 'number'){
           _temporaryArray =  _removeSpecificHandler(eventName,suppressedHandler,sequenceOccurrence,_temporaryArray)
            return _temporaryPublisher()
        }

        _temporaryArray = _temporaryArray.filter(elem => elem !== suppressedHandler);
        _temporaryPublisher()
        return
    }

    
    const subscribe = function(name, newHandler, ...optionalArgs){

        _checkEvent(name) 

        _myEvents._events[name] = [..._myEvents._events[name], new _handlersObject(newHandler, ...optionalArgs)] 
        return 
        
    };

    const publish = function(name){ 
       
        _checkEvent(name)

        _myEvents._events[name].forEach(function(h){
                h.handler(...h.params)
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
