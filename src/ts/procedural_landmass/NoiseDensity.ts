import SimplexNoise from "simplex-noise";
import { Vector3 } from "three";
import { indexFromCoord } from "./utils";
import GridMetrics from "./GridMetrics";

export class NoiseDensity
{
    public static generateDensity(parameters: NoiseDensity.Parameters) {
        const { seed, scale, strength, groundPercent, octaves, lacunarity, persistance } = parameters;
        const simplexNoise = new SimplexNoise(seed);
        const result = new Float32Array(GridMetrics.size)
        const chunkSize = GridMetrics.pointsPerChunk;

        const octaveOffsets: Vector3[] = [];
        for (let octave = 0; octave < octaves; octave++) {
            const randX = simplexNoise.noise3D(octave, octave, octave);
            const randY = simplexNoise.noise3D(-octave, -octave, -octave);
            const randZ = simplexNoise.noise3D(-octave, octave, octave);
            const offsetX = randX * 200000 - 100000;
            const offsetY = randY * 200000 - 100000;
            const offsetZ = randZ * 200000 - 100000;
            octaveOffsets.push(new Vector3(offsetX, offsetY, offsetZ));
        }

        for (let x = 0; x < chunkSize; x++) {
            for (let y = 0; y < chunkSize; y++) {
                for (let z = 0; z < chunkSize; z++) {
                    let density = -y + (groundPercent * chunkSize);
                    let frequency = 1;
                    let amplitude = strength;
                    for (let octave = 0; octave < octaves; octave++) {
                        const sampleX = (x + octaveOffsets[octave].x) / scale * frequency;
                        const sampleY = (y + octaveOffsets[octave].y) / scale * frequency;
                        const sampleZ = (z + octaveOffsets[octave].z) / scale * frequency;
                        density += simplexNoise.noise3D(sampleX, sampleY, sampleZ) * amplitude;
                        frequency *= lacunarity;
                        amplitude *= persistance;
                    }
                    result[indexFromCoord(x,y,z)] = density;
                }
            }
        }
        return result;
    }
}

export namespace NoiseDensity {
    export type Parameters = {
        seed: number,
        groundPercent: number,
        strength: number,
        scale: number,
        octaves: number,
        persistance: number,
        lacunarity: number,
    }
}
