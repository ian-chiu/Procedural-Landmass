import * as THREE from "three";
import GridMetrics from "./GridMetrics";
import { TerrainGenerator } from "./TerrainGenerator";

const MAX_TRIANGLES = 5;

class Chunk {
    public readonly geometry = new THREE.BufferGeometry();

    public constructor() {
        const positions = new Float32Array(
            GridMetrics.size * MAX_TRIANGLES * 3 * 3
        );
        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(positions), 3)
        );
    }

    public updateTerrainGeometry() {
        const { positions, indices } = TerrainGenerator.generate();
        this.geometry.attributes.position.needsUpdate = true;
        for (let i = 0; i < positions.length; i += 3) {
            this.geometry.attributes.position.setXYZ(
                i / 3,
                positions[i],
                positions[i + 1],
                positions[i + 2]
            );
        }
        this.geometry.setDrawRange(0, indices.length);
        this.geometry.setIndex(indices);
        this.geometry.computeVertexNormals();
    }
}

export default Chunk;
