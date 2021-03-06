// sin functions used to create wave effects

// vertex shaders manipulate the 3d coordinates of the pixels, called once per vertex
const vertexShader = () => {
    return `
        varying float x;
        varying float y;
        varying float z;
        varying vec3 pos;
        uniform float u_amplitude;
        uniform float u_data_arr[64];
        void main() {
            pos = position;
            x = abs(position.x);
            y = abs(position.y);
            float floor_x = floor(x + 0.5);
            float floor_y = floor(y + 0.5);
            z = sin(u_data_arr[int(floor_x)] / 64.0 + u_data_arr[int(floor_y)] / 64.0) * u_amplitude;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y, z, 1.0);
        }
      `
};

// fragment shaders manipulate the color of the pixels, called once per vertex
const fragmentShader = () => {
    return `
      varying float x;
      varying float y;
      varying float z;
      void main() {
        gl_FragColor = vec4((32.0 - abs(x)) / 16.0, (16.0 - abs(y)) / 16.0, (abs(x + y) / 2.0) / 16.0, 1.0);
      }
    `;
};
  
export { vertexShader, fragmentShader };