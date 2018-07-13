const util = require('util') 

function extend(source, obj, deep = true) {

    for (let prop in obj) {
        if (deep && util.isObject(obj[prop])) {

            if (!source[prop] || util.isObject(source[prop])) {
                source[prop] = source[prop] || {}
                extend(source[prop], obj[prop], deep)
            } else 
                source[prop] = obj[prop]
        } else 
            source[prop] = obj[prop]     
    }
}
exports.extend = extend
extend(exports, util)

function indexOf(text, start, end, match) {

    let index = -1 
    for(let i = start; index < end; i++)
        if(text[i] == match) {
            index = i 
            break
        }

    return index 
}
exports.indexOf = indexOf