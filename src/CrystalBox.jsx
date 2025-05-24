// CrystalBox.jsx
import React, { useRef, useMemo } from 'react'
import { useFrame }            from '@react-three/fiber'
import * as THREE              from 'three'
import { DoubleSide }          from 'three'

export default function CrystalBox({
  size = 5.,              // ancho y alto del cubo original
  zMin = -size / 2,      // mínimo en Z de las secciones
  zMax = +size / 2,      // máxim,// grosor simulado del cristal
  thickness=0.1,
}) {
  const meshRef = useRef()

  const height  = zMax - zMin
  const centerZ = (zMax + zMin) / 2


  const width  = 2.
  const depth  = 2.


  const geometry = useMemo(
    () => new THREE.BoxGeometry(width, depth, depth, 100,100,100),
    [width, depth, height]
  )

 
  useFrame((state) => {
    // por si en el futuro quieres un shaderRef.current.uniforms.uTime
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0,0]}
    >


    <meshPhysicalMaterial
      transmission={1}    
      color="#dddddd"      
      thickness={0.1}            
      ior={1.52}                
      roughness={0}              
      metalness={0}             
      reflectivity={1}         
      clearcoat={1}              
      clearcoatRoughness={0}     
      side={DoubleSide}         
      transparent={true}
      depthWrite={false}       
    />

    </mesh>
  )
}
