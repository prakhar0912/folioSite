import { Group, PlaneGeometry, Mesh, TextureLoader, RepeatWrapping } from 'three'
import { Reflector } from './spec/Reflector'
import { ReflectorMaterial } from './spec/ReflectorMaterial'


class Floor extends Group {
    constructor({fog}) {
        super();
        this.fog = fog
        this.initReflector();
    }

    initReflector() {
        this.reflector = new Reflector();
    }

    initMesh() {
        // const { scene, loadTexture } = WorldController;

        const geometry = new PlaneGeometry(100, 100);

        const map = new TextureLoader().load('img/polished_concrete_basecolor.jpg');
        map.wrapS = RepeatWrapping;
        map.wrapT = RepeatWrapping;
        map.repeat.set(16, 16);

        // const { fog } = scene;

        const material = new ReflectorMaterial({
            map,
            fog: this.fog,
            dithering: true
        });
        material.uniforms.tReflect = this.reflector.renderTargetUniform;
        material.uniforms.uMatrix = this.reflector.textureMatrixUniform;

        const mesh = new Mesh(geometry, material);
        mesh.position.y = 0;
        mesh.rotation.x = -Math.PI / 2;
        mesh.add(this.reflector);

        mesh.onBeforeRender = (renderer, scene, camera) => {
            // console.log(renderer, scene, camera)
            this.visible = false;
            this.reflector.update(renderer, scene, camera);
            this.visible = true;
        };

        this.add(mesh);
    }

    /**
     * Public methods
     */

    resize = (width, height) => {
        width = MathUtils.floorPowerOfTwo(width) / 2;
        height = 1024;

        this.reflector.setSize(width, height);
    };
}

export { Floor }