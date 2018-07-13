const fs = require('fs')

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

