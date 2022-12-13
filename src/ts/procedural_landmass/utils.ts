import GridMetrics from "./GridMetrics";

export function indexFromCoord(x: number, y: number, z: number)
{
    return x + GridMetrics.pointsPerChunk * (y + GridMetrics.pointsPerChunk * z);
}

