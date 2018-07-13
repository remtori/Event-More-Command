const util = require('../../util.js')
const resources = require('../../resources.js')
const ICompletation = require('../ICompletation.js') 

/**
 * type: boolean - Predictable: false 
 * type: function - Handle it
 * type: array - completation
 */
const defaultArgument = {
    x: false, y: false, z: false,
    dx: false, dy: false, dz: false,
    level: false,
    distance: false,
    x_rotation: false, y_rotation: false,
    limit: false,
    name: false,
    sort: ["nearest", "furthest", "random", "arbitrary"],
    gamemode: ["survival", "creative", "spectator", "adventure"],
    type: [...resources.getMinecraft("#entities"), "player"],    
    team: false, scores: false, tag: false, advancements: false, nbt: false
}

class Selector extends ICompletation {

    /**
     * limit=1 i.e /data
     * @param {boolean} single 
     */
    constructor(single) {
        super()
        this.single = single
    }

    getCompletion(line, start, end, data) {

        if (end > start && line[start] === '@') {
            if (end > start + 2 && line[start + 2] === '[') {
                
                let argumentList = getUpdatedArgument()
                let args = Object.keys(argumentList)

                let index = start + 3
                while(index < end) {

                    let equalSign = util.indexOf(line, index, end, '=')
                    if(equalSign == -1) {
                        let segment = line.substring(index, end)
                        return [args.filter(n => n.startsWith(segment)), false]
                    }

                    let key = line.substring(index, equalSign) 
                    
                    if(argumentList[key] === false || util.isArray(argumentList[key])) {

                        let result = skipArgument(line, equalSign + 1, end) 
                        if(result.completed) 
                            index = result.index;
                        else 
                            return argumentList[key] === false  ? [[], true] : [argumentList[key], true]

                    } else if(util.isFunction(argumentList[key])) {

                        let result = argumentList[key](line, index, end) 
                        if(result.fail) {

                            index = result.index                             

                            let i = argumentList.indexOf(key)
                            if (i !== -1)
                                argumentList.splice(i, 1)
                        } else 
                            return result
                    }
                    
                    if (line[index] === ']') {                        
                        return super.getCompletion(line, index + 2, end, data);
                    }
                    else if (line[index] === ',') {
                        index++;
                    }
                }                

                if (index >= end) {
                    let segment = line.substring(index, end)
                    return [argumentList.filter(n => n.startsWith(segment)), true]
                }

            } else {

                let index = util.indexOf(line, start, end, ' ')
                if (index === -1) {
                    return [[], false]
                }
                return super.getCompletion(line, index + 1, end, data)
            }
            
        } else if (end === start) {

            return [["@e", "@s", "@r", "@a", "@p"], false];
        }

        let index = util.indexOf(line, start, end, ' ');
        if (index === -1) {
            return [[], false];
        }
        return super.getCompletion(line, index + 1, end, data);        
    }
}
exports = Selector
function getUpdatedArgument() {

    let args = {
        team: [resources.getResources('teams')],    
        tag: [resources.getResources('tags')],    
        scores(line, index, end) {

            let objectives = resources.getResources('objectives')
            while(index < end && line[index] != '}') {

                let equalSign = util.indexOf(line, index, end, '=') 
                if(equalSign == -1) {
                    let segment = line.substring(index, end)
                    return [objectives.filter(n => n.startsWith(segment)), true]
                }

                let i = objectives.indexOf(
                    line.substring(index, equalSign)
                )
                if (i !== -1)
                    objectives.splice(i, 1)

                let result = skipArgument(line, equalSign + 1, end);
                if (result.completed) {
                    index = result.index;
                    if (line[index] === ',')
                        index++;
                }
                else 
                    return [[], true]                    
            }

            if (index === end) {
                let segment = line.substring(index, end);
                return [objectives.filter(n => n.startsWith(segment)), true];
            }

            index++;
            
            return {
                fail: true, 
                index: index
            }
        },
        advancements() {
        },    
        nbt() {

        }
    }

    util.extend(args, defaultArgument)

    return args
}
function skipArgument(line, start, end) {
    
    let index = start - 1
    let inString = false
    let escape = false
    if (line[index + 1] === '!') 
        index++
    
    while (++index < end) {
        if (inString) {
            if (escape) {
                escape = false;
            }
            else if (line[index] === '\\') {
                escape = true
            }
            else if (line[index] === '"') {
                inString = false
            }
        }
        else {
            switch (line[index]) {
                case '"':
                    inString = true;
                    break
                case ',':
                case ']':
                case '}':
                    return {
                        completed: true,
                        index: index
                    }
            }
        }
    }

    return {
        completed: false
    }
}