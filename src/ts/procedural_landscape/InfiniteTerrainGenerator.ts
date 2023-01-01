import { Vector2, Vector3 } from "three";
import Chunk from "./Chunk";
import GridMetrics from "./GridMetrics";

class InfiniteTerrainGenerator {
    private static _instance: InfiniteTerrainGenerator;

    private readonly _visibleChunkCount: number;
    public chunksToRemove: Set<string>;
    public activeChunks: { [key: string]: Chunk };

    public static getInstance() {
        if (!InfiniteTerrainGenerator._instance) {
            InfiniteTerrainGenerator._instance = new InfiniteTerrainGenerator();
        }
        return InfiniteTerrainGenerator._instance;
    }

    private constructor() {
        this._visibleChunkCount = 5;
        this.chunksToRemove = new Set();
        this.activeChunks = {};
    }

    public update(cameraPosition: THREE.Vector3) {
        const playerChunkX = Math.floor(
            cameraPosition.x / GridMetrics.pointsPerChunk
        );
        const playerChunkY = Math.floor(
            cameraPosition.z / GridMetrics.pointsPerChunk
        );

        this.chunksToRemove.clear();
        for (const key in this.activeChunks) {
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
                if (!(key in this.activeChunks)) {
                    this.createChunk(chunkCoord);
                }
                this.chunksToRemove.delete(key);
            }
        }

        for (const key of this.chunksToRemove) {
            delete this.activeChunks[key];
        }
    }

    public createChunk(chunkCoord: Vector2) {
        const position = new Vector3(
            Math.floor(chunkCoord.x * GridMetrics.pointsPerChunk),
            0,
            Math.floor(chunkCoord.y * GridMetrics.pointsPerChunk)
        );
        const newChunk = new Chunk(position);
        this.activeChunks[newChunk.toString()] = newChunk;
    }
}

export default InfiniteTerrainGenerator;
