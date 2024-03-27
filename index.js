import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


let camera, scene, renderer;
let colors = [new THREE.Color(0xa0ffff), new THREE.Color(0xffff0a)];
let i = 0;
let started = false;
const startSpeed = -0.001;
let currentSpeed = -0.001;
const maxSpeed = 0.00;
const maxTimescale = 2.00;
let action;

const sphereGeometry = new THREE.SphereGeometry(2000, 64, 64);
const clock = new THREE.Clock();

let mixer;
let dist = 0;

init();
animate();

function init() {

	const container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	camera.position.set(3, 325, -525);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xa0a0ff);

	const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 5);
	hemiLight.position.set(0, 200, 0);
	scene.add(hemiLight);

	const dirLight = new THREE.DirectionalLight(0xffffff, 5);
	dirLight.position.set(0, 200, 100);
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 180;
	dirLight.shadow.camera.bottom = - 100;
	dirLight.shadow.camera.left = - 120;
	dirLight.shadow.camera.right = 120;
	scene.add(dirLight);

	// Charger la texture de piste et créer un matériau
	const trackMaterial = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('public/red-background-material.jpg'),
	});

	// Créer un mesh pour le terrain sphérique
	const sphereMesh = new THREE.Mesh(sphereGeometry, trackMaterial);
	sphereMesh.scale.set(2, 1, 2);
	sphereMesh.position.set(0, -2000, 0);
	scene.add(sphereMesh);


	// model
	const loader = new FBXLoader();
	loader.load('public/run_in_place.fbx', function (object) {
		mixer = new THREE.AnimationMixer(object);
		action = mixer.clipAction(object.animations[0]);
		action.play();
		object.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(object);
	});

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	container.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 100, 0);
	controls.enabled = false;
	controls.update();

	window.addEventListener('resize', onWindowResize);

	const btn = document.createElement('button');
	btn.setAttribute("ontouchstart", '');
	btn.innerHTML = 'Run';
	btn.id = "run-button"
	btn.classList.add("pressBtn");
	btn.addEventListener("click", function () {
		started = true;
		if (currentSpeed <= maxSpeed)
			currentSpeed = currentSpeed - 0.0005;
		if (Math.floor(action.timeScale) < maxTimescale)
			action.timeScale += 0.1;
	});
	setTimeout(function decrement() {
		if (started) {
			if (currentSpeed < startSpeed)
				currentSpeed = currentSpeed + 0.0003;
			if (currentSpeed >= -0.001)
				currentSpeed = 0;
			if (action.timeScale > 1)
				action.timeScale -= 0.1;
		}
		setTimeout(decrement, 500)
	}, 500);
	container.appendChild(btn);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	const delta = clock.getDelta();
	if (mixer) {
		if (started == true) {
			if (currentSpeed != 0)
				mixer.update(delta);
			else
				mixer.update(0);
			sphereGeometry.rotateX(currentSpeed);
			console.log(currentSpeed);
			dist += delta;
			if (Math.round(dist) % 9 == 0)
				scene.background = colors[Math.round(dist) % 9];
			else
				scene.background = colors[(Math.round(dist) + 1) % 9];

		}
		else
			mixer.update(0);
	}
	renderer.render(scene, camera);
}