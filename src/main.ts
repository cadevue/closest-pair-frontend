import "./style.css"

type Point = { x: number, y: number, z: number }

const MAX_NUM_OF_POINTS = 100000;
const MIN_NUM_OF_POINTS = 1000;
const INITIAL_NUM_OF_POINTS = 2000;

let numOfPoints = INITIAL_NUM_OF_POINTS;
let points : Array<Point> = new Array(MAX_NUM_OF_POINTS);

function createScatterPlotRenderer() {

}