import SimplexNoise from "simplex-noise";
import { Vector2 } from "three";
import { mapLinear } from "three/src/math/MathUtils";

export class Noise
{
    public static generateNoiseMap(width: number, height: number, parameters: Noise.Parameters): number[][] {
        const { scale, seed, octaves, persistance, lacunarity, offset } = parameters;
        const simplexNoise = new SimplexNoise(seed);
        const noiseMap: number[][] = [];
        const octaveOffsets: [number, number][] = [];
        for (let octave = 0; octave < octaves; octave++) {
            const randX = simplexNoise.noise2D(octave, octave);
            const randY = simplexNoise.noise2D(-octave, -octave);
            const offsetX = randX * 200000 - 100000 + offset.x;
            const offsetY = randY * 200000 - 100000 + offset.y;
            octaveOffsets.push([offsetX, offsetY]);
        }
        let maxNoiseHeight = -Infinity;
        let minNoiseHeight = Infinity;
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                let frequency = 1;
                let amplitude = 1;
                let noiseHeight = 0;
                for (let octave = 0; octave < octaves; octave++) {
                    const sampleX = (x - halfWidth) / scale * frequency + octaveOffsets[octave][0];
                    const sampleY = (y - halfHeight) / scale * frequency + octaveOffsets[octave][1];
                    const simplexValue = simplexNoise.noise2D(sampleX, sampleY) * 2 - 1;
                    noiseHeight += simplexValue * amplitude;
                    frequency *= lacunarity;
                    amplitude *= persistance;
                }
                row.push(noiseHeight);
                maxNoiseHeight = Math.max(maxNoiseHeight, noiseHeight);
                minNoiseHeight = Math.min(minNoiseHeight, noiseHeight);
            }
            noiseMap.push(row);
        }
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                noiseMap[y][x] = mapLinear(noiseMap[y][x], minNoiseHeight, maxNoiseHeight, 0, 1);
            }
        }
        return noiseMap;
    }
}

export namespace Noise {
    export type Parameters = {
        scale: number,
        seed: number,
        octaves: number,
        persistance: number,
        lacunarity: number,
        offset: Vector2
    }
}
