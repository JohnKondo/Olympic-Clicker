import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


let camera, scene, renderer;
let colors = [new THREE.Color(0x87ceeb), new THREE.Color(0x87cefa)];
let i = 0;
let started = false;
let stopped = false;
const startSpeed = -0.001;
let currentSpeed = -0.001;
const maxSpeed = 0.00;
const maxTimescale = 2.00;
let action;
let clickAnimationInProgress = false;
let animationId;
let nbClick = 0;


const pathTexture = "public/assets/textures";
const pathProps = "public/assets/props";

let clouds1 = generate_clouds(50, 200);
let clouds2 = generate_clouds(-50);
const clock = new THREE.Clock();

let mixer;
let terrain;
let dist = 0;

init();
animate();

/**
 * @description Initialize the scene
 */
function init() {

	const container = document.createElement('div');
	document.body.appendChild(container);

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
	// camera.position.set(3, 325, -525);
	camera.position.set(3, 525, -325);
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x87cefa);

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

	// Audio
	const audioListener = new THREE.AudioListener();
	camera.add(audioListener);
	const sound = new THREE.Audio(audioListener);
	const clickAudioLoader = new THREE.AudioLoader();


	const loader = new FBXLoader();
	const textureLoader = new THREE.TextureLoader();

	scene.add(clouds1);
	scene.add(clouds2);


	// Terrain
	loader.load(`${pathProps}/terrain.fbx`, function (object) {	
		
		const base_color = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_BaseColor.png`);
		//const height = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_Height.png`);
		const normal = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_Normal.png`);
		const roughness = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_Roughness.png`);

		const texture = new THREE.MeshStandardMaterial({
			map: base_color,
			normalMap: normal,
			roughnessMap: roughness,
			//displacementMap: height,
			displacementScale: 0.1,
			displacementBias: 0.1,
			roughness: 1,
			metalness: 0.5
		});

		object.scale.set(0.1, 0.1, 0.1);
		object.position.set(0, -480, 0);
		object.rotation.y = Math.PI / 2;

		terrain = object;

		terrain.traverse(function (child) {

			if (child.isMesh) {
				if (child.material && child.material.map !== undefined) {
					child.material = texture;
					child.material.needsUpdate = true;
				}
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(terrain);
	});


	// model
	loader.load(`${pathProps}/perso-run.fbx`, function (object) {

		// const base_color1 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_1.png`); // Number 1169
		// const base_color2 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_2.png`); // Number 1488
		// const base_color3 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_3.png`); // Number 1945
		const base_color4 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_4.png`); // Number 1175
		const height = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Height.png`);
		const normal = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Normal.png`);
		const roughness = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Roughness.png`);

		const texturePerso = new THREE.MeshStandardMaterial({
			map: base_color4,
			normalMap: normal,
			roughnessMap: roughness,
			// displacementMap: height,
		});

		object.scale.x = object.scale.y = object.scale.z = 0.15;
		mixer = new THREE.AnimationMixer(object);
		action = mixer.clipAction(object.animations[0]);
		action.play();
		object.traverse(function (child) {
			if (child.isMesh) {
				child.material = texturePerso;
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
	btn.addEventListener("click", function (e) {
		started = true;
		nbClick++;
		if (currentSpeed <= maxSpeed) {
			if (stopped) {
				currentSpeed = -0.001;
				stopped = false;
			}
			currentSpeed = currentSpeed - 0.0008;
		}
		if (Math.floor(action.timeScale) < maxTimescale)
			action.timeScale += 0.1;
		createClickEffect(e, container);
		clickAudioLoader.load('public/assets/sounds/click.wav', function (buffer) {
			sound.setBuffer(buffer);
			sound.setVolume(0.5);
			sound.setLoop(false);
			sound.play();
		});
	});

	setTimeout(function decrement() {
		if (started) {
			if (currentSpeed < startSpeed)
				currentSpeed = currentSpeed + 0.0008;
			if (currentSpeed >= -0.001 && nbClick >= 3) {
				currentSpeed = 0;
				stopped = true;
			}
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

/**
 * @description Create a click effect on the screen
 * 
 * @param {MouseEvent} e MouseEvent clicked
 * @param {HTMLElement} container Container of the click effect
 */
function createClickEffect(e, container) {
	let clickEffect = document.createElement("div");
	clickEffect.classList.add("click-effect");
	for (let i = 0; i < 8; i++) {
		const spike = document.createElement("div");
		spike.classList.add("spike");
		spike.style.setProperty("--angle", `${i * 45}deg`);
		spike.style.setProperty("--distance", `${30 + Math.random() * 5}px`);
		clickEffect.appendChild(spike);
	}
	container.appendChild(clickEffect);

	if (clickAnimationInProgress) {
		clearTimeout(animationId);
		clickEffect.classList.remove("effect");
		void clickEffect.offsetWidth;
	}
	clickEffect.style.top = e.clientY + window.scrollY + "px";
	clickEffect.style.left = e.clientX + window.scrollX + "px";
	clickEffect.classList.add("effect");
	clickAnimationInProgress = true;
	animationId = setTimeout(() => {
		clickEffect.classList.remove("effect");
		clickAnimationInProgress = false;
	}, 750);

	// delete the children after 1s
	setTimeout(() => {
		// clickEffect.remove();
		clickEffect.parentNode.removeChild(clickEffect);
	}, 750);
}

function generate_clouds(x, y = 150, z = 300) {
	const cloudTexture = new THREE.TextureLoader().load('public/clouds.jpg');
	const cloudGeometry = new THREE.SphereGeometry(15, 32, 32); // Rayon, segments horizontaux, segments verticaux
	const cloudMaterial = new THREE.MeshLambertMaterial({ map: cloudTexture, transparent: true });
	const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
	cloudMesh.position.set(x, y, z);

	return cloudMesh;
}

function animate() {
	requestAnimationFrame(animate);
	const delta = clock.getDelta();
	if (mixer) {
		if (started == true) {
			if (currentSpeed != 0) {
				mixer.update(delta);
				document.getElementsByClassName("start_screen")[0].style.display = "none";
			}
			else
				mixer.update(0);
			// sphereGeometry.rotateX(currentSpeed);

			if (terrain)
				terrain.rotation.z += currentSpeed;
			if (stopped == false) {
				clouds1.position.y += 0.15;
				clouds2.position.y += 0.15;
			}
			if (clouds1.position.y > 470) {
				clouds1.position.x = Math.round((Math.random() * (140 - (-140))) + (-140));
				clouds1.position.y = 147;
			}
			if (clouds2.position.y > 470) {
				clouds2.position.x = Math.round((Math.random() * (140 - (-140))) + (-140));
				clouds2.position.y = 147;
			}
			dist += delta;
			// if (Math.round(dist) % 9 == 0)
			// 	scene.background = colors[Math.round(dist) % 9];
			// else
			// 	scene.background = colors[(Math.round(dist) + 1) % 9];
		}
		else
			mixer.update(0);
	}
	renderer.render(scene, camera);
}