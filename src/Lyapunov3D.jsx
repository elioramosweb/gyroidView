import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { DoubleSide } from 'three';
import { MeshTransmissionMaterial } from '@react-three/drei'; 

const vertexShader = `

  varying vec3  vPosition;
  varying vec2  vUv;
  uniform vec3  uSliceOffset;

  void main() {
      vPosition = position - uSliceOffset;
      vUv = uv;
      vec3 newPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `

  precision mediump float;

  uniform float uTime;
  uniform float uZoom;
  uniform float uDisplaceX;
  uniform float uDisplaceY;
  uniform float uDisplaceZ;
  uniform float uBlack;
  uniform float uWhite;
  uniform float uLypMin;
  uniform float uLypMax;

  varying vec2  vUv;
  varying vec3  vPosition;

  #define NMAX 100

  float lyapunov(vec3 coord) {
      float x = 0.5;
      float sum = 0.0;

      for (int i = 0; i < NMAX; i++) {
          int pos = int(mod(float(i), 6.0));
          float r = 0.0;
          if (pos == 0 || pos == 1) {
              r = coord.x;
          } else if (pos ==2 || pos == 3) {
              r = coord.y;
          } else {
              r = coord.z;
          }
          x = r * x * (1.0 - x);
          sum += log(abs(r - 2.0 * r * x));
      }

      return sum / float(NMAX);
  }


  vec3 turboPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    return vec3(
      0.5 + 0.5 * sin(6.2831 * (t + 0.0)),
      0.5 + 0.5 * sin(6.2831 * (t + 0.15)),
      0.5 + 0.5 * sin(6.2831 * (t + 0.3))
    );
  }
  
  vec3 palette(float t) {
      float r = smoothstep(0.0, 0.5, t);
      float g = smoothstep(0.25, 0.75, t);
      float b = smoothstep(0.5, 1.0, t);
      float intensity = mix(0.50, 1.0, t);
      return vec3(r * intensity, g * intensity, b * intensity);
  }

  void main() {
      vec3 coord = (vPosition + vec3(uDisplaceX,uDisplaceY,uDisplaceZ)) * uZoom;
      float val = smoothstep(uLypMin,uLypMax, lyapunov(coord));
      vec3 color = turboPalette(val);

    // Genera alphas suaves en lugar de usar discard
      // float alphaWhite = smoothstep(uWhite, uWhite + 0.05, dist1); // 0 cerca de blanco, 1 lejos
      // float alphaBlack = smoothstep(uBlack, uBlack + 0.05, dist2); // 0 cerca de negro, 1 lejos

      // float alpha = min(alphaWhite, alphaBlack);

      // vec4 fColor =  vec4(color,alpha);

      // …después del loop de acumulación…
      float distWhite = distance(colorSum, vec3(1.0));
      float distBlack = distance(colorSum, vec3(0.0));

      // Solo filtrar si hemos acumulado algo de volumen (totalAlpha>0)
      if (totalAlpha > 0.00001) {
        if (distWhite < uWhite){
          discard;
        }
        if (distBlack < uBlack){
          discard;
        }
      }

      gl_FragColor = vec4(colorSum, totalAlpha);

    
  }
`;

export default function Lyapunov3D() {
  const {
    sliceAxis,
    uZoom,
    uDisplaceX,
    uDisplaceY,
    uDisplaceZ,
    uWhite,
    uBlack,
    nSlices,
    thickness,
    gap,
    uLypMin,
    uLypMax
  } = useControls({
    sliceAxis: { options: ['x', 'y', 'z'], value: 'z', label: 'Eje de rebanado' },
    uZoom:      { value: 1.48, min: 0.1, max: 10, step: 0.001 },
    uDisplaceX: { value: 0.55, min: -10, max: 20, step: 0.001 },
    uDisplaceY: { value: 1.90, min: -10, max: 20, step: 0.001 },
    uDisplaceZ: { value: 1.90, min: -10, max: 20, step: 0.001 },
    uWhite:     { value: 1.0, min: 0, max: 1, step: 0.001 },
    uBlack:     { value: 0.2, min: 0, max: 1, step: 0.001 },
    uLypMin:     { value: -1, min: -5, max: 5, step: 0.001 },
    uLypMax:     { value: 1, min: -5, max: 5, step: 0.001 },
    nSlices:    { value: 200, min: 1, max: 5000, step: 1 },
    thickness:  { value: 0.005, min: 0.001, max: 0.5, step: 0.001 },
    gap:        { value: 0.00, min: 0, max: 1, step: 0.001 }
  });

  const size = 4;
  const startOffset = -size / 2 + thickness / 2;

  const geometry = useMemo(() => {
    if (sliceAxis === 'z') {
      return new THREE.BoxGeometry(size, size, thickness, 64, 64, 1);
    } else if (sliceAxis === 'y') {
      return new THREE.BoxGeometry(size, thickness, size, 64, 1, 64);
    } else {
      return new THREE.BoxGeometry(thickness, size, size, 1, 64,64);
    }
  }, [size, thickness, sliceAxis]);

  const baseMaterial = useMemo(() =>
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uTime:        { value: 0 },
        uZoom:        { value: uZoom },
        uDisplaceX:   { value: uDisplaceX },
        uDisplaceY:   { value: uDisplaceY },
        uDisplaceZ:   { value: uDisplaceZ },
        uWhite:       { value: uWhite },
        uBlack:       { value: uBlack },
        uSliceOffset: { value: new THREE.Vector3() },
        uLypMin:      {value: uLypMin},
        uLypMax:      {value: uLypMax},
      }
    }), []
  );

  const materials = useMemo(() => {
    return Array.from({ length: nSlices }, (_, i) => {
      const offset = i * (thickness + gap);
      const offsetVec = new THREE.Vector3();

      if (sliceAxis === 'z') offsetVec.z = startOffset + offset;
      else if (sliceAxis === 'y') offsetVec.y = startOffset + offset;
      else if (sliceAxis === 'x') offsetVec.x = startOffset + offset;

      const mat = baseMaterial.clone();
      mat.uniforms.uSliceOffset.value = offsetVec;
      return mat;
    });
  }, [nSlices, thickness, gap, baseMaterial, startOffset, sliceAxis]);

  useFrame(({ clock }) => {
    materials.forEach(mat => {
      mat.uniforms.uTime.value      = clock.getElapsedTime();
      mat.uniforms.uZoom.value      = uZoom;
      mat.uniforms.uDisplaceX.value = uDisplaceX;
      mat.uniforms.uDisplaceY.value = uDisplaceY;
      mat.uniforms.uDisplaceZ.value = uDisplaceZ;
      mat.uniforms.uWhite.value     = uWhite;
      mat.uniforms.uBlack.value     = uBlack;
      mat.uniforms.uLypMin.value    = uLypMin;
      mat.uniforms.uLypMax.value    = uLypMax;
    });
  });

  // Calcular caja envolvente
  const totalLength = nSlices * (thickness + gap);
  const containerSize = new THREE.Vector3(
    sliceAxis === 'x' ? totalLength : size,
    sliceAxis === 'y' ? totalLength : size,
    sliceAxis === 'z' ? totalLength : size
  );

  const containerPosition = new THREE.Vector3(
    sliceAxis === 'x' ? startOffset + (totalLength - thickness) / 2 : 0,
    sliceAxis === 'y' ? startOffset + (totalLength - thickness) / 2 : 0,
    sliceAxis === 'z' ? startOffset + (totalLength - thickness) / 2 : 0
  );

  return (
    <>
      {/* Caja envolvente */}
      {/* <mesh position={containerPosition}>
        <boxGeometry args={[
          containerSize.x * 1.05,
          containerSize.y * 1.05,
          containerSize.z * 1.05
        ]} />
        <MeshTransmissionMaterial color="#CCCCCC" />
      </mesh> */}

      {/* Rebanadas */}
      {materials.map((mat, i) => {
        const offset = i * (thickness + gap);
        const pos = new THREE.Vector3(0, 0, 0);

        if (sliceAxis === 'z') pos.z = startOffset + offset;
        else if (sliceAxis === 'y') pos.y = startOffset + offset;
        else if (sliceAxis === 'x') pos.x = startOffset + offset;


        return (
          <mesh
            key={i}
            geometry={geometry}
            material={mat}
            position={pos.toArray()}
            castShadow
          />
        );
      })}
    </>
  );
}