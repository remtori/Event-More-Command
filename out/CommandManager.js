const fs = require('fs')
const vm = require('vm')
const path = require('path')
const vscode = require('vscode')
const {Base} = require('./Base.js')
const util = require('./util.js')
const {Scoreboard} = require('./minecraft/Scoreboard.js')

class CommandManager extends Base {

    constructor() {
        super("BuildCustomFunction", "Build Custom Function", /^#\$.*/)

        const me = this
        this.commands = new Map()
        this.context = vm.createContext({        
            registerCommand({name, execute}) {
                if(execute)
                    me.commands.set(name, execute)
            },
            Scoreboard, 
            getNextStr(name) {
                return "" + name + util.getNextId('#' + name)
            }
        })
    }

    launch() {        

        const datapackPath = vscode.workspace.workspaceFolders[0].uri.fsPath
        const fnsPath = path.join(datapackPath, "./data/emc_generated/functions")
        const minecraftTag = {
            load: [],
            tick: [],
            path: path.join(datapackPath, "./data/minecraft/tags/functions")
        }

        minecraftTag.load.push("scoreboard objectives add emc_sb DO_NOT_EDIT")

        vscode.workspace.findFiles(
            './data/**/functions/*.mcfunction'
        ).then(uris => uris.forEach(uri => {
            if(uri.fsPath.indexOf("emc_generated") === -1)
                executeFile(uri.fsPath, fnsPath, minecraftTag)
        }))

        ['load', 'tick'].forEach(tag => {
            const fileName = path.join(minecraftTag.path, tag)
            fs.readFile(fileName, (err, data) => {
                if(err)
                    return
    
                const _json = JSON.parse(data)
                _json.values.push(...minecraftTag[tag])
                fs.writeFile(fileName, 'utf8', JSON.stringify(_json, null, 4), ()=>{})
            })
        })
    }

    reloadCommands(extensionPath) {
        this.commands = new Map() // Reload everything    
        const folder = path.join(extensionPath, './out/commands/')
        fs.readdir(folder, (err, files) => {
    
            if(err)
                return 
    
            files.forEach(file => {                
                if(file.endsWith('.js'))                 
                    util.readAndWatch(
                        path.join(folder, file),
                        code => vm.runInContext(code, this.context)
                    )            
            })
        })
    }
}
const instance = new CommandManager()
exports.CommandManager = instance

function executeFile(fsPath, fnsPath, minecraftTag) {
    fs.readFile(fsPath, (err, data) => {

        if(err)
            return 

        let j = 0, 
            ranges = [], // Exclude the first, include the last
            lines = data.split('\n')
        lines.forEach((line, i) => {                
            if(line.startsWith('#$') && !line.startsWith('#$End')) {
                if(i - ranges[j] > 1) {
                    ranges[j + 1] = ranges[j]
                    j += 2
                } else 
                    ranges[j] = i
            }
                
            if(line.startsWith('#$End')) {
                ranges[j + 1] = i
                j += 2
            }
        })

        if(util.isNumb(ranges[j])) {
            ranges[j + 1]
        }            

        for(let i = ranges.length - 1; i >= 0; i--) {
            for(let j = ranges[i - 1] + 1; j <= ranges[i]; j++)
                lines.splice(j, 1)
        }
        
        const fws = []
        lines.forEach((line, i) => {
            if(line.startsWith('#$') && !line.startsWith('#$End')) {                        
                const args = line.substr(2).split(' ')
                const fw = new FileWriter(args[0])
                if(this.commands.get(args[0])(args.slice(1), fw))
                    fws.push({fw, i})
            }
        })

        for(let k = fws.length - 1; k >= 0; k--) {
            const {fw: {value}, i} = fws[k]
            value.functions.forEach(({name, data}) => {
                data = "#Auto Generated Function by EMC, DO NOT EDIT\n" + data
                const newFnPath = path.join(fnsPath, name)
                fs.writeFile(newFnPath, data, err => {
                    if(!err)
                        executeFile(newFnPath, fnsPath, minecraftTag)
                })
            })
            minecraftTag.tick.push(...value.tick)
            minecraftTag.load.push(...value.load)
            lines.splice(i, 0, ...value.commands)
        }

        fs.writeFile(fsPath, 'utf8', lines.join('\n'), ()=>{})
    })
}

class FileWriter {

    constructor(command) {

        this.command = command
        this.value = {
            tick: [], 
            load: [], 
            functions: [],
            commands: []
        }
    }

    ontick(data) {
        this.value.tick.push(data)
    }

    onload(data) {
        this.value.load.push(data)
    }

    function(name, data) {
        this.value.functions.push({data, name})
    }

    append(lines) {
        if(!util.isArray(lines))
            lines = [lines]

        this.value.commands.push(lines.join('\n'))
    }    
}