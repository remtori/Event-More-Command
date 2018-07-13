class ICompletation {

    constructor() {
        this.children = []
    }

    /**
     * Get completation!
     * @param {string} line 
     * @param {number} start 
     * @param {number} end 
     * @param {object} data 
     * @returns {string[], boolean}
     */
    getCompletation(line, start, end, data) {

        let completion = [];
        for (let child of this.children) {

            let result = child.getCompletion(line, start, end, data)
            
            if (result[1]) 
                return result            
            else 
                completion.push(...result[0])            
        }

        return [completion, true]
    }
}
exports = ICompletation