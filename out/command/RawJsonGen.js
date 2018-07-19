const fs = require('fs')
const path = require('path')
const util = require('../util.js')
const vscode = require('vscode')

class RawJsonGen {

    constructor(extensionPath) {
        
        this.dir = path.join(extensionPath, './out/external')
        this.path = path.join(this.dir, 'RawJsonGen.html')
        this.loadHtml()
        this.watchHtml()
    }

    loadHtml() {
        this.html = ERROR_HTML

        try {
            this.html = activate(fs.readFileSync(this.path, 'utf8'), this.dir)
        } catch(e) {
            console.log(e)
        }
    }

    watchHtml() {
        fs.watch(this.path, event => {

            if(event == 'rename')
                return

            fs.readFile(this.path, 'utf8', (err, html) => {

                if(err) 
                    return 

                this.html = activate(html, this.dir)
            })
        })
    }
}
exports.RawJsonGen = RawJsonGen

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
function activate(html, dir) {
    
    html = html.replace(/\$#{UNQUE-NONCE}/g, util.getNonce())

    for(let i = 0; i < 9999; i++) {        

        if(!pathRegex.test(html)) {
            //fs.writeFile(path.join(dir, 'out.html'), html, 'utf8', err => {if(err) console.log(err)})
            return html
        }

        let ss = pathRegex.exec(html)

        let resourcePath = vscode.Uri.file(path.join(dir, ss[1]))
        let resourceUri = resourcePath.with({scheme: 'vscode-resource'})
        html = html.replace(ss[0], resourceUri)
    }

    return ERROR_HTML
}