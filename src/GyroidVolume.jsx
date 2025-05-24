import { useRef, useMemo,useState,useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls,folder } from 'leva'
import { Html } from '@react-three/drei'

const vertexShader = `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = `

  #define NMAX        5000


  uniform vec3 uCameraPosition;

  uniform int  uIterMax;
  uniform int  uPalette;


  uniform float uZoom;
  uniform float uDisplaceX;
  uniform float uDisplaceY;
  uniform float uDisplaceZ;

  uniform float uGyMin;
  uniform float uGyMax;

  uniform float uA;
  uniform float uB;
  uniform float uC;

  uniform float uPhix;
  uniform float uPhiy;
  uniform float uPhiz;

  
  uniform float uTime;
  uniform float uTMax;
  uniform float uTStep;
  uniform int   uSteps;
  
  uniform float uAlphaMultiplier;
  uniform float uBlack;
  uniform float uWhite;
  uniform float uNoiseLevel;
  uniform float uNoiseScale;
  uniform float uSpeed;

  uniform float uAmbientStrength; 
  uniform vec3 uLightDir;       
  uniform float uDiffuseStrength; 


  varying vec3 vWorldPosition;

// paletas de colores 

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

  vec3 grayPalette(float t) {
      t = clamp(t, 0.0, 1.0);
      return vec3(t);
  }

  vec3 getPaletteColor(float t) {
    if (uPalette == 0) return rainbowPalette(t);
    else if (uPalette == 1) return hotPalette(t);
    else if (uPalette == 2) return turboPalette(t);
    else if (uPalette == 3) return viridisPalette(t);
    else if (uPalette == 4) return infernoPalette(t);
    else if (uPalette == 5) return coolwarmPalette(t);
    else if (uPalette == 6) return pastelPalette(t);
    else return pastelPalette(t);
  }

//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2024-11-07
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/stegu/webgl-noise
//

  vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+10.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise
  float cnoise(vec3 P)
  {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));

    float n000 = norm0.x * dot(g000, Pf0);
    float n010 = norm0.y * dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n100 = norm0.z * dot(g100, vec3(Pf1.x, Pf0.yz));
    float n110 = norm0.w * dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = norm1.x * dot(g001, vec3(Pf0.xy, Pf1.z));
    float n011 = norm1.y * dot(g011, vec3(Pf0.x, Pf1.yz));
    float n101 = norm1.z * dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n111 = norm1.w * dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

  // Classic Perlin noise, periodic variant

  float pnoise(vec3 P, vec3 rep)
  {
    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));

    float n000 = norm0.x * dot(g000, Pf0);
    float n010 = norm0.y * dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n100 = norm0.z * dot(g100, vec3(Pf1.x, Pf0.yz));
    float n110 = norm0.w * dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = norm1.x * dot(g001, vec3(Pf0.xy, Pf1.z));
    float n011 = norm1.y * dot(g011, vec3(Pf0.x, Pf1.yz));
    float n101 = norm1.z * dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n111 = norm1.w * dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    return 2.2 * n_xyz;
  }

// función general para generar gyroide
// https://en.wikipedia.org/wiki/Gyroid

  float gyroid(vec3 coord)
  {
     float x = coord.x;
     float y = coord.y;
     float z = coord.z;
     float n = uNoiseLevel*cnoise(uNoiseScale*coord + uSpeed*uTime);
     float term1 = sin(uA*x + uPhix + n)*cos(uA*y + uPhix + n);
     float term2 = sin(uA*y + uPhix + n)*cos(uA*z + uPhix + n);
     float term3 = sin(uA*z + uPhix + n)*cos(uA*x + uPhix + n);
     return term1 + term2 + term3;
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


        vec3 p      = rayOrigin + t * rayDir;
        vec3 localP = (p + vec3(uDisplaceX, uDisplaceY, uDisplaceZ)) * uZoom;

        float v        = smoothstep(uGyMin, uGyMax, gyroid(localP));
        vec3  color    = getPaletteColor(v);
        //vec3 color = vec3(1.0,0.0,0.0);
        float alphaSmp = uAlphaMultiplier * v;

        // luz ambiental 

        vec3 ambient = uAmbientStrength*color;

        
        // Sombreado difuso 

        float eps = 0.002;
        vec3 grad = vec3(
          gyroid(localP + vec3(eps,0,0)) - gyroid(localP - vec3(eps,0,0)),
          gyroid(localP + vec3(0,eps,0)) - gyroid(localP - vec3(0,eps,0)),
          gyroid(localP + vec3(0,0,eps)) - gyroid(localP - vec3(0,0,eps))
        );
        vec3 normal = normalize(grad);
    
        float diff = max(dot(normal, normalize(uLightDir)), 0.0);
        vec3 diffuse = uDiffuseStrength * diff * color;

        vec3 lighting = ambient + diffuse;

        // filtrado de colores blancos o negros 

        float dW = distance(color, vec3(1.0));
        float dB = distance(color, vec3(0.0));

        // Si cae dentro del rango “filtrado”, fuerza alphaSmp a 0 → muestra transparente
        if (dW < uWhite || dB < uBlack) {
            alphaSmp = 0.0;
        }


      
        colorSum += (1.0 - totalAlpha) * lighting * alphaSmp;

        totalAlpha += (1.0 - totalAlpha) * alphaSmp;

        if (totalAlpha > 0.95) break;

        float r = fract(sin(dot(gl_FragCoord.xy ,vec2(12.9898,78.233))) * 43758.5453);
        float tStepJitter = uTStep * (1.0 + (r - 0.5) * 0.5);
        t += tStepJitter;

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

    uGyMin,
    uGyMax,
    uA,
    uB,
    uC,
    uPhix,
    uPhiy,
    uPhiz,

   
    uTMax,
    uTStep,
    uAlphaMultiplier,

  
    uIterMax,
    uSteps,

  
    uBlack,
    uWhite,
    palette,

    uNoiseLevel,
    uNoiseScale,
    uSpeed,

    uAmbientStrength,
    uLightDir,
    uDiffuseStrength,

  } = useControls({
    'Transformación Espacial': folder({
      uZoom:      { value: 5, min: 0.1, max: 10,   step: 1 },
      uDisplaceX: { value: 0, min: -10, max: 20,   step: 1 },
      uDisplaceY: { value: 0, min: -10, max: 20,   step: 1 },
      uDisplaceZ: { value: 0, min: -10, max: 20,   step: 1 },
    }),
    'Parámetros del Gyroide': folder({
      uGyMin: { value: -1, min: -5, max: 5, step: 0.001 },
      uGyMax: { value:  1, min: -5, max: 5, step: 0.001 },
      uA:     { value: -1, min: -5, max: 5, step: 0.001 },
      uPhix:  { value:  1, min: -5, max: 5, step: 0.001 },
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
      uWhite:   { value: 1.0, min: 0.0, max: 1.0, step: 0.001 },
      palette: {
        options: {
          Rainbow:  0,
          Hot:      1,
          Turbo:    2,
          Viridis:  3,
          Inferno:  4,
          CoolWarm: 5,
          Pastel:   6,
          Gray:     7,
        },
        value: 2
      },
    }),
    'Ruido': folder({
      uNoiseLevel: { value: 1, min: 0, max: 2, step: 0.1 },
      uNoiseScale: { value: 1, min: 0, max: 10, step: 0.1 },
      uSpeed: {value: 0,min: 0,max:1,step:0.001}
    }),
    'Parámetros de Luz': folder({
      uAmbientStrength:  { value: 1.0, min: 0, max: 1, step: 0.1 },
      uLightDir:         { value: new THREE.Vector3(1,1,1).normalize() },
      uDiffuseStrength:  { value: 1.0, min: 0, max: 1, step: 0.1 },
    }),
    

  })


  const uniforms = useMemo(() => ({
    uCameraPosition:   { value: new THREE.Vector3() },
    uZoom:             { value: uZoom },
    uDisplaceX:        { value: uDisplaceX },
    uDisplaceY:        { value: uDisplaceY },
    uDisplaceZ:        { value: uDisplaceZ },
    uGyMin:            { value: uGyMin },
    uGyMax:            { value: uGyMax },
    uA:                { value: uA},
    uPhix:             { value: uPhix},
    uTime:             { value: 0 },
    uTMax:             { value: uTMax },
    uTStep:            { value: uTStep },
    uSteps:            { value: uSteps },
    uAlphaMultiplier:  { value: uAlphaMultiplier },
    uWhite:            { value: uWhite},
    uBlack:            { value: uBlack},
    uIterMax:          { value: uIterMax},
    uPalette:          { value: palette },
    uNoiseLevel:       { value: uNoiseLevel},
    uNoiseScale:       { value: uNoiseScale},
    uSpeed:            { value: uSpeed},
    uAmbientStrength:  { value: uAmbientStrength },
    uLightDir:         { value: new THREE.Vector3()},
    uDiffuseStrength:  { value: uDiffuseStrength}
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
      u.uGyMin.value = uGyMin
      u.uGyMax.value = uGyMax
      u.uA.value     = uA
      u.uPhix.value     = uPhix
      u.uTMax.value = uTMax
      u.uTStep.value = uTStep
      u.uSteps.value = uSteps
      u.uAlphaMultiplier.value = uAlphaMultiplier
      u.uWhite.value = uWhite
      u.uBlack.value = uBlack
      u.uIterMax.value =  uIterMax
      u.uPalette.value = palette
      u.uNoiseLevel.value = uNoiseLevel
      u.uNoiseScale.value = uNoiseScale
      u.uSpeed.value = uSpeed
      u.uAmbientStrength.value = uAmbientStrength
      u.uLightDir.value = uLightDir
      u.uDiffuseStrength.value = uDiffuseStrength

    })



  return (
    <>

      <color attach="background" args={[0, 0, 0]} />
      <mesh ref={meshRef}>
        <boxGeometry args={[5,5,5,100,100,100]} />
        {/* <sphereGeometry args={[1,100,100]}/> */}
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