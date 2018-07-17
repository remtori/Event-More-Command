class Wrapper {      

    constructor() {
        
    }

    wrap(from, to, eleStart, eleEnd, unbreakable) {
        const val = from + "|" + to + "|" + eleStart + "|" + eleEnd + "|" + unbreakable
        if(this.wraps.indexOf(val) == -1)
            this.wraps.push(val)
        this.update()
    }

    unwrap(from, to, eleStart, eleEnd, unbreakable) {

        let i = this.wraps.indexOf(from + "|" + to + "|" + eleStart + "|" + eleEnd + "|" + unbreakable)
        if(i == -1)
            return 

        this.wraps.splice(i, 1)
        this.update()
    }

    update() {
        const f = this.wraps.map(v => {
            const temp = v.split('|') 
            return {
                from: parseInt(temp[0]),
                to: parseInt(temp[1]),
                element: {
                    open: temp[2],
                    close: temp[3]
                }
            }
        }).sort((a, b) => a.from - b.from)
        f.unshift({from: 0, to: f[0].from, element: {open: "", close: ""}})
        f.push({from: f[f.length - 1].to, to: text.length, element: {open: "", close: ""}})
        
        console.log(f)
        const res = []
        for(let i = 0; i < f.length - 1; i++) {
            if(f[i].to > f[i + 1].from && (f[i].to != f[i + 1].to || f[i].from != f[i + 1].from)) {
                res.push(
                    {
                        from: f[i].from,
                        to: f[i + 1].from,
                        data: f[i].data,
                    }, 
                    {
                        from: f[i + 1].from, 
                        to: f[i].to, 
                        data: f[i].data
                    }
                )
            } else {
                res.push({
                    from: f[i].from, 
                    to: f[i].to, 
                    data: f[i].data
                })
            }
        }
        
        this.points = {}
        f.forEach(t => {
            
            if(!this.points.hasOwnProperty(t.from))
                this.points[t.from] = ""
            if(!this.points.hasOwnProperty(t.to))
                this.points[t.to] = ""

            this.points[t.from] = this.points[t.from] + t.element.open 
            this.points[t.to]   = t.element.close     + this.points[t.to]
        })
        console.log(this.points)
    }

    getHTML(text) {                
        
        let html = ""
        let lastPoint = null
        for(let point in this.points) 
            if(p.hasOwnProperty(point)) {
                                        
                if(!lastPoint) {                                                        
                    html += this.points[point]
                } else {                            
                    html += text.substring(lastPoint, point)
                    html += this.points[point]
                }

                lastPoint = point
            }
        
        console.log(html)
        return html
    }
}