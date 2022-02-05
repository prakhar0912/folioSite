import * as THREE from "three";
import gsap from "gsap";


class Anime {
    constructor({ scene, renderer, camera, screen,
        mobile, orbital, stickToCenterAnime,
        snappingAnime, mainLight, videoMaterials,
        mobileFloorMesh, circularMesh, mirror,
        options
    }) {
        this.screen = screen
        this.scene = scene
        this.renderer = renderer
        this.camera = camera
        this.mobile = mobile
        this.orbital = orbital
        this.options = options
        this.stickToCenterAnime = stickToCenterAnime
        this.snappingAnime = snappingAnime
        this.mainLight = mainLight
        this.mobileFloorMesh = mobileFloorMesh
        this.circularMesh = circularMesh
        this.rotCirc = document.querySelector('.rot-circ-outer')
        this.rotCircPi = (Math.PI/4)
        if (!this.mobile) {
            this.mirror = mirror
        }

        this.offset = new THREE.Vector3()
        this.offset.x = -0.6132813005274419
        this.offset.y = 0.3006405553572554
        this.offset.z = 0.25548036184093635

        this.sectionMap = [
            { start: false, end: false, current: true },
            { start: false, end: false, current: false },
            { start: false, end: false, current: false }
        ]

        this.oldTime = 0
        this.time = 0.001
        this.radius = this.mobile ? 4 : 5
        this.randomRotNum = 0
        this.fogValue = 0.05

        this.z = (Math.cos(0) * 6) - 2
        this.x = (Math.sin(0) * 6) - 4

        this.screenPos = [
            - (0.50 + (Math.PI / 5.6) + (3 * (Math.PI / 2))),
            - (0.50 + (Math.PI / 5.6) + (2 * (Math.PI / 2))),
            - (0.50 + (Math.PI / 5.6) + (1 * (Math.PI / 2))),
            - (0.50 + (Math.PI / 5.6) + (0 * (Math.PI / 2))),
            (Math.PI / 5.6) + (0 * (Math.PI / 2)),
            (Math.PI / 5.6) + (1 * (Math.PI / 2)),
            (Math.PI / 5.6) + (2 * (Math.PI / 2)),
            (Math.PI / 5.6) + (3 * (Math.PI / 2)),
        ]

        this.screenMap = {
            google: 3,
            yellow: 2,
            black: 1,
            green: 0
        }

        this.snapOffset = this.stickToCenterAnime ? 0.4 : 0.3
        this.snapOffset = this.mobile ? 0.2 : this.snapOffset
        this.snapTo = 1
        this.snapToAnime = null
        this.currentSection = 0
        this.speed = 0
        this.oldSnapTo = 2

        this.fogColor = "#c81cf3"
        this.projFogColors = ["#ffe600", "#000000", "#0099ff", "#b700ff",]
        this.projFogColors = ["#000000","#1af76e" , "#fffb22", "#b700ff",]

        this.videoMaterials = videoMaterials
        this.totalPi = Math.PI / 4
        this.rayMouseDown = false
        this.oldPi = 0

        this.cursorOnScreen = false
        this.oldCursorOnScreen = false

        this.initSec1()
        this.rotInf()

    }

    initSec1() {
        this.raycaster = new THREE.Raycaster()
        this.pointer = new THREE.Vector2()
        this.mouse = new THREE.Vector2();
        this.target = new THREE.Vector2();
        this.final = new THREE.Vector2()
        this.final.x = this.camera.rotation.x
        this.final.y = this.camera.rotation.y
        this.windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.mouse.x = (this.windowHalf.x);
        this.mouse.y = (this.windowHalf.y);
        this.addSection1Listeners()
    }

    addSection1Listeners() {

        this.mouseDownFunc = this.sec1MouseDown.bind(this)
        this.mouseUpFunc = this.sec1MouseUp.bind(this)
        this.mouseMoveFunc = this.onMouseMove.bind(this)
        this.keyPressFunc = this.onKeyPress.bind(this)
        this.resizeFunc = this.resize.bind(this)

        window.addEventListener(this.mobile ? 'touchstart' : 'mousedown', this.mouseDownFunc)
        window.addEventListener(this.mobile ? 'touchend' : 'mouseup', this.mouseUpFunc)

        if (!this.mobile) {
            window.addEventListener('keypress', this.keyPressFunc, false);
            window.addEventListener('mousemove', this.mouseMoveFunc, false);
            window.addEventListener("resize", this.resizeFunc, false);
        }
    }

    removeSec1Listeners() {
        window.removeEventListener(this.mobile ? 'touchstart' : 'mousedown', this.mouseDownFunc)
        window.removeEventListener(this.mobile ? 'touchend' : 'mouseup', this.mouseUpFunc)
        if (!this.mobile) {
            window.removeEventListener('mousemove', this.mouseMoveFunc, false);
            window.removeEventListener('keypress', this.keyPressFunc, false);
            window.removeEventListener("resize", this.resizeFunc, false);
        }
    }

    sec1MouseDown(event) {
        // console.log('mouse down')
        this.pointer.x = ((this.mobile ? event.touches[0].clientX : event.clientX) / window.innerWidth) * 2 - 1;
        this.pointer.y = - ((this.mobile ? event.touches[0].clientY : event.clientY) / window.innerHeight) * 2 + 1;
        this.rayMouseDown = true
    }

    sec1MouseUp(event) {
        // console.log('mouse up')
        this.pointer.x = ((this.mobile ? event.touches[0].clientX : event.clientX) / window.innerWidth) * 2 - 1;
        this.pointer.y = - ((this.mobile ? event.touches[0].clientY : event.clientY) / window.innerHeight) * 2 + 1;
        this.rayMouseDown = false
    }

    resize() {
        this.windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
    }

    onMouseMove(event) {
        this.pointer.x = ((this.mobile ? event.touches[0].clientX : event.clientX) / window.innerWidth) * 2 - 1;
        this.pointer.y = - ((this.mobile ? event.touches[0].clientY : event.clientY) / window.innerHeight) * 2 + 1;
        this.mouse.x = (event.clientX - this.windowHalf.x);
        this.mouse.y = (event.clientY - this.windowHalf.x);
    }

    onKeyPress(e) {
        if (!isNaN(e.key)) {
            this.goToSection(Number(e.key))
        }
        if (e.key == 'n') {
            console.log(this.camera.position, this.camera.rotation)
        }
        if (e.key == 't') {
            console.log(this.totalPi)
        }
    }

    mouseCameraMovement() {
        // console.log('camera move')
        this.target.x = (1 - this.mouse.x) * 0.00004;
        this.target.y = (1 - this.mouse.y) * 0.00004;
        this.final.x += 0.05 * (this.target.y - this.final.x);
        this.final.y += 0.05 * (this.target.x - this.final.y);
        gsap.to(this.camera.rotation, { x: this.final.x + this.offset.x, y: this.final.y + this.offset.y, duration: 0.01 })
    }

    rayFuncMobile() {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name == 'screen') {
                this.options.changeSection(1)
                this.goToSection(1)
                return
            }
        }
    }

    rayFuncLaptop(){
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children);

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name == 'screen') {
                this.cursorOnScreen = true
                break
            }
            else {
                this.cursorOnScreen = false
            }
        }
        if (this.oldCursorOnScreen != this.cursorOnScreen) {
            if (this.cursorOnScreen) {
                document.body.style.cursor = 'pointer'
            }
            else {
                document.body.style.cursor = 'default'
            }
        }
        if (this.cursorOnScreen && this.rayMouseDown) {
            this.options.changeSection(1)
            this.goToSection(1)
        }
        this.oldCursorOnScreen = this.cursorOnScreen
    }


    absDist(num1, num2, side = this.dir) {
        if (side) {
            if (num2 < num1) {
                return num1 - num2
            }
            else {
                return num2 - num1
            }
        }
        else {
            if (num1 < num2) {
                return num2 - num1
            }
            else {
                return num1 - num2
            }
        }
    }

    snapToScreen() {
        let dist = 0
        let leastDist = 100
        let scrollPos = this.totalPi
        for (let i = 0; i < 8; i++) {
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
            this.oldSnapTo != this.snapTo && this.options.showProject(this.snapTo % 4, this.dir ? 'f' : 'b')
            if (this.snappingAnime) {
                this.decideClosestSnapTo(scrollPos)
            }
            this.changeFogColor()
            this.oldSnapTo = this.snapTo
        }

    }

    changeFogColor() {
        this.fogColAnime = gsap.to(this,
            {
                fogColor: this.projFogColors[this.snapTo % 4],
                duration: 1,
                onUpdate: () => {
                    this.scene.background = new THREE.Color(this.fogColor)
                    this.scene.fog = new THREE.FogExp2(this.fogColor, 0.1)
                }
            },
        )
    }

    decideClosestSnapTo(scrollPos) {
        let dist = this.absDist(scrollPos, this.screenPos[this.snapTo])
        if (this.dir) {
            this.moveToScreen(dist)
        }
        else {
            this.moveToScreen(-dist)
        }
    }

    rotInf() {
        this.randomRotation = setInterval(() => {
            this.rotateTo(this.randomRotNum)
            this.randomRotNum++
            if (this.randomRotNum > 3) {
                this.randomRotNum = 0
            }
        }, 5000)
    }

    rotateTo(num) {
        if (this.randomRotAnime) {
            this.randomRotAnime.kill()
        }
        this.randomRotAnime = gsap.to(this.screen.rotation, {
            y: (Math.PI / 2.3) + num * (Math.PI / 2), duration: 2.5, ease: "power4.out",
            onComplete: () => {
                if (this.currentSection == 1) {
                    this.options.showProject(num, 's')
                }
            }
        })
        this.rotateCirc(((Math.PI / 2.3) + num * (Math.PI / 2))*(180/Math.PI))
        
    }

    rotateCirc(deg){
        if (this.circRotAnime) {
            this.circRotAnime.kill()
        }
        this.circRotAnime = gsap.to(this.rotCirc, {
            rotate: deg, duration: 2.5, ease: "power4.out"
        })
    }


    stopRotInf() {
        if (this.randomRotAnime) {
            this.randomRotAnime.kill()
        }
        clearInterval(this.randomRotation)
        this.randomRotation = null
    }

    addSec2Listeners() {
        this.rotStart = this.rotateStart.bind(this)
        this.rotMov = this.rotateMove.bind(this)
        this.rotUp = this.rotateUp.bind(this)
        window.addEventListener(this.mobile ? 'touchstart' : 'mousedown', this.rotStart)
        window.addEventListener(this.mobile ? 'touchmove' : 'mousemove', this.rotMov)
        window.addEventListener(this.mobile ? 'touchend' : 'mouseup', this.rotUp)
    }


    removeDragListeners() {
        window.removeEventListener(this.mobile ? 'touchstart' : 'mousedown', this.rotStart)
        window.removeEventListener(this.mobile ? 'touchmove' : 'mousemove', this.rotMov)
        window.removeEventListener(this.mobile ? 'touchend' : 'mouseup', this.rotUp)
    }

    rotateMove(evt) {
        // console.log('here')
        if (!this.mouseDown) {
            return;
        }
        if (!this.mobile) {
            evt.preventDefault();
        }
        if (this.snappingAnime) {
            if (this.snapToAnime && this.snapToAnime.isActive()) {
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
        this.dx = -dx
    }

    rotateStart(evt) {

        if (!this.mobile) {
            evt.preventDefault();
        }
        if (this.snappingAnime) {
            if (this.snapToAnime && this.snapToAnime.isActive()) {
                this.snapToAnime.kill()
            }
        }

        this.mouseDown = true;
        if (this.mobile) {
            this.mouseX = evt.touches[0].screenX;
            this.mouseY = evt.touches[0].screenY;
        }
        else {
            this.mouseX = evt.clientX;
            this.mouseY = evt.clientY;
        }
        document.body.style.cursor = 'grabbing'
    }

    rotateUp(evt) {
        if (!this.mobile) {
            evt.preventDefault();
        }
        this.mouseDown = false;
        this.snapToScreen(false)
        document.body.style.cursor = 'grab'
    }

    goToSection(to) {
        if (this.currentSection == to) {
            return
        }

        this.sectionMap[0].end = false
        this.sectionMap[1].end = false
        this.sectionMap[2].end = false
        this.sectionMap[this.currentSection].start = true

        if (this.sectionMap[1].start) {
            this.removeDragListeners()
            gsap.to(this.rotCirc, {width: "80%"})
        }

        if (this.sectionMap[0].start) {
            this.rayMouseDown = false
            this.removeSec1Listeners()
            document.body.style.cursor = 'default'
            this.cursorOnScreen = false
        }

        if (to == 0) {
            this.goToHome()
            this.currentSection = 0
            document.body.style.cursor = 'default'
        }
        else if (to == 1) {
            this.goToProjects()
            gsap.to(this.rotCirc, {width: this.mobile ? "150%" : "140%"})
            this.currentSection = 1
        }
        else if (to == 2) {
            this.goToAbout()
            this.currentSection = 2
            document.body.style.cursor = 'default'
        }
    }

    goToHome() {
        this.onProjectsOptimizations(2)
        if (!this.randomRotation) {
            this.rotInf()
        }
        this.playGoToAnime(0)
    }

    goToProjects() {
        this.stopRotInf()
        this.playGoToAnime(1)
        this.rotateTo(0)
    }

    goToAbout() {
        this.onProjectsOptimizations(2)
        if (!this.randomRotation) {
            this.rotInf()
        }
        this.playGoToAnime(2)
    }

    playGoToAnime(section) {
        if (this.projAnime) {
            this.projAnime.kill()
        }
        if (this.homeAnime) {
            this.homeAnime.kill()
        }
        if (this.aboutAnime) {
            this.aboutAnime.kill()
        }
        if (section == 0) {
            this.homeAnime = gsap.timeline({
                onComplete: () => {
                    this.options.finishSectionChange(0)
                    this.sectionMap[0].end = true
                    this.sectionMap[0].start = false
                    this.addSection1Listeners()
                    console.log('completed home')
                }
            })

            if (this.shakeAnime) {
                this.shakeAnime.kill()
            }
            if (this.moveScreenAnime) {
                this.moveScreenAnime.kill()
            }
            let timer = 1
            this.homeAnime.to(this.mainLight, { intensity: 20, duration: timer * 2, })

            this.homeAnime.to(this,
                {
                    fogValue: 0.05,
                    duration: timer,
                    delay: -timer,
                    onUpdate: () => {
                        this.scene.background = new THREE.Color(0xc81cf3)
                        this.scene.fog = new THREE.FogExp2(0xc81cf3, this.fogValue)
                    }
                }
            )
            this.homeAnime.to(this.camera.position,
                {
                    x: this.mobile ? -1.4721604622273015 : 1.857694276842902,
                    y: this.mobile ? 1.9287862762270516 : 4.960754567944053,
                    z: this.mobile ? 1.510447495458987 : 3.728480970069918,
                    duration: 2 * timer,
                    delay: -2 * timer
                }
            )

            this.homeAnime.to(this.camera.rotation,
                {
                    x: this.mobile ? -0.3688849617081898 : -0.6132813005274419,
                    y: this.mobile ? 0.045607583433491 : 0.3006405553572554,
                    z: this.mobile ? 0.017623085925540564 : 0.25548036184093635,
                    duration: timer,
                    delay: -(2 * timer),
                }
            )
        }
        else if (section == 1) {
            this.projAnime = gsap.timeline({
                onComplete: () => {
                    this.options.finishSectionChange(1)
                    console.log('completed proj')
                    this.sectionMap[1].end = true
                    this.sectionMap[1].start = false
                    this.addSec2Listeners()
                    this.onProjectsOptimizations(1)
                    this.snapToScreeSpec()
                    document.body.style.cursor = 'grab'
                    this.currentSection = 1
                }
            })

            let timer = 1
            this.projAnime.to(this.mainLight, { intensity: 1, duration: timer * 2, },)

            this.projAnime.to(this,
                {
                    fogValue: 0.15,
                    duration: timer,
                    delay: -timer,
                    onUpdate: () => {
                        this.scene.fog = new THREE.FogExp2(0xc81cf3, this.fogValue)
                    }
                }
            )
            this.projAnime.to(this.camera.position,
                {
                    z: (Math.cos(Math.PI / 4) * this.radius) - 2,
                    y: this.mobile ? 0.45 : 1,
                    x: (Math.sin(Math.PI / 4) * this.radius) - 4,
                    duration: 2 * timer,
                    delay: -2 * timer
                }
            )

            let spec = true
            this.projAnime.to(this.camera.rotation,
                {
                    x: spec ? 0 : -0.16623955441733898,
                    y: this.mobile ? 0.8 : 0.7784574305475266,
                    z: spec ? 0 : 0.11727709241617727,
                    duration: timer,
                    delay: -(2 * timer),
                }
            )

        }
        else if (section == 2) {
            this.aboutAnime = gsap.timeline({
                onComplete: () => {
                    this.options.finishSectionChange(2)
                    this.currentSection = 2
                    this.sectionMap[2].end = true

                    this.sectionMap[2].start = false
                    console.log('completed about')
                }
            })

            if (this.shakeAnime) {
                this.shakeAnime.kill()
            }
            if (this.moveScreenAnime) {
                this.moveScreenAnime.kill()
            }
            let timer = 1

            this.aboutAnime.to(this.mainLight,
                {
                    intensity: this.mobile ? 10 : 20,
                    duration: timer * 2
                }
            )

            this.aboutAnime.to(this,
                {
                    fogValue: 0.05,
                    duration: timer,
                    delay: -timer,
                    onUpdate: () => {
                        this.scene.background = new THREE.Color(0xc81cf3)
                        this.scene.fog = new THREE.FogExp2(0xc81cf3, this.fogValue)
                    }
                }
            )
            this.aboutAnime.to(this.camera.position,
                {
                    x: this.mobile ? -4 : -9.925,
                    y: this.mobile ? 8 : 12.96,
                    z: this.mobile ? -2.11 : 1.3,
                    duration: 2 * timer,
                    delay: -2 * timer
                }
            )
            this.aboutAnime.to(this.camera.rotation,
                {
                    x: this.mobile ? -Math.PI / 2 : -1.724,
                    y: this.mobile ? 0 : -0.22,
                    z: this.mobile ? -0.0 : -2.18,
                    duration: timer,
                    delay: -(2 * timer),
                }
            )
        }
    }

    snapToScreeSpec() {

        this.snapTo = 4
        this.totalPi = Math.PI/4
        this.options.showProject(0, 'f')
        this.decideClosestSnapTo(this.totalPi)
        this.changeFogColor()
        this.oldSnapTo = this.snapTo
    }

    onProjectsOptimizations(section) {
        console.log('opt', section)
        if (section == this.oldOpt) {
            return
        }
        if (section == 1) {
            this.videoMaterials.forEach(el => {
                el.side = THREE.FrontSide
            })
            if (this.mobile) {
                this.mobileFloorMesh.material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0x141414),
                })
            }
            else {
                gsap.to(this.mirror.material.uniforms.depthMulti,
                    {
                        value: 20000,
                        duration: 2
                    }
                )

            }
        }
        else if (section == 2) {
            this.videoMaterials.forEach(el => {
                el.side = THREE.DoubleSide
            })
            if (this.mobile) {
                this.mobileFloorMesh.material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(0xffffff),
                    reflectivity: 1,
                    shininess: 10,
                });
            }
            else {
                gsap.to(this.mirror.material.uniforms.depthMulti,
                    {
                        value: 100000,
                        duration: 2
                    }
                )

            }
        }
        this.oldOpt = section
    }


    moveScreen() {
        this.timeDelta = this.time - this.oldTime
        this.speed = (this.dx / this.timeDelta) * 10
        if (this.mobile) {
            this.speed *= 1.5
            if (Math.abs(this.speed) < 20) {
                this.speed *= 3.6
            }
        }
        if (isNaN(this.speed)) {
            return
        }
        this.pi = (this.speed * Math.PI * 0.01)
        if (this.snapToAnime) {
            this.snapToAnime.kill()
        }
        this.dir = this.pi > 0 ? true : false
        this.rotCircPi += this.pi

        this.moveToScreen(this.pi)
    }

    moveToScreen(pi) {
        let dur = false

        if (Math.abs(pi) < 0.7) {
            dur = true
        }
        if (this.moveScreenAnime) {
            this.moveScreenAnime.kill()
        }

        this.moveScreenAnime = gsap.to(this, {
            totalPi: this.totalPi + pi,
            onUpdate: () => {
                let z = (Math.cos(this.totalPi) * this.radius) - 2
                let x = (Math.sin(this.totalPi) * this.radius) - 4
                this.camera.position.x = x
                this.camera.position.z = z
                this.camera.rotation.y = this.totalPi
                this.rotCirc.style.transform = `rotate(${(this.totalPi*180)/Math.PI}deg)`
            },
            duration: this.mobile ? dur ? 1.3 : 1 : 0.6
        })
    }

    tiltCam() {
        if (this.shakeAnime) {
            this.shakeAnime.kill()
        }

        if (Math.abs(this.dx) < 20 && Math.abs(this.dx) > 2) {
            return
        }

        this.shakeAnime = gsap.to(this.camera.rotation,
            {
                z: this.dx * -0.05,
                duration: Math.abs(this.dx) < 10 ? 1 : 15
            }
        )
    }

    animate() {
        this.time = Date.now()
        if (!this.mobile && (this.currentSection == 0 && !this.sectionMap[0].start)) {
            this.mouseCameraMovement()
        }
        if ((this.currentSection == 0 && !this.sectionMap[0].start)) {
            if(this.mobile){
                if(this.rayMouseDown){
                    this.rayFuncMobile()
                }
            }
            else{
                this.rayFuncLaptop()
            }
        }
        if (this.currentSection == 1) {
            if (Math.abs(this.totalPi) > 2 * Math.PI) {
                this.totalPi = this.totalPi % (2 * Math.PI)
            }
            if (this.sectionMap[1].end) {
                this.snapToScreen(true)
                if (!this.mobile) {
                    this.tiltCam()
                }
                if (this.mouseDown) {
                    this.moveScreen()
                }
            }
        }

        this.oldTime = this.time
        this.dx = 0
    }
}

export { Anime }