import * as THREE from "three";
import { Vector2, Vector3 } from "three";
import MaterialGenerator from "./MaterialGenerator";
import { ShapeGenerator } from "./ShapeGenerator";

const MAX_TRIANGLES = 5;

class Chunk {
    public static readonly sizeXZ = 12;
    public static readonly sizeY = 60;
    public static getPointCount(): number {
        return Chunk.sizeXZ * Chunk.sizeY * Chunk.sizeXZ;
    }

    public readonly mesh: THREE.Mesh;
    public readonly wireframe: THREE.LineSegments;
    public active = false;
    public chunkCoord = new Vector2();
    public position = new Vector3();

    private readonly _geometry: THREE.BufferGeometry;

    public toString() {
        return `${this.chunkCoord.x},${this.chunkCoord.y}`;
    }

    public constructor(position = new Vector3()) {
        this.position = position;
        this.chunkCoord = new Vector2(
            Math.floor(this.position.x / Chunk.sizeXZ),
            Math.floor(this.position.z / Chunk.sizeXZ)
        );
        const positions = new Float32Array(
            Chunk.getPointCount() * MAX_TRIANGLES * 3 * 3
        );
        this._geometry = new THREE.BufferGeometry();
        this._geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
        );
        const wireframeMaterial = new THREE.LineBasicMaterial({
            depthTest: false,
            opacity: 0.25,
            transparent: true,
        });
        this.mesh = new THREE.Mesh(
            this._geometry,
            MaterialGenerator.getInstance().material
        );
        this.mesh.name = this.toString();
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.wireframe = new THREE.LineSegments(
            this._geometry,
            wireframeMaterial
        );
        this.wireframe.name = this.toString();
        this.update();
    }

    public update() {
        ShapeGenerator.getInstance().terrainNoise.settings.offset =
            this.position;
        const { positions, indices } = ShapeGenerator.getInstance().generate();
        for (let i = 0; i < positions.length; i += 3) {
            this._geometry.attributes.position.setXYZ(
                i / 3,
                positions[i] + this.position.x,
                positions[i + 1] + this.position.y,
                positions[i + 2] + this.position.z
            );
        }
        this._geometry.setDrawRange(0, indices.length);

        this._geometry.attributes.position.needsUpdate = true;
        this._geometry.setIndex(indices);
        this._geometry.computeVertexNormals();
        this._geometry.computeBoundingBox();
        this._geometry.computeBoundingSphere();
    }
}

export default Chunk;
