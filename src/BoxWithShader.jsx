// SphereWithShader.jsx
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial } from 'three'
import { DoubleSide } from 'three'
import { GUI } from 'dat.gui'

const vertexShader = `
    uniform float uTime;
    uniform float uZoom;
    uniform float uDisplaceX;
    uniform float uDisplaceY;
    uniform float uDisplaceZ;
    uniform float uTransparency;
    varying vec3 vObjectPos;
    varying vec3 vNormal;
    varying vec3 vPosition;
      
    void main() {
        vObjectPos = position;
        vNormal = normalMatrix * normal;
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const fragmentShader = `
    uniform float uTime;
    uniform float uZoom;
    uniform float uDisplaceX;
    uniform float uDisplaceY;
    uniform float uDisplaceZ;
    uniform vec3  uLightPos;
    uniform vec3  uViewPos;
  
    varying vec3 vObjectPos;
    varying vec3 vNormal;
    varying vec3 vPosition;
  
    #define NMAX 100
  
    float lyapunov(vec3 coord) {
      float x = 0.5;
      float sum = 0.0;
      for (int i = 0; i < NMAX; i++) {
        int pos = int(mod(float(i), 6.0));
        float r = 0.0;
        if (pos == 0 || pos == 1) {
          r = coord.x;
        } else if (pos == 2 || pos == 3) {
          r = coord.y;
        } else {
          r = coord.z;
        }
        x = r * x * (1.0 - x);
        sum += log(abs(r - 2.0 * r * x));
      }
      return sum / float(NMAX);
    }

    vec3 palette(float t) {
      float r = smoothstep(0.0, 0.5, t);
      float g = smoothstep(0.25, 0.75, t);
      float b = smoothstep(0.5, 1.0, t);
      //float intensity = mix(0.0, 1.0, t);
      float intensity = 0.5;
      return vec3(r * intensity, g * intensity, b * intensity);
    }

          
    void main() {

      vec3 coord = (vObjectPos + vec3(uDisplaceX, uDisplaceY,uDisplaceZ)) * uZoom;
      
      float val = smoothstep(-1.0, 1.0,lyapunov(coord));
      vec3 baseColor = palette(val);
      
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(uLightPos - vPosition);
      vec3 viewDir = normalize(uViewPos - vPosition);
      vec3 reflectDir = reflect(-lightDir, normal);
      
      float diff = max(dot(normal, lightDir), 0.0);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
      

      vec3 diffuse = diff * vec3(1.);       // Aumenta la intensidad difusa
      vec3 specular = spec * vec3(1.5) * 0.1;  // Aumenta la intensidad especular
      
    
      vec3 ambient = vec3(0.2);
      
      vec3 lighting = diffuse + specular + ambient;
      vec3 finalColor = baseColor * lighting;

      float dist = distance(finalColor, vec3(0.0));

      // if (dist <= 0.2) {
      //   finalColor = vec3(0.0);
      //  }
      
      gl_FragColor = vec4(finalColor, 1.0);
  }
`

export default function boxWithShader() {
  const shaderRef = useRef();

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  useEffect(() => {
 
    const gui = new GUI()

    const updateGUI = () => {
      if (shaderRef.current) {

        const folder = gui.addFolder('Shader Uniforms')

        // Agregamos el control para uZoom
        folder.add(shaderRef.current.uniforms.uZoom, 'value', 0, 5, 0.001).name('uZoom')
          .onChange((value) => {
            shaderRef.current.uniforms.uZoom.value = value
        })

        folder.add(shaderRef.current.uniforms.uDisplaceX, 'value', -10, 10, 0.001).name('uDisplaceX')
          .onChange((value) => {
            shaderRef.current.uniforms.uDisplaceX.value = value
        })

        folder.add(shaderRef.current.uniforms.uDisplaceY, 'value', -10, 10, 0.001).name('uDisplaceY')
          .onChange((value) => {
            shaderRef.current.uniforms.uDisplaceY.value = value
        })

        folder.add(shaderRef.current.uniforms.uDisplaceZ, 'value', -10, 10, 0.001).name('uDisplaceZ')
          .onChange((value) => {
            shaderRef.current.uniforms.uDisplaceZ.value = value
        })

      folder.open()
      } else {
        setTimeout(updateGUI, 100)
      }
    }

    updateGUI()

    // Limpieza: destruimos el objeto GUI cuando el componente se desmonte
    return () => {
      gui.destroy()
    }
  }, [])

  return (
    <mesh position={[0,0,0]}>
      <boxGeometry args={[4,4,4,64, 64,64]} />
      <shaderMaterial
        ref={shaderRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uZoom:{value: 0.60},
          uDisplaceX:{value:-0.68},
          uDisplaceY:{value:3.9},
          uDisplaceZ:{value:0.0}         
        }}
        side={DoubleSide}
      />
    </mesh>
  )
}
