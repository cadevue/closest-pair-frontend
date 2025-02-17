import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/Addons.js";

import Constant from "./const";
import { generateRandomPoints, Point, pointsToFloat32Array } from "./point";
import { createScatterPlotRenderer } from "./plot";
import { initOverlay } from "./overlay";
import { addOnMessageCallback, requestSolveToServer, SolveCPResponse } from "./solve";
import { clearDOMLogs, domLog } from "./log";

/** State */
let numOfPoints = Constant.INITIAL_NUM_OF_POINTS;
let pointSize = Constant.INITIAL_POINT_SIZE;
let pointColor = Constant.DEFAULT_POINT_COLOR;


let pointArr : Array<Point> = generateRandomPoints(
    Constant.MAX_NUM_OF_POINTS,
    Constant.MIN_POS_BOUND, 
    Constant.MAX_POS_BOUND
);

const center = (Constant.MAX_POS_BOUND + Constant.MIN_POS_BOUND) / 2;
const spread = Constant.MAX_POS_BOUND - Constant.MIN_POS_BOUND;

const dncContainer = document.getElementById("divideAndConquerContainer") as HTMLElement;
const dncScatterPlotRenderer = createScatterPlotRenderer(dncContainer, pointArr, numOfPoints);

const bruteForceContainer = document.getElementById("bruteforceContainer") as HTMLElement;
const bruteForceScatterPlotRenderer = createScatterPlotRenderer(bruteForceContainer, pointArr, numOfPoints);

let solveOpsCounter = 0;

/** State Syncing */
function syncGeometryBuffer() {
    const positions = pointsToFloat32Array(pointArr, numOfPoints);

    dncScatterPlotRenderer.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    bruteForceScatterPlotRenderer.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
}

function syncMaterial() {
    dncScatterPlotRenderer.material.size = pointSize;
    bruteForceScatterPlotRenderer.material.size = pointSize;

    dncScatterPlotRenderer.material.color.set(pointColor);
    bruteForceScatterPlotRenderer.material.color.set(pointColor);
}

/* DOM References */
function getDOMRefs() {
    const numOfPointsSlider = document.getElementById("numOfPoints") as HTMLInputElement;
    const numOfPointsValue = document.getElementById("numOfPointsValue") as HTMLSpanElement;
    const pointSizeSlider = document.getElementById("pointSize") as HTMLInputElement;
    const pointSizeValue = document.getElementById("pointSizeValue") as HTMLSpanElement;
    const resetDncCameraButton = document.getElementById("resetDnCCam") as HTMLButtonElement;
    const resetBruteForceCameraButton = document.getElementById("resetBruteforceCam") as HTMLButtonElement;
    const generatePointsButton = document.getElementById("generatePoints") as HTMLButtonElement;
    const solveButton = document.getElementById("solve") as HTMLButtonElement;
    const dncLoading = document.getElementById("dncLoading") as HTMLElement;
    const bruteForceLoading = document.getElementById("bruteforceLoading") as HTMLElement;

    return {
        numOfPointsSlider,
        numOfPointsValue,
        pointSizeSlider,
        pointSizeValue,
        resetDncCameraButton,
        resetBruteForceCameraButton,
        generatePointsButton,
        solveButton,
        dncLoading,
        bruteForceLoading
    };
}

const domRefs = getDOMRefs();

/** DOM Binding */
function uiBind() {
    const {
        numOfPointsSlider,
        numOfPointsValue,
        pointSizeSlider,
        pointSizeValue,
        resetDncCameraButton,
        resetBruteForceCameraButton
    } = domRefs;

    numOfPointsSlider.min = Constant.MIN_NUM_OF_POINTS.toString();
    numOfPointsSlider.max = Constant.MAX_NUM_OF_POINTS.toString();
    numOfPointsSlider.step = "1";
    numOfPointsSlider.value = Constant.INITIAL_NUM_OF_POINTS.toString();
    numOfPointsValue.innerHTML = numOfPointsSlider.value;

    numOfPointsSlider.oninput = function() {
        numOfPoints = parseInt(numOfPointsSlider.value);
        numOfPointsValue.innerHTML = numOfPoints.toString();

        syncGeometryBuffer();
    }

    pointSizeSlider.min = Constant.MIN_POINT_SIZE.toString();
    pointSizeSlider.max = Constant.MAX_POINT_SIZE.toString();
    pointSizeSlider.step = "0.01";
    pointSizeSlider.value = Constant.INITIAL_POINT_SIZE.toString();
    pointSizeValue.innerHTML = pointSizeSlider.value;

    pointSizeSlider.oninput = function() {
        pointSize = parseFloat(pointSizeSlider.value);
        pointSizeValue.innerHTML = pointSize.toString();

        syncMaterial();
    }

    function resetCamera(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
        camera.position.set(spread, spread, spread);
        controls.target.set(center, center, center);
    }

    resetDncCameraButton.onclick = () => 
        resetCamera(dncScatterPlotRenderer.camera, dncScatterPlotRenderer.controls);

    resetBruteForceCameraButton.onclick = () => 
        resetCamera(bruteForceScatterPlotRenderer.camera, bruteForceScatterPlotRenderer.controls);
}

function toggleLoading(element: HTMLElement, show: boolean) {
    element.classList.toggle("hidden", !show);
    element.classList.toggle("flex", show);

    if (show) {
        let dots = 0;
        const loadingText = element.querySelector("h1") as HTMLElement;

        if (!loadingText) return;

        const interval = setInterval(() => {
            loadingText.innerHTML = `Solving ${" .".repeat(dots)}`;
            dots = (dots + 1) % 4;
        }, 250);

        element.dataset["loadingInterval"] = interval.toString();
    } else {
        const interval = element.dataset["loadingInterval"];
        if (interval) {
            clearInterval(parseInt(interval));
            element.querySelector("h1")!.innerHTML = "Solving";
        }
    }
}

function toggleUIInteraction(enable: boolean) {
    domRefs.generatePointsButton.disabled = !enable;
    domRefs.solveButton.disabled = !enable;
    domRefs.numOfPointsSlider.disabled = !enable;
}

function actionBind() {
    const {
        generatePointsButton,
        solveButton,
        dncLoading,
        bruteForceLoading
    } = domRefs;

    generatePointsButton.onclick = function() {
        pointArr = generateRandomPoints(
            Constant.MAX_NUM_OF_POINTS,
            Constant.MIN_POS_BOUND, 
            Constant.MAX_POS_BOUND
        );
        syncGeometryBuffer();
    }

    solveButton.onclick = function() {
        clearDOMLogs();

        requestSolveToServer(pointArr, numOfPoints);
        domLog("Bruteforce request sent to the server!");
        domLog("DnC request sent to the server!\n");

        solveOpsCounter += 2;

        toggleLoading(dncLoading, true);
        toggleLoading(bruteForceLoading, true);

        toggleUIInteraction(false);
    }
}

function wsHandlerBind() {
    function printResultToDOMLogs(response: SolveCPResponse) {
        domLog(`Receive result from:`);
        domLog(`<b>${response.method === "bruteforce" ? "Brute Force Solver 🛠️" : "Divide and Conquer Solver ⚔️"}</b>`);

        domLog(`  - Closest Pair Index      : [${response.indexes[0]}, ${response.indexes[1]}]`);
        domLog(`  - Closest Distance        : ${response.distance.toFixed(6)} units`);
        domLog(`  - Number of Euclidean Ops : ${response.numOfEuclideanOps.toLocaleString()} times`);
        domLog(`  - Server Execution Time   : ${response.executionTime.toFixed(6)}s\n`);
    }

    addOnMessageCallback((response) => { 
        switch (response.method) {
            case "bruteforce":
                toggleLoading(domRefs.bruteForceLoading, false);
                break;
            case "dnc":
                toggleLoading(domRefs.dncLoading, false);
                break;
        }

        solveOpsCounter--;
        printResultToDOMLogs(response);

        if (solveOpsCounter === 0) {
            toggleUIInteraction(true);
        }
    });
}


uiBind(); // input and result binding
actionBind(); // action button binding
wsHandlerBind(); // websocket handler binding

initOverlay(); // overlay for mobile users