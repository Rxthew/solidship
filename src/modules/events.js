export const events = function(){
    
    const _handlersObject = class{
        constructor(handler, ...args){
            this.handler = handler
            this.arguments = [...args]

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
            Object.assign(_myEvents._events, _myEvents._events[name] = []);
       }
    }


    const removeHandler = function(name, toRemove){

        _checkEvent()
            
        _myEvents._events[name] = _myEvents._events[name].filter(elem => elem.handler !== toRemove)

    };

    const publish = function(name){ 
       
        _checkEvent()

        _myEvents._events[name].forEach(function(h){
               return h.handler(...h.arguments)
        })
        
    };

    const subscribe = function(name, newHandler, ...optionalArgs){

        _checkEvent()

        _myEvents._events[name] = [..._myEvents._events, new _handlersObject(newHandler, ...optionalArgs)]  
        
    };

    const suppress = function(eventName, suppressedHandler){
         
        _checkEvent()
        
        let temporaryArray = [..._myEvents._events[eventName]]
        temporaryArray = temporaryArray.filter(elem => elem.handler !== suppressedHandler)
        return temporaryArray.forEach(function(h){
            h.handler(...h.arguments)
        })
    }


            
    return {
        publish,
        subscribe,
        removeHandler,
        suppress
    }    
}
