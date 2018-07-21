Object.defineProperty(exports, "__esModule", { value: true })

const vscode = require('vscode')
const {Hover, Range, MarkdownString} = vscode
const {getExternal} = require('./External.js')
const {getWebview} = require('./Webview.js')
const {CommandManager} = require('./CommandManager.js')

function activate(context) {
    
    const extensionPath = vscode.extensions.getExtension('remtori.emc').extensionPath
    const Webview = getWebview(extensionPath)
    const External = getExternal(extensionPath)
    CommandManager.loadCommands(extensionPath)

    let externals = [
        new External("HideFlags", "HideFlags Helper",/HideFlags:([0-9]*)?s?/),
        new External("DisabledSlots", "DisabledSlots Helper",/DisabledSlots:([0-9]*)?s?/),
        new Webview("RawJsonGen", "Raw JSON Generator", /(tellraw|title)+\s.*/),
        new Webview("ArmorStandPoser", "Armor Stand Poser", /summon\s(minecraft:)?armor_stand/),
        CommandManager.instance
    ]

    externals.forEach(r => context.subscriptions.push(
        vscode.commands.registerCommand(`emc.${r.name}`, () => r.launch())
    )) 

    vscode.languages.registerHoverProvider('mcfunction', {
        provideHover(document, {line, character}, token) {

            const dat = externals.map(r => r.getData(document.lineAt(line).text, {line, character}))
            
            let index = -1
            let minOffset = Infinity
            dat.forEach((r, i) => {
                if(r == undefined)
                    return
                
                const offset = Math.abs(character - r.start)
                if(offset < minOffset) {
                    index = i  
                    minOffset = offset
                }
            })                        

            if(index == -1)
                return
                
            const r = externals[index]
            const t = dat[index]

            let mds = new MarkdownString(`[Open ${r.title}](command:emc.${r.name})`)            
            mds.isTrusted = true

            r.lastHover = new Date().getMilliseconds()
            
            return new Hover(
                mds,
                new Range(line, t.start, line, t.end)
            )            
        }
    })    
}
exports.activate = activate