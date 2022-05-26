import { expect, test, describe } from '@jest/globals';
import * as ships from '../ships';

const basicShip = ships.basicShip
const basicLegacyShip = ships.basicLegacyShip
const legacy = ships.legacyShip;
const planting = ships.plantingShip;
const defense = ships.defenseShip;
const relay = ships.relayShip;
const clear = ships.clearingShip
const components = ships.components
const getChangedShip = ships.getChangedShip
const getShipCount = ships.getShipCount
const setShipCount = ships.setShipCount
const getEquipmentType = ships.getEquipmentType
const setNewShip = ships.setNewShip
const getMessagingProtocol = ships.getMessagingProtocol
const getAction = ships.getAction
const checkMessagingProtocol = ships.checkMessagingProtocol
const checkEquipment = ships.checkEquipment


test('Basic ship returns an object with a damage equalling 0, some new type, and a breakpoint', () => {
    expect(new basicShip('someNewType',3)).toEqual(
         {
             damage: 0,
             mode: 'someNewType',
             breakpoint: 3
        } 
    )
})

test('Basic ship isSunk returns true if damage is equal or greater than breakpoint', () => {
    let basic = new basicShip('someNewType',2);
    basic.damage += 2
    expect(basic.isSunk(basic.damage,basic.breakpoint)).toBe(
         true
    )
    basic.damage += 1
    expect(basic.isSunk(basic.damage,basic.breakpoint)).toBe(
        true
   )
})

test('Basic ship isSunk returns false if damage is less than breakpoint', () => {
    let basic2 = new basicShip('someNewType',2);
    basic2.damage += 1
    expect(basic2.isSunk(basic2.damage,basic2.breakpoint)).toBe(
         false
    )
})

test('Other ship objects contain right properties', () => {
    expect(legacy()).toEqual(
         {
             damage: 0,
             mode: 'legacy',
             breakpoint: 4,
             action: ['legacy'],
             properties : { messagingProtocol : 'legacy'},
             
        } 
    )
})
    expect(relay()).toEqual(
         {
             damage: 0,
             mode: 'relay',
             breakpoint: 3,
             action: ['message'],
             properties : { messagingProtocol : ['message','relay']},
             
        } 
    )

test('Other ships isSunk method is available (and returns true/false depending on the relationship between damage and breakpoint)', () => {
    let plantingShip = planting();
    plantingShip.damage += 3
    expect(plantingShip.isSunk(plantingShip.damage,plantingShip.breakpoint)).toBe(
         true
    )
    let defenseShip = defense();
    defenseShip.damage += 1
    expect(defenseShip.isSunk(defenseShip.damage,defenseShip.breakpoint)).toBe(
        false
   )

})

test('basicLegacyShip instance sinks instantly the first time isSunk is called',() => {
    let plantingLegacyShip = new basicLegacyShip('planting')
    expect(plantingLegacyShip.isSunk(plantingLegacyShip.damage,plantingLegacyShip.breakpoint)).toBe(true)
    
})

test('getShipCount returns an object with the plant/wreckage count, or error if equipment property was not present', () => {
    let plantingShip2 = planting();
    plantingShip2.properties.equipment.count.plants = 20;
    expect(getShipCount(plantingShip2)).toEqual({plants : 20})
    let clearingShip =  clear();
    clearingShip.properties.equipment.count.wreckage = 50;
    expect(getShipCount(clearingShip)).toEqual({wreckage : 50})
    let leg = legacy()
    expect(getShipCount(leg)).toEqual({error : 'Ship does not have a valid equipment property'})
    leg.properties.equipment = {type : ['classic']}
    expect(getShipCount(leg)).toEqual({error : 'Ship does not have a valid count property'})

})

test('setShipCount sets the count of an object to a new object passed in as the second parameter', () => {
    let plantingShip3 = planting();
    expect(setShipCount(plantingShip3, {plants: 40}).properties.equipment.count.plants).toBe(40)
    let clearingShip2 = clear()
    clearingShip2.properties.equipment.count.wreckage = 10
    setShipCount(clearingShip2, {plants: 50, wreckage:60, food:20})
    expect(clearingShip2.properties.equipment.count.wreckage).toBe(60)
    expect(clearingShip2.properties.equipment.count.plants).toBe(50)
    expect(clearingShip2.properties.equipment.count.food).toBe(20)
    let leg = legacy()
    expect(setShipCount(leg,{plants:20})).toEqual({error : 'Ship does not have a valid equipment property'})

})

test('getEquipmentType returns object with the equipment type, or error if equipment property was not present', () => {
    let plantingShip4 = planting()
    expect(getEquipmentType(plantingShip4)).toEqual(['classic'])
    let clearingShip3 = clear()
    expect(getEquipmentType(clearingShip3)).toEqual(['classic'])
    let clear4 = getChangedShip(clearingShip3,['properties','equipment','type'],'modern')
    expect(getEquipmentType(clear4)).toEqual(['modern'])
    let clear5 = clear()
    delete clear5.properties.equipment 
    expect(getEquipmentType(clear5)).toEqual({error : 'Ship does not have a valid equipment property'})
    let clear6 = clear()
    delete clear6.properties.equipment.type
    expect(getEquipmentType(clear6)).toEqual({error : 'Ship does not have a valid type property'})
    
})

test('setNewShip takes a ship and some properties and copies them. Properties mentioned should not mutate original ship if modified', () => {
    let newShip = new planting();
    let newerShip = setNewShip(newShip,['properties','messagingProtocol'])
    newerShip.properties.messagingProtocol = 'I am not a messaging protocol'
    expect(newerShip.properties.messagingProtocol).toBe('I am not a messaging protocol')
    expect(newShip.properties.messagingProtocol).toBe('planting')
    newerShip.properties.equipment.type = 'no equipment here'
    expect(newerShip.properties.equipment.type).toBe('no equipment here')
    expect(newShip.properties.equipment.type).toBe('no equipment here')
})

test('getMessagingProtocol returns object with the messaging protocol',() => {
    let plantingShip5 = planting()
    expect(getMessagingProtocol(plantingShip5)).toBe('planting')
    let clearingShip6 = clear()
    expect(getMessagingProtocol(clearingShip6)).toBe('clear')
    let basicShip1 = new basicShip()
    expect(getMessagingProtocol(basicShip1)).toEqual({error : 'Ship does not have properties installed'})
    let basicShip2 = new basicShip()
    basicShip2.properties = {somethingElse : 0}
    expect(getMessagingProtocol(basicShip2)).toEqual({error : 'Ship does not have messagingProtocol installed'})

})

test('getAction returns object with the ship action',() => {
    let plantingShip6 = planting()
    expect(getAction(plantingShip6)).toEqual(['seagrass planting'])
    let legacy2 = legacy()
    expect(getAction(legacy2)).toEqual(['legacy'])
    let basicShip3 = new basicShip()
    expect(getAction(basicShip3)).toEqual({error : 'Ship does not have action installed'})
    
})

test('checkMessagingProtocol checks that the primary action of the ship matches with the messaging protocol and returns ship, or else error if not the case', () =>{
    let defense01 = defense()
    expect(checkMessagingProtocol(defense01)).toEqual(defense01)
    let defense02 = defense()
    defense02.action = ['seagrass planting']
    expect(checkMessagingProtocol(defense02)).toEqual({error : 'Primary ship action is incompatible with messaging protocol.'})
    defense02.action.unshift('launch decoys')
    expect(checkMessagingProtocol(defense02)).toEqual(defense02)
    let defense03 = defense()
    defense03.properties.messagingProtocol = ['defense']
    expect(checkMessagingProtocol(defense03)).toEqual(defense03)
    defense03.properties.messagingProtocol.unshift('clear')
    expect(checkMessagingProtocol(defense03)).toEqual({error : 'Primary ship action is incompatible with messaging protocol.'})
    let defense04 = defense()
    defense04.properties.messagingProtocol = ['defense','clear']
    expect(checkMessagingProtocol(defense04)).toEqual(defense04)

})

test('checkEquipment checks that choice of action has the necessary equipment(type/count) to back the ship up. If affirmative, returns ship else returns error', () =>{
    let plant01 = planting()
    expect(checkEquipment(plant01, 'seagrass planting')).toEqual(plant01)
    let clear01 = clear()
    expect(checkEquipment(clear01, 'clear debris')).toEqual(clear01)

    let plant02 = planting()
    delete plant02.properties.equipment
    expect(checkEquipment(plant02, 'seagrass planting')).toEqual({error : 'Ship does not have a valid equipment property'})

    let clear02 = clear()
    delete clear02.properties.equipment
    expect(checkEquipment(clear02, 'clear debris')).toEqual({error : 'Ship does not have a valid equipment property'})

    let plant03 = planting()
    plant03.properties.equipment.count = {wreckage : 0}
    expect(checkEquipment(plant03, 'seagrass planting')).toEqual({error : 'Ship equipment is not configured for this type of action'})

    let clear03 = clear()
    clear03.properties.equipment.count = {plants : 0}
    expect(checkEquipment(clear03, 'clear debris')).toEqual({error : 'Ship equipment is not configured for this type of action'})


})

describe('testing getChangedShip and components to evaluate that they can be used to customise ships',() => {
    let customPlantingShip = new basicShip();
    const plantingAction = components().action.planting

    test('customPlantingShip possesses same action as regular instance of planting ship', () => {
        customPlantingShip = Object.assign(customPlantingShip, {action : plantingAction})
        expect(customPlantingShip.action).toEqual(planting().action)
    })
    let plantingProperties = {properties : components().properties}
    Object.assign(plantingProperties['properties'].equipment,{type : components().properties.equipment.type.classic}, {count : components().properties.equipment.count.plantCount})
    Object.assign(plantingProperties['properties'],{messagingProtocol : components('seagrass planting').properties.messagingProtocol.integrated})

    test('customPlantingShip possesses same properties as regular instance of planting ship', () => {
        customPlantingShip = Object.assign(customPlantingShip, plantingProperties)
        expect(customPlantingShip.properties).toEqual(new planting().properties)
    })
    let customLegacyShip = new basicLegacyShip();
    let customActions = {action : [...components().action.defense,...components().action.relay]}
    let customProperties = {properties :  { messagingProtocol : components('clear debris').properties.messagingProtocol.sender}}


    test('ships can be customised in an ad hoc way with components', () => {
        customLegacyShip = Object.assign(customLegacyShip, customActions, customProperties)
        expect(customLegacyShip.action).toEqual(['launch decoys', 'message'])
        expect(customLegacyShip.properties).toEqual({messagingProtocol : ['clear','relay']})
    })

    test('getChangedShip should return the same ship except changed area', () => {
        let customLegacyShip2 = getChangedShip(customLegacyShip,['action'],'legacy')
        expect(customLegacyShip2.action).toEqual(components().action.legacy);
        expect(customLegacyShip2.properties).toEqual(customLegacyShip.properties)
    })

    test('getChangedShip should be able to add a property if it is not there', () => {
        let customMessagingShip = getChangedShip(new basicShip(),['action'],'relay')
        customMessagingShip = getChangedShip(customMessagingShip,['properties','messagingProtocol'],'sender')
        expect(customMessagingShip.properties).toEqual({messagingProtocol : ['message', 'relay']})

    })

    test('getChangedShip should not mutate the original ship passed through', () => {
        let customMessagingCopy = getChangedShip(new basicShip(),['action'],'relay')
        customMessagingCopy = getChangedShip(customMessagingCopy,['properties','messagingProtocol'],'sender')
        let customMessCopy2 = getChangedShip(customMessagingCopy,['properties', 'messagingProtocol'], 'receiver')
        expect(customMessCopy2.properties).toEqual({messagingProtocol : ['message','trigger']})
        expect(customMessagingCopy.properties).toEqual({messagingProtocol : ['message','relay']})
        
    })

    test('getChangedShip should return an error if messagingProtocol is somehow attached without action', () => {
        let customMessagingShip2 = getChangedShip(new basicShip(),['properties','messagingProtocol'],'sender')
        expect(customMessagingShip2).toEqual({error : 'Ship does not have a valid action property'})
    })

})

