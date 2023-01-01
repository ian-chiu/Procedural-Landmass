class GridMetrics {
    public static readonly pointsPerChunk = 16;
    public static get size() {
        return Math.pow(this.pointsPerChunk, 3);
    }
}

export default GridMetrics;
