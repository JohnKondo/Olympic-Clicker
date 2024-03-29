import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { reactivateButton } from './slots.js';


let camera, scene, renderer;
let colors = [new THREE.Color(0x87ceeb), new THREE.Color(0x87cefa)];
let i = 0;
let isStarted = false;
let stopped = false;
const startSpeed = -0.001;
let currentSpeed = -0.001;
let speedMultiplicator = 1;
const maxSpeed = 0.1;
const maxTimescale = 2.00;

const audioListener = new THREE.AudioListener();
const backgroundAudio = new THREE.Audio(audioListener);
const clickAudioLoader = new THREE.AudioLoader();
const backgroundAudioLoader = new THREE.AudioLoader();

let action;
let change_relay = false;
let clickAnimationInProgress = false;
let animationId;
let nbClick = 0;
let nbCollision = 0;
let bronzePiece = 0;
let silverPiece = 0;
let bronzeValue;
let silverValue;

const pathTexture = "public/assets/textures";
const pathProps = "public/assets/props";

let relay_block;
const clock = new THREE.Clock();

let mixer;
let terrain;
let goldMedals;
let silverMedals;
let bronzeMedals;
let dist = 0;
let fileToLoad = 20;

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
	camera.add(audioListener);
	const sound = new THREE.Audio(audioListener);

	backgroundAudioLoader.load('public/assets/sounds/background-music.mp3', function (buffer) {
		backgroundAudio.setBuffer(buffer);
		backgroundAudio.setLoop(true);
		backgroundAudio.setVolume(0.5);
		backgroundAudio.setPlaybackRate(1 + currentSpeed * -2);
		backgroundAudio.play();
	});

	const loader = new FBXLoader();
	const textureLoader = new THREE.TextureLoader();

	// Terrain
	loader.load(`${pathProps}/terrain.fbx`, function (object) {
		const base_color = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_BaseColor.png`, updateFileToLoad);
		//const height = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_Height.png`);
		const normal = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_Normal.png`, updateFileToLoad);
		const roughness = textureLoader.load(`${pathTexture}/terrain/terrain_DefaultMaterial_Roughness.png`, updateFileToLoad);

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
		updateFileToLoad();
	});

	// bronze medals
	loader.load(`${pathProps}/medaille.fbx`, function (object) {
		const base_color = textureLoader.load(`${pathTexture}/medailles/bronze/medaille_DefaultMaterial_BaseColor.png`, updateFileToLoad);
		const normal = textureLoader.load(`${pathTexture}/medailles/bronze/medaille_DefaultMaterial_Normal.png`, updateFileToLoad);
		const roughness = textureLoader.load(`${pathTexture}/medailles/ARGENT/medaille_DefaultMaterial_Roughness.png`, updateFileToLoad);

		const texture = new THREE.MeshStandardMaterial({
			map: base_color,
			normalMap: normal,
			roughnessMap: roughness,
			roughness: 1,
			metalness: 0.5
		});

		object.scale.set(0.15, 0.15, 0.15);
		object.rotation.x = Math.PI / 4;
		object.rotation.y = Math.PI / 2;
		object.position.set(-118, 125, 300);

		bronzeMedals = object;

		bronzeMedals.traverse(function (child) {

			if (child.isMesh) {
				if (child.material && child.material.map !== undefined) {
					child.material = texture;
				}
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(bronzeMedals);
		updateFileToLoad();
	});

	// silver medals
	loader.load(`${pathProps}/medaille.fbx`, function (object) {
		const base_color = textureLoader.load(`${pathTexture}/medailles/ARGENT/medaille_DefaultMaterial_BaseColor.png`, updateFileToLoad);
		const normal = textureLoader.load(`${pathTexture}/medailles/ARGENT/medaille_DefaultMaterial_Normal.png`, updateFileToLoad);
		const roughness = textureLoader.load(`${pathTexture}/medailles/ARGENT/medaille_DefaultMaterial_Roughness.png`, updateFileToLoad);

		const texture = new THREE.MeshStandardMaterial({
			map: base_color,
			normalMap: normal,
			roughnessMap: roughness,
			roughness: 1,
			metalness: 0.5
		});

		object.scale.set(0.15, 0.15, 0.15);
		object.rotation.x = Math.PI / 4;
		object.rotation.y = Math.PI / 2;
		object.position.set(-125, 75, 300);

		silverMedals = object;

		silverMedals.traverse(function (child) {

			if (child.isMesh) {
				if (child.material && child.material.map !== undefined) {
					child.material = texture;
				}
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(silverMedals);
		updateFileToLoad();
	});

	// gold medals
	loader.load(`${pathProps}/medaille.fbx`, function (object) {
		const base_color = textureLoader.load(`${pathTexture}/medailles/or/medaille_DefaultMaterial_BaseColor.png`, updateFileToLoad);
		const normal = textureLoader.load(`${pathTexture}/medailles/or/medaille_DefaultMaterial_Normal.png`, updateFileToLoad);
		const roughness = textureLoader.load(`${pathTexture}/medailles/or/medaille_DefaultMaterial_Roughness.png`, updateFileToLoad);

		const texture = new THREE.MeshStandardMaterial({
			map: base_color,
			normalMap: normal,
			roughnessMap: roughness,
			roughness: 1,
			metalness: 0.5
		});

		object.scale.set(0.15, 0.15, 0.15);
		object.rotation.x = Math.PI / 4;
		object.rotation.y = Math.PI / 2;
		object.position.set(-132, 20, 300);

		goldMedals = object;

		goldMedals.traverse(function (child) {

			if (child.isMesh) {
				if (child.material && child.material.map !== undefined) {
					child.material = texture;
				}
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		scene.add(goldMedals);
		updateFileToLoad();
	});


	// model
	loader.load(`${pathProps}/perso-run.fbx`, function (object) {
		// const base_color1 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_1.png`); // Number 1169
		// const base_color2 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_2.png`); // Number 1488
		// const base_color3 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_3.png`); // Number 1945
		const base_color4 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_4.png`, updateFileToLoad); // Number 1175
		// const height = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Height.png`);
		const normal = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Normal.png`, updateFileToLoad);
		const roughness = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Roughness.png`, updateFileToLoad);

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
		object.name = "perso";
		scene.add(object);
		updateFileToLoad();
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
	bronzeValue = document.getElementById("bronzeValue");
	silverValue = document.getElementById("silverValue");
	const btn = document.createElement('a');
	const imgBtn = document.createElement('img');
	imgBtn.src = "public/assets/img/RUN_off.png";
	imgBtn.classList.add("pressBtn");
	btn.appendChild(imgBtn);
	btn.setAttribute("ontouchstart", '');
	btn.id = "run-button";
	//btn.style.display = "none";
	btn.classList.add("pressBtn");
	btn.addEventListener("mousedown", function () {
		imgBtn.src = "public/assets/img/RUN_on.png";
	});
	btn.addEventListener("mouseup", function () {
		imgBtn.src = "public/assets/img/RUN_off.png";
	});
	btn.addEventListener("touchstart", function () {
		imgBtn.src = "public/assets/img/RUN_on.png";
	});
	btn.addEventListener("touchend", function () {
		imgBtn.src = "public/assets/img/RUN_off.png";
	});
	btn.addEventListener("click", function (e) {
		startGame()
		nbClick++;
		if (currentSpeed <= maxSpeed) {
			if (stopped) {
				currentSpeed = -0.001;
				stopped = false;
			}
			currentSpeed = currentSpeed - 0.0008 * speedMultiplicator;
			speedMultiplicator != 1 ? bronzePiece += 2 : bronzePiece += 1;
			if (bronzePiece >= 30) {
				silverPiece++;
				silverValue.textContent = silverPiece.toString();
				bronzePiece -= 30;
			}
			bronzeValue.textContent = bronzePiece.toString();

		}
		if (Math.floor(action.timeScale) < maxTimescale)
			action.timeScale += 0.1;
		createClickEffect(e, container);
		clickAudioLoader.load('public/assets/sounds/click.wav', function (buffer) {
			sound.setBuffer(buffer);
			sound.setVolume(0.1);
			sound.setLoop(false);
			sound.play();
		});
		document.getElementById("slotContainer").style.display = "none";
		document.getElementById("looseDiv").style.display = "none";
		document.getElementById("winDiv").style.display = "none";
		document.getElementById("spinDiv").style.display = "none";
		reactivateButton();
	});

	setTimeout(function decrement() {
		if (isStarted) {
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


	// Clouds
	generate_clouds(1, 50, 90);
	generate_clouds(2, -50);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateFileToLoad() {
	fileToLoad--;
	if (fileToLoad == 0)
		setTimeout(() => {
			document.getElementById('run-button').style.display = "flex";
		}, 500);
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

function generate_clouds(index, x, y = 150, z = 300) {
	// const cloudTexture = new THREE.TextureLoader().load('public/clouds.jpg');
	// const cloudGeometry = new THREE.SphereGeometry(15, 32, 32); // Rayon, segments horizontaux, segments verticaux
	// const cloudMaterial = new THREE.MeshLambertMaterial({ map: cloudTexture, transparent: true });
	// const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);

	new FBXLoader().load(`${pathProps}/nuage.fbx`, function (object) {

		object.scale.set(0.1, 0.1, 0.1);
		object.position.set(x, y, z);
		object.rotation.y = Math.PI / 2;
		object.name = `cloud${index}`;
		scene.add(object);
		// terrain.attach(object);
	});
}

/**
 * @description A partir de la position actuelle + 4, on ajoute un relay qui va stopper le personnage
 */
function add_relay() {
	if (dist > 5 && (dist.toFixed(1) % 5 <= 0.1)) {
		relay_block = new THREE.Mesh(new THREE.BoxGeometry(300, 200, 10), new THREE.MeshBasicMaterial({ color: '#FC2C00', transparent: true, opacity: 0.5 }));

		// const textureLoader = new THREE.TextureLoader();

		// const base_color4 = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_BaseColor_4.png`, updateFileToLoad); // Number 1175
		// // const height = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Height.png`);
		// const normal = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Normal.png`, updateFileToLoad);
		// const roughness = textureLoader.load(`${pathTexture}/texture_perso/bonhomme_baton_DefaultMaterial_Roughness.png`, updateFileToLoad);

		// const texturePerso = new THREE.MeshStandardMaterial({
		// 	map: base_color4,
		// 	normalMap: normal,
		// 	roughnessMap: roughness,
		// });

		// new FBXLoader().load(`${pathProps}/Standing.fbx`, function (object) {
		// 	object.scale.set(0.1, 0.1, 0.1);
		// 	object.position.set(0, -400, 500);
		// 	object.rotation.x = Math.PI / 3;
		// 	object.name = "relay";

		// 	object.traverse(function (child) {
		// 		if (child.isMesh) {
		// 			child.material = texturePerso;
		// 			child.castShadow = true;
		// 			child.receiveShadow = true;
		// 		}
		// 	});

		// 	let newmixer = new THREE.AnimationMixer(object);
		// 	const action = newmixer.clipAction(object.animations[0]);
		// 	action.play();
		// 	relay_block = object;
		// 	scene.add(relay_block);
		// 	terrain.attach(relay_block);
		// });

		relay_block.name = "relay";
		relay_block.position.set(0, -200, 500);
		relay_block.rotation.x = Math.PI / 3;
		scene.add(relay_block);
		terrain.attach(relay_block);

		change_relay = true;
	}
}

function detecte_collision(object1, object2) {

	// console.log(object2);
	let box1 = new THREE.Box3().setFromObject(object1);
	let box2 = new THREE.Box3().setFromObject(object2);
	return box1.intersectsBox(box2);
}

function update_relay() {

	if (change_relay == true && relay_block) {
		let check_collision = detecte_collision(scene.getObjectByName("perso"), scene.getObjectByName("relay"));

		if (check_collision == true) {
			nbCollision++;
			if (nbCollision == 1)
				speedMultiplicator = 1.6;
			else
				speedMultiplicator = 1;
			//console.log("collision detected");
			stopped = true;
			currentSpeed = 0;
			terrain.remove(relay_block);
			document.getElementById('run-button').style.display = "none";
			document.getElementById("slotContainer").style.display = "block";
			document.getElementById("spinDiv").style.display = "flex";
			change_relay = false;
		}
	}
	else {
		add_relay();
	}
}


function animate() {
	backgroundAudio.setPlaybackRate(1 + currentSpeed * -2);
	requestAnimationFrame(animate);
	let clouds1 = scene.getObjectByName("cloud1");
	let clouds2 = scene.getObjectByName("cloud2");

	const delta = clock.getDelta();
	if (mixer) {
		if (isStarted == true) {
			if (currentSpeed != 0) {
				mixer.update(delta);
				dist += delta;
				document.getElementsByClassName("start_screen")[0].style.display = "none";
			}
			else
				mixer.update(0);
			// sphereGeometry.rotateX(currentSpeed);

			if (terrain)
				terrain.rotation.z += currentSpeed * speedMultiplicator;
			if (stopped == false) {
				clouds1.position.y += 0.15;
				clouds2.position.y += 0.15;
			}
			if (clouds1.position.y > 370) {
				clouds1.position.x = Math.round((Math.random() * (140 - (-140))) + (-140));
				clouds1.position.y = 90;
			}
			if (clouds2.position.y > 370) {
				clouds2.position.x = Math.round((Math.random() * (140 - (-140))) + (-140));
				clouds2.position.y = 130;
			}
			/* console.log(dist.toFixed(1)); */
			update_relay();

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

function spinSlot() {
	silverPiece--;
	silverValue.textContent = silverPiece.toString();
	document.getElementById("spinDiv").style.display = "none";
}

function startGame() {
	if (isStarted == false) {
		document.getElementById('download-banner').style.display = "none";
		isStarted = true;
	}
	if (backgroundAudio.isPlaying == false) {
		backgroundAudio.play();
	}
}

export { spinSlot };