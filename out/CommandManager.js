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
                return "" + name + getNextId('#' + name)
            }
        })
    }

    launch() {

        nextIds = {}

        vscode.workspace.findFiles(
            '**/functions/*.mcfunction'
        ).then(uris => {

            if(uris.length === 0)
                return
                
            const datapackPath = util.match(/(.*)data\\\w+\\functions/, uris[0].fsPath)
            const fnsPath = path.join(datapackPath, "data/emc_generated/functions")
            const minecraftTag = {
                load: [],
                tick: [],
                path: path.join(datapackPath, "data/minecraft/tags/functions")
            }

            const executeFile = getExecutable(fnsPath, this.commands, minecraftTag)
            for(let i = 0; i < uris.length; i++) {
                if(uris[i].fsPath.indexOf("emc_generated") === -1)
                    executeFile(uris[i].fsPath)
            }

            (['load', 'tick']).forEach(tag => {

                if(minecraftTag[tag].length === 0) 
                    return

                const fileName = path.join(minecraftTag.path, tag + '.json')

                const _json = {values: minecraftTag[tag]}                        
                const dat = JSON.parse(fs.readFileSync(fileName))
                if(dat.values && dat.values.length > 0)
                    _json.values.push(...dat.values)
                
                util.mkdir(fileName)
                fs.writeFileSync(fileName, JSON.stringify(_json, null, 4), 'utf8')
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

function getExecutable(fnsPath, commands, minecraftTag) {
    return function executeFile(fsPath) {
        const data = fs.readFileSync(fsPath) + ""

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

        if(util.isNumber(ranges[j])) {
            ranges[j + 1] = ranges[j]
        }            
        
        for(let i = ranges.length - 1; i >= 0; i--) {
                lines.splice(ranges[i - 1] + 1, ranges[i] - ranges[i - 1])
        }
        
        const fws = []
        lines.forEach((line, i) => {
            if(line.startsWith('#$') && !line.startsWith('#$End')) {                        
                const args = line.substr(2).split(' ')
                const fw = new FileWriter(args[0])
                if(commands.get(args[0])(args.slice(1), fw))
                    fws.push({fw, i})
            }
        })

        for(let k = fws.length - 1; k >= 0; k--) {
            const {fw: {value}, i} = fws[k]
            value.functions.forEach(({name, data}) => {

                const newFnPath = path.join(fnsPath, name + '.mcfunction')
                data = "#Auto Generated Function by EMC, DO NOT EDIT\n" + data 
                
                util.mkdir(newFnPath)
                fs.writeFileSync(newFnPath, data, 'utf8')

                if(data.indexOf("\n#$") !== -1)
                    executeFile(newFnPath, fnsPath, minecraftTag)
            })
            minecraftTag.tick.push(...value.tick)
            minecraftTag.load.push(...value.load)

            if(value.commands.length > 0) {
                lines.splice(i + 1, 0, "#$End")
                lines.splice(i + 1, 0, ...value.commands)                
            }
        }

        fs.writeFileSync(fsPath, lines.join('\n'), 'utf8') 
    }
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

let nextIds = {}
function getNextId(name) {

    if(nextIds[name] == null)
    nextIds[name] = 0

    return nextIds[name]++
}