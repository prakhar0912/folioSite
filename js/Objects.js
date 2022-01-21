import * as THREE from "three";
import { Reflector } from './Reflector'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ReflectorMaterial } from "./spec/ReflectorMaterial";
import { Floor } from './Floor'
import model1 from '../assets/person1.glb'
import model2 from '../assets/person2.glb'
import model3 from '../assets/person3.glb'
import model4 from '../assets/person4.glb'
import model5 from '../assets/person5.glb'
import model6 from '../assets/person6.glb'



class Objects {
    constructor({
        scene,
        camera,
        renderer,
        shadows, noFloor, noScreenShader, bufferGeo
    }) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.shadows = shadows
        this.noFloor = noFloor
        this.bufferGeo = bufferGeo
        this.noScreenShader = noScreenShader
        if (this.shadows) {
            this.addLights()
        }
        this.addFloor()
        this.addScreenSegment()
        this.loadModels()
        // this.addDiffLight()
        // this.addLights()
    }

    addDiffLight() {
        const pointLight = new THREE.PointLight(0xffffff, 10, 1000);
        pointLight.position.set(-4, 1, -2);
        this.scene.add(pointLight);

        const sphereSize = 1;
        const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
        this.scene.add(pointLightHelper);
    }

    addLights() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
        directionalLight.position.x = -4
        directionalLight.position.y = 5
        directionalLight.position.z = -2
        directionalLight.castShadow = true
        directionalLight.shadow.radius = 1.2;
        this.scene.add(directionalLight);

    }

    addFloor() {
        if (!this.noFloor) {
            if (!this.shadows) {
                let geometry
                if (this.bufferGeo) {
                    geometry = new THREE.PlaneBufferGeometry(20, 20);
                }
                else {
                    geometry = new THREE.PlaneGeometry(20, 20);
                }


                var mirror = new Reflector(geometry, {
                    clipBias: 0.003,
                    textureWidth: 1024 * window.devicePixelRatio,
                    textureHeight: 1024 * window.devicePixelRatio,
                    color: 0x889999,
                    recursion: 1
                });
                mirror.position.y = -0;
                mirror.position.z = 0;
                mirror.rotation.x = -Math.PI / 2;
                mirror.castShadow = false;
                mirror.receiveShadow = false
                this.scene.add(mirror)



            }
            else {
                let floorGeometry

                if (!this.bufferGeo) {
                    floorGeometry = new THREE.PlaneGeometry(20, 20);
                }
                else {
                    floorGeometry = new THREE.PlaneBufferGeometry(20, 20);
                }

                let floorMaterial = new THREE.ShadowMaterial({
                    transparent: true,
                    opacity: 0.3,
                });
                let floor = new THREE.Mesh(floorGeometry, floorMaterial)
                floor.position.y = -0;
                floor.position.z = 0;
                floor.rotation.x = -Math.PI / 2;
                floor.castShadow = true;
                floor.receiveShadow = true
                this.scene.add(floor)

                let geometry
                if (!this.bufferGeo) {
                    geometry = new THREE.RingGeometry(1, 4, 122);
                    // const geometry = new THREE.PlaneGeometry(20, 20);
                }
                else {
                    geometry = new THREE.RingBufferGeometry(1, 4, 122);
                }

                var mirror = new Reflector(geometry, {
                    clipBias: 0.003,
                    textureWidth: 1024 * window.devicePixelRatio,
                    textureHeight: 1024 * window.devicePixelRatio,
                    color: 0x889999,
                });
                console.log('okayy')
                // let mirror = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({transparent: true, opacity: 0}))
                mirror.position.x = -4;
                mirror.position.y = 0.01;
                mirror.position.z = -2;
                mirror.rotation.x = -Math.PI / 2;
                // mirror.castShadow = false;
                mirror.receiveShadow = true
                this.scene.add(mirror)
            }
        }
        else {
            // const floorGeometry = new THREE.PlaneGeometry(20, 20);
            // let texture = new THREE.TextureLoader().load('img/marble.jpg')

            // let floorMaterial = new THREE.MeshBasicMaterial({
            //     map: texture,
            //     color: new THREE.Color(0xfff)
            // });
            // console.log('here')
            // let floor = new THREE.Mesh(floorGeometry, floorMaterial)
            // floor.position.y = -0;
            // floor.position.z = 0;
            // floor.rotation.x = -Math.PI / 2;
            // floor.castShadow = true;
            // floor.receiveShadow = true
            // this.scene.add(floor)
        }
    }

    addScreenSegment() {
        var outerRadius = 2.998;
        var innerRadius = 2.9;
        var height = 2.05;

        this.masterMesh = new THREE.Group()
        this.masterMesh.position.x = -4;
        this.masterMesh.position.y = 1.0;
        this.masterMesh.position.z = -2;

        if (!this.noScreenShader) {
            var arcShape = new THREE.Shape();
            arcShape.moveTo(outerRadius * 2, outerRadius);
            arcShape.absarc(outerRadius, outerRadius, outerRadius, 0, Math.PI * 2, false);
            var holePath = new THREE.Path();
            holePath.moveTo(outerRadius + innerRadius, outerRadius);
            holePath.absarc(outerRadius, outerRadius, innerRadius, 0, Math.PI * 2, true);
            arcShape.holes.push(holePath);

            let screenGeo
            if (!this.bufferGeo) {
                screenGeo = new THREE.ExtrudeGeometry(arcShape, {
                    depth: height,
                    bevelEnabled: false,
                    steps: 1,
                    curveSegments: 100
                });
            }
            else {
                screenGeo = new THREE.ExtrudeBufferGeometry(arcShape, {
                    depth: height,
                    bevelEnabled: false,
                    steps: 1,
                    curveSegments: 100
                });
            }

            screenGeo.center();
            screenGeo.rotateX(Math.PI * -.5);
            let screenMat = [
                new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 1 }),
                new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.4 }),
            ]
            let geoMesh = new THREE.Mesh(screenGeo, screenMat)
            geoMesh.position.y = 0.05
            this.masterMesh.add(geoMesh)
        }

        let geometry
        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }

        let material = new THREE.MeshBasicMaterial({ color: 0x000, side: THREE.DoubleSide });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1.05
        this.masterMesh.add(mesh)

        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }
        material = new THREE.MeshBasicMaterial({ color: 0x000, side: THREE.DoubleSide });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = -0.95
        this.masterMesh.add(mesh)

        this.createScreenSection(0)
        this.createScreenSection(1)
        this.createScreenSection(2)
        this.createScreenSection(3)

        this.scene.add(this.masterMesh)
    }

    createScreenSection(videoNum) {
        let offset = 0.005
        let geometry
        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(3, 3, 2, 32, 32, true, (videoNum * (Math.PI / 2)), (Math.PI / 2) - offset)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(3, 3, 2, 32, 32, true, (videoNum * (Math.PI / 2)), (Math.PI / 2) - offset)
        }
        let video = document.querySelector(`#video${videoNum + 1}`);
        video.play()
        let texture = new THREE.VideoTexture(video);
        texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.05
        this.masterMesh.add(mesh)

        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(3, 3, 2, 32, 32, true, ((videoNum + 1) * Math.PI / 2) - offset, offset)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(3, 3, 2, 32, 32, true, ((videoNum + 1) * Math.PI / 2) - offset, offset)
        }
        material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.05
        this.masterMesh.add(mesh)
    }

    loadModels() {
        this.models = []
        this.total = 6
        this.loaded = 0
        this.blue = 'z'
        this.red = 'x'
        this.position = [
            [[0, 0, 0], [-4.5, 0, 2], [-6, 0, -5], [-1, 0, -5]],
            [[0, 0, 1], [-5.5, 0, 1.5], [-5, 0, -5.5], [-1, 0, -4]],
            [[-1, 0, 1], [-6.5, 0, 1], [-6, 0, -6], [0, 0, -4]],
            [[-2, 0, 2], [-7, 0, 0], [-4, 0, -6], [1, 0, -3]],
            [[-3, 0, 2], [-8, 0, -1], [-3, 0, -5.5], [0, 0, -2]],
            [[-3.5, 0, 2.5], [-7.5, 0, -2.5], [-2, 0, -5.5], [-0.5, 0, -1]],
        ]
        const loader = new GLTFLoader();
        this.load = (gltf) => {
            this.loaded++
            let model = []
            model.push(gltf.scene)
            model.push(gltf.scene.clone())
            model.push(gltf.scene.clone())
            model.push(gltf.scene.clone())
            this.models.push(model)
            if (this.loaded == this.total) {
                this.addModels()
            }
        }
        this.modelsToLoad = [model1, model2, model3, model4, model5, model6]
        this.modelsToLoad.forEach(ele => {
            loader.load(ele, this.load.bind(this), undefined, function (error) {
                console.error(error);
            });
        })
    }

    addModels() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 6; j++) {
                this.addModel(this.models[j][i], j, i)
            }
        }
    }

    addModel(model, j, i) {
        if (j == 4) {
            return
        }
        this.scene.add(model)
        model.children.forEach((el, i) => {
            if (this.shadows) {
                el.castShadow = true;
                el.receiveShadow = true
            }
            else {
                el.castShadow = false;
                el.receiveShadow = false
            }
        })
        if (this.shadows) {
            model.castShadow = false
        }
        else {
            model.castShadow = false
        }

        model.scale.set(0.3, 0.3, 0.3)
        if (i == 0) {
            model.rotation.y = 3 * Math.PI / 4
            if (j >= 3) {
                model.rotation.y = (2 * Math.PI / 4)
            }
        }
        else if (i == 1) {
            model.rotation.y = -6 * Math.PI / 4
            if (j >= 2) {
                model.rotation.y = (-7 * Math.PI / 4)
            }
            if (j >= 4) {
                model.rotation.y = (-8.3 * Math.PI / 4)
            }
        }
        else if (i == 2) {
            model.rotation.y = -2 * Math.PI / 4
            if (j >= 3) {
                model.rotation.y = (-3 * Math.PI / 4)
            }
        }
        else if (i == 3) {
            model.rotation.y = -4 * Math.PI / 4
            if (j >= 3) {
                model.rotation.y = (-5 * Math.PI / 4)
            }
        }
        model.position.set(this.position[j][i][0], this.position[j][i][1], this.position[j][i][2])
    }


}

export { Objects }