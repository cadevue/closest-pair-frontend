import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

import Constant from "./const";
import { Point, pointsToFloat32Array } from "./point";

const center = (Constant.MAX_POS_BOUND + Constant.MIN_POS_BOUND) / 2;
const spread = Constant.MAX_POS_BOUND - Constant.MIN_POS_BOUND;

export function createScatterPlotRenderer(
    container : HTMLElement, pointArr : Array<Point>, numOfPoints : number
) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(Constant.CANVAS_COLOR);
    container.appendChild(renderer.domElement);

    renderer.domElement.onmousedown = (e: MouseEvent) => {
        switch (e.button) {
            case 0:
                document.body.style.cursor = "grabbing";
                break;
            case 1:
                document.body.style.cursor = "zoom-in";
                break;
            case 2:
                document.body.style.cursor = "move";
                break;
            default:
                document.body.style.cursor = "default";
        }
    }
    renderer.domElement.onmouseup = () => { 
        document.body.style.cursor = "default"; 
    }

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(center, center, center);
    camera.position.set(spread, spread, spread);

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({ size: Constant.INITIAL_POINT_SIZE, color: Constant.DEFAULT_POINT_COLOR });

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
        material,
        camera,
        controls
    }
}