// fragmentShader.glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform float uZoom;
uniform float uDisplaceX;
uniform float uDisplaceY;
uniform float uDisplaceZ;
uniform float uWhite;
uniform float uBlack;
uniform float uTime;
uniform vec3 uSliceOffset;

varying vec3  vNormal;
varying vec3  vPosition;
varying vec2  vUv;


void main() {
    vNormal = normal;
    vPosition = position - uSliceOffset;;

    // vPosition.x += uDisplaceX;
    // vPosition.y += uDisplaceY;
    // vPosition.z += uDisplaceZ;

    vUv = uv;
    vec3 newPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
