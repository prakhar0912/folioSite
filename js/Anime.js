import * as THREE from "three";
import gsap from "gsap";


class Anime {
    constructor({ scene, renderer, camera, screen,
        mobile, orbital, stickToCenterAnime, snappingAnime, mainLight
    }) {
        this.screen = screen
        this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.mobile = mobile
        this.orbital = orbital
        this.stickToCenterAnime = stickToCenterAnime
        this.snappingAnime = snappingAnime
        this.mainLight = mainLight
        this.stopAnime = false
        this.offset = new THREE.Vector2()
        this.positionOffset = new THREE.Vector3()
        this.positionOffset.z = 5.5
        this.offset.x = -0.6132813005274419
        this.offset.y = 0.3006405553572554
        this.offset.z = 0.20548036184093635
        this.rot = false
        this.oldTime = 0
        this.time = 0.001
        this.randomRotNum = 0
        this.screenPos = [
            (Math.PI / 2.3) + (0 * (Math.PI / 2)),
            (Math.PI / 2.3) + (1 * (Math.PI / 2)),
            (Math.PI / 2.3) + (2 * (Math.PI / 2)),
            (Math.PI / 2.3) + (3 * (Math.PI / 2)),
        ]
        this.snapOffset = this.stickToCenterAnime ? 0.7 : 0.5
        this.snapTo = 1
        this.snapToAnime = null
        if (!this.mobile) {
            this.cameraShake()
        }
        this.rotInf()

        if (!this.orbital) {
            setTimeout(() => {
                this.goToProjects()
            }, 3000)
        }

    }

    absDist(num1, num2, side = this.dir) {
        if (side) {
            if (num2 < num1) {
                if (num1 > this.screenPos[3]) {
                    return (2 * Math.PI - num1) + num2
                }
                else {
                    return num1 - num2
                }
            }
            else {
                return num2 - num1
            }
        }
        else {
            if (num1 < num2) {
                if (num1 < this.screenPos[0]) {
                    return num1 + (2 * Math.PI - num2)
                }
                else {
                    return num2 - num1
                }
            }
            else {
                return num1 - num2
            }
        }
    }

    snapToScreen() {
        let dist = 0
        let leastDist = 100
        let scrollPos = this.screen.rotation.y > 0 ? (this.screen.rotation.y) : (2 * (Math.PI) - Math.abs(this.screen.rotation.y)) % (2 * Math.PI)
        for (let i = 0; i < 4; i++) {
            if (this.stickToCenterAnime) {
                dist = this.absDist(scrollPos, (this.screenPos[i]))
            }
            else {
                if (this.dir) {
                    dist = this.absDist(scrollPos, (this.screenPos[i] - Math.PI / 4))
                }
                else {
                    dist = this.absDist(scrollPos, this.screenPos[i] + Math.PI / 4)
                }
            }
            if (dist < leastDist) {
                leastDist = dist
                this.snapTo = i
            }

        }
        if (leastDist < this.snapOffset) {
            // if (this.snapToAnime) {
            //     this.snapToAnime.kill()
            // }
            // if (this.moveScreenAnime.isActive()) {
            //     this.snapToAnime.kill()
            // }
            this.decideClosestSnapTo(scrollPos)
        }
    }

    decideClosestSnapTo(scrollPos) {
        let dist = this.absDist(scrollPos, this.screenPos[this.snapTo])

        if (this.dir) {
            this.snapToAnime = gsap.to(this.screen.rotation, { y: this.screen.rotation.y + dist, duration: 0.8 })
        }
        else {
            this.snapToAnime = gsap.to(this.screen.rotation, { y: this.screen.rotation.y - dist, duration: 0.8, })
        }
    }

    rotInf() {
        this.randomRotation = setInterval(() => {
            if (this.randomRotAnime) {
                this.randomRotAnime.kill()
            }
            this.randomRotAnime = gsap.to(this.screen.rotation, { y: (Math.PI / 2.3) + this.randomRotNum * (Math.PI / 2), duration: 2.5, ease: "power4.out" })
            this.randomRotNum++
        }, 5000)
    }

    stopRotInf() {
        clearInterval(this.randomRotation)
    }

    // addDragListeners() {
    //     this.rotStart = this.rotateStart.bind(this)
    //     this.rotMov = this.rotateMove.bind(this)
    //     this.rotUp = this.rotateUp.bind(this)
    //     document.addEventListener('mousedown', this.rotStart)
    //     document.addEventListener('mousemove', this.rotMov)
    //     document.addEventListener('mouseup', this.rotUp)
    // }

    addWheelListeners() {
        // this.rotMov = this.wheelMove.bind(this)
        // this.mouseDown = true
        // document.addEventListener('wheel', this.rotMov)


        this.rotStart = this.rotateStart.bind(this)
        this.rotMov = this.rotateMove.bind(this)
        this.rotUp = this.rotateUp.bind(this)
        document.addEventListener(this.mobile ? 'touchstart' : 'mousedown', this.rotStart)
        document.addEventListener(this.mobile ? 'touchmove' : 'mousemove', this.rotMov)
        document.addEventListener(this.mobile ? 'touchend' : 'mouseup', this.rotUp)
    }


    removeDragListeners() {
        document.removeEventListener(this.mobile ? 'touchstart' : 'mousedown', this.rotStart)
        document.removeEventListener(this.mobile ? 'touchmove' : 'mousemove', this.rotMov)
        document.removeEventListener(this.mobile ? 'touchend' : 'mouseup', this.rotUp)
    }

    rotateMove(evt) {
        if (!this.mouseDown) {
            return;
        }
        if (!this.mobile) {
            evt.preventDefault();
        }
        if (this.snappingAnime) {
            if (this.snapToAnime.isActive()) {
                this.snapToAnime.kill()
            }
        }

        if (this.mobile) {
            this.deltaX = evt.touches[0].screenX - this.mouseX
            this.deltaY = evt.touches[0].screenY - this.mouseY;
            this.mouseX = evt.touches[0].screenX;
            this.mouseY = evt.touches[0].screenY;
            this.rotateScreen(this.deltaX);
        }
        else {
            this.deltaX = evt.clientX - this.mouseX
            this.deltaY = evt.clientY - this.mouseY;
            this.mouseX = evt.clientX;
            this.mouseY = evt.clientY;
            this.rotateScreen(this.deltaX);
        }
    }

    rotateScreen(dx) {
        this.dx = dx
    }

    rotateStart(evt) {
        if (!this.mobile) {
            evt.preventDefault();
        }
        if (this.snappingAnime) {
            if (this.snapToAnime.isActive()) {
                this.snapToAnime.kill()
            }
        }

        this.mouseDown = true;
        this.mouseX = evt.clientX;
        this.mouseY = evt.clientY;

    }

    rotateUp(evt) {
        if (!this.mobile) {
            evt.preventDefault();
        }
        this.mouseDown = false;
        // if (this.shakeAnime) {
        //     this.shakeAnime.kill()
        // }
        if (this.snappingAnime) {
            this.snapToScreen()
        }

        // this.shakeAnime = gsap.to(this.camera.rotation, { z: 0, duration: 3 })
        // this.snapToScreen()
    }

    goToProjects() {
        this.stopAnime = true
        this.section = 'projects'
        this.stopRotInf()
        let timer = 1
        gsap.to(this.mainLight, { intensity: 0, duration: timer * 2 })
        gsap.to(this.camera.rotation, { z: -0.4, duration: timer })
        gsap.to(this.camera.rotation, { z: 0, duration: timer, delay: timer })
        gsap.to(this.camera.position, { z: this.mobile ? 0.9 : 2.5, y: this.mobile ? 0.45 : 0.7, x: -1, duration: 2 * timer })
        gsap.to(this.camera.rotation, { y: this.mobile ? 0.9 : 0.55, duration: timer, delay: (2 * timer) - 0.5 })
        gsap.to(this.camera.rotation, { x: 0, duration: timer, delay: (2 * timer) - 0.5 })
        this.offset.x = 0.027933
        this.offset.y = 0.635915
        this.offset.z = 0
        // setTimeout(() => {
        //     if(this.mobile){
        //         return
        //     }
        //     this.scene.background.lerpColors(new THREE.Color(0xc367da), new THREE.Color(0xe371ff), 1)
        // }, 1800 * timer)
        setTimeout(() => {
            this.offset.x = 0
            this.offset.y = this.mobile ? 0.9 : 0.55
            this.addWheelListeners()
            // this.mainLight.intensity = 2
            // this.addDragListeners()
        }, 3000 * timer)
    }


    wheelMove(e) {
        let dx = e.deltaY
        this.dx = dx;
    }

    cameraShake() {
        this.mouse = new THREE.Vector2();
        this.target = new THREE.Vector2();
        this.final = new THREE.Vector2()
        this.final.x = this.camera.rotation.x
        this.final.y = this.camera.rotation.y
        this.windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.mouse.x = (this.windowHalf.x);
        this.mouse.y = (this.windowHalf.y);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        document.addEventListener('wheel', this.onMouseWheel.bind(this), false);
        document.addEventListener('keypress', this.onKeyPress.bind(this), false);
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX - this.windowHalf.x);
        this.mouse.y = (event.clientY - this.windowHalf.x);
    }

    onMouseWheel(event) {
        if (this.section == 'projects') {
            return
        }
        let offset = 0.2
        if (this.camera.position.z > this.positionOffset.z + offset && event.deltaY > 0) {
            return
        }
        if (this.camera.position.z < this.positionOffset.z - offset && event.deltaY < 0) {
            return
        }
        gsap.to(this.camera.position, { z: this.camera.position.z + (event.deltaY * 0.001), duration: 0.001 })
    }

    onKeyPress(e) {
        if (e.key == 't') {
            this.goToProjects()
        }
        if (e.key == 'n') {
            console.log(this.camera.position, this.camera.rotation)
        }
    }

    moveScreen() {
        // if (this.dx == 0) {
        //     return
        // }
        this.timeDelta = this.time - this.oldTime
        this.speed = (this.dx / this.timeDelta) * 5
        if (this.mobile) {
            this.speed *= 4
        }
        if (isNaN(this.speed)) {
            return
        }
        this.pi = (this.speed * Math.PI * 0.01)
        if (this.snapToAnime) {
            this.snapToAnime.kill()
        }
        this.dir = this.pi > 0 ? true : false
        // if (this.pi > 0.1) {
        //     if (this.shakeAnime) {
        //         this.shakeAnime.kill()
        //     }
        //     this.shakeAnime = gsap.to(this.camera.rotation, { z: 0.4 * this.speed, duration: 3 })
        // }
        // if (this.pi < 0.1) {
        //     if (this.shakeAnime) {
        //         this.shakeAnime.kill()
        //     }
        //     this.shakeAnime = gsap.to(this.camera.rotation, { z: 0, duration: 3 })
        // }

        this.moveScreenAnime = gsap.to(this.screen.rotation, {
            y: (this.screen.rotation.y + this.pi), duration: 0.8,
        })
        if (Math.abs(this.screen.rotation.y) > 2 * Math.PI) {
            this.screen.rotation.y = this.screen.rotation.y % (2 * Math.PI)
        }

    }

    mouseCameraMovement() {
        this.target.x = (1 - this.mouse.x) * 0.00009;
        this.target.y = (1 - this.mouse.y) * 0.00009;
        this.final.x += 0.05 * (this.target.y - this.final.x);
        this.final.y += 0.05 * (this.target.x - this.final.y);
        gsap.to(this.camera.rotation, { x: this.final.x + this.offset.x, y: this.final.y + this.offset.y, duration: 0.002 })
    }

    animate() {
        this.time = Date.now()
        if (!this.stopAnime && !this.mobile) {
            this.mouseCameraMovement()
        }
        if (this.mouseDown) {
            this.moveScreen()
        }
        this.oldTime = this.time


        this.dx = 0

    }
}

export { Anime }