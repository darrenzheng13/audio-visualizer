import { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import MODEL from "./person.gltf";
import bin from "./person.bin";

class Person extends Group {
  constructor() {
    // Call parent Group() constructor
    super();

    const loader = new GLTFLoader();

    this.name = "person";

    loader.load(MODEL, (gltf) => {
      this.add(gltf.scene);
    });
  }
}

export default Person;
