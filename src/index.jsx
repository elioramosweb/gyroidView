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
        intensity={0.5}
        contactShadow={{ opacity: 0.4, blur: 2 }}
        adjustCamera={false} // lo dejas en false si estás usando tu propia cámara
      >
      <Scene />
      </Stage>
      <OrbitControls />
    </Canvas>
  </React.StrictMode>
)