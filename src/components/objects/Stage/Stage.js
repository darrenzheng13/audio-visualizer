import { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import MODEL from "./scene.gltf";

class Stage extends Group {
  constructor() {
    // Call parent Group() constructor
    super();

    const loader = new GLTFLoader();

    this.name = "stage";

    loader.load(MODEL, (gltf) => {
      this.add(gltf.scene);
    });
  }
}

export default Stage;
