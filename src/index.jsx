import './style.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Scene from './Scene'
import { Environment, OrbitControls,Stage } from '@react-three/drei'


const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
  <React.StrictMode>
    <Canvas
      shadows
      camera={{ position: [2, 5, 10], fov: 50 }}
      gl={{ toneMappingExposure: 1.5 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#FFFFFF') // fondo negro
      }}
    >
      {/* Stage reemplaza ambientLight, directionalLight y Environment */}
      <Stage
        environment="studio" // también puedes usar "warehouse", "sunset", etc.
        intensity={1.0}
        contactShadow={{ opacity: 0.4, blur: 2 }}
        adjustCamera={false} 
        shadows={{ type: 'contact', opacity: 0.4, bias: -0.001 }}
      >
      <Scene />
      </Stage>
      <OrbitControls />
    </Canvas>
  </React.StrictMode>
)