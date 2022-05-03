import * as Dat from "dat.gui";
import * as THREE from "three";
import { Scene, Color, Camera } from "three";
import { Person, Stage } from "objects";
import { BasicLights } from "lights";

class SeedScene extends Scene {
  constructor() {
    // Call parent Scene() constructor
    super();

    // Init state
    this.state = {
      gui: new Dat.GUI(), // Create GUI for scene
      rotationSpeed: 10, // speed in which the background color changes
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

    // Populate GUI
    this.state.gui.add(this.state, "rotationSpeed", -5, 5).name("Speed");
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
