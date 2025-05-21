import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage } from '@react-three/drei'
import { useControls, Leva } from 'leva'
import LyapunovVolume from './LyapunovVolume'
import FrameBox from './FrameBox'

export default function Lyapunov3DScene() {
  // Definimos controles de Leva para cámara y luces
  // const {
  //   cameraZ,
  //   ambientIntensity,
  //   pointIntensity,
  //   stageIntensity
  // } = useControls('Scene', {
  //   cameraZ: {
  //     value: 15,
  //     min: 5,
  //     max: 50,
  //     step: 1
  //   },
  //   ambientIntensity: {
  //     value: 0.8,
  //     min: 0,
  //     max: 2,
  //     step: 0.1
  //   },
  //   pointIntensity: {
  //     value: 1,
  //     min: 0,
  //     max: 5,
  //     step: 0.1
  //   },
  //   stageIntensity: {
  //     value: 0.5,
  //     min: 0,
  //     max: 2,
  //     step: 0.1
  //   }
  // })

  return (
    <>
      {/* Panel de Leva siempre visible */}
      <Leva collapsed={false} />

      {/* Contenedor full-screen con overflow visible */}
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
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%' }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.2
          }}
        >
          <color attach="background" args={['#ffffff']} />
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
{/* 
          <Stage environment="studio" intensity={0.5} shadows={false}>
            <LyapunovVolume />
          </Stage> */}

          
          <FrameBox size={2} color="#CCCCCC">
            {/* Dentro del FrameBox */}
             <LyapunovVolume />
          </FrameBox>

          <OrbitControls />
        </Canvas>
      </div>
    </>
  )
}
