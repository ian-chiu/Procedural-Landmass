class GridMetrics {
    public static readonly numThreads = 8;
    public static readonly pointsPerChunk = 64;
    public static get size() {
        return Math.pow(this.pointsPerChunk, 3);
    }
}

export default GridMetrics;
