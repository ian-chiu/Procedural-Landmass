import { Vector2, Vector3 } from "three";
import Chunk from "./Chunk";

class InfiniteTerrainGenerator {
    private static _instance: InfiniteTerrainGenerator;

    public chunksToRemove: Set<string>;
    public chunks: Chunk[] = [];

    private readonly _visibleChunkCount: number;
    private readonly _totalChunkCount: number;
    private _activeChunkIndices: { [key: string]: number };

    public static getInstance() {
        if (!InfiniteTerrainGenerator._instance) {
            InfiniteTerrainGenerator._instance = new InfiniteTerrainGenerator();
        }
        return InfiniteTerrainGenerator._instance;
    }

    public getVisibleDistance() {
        return this._visibleChunkCount * Chunk.sizeXZ;
    }

    private constructor() {
        this._visibleChunkCount = 5;
        this.chunksToRemove = new Set();
        this._activeChunkIndices = {};

        this._totalChunkCount = (1 + this._visibleChunkCount * 2) ** 2;
        for (let i = 0; i < this._totalChunkCount; i++) {
            this.chunks.push(new Chunk());
        }
    }

    public update(camera: THREE.PerspectiveCamera) {
        const cameraPosition = camera.position;
        const playerChunkX = Math.floor(
            cameraPosition.x / Chunk.sizeXZ
        );
        const playerChunkY = Math.floor(
            cameraPosition.z / Chunk.sizeXZ
        );

        this.chunksToRemove.clear();
        for (const key in this._activeChunkIndices) {
            this.chunksToRemove.add(key);
        }

        for (
            let x = playerChunkX - this._visibleChunkCount;
            x <= playerChunkX + this._visibleChunkCount;
            x++
        ) {
            for (
                let y = playerChunkY - this._visibleChunkCount;
                y <= playerChunkY + this._visibleChunkCount;
                y++
            ) {
                const chunkCoord = new Vector2(x, y);
                const key = `${chunkCoord.x},${chunkCoord.y}`;
                this.chunksToRemove.delete(key);
                const activeCount =
                    Object.keys(this._activeChunkIndices).length;
                if (!(key in this._activeChunkIndices) && activeCount < this._totalChunkCount) {
                    let targetIndex = 0;
                    for (let i = 0; i < this._totalChunkCount; i++) {
                        if (!this.chunks[i].active) {
                            targetIndex = i;
                            break;
                        }
                    }
                    const position = new Vector3(
                        Math.floor(chunkCoord.x * Chunk.sizeXZ),
                        0,
                        Math.floor(chunkCoord.y * Chunk.sizeXZ)
                    );
                    this.chunks[targetIndex].active = true;
                    this.chunks[targetIndex].position = position;
                    this.chunks[targetIndex].chunkCoord = chunkCoord;
                    this.chunks[targetIndex].mesh.name = this.chunks[targetIndex].toString();
                    this.chunks[targetIndex].update();
                    this._activeChunkIndices[key] = targetIndex;
                }
            }
        }
        for (const key of this.chunksToRemove) {
            this.chunks[this._activeChunkIndices[key]].active = false;
            delete this._activeChunkIndices[key];
        }
    }
}

export default InfiniteTerrainGenerator;
