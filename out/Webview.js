const fs = require('fs')
const path = require('path')
const util = require('./util.js')
const vscode = require('vscode')
const {Base} = require('./Base.js')

function getWebview(extensionPath) {

    const dirPath = path.join(extensionPath, './out/webview')        
    const ERROR_HTML = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
    </head>
    <body>
        <p>Error loading html file</p>
    </body>
    </html>`

    const pathRegex = /\$#{(.+)}/
    const activate = (html) => {
        
        html = html.replace(/\$#{UNQUE-NONCE}/g, util.getNonce())

        for(let i = 0; i < 9999; i++) {        

            if(!pathRegex.test(html)) {
                //fs.writeFile(path.join(dirPath, 'out.html'), html, 'utf8', err => {if(err) console.log(err)})
                return html
            }

            let ss = pathRegex.exec(html)

            let resourcePath = vscode.Uri.file(path.join(dirPath, ss[1]))
            let resourceUri = resourcePath.with({scheme: 'vscode-resource'})
            html = html.replace(ss[0], resourceUri)
        }

        return ERROR_HTML
    }

    return class Webview extends Base {

        constructor(name, title, regex) {            
            
            super(name, "Open " + title, regex)
            
            this.path = path.join(dirPath, name + '.html')
            util.readAndWatch(this.path, dat => {
                this.html = activate(dat)
            })
        }

        launch() {
            const panel = vscode.window.createWebviewPanel(
                this.name,
                this.title,
                vscode.ViewColumn.One,
                {enableScripts: true, retainContextWhenHidden: true, enableCommandUris: true}
            )
            panel.webview.html = this.html || ERROR_HTML
        }
    }
}
exports.getWebview = getWebview