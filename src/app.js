/**
 * app.js
 *
 * This is the first file loaded. It sets up the Renderer,
 * Scene and Camera. It also starts the render loop and
 * handles window resizes.
 *
 */
import {
  Audio,
  AudioListener,
  AudioLoader,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SeedScene } from "scenes";
import * as THREE from "three";

// Initialize core ThreeJS components
const scene = new SeedScene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({ antialias: true });
let fireworks = [];

// Set up camera
// camera.position.set(6, 3, -10);
// camera.lookAt(new Vector3(0, -250, -700));
// camera.lookAt(new Vector3(6, 3, 10));
// Set up renderer, canvas, and minor CSS adjustments
renderer.setPixelRatio(window.devicePixelRatio);
const canvas = renderer.domElement;
canvas.style.display = "block"; // Removes padding below canvas
document.body.style.margin = 0; // Removes margin around page
document.body.style.overflow = "hidden"; // Fix scrolling
document.body.appendChild(canvas);

// Set up controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 400; // zooom in  or out
controls.maxDistance = 600;
controls.target = new Vector3(0, -25, -700); // center of pov
controls.update();

camera.position.set(6, -65, -10);
camera.lookAt(new Vector3(0, -250, 700));

//fireworks
(function () {
  // constructor
  var Firework = function (scene) {
    this.scene = scene;
    this.done = false;
    this.dest = [];
    this.colors = [];
    this.geometry = null;
    this.points = null;
    this.material = new THREE.PointsMaterial({
      size: 6,
      color: 0xffffff,
      opacity: 1,
      vertexColors: true,
      transparent: true,
      depthTest: true,
    });
    this.launch();
  };

  // prototype
  Firework.prototype = {
    constructor: Firework,

    // reset
    reset: function () {
      this.scene.remove(this.points);
      this.dest = [];
      this.colors = [];
      this.geometry = null;
      this.points = null;
    },

    // launch
    launch: function () {
      var x = THREE.Math.randInt(-500, 500);
      var y = THREE.Math.randInt(100, 800);
      var z = THREE.Math.randInt(-200, -1000);

      var from = new THREE.Vector3(x, -800, z);
      var to = new THREE.Vector3(x, y, z);

      var color = new THREE.Color();
      color.setHSL(THREE.Math.randFloat(0.1, 0.9), 1, 0.9);
      this.colors.push(color);

      this.geometry = new THREE.Geometry();
      this.points = new THREE.Points(this.geometry, this.material);

      this.geometry.colors = this.colors;
      this.geometry.vertices.push(from);
      this.dest.push(to);
      this.colors.push(color);
      this.scene.add(this.points);
    },

    // explode
    explode: function (vector) {
      this.scene.remove(this.points);
      this.dest = [];
      this.colors = [];
      this.geometry = new THREE.Geometry();
      this.points = new THREE.Points(this.geometry, this.material);

      for (var i = 0; i < 80; i++) {
        var color = new THREE.Color();
        color.setHSL(THREE.Math.randFloat(0.1, 0.9), 1, 0.5);
        this.colors.push(color);

        var from = new THREE.Vector3(
          THREE.Math.randInt(vector.x - 10, vector.x + 10),
          THREE.Math.randInt(vector.y - 10, vector.y + 10),
          THREE.Math.randInt(vector.z - 10, vector.z + 10)
        );
        var to = new THREE.Vector3(
          THREE.Math.randInt(vector.x - 100, vector.x + 100),
          THREE.Math.randInt(vector.y - 100, vector.y + 100),
          THREE.Math.randInt(vector.z - 100, vector.z + 100)
        );
        this.geometry.vertices.push(from);
        this.dest.push(to);
      }
      this.geometry.colors = this.colors;
      this.scene.add(this.points);
    },

    // update
    update: function () {
      // only if objects exist
      if (this.points && this.geometry) {
        var total = this.geometry.vertices.length;

        // lerp particle positions
        for (var i = 0; i < total; i++) {
          this.geometry.vertices[i].x +=
            (this.dest[i].x - this.geometry.vertices[i].x) / 20;
          this.geometry.vertices[i].y +=
            (this.dest[i].y - this.geometry.vertices[i].y) / 20;
          this.geometry.vertices[i].z +=
            (this.dest[i].z - this.geometry.vertices[i].z) / 20;
          this.geometry.verticesNeedUpdate = true;
        }
        // watch first particle for explosion
        if (total === 1) {
          if (Math.ceil(this.geometry.vertices[0].y) > this.dest[0].y - 20) {
            this.explode(this.geometry.vertices[0]);
            return;
          }
        }
        // fade out exploded particles
        if (total > 1) {
          this.material.opacity -= 0.015;
          this.material.colorsNeedUpdate = true;
        }
        // remove, reset and stop animating
        if (this.material.opacity <= 0) {
          this.reset();
          this.done = true;
          return;
        }
      }
    },
  };

  // export
  window.Firework = Firework;
})();

// Render loop
const onAnimationFrameHandler = (timeStamp) => {
  if (THREE.Math.randInt(1, 20) === 10) {
    fireworks.push(new Firework(scene));
  }
  // update fireworks
  for (var i = 0; i < fireworks.length; i++) {
    if (fireworks[i].done) {
      // cleanup
      fireworks.splice(i, 1);
      continue;
    }
    fireworks[i].update();
  }
  controls.update();
  renderer.render(scene, camera);
  scene.update && scene.update(timeStamp);
  window.requestAnimationFrame(onAnimationFrameHandler);
};
window.requestAnimationFrame(onAnimationFrameHandler);

// Resize Handler
const windowResizeHandler = () => {
  const { innerHeight, innerWidth } = window;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
};
windowResizeHandler();
window.addEventListener("resize", windowResizeHandler, false);
