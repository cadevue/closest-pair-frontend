import * as THREE from "three"
import 'vanilla-colorful';

import Constant from "./const";
import { generateRandomPoints, Point, pointsToFloat32Array } from "./point";
import { createScatterPlotRenderer } from "./plot";
import { initOverlay } from "./overlay";

import "./solve.ts";
import { addOnMessageCallback, requestSolveToServer } from "./solve.ts";

/** Variables */
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
    const pointColorPicker = document.querySelector('hex-color-picker') as HTMLElement;
    const resetColorButton = document.getElementById("resetColor") as HTMLButtonElement;
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
        pointColorPicker,
        resetColorButton,
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
        pointColorPicker,
        resetColorButton,
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

    pointColorPicker.setAttribute('color', Constant.DEFAULT_POINT_COLOR);

    // @ts-ignore, no types for vanilla-colorful
    pointColorPicker.addEventListener('color-changed', (e: CustomEvent) => {
        const color = e.detail.value;
        pointColor = color;
        syncMaterial();
    });

    resetColorButton.onclick = function() {
        pointColor = Constant.DEFAULT_POINT_COLOR;
        pointColorPicker.setAttribute('color', Constant.DEFAULT_POINT_COLOR);
        syncMaterial();
    }

    resetDncCameraButton.onclick = function() {
        dncScatterPlotRenderer.controls.target.set(center, center, center);
        dncScatterPlotRenderer.camera.position.set(spread, spread, spread);
    }

    resetBruteForceCameraButton.onclick = function() {
        bruteForceScatterPlotRenderer.controls.target.set(center, center, center);
        bruteForceScatterPlotRenderer.camera.position.set(spread, spread, spread);
    }
}

function actionBind() {
    const {
        numOfPointsSlider,
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
        requestSolveToServer(pointArr, numOfPoints);
        solveOpsCounter += 2;

        dncLoading.classList.remove("hidden");
        dncLoading.classList.add("flex");

        bruteForceLoading.classList.remove("hidden");
        bruteForceLoading.classList.add("flex");

        generatePointsButton.disabled = true;
        solveButton.disabled = true;
        numOfPointsSlider.disabled = true;
    }
}

function wsHandlerBind() {
    addOnMessageCallback((response) => { 
        switch (response.method) {
            case "bruteforce":
                domRefs.bruteForceLoading.classList.remove("flex");
                domRefs.bruteForceLoading.classList.add("hidden");
                break;
            case "dnc":
                domRefs.dncLoading.classList.remove("flex");
                domRefs.dncLoading.classList.add("hidden");
                break;
        }

        solveOpsCounter--;
        if (solveOpsCounter === 0) {
            domRefs.generatePointsButton.disabled = false;
            domRefs.solveButton.disabled = false;
            domRefs.numOfPointsSlider.disabled = false;
        }
    });
}


uiBind(); // input and result binding
actionBind(); // action button binding
wsHandlerBind(); // websocket handler binding

initOverlay(); // overlay for mobile users