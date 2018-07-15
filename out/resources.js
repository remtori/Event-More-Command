const fs = require('fs')
const vscode = require('vscode')

const OBJ_PATTERN = /^scoreboard objectives add (\S+) (\S+)/
const TEAM_PATTERN = /^team add (\S+)/
const BOSSBAR_PATTERN = /^bossbar create (\S+) (\S+)/
const LINE_DELIMITER = /\r\n|\n|\r/g

let minecraft = JSON.parse(fs.readFileSync('../resources/minecraft.json'))

/**
 * Get vanila minecraft data
 * @param {string} key 
 * @return {object} required data
 */
function getMinecraft(key) {
    return minecraft[key]
}
exports.getMinecraft = getMinecraft

let resources = {
    advancements: {},
    functions: {},
    objectives: [],
    tags: [],
    teams: [],
    functionTags: {},
    blockTags: {},
    itemTags: {},
    bossbars: {}
}
function getResources(key) {
    return resources[key]
}
exports.getResources = getResources

async function readFunctions() {

    let paths = await vscode.workspace.findFiles("data/*/functions/**/*.mcfunction") 
    let files = await paths.map(v => fs.readFileSync(v.fsPath))
    files.forEach(file => {

    })
}
readFunctions()