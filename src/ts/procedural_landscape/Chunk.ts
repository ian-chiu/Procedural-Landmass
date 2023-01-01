import * as THREE from "three";
import { Vector2 } from "three";
import GridMetrics from "./GridMetrics";
import MaterialGenerator from "./MaterialGenerator";
import { ShapeGenerator } from "./ShapeGenerator";

const MAX_TRIANGLES = 5;

class Chunk {
    public readonly mesh: THREE.Mesh;
    public readonly wireframe: THREE.LineSegments;
    public readonly position = new THREE.Vector3();
    public readonly chunkCoord = new THREE.Vector2();
    private readonly geometry: THREE.BufferGeometry;

    public toString() {
        return `${this.chunkCoord.x},${this.chunkCoord.y}`;
    }

    public constructor(position = new THREE.Vector3()) {
        this.position = position;
        this.chunkCoord = new Vector2(
            Math.floor(this.position.x / GridMetrics.pointsPerChunk),
            Math.floor(this.position.z / GridMetrics.pointsPerChunk)
        );
        const positions = new Float32Array(
            GridMetrics.size * MAX_TRIANGLES * 3 * 3
        );
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );
        const wireframeMaterial = new THREE.LineBasicMaterial({
            depthTest: false,
            opacity: 0.25,
            transparent: true,
        });
        this.mesh = new THREE.Mesh(
            this.geometry,
            MaterialGenerator.getInstance().material
        );
        this.mesh.name = this.toString();
        this.wireframe = new THREE.LineSegments(
            this.geometry,
            wireframeMaterial
        );
        this.wireframe.name = this.toString();
        this.update();
    }

    public async update(): Promise<void> {
        ShapeGenerator.getInstance().groundNoise.settings.offset =
            this.position;
        const { positions, indices } = ShapeGenerator.getInstance().generate();
        this.geometry.attributes.position.needsUpdate = true;
        for (let i = 0; i < positions.length; i += 3) {
            this.geometry.attributes.position.setXYZ(
                i / 3,
                positions[i] + this.position.x,
                positions[i + 1] + this.position.y,
                positions[i + 2] + this.position.z
            );
        }
        this.geometry.setDrawRange(0, indices.length);
        this.geometry.setIndex(indices);
        this.geometry.computeVertexNormals();
    }
}

export default Chunk;
