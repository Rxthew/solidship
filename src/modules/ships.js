
const _basicMethod = {
    basic : {
        isSunk(damage, breakPoint){
            if(damage <= breakPoint){
                return true
            }
            return false
        }
    }
}

const _shipMethods = {
    basic : Object.assign({},_basicMethod.basic),
    legacy : Object.assign({
        action: {default : 'legacy'},
        properties : {messagingProtocol : 'legacy'}
    },_basicMethod.basic),
    planting : Object.assign({
        action: {default : 'plant'},
        properties : {messagingProtocol : 'planting'}
    },_basicMethod.basic),
    defense : Object.assign({
        action: {default : 'launch decoys'},
        properties : {messagingProtocol : 'defense'}
    },_basicMethod.basic),
    relay : Object.assign({
        action : {default : 'message'},
        properties : {messagingProtocol : 'message'}
    },_basicMethod.basic)
}

export const basicShip = class {
    damage = 0
    
    constructor(type, breakPoint=3){
        this.type = type
        this.breakPoint = breakPoint
    }

}
Object.assign(basicShip.prototype,_shipMethods.basic)

export const legacyShip = function(){
    return Object.assign({},_shipMethods.legacy, new basicShip('legacy',4))
}

export const seaGrassSeedPlantingShip = function (){
    return Object.assign({}, _shipMethods.planting, new basicShip('planting',3))
}

export const projectileDefenseShip = function (){
    return Object.assign({}, _shipMethods.defense, new basicShip('defense',3))
}

export const messageRelayShip = function(){
    return Object.assign({}, _shipMethods.relay, new basicShip('relay',3))
}

