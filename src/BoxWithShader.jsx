import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

export default function BoxWithShader({ params }) {
  const shaderRef = useRef()
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
      shaderRef.current.uniforms.uZoom.value = params.current.zoom
      shaderRef.current.uniforms.uDisplaceX.value = params.current.displaceX
      shaderRef.current.uniforms.uDisplaceY.value = params.current.displaceY
      shaderRef.current.uniforms.uDisplaceZ.value = params.current.displaceZ
    }


    if (meshRef.current) {
      meshRef.current.position.x = 0
      meshRef.current.position.y = 0
      meshRef.current.position.z = params.current.posZ
    }

  })



  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[4, 4, 0.1, 64, 64, 64]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uZoom: { value: params.current.zoom},
          uDisplaceX: { value: params.current.displaceX },
          uDisplaceY: { value: params.current.displaceY },
          uDisplaceZ: { value: params.current.displaceZ },
        }}
        side={DoubleSide}
      />
    </mesh>
  )
}
