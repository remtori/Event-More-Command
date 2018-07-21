const rotation = {
    x: 0, y: 0
}
const mouse = {
    down: {
        x: -1, y: -1
    }, 
    move: {
        x: -1, y: -1
    },
    multiplier: 0.008,
    getDeltaX() {
        delta = 0
        if(this.down.x >= 0 && this.move.x >= 0)
            delta = this.move.x - this.down.x 

        return delta * this.multiplier
    },
    getDeltaY() {
        delta = 0
        if(this.down.y >= 0 && this.move.y >= 0)
            delta = this.move.y - this.down.y
            
        return delta * this.multiplier
    }
}
document.addEventListener('DOMContentLoaded', () => {

    const cvs = document.getElementById('screen')

    cvs.addEventListener('mousedown', e => {
        mouse.down.x = e.pageX
        mouse.down.y = e.pageY
    })
    cvs.addEventListener('mousemove', e => {
        mouse.move.x = e.pageX 
        mouse.move.y = e.pageY
    })
    cvs.addEventListener('mouseup', e => {
        rotation.y += mouse.getDeltaX()
        rotation.x += mouse.getDeltaY()
        mouse.down.x = -1
        mouse.down.y = -1
    })

    const material = {
        wood: new THREE.MeshLambertMaterial({ color: 0x826841 }),
        stone: new THREE.MeshLambertMaterial({ color: 0xadadad }),
        skull: (function(){
            const transparentStone = new THREE.MeshLambertMaterial({ color: 0xadadad })
            transparentStone.opacity = 0.8
            transparentStone.transparent = true
            return transparentStone
        })()
    }
    const armorstand = {        
        rotation: {
            head: new THREE.Vector3(0, 0, 0),
            body: new THREE.Vector3(0, 0, 0),
            leftLeg: new THREE.Vector3(0, 0, 0),
            rightLeg: new THREE.Vector3(0, 0, 0),
            leftArm: new THREE.Vector3(0, 0, 0),
            rightArm: new THREE.Vector3(0, 0, 0),
        },
        armorstand: new THREE.Object3D(),
        wrapper: new THREE.Object3D(),
        objects: {
        }
    }

    const clock = new THREE.Clock
    const scene = new THREE.Scene()
    const viewCenter = new THREE.Vector3(0,0,0)
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true, canvas: cvs })
    renderer.setSize( window.innerWidth, window.innerHeight )    
    
    armorstand.armorstand.position.set(0, -0.5, 0)
    armorstand.wrapper.add(armorstand.armorstand)
})