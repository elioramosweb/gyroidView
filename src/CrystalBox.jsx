// SphereWithShader.jsx
import { useRef,useMemo} from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three';
import { DoubleSide } from 'three'

export default function CrystalBox() {

  function Box() {

    const meshRef = useRef()
    const shaderRef = useRef();
  
    useFrame((state) => {
      if (meshRef.current) {
        // meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
        // meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1 
      }
      if (shaderRef.current) {
        shaderRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
      }
    })

    const geometry = useMemo(() => {
      return new THREE.BoxGeometry(4.,4.,4.,64,64,64)
    }, [])
  
    return (
    <mesh castShadow ref={meshRef} geometry={geometry}>
    <meshPhysicalMaterial
      color="#AAAAAA"
      roughness={0}
      metalness={0}
      transmission={1}        // Mayor transparencia
      thickness={0.05}       // Más delgado = menos distorsión
      ior={1.0}               // Índice de refracción como el aire para evitar distorsión
      clearcoat={1}
      clearcoatRoughness={0}
      reflectivity={0.001}     // Bajo para no oscurecer
      side={DoubleSide}
      transparent={true}
    />
    </mesh>

    )
  }

  return (Box())
}