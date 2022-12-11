export namespace shaderChunks {
    export const prepareFragment =
`
varying vec4 vWorldPosition;
const int MAX_COLOR_COUNT = 8;
const float EPSILON = 0.0001;
uniform float baseBeginHeights[MAX_COLOR_COUNT];
uniform vec3 baseColors[MAX_COLOR_COUNT];
uniform float baseBlends[MAX_COLOR_COUNT];
uniform float maxHeight;
uniform float minHeight;

float inverseLerp(float a, float b, float v) {
    return clamp((v - a) / (b - a), 0.0, 1.0);
}
`;

    export const worldposVertex =
`
    vec4 worldPosition = vec4( transformed, 1.0 );
    vWorldPosition = worldPosition;
	worldPosition = modelMatrix * worldPosition;
`;

    export const colorFragment =
`
    float heightPercent = inverseLerp(minHeight, maxHeight, vWorldPosition.y);
    for (int i = 0; i < MAX_COLOR_COUNT; i++) {
        float drawStrength = inverseLerp(-baseBlends[i] / 2.0 - EPSILON, baseBlends[i] / 2.0, heightPercent - baseBeginHeights[i]);
        diffuseColor.rgb = diffuseColor.rgb * (1.0 - drawStrength) + baseColors[i] * drawStrength;
    }
`;
}
