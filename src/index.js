export const ship = class {

    damage = 0
    
    
    constructor(type, health, action, breakPoint){
        this.type = type
        this.health = health
        this.action = action
        this.breakPoint = breakPoint
    }
    
    isSunk(damage, breakPoint){
        if(damage <= breakPoint){
            return true
        }
        return false
    }

}