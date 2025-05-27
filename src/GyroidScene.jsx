// Lyapunov3DScene.jsx
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, Html,Backdrop} from '@react-three/drei'
import { useControls, Leva } from 'leva'
import * as THREE from 'three'
import GyroidVolume from './GyroidVolume'
import FrameBox from './FrameBox'
import CrystalBox from './CrystalBox' 

export default function GyroidScene() {
  
  const {
    cameraZ,
    ambientIntensity,
    pointIntensity,
    frameSize,
    frameColor
  } = useControls('Escena', {
    cameraZ: {
      value: 10,
      min: 5,
      max: 30,
      step: 1,
      label: 'Distancia cámara Z'
    },
    ambientIntensity: {
      value: 0.8,
      min: 0,
      max: 2,
      step: 0.1,
      label: 'Intensidad AmbientLight'
    },
    pointIntensity: {
      value: 1.0,
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Intensidad PointLight'
    },
    frameSize: {
      value: 2,
      min: 1,
      max: 10,
      step: 0.1,
      label: 'Tamaño del marco'
    },
    frameColor: {
      value: '#CCCCCC',
      label: 'Color del marco'
    }
  })

  return (
    <>
      <Leva collapsed={false} />
  
      <div
        style={{
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'visible'
        }}
      >
      <Canvas
        shadows
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        gl={{ antialias: true }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
        
        onCreated={({ gl }) => {
          // gl.toneMappingExposure = 1.2
          // gl.toneMapping = THREE.ACESFilmicToneMapping
          // gl.shadowMap.enabled = true
          // gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        {/* <color attach="background" args={['#000000']} /> */}
        <Stage
            environment="warehouse"
            intensity={0.1}
            background={false}
            //adjustCamera={false}
            shadows={null}
            // floor={{ color: '#eeeeee', offset: 0 }}
          >
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={0.2} />
          <GyroidVolume />
          {/* <CrystalBox/> */}
        </Stage>

        <OrbitControls />
      </Canvas>
      </div>
    </>
  )

}
