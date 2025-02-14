import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { generateRandomPoints, Point, pointsToFloat32Array } from "./libs/point";
import 'vanilla-colorful';

const MAX_NUM_OF_POINTS = 100000;
const MIN_NUM_OF_POINTS = 1000;
const INITIAL_NUM_OF_POINTS = 50000;

const MIN_POS_BOUND = -100;
const MAX_POS_BOUND = 100;

const MAX_POINT_SIZE = 2;
const MIN_POINT_SIZE = 0.01;
const INITIAL_POINT_SIZE = 0.5;

const DEFAULT_POINT_COLOR = "#ba3a2c";
const CANVAS_COLOR = "#181818";

let numOfPoints = INITIAL_NUM_OF_POINTS;
let pointSize = INITIAL_POINT_SIZE;
let pointColor = DEFAULT_POINT_COLOR;
let pointArr : Array<Point> = generateRandomPoints(MAX_NUM_OF_POINTS, MIN_POS_BOUND, MAX_POS_BOUND);

const center = (MAX_POS_BOUND + MIN_POS_BOUND) / 2;
const size = MAX_POS_BOUND - MIN_POS_BOUND;

const dncContainer = document.getElementById("divideAndConquerContainer") as HTMLElement;
const dncScatterPlotRenderer = createScatterPlotRenderer(dncContainer);

const bruteForceContainer = document.getElementById("bruteforceContainer") as HTMLElement;
const bruteForceScatterPlotRenderer = createScatterPlotRenderer(bruteForceContainer);

function createScatterPlotRenderer(container : HTMLElement) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(CANVAS_COLOR, 1);
    container.appendChild(renderer.domElement);

    renderer.domElement.onmousedown = () => { document.body.style.cursor = "grabbing"; }
    renderer.domElement.onmouseup = () => { document.body.style.cursor = "default"; }
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(center, center, center);
    camera.position.set(size, size, size);

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({ size: pointSize, color: pointColor });

    const positions = pointsToFloat32Array(pointArr, numOfPoints);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    function animate() {
        requestAnimationFrame(animate);

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    return {
        geometry,
        material
    }
}

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

function uiBind() {
    const numOfPointsSlider = document.getElementById("numOfPoints") as HTMLInputElement;
    const numOfPointsValue = document.getElementById("numOfPointsValue") as HTMLSpanElement;

    numOfPointsSlider.min = MIN_NUM_OF_POINTS.toString();
    numOfPointsSlider.max = MAX_NUM_OF_POINTS.toString();
    numOfPointsSlider.step = "1";
    numOfPointsSlider.value = INITIAL_NUM_OF_POINTS.toString();
    numOfPointsValue.innerHTML = numOfPointsSlider.value;

    numOfPointsSlider.oninput = function() {
        numOfPoints = parseInt(numOfPointsSlider.value);
        numOfPointsValue.innerHTML = numOfPoints.toString();

        syncBuffer();
    }

    const pointSizeSlider = document.getElementById("pointSize") as HTMLInputElement;
    const pointSizeValue = document.getElementById("pointSizeValue") as HTMLSpanElement;

    pointSizeSlider.min = MIN_POINT_SIZE.toString();
    pointSizeSlider.max = MAX_POINT_SIZE.toString();
    pointSizeSlider.step = "0.01";
    pointSizeSlider.value = INITIAL_POINT_SIZE.toString();
    pointSizeValue.innerHTML = pointSizeSlider.value;

    pointSizeSlider.oninput = function() {
        pointSize = parseFloat(pointSizeSlider.value);
        pointSizeValue.innerHTML = pointSize.toString();

        syncMaterial();
    }

    const pointColorPicker = document.querySelector('hex-color-picker') as HTMLElement;
    pointColorPicker.setAttribute('color', DEFAULT_POINT_COLOR);

    // @ts-ignore, no types for vanilla-colorful
    pointColorPicker.addEventListener('color-changed', (e: CustomEvent) => {
        const color = e.detail.value;
        pointColor = color;
        syncMaterial();
    });

    const resetColorButton = document.getElementById("resetColor") as HTMLButtonElement;
    resetColorButton.onclick = function() {
        pointColor = DEFAULT_POINT_COLOR;
        pointColorPicker.setAttribute('color', DEFAULT_POINT_COLOR);
        syncMaterial();
    }
}

function actionBind() {
    const generateRandomPointsButton = document.getElementById("generatePoints") as HTMLButtonElement;
    generateRandomPointsButton.onclick = function() {
        pointArr = generateRandomPoints(MAX_NUM_OF_POINTS, MIN_POS_BOUND, MAX_POS_BOUND);
        syncBuffer();
    }

    const solveButton = document.getElementById("solve") as HTMLButtonElement;
    solveButton.onclick = function() {
        alert("Not implemented yet");
    }
}

uiBind();
actionBind();