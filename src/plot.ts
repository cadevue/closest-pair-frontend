import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

import Constant from "./const";
import { Point, pointsToFloat32Array } from "./point";

const center = (Constant.MAX_POS_BOUND + Constant.MIN_POS_BOUND) / 2;
const spread = Constant.MAX_POS_BOUND - Constant.MIN_POS_BOUND;

export interface GeometryAndMaterial<B extends THREE.BufferGeometry, M extends THREE.Material> {
    geometry: B;
    material: M
}

export interface ScatterPlotRenderer {
    renderer: THREE.WebGLRenderer;
    allPoints: GeometryAndMaterial<THREE.BufferGeometry, THREE.PointsMaterial>;
    closestPair: GeometryAndMaterial<THREE.BufferGeometry, THREE.PointsMaterial>;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
}

export function createScatterPlotRenderer(
    container: HTMLElement, pointArr: Array<Point>, numOfPoints: number
): ScatterPlotRenderer {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.001, 8000);
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
    };
    renderer.domElement.onmouseup = () => { 
        document.body.style.cursor = "default"; 
    };

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    const controls = new OrbitControls(camera, renderer.domElement);

    controls.target.set(center, center, center);
    camera.position.set(spread, spread, spread);

    // All the points
    const allGeometry = new THREE.BufferGeometry();
    const allMaterial = new THREE.PointsMaterial({
        size: Constant.INITIAL_POINT_SIZE,
        color: Constant.DEFAULT_POINT_COLOR,
        opacity: 1, 
        transparent: true, // Enable transparency
    });

    const positions = pointsToFloat32Array(pointArr, numOfPoints);
    allGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const points = new THREE.Points(allGeometry, allMaterial);
    scene.add(points);

    // Closest pair
    const closestPairGeometry = new THREE.BufferGeometry();
    const closestPairMaterial = new THREE.PointsMaterial({
        size: Constant.PAIR_POINT_SIZE,
        color: Constant.DEFAULT_PAIR_COLOR
    });

    const closestPairPoints = new THREE.Points(closestPairGeometry, closestPairMaterial);
    scene.add(closestPairPoints);

    // Invisible Hover Box Area
    const hoverBoxGeometry = new THREE.BoxGeometry(spread, spread, spread);
    const hoverBoxMaterial = new THREE.MeshBasicMaterial({});
    const hoverBox = new THREE.Mesh(hoverBoxGeometry, hoverBoxMaterial);
    hoverBox.visible = false;

    scene.add(hoverBox);

    // Add event listener for mouse hover
    window.addEventListener('mousemove', (event) => {
        const canvasBounds = renderer.domElement.getBoundingClientRect();

        // Normalize mouse position based on canvas dimensions
        const mouse = new THREE.Vector2(
            ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1,
            -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1
        );        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Find intersects with all points
        const intersects = raycaster.intersectObject(hoverBox);
        
        if (intersects.length > 0) {
            smoothOpacityChange(allMaterial, 0.25, 5);
        } else {
            smoothOpacityChange(allMaterial, 1, 5);
        }
    });

    let currentTargetOpacity = -1; // -1 means no active opacity change
    let opacityAnimationFrameId: number | null = null;

    function smoothOpacityChange(material: THREE.Material, targetOpacity: number, speed: number) {
        if (currentTargetOpacity === targetOpacity) {
            return;
        }

        if (opacityAnimationFrameId) {
            cancelAnimationFrame(opacityAnimationFrameId!);
        }

        currentTargetOpacity = targetOpacity;

        let prevTime = performance.now();
        let currTime = performance.now();
        let deltaTime = 0;

        function opacityUpdate() {
            currTime = performance.now();
            deltaTime = (currTime - prevTime) / 1000;

            material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, deltaTime * speed);
            prevTime = currTime;

            if (Math.abs(material.opacity - targetOpacity) > 0.01) {
                opacityAnimationFrameId = requestAnimationFrame(opacityUpdate);
            } else {
                currentTargetOpacity = -1; // Reset when finished
                opacityAnimationFrameId = null; // Clear animation ID
            }
        }

        opacityAnimationFrameId = requestAnimationFrame(opacityUpdate);
    }

    function animate() {
        requestAnimationFrame(animate);

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    return {
        renderer,
        allPoints: { geometry: allGeometry, material: allMaterial },
        closestPair: { geometry: closestPairGeometry, material: closestPairMaterial },
        camera,
        controls,
    };
}
