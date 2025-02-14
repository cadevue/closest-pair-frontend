import * as THREE from "three"
import { generateRandomPoints, Point, pointsToFloat32Array } from "./point";
import 'vanilla-colorful';
import Constants from "./const";
import { createScatterPlotRenderer } from "./plot";

/** Variables */
let numOfPoints = Constants.INITIAL_NUM_OF_POINTS;
let pointSize = Constants.INITIAL_POINT_SIZE;
let pointColor = Constants.DEFAULT_POINT_COLOR;
let pointArr : Array<Point> = generateRandomPoints(
    Constants.MAX_NUM_OF_POINTS,
    Constants.MIN_POS_BOUND, 
    Constants.MAX_POS_BOUND
);

const center = (Constants.MAX_POS_BOUND + Constants.MIN_POS_BOUND) / 2;
const spread = Constants.MAX_POS_BOUND - Constants.MIN_POS_BOUND;

const dncContainer = document.getElementById("divideAndConquerContainer") as HTMLElement;
const dncScatterPlotRenderer = createScatterPlotRenderer(dncContainer, pointArr, numOfPoints);

const bruteForceContainer = document.getElementById("bruteforceContainer") as HTMLElement;
const bruteForceScatterPlotRenderer = createScatterPlotRenderer(bruteForceContainer, pointArr, numOfPoints);

/** State Syncing */
function syncBuffer() {
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

/** DOM Binding */
function uiBind() {
    const numOfPointsSlider = document.getElementById("numOfPoints") as HTMLInputElement;
    const numOfPointsValue = document.getElementById("numOfPointsValue") as HTMLSpanElement;

    numOfPointsSlider.min = Constants.MIN_NUM_OF_POINTS.toString();
    numOfPointsSlider.max = Constants.MAX_NUM_OF_POINTS.toString();
    numOfPointsSlider.step = "1";
    numOfPointsSlider.value = Constants.INITIAL_NUM_OF_POINTS.toString();
    numOfPointsValue.innerHTML = numOfPointsSlider.value;

    numOfPointsSlider.oninput = function() {
        numOfPoints = parseInt(numOfPointsSlider.value);
        numOfPointsValue.innerHTML = numOfPoints.toString();

        syncBuffer();
    }

    const pointSizeSlider = document.getElementById("pointSize") as HTMLInputElement;
    const pointSizeValue = document.getElementById("pointSizeValue") as HTMLSpanElement;

    pointSizeSlider.min = Constants.MIN_POINT_SIZE.toString();
    pointSizeSlider.max = Constants.MAX_POINT_SIZE.toString();
    pointSizeSlider.step = "0.01";
    pointSizeSlider.value = Constants.INITIAL_POINT_SIZE.toString();
    pointSizeValue.innerHTML = pointSizeSlider.value;

    pointSizeSlider.oninput = function() {
        pointSize = parseFloat(pointSizeSlider.value);
        pointSizeValue.innerHTML = pointSize.toString();

        syncMaterial();
    }

    const pointColorPicker = document.querySelector('hex-color-picker') as HTMLElement;
    pointColorPicker.setAttribute('color', Constants.DEFAULT_POINT_COLOR);

    // @ts-ignore, no types for vanilla-colorful
    pointColorPicker.addEventListener('color-changed', (e: CustomEvent) => {
        const color = e.detail.value;
        pointColor = color;
        syncMaterial();
    });

    const resetColorButton = document.getElementById("resetColor") as HTMLButtonElement;
    resetColorButton.onclick = function() {
        pointColor = Constants.DEFAULT_POINT_COLOR;
        pointColorPicker.setAttribute('color', Constants.DEFAULT_POINT_COLOR);
        syncMaterial();
    }

    const resetDncCameraButton = document.getElementById("resetDnCCam") as HTMLButtonElement;
    resetDncCameraButton.onclick = function() {
        dncScatterPlotRenderer.controls.target.set(center, center, center);
        dncScatterPlotRenderer.camera.position.set(spread, spread, spread);
    }

    const resetBruteForceCameraButton = document.getElementById("resetBruteforceCam") as HTMLButtonElement;
    resetBruteForceCameraButton.onclick = function() {
        bruteForceScatterPlotRenderer.controls.target.set(center, center, center);
        bruteForceScatterPlotRenderer.camera.position.set(spread, spread, spread);
    }
}

function actionBind() {
    const generateRandomPointsButton = document.getElementById("generatePoints") as HTMLButtonElement;
    generateRandomPointsButton.onclick = function() {
        pointArr = generateRandomPoints(
            Constants.MAX_NUM_OF_POINTS,
            Constants.MIN_POS_BOUND, 
            Constants.MAX_POS_BOUND
        );
        syncBuffer();
    }

    const solveButton = document.getElementById("solve") as HTMLButtonElement;
    solveButton.onclick = function() {
        alert("Not implemented yet");
    }
}

uiBind();
actionBind();