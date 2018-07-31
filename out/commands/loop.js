registerCommand({
    name: 'for',
    execute(args, fw) {
        // #$for @s val from number 0 to number 10 say hi
        // #$for @s val from number 0 downto score Who Obj #$for @s vlk from number 0 to number 1 say hello
        if(args.length < 8)
            return false

        let k
        const runner = new Scoreboard(args[0], args[1])
        
        if(args[2] !== 'from')
            return false

        if(args[3] === 'number') {
            k = 5
            fw.append(runner.setScore(parseInt(args[4])))
        } else if(args[3] === 'score') {
            k = 6
            fw.append(runner.operation(new Scoreboard(args[4], args[5]), '='))
        } else 
            return false

        let adjust
        if(args[k] === 'to' || args[k] === 'downto') {
            adjust = args[k] === 'to' ? 1 : -1
            k++
        } else 
            return false

        const end = new Scoreboard(getNextStr('end'))
        if(args[k] === 'number') {
            fw.append(end.setScore(parseInt(args[k + 1])))
            k += 2            
        } else if(args[k] === 'score') {
            fw.append(end.operation(new Scoreboard(args[k + 1], args[k + 2]), '='))
            k += 3
        } else 
            return false

        const fnName = getNextStr('for')
        fw.function(fnName, 
            args.slice(k).join(' ') + '\n' +
            runner.addScore(adjust) + '\n' + 
            `execute as @s if score ${runner.toString()} ${adjust > 0 ? '<=' : '>='} ${end.toString()} run function emc_generated:${fnName}`
        )

        return true
    }
})