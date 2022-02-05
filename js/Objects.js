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
        options,
        shadows, mobileFloor, noScreenShader, noFloor, bufferGeo, whiteFloor, mobile
    }) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.shadows = shadows
        this.mobileFloor = mobileFloor
        this.bufferGeo = bufferGeo
        this.noScreenShader = noScreenShader
        this.whiteFloor = whiteFloor
        this.noFloor = noFloor
        this.mobile = mobile
        this.options = options
        this.addFloor()
        this.addScreenSegment()
        this.loadModels()
        this.addDiffLight()
    }

    addDiffLight() {
        let pointLight
        if (this.whiteFloor) {
            if (this.shadows) {
                pointLight = new THREE.PointLight(0xffffff, 18, 12);
                pointLight.position.set(-4, 4, -2);
                pointLight.shadow.radius = 1.2
                pointLight.castShadow = false
                this.scene.add(pointLight);


                let shadowLight = new THREE.PointLight(0xffffff, 2, 10);
                shadowLight.position.set(-4, 4, -2);
                shadowLight.shadow.radius = 1.2
                shadowLight.castShadow = true
                this.scene.add(shadowLight)
            }
            else {
                pointLight = new THREE.PointLight(0xffffff, 18, 8);
                pointLight.position.set(-4, 4, -2);
                pointLight.castShadow = false
                this.scene.add(pointLight)
            }
            this.mainLight = pointLight
        }
        else {
            pointLight = new THREE.PointLight(0xffffff, 20, 10);
            pointLight.position.set(-4, 4, -2);
            this.scene.add(pointLight);
            this.mainLight = pointLight
        }
    }

    addLights() {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.x = -4
        directionalLight.position.y = 2
        directionalLight.position.z = -2
        const targetObject = new THREE.Object3D();
        targetObject.position.set(-4, 10, -2)
        this.scene.add(targetObject);
        directionalLight.target = targetObject;
        // directionalLight.target = this.masterMesh
        directionalLight.castShadow = true
        directionalLight.shadow.radius = 1.2;

        const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
        this.scene.add(helper)
        this.scene.add(directionalLight);
    }

    addFloor() {
        if (this.noFloor) {
            return
        }
        if (!this.mobileFloor) {
            if (!this.shadows) {
                let geometry
                if (this.bufferGeo) {
                    geometry = new THREE.PlaneBufferGeometry(20, 20);
                }
                else {
                    geometry = new THREE.PlaneGeometry(100, 100);
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
                    floorGeometry = new THREE.PlaneGeometry(100, 100);
                }
                else {
                    floorGeometry = new THREE.PlaneBufferGeometry(100, 100);
                }

                let col
                if (this.whiteFloor) {
                    col = 0xffffff
                }
                else {
                    col = 0x443f4b
                }

                let floorMaterial = new THREE.MeshPhongMaterial({
                    color: new THREE.Color(col),
                    shininess: this.whiteFloor ? 10 : 100,
                    reflectivity: this.whiteFloor ? 1 : 1,
                });

                let floor = new THREE.Mesh(floorGeometry, floorMaterial)
                floor.position.x = -4
                floor.position.y = -0;
                floor.position.z = -2;
                floor.rotation.x = -Math.PI / 2;
                floor.castShadow = true;
                floor.receiveShadow = true
                this.scene.add(floor)





                let geometry
                if (!this.bufferGeo) {
                    geometry = new THREE.RingGeometry(1, 4, 122);
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
                mirror.position.x = -4;
                mirror.position.y = 0.01;
                mirror.position.z = -2;
                mirror.rotation.x = -Math.PI / 2;
                mirror.receiveShadow = true
                this.mirror = mirror
                this.scene.add(mirror)
            }
        }
        else {

            // let floorGeometry

            // if (!this.bufferGeo) {
            //     floorGeometry = new THREE.PlaneGeometry(100, 100);
            // }
            // else {
            //     floorGeometry = new THREE.PlaneBufferGeometry(100, 100);
            // }

            // let floorMaterial = new THREE.MeshBasicMaterial({
            //     color: new THREE.Color(0x000000),
            // })

            // let floor = new THREE.Mesh(floorGeometry, floorMaterial)
            // floor.position.y = -0;
            // floor.position.z = 0;
            // floor.rotation.x = -Math.PI / 2;
            // floor.castShadow = true;
            // floor.receiveShadow = true
            // this.scene.add(floor)



            // let geometry
            // if (!this.bufferGeo) {
            //     geometry = new THREE.RingGeometry(0, 4 * 0.7, 122);
            // }
            // else {
            //     geometry = new THREE.RingBufferGeometry(0, 4 * 0.7, 122);
            // }

            // let col
            // if (this.whiteFloor) {
            //     col = 0xffffff
            // }
            // else {
            //     col = 0x443f4b
            // }
            // col = 0xffffff

            // let ringMaterial = new THREE.MeshBasicMaterial({
            //     color: new THREE.Color(col),
            // })

            // let mirror = new THREE.Mesh(geometry, ringMaterial)
            // mirror.position.x = -4;
            // mirror.position.y = 0.01;
            // mirror.position.z = -2;
            // mirror.rotation.x = -Math.PI / 2;
            // mirror.receiveShadow = true
            // this.scene.add(mirror)



            let floorGeometry

            if (!this.bufferGeo) {
                floorGeometry = new THREE.PlaneGeometry(80, 80);
            }
            else {
                floorGeometry = new THREE.PlaneBufferGeometry(80, 80);
            }

            let col
            if (this.whiteFloor) {
                col = 0xffffff
            }
            else {
                col = 0x141414
            }

            // let floorMaterial = new THREE.MeshBasicMaterial({
            //     color: new THREE.Color(col),
            // })

            let floorMaterial = new THREE.MeshPhongMaterial({
                color: new THREE.Color(col),
                reflectivity: this.whiteFloor ? 1 : 1,
                shininess: this.whiteFloor ? 10 : 100,
            });

            let floor = new THREE.Mesh(floorGeometry, floorMaterial)
            floor.position.x = -4;
            floor.position.y = 0.0;
            floor.position.z = -2;
            floor.rotation.x = -Math.PI / 2;
            floor.castShadow = false;
            floor.receiveShadow = false
            this.mobileFloorMesh = floor
            this.scene.add(floor)
        }
    }

    addScreenSegment() {
        var outerRadius
        var innerRadius
        var height

        outerRadius = this.mobile ? 2.98 : 2.999;
        innerRadius = this.mobile ? 2.9 : 2.95;
        height = 2.05;

        this.masterMesh = new THREE.Group()
        this.masterMesh.position.x = -4;
        this.masterMesh.position.y = 1.0;
        this.masterMesh.position.z = -2;

        if (!this.noScreenShader) {
            
            let geometry = new THREE.RingGeometry( innerRadius, outerRadius+0.01, 102 );
            let material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.FrontSide } );
            let mesh = new THREE.Mesh( geometry, material );
            mesh.position.y = 1.05
            mesh.rotation.x = -Math.PI/2

            this.masterMesh.add( mesh );


            geometry = new THREE.RingGeometry( innerRadius, outerRadius+0.01, 102 );
            material = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.FrontSide } );
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.y = -0.97
            mesh.rotation.x = Math.PI/2

            this.masterMesh.add( mesh );

        }

        let geometry
        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }

        let material = new THREE.MeshBasicMaterial({ color: 0x000 });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1.05
        this.masterMesh.add(mesh)

        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(outerRadius, outerRadius, 0.05, 102, 32, true)
        }
        material = new THREE.MeshBasicMaterial({ color: 0x000 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = -0.95
        this.masterMesh.add(mesh)

        this.videoMaterial = []

        this.createScreenSection(0, Math.ceil(outerRadius))
        this.createScreenSection(1, Math.ceil(outerRadius))
        this.createScreenSection(2, Math.ceil(outerRadius))
        this.createScreenSection(3, Math.ceil(outerRadius))

        if (this.mobile) {
            this.masterMesh.scale.set(0.6, 0.6, 0.6)
            this.masterMesh.position.y -= 0.4
        }
        this.scene.add(this.masterMesh)

    }

    createScreenSection(videoNum, outerRadius) {
        let offset = 0.005
        let geometry
        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 2, 32, 32, true, (videoNum * (Math.PI / 2)), (Math.PI / 2) - offset)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(outerRadius, outerRadius, 2, 32, 32, true, (videoNum * (Math.PI / 2)), (Math.PI / 2) - offset)
        }
        let video = document.querySelector(`#video${videoNum + 1}`);
        video.play()
        video.oncanplay = function(el){
            el.target.play()
        }
        
        let texture = new THREE.VideoTexture(video);
        texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        let material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.05
        mesh.name = 'screen'
        this.videoMaterial.push(material)
        this.masterMesh.add(mesh)

        if (!this.bufferGeo) {
            geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, 2, 32, 32, true, ((videoNum + 1) * Math.PI / 2) - offset, offset)
        }
        else {
            geometry = new THREE.CylinderBufferGeometry(outerRadius, outerRadius, 2, 32, 32, true, ((videoNum + 1) * Math.PI / 2) - offset, offset)
        }
        material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 0.05
        mesh.name = 'screen'
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
        if (this.mobile) {
            model.scale.set(0.21, 0.21, 0.21)
        }
        else {
            model.scale.set(0.3, 0.3, 0.3)
        }

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
        if (this.mobile) {
            if (i == 1 || i == 2) {
                model.position.set(0.7 * (this.position[j][i][0] - 2), this.position[j][i][1] * 1, 0.6 * (this.position[j][i][2] - 1.8))
            }
            else if (i == 3) {
                model.position.set(0.9 * (this.position[j][i][0] - 2), this.position[j][i][1] * 1, 0.7 * (this.position[j][i][2] - 1))
            }
            else {
                model.position.set(0.7 * (this.position[j][i][0] - 2), this.position[j][i][1] * 1, 0.7 * (this.position[j][i][2] - 2))
            }
        }
        else {
            model.position.set(this.position[j][i][0], this.position[j][i][1], this.position[j][i][2])
        }
        this.scene.add(model)
        this.options.loadedModel(i, j)
    }


}

export { Objects }