const util = require('../util.js')

class Base {

    constructor(name, regex) {

        this.name = name
        this.regex = regex
        this.lastDat = null
        this.lastHover = null            
    }

    getData(text, {line, character}) {

        let res,
            i = util.regexIndexOf(text, this.regex, character - 16) 

        if(0 <= i && i < character) {
            let ss = this.regex.exec(text.slice(i))
            res = {
                line,
                start: i, 
                end: i + ss[0].length,
                value: ss[1],
                length: ss[0].length
            }
        }
        
        this.lastDat = res || this.lastDat
        return res
    }

    launch() {
    }
}
exports.Base = Base