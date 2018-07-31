class Scoreboard {

    constructor(target, objective = "emc_sb") {
        this.target = target
        this.objective = objective
    }

    setScore(number) {
        return `scoreboard players set ${this.toString()} ${number}`
    }

    addScore(number) {
        return `scoreboard players add ${this.toString()} ${number}`
    }

    operation(operation , scoreboard) {
        return `scoreboard players operation ${this.toString()} ${operation} ${scoreboard.toString()}`        
    }

    toString() {
        return this.target + " " + this.objective
    }
}
exports.Scoreboard = Scoreboard