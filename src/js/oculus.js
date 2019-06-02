/* jshint esversion: 6 */
/* global window, document, TweenMax, THREE, WEBVR */

export function random() {
	return Math.random() - 0.5;
}

export class Oculus {

	constructor() {
		this.count = 0;
		this.normal = new THREE.Vector3();
		this.relativeVelocity = new THREE.Vector3();
		this.clock = new THREE.Clock();
	}

	init() {
		const section = document.querySelector('.vrtour');
		const container = section.querySelector('.vrtour__container');
		const scene = this.scene = this.addScene();
		const camera = this.camera = this.addCamera();
		const room = this.room = this.addRoom(scene);
		const bills = this.bills = this.addBillsToFloor(room);
		const renderer = this.renderer = this.addRenderer(container);
		// controllers
		const left = this.left = this.addControllerLeft(renderer, scene);
		const right = this.right = this.addControllerRight(renderer, scene);
		// hands
		const hands = this.hands = this.addHands();
		// this.onSelectStart = this.onSelectStart.bind(this);
		// this.onSelectEnd = this.onSelectEnd.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		window.addEventListener('resize', this.onWindowResize, false);
	}

	addScene() {
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x404040);
		scene.fog = new THREE.Fog(scene.background, 10, 15);
		return scene;
	}

	addCamera() {
		const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 20);
		return camera;
	}

	addRoom(scene) {
		const geometry = new THREE.PlaneBufferGeometry(15, 15);
		geometry.rotateX(-Math.PI / 2);
		geometry.translate(0, -0.01, 0);
		const material = new THREE.MeshBasicMaterial({ color: 0x202020 });
		const room = new THREE.Mesh(geometry, material);
		scene.add(room);
		return room;
	}

	addRenderer(container) {
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.vr.enabled = true;
		container.appendChild(renderer.domElement);
		document.body.appendChild(WEBVR.createButton(renderer));
		return renderer;
	}

	addControllerLeft(renderer, scene) {
		const controller = renderer.vr.getController(0);
		controller.addEventListener('selectstart', this.onSelectStart.bind(controller));
		controller.addEventListener('selectend', this.onSelectEnd.bind(controller));
		scene.add(controller);
		return controller;
	}

	addControllerRight(renderer, scene) {
		const controller = renderer.vr.getController(1);
		/*
		controller.addEventListener('selectstart', this.onSelectStart.bind(controller));
		controller.addEventListener('selectend', this.onSelectEnd.bind(controller));
		*/
		scene.add(controller);
		return controller;
	}

	addBillsToFloor(room) {
		const geometry = new THREE.PlaneBufferGeometry(0.2, 0.09);
		geometry.rotateZ(Math.PI / 2);
		geometry.rotateX(-Math.PI / 2);
		const texture = new THREE.TextureLoader().load('https://cdn.glitch.com/cf086db5-7af7-4f20-8220-93d1d99150b7%2F100_dollar_bill_vector.png?1558543607686');
		texture.anisotropy = 8;
		const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
		const bills = new Array(400).fill(0).map((x, i) => {
			const bill = new THREE.Mesh(geometry, material);
			bill.position.x = random() * 8;
			bill.position.y = Math.random() * 6;
			bill.position.z = random() * 8;
			bill.rotation.y = random() * Math.PI * 2;
			bill.userData.velocity = new THREE.Vector3();
			bill.userData.velocity.x = random() * 0.01;
			bill.userData.velocity.y = random() * 0.01;
			bill.userData.velocity.z = random() * 0.01;
			bill.userData.noise = random() * 0.1;
			room.add(bill);
			return bill;
		});
		return bills;
	}

	addBillsToHand(hand) {
		const room = this.room;
		const bills = new Array(10).fill(0).map((x, i) => {
			const bill = room.children[0].clone();
			bill.position.set(i * 0.003 + 0.02, -0.05, 0);
			bill.rotation.set(random() * 0.3, random() * 0.1, -Math.PI / 2);
			hand.add(bill);
			this.right.userData.bill = bill; // pointer to last bill
			return bill;
		});
		return bills;
	}

	addHands() {
		const hands = [];
		const left = this.left;
		const right = this.right;
		const file = 'https://cdn.glitch.com/7ae766be-18fb-4945-ad9d-8cc3be027694%2Fhand.obj?1558677422910';
		const loader = new THREE.OBJLoader();
		loader.load(file, (group) => {
			const texture = new THREE.TextureLoader().load('https://cdn.glitch.com/7ae766be-18fb-4945-ad9d-8cc3be027694%2FBazC_SkinMat.jpg?1558678160164');
			const hand = group.children[0];
			hand.geometry.rotateZ(-Math.PI / 2);
			hand.geometry.rotateY(Math.PI);
			hand.geometry.translate(1, -0.2, 0.25);
			hand.geometry.scale(0.1, 0.1, 0.1);
			hand.material = new THREE.MeshMatcapMaterial({ matcap: texture });
			hand.scale.x = -1;
			const leftHand = hand.clone();
			left.add(leftHand);
			hands.push(leftHand);
			hand.scale.x = 1;
			const bills = this.addBillsToHand(hand);
			const rightHand = hand.clone();
			right.add(rightHand);
			hands.push(rightHand);
		});
		return hands;
	}

	onSelectStart() {
		this.userData.isSelecting = true;
	}

	onSelectEnd() {
		this.userData.isSelecting = false;
	}

	onWindowResize() {
		const camera = this.camera;
		const renderer = this.renderer;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	handleController(controller) {
		const room = this.room;
		if (controller.userData.isSelecting) {
			const bill = room.children[count++];
			const emitter = controller.children[0].children[9];
			emitter.matrixWorld.decompose(bill.position, bill.quaternion, bill.scale);
			bill.userData.velocity.x = random();
			bill.userData.velocity.y = random() + 0.5;
			bill.userData.velocity.z = Math.random() - 5;
			bill.userData.velocity.applyQuaternion(bill.quaternion);
			bill.userData.noise = random() * 0.1;
			if (count === room.children.length) count = 0;
		}
	}

	handleBills() {
		const clock = this.clock;
		const room = this.room;
		const delta = clock.getDelta() * 0.5; // slow down simulation
		room.children.forEach(bill => {
			const userData = bill.userData;
			const velocity = userData.velocity;
			bill.position.x += velocity.x * delta;
			bill.position.y += velocity.y * delta;
			bill.position.z += velocity.z * delta;
			// flatten rotation
			bill.rotation.x *= 0.99;
			bill.rotation.z *= 0.99;
			// handle floor
			if (bill.position.y <= 0) {
				bill.position.y = 0;
				velocity.x *= 0.85;
				velocity.y = 0;
				velocity.z *= 0.85;
			}
			const height = bill.position.y * 0.1;
			if (height > 0) {
				velocity.x += userData.noise * height;
				velocity.y -= 9.8 * delta;
				velocity.z += userData.noise * height;
				bill.rotation.y += userData.noise * height;
			}
		});
	}

	render() {
		const left = this.left;
		const right = this.right;
		const renderer = this.renderer;
		const scene = this.scene;
		const camera = this.camera;
		this.handleController(left);
		this.handleController(right);
		this.handleBills();
		renderer.render(scene, camera);
	}

	animate() {
		const left = this.left;
		const right = this.right;
		const renderer = this.renderer;
		const scene = this.scene;
		const camera = this.camera;
		const handleController = this.handleController.bind(this);
		const handleBills = this.handleBills.bind(this);
		const render = function() {
			handleController(left);
			handleController(right);
			handleBills();
			renderer.render(scene, camera);
		}
		this.renderer.setAnimationLoop(render);
	}

}

const oculus = new Oculus();

// window.onload = () => {
oculus.init();
oculus.animate();
// };
