// fragmentShader.glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform float uZoom;
uniform float uDisplaceX;
uniform float uDisplaceY;
uniform float uDisplaceZ;
uniform float uTime;

varying vec3  vNormal;
varying vec3  vPosition;
varying vec2  vUv;


void main() {
    vNormal = normal;
    vPosition = position;

    // vPosition.x += uDisplaceX;
    // vPosition.y += uDisplaceY;
    // vPosition.z += uDisplaceZ;

    vUv = uv;
    vec3 newPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
