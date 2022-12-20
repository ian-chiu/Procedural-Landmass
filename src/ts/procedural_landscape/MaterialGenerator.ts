import * as THREE from "three";
import GridMetrics from "./GridMetrics";
import { shaderChunk } from "./shaderChunks";

const MAX_REGION_COUNT = 8;

type RegionType = {
    name: string;
    height: number;
    blend: number;
    color: THREE.Color;
};

class MaterialGenerator {
    public material: THREE.MeshPhongMaterial;
    public slopeThreshold = 0.5;
    public slopeBlend = 0.5;
    public regionCount: number;
    public regions: RegionType[];
    public steepColor: THREE.Color;

    public constructor(
        minHeight: number,
        maxHeight = GridMetrics.pointsPerChunk
    ) {
        this.steepColor = new THREE.Color("rgb(131, 85, 61)");
        const regions: RegionType[] = [
            {
                name: "water",
                height: 0.0,
                blend: 0.0,
                color: new THREE.Color("#2255ee"),
            },
            {
                name: "sand",
                height: 0.05,
                blend: 0.02,
                color: new THREE.Color("#fff4c6"),
            },
            {
                name: "grass 1",
                height: 0.1,
                blend: 0.02,
                color: new THREE.Color("#8AAA31"),
            },
            {
                name: "grass 2",
                height: 0.32,
                blend: 0.2,
                color: new THREE.Color("#396C1B"),
            },
            {
                name: "rock",
                height: 0.5,
                blend: 0.1,
                color: new THREE.Color().copy(this.steepColor),
            },
            {
                name: "snow",
                height: 0.7,
                blend: 0.12,
                color: new THREE.Color("#eaeaea"),
            },
        ];
        this.regions = regions;
        this.regionCount = regions.length;
        while (this.regions.length < MAX_REGION_COUNT) {
            this.regions.push({
                name: "unknown",
                height: 0,
                blend: 0,
                color: new THREE.Color(),
            });
        }
        while (this.regions.length > MAX_REGION_COUNT) {
            this.regions.pop();
        }
        Object.freeze(this.regions);

        this.material = new THREE.MeshPhongMaterial({ color: "white" });
        this.material.userData = {
            minHeight: { value: minHeight },
            maxHeight: { value: maxHeight },
            regionCount: { value: this.regionCount },
            slopeThreshold: { value: this.slopeThreshold },
            slopeBlend: { value: this.slopeBlend },
            steepColor: { value: this.steepColor },
            baseColors: {
                value: this.regions.map((item: any) => item.color),
            },
            baseBeginHeights: {
                value: this.regions.map((item: any) => item.height),
            },
            baseBlends: {
                value: this.regions.map((item: any) => item.blend),
            },
        };
        this.material.onBeforeCompile = (shader) => {
            shader.uniforms.minHeight = this.material.userData.minHeight;
            shader.uniforms.maxHeight = this.material.userData.maxHeight;
            shader.uniforms.slopeThreshold =
                this.material.userData.slopeThreshold;
            shader.uniforms.slopeBlend = this.material.userData.slopeBlend;
            shader.uniforms.regionCount = this.material.userData.regionCount;
            shader.uniforms.steepColor = this.material.userData.steepColor;
            shader.uniforms.baseColors = this.material.userData.baseColors;
            shader.uniforms.baseBeginHeights =
                this.material.userData.baseBeginHeights;
            shader.uniforms.baseBlends = this.material.userData.baseBlends;

            shader.vertexShader =
                shaderChunk.prepareVertex + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                "#include <worldpos_vertex>",
                shaderChunk.worldposVertex
            );
            shader.fragmentShader =
                shaderChunk.prepareFragment + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                shaderChunk.colorFragment
            );
        };
    }
}

export default MaterialGenerator;
