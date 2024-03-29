
const _basicMethod = {
    basic : {
        isSunk(damage, breakpoint){
            if(damage >= breakpoint){
                return true
            }
            return false
        }
    }
}

const _templateForCustomShipTypes = class {
    constructor(action, properties){
        this.action = action;
        this.properties = properties
    }
}
Object.assign(_templateForCustomShipTypes.prototype,_basicMethod.basic)

const _shipMethods = {
    basic : function(){
        return Object.assign({},_basicMethod.basic)
    },
    legacy : function(){
        return  new _templateForCustomShipTypes(['legacy'], {messagingProtocol: 'legacy'})
    },
    planting : function(){
        return  new _templateForCustomShipTypes(['seagrass planting'], {
            messagingProtocol: 'planting',
            equipment : {
                type : ['classic'],
                count : {
                    plants : 0
                }
            }
        })
    },
    defense : function(){
        return  new _templateForCustomShipTypes(['launch decoys'], {messagingProtocol: 'defense'})
    },
    //**Relay method below has been retained here for the sake of completion only. In practice, this is is not available.*/
    relay : function(){
        return  new _templateForCustomShipTypes(['message'], {messagingProtocol: ['message','relay']})
    },
    //***/
    clear : function(){
        return new _templateForCustomShipTypes(['clear debris'], {
            messagingProtocol: 'clear',
            equipment : {
                type: ['classic'],
                count : {
                    wreckage: 0
                }
            }
        })
    }
}

export const basicShip = class {
    damage = 0
    
    constructor(mode='custom', breakpoint=3){
        this.mode = mode
        this.breakpoint = breakpoint
    }
}
Object.assign(basicShip.prototype,_shipMethods.basic())

export const basicLegacyShip = class extends basicShip {
    damage = this.breakpoint
    reinforcedBreakpoint = (this.breakpoint * 2) + 1

    constructor(mode, breakpoint){
        super(mode, breakpoint)    
    }
}

export const legacyShip = function(){
    return Object.assign(_shipMethods.legacy(), new basicShip('legacy',4))
}

export const plantingShip = function (){
    return Object.assign(_shipMethods.planting(), new basicShip('planting',3))
}


export const defenseShip = function (){
    return Object.assign(_shipMethods.defense(), new basicShip('defense',3))
}

//**Relay method below has been retained here for the sake of completion only. In practice, this is not available.*/
export const relayShip = function(){            
    return Object.assign(_shipMethods.relay(), new basicShip('relay',3))
}
//***/

export const clearingShip = function(){
    return Object.assign(_shipMethods.clear(), new basicShip('clear',3))
}

const _actionToProtocol = {
    'legacy' : 'legacy',
    'seagrass planting': 'planting',
    'launch decoys' : 'defense',
    'message' : 'message',
    'clear debris' : 'clear'
}

export const components = function(act){

    return {
        action : {
            legacy : ['legacy'],
            planting : ['seagrass planting'],
            defense : ['launch decoys'],
            relay : ['message'],
            clearing : ['clear debris']
        },

        properties : {
            messagingProtocol : {
                integrated : _actionToProtocol[act],
//**Relay methods below have been retained here for the sake of completion only. In practice, these are not available.*/
//                receiver : [_actionToProtocol[act], 'trigger'],
//                sender : [_actionToProtocol[act], 'relay'],
//***/
                extendible : [_actionToProtocol[act]],
                receiverExtension : ['trigger'],
                relayExtension : ['relay']                   
            },
            equipment : {  
                    type: {
                        classic : ['classic'],
                        modern : ['modern']
                    },
                    count: {
                        plantCount : {
                            plants : 0
                        },
                        wreckageCount : {
                            wreckage : 0
                        }
                    }
                    
            }
        }
    
    }   
}

export const getDamage = function(someShip){
    return someShip.damage

}

export const setDamage = function(someShip,someValue){
    someShip.damage = someValue
    return someShip.damage

}

export const getIsSunk = function(someShip){
   return someShip.isSunk(someShip.damage,someShip.breakpoint)

}


export const setNewShip = function(someShip, someShipProps){
    let propsObj = {}
    let finalTarget = someShip
    let falseShip = Object.create(Object.getPrototypeOf(someShip))
    Object.assign(falseShip,someShip) 
    delete falseShip[someShipProps[0]]
   
    for(let elem of someShipProps){
        propsObj[elem] = Object.assign({}, finalTarget[elem])
        finalTarget = finalTarget[elem]
    }
    let newShip = Object.create(Object.getPrototypeOf(someShip))
    Object.assign(newShip,falseShip)
    let newFinalTarget = newShip
    for(let elem of someShipProps){
        Object.assign(newFinalTarget, {[elem] : propsObj[elem]})
        newFinalTarget = newFinalTarget[elem]
    }
    return newShip

}

const _checkForProps = function(someShip, someProps){
    let target = someProps[someProps.length - 1]
    let revisedProps = someProps.filter(elem => elem !== target)
    let result = []
    let inside = someShip
    for(let elem of revisedProps){
        if(Object.prototype.hasOwnProperty.call(inside,elem)){
            result = [...result,elem]
        }
        else{
            break
        }
        inside = inside[elem]
    }
    return result
}


 export const getChangedShip = function(previousShip, changePath, key){
    let targetKey = changePath[changePath.length - 1]
       
    let _haves = _checkForProps(previousShip, changePath)
          
    let ship = (function(){
        if(_haves.length > 0){
            return setNewShip(previousShip,_haves)
        }
        return Object.assign(Object.create(Object.getPrototypeOf(previousShip)),previousShip)
       })() 
       

       const _iterateThroughProperties = function(someRef){   
        let finalTarget = ship     
        for(let elem of changePath){
            if(!Object.prototype.hasOwnProperty.call(finalTarget,elem)){ 
                finalTarget[elem] = {}
            }
            if(elem === targetKey){ 
              Object.assign(finalTarget,{[targetKey] : someRef[elem][key]})
            }
            finalTarget = finalTarget[elem]
            someRef = someRef[elem]    
        }
    }
       if(targetKey === 'messagingProtocol'){ 
           if(ship.action){
            let ref = components(ship.action[0])
            _iterateThroughProperties(ref)
            return ship
           }
           return {error : 'Ship does not have a valid action property'}
       }
       let ref = components()
       _iterateThroughProperties(ref)
       return ship
   }

export const getShipCount = function(ship){
    let checked = ['properties','equipment']
    let shipSearch = ship
    for(let elem of checked){
        if(!Object.prototype.hasOwnProperty.call(shipSearch,elem)){
            return {error : 'Ship does not have a valid equipment property'}
        }
        shipSearch = shipSearch[elem]
    }
    if(!Object.prototype.hasOwnProperty.call(shipSearch,'count')){
        return {error : 'Ship does not have a valid count property'}
    }
    return ship.properties.equipment.count

}

export const setShipCount = function(ship, propsObj){
    let count = getShipCount(ship)
    if(count.error){
        return {error : count.error}
    }
    ship.properties.equipment.count = Object.assign(count, propsObj)
    return ship 
}

export const setEquipmentType = function(ship, typeArray){
    let type = getEquipmentType(ship)
    if(type.error){
        return {error : type.error}
    }
    ship.properties.equipment.type = typeArray
    return ship 
}


export const getEquipmentType = function(ship){
    let checked = ['properties','equipment']
    let shipSearch = ship
    for(let elem of checked){
        if(!Object.prototype.hasOwnProperty.call(shipSearch,elem)){
            return {error : 'Ship does not have a valid equipment property'}
        }
        shipSearch = shipSearch[elem]
    }
    if(!Object.prototype.hasOwnProperty.call(shipSearch,'type')){
        return {error : 'Ship does not have a valid type property'}
    }
    return ship.properties.equipment.type
}

export const getMessagingProtocol = function(ship){
    if(!Object.prototype.hasOwnProperty.call(ship,'properties')){
        return {error : 'Ship does not have properties installed'}
    }
    else if(!Object.prototype.hasOwnProperty.call(ship.properties,'messagingProtocol')){
        return {error : 'Ship does not have messagingProtocol installed'}
    }
    return ship.properties.messagingProtocol

}

export const getAction = function(ship){
    if(!Object.prototype.hasOwnProperty.call(ship,'action')){
        return {error : 'Ship does not have action installed'}
    }
    return ship.action
    
}


export const checkMessagingProtocol = function(ship){
    let messageProt = getMessagingProtocol(ship)
    let acts = getAction(ship)
    let firstParam = Array.isArray(messageProt) ? messageProt[0] : messageProt
    if(_actionToProtocol[acts[0]] === firstParam){
        return ship
    }
    return {error : 'Primary ship action is incompatible with messaging protocol.'}

}

export  const checkEquipment = function(ship, choice){
    if(choice === 'seagrass planting' || choice === 'clear debris'){
        let compatiblityObj = {
            'seagrass planting' : 'plants',
            'clear debris' : 'wreckage'
        }
        let type = getEquipmentType(ship)
        let count = getShipCount(ship)
        if(Object.prototype.hasOwnProperty.call(type,'error')){
            return type
        }
        if(Object.prototype.hasOwnProperty.call(count,compatiblityObj[choice])){
            return ship
        }
        else {
            return {error : 'Ship equipment is not configured for this type of action'}
        }
    }
    return ship
}




