Object.defineProperty(exports, "__esModule", { value: true })

const path = require('path')
const vscode = require("vscode")
const process = require("child_process")
const {Base} = require('./Base.js')

function getExternal(_extensionPath) {

    const programPath = path.join(_extensionPath, './out/external/')

    return class External extends Base {

        launchWindow(orignalValue, callback) {
            process.exec(`${this.name}.exe ${orignalValue}`, { cwd: programPath }, (error, stdout, stderr) => {

                if(stderr)
                    console.log(stderr)

                if (stdout.length == 0) 
                    return;                
                    
                callback(stdout)
            })
        }

        launch() {

            let currentTime = new Date().getMilliseconds(),
                editor = vscode.window.activeTextEditor,
                position = editor.selection.active,
                {character, line} = position

            if(!this.lastDat || this.lastHover && currentTime - this.lastHover > 100)
                this.getData(editor.document.lineAt(line).text, character)        
            
            if(this.lastDat && this.lastDat.value)
                this.launchWindow(this.lastDat.value, value => {
                    editor.edit(edit => {                         
                        edit.replace(
                            new vscode.Range(
                                this.lastDat.line, this.lastDat.start, 
                                this.lastDat.line, this.lastDat.end
                            ), 
                            `${this.name}:${value}`
                        )
                    })
                })
            else 
                this.launchWindow(0, value => {
                    editor.edit(edit => {
                        edit.insert(position, value)
                    })
                })
        }
    }
}
exports.getExternal = getExternal