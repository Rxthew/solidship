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
           return Object.assign(_myEvents._events, _myEvents._events[name] = []);
       }
    }


    const removeHandler = function(name, toRemove){

        _checkEvent(name)
            
        _myEvents._events[name] = _myEvents._events[name].filter(elem => elem.handler !== toRemove)
        return

    };

    const publish = function(name){ 
       
        _checkEvent(name)

        _myEvents._events[name].forEach(function(h){
                h.handler(...h.arguments)
        })
        return
        
    };

    const subscribe = function(name, newHandler, ...optionalArgs){

        _checkEvent(name)

        _myEvents._events[name] = [..._myEvents._events[name], new _handlersObject(newHandler, ...optionalArgs)] 
        return 
        
    };

    const suppress = function(eventName, suppressedHandler){
         
        _checkEvent(eventName)
        
        let temporaryArray = [..._myEvents._events[eventName]]
        temporaryArray = temporaryArray.filter(elem => elem.handler !== suppressedHandler)
        temporaryArray.forEach(function(h){
            h.handler(...h.arguments)
        })
        return
    }


            
    return {
        publish,
        subscribe,
        removeHandler,
        suppress
    }    
}
