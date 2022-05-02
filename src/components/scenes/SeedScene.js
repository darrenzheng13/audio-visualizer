import * as Dat from "dat.gui";
import * as THREE from "three";
import { Scene, Color } from "three";
import { Flower, Land, Person, Stage } from "objects";
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
    // const land = new Land();
    const stage = new Stage();
    const person = new Person();
    // person.position.add(new THREE.Vector3(-500, -500, -500));
    const lights = new BasicLights();
    // position stage
    stage.position.add(new THREE.Vector3(0, -250, -700));
    stage.scale.set(0.4, 0.4, 0.4);
    // this.add(land, stage, flower, lights);
    const geometry = new THREE.ConeGeometry(2, 10, 60);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cone = new THREE.Mesh(geometry, material);
    cone.position.add(new THREE.Vector3(0, 0, -50));
    this.add(stage, person, lights, cone);

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
