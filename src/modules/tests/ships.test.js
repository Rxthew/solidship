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


test('Basic ship returns an object with a damage equalling 0, some new type, and a breakpoint', () => {
    expect(new basicShip('someNewType',3)).toEqual(
         {
             damage: 0,
             type: 'someNewType',
             breakPoint: 3
        } 
    )
})

test('Basic ship isSunk returns true if damage is equal or greater than breakpoint', () => {
    let basic = new basicShip('someNewType',2);
    basic.damage += 2
    expect(basic.isSunk(basic.damage,basic.breakPoint)).toBe(
         true
    )
    basic.damage += 1
    expect(basic.isSunk(basic.damage,basic.breakPoint)).toBe(
        true
   )
})

test('Basic ship isSunk returns false if damage is less than breakpoint', () => {
    let basic2 = new basicShip('someNewType',2);
    basic2.damage += 1
    expect(basic2.isSunk(basic2.damage,basic2.breakPoint)).toBe(
         false
    )
})

test('Other ship objects contain right properties', () => {
    expect(legacy()).toEqual(
         {
             damage: 0,
             type: 'legacy',
             breakPoint: 4,
             action: ['legacy'],
             properties : { messagingProtocol : 'legacy'},
             
        } 
    )
})
    expect(relay()).toEqual(
         {
             damage: 0,
             type: 'relay',
             breakPoint: 3,
             action: ['message'],
             properties : { messagingProtocol : ['message','relay']},
             
        } 
    )

test('Other ships isSunk method is available (and returns true/false depending on the relationsihp between damage and breakpoint)', () => {
    let plantingShip = planting();
    plantingShip.damage += 3
    expect(plantingShip.isSunk(plantingShip.damage,plantingShip.breakPoint)).toBe(
         true
    )
    let defenseShip = defense();
    defenseShip.damage += 1
    expect(defenseShip.isSunk(defenseShip.damage,defenseShip.breakPoint)).toBe(
        false
   )

})

test('basicLegacyShip instance sinks instantly the first time isSunk is called',() => {
    let plantingLegacyShip = new basicLegacyShip('planting')
    expect(plantingLegacyShip.isSunk(plantingLegacyShip.damage,plantingLegacyShip.breakPoint)).toBe(true)
    
})

test('getShipCount returns an object with the plant/wreckage count, or error if property was not present', () => {
    let plantingShip2 = planting();
    plantingShip2.properties.equipment.count.plants = 20;
    expect(getShipCount(plantingShip2)).toEqual({plants : 20})
    let clearingShip =  clear();
    clearingShip.properties.equipment.count.wreckage = 50;
    expect(getShipCount(clearingShip)).toEqual({wreckage : 50})
    let leg = legacy()
    expect(getShipCount(leg)).toEqual({error : 'Ship does not have a valid equipment property'})

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

test('getEquipmentType returns object with the equipment type, or error if property was not present', () => {
    let plantingShip4 = planting()
    expect(getEquipmentType(plantingShip4)).toEqual(['legacy'])
    let clearingShip3 = clear()
    expect(getEquipmentType(clearingShip3)).toEqual(['legacy'])
    getChangedShip(clearingShip3,['properties','equipment','type'],'modern')
    expect(getEquipmentType(clearingShip3)).toEqual(['modern'])
    
})

describe('testing getChangedShip and components to evaluate that they can be used to customise ships',() => {
    let customPlantingShip = new basicShip();
    const plantingAction = components().action.planting

    test('customPlantingShip possesses same action as regular instance of planting ship', () => {
        customPlantingShip = Object.assign(customPlantingShip, {action : plantingAction})
        expect(customPlantingShip.action).toEqual(new planting().action)
    })
    let plantingProperties = {properties : components().properties}
    Object.assign(plantingProperties['properties'].equipment,{type : components().properties.equipment.type.legacy}, {count : components().properties.equipment.count.planting})
    Object.assign(plantingProperties['properties'],{messagingProtocol : components('seagrass planting').properties.messagingProtocol.single})

    test('customPlantingShip possesses same properties as regular instance of planting ship', () => {
        customPlantingShip = Object.assign(customPlantingShip, plantingProperties)
        expect(customPlantingShip.properties).toEqual(new planting().properties)
    })
    let customLegacyShip = new basicLegacyShip();
    let customActions = {action : [...components().action.defense,...components().action.relay]}
    let customProperties = {properties :  { messagingProtocol : components('clear debris').properties.messagingProtocol.relay}}


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
        customMessagingShip = getChangedShip(customMessagingShip,['properties','messagingProtocol'],'relay')
        expect(customMessagingShip.properties).toEqual({messagingProtocol : ['message', 'relay']})

    })
    test('getChangedShip should return an error if messagingProtocol is somehow attached without action', () => {
        let customMessagingShip2 = getChangedShip(new basicShip(),['properties','messagingProtocol'],'relay')
        expect(customMessagingShip2).toEqual({error : 'Ship does not have a valid action property'})
    })

})

