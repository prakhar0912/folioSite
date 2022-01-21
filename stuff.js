// , j = i(5313)
// , G = i.n(j)
// , H = {
//   unlit: "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n\n    uniform float uPass;\n\n    varying vec2 vUv;\n    varying vec3 vPos;\n\n    void main(){\n        vUv = aUvs;\n\n        mat4 viewMatrix = uVMatrix;\n\n        float reflectionScale = -((uPass * 2.) - 1.);\n        viewMatrix[1][0] *= reflectionScale;\n        viewMatrix[1][1] *= reflectionScale;\n        viewMatrix[1][2] *= reflectionScale;\n        viewMatrix[1][3] *= reflectionScale;\n\n        vPos = (uMMatrix * vec4(aPos, 1.0)).xyz;\n        gl_Position = uPMatrix * viewMatrix * uMMatrix * vec4(aPos, 1.0);\n\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    uniform sampler2D uTexture;\n    uniform float uPass;\n\n    varying vec2 vUv;\n    varying vec3 vPos;\n\n    void main() {   \n        vec4 t = texture2D( uTexture, vUv );\n        float alpha = mix(t.a, (1. - (smoothstep(-3., 3., vPos.y))), uPass);\n        gl_FragColor = vec4(t); \n        gl_FragColor.a *= alpha; \n    } \n        \n<% } %>",
//   post: "<% if (vert) { %>\n\n   precision highp float;\n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    varying vec2 vUv;\n\n    void main(void) {\n        vUv = aUvs;\n        gl_Position = vec4(aPos, 1.0);\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float;\n\n    uniform sampler2D uTexture;\n    varying vec2 vUv;\n\n    uniform vec2 uRez;\n    uniform vec2 uMouse;\n    uniform float uTime;\n\n    uniform float uVignetteStart;\n    uniform float uVignetteEnd;\n    uniform float uVignettePower;\n    uniform float uVignetteElipse;\n    uniform float uBlur;\n    uniform float uFocus;\n\n    const int LOD = 1,  // gaussian done on MIPmap at scale LOD\n          sLOD = 1;     // tile size = 2^LOD\n    const float sigma = float(BLUR_SAMPLES) * .25;\n    const int s = BLUR_SAMPLES/sLOD;\n\n    float gaussian(vec2 i) {\n        return exp( -.5* dot(i/=sigma,i) ) / ( 6.28 * sigma*sigma );\n    }\n\n    vec4 blur(sampler2D sp, vec2 U, vec2 scale) {\n        vec4 O = vec4(0);  \n        \n        for ( int i = 0; i < s*s; i++ ) {\n            vec2 d = vec2(int(mod(float(i), float(s))), i/s)*float(sLOD) - float(BLUR_SAMPLES)/2.;\n            O += gaussian(d) * texture2D( sp, U + scale * d );\n        }\n        \n        return O / O.a;\n    }\n\n    vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n        vec4 color = vec4(0.0);\n        vec2 off1 = vec2(1.411764705882353) * direction;\n        vec2 off2 = vec2(3.2941176470588234) * direction;\n        vec2 off3 = vec2(5.176470588235294) * direction;\n        color += texture2D(image, uv) * 0.1964825501511404;\n        color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;\n        color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;\n        color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;\n        color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;\n        color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;\n        color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;\n        return color;\n    }\n\n    void main() {\n\n        vec2 uv = vUv - 0.5;\n        uv.x *= uRez.x/uRez.y;\n        uv.x *= 1. - uVignetteElipse;\n        vec2 RadUv = vec2(0.,0.);    \n        RadUv.x = ((atan(uv.x,uv.y) * 0.15915494309189533576888376337251))+0.5;\n        RadUv.y = length(uv);\n        float vignette = smoothstep(uVignetteStart, uVignetteEnd, RadUv.y);\n\n        vignette = pow(vignette, uVignettePower);\n\n        // vec4 color = texture2D( uTexture, vUv);\n        // vec4 color = blur(uTexture, vUv, (1./uRez) * uBlur * vignette * float(BLUR_SCALE));\n        vec4 color = blur13(uTexture, vUv, uRez, vec2(vignette * sin(vUv.x * 6.28) * uBlur, cos(vUv.x * 6.28) * uBlur * vignette));\n        \n        float leftFade = mix(1., smoothstep(-.25, float(FADE_LIMIT), vUv.x), uFocus);\n\n        gl_FragColor = color * leftFade;\n\n        // gl_FragColor.rgb = vec3(vignette);\n        // gl_FragColor.a = 1.;\n\n    }\n\n<% } %>",
//   noise: "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    varying vec2 vUv;\n\n    void main(){\n        vUv = aUvs;\n        gl_Position = vec4(aPos, 1.0);\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    uniform sampler2D uTexture;\n    uniform float uTime;\n    uniform vec2 uRez;\n\n    uniform float uOpacity;\n    uniform float uDitherWidth;\n    uniform float uDitherSteps;\n    uniform float uSaturation;\n\n    varying vec2 vUv;\n\n    float Noise(vec2 n,float x){n+=x;return fract(sin(dot(n.xy,vec2(12.9898, 78.233)))*43758.5453)*2.0-1.0;}\n\n    // Step 1 in generation of the dither source texture.\n    float Step1(vec2 uv,float n){\n        float a=1.0,b=2.0,c=-12.0,t=1.0;   \n        return (1.0/(a*4.0+b*4.0-c))*(\n            Noise(uv+vec2(-1.0,-1.0)*t,n)*a+\n            Noise(uv+vec2( 0.0,-1.0)*t,n)*b+\n            Noise(uv+vec2( 1.0,-1.0)*t,n)*a+\n            Noise(uv+vec2(-1.0, 0.0)*t,n)*b+\n            Noise(uv+vec2( 0.0, 0.0)*t,n)*c+\n            Noise(uv+vec2( 1.0, 0.0)*t,n)*b+\n            Noise(uv+vec2(-1.0, 1.0)*t,n)*a+\n            Noise(uv+vec2( 0.0, 1.0)*t,n)*b+\n            Noise(uv+vec2( 1.0, 1.0)*t,n)*a+\n        0.0);\n    }\n        \n    // Step 2 in generation of the dither source texture.\n    float Step2(vec2 uv,float n){\n        float a=1.0,b=2.0,c=-2.0,t=1.0;   \n        return (4.0/(a*4.0+b*4.0-c))*(\n            Step1(uv+vec2(-1.0,-1.0)*t,n)*a+\n            Step1(uv+vec2( 0.0,-1.0)*t,n)*b+\n            Step1(uv+vec2( 1.0,-1.0)*t,n)*a+\n            Step1(uv+vec2(-1.0, 0.0)*t,n)*b+\n            Step1(uv+vec2( 0.0, 0.0)*t,n)*c+\n            Step1(uv+vec2( 1.0, 0.0)*t,n)*b+\n            Step1(uv+vec2(-1.0, 1.0)*t,n)*a+\n            Step1(uv+vec2( 0.0, 1.0)*t,n)*b+\n            Step1(uv+vec2( 1.0, 1.0)*t,n)*a+\n        0.0);\n    }\n\n    vec3 Step3T(vec2 uv){\n        float a=Step2(uv,0.07*(fract(uTime)+1.0));    \n        float b=Step2(uv,0.11*(fract(uTime)+1.0));    \n        float c=Step2(uv,0.13*(fract(uTime)+1.0));\n        return mix(vec3(a,b,c), vec3(a), 1. - uSaturation);\n    }\n\n    void main() {   \n        vec3 color = texture2D( uTexture, vUv ).rgb;\n\n        color = mix(\n            color,\n            floor( 0.5 + color * (uDitherSteps+uDitherWidth-1.0) + (-uDitherWidth*0.5) + Step3T(vUv * uRez) * (uDitherWidth)) * (1.0/(uDitherSteps-1.0)),\n            uOpacity\n        );\n\n        gl_FragColor = vec4(color, 1.); \n    } \n        \n<% } %>"
//   skin: "<% if (vert) { %>\n\n    precision highp float; \n    #define MAX_BONES 6\n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n    attribute vec4 aWeights_0;         // 4 weights per vertex\n    attribute vec4 aBoneNdx_0;         // 4 bone indices per vertex\n    attribute vec4 aWeights_1;         // 4 weights per vertex\n    attribute vec4 aBoneNdx_1;         // 4 bone indices per vertex\n\n    uniform mat4 uBones[MAX_BONES];   // 1 matrix per bone\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n\n    varying vec2 vUv;\n    varying vec3 vDebug;\n\n    void main(){\n        vUv = aUvs;\n        \n        vec4 skinedPos = vec4(0.);\n        for(int i=0; i < MAX_BONES; ++i){\n            if(i > 4) {\n                skinedPos += uBones[int(aBoneNdx_1[i - 4])] * vec4(aPos, 1.0) * aWeights_1[i - 4];\n            } else {\n                skinedPos += uBones[int(aBoneNdx_0[i])] * vec4(aPos, 1.0) * aWeights_0[i];\n            }\n        }\n\n        gl_Position = uPMatrix * uVMatrix * skinedPos;\n\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    varying vec2 vUv;\n\n    uniform sampler2D uTexture;\n\n    void main() {   \n        vec4 t = texture2D( uTexture, vUv );\n        gl_FragColor = vec4(t.xyz, 1.); \n        // gl_FragColor = vec4(1., 0., 0., 1.); \n    } \n        \n<% } %>",
//   ground: "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n\n    varying vec2 vUv;\n    varying vec4 vPos;\n\n    void main(){\n        vUv = aUvs;\n\n        vec4 wPos = uMMatrix * vec4(aPos, 1.0);\n        vPos = wPos;\n        gl_Position = uPMatrix * uVMatrix * wPos;\n\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    uniform sampler2D uTexture;\n    uniform sampler2D uReflectionMap;\n    uniform sampler2D uShadowMap;\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n    uniform vec2 uRez;\n\n    uniform float uReflectionPower;\n    uniform float uFadeBorder;\n    uniform float uBakedLightPower;\n    uniform float uCustomColorFactor;\n\n    uniform vec3 uColor0;\n    uniform vec3 uColor1;\n\n    varying vec2 vUv;\n    varying vec4 vPos;\n\n    <%= commons.blur %>\n    <%= commons.screenBlending %>\n\n    void main() {   \n\n        vec4 clipSpace = uPMatrix * (uVMatrix * vPos);\n        vec3 ndc = clipSpace.xyz / clipSpace.w;\n        vec2 ssUv = (ndc.xy * .5 + .5);\n\n        vec3 r = blur5(uReflectionMap, ssUv, uRez, vec2(2., -2.)).xyz;\n        vec4 t = texture2D( uTexture, vUv );\n        vec4 s = texture2D( uShadowMap, vUv );\n\n        float h = smoothstep(0., uFadeBorder, vUv.x) - smoothstep(1. - uFadeBorder, 1., vUv.x);\n        float v = smoothstep(0., uFadeBorder, vUv.y) - smoothstep(1. - uFadeBorder, 1., vUv.y);\n\n        vec2 uv = vUv - 0.5;\n        uv.x *= uRez.x/uRez.y;\n        vec2 RadUv = vec2(0.,0.);    \n        RadUv.x = ((atan(uv.x,uv.y) * 0.15915494309189533576888376337251))+0.5;\n        RadUv.y = length(uv);\n        float vg = 1. - smoothstep(0.1, 0.66, RadUv.y);\n        vec3 customColor = mix(uColor0, uColor1, t.z) * vg * .75;\n\n        t.xyz = mix(t.xyz, customColor, uCustomColorFactor);\n        vec3 color = t.xyz * uBakedLightPower * s.rgb;\n        color = blendScreen(color, r.rgb, uReflectionPower);\n\n        gl_FragColor.rgb = color; \n        gl_FragColor.a = h * v;\n\n    } \n        \n<% } %>",
//   lightMesh: "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n\n    uniform float uPass;\n\n    varying vec2 vUv;\n    varying vec3 vPos;\n\n    void main(){\n        vUv = aUvs;\n\n        mat4 viewMatrix = uVMatrix;\n        vPos = (uMMatrix * vec4(aPos, 1.0)).xyz;\n        gl_Position = uPMatrix * viewMatrix * uMMatrix * vec4(aPos, 1.0);\n\n    }\n\n<% } %>\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    uniform sampler2D uTexture;\n    uniform float uPass;\n\n    varying vec2 vUv;\n    varying vec3 vPos;\n\n    <%= commons.blur %>\n\n    void main() {   \n\n        vec2 uv = vUv;\n        uv.y = vUv.y * .9;\n        vec3 t = blur5(uTexture, uv, vec2(720., 480.), vec2(4., -4.)).xyz;\n        float alpha = pow(smoothstep(0., 1.5, vUv.y), 2.);\n\n        gl_FragColor.rgb = pow(t, vec3(2.)); \n        gl_FragColor.a = alpha * .3; \n\n        // gl_FragColor = vec4(vUv.y, 0., 0., 1.);\n    } \n        \n<% } %>",
//   screen: "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec3 aNormal;\n    attribute vec2 aUvs;\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n\n    uniform float uPass;\n\n    varying vec2 vUv;\n    varying vec3 vPos;\n    varying vec3 vNormal;\n\n    void main(){\n        vUv = aUvs;\n        vNormal = aNormal;\n\n        mat4 viewMatrix = uVMatrix;\n\n        float reflectionScale = -((uPass * 2.) - 1.);\n        viewMatrix[1][0] *= reflectionScale;\n        viewMatrix[1][1] *= reflectionScale;\n        viewMatrix[1][2] *= reflectionScale;\n        viewMatrix[1][3] *= reflectionScale;\n\n        vPos = (uMMatrix * vec4(aPos, 1.0)).xyz;\n        gl_Position = uPMatrix * viewMatrix * uMMatrix * vec4(aPos, 1.0);\n\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    uniform sampler2D uTexture;\n    uniform float uPass;\n\n    uniform vec2 uRez;\n    uniform float uVignetteStart;\n    uniform float uVignetteEnd;\n    uniform float uVignetteOpacity;\n    uniform float uVignettePower;\n    uniform float uInnerOpacity;\n\n    varying vec2 vUv;\n    varying vec3 vPos;\n    varying vec3 vNormal;\n\n    const float fadeBorder = 0.002;\n\n    void main() {   \n\n        vec2 uv = vUv - 0.5;\n        uv.x *= uRez.x/uRez.y;\n        vec2 RadUv = vec2(0.,0.);    \n        RadUv.x = ((atan(uv.x,uv.y) * 0.15915494309189533576888376337251))+0.5;\n        RadUv.y = length(uv);\n\n        float vignette = smoothstep(uVignetteStart, uVignetteEnd, RadUv.y) * uVignetteOpacity;\n        vignette = pow(vignette, uVignettePower);\n\n        float h = smoothstep(0., fadeBorder, vUv.x) - smoothstep(1. - fadeBorder, 1., vUv.x);\n        float v = smoothstep(0., fadeBorder, vUv.y) - smoothstep(1. - fadeBorder, 1., vUv.y);\n\n        vec4 t = texture2D( uTexture, vUv );\n        float alpha = mix(t.a, (1. - (smoothstep(-3., 3., vPos.y))), uPass);\n\n        gl_FragColor = vec4(t);\n\n        gl_FragColor.rgb *= 1. - vignette; \n        gl_FragColor.rgb = mix(gl_FragColor.rgb * uInnerOpacity, gl_FragColor.rgb, smoothstep(.33, .66, vNormal.x));\n        gl_FragColor.rgb *= h * v; \n\n        gl_FragColor.a *= alpha;\n\n\n\n    } \n        \n<% } %>",
//   background: "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    varying vec2 vUv;\n\n    void main(){\n        vUv = aUvs;\n        gl_Position = vec4(aPos, 1.0);\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    varying vec2 vUv;\n\n    uniform float uOpacity;\n    uniform vec3 uColor0;\n    uniform vec3 uColor1;\n\n    void main() {   \n\n\n        vec3 color = mix(uColor0, uColor1, vUv.x);\n        float alpha = smoothstep(0.3, 1. , vUv.y);\n\n        gl_FragColor.rgb = color; \n        gl_FragColor.a = uOpacity * alpha;\n\n    } \n        \n<% } %>",
//   commons: {
//       triplanar: "vec3 blendNormal(vec3 normal){\n    vec3 blending = abs(normal);\n    blending = normalize(max(blending, 0.00001));\n    blending /= vec3(blending.x + blending.y + blending.z);\n    return blending;\n}\n\nvec3 triplanarMapping (sampler2D texture, vec3 normal, vec3 position) {\n    vec3 normalBlend = blendNormal(normal);\n    vec3 xColor = texture2D(texture, position.yz).rgb;\n    vec3 yColor = texture2D(texture, position.xz).rgb;\n    vec3 zColor = texture2D(texture, position.xy).rgb;\n    return (xColor * normalBlend.x + yColor * normalBlend.y + zColor * normalBlend.z);\n}",
//       colorBurn: "float blendColorBurn(float base, float blend) {\n    return (blend==0.0)?blend:max((1.0-((1.0-base)/blend)),0.0);\n}\n\nvec3 blendColorBurn(vec3 base, vec3 blend) {\n    return vec3(blendColorBurn(base.r,blend.r),blendColorBurn(base.g,blend.g),blendColorBurn(base.b,blend.b));\n}",
//       rotation: "mat4 rotationMatrix(vec3 axis, float angle) {\n    axis = normalize(axis);\n    float s = sin(angle);\n    float c = cos(angle);\n    float oc = 1.0 - c;\n    \n    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n                0.0,                                0.0,                                0.0,                                1.0);\n}\n\nvec3 rotate(vec3 v, vec3 axis, float angle) {\n    mat4 m = rotationMatrix(axis, angle);\n    return (m * vec4(v, 1.0)).xyz;\n}",
//       blur: "\nvec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {\n  vec4 color = vec4(0.0);\n  vec2 off1 = vec2(1.3333333333333333) * direction;\n  color += texture2D(image, uv) * 0.29411764705882354;\n  color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;\n  color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;\n  return color; \n}\n",
//       normalBlending: "\nvec3 blendNormal(vec3 base, vec3 blend) {\n\treturn blend;\n}\n\nvec3 blendNormal(vec3 base, vec3 blend, float opacity) {\n\treturn (blendNormal(base, blend) * opacity + base * (1.0 - opacity));\n}",
//       screenBlending: "float blendScreen(float base, float blend) {\n\treturn 1.0-((1.0-base)*(1.0-blend));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend) {\n\treturn vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend, float opacity) {\n\treturn (blendScreen(base, blend) * opacity + base * (1.0 - opacity));\n}"
//   }
// };

let background = "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    varying vec2 vUv;\n\n    void main(){\n        vUv = aUvs;\n        gl_Position = vec4(aPos, 1.0);\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    varying vec2 vUv;\n\n    uniform float uOpacity;\n    uniform vec3 uColor0;\n    uniform vec3 uColor1;\n\n    void main() {   \n\n\n        vec3 color = mix(uColor0, uColor1, vUv.x);\n        float alpha = smoothstep(0.3, 1. , vUv.y);\n\n        gl_FragColor.rgb = color; \n        gl_FragColor.a = uOpacity * alpha;\n\n    } \n        \n<% } %>"
// console.log(background)
let noise = "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    varying vec2 vUv;\n\n    void main(){\n        vUv = aUvs;\n        gl_Position = vec4(aPos, 1.0);\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    uniform sampler2D uTexture;\n    uniform float uTime;\n    uniform vec2 uRez;\n\n    uniform float uOpacity;\n    uniform float uDitherWidth;\n    uniform float uDitherSteps;\n    uniform float uSaturation;\n\n    varying vec2 vUv;\n\n    float Noise(vec2 n,float x){n+=x;return fract(sin(dot(n.xy,vec2(12.9898, 78.233)))*43758.5453)*2.0-1.0;}\n\n    // Step 1 in generation of the dither source texture.\n    float Step1(vec2 uv,float n){\n        float a=1.0,b=2.0,c=-12.0,t=1.0;   \n        return (1.0/(a*4.0+b*4.0-c))*(\n            Noise(uv+vec2(-1.0,-1.0)*t,n)*a+\n            Noise(uv+vec2( 0.0,-1.0)*t,n)*b+\n            Noise(uv+vec2( 1.0,-1.0)*t,n)*a+\n            Noise(uv+vec2(-1.0, 0.0)*t,n)*b+\n            Noise(uv+vec2( 0.0, 0.0)*t,n)*c+\n            Noise(uv+vec2( 1.0, 0.0)*t,n)*b+\n            Noise(uv+vec2(-1.0, 1.0)*t,n)*a+\n            Noise(uv+vec2( 0.0, 1.0)*t,n)*b+\n            Noise(uv+vec2( 1.0, 1.0)*t,n)*a+\n        0.0);\n    }\n        \n    // Step 2 in generation of the dither source texture.\n    float Step2(vec2 uv,float n){\n        float a=1.0,b=2.0,c=-2.0,t=1.0;   \n        return (4.0/(a*4.0+b*4.0-c))*(\n            Step1(uv+vec2(-1.0,-1.0)*t,n)*a+\n            Step1(uv+vec2( 0.0,-1.0)*t,n)*b+\n            Step1(uv+vec2( 1.0,-1.0)*t,n)*a+\n            Step1(uv+vec2(-1.0, 0.0)*t,n)*b+\n            Step1(uv+vec2( 0.0, 0.0)*t,n)*c+\n            Step1(uv+vec2( 1.0, 0.0)*t,n)*b+\n            Step1(uv+vec2(-1.0, 1.0)*t,n)*a+\n            Step1(uv+vec2( 0.0, 1.0)*t,n)*b+\n            Step1(uv+vec2( 1.0, 1.0)*t,n)*a+\n        0.0);\n    }\n\n    vec3 Step3T(vec2 uv){\n        float a=Step2(uv,0.07*(fract(uTime)+1.0));    \n        float b=Step2(uv,0.11*(fract(uTime)+1.0));    \n        float c=Step2(uv,0.13*(fract(uTime)+1.0));\n        return mix(vec3(a,b,c), vec3(a), 1. - uSaturation);\n    }\n\n    void main() {   \n        vec3 color = texture2D( uTexture, vUv ).rgb;\n\n        color = mix(\n            color,\n            floor( 0.5 + color * (uDitherSteps+uDitherWidth-1.0) + (-uDitherWidth*0.5) + Step3T(vUv * uRez) * (uDitherWidth)) * (1.0/(uDitherSteps-1.0)),\n            uOpacity\n        );\n\n        gl_FragColor = vec4(color, 1.); \n    } \n        \n<% } %>"
// console.log(noise)

let ground = "<% if (vert) { %>\n  \n    precision highp float; \n\n    attribute vec3 aPos;\n    attribute vec2 aUvs;\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n\n    varying vec2 vUv;\n    varying vec4 vPos;\n\n    void main(){\n        vUv = aUvs;\n\n        vec4 wPos = uMMatrix * vec4(aPos, 1.0);\n        vPos = wPos;\n        gl_Position = uPMatrix * uVMatrix * wPos;\n\n    }\n\n<% } %>\n\n\n\n<% if (frag) { %>\n\n    precision highp float; \n\n    uniform sampler2D uTexture;\n    uniform sampler2D uReflectionMap;\n    uniform sampler2D uShadowMap;\n\n    uniform mat4 uPMatrix;\n    uniform mat4 uMMatrix;\n    uniform mat4 uVMatrix;\n    uniform vec2 uRez;\n\n    uniform float uReflectionPower;\n    uniform float uFadeBorder;\n    uniform float uBakedLightPower;\n    uniform float uCustomColorFactor;\n\n    uniform vec3 uColor0;\n    uniform vec3 uColor1;\n\n    varying vec2 vUv;\n    varying vec4 vPos;\n\n    <%= commons.blur %>\n    <%= commons.screenBlending %>\n\n    void main() {   \n\n        vec4 clipSpace = uPMatrix * (uVMatrix * vPos);\n        vec3 ndc = clipSpace.xyz / clipSpace.w;\n        vec2 ssUv = (ndc.xy * .5 + .5);\n\n        vec3 r = blur5(uReflectionMap, ssUv, uRez, vec2(2., -2.)).xyz;\n        vec4 t = texture2D( uTexture, vUv );\n        vec4 s = texture2D( uShadowMap, vUv );\n\n        float h = smoothstep(0., uFadeBorder, vUv.x) - smoothstep(1. - uFadeBorder, 1., vUv.x);\n        float v = smoothstep(0., uFadeBorder, vUv.y) - smoothstep(1. - uFadeBorder, 1., vUv.y);\n\n        vec2 uv = vUv - 0.5;\n        uv.x *= uRez.x/uRez.y;\n        vec2 RadUv = vec2(0.,0.);    \n        RadUv.x = ((atan(uv.x,uv.y) * 0.15915494309189533576888376337251))+0.5;\n        RadUv.y = length(uv);\n        float vg = 1. - smoothstep(0.1, 0.66, RadUv.y);\n        vec3 customColor = mix(uColor0, uColor1, t.z) * vg * .75;\n\n        t.xyz = mix(t.xyz, customColor, uCustomColorFactor);\n        vec3 color = t.xyz * uBakedLightPower * s.rgb;\n        color = blendScreen(color, r.rgb, uReflectionPower);\n\n        gl_FragColor.rgb = color; \n        gl_FragColor.a = h * v;\n\n    } \n        \n<% } %>"
// console.log(ground)

let screenBlending = "float blendScreen(float base, float blend) {\n\treturn 1.0-((1.0-base)*(1.0-blend));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend) {\n\treturn vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));\n}\n\nvec3 blendScreen(vec3 base, vec3 blend, float opacity) {\n\treturn (blendScreen(base, blend) * opacity + base * (1.0 - opacity));\n}"
let screenBlendingb = `
    float blendScreen(float base, float blend) {
        return 1.0-((1.0-base)*(1.0-blend));
    }

    vec3 blendScreen(vec3 base, vec3 blend) {
        return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
    }

    vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
        return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
    }
`

let grounda = `
<% if (vert) { %>
  
    precision highp float; 

    attribute vec3 aPos;
    attribute vec2 aUvs;

    uniform mat4 uPMatrix;
    uniform mat4 uMMatrix;
    uniform mat4 uVMatrix;

    varying vec2 vUv;
    varying vec4 vPos;

    void main(){
        vUv = aUvs;

        vec4 wPos = uMMatrix * vec4(aPos, 1.0);
        vPos = wPos;
        gl_Position = uPMatrix * uVMatrix * wPos;

    }

<% } %>



<% if (frag) { %>

    precision highp float; 

    uniform sampler2D uTexture;
    uniform sampler2D uReflectionMap;
    uniform sampler2D uShadowMap;

    uniform mat4 uPMatrix;
    uniform mat4 uMMatrix;
    uniform mat4 uVMatrix;
    uniform vec2 uRez;

    uniform float uReflectionPower;
    uniform float uFadeBorder;
    uniform float uBakedLightPower;
    uniform float uCustomColorFactor;

    uniform vec3 uColor0;
    uniform vec3 uColor1;

    varying vec2 vUv;
    varying vec4 vPos;

    <%= commons.blur %>
    <%= commons.screenBlending %>

    void main() {   

        vec4 clipSpace = uPMatrix * (uVMatrix * vPos);
        vec3 ndc = clipSpace.xyz / clipSpace.w;
        vec2 ssUv = (ndc.xy * .5 + .5);

        vec3 r = blur5(uReflectionMap, ssUv, uRez, vec2(2., -2.)).xyz;
        vec4 t = texture2D( uTexture, vUv );
        vec4 s = texture2D( uShadowMap, vUv );

        float h = smoothstep(0., uFadeBorder, vUv.x) - smoothstep(1. - uFadeBorder, 1., vUv.x);
        float v = smoothstep(0., uFadeBorder, vUv.y) - smoothstep(1. - uFadeBorder, 1., vUv.y);

        vec2 uv = vUv - 0.5;
        uv.x *= uRez.x/uRez.y;
        vec2 RadUv = vec2(0.,0.);    
        RadUv.x = ((atan(uv.x,uv.y) * 0.15915494309189533576888376337251))+0.5;
        RadUv.y = length(uv);
        float vg = 1. - smoothstep(0.1, 0.66, RadUv.y);
        vec3 customColor = mix(uColor0, uColor1, t.z) * vg * .75;

        t.xyz = mix(t.xyz, customColor, uCustomColorFactor);
        vec3 color = t.xyz * uBakedLightPower * s.rgb;
        color = blendScreen(color, r.rgb, uReflectionPower);

        gl_FragColor.rgb = color; 
        gl_FragColor.a = h * v;

    } 
        
<% } %>

`




let a = `
<% if (vert) { %>
  
    precision highp float; 

    attribute vec3 aPos;
    attribute vec2 aUvs;

    varying vec2 vUv;

    void main(){
        vUv = aUvs;
        gl_Position = vec4(aPos, 1.0);
    }

<% } %>



<% if (frag) { %>

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
        vec3 color = texture2D( uTexture, vUv ).rgb;

        color = mix(
            color,
            floor( 0.5 + color * (uDitherSteps+uDitherWidth-1.0) + (-uDitherWidth*0.5) + Step3T(vUv * uRez) * (uDitherWidth)) * (1.0/(uDitherSteps-1.0)),
            uOpacity
        );

        gl_FragColor = vec4(color, 1.); 
    } 
        
<% } %>
`
