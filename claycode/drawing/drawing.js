export function getShader(){
    return PIXI.Shader.from(`
    precision mediump float;
    attribute vec2 aVertexPosition;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }`, `precision mediump float;

    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`);
}