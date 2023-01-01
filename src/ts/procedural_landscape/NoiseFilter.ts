import SimplexNoise from "simplex-noise";
import { Vector3 } from "three";

export class NoiseFilter {
    public settings: NoiseFilter.Settings;
    private _seed = 0;
    private _vector3 = new Vector3();
    private _noise: SimplexNoise;

    constructor(
        parameters: {
            strength?: number;
            roughness?: number;
            scale?: number;
            offset?: Vector3;
            weight?: Vector3;
            octaves?: number;
            persistance?: number;
            lacunarity?: number;
            minValue?: number;
        } = {}
    ) {
        this.settings = {
            strength: parameters.strength || 1,
            roughness: parameters.roughness || 1,
            scale: parameters.scale || 1,
            offset: parameters.offset || new Vector3(0, 0, 0),
            weight: parameters.weight || new Vector3(1, 1, 1),
            octaves: parameters.octaves || 6,
            persistance: parameters.persistance || 0.5,
            lacunarity: parameters.lacunarity || 2,
            minValue: parameters.minValue || -1,
        };
        this._noise = new SimplexNoise(this._seed);
    }

    public get seed() {
        return this._seed;
    }

    public set seed(newSeed: number) {
        this._seed = newSeed;
        this._noise = new SimplexNoise(newSeed);
    }

    public evaluate(x: number, y: number, z: number): number {
        const {
            strength,
            roughness,
            scale,
            offset,
            weight,
            octaves,
            persistance,
            lacunarity,
            minValue,
        } = this.settings;
        let frequency = roughness;
        let amplitude = 1;
        let value = 0;
        for (let octave = 0; octave < octaves; octave++) {
            this._vector3.set(x, y, z);
            this._vector3.add(offset);
            this._vector3.multiply(weight);
            this._vector3.multiplyScalar(frequency / scale);
            let noiseValue = this._noise.noise3D(
                this._vector3.x,
                this._vector3.y,
                this._vector3.z
            );
            value += noiseValue * amplitude;

            frequency *= lacunarity;
            amplitude *= persistance;
        }
        // const curveFunction = (x: number) => {
        //     return x > 0 ? Math.pow(x, 2) : x;
        // };
        // value = curveFunction(value);
        value = Math.max(0, value - minValue);
        return value * strength;
    }
}

export namespace NoiseFilter {
    export type Settings = {
        strength: number;
        roughness: number;
        scale: number;
        offset: Vector3;
        weight: Vector3;
        octaves: number;
        persistance: number;
        lacunarity: number;
        minValue: number;
    };
}
