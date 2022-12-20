export namespace shaderChunk {
    export const prepareVertex = `
    varying vec4 vWorldPosition;
    varying vec3 vUp;
    `;

    export const worldposVertex = `
        vec4 worldPosition = vec4( transformed, 1.0 );
        vWorldPosition = worldPosition;
        worldPosition = modelMatrix * worldPosition;
        vUp = (modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz;
    `;

    export const prepareFragment = `
    const int MAX_REGION_COUNT = 8;
    const float epsilon = 0.0001;

    varying vec3 vUp;
    varying vec4 vWorldPosition;

    uniform float maxHeight;
    uniform float minHeight;
    uniform float slopeThreshold;
    uniform float slopeBlend;
    uniform int regionCount;
    uniform float baseBeginHeights[MAX_REGION_COUNT];
    uniform vec3 steepColor;
    uniform vec3 baseColors[MAX_REGION_COUNT];
    uniform float baseBlends[MAX_REGION_COUNT];

    float inverseLerp(float a, float b, float v) {
        return clamp((v - a) / (b - a), 0.0, 1.0);
    }
    `;

    export const colorFragment = `
        float heightPercent = inverseLerp(minHeight, maxHeight, vWorldPosition.y);
        float slope = 1.0 - dot(vNormal, vUp);
        float flatBlendHeight = slopeThreshold * (1.0 - slopeBlend);
        float flatWeight = 1.0 - inverseLerp(flatBlendHeight, slopeThreshold, slope);
        for (int i = 0; i < regionCount; i++) {
            float drawStrength = inverseLerp(-baseBlends[i] / 2.0 - EPSILON, baseBlends[i] / 2.0, heightPercent - baseBeginHeights[i]);
            diffuseColor.rgb = diffuseColor.rgb * (1.0 - drawStrength) + baseColors[i] * drawStrength;
            diffuseColor.rgb = diffuseColor.rgb * flatWeight + steepColor * (1.0 - flatWeight);
        }
    `;
}
