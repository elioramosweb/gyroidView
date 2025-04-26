import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { GUI } from 'lil-gui'
import BoxWithShader from './BoxWithShader'

export default function Scene() {

  const { scene } = useThree()

  const params = useRef({
    zoom:0.63,
    displaceX: 2.38,
    displaceY: 2.13,
    displaceZ: 4.35,
    posZ:0,
  })

  useEffect(() => {
    
    const axes = new THREE.AxesHelper(10)

    scene.add(axes)

    const gui = new GUI()

    gui.add(params.current, 'zoom', -5, 5, 0.01).name('zoom')
    gui.add(params.current, 'displaceX', -5, 5, 0.01).name('displaceX')
    gui.add(params.current, 'displaceY', -5, 5, 0.01).name('displaceY')
    gui.add(params.current, 'displaceZ', -5, 5, 0.01).name('displaceZ')
    gui.add(params.current, 'posZ', -5, 5, 0.01).name('posZ')

    gui.open()

    return () => {
      gui.destroy()
      scene.remove(axes)
    }
  }, [scene])

  return (
    <group>
      <BoxWithShader
        params={params}
      />
    </group>
  )
}
