// fragmentShader.glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform float uTime;
uniform float uZoom; 
uniform float uDisplaceX;
uniform float uDisplaceY;
uniform float uDisplaceZ;
uniform float uZPos;

varying vec2  vUv;
varying vec3  vPosition;

#define NMAX 500

float lyapunov(vec3 coord) {
    float x = 0.5;
    float sum = 0.0;

    for (int i = 0; i < NMAX; i++) {
        int pos = int(mod(float(i), 6.0));
        float r = 0.0;
        if (pos == 0 || pos == 1) {
            r = coord.x;
        } else if (pos ==2 || pos == 3) {
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
    
    float r = smoothstep(0.0, 0.5, t); // Rojo empieza temprano y permanece
    float g = smoothstep(0.25, 0.75, t); // Verde un poco después y se va en 0.7
    float b = smoothstep(0.5, 1.0, t); // Azul empieza tarde y termina en el final

    float intensity = mix(0.50, 1.0, t);

    return vec3(r * intensity, g * intensity, b * intensity);

  }

void main() {

    vec3 coord = (vPosition) * uZoom;
        
    float val = smoothstep(-1.0, 1.0,lyapunov(coord));

      // if (val < 0.2) { // Ajusta el umbral según lo necesites
      //     //discard;
      //     val = 0.0;
      // }

    vec3 color = palette(val);

    gl_FragColor = vec4(color, 1.0);
}