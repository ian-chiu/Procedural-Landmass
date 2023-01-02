import * as THREE from "three";
import Application from "./core/Application";
import Canvas from "./core/Canvas";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import EventDispatcher from "./core/EventDispatcher";
import { GuiHelper } from "./procedural_landscape/GuiHelper";
import Chunk from "./procedural_landscape/Chunk";
import InfiniteTerrainGenerator from "./procedural_landscape/InfiniteTerrainGenerator";

const canvas = new Canvas({ elementId: "c" });
const app = new Application(canvas);
const renderer = app.renderer;
const scene = new THREE.Scene();
const infiniteTerrainGenerator = InfiniteTerrainGenerator.getInstance();

GuiHelper.setup();

{
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    light.castShadow = true;
    scene.add(light);
    scene.add(light.target);
}

{
    const skyColor = 'lightblue'; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 0.2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    light.castShadow = true;
    scene.add(light);
}

const near = 1;
const far = infiniteTerrainGenerator.getVisibleDistance();
const color = 'lightblue';
const fog = new THREE.Fog(color, near, far);
scene.fog = fog;
scene.background = new THREE.Color(color);

const cameraProps = {
    fov: 50,
    aspect: canvas.aspect,
    near: 0.1,
    far: 500,
};
const camera = new THREE.PerspectiveCamera(
    cameraProps.fov,
    cameraProps.aspect,
    cameraProps.near,
    cameraProps.far
);
const flyCameraControl = new FirstPersonControls(camera, canvas.domElement);
flyCameraControl.lookSpeed = 0.0001;
flyCameraControl.movementSpeed = 0.015;
const resetCamera = () => {
    let center = new THREE.Vector3(Chunk.sizeXZ / 2, -5, Chunk.sizeXZ / 2);
    camera.position.copy(center);
    flyCameraControl.lookAt(center.x, -10, center.z + 10);
};
resetCamera();

const paneBarButton = document.getElementsByClassName("tp-rotv_b").item(0) as HTMLButtonElement;
let cameraEnabled = true;
window.addEventListener("mousedown", (event) => {
    if (event.button === 1) {
        cameraEnabled = !cameraEnabled;
        paneBarButton.click();
    }
});

for (const chunk of infiniteTerrainGenerator.chunks) {
    scene.add(chunk.mesh);
}
app.onUpdate = (deltaTime: number) => {
    infiniteTerrainGenerator.update(camera);
    for (const chunk of infiniteTerrainGenerator.chunks) {
        chunk.mesh.visible = chunk.active;
    }

    if (cameraEnabled) {
        flyCameraControl.update(deltaTime);
    }

    if (GuiHelper.fogEnabled) {
        fog.far = infiniteTerrainGenerator.getVisibleDistance();
    } else if (!GuiHelper.fogEnabled) {
        fog.far = 0;
    }

    // bgMesh.position.copy(camera.position);
    // renderer.render(bgScene, camera);
    renderer.render(scene, camera);
};

app.onEvent = (event: Event) => {
    const dispatcher = new EventDispatcher(event);
    dispatcher.dispatch("resize", (e: Event) => {
        camera.aspect = canvas.aspect;
        camera.updateProjectionMatrix();
        return true;
    });
};

app.run();
