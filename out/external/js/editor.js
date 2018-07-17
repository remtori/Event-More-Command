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

const history = []
const wrapper = new Wrappper()
const selection = {start: 0, end: 0}       
const editor = document.getElementById('editor')

function handle(command, value) {

    if(!command)
        return            

    if(command == "undo" || command == "redo") {
        
        return
    }            
    
    let eleStart = "", eleEnd = ""
    switch(command) {

        case 'color': 
                eleStart = `<font color="${value}">`; eleEnd = `</font>`
        break
        case 'bold': 
                eleStart = `<b>`; eleEnd = `</b>`
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