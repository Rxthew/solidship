
const _basicMethod = {
    basic : {
        isSunk(damage, breakPoint){
            if(damage >= breakPoint){
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
        return  new _templateForCustomShipTypes(['seagrass planting'], {messagingProtocol: 'planting'})
    },
    defense : function(){
        return  new _templateForCustomShipTypes(['launch decoys'], {messagingProtocol: 'defense'})
    },
    relay : function(){
        return  new _templateForCustomShipTypes(['message'], {messagingProtocol: ['message','relay']})
    }
}

export const basicShip = class {
    damage = 0
    
    constructor(type, breakPoint=3){
        this.type = type
        this.breakPoint = breakPoint
    }
}
Object.assign(basicShip.prototype,_shipMethods.basic())

export const legacyShip = function(){
    return Object.assign(_shipMethods.legacy(), new basicShip('legacy',4))
}


export const plantingShip = function (){
    return Object.assign(_shipMethods.planting(), new basicShip('planting',3))
}

export const defenseShip = function (){
    return Object.assign(_shipMethods.defense(), new basicShip('defense',3))
}

export const relayShip = function(){
    return Object.assign(_shipMethods.relay(), new basicShip('relay',3))
}

