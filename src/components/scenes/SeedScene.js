import { vertexShader, fragmentShader } from './Shaders.js';
import * as Dat from "dat.gui";
import * as THREE from "three";
import {
  Audio,
  AudioAnalyser,
  AudioListener,
  AudioLoader,
  Scene,
  Color,
  Camera,
  MeshNormalMaterial,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from "three";
import { Flower, Land, Person, Stage } from "objects";
import { BasicLights } from "lights";

class SeedScene extends Scene {
  constructor() {
    // Call parent Scene() constructor
    super();

    // Init state
    this.state = {
      gui: new Dat.GUI(), // Create GUI for scene
      rotationSpeed: 5, // speed in which the background color changes
      updateList: [],
    };

    // Set background to a nice color

    this.backgroundPalette = [
      new Color(0x4d4dff),
      new Color(0xc724b1),
      new Color(0xe0e722),
      new Color(0xffad00),
      new Color(0xd22730),
      new Color(0xdb3eb1),
      new Color(0x44d62c),
    ];
    this.background = this.backgroundPalette[6];
    // Add meshes to scene
    const stage = new Stage();
    const lights = new BasicLights();

    // position stage
    stage.position.add(new THREE.Vector3(0, -250, -700));
    stage.scale.set(0.4, 0.4, 0.4);
    stage.depthTest = false;

    // add cones
    let cones = [];
    const conePositions = [
      new THREE.Vector3(-295, -70, -710),
      new THREE.Vector3(-178, -70, -710),
      new THREE.Vector3(-61, -70, -710),
      new THREE.Vector3(56, -70, -710),
      new THREE.Vector3(173, -70, -710),
      new THREE.Vector3(292, -70, -710),
    ];
    conePositions.forEach((pos) => {
      const geometry = new THREE.ConeGeometry(20, 380, 32);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      });
      let cone = new THREE.Mesh(geometry, material);
      cone.position.add(pos);
      cones.push(cone);
    });

    cones.forEach((cone) => {
      // cone.material.color = new Color(0x000000);
      this.add(cone);
    });
    this.add(stage, lights);

    // add audience
    let people = [];
    let peoplePositions = [
      new THREE.Vector3(-300, -200, -605),
      new THREE.Vector3(-200, -200, -600),
      new THREE.Vector3(-100, -200, -603),
      new THREE.Vector3(0, -200, -590),
      new THREE.Vector3(100, -200, -597),
      new THREE.Vector3(200, -200, -605),
      new THREE.Vector3(300, -200, -595),
      new THREE.Vector3(-350, -200, -530),
      new THREE.Vector3(-250, -200, -525),
      new THREE.Vector3(-150, -200, -521),
      new THREE.Vector3(-50, -200, -535),
      new THREE.Vector3(50, -200, -520),
      new THREE.Vector3(150, -200, -512),
      new THREE.Vector3(250, -200, -527),
      new THREE.Vector3(350, -200, -529),
    ];
    peoplePositions.forEach((pos) => {
      const person = new Person();
      person.scale.set(18, 18, 18);
      person.rotation.y = 3.14;
      person.position.add(pos);
      people.push(person);
    });
    people.forEach((person) => {
      this.add(person);
    });


    // set up listener, sound, audio loader
    const listener = new AudioListener();
    this.add(listener);
    const sound = new Audio(listener);
    const audioLoader = new AudioLoader();
    const audioCtx = new AudioContext();
    let neverPlayed = true;

    const playSong = () => {
      audioLoader.load("./slander.mp3", function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.01);
        audioCtx.resume();
        if (neverPlayed || sound.ended) {
          neverPlayed = false;
          sound.play();
          setTimeout(function () {
            sound.stop();
          }, 68000);
        }
      });
    };

    window.addEventListener("keydown", function (event) {
      if (event.key === " ") {
        playSong();
      }
    });

    // audio context is way for us to get frequency data of audio file
    // 1024 is fft (fast fourier transform) size, greater number = more samples
    const analyser = new AudioAnalyser(sound, 2048);
    let dataArray = analyser.getFrequencyData();

    const uniforms = {
      u_time: {
        type: "f",
        value: 1.0,
      },
      u_amplitude: {
        type: "f",
        value: 1000.0,
      },
      u_data_arr: {
        type: "float[64]",
        value: dataArray,
      },
    };

    // audio visualization mesh
    const planeGeometry = new PlaneGeometry(64, 64, 64, 64);
    // ShaderMaterial used so we can control position of vertices
    const planeMaterial = new ShaderMaterial({
      // uniforms are dataArray and time
      uniforms: uniforms,
      // vertexShader and fragmentShader are what make the visualization look cool!
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      wireframe: true,
    });
    const planeMesh = new Mesh(planeGeometry, planeMaterial);
    planeMesh.position.add(new THREE.Vector3(0, 0, -1000))
    // planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    planeMesh.scale.x = 10;
    planeMesh.scale.y = 5;
    this.add(planeMesh);

    const render = (time) => {
      // update audio data
      dataArray = analyser.getFrequencyData();

      // update uniforms
      uniforms.u_time.value = time;
      uniforms.u_data_arr.value = dataArray;

      // call render function on every animation frame
      requestAnimationFrame(render);
    };

    // Populate GUI
    this.state.gui.add(this.state, "rotationSpeed", -5, 5).name("Speed");

    render();
  }

  addToUpdateList(object) {
    this.state.updateList.push(object);
  }

  update(timeStamp) {
    const { rotationSpeed, updateList } = this.state;
    // this.rotation.y = (rotationSpeed * timeStamp) / 10000;
    this.background = this.backgroundPalette[(rotationSpeed * timeStamp) % 7];
    // Call update for each object in the updateList
    for (const obj of updateList) {
      obj.update(timeStamp);
    }
  }
}

export default SeedScene;