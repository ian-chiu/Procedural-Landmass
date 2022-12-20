import * as THREE from "three";
import Chunk from "./Chunk";
import { Pane } from "tweakpane";
import GridMetrics from "./GridMetrics";
import MaterialGenerator from "./MaterialGenerator";

export class World extends THREE.Object3D {
    private _chunk: Chunk;
    private _wireframeMode: boolean = false;
    private readonly _mesh: THREE.Mesh;
    private readonly _materialGenerator: MaterialGenerator;
    private readonly _wireframe: THREE.LineSegments;
    private readonly _wireframeMaterial: THREE.LineBasicMaterial;

    public constructor() {
        super();
        this._chunk = new Chunk();
        this._chunk.update();
        const groundPercent = this._chunk.shapeGenerator.groundPercent;
        const chunkSize = GridMetrics.pointsPerChunk;
        const minHeight = groundPercent * chunkSize - 1;
        this._materialGenerator = new MaterialGenerator(minHeight);
        this._mesh = new THREE.Mesh(
            this._chunk.geometry,
            this._materialGenerator.material
        );
        this._wireframeMaterial = new THREE.LineBasicMaterial({
            depthTest: false,
            opacity: 0.25,
            transparent: true,
        });
        this._wireframe = new THREE.LineSegments(
            this._chunk.geometry,
            this._wireframeMaterial
        );
        this.guiSetup();
    }

    public generate() {
        this.remove(this._mesh);
        this.remove(this._wireframe);

        this._chunk.update();
        this.add(this._wireframeMode ? this._wireframe : this._mesh);
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
        let checkbox = { wireframe: this._wireframeMode };
        folder.addInput(checkbox, "wireframe").on("change", (e) => {
            this._wireframeMode = e.value;
            this.generate();
        });

        folder = pane.addFolder({ title: "GroundNoise" });

        const groundNoise = this._chunk.shapeGenerator.groundNoise;
        folder
            .addInput(groundNoise, "seed", { step: 1 })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "scale", {
                step: 0.1,
                min: 1,
                max: 100,
            })
            .on("change", this.generate.bind(this));
        folder
            .addInput(groundNoise.settings, "strength", {
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

        folder = pane.addFolder({ title: "Regions" });
        const commonFolder = folder.addFolder({ title: "Common" });
        commonFolder
            .addInput(this._materialGenerator, "slopeThreshold", {
                min: 0,
                max: 1,
            })
            .on("change", () => {
                this._materialGenerator.material.userData.slopeThreshold.value =
                    this._materialGenerator.slopeThreshold;
                this.generate();
            });
        commonFolder
            .addInput(this._materialGenerator, "slopeBlend", {
                min: 0,
                max: 1,
            })
            .on("change", () => {
                this._materialGenerator.material.userData.slopeBlend.value =
                    this._materialGenerator.slopeBlend;
                this.generate();
            });
        commonFolder
            .addInput(this._materialGenerator, "steepColor", {
                color: { type: "float" },
            })
            .on("change", this.generate.bind(this));

        const update = () => {
            this.generate();
            this.onChangeRegionFromGUI();
        };
        for (let i = 0; i < this._materialGenerator.regionCount; i++) {
            const region = this._materialGenerator.regions[i];
            const regionFolder = folder.addFolder({ title: `index ${i}` });
            regionFolder.addInput(region, "name").on("change", update);
            regionFolder
                .addInput(region, "height", { min: 0, max: 1 })
                .on("change", update);
            regionFolder
                .addInput(region, "blend", { min: 0, max: 1 })
                .on("change", update);
            regionFolder
                .addInput(region, "color", { color: { type: "float" } })
                .on("change", update);
        }
    }

    private onChangeRegionFromGUI() {
        for (let i = 0; i < this._materialGenerator.regionCount; i++) {
            const color = this._materialGenerator.regions[i].color;
            const height = this._materialGenerator.regions[i].height;
            const blend = this._materialGenerator.regions[i].blend;
            const userData = this._materialGenerator.material.userData;
            userData.baseColors.value[i].setRGB(color.r, color.g, color.b);
            userData.baseBeginHeights.value[i] = height;
            userData.baseBlends.value[i] = blend;
        }
    }
}
