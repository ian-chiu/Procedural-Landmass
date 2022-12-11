import * as THREE from "three";
import { MapDisplay } from "./MapDisplay";
import { Noise } from "./Noise";
import GUI from "lil-gui";
import { Vector2 } from "three";
import { shaderChunks } from "./shaderChunks";

class ColorGUIHelper
{
    constructor(object: Object, prop: any) {
        this.object = object;
        this.prop = prop;
    }
    get value() {
        return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
        this.object[this.prop].set(hexString);
    }
    private object: { [k: string]: any };
    private prop: any;
}

type TerrainType = {
    name: string,
    height: number,
    blend: number,
    color: THREE.Color
}

const maxNumRegions = 20;

export class MapGenerator extends THREE.Object3D
{
    public constructor() {
        super();

        if (localStorage.getItem("regions")) {
            const text = localStorage.getItem("regions") as string;
            const regions = JSON.parse(text);
            this._regions = regions.map((item: any) => ({ ...item, color: new THREE.Color(item.color)}))
        }

        this._drawMode = MapGenerator.DrawMode.Terrain;

        // GUI setup
        // -------------------------------------------------------------------------------------------------------
        this._gui = new GUI;
        const drawModes = {
            "NoiseMap": MapGenerator.DrawMode.NoiseMap,
            "ColorMap": MapGenerator.DrawMode.ColorMap,
            "Terrain": MapGenerator.DrawMode.Terrain
        };
        this._gui.add(this, "_drawMode", drawModes).name("draw mode").onChange(this.generate.bind(this));
        this._gui.add(this, "_wireframeMode").name("wireframe").onChange(this.generate.bind(this));
        this._gui.add(this, "_levelOfDetail", 0, 6, 1).name("level of detail").onChange(this.generate.bind(this));

        const noiseFolder = this._gui.addFolder("Noise");
        this._regionsFolder = this._gui.addFolder("Regions");
        this._regionsFolder.close();

        noiseFolder.add(this._parameters, "seed").onChange(this.generate.bind(this));
        noiseFolder.add(this._parameters, "scale", 0.1, 5000, 0.001).onChange(this.generate.bind(this));
        noiseFolder.add(this._parameters, "heightMultiplier", 1, 1000, 0.001).onChange(this.generate.bind(this));
        noiseFolder.add(this._parameters, "octaves", 0, 10, 1).onChange(this.generate.bind(this));
        noiseFolder.add(this._parameters, "persistance", 0, 1, 0.01).onChange(this.generate.bind(this));
        noiseFolder.add(this._parameters, "lacunarity", 1, 10, 0.01).onChange(this.generate.bind(this));
        noiseFolder.add(this._parameters.offset, "x", -100, 100, 0.001).name("offset X").onChange(this.generate.bind(this));
        noiseFolder.add(this._parameters.offset, "y", -100, 100, 0.001).name("offset Y").onChange(this.generate.bind(this));

        this._regionsFolder.add(this, "onPushNewRegionFromGui").name("+")
        this._regionsFolder.add(this, "onPopRegionFromGUI").name("-")
        for (let i = 0; i < this._regions.length; i++) {
            this.addRegionFolder(i);
        }

        this._curveFunction = (h: number) => Math.pow(h, 4);
        // -------------------------------------------------------------------------------------------------------

        const planeGeometry = new THREE.PlaneGeometry(4, 4);
        this._planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
        this._plane = new THREE.Mesh(planeGeometry, this._planeMaterial);

        this._terrainMaterial = new THREE.MeshPhongMaterial({ color: "white" });
        this._terrainMaterial.userData = {
            minHeight: { value: 0.0 },
            maxHeight: { value: 1.0 },
            baseColors: {
                value: this._regions.map((item: any) => new THREE.Vector3(item.color.r, item.color.g, item.color.b))
            },
            baseBeginHeights: {
                value: this._regions.map((item: any) => this._curveFunction(item.height))
            },
            baseBlends: {
                value: this._regions.map((item: any) => item.blend)
            }
        };
        this._terrainMaterial.onBeforeCompile = shader => {
            shader.uniforms.minHeight = this._terrainMaterial.userData.minHeight;
            shader.uniforms.maxHeight = this._terrainMaterial.userData.maxHeight;
            shader.uniforms.baseColors = this._terrainMaterial.userData.baseColors;
            shader.uniforms.baseBeginHeights = this._terrainMaterial.userData.baseBeginHeights;
            shader.uniforms.baseBlends = this._terrainMaterial.userData.baseBlends;

            shader.vertexShader = "varying vec4 vWorldPosition;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace("#include <worldpos_vertex>", shaderChunks.worldposVertex);

            shader.fragmentShader = shaderChunks.prepareFragment + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", shaderChunks.colorFragment);
        };
        this._terrain = new THREE.Mesh(undefined, this._terrainMaterial);

        this._wireframeMaterial = new THREE.LineBasicMaterial({ depthTest: false, opacity: 0.25, transparent: true });
        this._wireframe = new THREE.LineSegments(undefined, this._wireframeMaterial);
    }

    public generate() {
        const noiseMap = Noise.generateNoiseMap(this._chunkSize, this._chunkSize, this._parameters);
        const colorMap: THREE.Color[][] = [];
        for (let y = 0; y < noiseMap.length; y++) {
            const row = [] as THREE.Color[];
            for (let x = 0; x < noiseMap[0].length; x++) {
                const noiseHeight = noiseMap[y][x];
                let color = new THREE.Color("white");
                for (const region of this._regions) {
                    if (region.height > noiseHeight) {
                        color = region.color;
                        break;
                    }
                }
                row.push(color);
            }
            colorMap.push(row);
        }

        const clear = () => {
            this.remove(this._plane);
            this.remove(this._terrain);
            this.remove(this._wireframe);
        }

        if (this._drawMode === MapGenerator.DrawMode.NoiseMap) {
            clear();
            const texture = MapDisplay.generateTexture(noiseMap);
            this._planeMaterial.map = texture;
            this.add(this._plane);
        }
        else if (this._drawMode === MapGenerator.DrawMode.ColorMap) {
            clear();
            const texture = MapDisplay.generateTexture(colorMap);
            this._planeMaterial.map = texture;
            this.add(this._plane);
        }
        else if (this._drawMode === MapGenerator.DrawMode.Terrain) {
            clear();
            const geometry = MapDisplay.generateTerrainGeometry(noiseMap, this._levelOfDetail,
                this._parameters.heightMultiplier, this._curveFunction);
            this._terrainMaterial.userData.minHeight.value = geometry.userData.minHeight;
            this._terrainMaterial.userData.maxHeight.value = geometry.userData.maxHeight;
            // const texture = MapDisplay.generateTexture(colorMap);
            if (this._wireframeMode) {
                const wireframeGeometry = new THREE.WireframeGeometry(geometry);
                this._wireframe.geometry = wireframeGeometry;
                this.add(this._wireframe);
            }
            else {
                this._terrain.geometry = geometry;
                // this._terrainMaterial.map = texture;
                this.add(this._terrain);
            }
        }
    }

    public get drawMode() {
        return this._drawMode;
    }

    private onPushNewRegionFromGui() {
        const length = this._regions.length;
        if (length === maxNumRegions) {
            return;
        }
        this._regions.push({
            name: `default_${length}`,
            height: 1.0,
            blend: 0.0,
            color: new THREE.Color("white")
        });
        this.addRegionFolder(length);
        this.onChangeRegionFromGUI();
    }

    private onPopRegionFromGUI() {
        if (this._regions.length === 0) {
            return;
        }
        this._regionsFolder.children.slice(-1)[0].destroy();
        this._regions.pop();
        this.onChangeRegionFromGUI();
    }

    private onChangeRegionFromGUI() {
        const regions = this._regions.map(item => ({...item, color: `#${item.color.getHexString()}` }));
        for (let i = 0; i < regions.length; i++) {
            const color = this._regions[i].color;
            const height = this._regions[i].height;
            const blend = this._regions[i].blend;
            this._terrainMaterial.userData.baseColors.value[i].set(color.r, color.g, color.b);
            this._terrainMaterial.userData.baseBeginHeights.value[i] = this._curveFunction(height);
            this._terrainMaterial.userData.baseBlends.value[i] = blend;
        }
        localStorage.setItem("regions", JSON.stringify(regions));
    }

    private addRegionFolder(index: number) {
        const region = this._regions[index];
        const regionFolder = this._regionsFolder.addFolder(`index ${index}`);
        const update = () => {
            this.generate();
            this.onChangeRegionFromGUI();
        }
        regionFolder.add(region, "name").onChange(update);
        regionFolder.add(region, "height", 0, 1).onChange(update);
        regionFolder.add(region, "blend", 0, 1).onChange(update);
        regionFolder.addColor(new ColorGUIHelper(region, "color"), "value").name("color").onChange(update);
    }

    private readonly _gui: GUI;
    private readonly _regionsFolder: GUI;

    private readonly _plane: THREE.Mesh;
    private readonly _planeMaterial: THREE.MeshBasicMaterial;
    private readonly _terrain: THREE.Mesh;
    private readonly _terrainMaterial: THREE.MeshPhongMaterial;
    private _wireframeMode: boolean = false;
    private readonly _wireframe: THREE.LineSegments;
    private readonly _wireframeMaterial: THREE.LineBasicMaterial;
    private readonly _curveFunction: (x: number) => number;

    private _drawMode: MapGenerator.DrawMode;
    private readonly _chunkSize = 241;
    private _levelOfDetail = 0;
    private readonly _parameters = {
        seed: 168,
        scale: 500,
        heightMultiplier: 75,
        octaves: 6,
        persistance: 0.5,
        lacunarity: 2,
        offset: new Vector2(0, 0)
    };
    private _regions: TerrainType[] = [
        {
            name: "deep water",
            height: 0,
            blend: 0.0,
            color: new THREE.Color("#2255ee")
        },
        {
            name: "water",
            height: 0.25,
            blend: 0.0,
            color: new THREE.Color("#5179ee")
        },
        {
            name: "sand",
            height: 0.35,
            blend: 0.0,
            color: new THREE.Color("#fff4c6")
        },
        {
            name: "grass 1",
            height: 0.4,
            blend: 0.0,
            color: new THREE.Color("#60bb60")
        },
        {
            name: "grass 2",
            height: 0.55,
            blend: 0.0,
            color: new THREE.Color("#468a46")
        },
        {
            name: "rock 1",
            height: 0.7,
            blend: 0.0,
            color: new THREE.Color("#694f35")
        },
        {
            name: "rock 2",
            height: 0.8,
            blend: 0.0,
            color: new THREE.Color("#423324")
        },
        {
            name: "snow",
            height: 0.9,
            blend: 0.0,
            color: new THREE.Color("#eaeaea")
        },
    ]
}

export namespace MapGenerator {
    export enum DrawMode {
        NoiseMap, ColorMap, Terrain
    }
}
