import * as THREE from "three";
import { createBackground } from "./CreateBackground";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

class ThreeInit {
  constructor({ orbital, shadows, specialBackground, noBackground, noFog, mobile }) {
    this.container = document.querySelector(".three")
    this.shadows = shadows
    this.scene = new THREE.Scene();
    this.specialBackground = specialBackground
    this.noBackground = noBackground
    this.noFog = noFog
    this.mobile = mobile
    this.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera = new THREE.PerspectiveCamera(this.mobile ? 85 : 65, this.aspect, 0.1, 1000);
    this.camera.position.x = 4.857694276842902
    this.camera.position.y = 6.560754567944053
    this.camera.position.z = 5.028480970069918

    this.camera.rotation.x = -0.6132813005274419
    this.camera.rotation.y = 0.3006405553572554
    this.camera.rotation.z = 0.20548036184093635

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    this.mobilePixelRatio = 1.3
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(this.mobile ? this.mobilePixelRatio : window.devicePixelRatio);
    this.renderer.physicallyCorrectLights = true
    this.renderer.toneMapping = THREE.NoToneMapping
    this.renderer.toneMappingExposure = 1
    if (this.shadows) {
      this.renderer.shadowMap.enabled = true;
    }
    this.container.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.resize.bind(this));
    if (orbital) {
      this.addOrbitalCam()
    }
    if (!this.noBackground) {
      if (this.specialBackground) {
        this.addGrain()
        console.log('ok')
      }
      else {
        this.addBackground()
        console.log('ok')

      }
    }
    
    if (!this.noFog) {
      this.addFog()
    }
    // this.addGridHelper()
  }

  addShape() {
    let floorGeometry = new THREE.PlaneGeometry(20, 20);


    let loader = new THREE.TextureLoader()
    let basecolor = loader.load('marble/White_Marble_005_COLOR.jpg')
    let occMap = loader.load('marble/White_Marble_005_OCC.jpg')
    let roughnessMap = loader.load('marble/White_Marble_005_ROUGH.jpg')
    // let basecolor = loader.load('marble/White_Marble_005_COLOR.jpg')




    let floorMaterial = new THREE.MeshStandardMaterial({
      map: basecolor,
    });

    let floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.position.y = 0.1;
    floor.position.z = 0;
    floor.rotation.x = -Math.PI / 2;
    floor.castShadow = true;
    floor.receiveShadow = true
    floor.matrixAutoUpdate = false;
    floor.updateMatrix();
    this.scene.add(floor)
  }

  addGrain() {
    this.composer = new EffectComposer(this.renderer);
    var renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    //custom shader pass
    var vertShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `
    var fragShader = `
      uniform float time;
      uniform float nIntensity;
      uniform float sIntensity;
      uniform float sCount;
      uniform sampler2D tDiffuse;
      varying vec2 vUv;

      void main() {
        vec4 cTextureScreen = texture2D( tDiffuse, vUv );
        float x = vUv.x * vUv.y * time *  1000.0;
        x = mod( x, 13.0 ) * mod( x, 123.0 );
        float dx = mod( x, 0.01 );
        vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );
        vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );
        cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;
        cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );
        gl_FragColor = vec4( cResult, cTextureScreen.a );
      }
    `
    this.counter = 0.0;
    var myEffect = {
      uniforms: {
        "tDiffuse": { type: "t", value: null },
        "time": { type: "f", value: 0.0 },
        "nIntensity": { type: "f", value: 0.1 },
        "sIntensity": { type: "f", value: 0.05 },
        "sCount": { type: "f", value: 4096 },
        "grayscale": { type: "i", value: 0 },
        "color1": { type: 'c', value: new THREE.Color('#2f0669') },
        "color2": { type: 'c', value: new THREE.Color('#990b75') }
      },
      vertexShader: vertShader,
      fragmentShader: fragShader
    }

    this.customPass = new ShaderPass(myEffect);
    this.customPass.renderToScreen = true;
    this.composer.addPass(this.customPass);
  }

  addOrbitalCam() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.update()
  }

  addBackground() {
    this.counter = 0.0
    this.background = new createBackground({ grainScale: 0.001, noiseAlpha: 0.45 })
    this.scene.add(this.background.mesh)
  }

  addFog() {
    let col
    if(this.mobile){
      col = 0xc81cf3
    }
    else{
      col = 0xd339cb
      col = 0x904da1
      col = 0xc367da
    }
    let fogColor = new THREE.Color(col);
    this.scene.background = fogColor;
    this.scene.fog = new THREE.FogExp2(fogColor, 0.05);
    // this.scene.fog = new THREE.Fog(fogColor, 0.005, 25);

  }

  addGridHelper() {
    const size = 20;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions);
    this.scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }

  resize() {
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(this.mobile ? this.mobilePixelRatio : window.devicePixelRatio)
    this.aspect = this.container.clientWidth / this.container.clientHeight
    this.camera.aspect = this.aspect
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.controls) {
      this.controls.update()
    }

    this.renderer.render(this.scene, this.camera);
    if (this.specialBackground) {
      this.counter += 0.01
      this.customPass.uniforms.time.value = this.counter;
      this.composer.render(this.counter);
    }
  }

  addToScene(object) {
    this.scene.add(object)
  }
}

export { ThreeInit }

