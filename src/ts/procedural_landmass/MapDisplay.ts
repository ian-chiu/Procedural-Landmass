import * as THREE from "three"
import { mapLinear } from "three/src/math/MathUtils";

export class MapDisplay
{
    public static generateTexture(dataMap: number[][] | THREE.Color[][]) {
        const width = dataMap[0].length, height = dataMap.length;
        const size = width * height;
        const data = new Uint8Array(size * 4);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let stride = (y * width + x) * 4;
                let color = [0, 0, 0];
                if (typeof dataMap[0][0] === "number") {
                    const noiseMap = dataMap as number[][];
                    const noiseHeight = mapLinear(noiseMap[y][x], 0, 1, 0, 255);
                    color = new Array(3).fill(noiseHeight);
                }
                else {
                    const colorMap = dataMap as THREE.Color[][];
                    color[0] = mapLinear(colorMap[y][x].r, 0, 1, 0, 255);
                    color[1] = mapLinear(colorMap[y][x].g, 0, 1, 0, 255);
                    color[2] = mapLinear(colorMap[y][x].b, 0, 1, 0, 255);
                }
                data[ stride ] = color[0];               // red
                data[ stride + 1 ] = color[1];           // green
                data[ stride + 2 ] = color[2];           // blue
                data[ stride + 3 ] = 255;                // alpha
            }
        }
        const texture = new THREE.DataTexture( data, width, height );
        texture.magFilter = THREE.NearestFilter;
        texture.needsUpdate = true;
        return texture;
    }
    public static generateTerrainGeometry(noiseMap: number[][], levelOfDetail: number) {
        const width = noiseMap[0].length, height = noiseMap.length;
        const halfWidth = Math.floor(width / 2);
        const halfHeight = Math.floor(height / 2);

        let step = levelOfDetail === 0 ? 1 : levelOfDetail * 2;
        let nSideVert = (width - 1) / step + 1;

        const positions: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];
        let vertIdx = 0;
        for (let row = 0; row < height; row += step) {
            for (let col = 0; col < width; col += step) { 
                const y = Math.pow(noiseMap[row][col], 4) * 20;
                positions.push(col - halfWidth, y, row - halfHeight);
                uvs.push(col / width, row / height);

                if (col < width - 1 && row < height - 1) {
                    indices.push(vertIdx, vertIdx + nSideVert + 1, vertIdx + 1);
                    indices.push(vertIdx, vertIdx + nSideVert, vertIdx + nSideVert + 1);
                }
                vertIdx++;
            }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
        geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvs), 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }
}
