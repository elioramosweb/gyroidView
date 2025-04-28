import React, { useMemo } from 'react'
import { useFrame }     from '@react-three/fiber'
import * as THREE       from 'three'
import { DoubleSide }   from 'three'
import vertexShader     from './shaders/vertex.glsl'
import fragmentShader   from './shaders/fragment.glsl'

export default function BoxWithShader({
  params,            // ref con zoom, displaceX/Y/Z, blackFilter, whiteFilter
  size = 4,          // lado del cubo original
  cuts = 10,          // número de cortes (planos en XY)
  gap  = 0.01         // tamaño del hueco entre secciones
}) {
  const pieces    = cuts + 1
  const thickness = (size - cuts * gap) / pieces
  const startZ    = -size / 2 + thickness / 2

  // 1) Geometría de cada sección
  const geometry = useMemo(
    () => new THREE.BoxGeometry(size, size, thickness, 64, 64, 32),
    [size, thickness]
  )

  // 2) Material “base” con todos los uniforms, incluyendo el offset
  const baseMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side:       DoubleSide,
      transparent:true,
      uniforms: {
        uTime:        { value: 0 },
        uZoom:        { value: params.current.zoom },
        uDisplaceX:   { value: params.current.displaceX },
        uDisplaceY:   { value: params.current.displaceY },
        uDisplaceZ:   { value: params.current.displaceZ },
        uBlack:       { value: params.current.blackFilter },
        uWhite:       { value: params.current.whiteFilter },
        uSliceOffset: { value: new THREE.Vector3(0, 0, 0) }, // ⬅︎ aquí
      }
    })
  }, [])

  // 3) Por cada sección clonamos el material y le damos su propio offset Z
  const materials = useMemo(() => {
    return Array.from({ length: pieces }).map((_, i) => {
      const mat = baseMaterial.clone()
      const z   = startZ + i * (thickness + gap)
      mat.uniforms.uSliceOffset.value.set(0, 0, z)
      return mat
    })
  }, [baseMaterial, pieces, startZ, thickness, gap])

  // 4) Cada frame actualizamos los uniforms compartidos (menos uSliceOffset)
  useFrame(({ clock }) => {
    materials.forEach(mat => {
      mat.uniforms.uTime.value      = clock.getElapsedTime()
      mat.uniforms.uZoom.value      = params.current.zoom
      mat.uniforms.uDisplaceX.value = params.current.displaceX
      mat.uniforms.uDisplaceY.value = params.current.displaceY
      mat.uniforms.uDisplaceZ.value = params.current.displaceZ
      mat.uniforms.uBlack.value     = params.current.blackFilter
      mat.uniforms.uWhite.value     = params.current.whiteFilter
      // mat.uniforms.uSliceOffset.value permanece fijo
    })
  })

  // 5) Renderizamos cada sección desplazada en Z
  return (
    <>
      {materials.map((mat, i) => {
        const z = startZ + i * (thickness + gap)
        return (
          <mesh
            key={i}
            geometry={geometry}
            material={mat}
            position={[0, 0, z]}
          />
        )
      })}
    </>
  )
}



/* import React, { useRef, useMemo } from 'react'
import { useFrame }            from '@react-three/fiber'
import * as THREE              from 'three'
import { DoubleSide }          from 'three'
import vertexShader            from './shaders/vertex.glsl'
import fragmentShader          from './shaders/fragment.glsl'

export default function BoxWithShader({ params}) {
  const matRef = useRef()
  const meshRef = useRef()

  // 2) Ahora useMemo sí se volverá a ejecutar cuando cambie 'thickness'
  const geometry = useMemo(
    () => new THREE.BoxGeometry(4, 4, 4, 64, 64, 64),
    []
  )

  useFrame(({ clock }) => {
    const mat = matRef.current
    const mesh = meshRef.current

    if (!mat || !mesh) return

    mat.uniforms.uTime.value      = clock.getElapsedTime()
    mat.uniforms.uZoom.value      = params.current.zoom
    mat.uniforms.uDisplaceX.value = params.current.displaceX
    mat.uniforms.uDisplaceY.value = params.current.displaceY
    mat.uniforms.uDisplaceZ.value = params.current.displaceZ
    mat.uniforms.uBlack.value     = params.current.blackFilter
    mat.uniforms.uWhite.value     = params.current.whiteFilter
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
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
          uDisplaceZ: { value: params.current.displaceZ },
          uBlack:     { value: params.current.blackFilter },
          uWhite:     { value: params.current.whiteFilter },
        }}
      />
    </mesh>
  )
}
 */