import React, { useRef, useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { AxesHelper } from 'three'
import { GUI } from 'lil-gui'
import BoxWithShader from './BoxWithShader'
import CrystalBox from './CrystalBox'

// Define GUI controls centrally
const controls = [
  { key: 'zoom',        min: -5,   max: 5,    step: 0.001 },
  { key: 'displaceX',   min: -5,   max: 5,    step: 0.001 },
  { key: 'displaceY',   min: -5,   max: 5,    step: 0.001 },
  { key: 'displaceZ',   min: -5,   max: 5,    step: 0.001 },
  { key: 'blackFilter', min:  0,   max: 1,    step: 0.0001 },
  { key: 'whiteFilter', min:  0,   max: 1,    step: 0.0001 },
  { key: 'nSlices',     min:  1,   max: 100,  step: 1     },
  { key: 'thickness',   min:  0.001, max:1,   step: 0.0001 },
  { key: 'gap',   min:  0.001, max:2,   step: 0.0001 },
]

export default function Scene() {
  const { scene, invalidate } = useThree()
  const [refresh, setRefresh] = useState(0)
  const params = useRef({
    zoom:        0.81,
    displaceX:   2.54,
    displaceY:   2.78,
    displaceZ:   2.91,
    blackFilter: 0,
    whiteFilter: 0,
    nSlices:    10,
    thickness:  0.01,
    gap:0.01,
  })

  useEffect(() => {
    const axes = new AxesHelper(10)
    scene.add(axes)

    const gui = new GUI()
    controls.forEach(({ key, min, max, step }) => {
      gui.add(params.current, key, min, max, step)
         .name(key)
         .onChange(() => {
           invalidate()
           setRefresh(r => r + 1)
         })
    })

    gui.open()
    return () => {
      gui.destroy()
      scene.remove(axes)
    }
  }, [scene, invalidate])

  const pieces    = params.current.nSlices;     // número de slices
  const thickness = params.current.thickness;   // grosor de cada slice
  const gap       = params.current.gap;         // separación entre slices

  const depth = pieces*thickness + (pieces - 1)*gap;

  return (
    <>
      {/* force re-render on params change */}
      <BoxWithShader 
        params={params} />
      <CrystalBox 
        size={4} 
        zMin={0}
        zMax={10}
        thickness={params.current.thickness} />
    </>
  )
}
