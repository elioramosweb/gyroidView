// CrystalBox.jsx
import React, { useRef, useMemo } from 'react'
import { useFrame }            from '@react-three/fiber'
import { MeshTransmissionMaterial} from '@react-three/drei'
import { useControls, Leva } from 'leva'
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


  const width  = 2.2
  const depth  = 2.2


  const geometry = useMemo(
    () => new THREE.BoxGeometry(width, depth, depth, 100,100,100),
    [width, depth, height]
  )

 
  useFrame((state) => {
    // por si en el futuro quieres un shaderRef.current.uniforms.uTime
  })


  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, 0, 0]}
      >
<MeshTransmissionMaterial
  transmission={0.85}           // deja un poco de turbidez
  thickness={0.4}               
  roughness={0.05}              // un poco más rugoso para reflejos suaves
  ior={1.47}                    
  chromaticAberration={0.04}    
  anisotropy={0.4}              
  backside={true}               
  distortion={0.1}              // vetas y ondulaciones más marcadas
  temporalDistortion={0.005}    
  clearcoat={0.2}               
  clearcoatRoughness={0.05}     
/>


      </mesh>


    </>
  )

}
