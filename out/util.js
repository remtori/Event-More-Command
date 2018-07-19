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

function regexIndexOf(text, regex, i = 0) {

    if(i && i < 0) i = 0
    let indexInSuffix = text.slice(i).search(regex)
    return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + i
}
exports.regexIndexOf = regexIndexOf

function match(reg, input, i = 0) {
    input = input.slice(i)
    if (!reg.test(input)) {
        return ''
    }    
    return reg.exec(input)[1]
}
exports.match = match

function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.getNonce = getNonce