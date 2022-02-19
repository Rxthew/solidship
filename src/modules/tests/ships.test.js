import { expect, test } from '@jest/globals';
import * as ships from '../ships';

const basicShip = ships.basicShip
const basicLegacyShip = ships.basicLegacyShip
const legacy = ships.legacyShip;
const planting = ships.plantingShip;
const defense = ships.defenseShip;
const relay = ships.relayShip;


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