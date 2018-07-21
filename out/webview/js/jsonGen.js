const eles = document.querySelectorAll('.toolbar a[data-command]') 
eles.forEach(ele => {
    ele.addEventListener('click', e => {
        let ele = e.srcElement
        if(!ele.dataset.command)
            ele = ele.parentElement

        if(ele.attributes.getNamedItem('disabled'))
            return

        handle(
            ele.dataset.command,
            ele.dataset.value
        )
    })
})

const wrapper = new Wrappper()
const selection = {start: 0, end: 0}       
const editor = document.getElementById('editor')

function handle(command, value) {

    if(!command)
        return            

    if(command == "undo" || command == "redo") {
        document.execCommand(command)
        return
    }            
    
    let eleStart = "", eleEnd = ""
    switch(command) {

        case 'color': 
                eleStart = `<font color="${value}">`; eleEnd = `</font>`
        break
        case 'bold': 
                eleStart = `<strong>`; eleEnd = `</strong>`
        break 
        case 'italic': 
                eleStart = `<i>`; eleEnd = `</i>`
        break
        case 'underline': 
                eleStart = `<u>`; eleEnd = `</u>`
        break
        case 'strikeThrough': 
                eleStart = `<s>`; eleEnd = `</s>`
        break
        default:
            eleStart = `<span class="${command}">`; eleEnd = `</span>`                     
        break
    }   

    if(command.startsWith('un') && command != "underline") 
        wrapper.unwrap(selection.start, selection.end, eleStart, eleEnd)
    else
        wrapper.wrap(selection.start, selection.end, eleStart, eleEnd)

    editor.innerHTML = wrapper.getHTML(editor.innerText)
}        

editor.addEventListener('selectionchange', () => {
    const sel = window.getSelection()            
    let start = sel.getRangeAt(0).startOffset
    let length = sel.toString().length   
    start += findOffset(
        document.getElementById('editor').childNodes,
        sel.getRangeAt(0).startContainer
    )

    selection.start = start 
    selection.end   = start + length - 1
})


function findOffset(nodeList, target) {

    let flag = false
    let offset = 0            
    function walkNode(nodeList) {

        for(let node of nodeList) {
            if(target.isEqualNode(node)) 
                return flag = true                         
                            
            if(node.childNodes.length > 0) {
                walkNode(node.childNodes)
                if(flag) 
                    return
            } else 
                offset += node.length
        }
    }

    walkNode(nodeList)
    return offset
}

class Wrapper {      

    constructor() {
        this.wraps = []
        this.points = []
    }

    indexOf(from, to, eleStart, eleEnd) {
        for(let i = 0; i < this.wraps.length; i++) {
            const w = this.wraps[i]
            if(
                w.from == from && 
                w.to == to && 
                w.element.start == eleStart && 
                w.element.end == eleEnd
            )
                return i
        }
        return -1
    }

    wrap(from, to, eleStart, eleEnd, unbreakable = false) {
        
        if(this.indexOf(from, to, eleStart, eleEnd) == -1)
            this.wraps.push({
                from, to,
                element: {
                    open: eleStart,
                    close: eleEnd,
                    unbreakable
                }
            })
        this.update()
    }

    cut(from, to, eleStart, eleEnd) {

        let i = this.indexOf(from, to, eleStart, eleEnd)
        if(i == -1)
            return 

        this.wraps.splice(i, 1)
        this.update()
    }

    getWraps(from, to) {
        const res = []
        this.wraps.forEach(w => {
            if(
                from <= w.from &&
                w.to <= to
            ) {
                const key = w.element.start + "|" + w.element.end
                if(res.indexOf(key) != -1)
                    res.push(key)
            }                
        })

        return res
    }

    update() {
        const f = this.wraps.slice().sort((a, b) => a.from - b.from)
        f.unshift({from: 0, to: f[0].from, element: {open: "", close: ""}})
        f.push({from: f[f.length - 1].to, to: text.length, element: {open: "", close: ""}})
        
        console.log(f)
        this.wraps = []
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