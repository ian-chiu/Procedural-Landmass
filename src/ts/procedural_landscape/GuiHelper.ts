import { Pane } from "tweakpane";
import MaterialGenerator from "./MaterialGenerator";
import InfiniteTerrainGenerator from "./InfiniteTerrainGenerator";
import { ShapeGenerator } from "./ShapeGenerator";
import Chunk from "./Chunk";

export class GuiHelper {
    private constructor() {}

    public static fogEnabled = true;

    public static setup() {
        const dragElement = (elmnt: HTMLElement, anchor: HTMLElement) => {
            let pos1 = 0,
                pos2 = 0,
                pos3 = 0,
                pos4 = 0;

            const header = document.getElementById(anchor.id + "header");
            if (header) {
                // if present, the header is where you move the DIV from:
                header.onmousedown = dragMouseDown;
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

        pane.expanded = false;
        let folder = pane.addFolder({ title: "General" });

        const fogInput = { fog: true };
        folder.addInput(fogInput, "fog").on("change",
            (event) => { GuiHelper.fogEnabled = event.value; });

        folder = pane.addFolder({ title: "TerrainNoise" });

        const terrainNoise = ShapeGenerator.getInstance().terrainNoise;
        folder
            .addInput(terrainNoise, "seed", { step: 1 })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "scale", {
                step: 0.1,
                min: 1,
                max: 100,
            })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "strength", {
                step: 0.1,
                min: 1,
                max: Chunk.sizeY * 2,
            })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "roughness", {
                step: 0.01,
                min: 0,
                max: 2,
            })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "octaves", {
                step: 1,
                min: 1,
                max: 10,
            })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "persistance", {
                step: 0.01,
                min: 0,
                max: 1,
            })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "lacunarity", {
                step: 0.01,
            })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "hardFloor", {
                step: 0.01,
                min: -2,
                max: 2,
            })
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "offset")
            .on("change", this.update.bind(this));
        folder
            .addInput(terrainNoise.settings, "weight")
            .on("change", this.update.bind(this));

        folder = pane.addFolder({ title: "Regions" });
        const commonFolder = folder.addFolder({ title: "Common" });
        const materialGenerator = MaterialGenerator.getInstance();
        // commonFolder
        //     .addInput(materialGenerator, "slopeThreshold", {
        //         min: 0,
        //         max: 1,
        //     })
        //     .on("change", () => {
        //         materialGenerator.material.userData.slopeThreshold.value =
        //             materialGenerator.slopeThreshold;
        //         this.update();
        //     });
        // commonFolder
        //     .addInput(materialGenerator, "slopeBlend", {
        //         min: 0,
        //         max: 1,
        //     })
        //     .on("change", () => {
        //         materialGenerator.material.userData.slopeBlend.value =
        //             materialGenerator.slopeBlend;
        //         this.update();
        //     });
        // commonFolder
        //     .addInput(materialGenerator, "steepColor", {
        //         color: { type: "float" },
        //     })
        //     .on("change", this.update.bind(this));

        const userData = materialGenerator.material.userData;
        const input = {
            colorStartHeight: userData.minHeight.value,
            colorEndHeight: userData.maxHeight.value
        }
        commonFolder
            .addInput(input, "colorStartHeight", {
                min: -Chunk.sizeY,
                max: Chunk.sizeY
            })
            .on("change", (event) => {
                userData.minHeight.value = event.value;
            });
        commonFolder
            .addInput(input, "colorEndHeight", {
                min: -Chunk.sizeY,
                max: Chunk.sizeY
            })
            .on("change", (event) => {
                userData.maxHeight.value = event.value;
            });

        const update = () => {
            this.onChangeRegionFromGUI();
        };
        for (let i = 0; i < materialGenerator.regionCount; i++) {
            const region = materialGenerator.regions[i];
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

    private static update() {
        const chunks =
            InfiniteTerrainGenerator.getInstance().chunks;
        for (const chunk of chunks) {
            chunk.update();
        }
    }

    private static onChangeRegionFromGUI() {
        const materialGenerator = MaterialGenerator.getInstance();
        for (let i = 0; i < materialGenerator.regionCount; i++) {
            const color = materialGenerator.regions[i].color;
            const height = materialGenerator.regions[i].height;
            const blend = materialGenerator.regions[i].blend;
            const userData = materialGenerator.material.userData;
            userData.baseColors.value[i].setRGB(color.r, color.g, color.b);
            userData.baseBeginHeights.value[i] = height;
            userData.baseBlends.value[i] = blend;
        }
    }
}
