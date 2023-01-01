import * as THREE from "three";
import Application from "./core/Application";
import Canvas from "./core/Canvas";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";
import EventDispatcher from "./core/EventDispatcher";
import { World } from "./procedural_landscape/World";
import Input from "./core/Input";
import GridMetrics from "./procedural_landscape/GridMetrics";
import InfiniteTerrainGenerator from "./procedural_landscape/InfiniteTerrainGenerator";

const canvas = new Canvas({ elementId: "c" });
const app = new Application(canvas);
const renderer = app.renderer;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

{
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
}

{
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 0.2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
}

const world = new World();
world.generate();
scene.add(world);

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

// const orbitCameraController = new OrbitControls(camera, canvas.domElement);
const freeCameraController = new FirstPersonControls(camera, canvas.domElement);
freeCameraController.lookSpeed = 0.0001;
freeCameraController.movementSpeed = 0.01;

const resetCamera = () => {
    let center = new THREE.Vector3(0, 0, 0);
    center.addScalar(GridMetrics.pointsPerChunk / 2);
    freeCameraController.object.position.set(center.x, center.y, center.z);
    // orbitCameraController.target = center;
};

resetCamera();

app.onUpdate = (deltaTime: number) => {
    // orbitCameraController.update();
    // if (Input.isKeyPressed("Space")) {
    //     cameraController = cameraController == orbitCameraController ? freeCameraController : orbitCameraController;
    // }
    world.update(freeCameraController.object.position);
    freeCameraController.update(deltaTime);
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
