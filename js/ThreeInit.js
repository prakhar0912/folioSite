import * as THREE from "three";
import { createBackground } from "./CreateBackground";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

class ThreeInit {
  constructor({ orbital, shadows, specialGrain, noGrain, noFog, mobile }) {
    this.shadows = shadows
    this.scene = new THREE.Scene();
    this.specialGrain = specialGrain
    this.noGrain = noGrain
    this.noFog = noFog
    this.mobile = mobile
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

    this.camera.position.x = 4.857694276842902
    this.camera.position.y = 6.560754567944053
    this.camera.position.z = 5.028480970069918

    this.camera.rotation.x = -0.6132813005274419
    this.camera.rotation.y = 0.3006405553572554
    this.camera.rotation.z = 0.20548036184093635

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: this.mobile ? true : false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.physicallyCorrectLights = true
    // this.renderer.gammaOutPut = true
    // this.renderer.outputEncoding = THREE.sRGBEncoding
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // this.renderer.shadowMap.enabled = false
    this.renderer.toneMapping = THREE.NoToneMapping
    this.renderer.toneMappingExposure = 1
    if (this.shadows) {
      this.renderer.shadowMap.enabled = true;
    }
    document.body.appendChild(this.renderer.domElement);
    window.addEventListener("resize", this.resize.bind(this));
    if (orbital) {
      this.addOrbitalCam()
    }
    if (this.specialGrain) {
      this.addGrain()
    }
    else {
      if (!this.noGrain) {
        this.addBackground()
      }
    }
    if (!this.noFog) {
      this.addFog()
    }
  }

  addGrain() {
    this.composer = new EffectComposer(this.renderer);
    var renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    //custom shader pass
    var vertShader = `
      precision highp float; 

      attribute vec3 aPos;
      attribute vec2 aUvs;

      varying vec2 vUv;

      void main(){
          vUv = aUvs;
          gl_Position = vec4(aPos, 1.0);
      }
    `
    var fragShader = `
      precision highp float; 

      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2 uRez;

      uniform float uOpacity;
      uniform float uDitherWidth;
      uniform float uDitherSteps;
      uniform float uSaturation;

      varying vec2 vUv;

      float Noise(vec2 n,float x){n+=x;return fract(sin(dot(n.xy,vec2(12.9898, 78.233)))*43758.5453)*2.0-1.0;}

      // Step 1 in generation of the dither source texture.
      float Step1(vec2 uv,float n){
          float a=1.0,b=2.0,c=-12.0,t=1.0;   
          return (1.0/(a*4.0+b*4.0-c))*(
              Noise(uv+vec2(-1.0,-1.0)*t,n)*a+
              Noise(uv+vec2( 0.0,-1.0)*t,n)*b+
              Noise(uv+vec2( 1.0,-1.0)*t,n)*a+
              Noise(uv+vec2(-1.0, 0.0)*t,n)*b+
              Noise(uv+vec2( 0.0, 0.0)*t,n)*c+
              Noise(uv+vec2( 1.0, 0.0)*t,n)*b+
              Noise(uv+vec2(-1.0, 1.0)*t,n)*a+
              Noise(uv+vec2( 0.0, 1.0)*t,n)*b+
              Noise(uv+vec2( 1.0, 1.0)*t,n)*a+
          0.0);
      }
          
      // Step 2 in generation of the dither source texture.
      float Step2(vec2 uv,float n){
          float a=1.0,b=2.0,c=-2.0,t=1.0;   
          return (4.0/(a*4.0+b*4.0-c))*(
              Step1(uv+vec2(-1.0,-1.0)*t,n)*a+
              Step1(uv+vec2( 0.0,-1.0)*t,n)*b+
              Step1(uv+vec2( 1.0,-1.0)*t,n)*a+
              Step1(uv+vec2(-1.0, 0.0)*t,n)*b+
              Step1(uv+vec2( 0.0, 0.0)*t,n)*c+
              Step1(uv+vec2( 1.0, 0.0)*t,n)*b+
              Step1(uv+vec2(-1.0, 1.0)*t,n)*a+
              Step1(uv+vec2( 0.0, 1.0)*t,n)*b+
              Step1(uv+vec2( 1.0, 1.0)*t,n)*a+
          0.0);
      }

      vec3 Step3T(vec2 uv){
          float a=Step2(uv,0.07*(fract(uTime)+1.0));    
          float b=Step2(uv,0.11*(fract(uTime)+1.0));    
          float c=Step2(uv,0.13*(fract(uTime)+1.0));
          return mix(vec3(a,b,c), vec3(a), 1. - uSaturation);
      }

      void main() {   

          color = mix(
              color,
              floor( 0.5 + color * (uDitherSteps+uDitherWidth-1.0) + (-uDitherWidth*0.5) + Step3T(vUv * uRez) * (uDitherWidth)) * (1.0/(uDitherSteps-1.0)),
              uOpacity
          );

          gl_FragColor = vec4(color, 1.); 
      } 
    `
    this.counter = 0.0;
    var myEffect = {
      uniforms: {
        "uTime": { type: 'f', value: 0 },
        "uRez": { type: 'f', value: window.innerHeight * window.innerWidth },
        "uOpacity": { type: 'f', value: 1 },
        "uDitherWidth": { type: 'f', value: window.innerWidth },
        "uDitherSteps": { type: 'f', value: 1000 },
        "uSaturation": { type: 'f', value: 1000 },
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
    let fogColor = new THREE.Color(0x47264f);
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(fogColor, 0.0025, 30);
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
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.controls) {
      this.controls.update()
    }

    this.renderer.render(this.scene, this.camera);
    if (this.specialGrain) {
      this.counter += 0.01
      this.customPass.uniforms.uTime.value = this.counter;
      this.composer.render(this.counter);
    }
  }

  addToScene(object) {
    this.scene.add(object)
  }
}

export { ThreeInit }

