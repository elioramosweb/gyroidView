import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DoubleSide } from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

export default function BoxWithShader({ params, size = 4, gap = params.current.gap }) {
  // Sheet count and thickness from GUI params
  const pieces    = params.current.nSlices
  const thickness = params.current.thickness

  // Compute start position for slices
  const startZ = -size / 2 + thickness / 2

  // Geometry shared by all slices
  const geometry = useMemo(
    () => new THREE.BoxGeometry(size, size, thickness, 64, 64, 32),
    [size, thickness]
  )

  // Base shader material with uniforms
  const baseMaterial = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uTime:        { value: 0 },
        uZoom:        { value: params.current.zoom },
        uDisplaceX:   { value: params.current.displaceX },
        uDisplaceY:   { value: params.current.displaceY },
        uDisplaceZ:   { value: params.current.displaceZ },
        uBlack:       { value: params.current.blackFilter },
        uWhite:       { value: params.current.whiteFilter },
        uSliceOffset: { value: new THREE.Vector3() },
      }
    }),
    []
  )

  // Clone and offset materials per slice
  const materials = useMemo(
    () => Array.from({ length: pieces }, (_, i) => {
      const mat = baseMaterial.clone()
      const z   = startZ + i * (thickness + gap)
      mat.uniforms.uSliceOffset.value.set(0, 0, z)
      return mat
    }),
    [baseMaterial, pieces, startZ, thickness, gap]
  )

  // Update time and other uniforms each frame
  useFrame(({ clock }) => {
    materials.forEach(mat => {
      mat.uniforms.uTime.value      = clock.getElapsedTime()
      mat.uniforms.uZoom.value      = params.current.zoom
      mat.uniforms.uDisplaceX.value = params.current.displaceX
      mat.uniforms.uDisplaceY.value = params.current.displaceY
      mat.uniforms.uDisplaceZ.value = params.current.displaceZ
      mat.uniforms.uBlack.value     = params.current.blackFilter
      mat.uniforms.uWhite.value     = params.current.whiteFilter
    })
  })

  return (
    <>
      {materials.map((mat, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={mat}
          position={[0, 0, startZ + i * (thickness + gap)]}
        />
      ))}
    </>
  )
}
