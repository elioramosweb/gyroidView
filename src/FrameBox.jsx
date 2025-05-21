// FrameBox.jsx
import React, { useMemo } from 'react'
import * as THREE from 'three'

export default function FrameBox({
  size = 1,
  color = '#000000',
  children
}) {
  // 1. Creamos la geometría de aristas una sola vez
  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size)),
    [size]
  )

  return (
    <group>
      {/* 2. Renderiza primero lo que hay dentro */}
      {children}

      {/* 3. Luego dibuja las aristas siempre al frente */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial 
          attach="material"
          linewidth={2}  
          color={color} 
          depthTest={false}   // desactiva test de profundidad
          depthWrite={false}  // no escribe en el buffer de profundidad
        />
      </lineSegments>
    </group>
  )
}
