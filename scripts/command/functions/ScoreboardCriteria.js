const util = require('./../../util.js')
const resources = require('./../../resources.js')
const ICompletation = require('./../ICompletation.js')

let CRITERIA = {
    dummy: {},
    trigger: {},
    deathCount: {},
    playerKillCount: {},
    totalKillCount: {},
    health: {},
    xp: {},
    level: {},
    food: {},
    air: {},
    armor: {},
    teamkill: [resources.getMinecraft("#colors")],
    killedByTeam: [resources.getMinecraft("#colors")],
    minecraft: {
        "broken:minecraft": resources.getMinecraft("#items"),
        "crafted:minecraft": resources.getMinecraft("#items"),
        "dropped:minecraft": resources.getMinecraft("#items"),
        "killed:minecraft": resources.getMinecraft("#entities"),
        "killed_by:minecraft": resources.getMinecraft("#entities"),
        "mined:minecraft": Object.keys(resources.getMinecraft("#blocks")),
        "picked_up:minecraft": resources.getMinecraft("#items"),
        "used:minecraft": resources.getMinecraft("#items"),
        "custom:minecraft": {}
    }
}

let stat = resources.getMinecraft("#stats")
for (let n of stat) {
    CRITERIA.minecraft["custom:minecraft"][n] = {}
}

class ScoreboardCriteria extends ICompletation {

    getCompletation(line, start, end, data) {

        let index = util.indexOf(line, start, end, ' ')

        if (index !== -1) 
            return super.getCompletion(line, index + 1, end, data)
                    
        let split = line.substring(start, end).split(".")

        let temp = CRITERIA;
        for (let i = 0; i < split.length - 1; i++) {

            if (temp[split[i]]) 
                temp = temp[split[i]]            
            else 
                return [[], split.length > 1]            
        }

        if (util.isArray(temp)) 
            return [temp, split.length > 1];    
        else 
            return [Object.keys(temp), split.length > 1];        
    }
}
exports = ScoreboardCriteria