import "./style.css"

type Point = { x: number, y: number, z: number }

const MAX_NUM_OF_POINTS = 100000;
const MIN_NUM_OF_POINTS = 1000;
const INITIAL_NUM_OF_POINTS = 2000;

const MIN_POS_BOUND = -100;
const MAX_POS_BOUND = 100;

let numOfPoints = INITIAL_NUM_OF_POINTS;
let points : Array<Point> = new Array(MAX_NUM_OF_POINTS);

const numOfPointsSlider = document.getElementById("numOfPoints") as HTMLInputElement;
const numOfPointsValue = document.getElementById("numOfPointsValue") as HTMLSpanElement;

numOfPointsSlider.min = MIN_NUM_OF_POINTS.toString();
numOfPointsSlider.max = MAX_NUM_OF_POINTS.toString();
numOfPointsSlider.value = INITIAL_NUM_OF_POINTS.toString();
numOfPointsValue.innerHTML = numOfPointsSlider.value;

numOfPointsSlider.oninput = function() {
    numOfPoints = parseInt(numOfPointsSlider.value);
    numOfPointsValue.innerHTML = numOfPoints.toString();
}

// function createScatterPlotRenderer(container : HTMLElement) {
    
// }