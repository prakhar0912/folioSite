import { ThreeInit } from './js/ThreeInit'
import { Objects } from './js/Objects'
import { Anime } from './js/Anime'
import Stats from 'three/examples/jsm/libs/stats.module'




let mobile = false


let orbital = false
let shadows = true
let noFloor = false
let noScreenShader = true
let specialGrain = false
let noGrain = false
let noFog = false
let bufferGeo = false //for mobile not for laptop

if(mobile){
    orbital = true
    shadows = false
    noFloor = true
    noGrain = true
    noFog = true
    bufferGeo = true
}

const threeInstance = new ThreeInit({
    orbital: orbital,
    shadows: shadows,
    specialGrain,
    mobile,
    noGrain,
    noFog,
    bufferGeo
})

const objects = new Objects({
    scene: threeInstance.scene,
    camera: threeInstance.camera,
    renderer: threeInstance.renderer,
    shadows: shadows,
    specialGrain,
    noFloor,
    noScreenShader,
    bufferGeo,
})

const animes = new Anime({
    screen: objects.masterMesh,
    scene: threeInstance.scene,
    camera: threeInstance.camera,
    renderer: threeInstance.renderer,
    specialGrain,
    mobile
})

const stats = Stats()
document.body.appendChild(stats.domElement)

const animate = () => {
    requestAnimationFrame(animate);
    if (!orbital) {
        animes.animate()
    }
    threeInstance.animate()
    stats.update()
}

animate()

