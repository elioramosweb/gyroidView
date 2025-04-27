import React, { useRef, useMemo } from 'react'
import { useFrame }            from '@react-three/fiber'
import * as THREE              from 'three'
import { DoubleSide }          from 'three'
import vertexShader            from './shaders/vertex.glsl'
import fragmentShader          from './shaders/fragment.glsl'

export default function BoxWithShader({ params, displaceZ = 0 }) {
  const matRef = useRef()
  // 1) Desestructuramos para que React rastree cambios en 'thickness'
  const { thickness, blackFilter, whiteFilter } = params.current

  // 2) Ahora useMemo sí se volverá a ejecutar cuando cambie 'thickness'
  const geometry = useMemo(
    () => new THREE.BoxGeometry(4, 4, thickness, 64, 64, 64),
    [thickness]
  )

  useFrame(({ clock }) => {
    const mat = matRef.current
    if (!mat) return

    mat.uniforms.uTime.value      = clock.getElapsedTime()
    mat.uniforms.uZoom.value      = params.current.zoom
    mat.uniforms.uDisplaceX.value = params.current.displaceX
    mat.uniforms.uDisplaceY.value = params.current.displaceY
    mat.uniforms.uDisplaceZ.value = displaceZ
    // 3) Usamos las variables desestructuradas para los filtros
    mat.uniforms.uBlack.value     = blackFilter
    mat.uniforms.uWhite.value     = whiteFilter
  })

  return (
    <mesh geometry={geometry} position={[0, 0, displaceZ]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={DoubleSide}
        uniforms={{
          uTime:      { value: 0 },
          uZoom:      { value: params.current.zoom },
          uDisplaceX: { value: params.current.displaceX },
          uDisplaceY: { value: params.current.displaceY },
          uDisplaceZ: { value: displaceZ },
          uBlack:     { value: blackFilter },
          uWhite:     { value: whiteFilter },
        }}
      />
    </mesh>
  )
}
