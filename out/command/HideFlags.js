Object.defineProperty(exports, "__esModule", { value: true })

const path = require('path')
const vscode = require("vscode")
const process = require("child_process")
const util = require('../util.js')

const Regex = /HideFlags:([0-9]{0,2})?s?/

class HideFlags {

    constructor(_extensionPath) {
        
        this.lastDat = null
        this.lastHover = null
        this.programPath = path.join(_extensionPath, './out/external/')
    }    

    getData(line, character) {

        let res,
            i = util.regexIndexOf(line, Regex, character - 16) 

        if(i < character) {
            let ss = Regex.exec(line.slice(i))
            res = {
                start: i, 
                end: i + ss[0].length,
                value: ss[1],
                length: ss[0].length
            }
        }

        this.lastDat = res || this.lastDat
        return res
    }

    launchWindow(orignalValue, callback) {
        process.exec(`HideFlags.exe ${orignalValue}`, { cwd: this.programPath }, (error, stdout, stderr) => {

            if (stdout.length == 0) 
                return;                
                
            callback(stdout)
        });
    }

    launch() {
        let currentTime = new Date().getMilliseconds(),
            editor = vscode.window.activeTextEditor,
            position = editor.selection.active,
            character = position.character,
            line = position.line         
        
        if(!this.lastDat || this.lastHover && currentTime - this.lastHover > 100)
            this.getData(editor.document.lineAt(line).text, character)
        
        this.launchWindow(this.lastDat.value, value => {
            editor.edit((edit) => {                         
                edit.replace(
                    new vscode.Range(line, this.lastDat.start, line, this.lastDat.end), 
                    `HideFlags:${value}s`
                )
            })
        })
    }
}
exports.HideFlags = HideFlags