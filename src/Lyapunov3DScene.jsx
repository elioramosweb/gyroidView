// Lyapunov3DScene.jsx
import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls,Stage } from '@react-three/drei'
import { useControls, Leva } from 'leva'
import LyapunovVolume from './LyapunovVolume'
import FrameBox from './FrameBox'
import CrystalBox from './CrystalBox' 

export default function Lyapunov3DScene() {
  
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

  // const cameraZ = 5
  // const ambientIntensity = 1.0
  // const pointIntensity = 0.5
  // const frameSize = 2
  // const frameColor = '#000000'

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
          camera={{ position: [0, 0, cameraZ], fov: 50 }}
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.2
          }}
        >
          <Stage shadows={false} preset="soft">
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={ambientIntensity} />
          <pointLight position={[10, 10, 10]} intensity={pointIntensity} castShadow />

          <FrameBox size={frameSize} color={frameColor}> 
            <LyapunovVolume />
            <CrystalBox />
          </FrameBox> 
          </Stage>

          <OrbitControls />
        </Canvas>
      </div>
    </>
  )
}
