var J = class extends X {
    constructor(e, t) {
        super(e),
            this.gl = e.gl,
            this.scene = e,
            this.geom = t,
            this.node = new R,
            this.shader = new W(H.ground),
            this.visible = !0,
            this.hasNormal = !1,
            this.initBuffer({
                vertices: t.vertices,
                uvs: t.uvs,
                indices: t.indices
            }),
            this.initProgram(this.shader.vert, this.shader.frag),
            this.initVao(),
            this.initMatrix(),
            this.createUniforms(),
            this.opacity = 1,
            this.depthTest = !0,
            this.rt = new q(this.scene, .3, "rgb", null, !0),
            this.rt.clearColor = [0, 0, 0, 1],
            this.node.position = m.d9(this.geom.translate),
            this.node.scale = m.d9(this.geom.scale),
            this.node.rotation = m.d9(this.geom.rotation),
            this.proxies = [],
            this.config = {
                reflections: {
                    value: .9,
                    range: [0, 1]
                },
                bakedLightPower: {
                    value: .9,
                    range: [0, 1]
                },
                fadeBorder: {
                    value: .3,
                    range: [0, 1]
                },
                bgColorFactor: {
                    value: 0,
                    range: [0, 1]
                }
            },
            M.addConfig(this.config, "Ground")
    }
    createUniforms() {
        this.createUniform("uTexture", "texture"),
            this.createUniform("uReflectionMap", "texture"),
            this.createUniform("uShadowMap", "texture"),
            this.createUniform("uRez", "float2"),
            this.createUniform("uOpacity"),
            this.createUniform("uPass"),
            this.createUniform("uReflectionPower"),
            this.createUniform("uFadeBorder"),
            this.createUniform("uBakedLightPower"),
            this.createUniform("uColor0", "float3"),
            this.createUniform("uColor1", "float3"),
            this.createUniform("uCustomColorFactor")
    }
    applyState() {
        let e = this.gl;
        this.scene.applyDefaultState(),
            e.depthMask(!1)
    }
    preRender() { }
    render(e = 0) {
        if (!this.visible)
            return;
        this.preRender();
        let t = this.gl;
        t.useProgram(this.program),
            t.bindVertexArray(this.vao),
            this.applyState(),
            this.bindUniform("uOpacity", this.opacity),
            this.bindUniform("uPass", e),
            this.bindUniform("uReflectionPower", this.config.reflections.value),
            this.bindUniform("uFadeBorder", this.config.fadeBorder.value),
            this.bindUniform("uBakedLightPower", this.config.bakedLightPower.value),
            this.bindUniform("uCustomColorFactor", this.config.bgColorFactor.value),
            this.bindUniform("uRez", [this.scene.width, this.scene.height]),
            this.bindUniform("uColor0", new Q(this.scene.background.config.color0.value).toRgbNorm()),
            this.bindUniform("uColor1", new Q(this.scene.background.config.color1.value).toRgbNorm()),
            t.activeTexture(t.TEXTURE0),
            t.bindTexture(t.TEXTURE_2D, this.scene.textureLoader.getTexture("Ground")),
            this.bindUniform("uTexture", 0),
            t.activeTexture(t.TEXTURE1),
            this.rt.bind(),
            this.bindUniform("uReflectionMap", 1),
            t.activeTexture(t.TEXTURE2),
            t.bindTexture(t.TEXTURE_2D, this.scene.textureLoader.getTexture("GroundShadow")),
            this.bindUniform("uShadowMap", 2),
            this.bindMatrixUniforms(this.scene.camera),
            t.drawElements(t.TRIANGLES, this.geom.indices.length, t.UNSIGNED_SHORT, 0),
            t.bindVertexArray(null)
    }
}
    ;
var $ = class extends X {
    constructor(e, t, i, s) {
        super(e),
            this.gl = e.gl,
            this.scene = e,
            this.geom = t,
            this.texture = s,
            this.node = new R,
            this.shader = new W(H[i]),
            this.visible = !0,
            this.initBuffer({
                vertices: t.vertices,
                normal: t.normal,
                uvs: t.uvs,
                indices: t.indices
            }),
            this.initProgram(this.shader.vert, this.shader.frag),
            this.initVao(),
            this.initMatrix(),
            this.createUniforms(),
            this.opacity = 1,
            this.depthTest = !0,
            this.node.position = m.d9(this.geom.translate),
            this.node.initialPosition = m.d9(this.geom.translate),
            this.node.scale = m.d9(this.geom.scale),
            this.node.rotation = m.d9(this.geom.rotation),
            this.node.initialRotation = m.d9(this.geom.rotation),
            this.proxies = [],
            this.config = {
                vignetteStart: {
                    value: .4,
                    range: [0, 2]
                },
                vignetteEnd: {
                    value: .9,
                    range: [0, 2]
                },
                vignettePower: {
                    value: .9,
                    range: [0, 4]
                },
                vignetteOpacity: {
                    value: .3,
                    range: [0, 1]
                },
                innerOpacity: {
                    value: .6,
                    range: [0, 1]
                }
            },
            M.addConfig(this.config, "Screen")
    }
    createUniforms() {
        this.createUniform("uTexture", "texture"),
            this.createUniform("uOpacity"),
            this.createUniform("uPass"),
            this.createUniform("uRez", "float2"),
            this.createUniform("uVignetteStart"),
            this.createUniform("uVignetteEnd"),
            this.createUniform("uVignetteOpacity"),
            this.createUniform("uVignettePower"),
            this.createUniform("uInnerOpacity")
    }
    applyState() {
        let e = this.gl;
        this.scene.applyDefaultState(),
            0 == this.depthTest && e.depthMask(!1),
            e.enable(e.CULL_FACE)
    }
    preRender() { }
    render(e = 0) {
        if (!this.visible)
            return;
        this.preRender();
        let t = this.gl;
        if (t.useProgram(this.program),
            t.bindVertexArray(this.vao),
            this.applyState(),
            this.bindUniform("uOpacity", this.opacity),
            this.bindUniform("uPass", e),
            this.bindUniform("uRez", [this.scene.width, this.scene.height]),
            this.bindUniform("uVignetteStart", this.config.vignetteStart.value),
            this.bindUniform("uVignetteEnd", this.config.vignetteEnd.value),
            this.bindUniform("uVignetteOpacity", this.config.vignetteOpacity.value),
            this.bindUniform("uVignettePower", this.config.vignettePower.value),
            this.bindUniform("uInnerOpacity", this.config.innerOpacity.value),
            this.proxies.length > 0) {
            this.bindUniform("uPMatrix", this.scene.camera.getProjectionMatrix()),
                this.bindUniform("uVMatrix", this.scene.camera.getViewMatrix());
            for (let e = 0; e < this.proxies.length; e++) {
                t.activeTexture(t.TEXTURE0);
                let i = this.scene.projects[this.scene.activeProjects[e]].textureName;
                this.scene.videoTextures[i] ? t.bindTexture(t.TEXTURE_2D, this.scene.videoTextures[i].getTexture()) : t.bindTexture(t.TEXTURE_2D, this.scene.textureLoader.getTexture(i)),
                    this.bindUniform("uTexture", 0),
                    this.bindUniform("uMMatrix", this.proxies[e].getMatrix()),
                    t.drawElements(t.TRIANGLES, this.geom.indices.length, t.UNSIGNED_SHORT, 0)
            }
        } else
            this.bindMatrixUniforms(this.scene.camera),
                t.drawElements(t.TRIANGLES, this.geom.indices.length, t.UNSIGNED_SHORT, 0);
        t.bindVertexArray(null)
    }
}
    ;
var K = {
    vertices: [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0],
    uvs: [0, 0, 0, 1, 1, 1, 1, 0],
    indices: [0, 1, 2, 0, 2, 3]
}
    , Z = i(5317);
var ee = class extends X {
    constructor(e, t) {
        super(e),
            this.gl = e.gl,
            this.scene = e,
            this.shader = new W(H.background),
            this.hasNormal = !1,
            this.initBuffer({
                vertices: K.vertices,
                uvs: K.uvs,
                indices: K.indices
            }),
            this.initProgram(this.shader.vert, this.shader.frag),
            this.initVao(),
            this.initMatrix(),
            this.createUniforms(),
            this.config = {
                opacity: {
                    value: .5,
                    range: [0, 1]
                },
                defaultColor0: {
                    value: "#630d8c",
                    guiType: "color"
                },
                defaultColor1: {
                    value: "#990b75",
                    guiType: "color"
                },
                color0: {
                    value: "#630d8c",
                    guiType: "color"
                },
                color1: {
                    value: "#990b75",
                    guiType: "color"
                }
            },
            M.addConfig(this.config, "Background"),
            this.scene.on("focusOnProject", (e => {
                this.scene.animations.isFocus && !this.scene.animations.isTransitionning && this.changeColor(e.backgroundColor0, e.backgroundColor1)
            }
            )),
            this.tween = null,
            this.opacity = 1
    }
    createUniforms() {
        this.createUniform("uColor0", "float3"),
            this.createUniform("uColor1", "float3"),
            this.createUniform("uOpacity")
    }
    applyState() {
        const { gl: e } = this;
        this.scene.applyDefaultState(),
            e.disable(e.CULL_FACE),
            e.disable(e.DEPTH_TEST),
            e.depthMask(!1)
    }
    changeColor(e, t) {
        this.tween && this.tween.kill();
        const i = new Q(this.config.color0.value).toRgb()
            , s = new Q(this.config.color1.value).toRgb();
        e = new Q(e).toRgb(),
            t = new Q(t).toRgb();
        const n = {
            r0: i[0],
            g0: i[1],
            b0: i[2],
            r1: s[0],
            g1: s[1],
            b1: s[2]
        };
        this.tween = Z.Q3.to(n, {
            duration: 1,
            ease: "power1.inOut",
            r0: e[0],
            g0: e[1],
            b0: e[2],
            r1: t[0],
            g1: t[1],
            b1: t[2],
            onUpdate: () => {
                const e = new Q;
                this.config.color0.value = e.rgbToHex(n.r0, n.g0, n.b0),
                    this.config.color1.value = e.rgbToHex(n.r1, n.g1, n.b1)
            }
        })
    }
    preRender() { }
    render() {
        this.preRender();
        const { gl: e } = this;
        e.useProgram(this.program),
            e.bindVertexArray(this.vao),
            this.applyState(),
            this.bindUniform("uOpacity", this.config.opacity.value),
            this.bindUniform("uColor0", new Q(this.config.color0.value).toRgbNorm()),
            this.bindUniform("uColor1", new Q(this.config.color1.value).toRgbNorm()),
            e.drawElements(e.TRIANGLES, K.indices.length, e.UNSIGNED_SHORT, 0),
            e.bindVertexArray(null)
    }
}