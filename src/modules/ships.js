
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
        return  new _templateForCustomShipTypes(['seagrass planting'], {
            messagingProtocol: 'planting',
            equipment : {
                type : 'legacy',
                count : 0
            }
        })
    },
    defense : function(){
        return  new _templateForCustomShipTypes(['launch decoys'], {messagingProtocol: 'defense'})
    },
    relay : function(){
        return  new _templateForCustomShipTypes(['message'], {messagingProtocol: ['message','relay']})
    },
    clear : function(){
        return new _templateForCustomShipTypes(['clear debris'], {
            messagingProtocol: 'clear',
            equipment : {
                type: 'legacy',
                count: 0
            }
        })
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

export const basicLegacyShip = class extends basicShip {
    damage = this.breakPoint
    reinforcedBreakPoint = (this.breakPoint * 2) + 1

    constructor(type, breakPoint){
        super(type, breakPoint)    
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

export const relayShip = function(){
    return Object.assign(_shipMethods.relay(), new basicShip('relay',3))
}

export const clearingShip = function(){
    return Object.assign(_shipMethods.clear(), new basicShip('clear',3))
}

export const components = function(act, inter){

    const _actionToProtocol = {
        'legacy' : 'legacy',
        'seagrass planting': 'planting',
        'launch decoys' : 'defense',
        'message' : 'message',
        'clear debris' : 'clear'
    }


    const _executeInterface = function(act,inter){

        const _interfaceChoice = {
            'single' : _actionToProtocol[act],
            'receiver' : [_actionToProtocol[act], 'trigger'],
            'relay' : [_actionToProtocol[act], 'relay']
        }

        return _interfaceChoice[inter]
    }
       

    return {

        action : {
            legacy : ['legacy'],
            planting : ['seagrass planting'],
            defense : ['launch decoys'],
            relay : ['message'],
            clearing : ['clear debris']
        },

        properties : {
            messagingProtocol : _executeInterface(act, inter),
            equipment : {  
                    type: {
                        legacy : 'legacy',
                        modern : 'modern'
                    },
                    count: 0
            }
        }
    
    }
    
}