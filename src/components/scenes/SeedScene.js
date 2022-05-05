import { vertexShader, fragmentShader } from "./Shaders.js";
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
import AUDIO from "../../../slander.mp3";

class SeedScene extends Scene {
  constructor() {
    // Call parent Scene() constructor
    super();

    // Init state
    this.state = {
      gui: new Dat.GUI(), // Create GUI for scene
      rotationSpeed: 5, // speed in which the background color changes
      amplitude: 250, // amplitude of the visualization mesh
      rock: 0.05,
      updateList: [],
    };
    this.people = [];
    this.bop = false;
    // Set background to a nice color

    this.backgroundPalette = [
      new Color(0xfed7c3),
      new Color(0xcce2cb),
      new Color(0xffaea5),
      new Color(0x97c1a9),
      new Color(0xffc8a2),
      new Color(0xffffb5),
      new Color(0xd4f0f0),
    ];
    this.background = this.backgroundPalette[7];
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
      this.people.push(person);
    });
    this.people.forEach((person) => {
      this.add(person);
    });

    // set up listener, sound, audio loader
    const listener = new AudioListener();
    this.add(listener);
    const sound = new Audio(listener);
    const audioLoader = new AudioLoader();
    const audioCtx = new AudioContext();
    let isPlaying = false;

    const playSong = () => {
      this.bop = true;
      audioLoader.load("./slander.mp3", function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.01);
        audioCtx.resume();
        if (!isPlaying) {
          isPlaying = true;
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
    const { amplitude } = this.state;
    const uniforms = {
      u_time: {
        type: "f",
        value: 1.0,
      },
      u_amplitude: {
        type: "f",
        value: amplitude,
      },
      u_data_arr: {
        type: "float[64]",
        value: dataArray,
      },
    };

    // audio visualization
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
    planeMesh.position.add(new THREE.Vector3(0, -50, -1060));
    // planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    planeMesh.scale.x = 10;
    planeMesh.scale.y = 6.5;
    this.add(planeMesh);

    const render = (time) => {
      // update audio data
      dataArray = analyser.getFrequencyData();
      // const { rotationSpeed, updateList } = this.state;
      // this.rotation.y = (rotationSpeed * timeStamp) / 10000;
      // this.background = this.backgroundPalette[
      //   rotationSpeed * (Math.floor(time / 10000) % 7)
      // ];
      // console.log(time);
      // update uniforms
      uniforms.u_time.value = time;
      uniforms.u_data_arr.value = dataArray;
      const { amplitude } = this.state;
      uniforms.u_amplitude.value = amplitude;

      // call render function on every animation frame
      requestAnimationFrame(render);
    };

    // Populate GUI
    this.state.gui.add(this.state, "rotationSpeed", 0, 10).name("Speed");
    this.state.gui.add(this.state, "amplitude", 0, 800).name("Amplitude");
    this.state.gui.add(this.state, "rock", 0, 0.25).name("Audience Energy");

    render();
  }

  addToUpdateList(object) {
    this.state.updateList.push(object);
  }

  update(timeStamp) {
    const { rotationSpeed, updateList, rock } = this.state;
    // this.rotation.y = (rotationSpeed * timeStamp) / 10000;
    this.background = this.backgroundPalette[
      (Math.floor(rotationSpeed) * timeStamp) % 7
    ];
    if (this.bop) {
      this.people.forEach((person) => {
        person.rotation.z = rock * Math.sin(timeStamp / 300);
      });
    }

    // Call update for each object in the updateList
    for (const obj of updateList) {
      obj.update(timeStamp);
    }
  }
}

export default SeedScene;
