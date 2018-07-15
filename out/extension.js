Object.defineProperty(exports, "__esModule", { value: true })

const vscode = require('vscode')
const {Hover, Range, MarkdownString} = vscode
const {HideFlags} = require('./command/HideFlags.js')
const {RawJsonGen} = require('./command/RawJsonGen.js')
const tabCompletation = require('./completation.js')

function activate(context) {

    console.log("Extension Launched")
    // vscode.languages.registerCompletionItemProvider('mcfunction', {
    //     provideCompletionItems(document, position/*, token, context */) {

    //         if (document.lineAt(position.line).text.length !== 0) {
    //             let char = document.lineAt(position.line).text.charCodeAt(0);
    //             if (char < 97 || char > 122)
    //                 return []
    //         } 

    //         return tabCompletation(document.lineAt(position.line).text, 0, position.character)
    //     }
    // }, ...[".", ",", "[", "{", " ", "/", ":", "=", "!", "_", "#"])
    
    const extensionPath = vscode.extensions.getExtension('remtori.datapack-manager').extensionPath

    let hideFlags = new HideFlags(extensionPath)
    vscode.languages.registerHoverProvider('mcfunction', {
        provideHover(document, {line, character}, token) {

            let t = hideFlags.getData(document.lineAt(line).text, character)
            if(t == undefined) 
                return            

            let mds = new MarkdownString("[Open HideFlags Helper](command:mcfunction.HideFlags)")
            mds.isTrusted = true

            hideFlags.lastHover = new Date().getMilliseconds()

            return new Hover(
                mds,
                new Range(line, t.start, line, t.end)
            )
        }
    })    
    context.subscriptions.push(
        vscode.commands.registerCommand('mcfunction.HideFlags', ()=>hideFlags.launch())
    )

    let jsonGen = new RawJsonGen(extensionPath)
    context.subscriptions.push(
        vscode.commands.registerCommand('mcfunction.RawJsonGen', () => {
            const panel = vscode.window.createWebviewPanel(
                'RawJsonGen',
                'Raw Json Generator',
                vscode.ViewColumn.One,
                {enableScripts: true, retainContextWhenHidden: true, enableCommandUris: true}
            )
            panel.webview.html = jsonGen.html
        })
    )
}
exports.activate = activate