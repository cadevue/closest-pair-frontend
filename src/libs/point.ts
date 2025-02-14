export type Point = { x: number, y: number, z: number }

export function generateRandomPoint(minPosBound: number, maxPosBound: number): Point {
    return {
        x: Math.random() * (maxPosBound - minPosBound) + minPosBound,
        y: Math.random() * (maxPosBound - minPosBound) + minPosBound,
        z: Math.random() * (maxPosBound - minPosBound) + minPosBound
    }
}

export function generateRandomPoints(numOfPoints: number, minPosBound: number, maxPosBound: number): Array<Point> {
    const points = new Array<Point>(numOfPoints);
    for (let i = 0; i < numOfPoints; i++) {
        points[i] = generateRandomPoint(minPosBound, maxPosBound);
    }

    return points;
}

export function pointsToFloat32Array(points: Array<Point>, size: number): Float32Array {
    const positions = new Float32Array(size * 3);
    for (let i = 0; i < size; i++) {
        positions[i * 3] = points[i].x;
        positions[i * 3 + 1] = points[i].y;
        positions[i * 3 + 2] = points[i].z;
    }

    return positions;
}