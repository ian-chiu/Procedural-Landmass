import * as THREE from "three";
import GridMetrics from "./GridMetrics";
import { ShapeGenerator } from "./ShapeGenerator";

const MAX_TRIANGLES = 5;

class Chunk {
    public shapeGenerator: ShapeGenerator;
    public readonly geometry: THREE.BufferGeometry;

    public constructor() {
        this.shapeGenerator = new ShapeGenerator();
        const positions = new Float32Array(
            GridMetrics.size * MAX_TRIANGLES * 3 * 3
        );
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );
    }

    public update(): void {
        const { positions, indices } = this.shapeGenerator.generate();
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
        this.geometry.computeTangents();
    }
}

export default Chunk;
