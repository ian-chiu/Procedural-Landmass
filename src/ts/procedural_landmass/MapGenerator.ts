import * as THREE from "three";
import GUI from "lil-gui";
import { shaderChunks } from "./shaderChunks";
import Chunk from "./Chunk";
import { NoiseDensity } from "./NoiseDensity";

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
            this.regions = regions.map((item: any) => ({ ...item, color: new THREE.Color(item.color)}))
        }

        // GUI setup
        // -------------------------------------------------------------------------------------------------------
        this.gui = new GUI;
        this.gui.add(this, "wireframeMode").name("wireframe").onChange(this.generate.bind(this));
        this.gui.add(this, "levelOfDetail", 0, 6, 1).name("level of detail").onChange(this.generate.bind(this));

        const noiseFolder = this.gui.addFolder("Noise");
        this.regionsFolder = this.gui.addFolder("Regions");
        this.regionsFolder.close();

        noiseFolder.add(this.parameters, "seed").onChange(this.generate.bind(this));
        noiseFolder.add(this.parameters, "scale", 1, 100, 0.001).onChange(this.generate.bind(this));
        noiseFolder.add(this.parameters, "strength", 1, 100).onChange(this.generate.bind(this));
        noiseFolder.add(this.parameters, "octaves", 0, 10, 1).onChange(this.generate.bind(this));
        noiseFolder.add(this.parameters, "persistance", 0, 1, 0.01).onChange(this.generate.bind(this));
        noiseFolder.add(this.parameters, "lacunarity", 1, 10, 0.01).onChange(this.generate.bind(this));

        this.regionsFolder.add(this, "onPushNewRegionFromGui").name("+")
        this.regionsFolder.add(this, "onPopRegionFromGUI").name("-")
        for (let i = 0; i < this.regions.length; i++) {
            this.addRegionFolder(i);
        }

        this.curveFunction = (h: number) => Math.pow(h, 2);
        // -------------------------------------------------------------------------------------------------------

        const planeGeometry = new THREE.PlaneGeometry(4, 4);
        this.planeMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
        this.plane = new THREE.Mesh(planeGeometry, this.planeMaterial);

        this.terrainMaterial = new THREE.MeshPhongMaterial({ color: "white" });
        this.terrainMaterial.userData = {
            minHeight: { value: 0.0 },
            maxHeight: { value: 1.0 },
            baseColors: {
                value: this.regions.map((item: any) => new THREE.Vector3(item.color.r, item.color.g, item.color.b))
            },
            baseBeginHeights: {
                value: this.regions.map((item: any) => this.curveFunction(item.height))
            },
            baseBlends: {
                value: this.regions.map((item: any) => item.blend)
            }
        };
        this.terrainMaterial.onBeforeCompile = shader => {
            shader.uniforms.minHeight = this.terrainMaterial.userData.minHeight;
            shader.uniforms.maxHeight = this.terrainMaterial.userData.maxHeight;
            shader.uniforms.baseColors = this.terrainMaterial.userData.baseColors;
            shader.uniforms.baseBeginHeights = this.terrainMaterial.userData.baseBeginHeights;
            shader.uniforms.baseBlends = this.terrainMaterial.userData.baseBlends;

            shader.vertexShader = "varying vec4 vWorldPosition;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace("#include <worldposvertex>", shaderChunks.worldposVertex);

            shader.fragmentShader = shaderChunks.prepareFragment + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace("#include <colorfragment>", shaderChunks.colorFragment);
        };
        this.terrain = new THREE.Mesh(undefined, this.terrainMaterial);

        this.wireframeMaterial = new THREE.LineBasicMaterial({ depthTest: false, opacity: 0.25, transparent: true });
        this.wireframe = new THREE.LineSegments(undefined, this.wireframeMaterial);

        this.chunk = new Chunk(this.parameters);
        this.chunk.generateMesh();
    }

    public generate() {
        const clear = () => {
            this.remove(this.plane);
            this.remove(this.terrain);
            this.remove(this.wireframe);
        }

        clear();
        this.terrainMaterial.userData.minHeight.value = this.chunk.geometry.userData.minHeight;
        this.terrainMaterial.userData.maxHeight.value = this.chunk.geometry.userData.maxHeight;
        if (this.wireframeMode) {
            const wireframeGeometry = new THREE.WireframeGeometry(this.chunk.geometry);
            this.wireframe.geometry = wireframeGeometry;
            this.add(this.wireframe);
        }
        else {
            this.chunk.noiseDensity = NoiseDensity.generateDensity(this.parameters);
            this.chunk.generateMesh();
            this.terrain.geometry = this.chunk.geometry;
            this.add(this.terrain);
        }
    }

    private onPushNewRegionFromGui() {
        const length = this.regions.length;
        if (length === maxNumRegions) {
            return;
        }
        this.regions.push({
            name: `default${length}`,
            height: 1.0,
            blend: 0.0,
            color: new THREE.Color("white")
        });
        this.addRegionFolder(length);
        this.onChangeRegionFromGUI();
    }

    private onPopRegionFromGUI() {
        if (this.regions.length === 0) {
            return;
        }
        this.regionsFolder.children.slice(-1)[0].destroy();
        this.regions.pop();
        this.onChangeRegionFromGUI();
    }

    private onChangeRegionFromGUI() {
        const regions = this.regions.map(item => ({...item, color: `#${item.color.getHexString()}` }));
        for (let i = 0; i < regions.length; i++) {
            const color = this.regions[i].color;
            const height = this.regions[i].height;
            const blend = this.regions[i].blend;
            this.terrainMaterial.userData.baseColors.value[i].set(color.r, color.g, color.b);
            this.terrainMaterial.userData.baseBeginHeights.value[i] = this.curveFunction(height);
            this.terrainMaterial.userData.baseBlends.value[i] = blend;
        }
        localStorage.setItem("regions", JSON.stringify(regions));
    }

    private addRegionFolder(index: number) {
        const region = this.regions[index];
        const regionFolder = this.regionsFolder.addFolder(`index ${index}`);
        const update = () => {
            this.generate();
            this.onChangeRegionFromGUI();
        }
        regionFolder.add(region, "name").onChange(update);
        regionFolder.add(region, "height", 0, 1).onChange(update);
        regionFolder.add(region, "blend", 0, 1).onChange(update);
        regionFolder.addColor(new ColorGUIHelper(region, "color"), "value").name("color").onChange(update);
    }

    private chunk: Chunk;

    private readonly gui: GUI;
    private readonly regionsFolder: GUI;

    private readonly plane: THREE.Mesh;
    private readonly planeMaterial: THREE.MeshBasicMaterial;
    private readonly terrain: THREE.Mesh;
    private readonly terrainMaterial: THREE.MeshPhongMaterial;
    private wireframeMode: boolean = false;
    private readonly wireframe: THREE.LineSegments;
    private readonly wireframeMaterial: THREE.LineBasicMaterial;
    private readonly curveFunction: (x: number) => number;

    private levelOfDetail = 0;
    private readonly parameters: NoiseDensity.Parameters = {
        seed: 777,
        strength: 7,
        scale: 50,
        groundPercent: 0.5,
        octaves: 9,
        persistance: 0.5,
        lacunarity: 2,
    };
    private regions: TerrainType[] = [
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
