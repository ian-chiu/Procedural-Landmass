import GridMetrics from "./GridMetrics";

export function indexFromCoord(x: number, y: number, z: number)
{
    const chunkSize = GridMetrics.pointsPerChunk + 2;
    return x + chunkSize * y + chunkSize * chunkSize * z;
}
