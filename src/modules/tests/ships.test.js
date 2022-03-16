import { expect, test, describe } from '@jest/globals';
import * as ships from '../ships';

const basicShip = ships.basicShip
const basicLegacyShip = ships.basicLegacyShip
const legacy = ships.legacyShip;
const planting = ships.plantingShip;
const defense = ships.defenseShip;
const relay = ships.relayShip;
const components = ships.components


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

describe('components can be used to customise ships',() => {
    let customPlantingShip = new basicShip();
    const plantingAction = components().action.planting

    test('customPlantingShip possesses same action as regular instance of planting ship', () => {
        customPlantingShip = Object.assign(customPlantingShip, {action : plantingAction})
        expect(customPlantingShip.action).toEqual(new planting().action)
    })
    let plantingProperties = {properties : components().properties}
    Object.assign(plantingProperties['properties'].equipment,{type : components().properties.equipment.type.legacy})
    Object.assign(plantingProperties['properties'],{messagingProtocol : components('seagrass planting','single').properties.messagingProtocol})

    test('customPlantingShip possesses same properties as regular instance of planting ship', () => {
        customPlantingShip = Object.assign(customPlantingShip, plantingProperties)
        expect(customPlantingShip.properties).toEqual(new planting().properties)
    })
    let customLegacyShip = new basicLegacyShip();
    let customActions = {action : [...components().action.defense,...components().action.relay]}
    let customProperties = {properties :  { messagingProtocol : components('clear debris', 'relay').properties.messagingProtocol}}


    test('ships can be customised in an ad hoc way with components', () => {
        customLegacyShip = Object.assign(customLegacyShip, customActions, customProperties)
        expect(customLegacyShip.action).toEqual(['launch decoys', 'message'])
        expect(customLegacyShip.properties).toEqual({messagingProtocol : ['clear','relay']})
    })
})

