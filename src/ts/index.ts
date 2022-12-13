import * as THREE from "three"
import Application from "./core/Application";
import Canvas from "./core/Canvas";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import EventDispatcher from "./core/EventDispatcher";
import { MapGenerator } from "./procedural_landmass/MapGenerator";

const canvas = new Canvas({ elementId: "c" });
const app = new Application(canvas);
const renderer = app.renderer;

const cameraProps = {
    fov: 50,
    aspect: canvas.aspect,
    near: 0.1,
    far: 500
};
const camera = new THREE.PerspectiveCamera(cameraProps.fov, cameraProps.aspect, cameraProps.near, cameraProps.far);
const orbitCameraController = new OrbitControls(camera, canvas.domElement);

const scene = new THREE.Scene;
scene.background = new THREE.Color(0X333333);

{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
}

{
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 0.2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
}


const mapGenerator = new MapGenerator;
mapGenerator.generate();
scene.add(mapGenerator);

const resetCamera = () => {
    camera.position.set(0, 100, -200);
    camera.lookAt(0, 0, 0);
}

resetCamera();

app.onUpdate = (deltaTime: number) => {
    orbitCameraController.update();
    renderer.render(scene, camera);
}

app.onEvent = (event: Event) => {
    const dispatcher = new EventDispatcher(event);
    dispatcher.dispatch("resize", (e: Event) => {
        camera.aspect = canvas.aspect;
        camera.updateProjectionMatrix();
        return true;
    });
}

app.run();
