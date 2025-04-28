// Scene.jsx
import React, { useRef, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GUI } from 'lil-gui'
import BoxWithShader from './BoxWithShader'
import CrystalBox    from './CrystalBox'

export default function Scene() {
  const { scene, invalidate } = useThree()

  const invalidateRef = useRef(invalidate)
  useEffect(() => { invalidateRef.current = invalidate }, [invalidate])

  const [, setRefresh] = useState(0)

  const params = useRef({
    zoom:        0.81,
    displaceX:   2.54,
    displaceY:   2.78,
    displaceZ:   2.91,
    separation:  0.5,
    offset:      0,
    nSlices:    10,
    blackFilter: 0,
    whiteFilter: 0,
    thickness:   0.01,
  })


  useEffect(() => {
    const axes = new THREE.AxesHelper(10)
    scene.add(axes)

    const gui = new GUI()

    gui.add(params.current, 'zoom',        -5, 5,   0.001)
       .name('zoom')
       .onChange(() => invalidateRef.current())

    gui.add(params.current, 'displaceX',   -5, 5,   0.001)
       .name('displaceX')
       .onChange(() => invalidateRef.current())
    
    gui.add(params.current, 'displaceY',   -5, 5,   0.001)
       .name('displaceY')
       .onChange(() => invalidateRef.current())

    gui.add(params.current, 'displaceZ',   -5, 5,   0.001)
       .name('displaceZ')
       .onChange(() => invalidateRef.current())
    
    gui.add(params.current, 'blackFilter',  0,  1,   0.0001)
       .name('blackFilter')
       .onChange(() => invalidateRef.current())

    gui.add(params.current, 'whiteFilter',  0,  1,   0.0001)
       .name('whiteFilter')
       .onChange(() => invalidateRef.current())

    gui.open()
    return () => {
      gui.destroy()
      scene.remove(axes)
    }
  }, [scene, invalidate])

 
  // const displaceZArray = Array.from(
  //   { length: params.current.nSlices },
  //   (_, i) => params.current.offset + i * params.current.separation
  // )

  // const zMin = Math.min(...displaceZArray)
  // const zMax = Math.max(...displaceZArray)

  return (
    <group>
      <BoxWithShader params={params}/>
      {/* <CrystalBox zMin={zMin} zMax={zMax} />  */}
    </group>
  )

  // return (
  //   <group>
  //     {displaceZArray.map((z, i) => (
  //       <BoxWithShader key={i} params={params} displaceZ={z} />
  //     ))}
  //     <CrystalBox zMin={zMin} zMax={zMax} /> 
  //   </group>
  // )
}


// export default function Scene() {
//   const { scene } = useThree()

//   const params = useRef({
//     zoom: 0.63,
//     displaceX: 2.38,
//     displaceY: 2.13,
//     displaceZ: 4.35
//   })

//   const [displaceZ, setDisplaceZ] = useState(4.35)

//   useEffect(() => {
//     const axes = new THREE.AxesHelper(10)
//     scene.add(axes)

//     const gui = new GUI()

//     gui.add(params.current, 'zoom', -5, 5, 0.01).name('zoom')
//     gui.add(params.current, 'displaceX', -5, 5, 0.01).name('displaceX')
//     gui.add(params.current, 'displaceY', -5, 5, 0.01).name('displaceY')
//     gui.add(params.current, 'displaceZ', -5, 5, 0.01).name('displaceZ')

//     gui.open()

//     return () => {
//       gui.destroy()
//       scene.remove(axes)
//     }
//   }, [scene])

//   return (
//     <group>
//       <BoxWithShader params={params}/>
//     </group>
//   )
// }
