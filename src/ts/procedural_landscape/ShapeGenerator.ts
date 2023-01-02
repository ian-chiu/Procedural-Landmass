import { Vector3 } from "three";
import { NoiseFilter } from "./NoiseFilter";
import Chunk from "./Chunk";
import { triTable, cornerOffsets, edgeConnections } from "./MarchingCubeTables";

export class ShapeGenerator {
    private static instance: ShapeGenerator;
    public terrainNoise: NoiseFilter;
    private readonly densities: Float32Array;

    public static getInstance(): ShapeGenerator {
        if (!ShapeGenerator.instance) {
            ShapeGenerator.instance = new ShapeGenerator();
        }
        return ShapeGenerator.instance;
    }

    private constructor() {
        this.terrainNoise = new NoiseFilter({
            strength: 13,
            roughness: 0.8,
            scale: 50,
            weight: new Vector3(1, 0.2, 1),
            lacunarity: 1.7,
            hardFloor: -0.6,
            octaves: 8
        });
        const length = (Chunk.sizeXZ + 2) * (Chunk.sizeY + 2) * (Chunk.sizeXZ + 2);
        this.densities = new Float32Array(length);
    }

    public generate(
        groundPercent = 0.3,
        isolevel = 0.5
    ): ShapeGenerator.OutputProperties {
        const interp = (
            edgeVertex1: Vector3,
            valueAtVertex1: number,
            edgeVertex2: Vector3,
            valueAtVertex2: number
        ) => {
            const result = new Vector3().copy(edgeVertex2);
            result.sub(edgeVertex1);
            result.multiplyScalar(
                (isolevel - valueAtVertex1) / (valueAtVertex2 - valueAtVertex1)
            );
            result.add(edgeVertex1);
            return result;
        };

        this.generateDensity(groundPercent);
        const positions: number[] = [];
        const indices: number[] = [];
        const indexMemory: {
            [key: string]: number;
        } = {};
        let vertexIndex = 0;
        for (let x = 0; x < Chunk.sizeXZ + 1; x++) {
            for (let y = 0; y < Chunk.sizeY + 1; y++) {
                for (let z = 0; z < Chunk.sizeXZ + 1; z++) {
                    const currPosition = new Vector3(x, y, z);

                    const cubeValues = [
                        this.densities[this.indexFromCoord(x, y, z + 1)],
                        this.densities[this.indexFromCoord(x + 1, y, z + 1)],
                        this.densities[this.indexFromCoord(x + 1, y, z)],
                        this.densities[this.indexFromCoord(x, y, z)],
                        this.densities[this.indexFromCoord(x, y + 1, z + 1)],
                        this.densities[this.indexFromCoord(x + 1, y + 1, z + 1)],
                        this.densities[this.indexFromCoord(x + 1, y + 1, z)],
                        this.densities[this.indexFromCoord(x, y + 1, z)],
                    ];

                    let cubeIndex = 0;
                    if (cubeValues[0] < isolevel) cubeIndex |= 1;
                    if (cubeValues[1] < isolevel) cubeIndex |= 2;
                    if (cubeValues[2] < isolevel) cubeIndex |= 4;
                    if (cubeValues[3] < isolevel) cubeIndex |= 8;
                    if (cubeValues[4] < isolevel) cubeIndex |= 16;
                    if (cubeValues[5] < isolevel) cubeIndex |= 32;
                    if (cubeValues[6] < isolevel) cubeIndex |= 64;
                    if (cubeValues[7] < isolevel) cubeIndex |= 128;

                    const edges = triTable[cubeIndex];
                    let i = 0;
                    for (i = 0; edges[i] != -1; i += 3) {
                        // First edge lies between vertex e00 and vertex e01
                        let e00 = edgeConnections[edges[i]][0];
                        let e01 = edgeConnections[edges[i]][1];

                        // Second edge lies between vertex e10 and vertex e11
                        let e10 = edgeConnections[edges[i + 1]][0];
                        let e11 = edgeConnections[edges[i + 1]][1];

                        // Third edge lies between vertex e20 and vertex e21
                        let e20 = edgeConnections[edges[i + 2]][0];
                        let e21 = edgeConnections[edges[i + 2]][1];

                        const points = [];
                        points.push(
                            interp(
                                cornerOffsets[e00],
                                cubeValues[e00],
                                cornerOffsets[e01],
                                cubeValues[e01]
                            ).add(currPosition)
                        );
                        points.push(
                            interp(
                                cornerOffsets[e10],
                                cubeValues[e10],
                                cornerOffsets[e11],
                                cubeValues[e11]
                            ).add(currPosition)
                        );
                        points.push(
                            interp(
                                cornerOffsets[e20],
                                cubeValues[e20],
                                cornerOffsets[e21],
                                cubeValues[e21]
                            ).add(currPosition)
                        );

                        for (const point of points) {
                            const key = `${point.x},${point.y},${point.z}`;
                            if (key in indexMemory) {
                                indices.push(indexMemory[key]);
                            } else {
                                indexMemory[key] = vertexIndex;
                                indices.push(vertexIndex++);
                                positions.push(point.x);
                                positions.push(point.y - Chunk.sizeY * 5 / 6);
                                positions.push(point.z);
                            }
                        }
                    }
                }
            }
        }
        return {
            positions: new Float32Array(positions),
            indices: indices,
        };
    }

    private generateDensity(groundPercent: number): Float32Array {
        for (let x = 0; x < Chunk.sizeXZ + 2; x++) {
            for (let y = 0; y < Chunk.sizeY + 1; y++) {
                for (let z = 0; z < Chunk.sizeXZ + 2; z++) {
                    const index = this.indexFromCoord(x, y, z);
                    let value = -y + groundPercent * Chunk.sizeY;
                    let terrainDensity = this.terrainNoise.evaluate(x, y, z);
                    value += terrainDensity;
                    this.densities[index] = value;
                }
            }
        }
        return this.densities;
    }

    private indexFromCoord(x: number, y: number, z: number) {
        return x + (Chunk.sizeXZ + 2) * y + (Chunk.sizeY + 2) * (Chunk.sizeXZ + 2) * z;
    }
}

export namespace ShapeGenerator {
    export type OutputProperties = {
        positions: Float32Array;
        indices: number[];
    };
}
