import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


let camera, scene, renderer;
let colors = [new THREE.Color(0xa0ffff), new THREE.Color(0xffff0a)];
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

const sphereGeometry = new THREE.SphereGeometry(2000, 64, 64);
let clouds1 = generate_clouds(50, 200);
let clouds2 = generate_clouds(-50);
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

	const loader = new FBXLoader();

	// Charger la texture de piste et créer un matériau
	const textureLoader = new THREE.TextureLoader();
	const texture1 = textureLoader.load('public/assets/textures/terrain/terrain_DefaultMaterial_BaseColor.png');
	const texture2 = textureLoader.load('public/assets/textures/terrain/terrain_DefaultMaterial_Height.png');
	const texture3 = textureLoader.load('public/assets/textures/terrain/terrain_DefaultMaterial_Normal.png');
	const texture4 = textureLoader.load('public/assets/textures/terrain/terrain_DefaultMaterial_Roughness.png');
	const trackMaterial = new THREE.MeshStandardMaterial({
		map: texture1, // Texture de base
		displacementMap: texture2, // Texture de déplacement
		normalMap: texture3, // Texture de normal
		roughnessMap: texture4 // Texture de rugosité
	});
	
	loader.load('public/assets/props/terrain.fbx', function (object) {
		console.log(object);
		object.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.material = trackMaterial; // Appliquer le matériau à chaque maillage dans l'objet FBX
			}
		});
		scene.add(object);
	});

	// const trackMaterial = new THREE.MeshBasicMaterial({
	// 	map: new THREE.TextureLoader().load('public/red-background-material.jpg'),
	// });

	// Créer un mesh pour le terrain sphérique
	const sphereMesh = new THREE.Mesh(sphereGeometry, trackMaterial);
	sphereMesh.scale.set(2, 1, 2);
	sphereMesh.position.set(0, -2000, 0);
	scene.add(sphereMesh);

    scene.add(clouds1);
    scene.add(clouds2);

	// model
	loader.load('public/perso-run.fbx', function (object) {
		object.scale.x = object.scale.y = object.scale.z = 0.15;
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
	btn.addEventListener("click", function (e) {
		started = true;
		nbClick++;
		if (currentSpeed <= maxSpeed)
		{
			if (stopped) {
				currentSpeed = -0.001;
				stopped = false;
			}
			currentSpeed = currentSpeed - 0.0008;
		}
		if (Math.floor(action.timeScale) < maxTimescale)
			action.timeScale += 0.1;
		const clickEffect = document.querySelector(".click-effect");
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

	const clickEffect = document.createElement("div");
	clickEffect.classList.add("click-effect");
	for (let i = 0; i < 8; i++) {
		const spike = document.createElement("div");
		spike.classList.add("spike");
		spike.style.setProperty("--angle", `${i * 45}deg`);
		spike.style.setProperty("--distance", `${30 + Math.random() * 5}px`);
		clickEffect.appendChild(spike);
	}
	container.appendChild(clickEffect);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// function generate_clouds() {
//     const cloudGeometry = new THREE.TextureLoader().load('public/nuage.png');
//     const cloudGeo = new THREE.PlaneGeometry(300, 100);
//     const material = new THREE.MeshBasicMaterial({ map: cloudGeometry});
//     let cloud = new THREE.Mesh(cloudGeo, material);

//     cloud.position.set(0, 300 , 0);
//     cloud.rotation.x = -180;

//     return cloud;
// }

function generate_clouds(x, y = 150, z = 300) {
    const cloudTexture = new THREE.TextureLoader().load('public/clouds.jpg');
    const cloudGeometry = new THREE.SphereGeometry(15, 32, 32); // Rayon, segments horizontaux, segments verticaux
    const cloudMaterial = new THREE.MeshLambertMaterial({ map: cloudTexture, transparent: true });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.position.set(x, y, z);

    return cloudMesh;
}


// function start_game( container,  ) {

//     // On ajoute un écran sombre transparent à la scène

//     container.appendChild(arrow);
// }


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
			sphereGeometry.rotateX(currentSpeed);
            clouds1.position.y += 0.15;
            clouds2.position.y += 0.15;
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