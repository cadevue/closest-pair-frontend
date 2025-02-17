import { Point } from "./point";

const WS_URL = "ws://localhost:8080";

interface SolveCPRequest {
    method: string;
    dimension: number;
    points: number[];
}

interface SolveCPResponse {
    method: string;
    indexes: [number, number];
    distance: number;
    numOfEuclideanOps: number;
    executionTime: number;
}

const ws = new WebSocket(WS_URL);
let isWsConnected = false;

let onMessageCallbacks: Array<(response: SolveCPResponse) => void> = [];
export function addOnMessageCallback(callback: (response: SolveCPResponse) => void) {
    onMessageCallbacks.push(callback);
}

ws.onopen = () => {
    console.log("Connected to server");
    isWsConnected = true;
}

ws.onmessage = (event) => {
    const response: SolveCPResponse = JSON.parse(event.data);
    onMessageCallbacks.forEach(callback => callback(response));
}

ws.onclose = () => {
    console.log("The connection is closed");
    isWsConnected = false;
}

ws.onerror = () => {
    console.error("An error occurred while connecting to the server! Is the server alive?");
}

export function solveClosestPair(points: Array<Point>, numOfPoints: number) {
    if (!isWsConnected) {
        console.warn("The WebSocket connection is not setup correctly");
        return;
    }

    const flattenPoints = points.slice(0, numOfPoints).
        flatMap(point => [point.x, point.y, point.z]);

    const bruteForceRequest: SolveCPRequest = {
        method: "bruteforce",
        dimension: 3,
        points: flattenPoints
    }

    const dncRequest: SolveCPRequest = {
        method: "dnc",
        dimension: 3,
        points: flattenPoints
    }

    ws.send(JSON.stringify(bruteForceRequest));
    ws.send(JSON.stringify(dncRequest));

    console.log("Request sent to the server");
}