import * as THREE from "three";
import Chunk from "./Chunk";
import { TerrainGenerator } from "./TerrainGenerator";
import { Pane } from "tweakpane";
import GridMetrics from "./GridMetrics";

export class World extends THREE.Object3D {
    private chunk: Chunk;
    private readonly terrain: THREE.Mesh;
    private readonly terrainMaterial: THREE.MeshPhongMaterial;
    private wireframeMode: boolean = false;
    private readonly wireframe: THREE.LineSegments;
    private readonly wireframeMaterial: THREE.LineBasicMaterial;

    public constructor() {
        super();
        this.guiSetup();
        this.terrainMaterial = new THREE.MeshPhongMaterial({ color: "white" });
        this.terrain = new THREE.Mesh(undefined, this.terrainMaterial);
        this.chunk = new Chunk();
        this.chunk.updateTerrainGeometry();
        this.terrain.geometry = this.chunk.geometry;
        this.wireframeMaterial = new THREE.LineBasicMaterial({
            depthTest: false,
            opacity: 0.25,
            transparent: true,
        });
        this.wireframe = new THREE.LineSegments(
            undefined,
            this.wireframeMaterial
        );
    }

    public generate() {
        this.remove(this.terrain);
        this.remove(this.wireframe);

        console.log(this.wireframeMode);
        if (this.wireframeMode) {
            const wireframeGeometry = new THREE.WireframeGeometry(
                this.chunk.geometry
            );
            this.wireframe.geometry = wireframeGeometry;
            this.add(this.wireframe);
        } else {
            this.chunk.updateTerrainGeometry();
            this.add(this.terrain);
        }
    }

    private guiSetup() {
        const dragElement = (elmnt: HTMLElement, anchor: HTMLElement) => {
            let pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0;

            const header = document.getElementById(anchor.id + "header");
            if (header) {
                // if present, the header is where you move the DIV from:
                header.onmousedown = dragMouseDown;
                console.log("header");
            } else {
                // otherwise, move the DIV from anywhere inside the DIV:
                anchor.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e: MouseEvent) {
                e = e || window.event;
                e.preventDefault();
                // get the mouse cursor position at startup:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e: MouseEvent) {
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position:
                elmnt.style.top = elmnt.offsetTop - pos2 + "px";
                elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
            }

            function closeDragElement() {
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        };

        const guiContainerElement =
            document.getElementById("gui-container") || undefined;
        const pane = new Pane({
            title: "Configuration",
            container: guiContainerElement,
        });
        if (guiContainerElement) {
            const dragZone = document.createElement("div");
            dragZone.setAttribute("id", "drag-zone");
            pane.element.appendChild(dragZone);
            dragElement(guiContainerElement, dragZone);
        }

        let folder = pane.addFolder({ title: "General" });
        let checkbox = { wireframe: this.wireframeMode };
        folder.addInput(checkbox, "wireframe").on("change", (e) => {
            this.wireframeMode = e.value;
            this.generate();
        });

        folder = pane.addFolder({ title: "GroundNoise" });

        const groundNoise = TerrainGenerator.groundNoise;
        folder
            .addInput(TerrainGenerator.groundNoise, "seed", { step: 1 })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "scale", {
                step: 0.1,
                min: 1,
                max: 100,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(TerrainGenerator.groundNoise.settings, "strength", {
                step: 0.1,
                min: 1,
                max: GridMetrics.pointsPerChunk * 2,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "roughness", {
                step: 0.01,
                min: 0,
                max: 2,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "octaves", {
                step: 1,
                min: 1,
                max: 10,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "persistance", {
                step: 0.01,
                min: 0,
                max: 1,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "lacunarity", {
                step: 0.01,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "minValue", {
                step: 0.01,
                min: -1,
                max: 1,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "offset")
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "weight")
            .on("change", this.generate.bind(this));
    }
}
