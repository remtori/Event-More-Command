const fs = require('fs')
const vm = require('vm')
const path = require('path')
const {Base} = require('./Base.js')
const util = require('./util.js')

class CommandManager extends Base {

    constructor() {
        super("BuildCustomFunction", "Build Custom Function", /^#\$.*/)

        this.commands = new Map()
    }

    register(name, {CommandHandler}) {
        if(CommandHandler)
            this.commands.set(name, CommandHandler)
    }

    launch() {

    }    
}
const instance = new CommandManager()
const context = vm.createContext({        
    registerCommand(name, CommandHandler) {
        instance.register(name, CommandHandler)
    }
})
function loadCommands(extensionPath) {

    instance.commands = new Map() // Reload everything
    const folder = path.join(extensionPath, './out/commands/')    

    fs.readdir(folder, (err, files) => {

        if(err)
            return 

        files.forEach(file => {
            
            if(!file.endsWith('.js')) 
                return 

            util.readAndWatch(
                path.join(folder, file),
                code => vm.runInContext(code, context)
            )            
        })
    })
}
exports.CommandManager = {
    instance,
    loadCommands
}