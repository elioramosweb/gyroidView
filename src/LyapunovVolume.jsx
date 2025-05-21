import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls,folder } from 'leva'

const vertexShader = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = `

  #define  NMAX        5000
  #define  MAX_PATTERN 32

  uniform vec3 uCameraPosition;

  uniform  int  uIterMax;
  uniform  int  uPalette;

  uniform float uZoom;
  uniform float uDisplaceX;
  uniform float uDisplaceY;
  uniform float uDisplaceZ;
  uniform float uLypMin;
  uniform float uLypMax;
  uniform float uTime;
  uniform float uTMax;
  uniform float uTStep;
  uniform int uSteps;
  uniform float uAlphaMultiplier;
  uniform  float uBlack;
  uniform  float uWhite;

  uniform float uArray[MAX_PATTERN];
  uniform int   uPatternLength;

  varying vec3 vWorldPosition;

    vec3 rainbowPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    float r = 0.5 + 0.5 * cos(6.2831 * (t + 0.0));
    float g = 0.5 + 0.5 * cos(6.2831 * (t + 0.33));
    float b = 0.5 + 0.5 * cos(6.2831 * (t + 0.66));
    return vec3(r, g, b);
  }

  vec3 hotPalette(float t) {
    float r = smoothstep(0.0, 0.5, t); 
    float g = smoothstep(0.25, 0.75, t); 
    float b = smoothstep(0.5, 1.0, t);
    float intensity = mix(0.5, 1.0, t);
    return vec3(r * intensity, g * intensity, b * intensity);
  }

  vec3 turboPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
      0.5 + 0.5 * sin(6.2831 * (t + 0.0)),
      0.5 + 0.5 * sin(6.2831 * (t + 0.15)),
      0.5 + 0.5 * sin(6.2831 * (t + 0.3))
    );
  }

  vec3 viridisPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
      0.267 + 0.643*t - 0.379*t*t,
      0.004 + 1.370*t - 1.689*t*t,
      0.329 + 0.861*t - 0.897*t*t
    );
  }

  vec3 infernoPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    float r = clamp(1.5 * t + 0.05 * sin(20.0 * t), 0.0, 1.0);
    float g = pow(t, 0.5);
    float b = 1.0 - t;
    return vec3(r * 0.9, g * 0.6, b * 0.8);
  }

  vec3 coolwarmPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
      t,
      0.5 * sin(3.1415 * t),
      1.0 - t
    );
  }

  vec3 pastelPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
      0.8 + 0.2 * sin(6.2831 * (t + 0.1)),
      0.7 + 0.3 * sin(6.2831 * (t + 0.4)),
      0.6 + 0.4 * sin(6.2831 * (t + 0.7))
    );
  }

  vec3 getPaletteColor(float t) {
    if (uPalette == 0) return rainbowPalette(t);
    else if (uPalette == 1) return hotPalette(t);
    else if (uPalette == 2) return turboPalette(t);
    else if (uPalette == 3) return viridisPalette(t);
    else if (uPalette == 4) return infernoPalette(t);
    else if (uPalette == 5) return coolwarmPalette(t);
    else return pastelPalette(t);
  }

  // float lyapunov(vec3 coord) {
  //   float x = 0.5;
  //   float sum = 0.0;
  //   for (int i = 0; i < NMAX; i++) {
  //     if (i > uIterMax)
  //     {
  //       break;
  //     }
  //     int pos = int(mod(float(i), uArrayLength));
  //     float r = pos < 2 ? coord.x : (pos < 4 ? coord.y : coord.z);
  //     x = r * x * (1.0 - x);
  //     sum += log(abs(r - 2.0 * r * x));
  //   }
  //   return sum /float(uIterMax);
  // }

    float lyapunov3D(vec3 coord) {
    float x   = 0.5;
    float sum = 0.0;
    for (int i = 0; i < NMAX; i++) {
      if (i >= uIterMax) break;
      int idx = int(mod(float(i), float(uPatternLength)));
      int axis = int(uArray[idx]);
      float r = (axis == 0) ? coord.x :
                (axis == 1) ? coord.y :
                              coord.z;
      x   = r * x * (1.0 - x);
      sum += log(abs(r - 2.0 * r * x));
    }
    return sum / float(uIterMax);
  }


  void main() {
    vec3 rayOrigin = uCameraPosition;
    vec3 rayDir = normalize(vWorldPosition - rayOrigin);

    vec3 invDir = 1.0 / rayDir;
    vec3 tMin = (vec3(-1.0) - rayOrigin) * invDir;
    vec3 tMax = (vec3( 1.0) - rayOrigin) * invDir;

    vec3 t1 = min(tMin, tMax);
    vec3 t2 = max(tMin, tMax);

    float tEnter = max(max(t1.x, t1.y), t1.z);
    float tExit  = min(min(t2.x, t2.y), t2.z);

    if (tExit < 0.0 || tEnter > tExit) discard;

    float t = max(tEnter, 0.0);
    t = min(t, uTMax);

    float totalAlpha = 0.0;
    vec3 colorSum = vec3(0.0);

   
    for (int i = 0; i < 500; i++) 
    {
        if (i >= uSteps) break;
        if (t > min(tExit, uTMax)) break;

        // Punto de muestreo
        vec3 p      = rayOrigin + t * rayDir;
        vec3 localP = (p + vec3(uDisplaceX, uDisplaceY, uDisplaceZ)) * uZoom;

        // tu exponente + paleta
        float v        = smoothstep(uLypMin, uLypMax, lyapunov3D(localP));
        vec3  color    = getPaletteColor(v);
        float alphaSmp = uAlphaMultiplier * v;

        // Calcula distancia a blanco/negro en **este color**
        float dW = distance(color, vec3(1.0));
        float dB = distance(color, vec3(0.0));

        // Si cae dentro del rango “filtrado”, fuerza alphaSmp a 0 → muestra transparente
        if (dW < uWhite || dB < uBlack) {
            alphaSmp = 0.0;
        }

        // Ahora sí acumula front-to-back  
        colorSum += (1.0 - totalAlpha) * color * alphaSmp;
        totalAlpha += (1.0 - totalAlpha) * alphaSmp;

        if (totalAlpha > 0.95) break;
        t += uTStep;
     }


    gl_FragColor = vec4(colorSum, totalAlpha);
  }
`

export default function LyapunovVolume() {
  const shaderRef = useRef()
  const meshRef = useRef()

  const {
  
    uZoom,
    uDisplaceX,
    uDisplaceY,
    uDisplaceZ,

    uLypMin,
    uLypMax,

   
    uTMax,
    uTStep,
    uAlphaMultiplier,

  
    uIterMax,
    uSteps,

  
    uBlack,
    uWhite,
    palette,
    pattern
  } = useControls({
    'Transformación espacial': folder({
      uZoom:      { value: 1.48, min: 0.1, max: 10,   step: 0.001 },
      uDisplaceX: { value: 0.55, min: -10, max: 20,   step: 0.001 },
      uDisplaceY: { value: 1.90, min: -10, max: 20,   step: 0.001 },
      uDisplaceZ: { value: 1.90, min: -10, max: 20,   step: 0.001 },
    }),
    'Rango de Lyapunov': folder({
      uLypMin: { value: -1, min: -5, max: 5, step: 0.001 },
      uLypMax: { value:  1, min: -5, max: 5, step: 0.001 },
    }),
    'Parámetros del Ray-Marching': folder({
      uTMax:            { value: 20,   min: 1,    max: 100,  step: 0.1   },
      uTStep:           { value: 0.01, min: 0.001,max: 0.05, step: 0.001 },
      uAlphaMultiplier: { value: 0.5,  min: 0.001,max: 0.5,  step: 0.001 },
    }),
    'Iteraciones': folder({
      uIterMax: { value: 100, min: 100, max: 5000, step: 10  },
      uSteps:   { value: 500, min: 10,  max: 1000, step: 10  },
    }),
    'Color / Paleta': folder({
      uBlack:   { value: 0.0, min: 0.0, max: 1.0, step: 0.001 },
      uWhite:   { value: 0.0, min: 0.0, max: 1.0, step: 0.001 },
      palette: {
        options: {
          Rainbow:  0,
          Hot:      1,
          Turbo:    2,
          Viridis:  3,
          Inferno:  4,
          CoolWarm: 5,
          Pastel:   6
        },
        value: 2
      },
      pattern: { value: 'AAABBCC' }
    })
  })


  const uniforms = useMemo(() => ({
    uCameraPosition:   { value: new THREE.Vector3() },
    uZoom:             { value: uZoom },
    uDisplaceX:        { value: uDisplaceX },
    uDisplaceY:        { value: uDisplaceY },
    uDisplaceZ:        { value: uDisplaceZ },
    uLypMin:           { value: uLypMin },
    uLypMax:           { value: uLypMax },
    uTime:             { value: 0 },
    uTMax:             { value: uTMax },
    uTStep:            { value: uTStep },
    uSteps:            { value: uSteps },
    uAlphaMultiplier:  { value: uAlphaMultiplier },
    uWhite:            { value: uWhite},
    uBlack:            { value: uBlack},
    uIterMax:          { value: uIterMax},
    uPalette:          { value: palette },
    uArray:            { value: new Array(32).fill(0.0) },
    uPatternLength:    { value: pattern.length },
  }), [])



useFrame(({ clock, camera }) => {
    if (!shaderRef.current || !meshRef.current) return
    const localCamPos = meshRef.current.worldToLocal(camera.position.clone())
    const u = shaderRef.current.uniforms
    u.uTime.value = clock.getElapsedTime()
    u.uCameraPosition.value.copy(localCamPos)
    u.uZoom.value = uZoom
    u.uDisplaceX.value = uDisplaceX
    u.uDisplaceY.value = uDisplaceY
    u.uDisplaceZ.value = uDisplaceZ
    u.uLypMin.value = uLypMin
    u.uLypMax.value = uLypMax
    u.uTMax.value = uTMax
    u.uTStep.value = uTStep
    u.uSteps.value = uSteps
    u.uAlphaMultiplier.value = uAlphaMultiplier
    u.uWhite.value = uWhite
    u.uBlack.value = uBlack
    u.uIterMax.value =  uIterMax
    u.uPalette.value = palette

    const mapping = { A: 0, B: 1, C: 2 }

    const patternArray = pattern
    .toUpperCase()                      
    .split('')                          
    .map(c => mapping[c] ?? 0)  

    for (let i = 0; i < 32; i++) {
      u.uArray.value[i] = patternArray[i] ?? 0.0 
    }

    u.uPatternLength.value = patternArray.length

  })

  return (
    <>
      <color attach="background" args={[0, 0, 0]} />
      <mesh ref={meshRef}>
        <boxGeometry args={[5,5,5,100,100,100]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}