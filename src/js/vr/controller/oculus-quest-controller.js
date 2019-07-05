/* jshint esversion: 6 */
/* global window, document */

import { cm, deg, mm, TEST_ENABLED } from '../../const';
import { GAMEPAD_HANDS } from '../gamepads';
import Controller from './controller';

const OFF = new THREE.Color(0x666666);
const ON = new THREE.Color(0xffffff);

export default class OculusQuestController extends Controller {

	constructor(parent, hand) {
		super(parent, hand);
	}

	addModel(hand) {
		const format = '.fbx'; // '.obj';
		const path = `${OculusQuestController.FOLDER}/${hand}/${hand}`;
		const matcap = new THREE.TextureLoader().load('img/matcap/matcap.jpg');
		const texture = new THREE.TextureLoader().load(`${path}.jpg`);
		const material = new THREE.MeshMatcapMaterial({
			color: ON, // hand === GAMEPAD_HANDS.RIGHT ? 0xffeeee : 0xeeeeff, // 0x991111 : 0x111199,
			map: texture,
			matcap: matcap,
			transparent: true,
			opacity: 1,
		});
		const mesh = new THREE.Group();
		const loader = format === '.fbx' ? new THREE.FBXLoader() : new THREE.OBJLoader();
		let i = 0;
		loader.load(`${path}${format}`, (object) => {
			/*
			const mixer = new THREE.AnimationMixer(object);
			const action = mixer.clipAction(object.animations[0]);
			action.play();
			*/
			object.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.material = material.clone();
					child.geometry.rotateX(child.rotation.x);
					child.geometry.rotateY(child.rotation.y);
					child.geometry.rotateZ(child.rotation.z);
					child.rotation.set(0, 0, 0);
					const position = child.position.clone();
					// left > 0 joystick, 1 trigger, 2 grip, 3 Y, 4 X
					// right > 0 joystick, 1 trigger, 2 grip, 3 A, 4 B
					switch (child.name) {
						case 'joystick':
							this.buttons[0] = function(value) {
								child.position.set(position.x, position.y - value * mm(2), position.z);
								Controller.mixColor(child.material.color, OFF, ON, value);
							};
							this.move = function(axis) {
								child.rotation.set(axis.y * deg(15), 0, axis.x * deg(15));
							};
							break;
						case 'trigger':
							this.buttons[1] = function(value) {
								child.rotation.set(-value * deg(20), 0, 0);
								Controller.mixColor(child.material.color, OFF, ON, value);
							};
							break;
						case 'grip':
							const direction = hand === GAMEPAD_HANDS.RIGHT ? 1 : -1;
							this.buttons[2] = function(value) {
								child.position.set(position.x + value * mm(2) * direction, position.y, position.z);
								Controller.mixColor(child.material.color, OFF, ON, value);
							};
							break;
						case 'buttonY':
						case 'buttonA':
							this.buttons[3] = function(value) {
								child.position.set(position.x, position.y - value * mm(2), position.z);
								Controller.mixColor(child.material.color, OFF, ON, value);
							};
							break;
						case 'buttonX':
						case 'buttonB':
							this.buttons[4] = function(value) {
								child.position.set(position.x, position.y - value * mm(2), position.z);
								Controller.mixColor(child.material.color, OFF, ON, value);
							};
							break;
						default:
					}
					i++;
				}
			});
			mesh.add(object);
			this.ready = true;
		}, (xhr) => {
			this.progress = xhr.loaded / xhr.total;
		}, (error) => {
			console.log(`OculusQuestController.addModel not found ${path}.obj`);
		});
		return mesh;
	}

	addRay(hand) {
		const geometry = new THREE.CylinderBufferGeometry(mm(1), mm(0.5), cm(30), 5); // 10, 12
		geometry.rotateX(Math.PI / 2);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			transparent: true,
			opacity: 0.5,
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(this.hand === GAMEPAD_HANDS.RIGHT ? cm(1) : -cm(1), 0, -cm(18.5));
		return mesh;
	}

	update(tick) {
		this.test(tick);
	}

	test(tick) {
		if (TEST_ENABLED && this.ready) {
			const x = Controller.getCos(tick, 0);
			const y = Controller.getCos(tick, 1);
			this.move({ x, y });
			this.buttons[1](Math.abs(Controller.getCos(tick, 1)));
			this.buttons[2](Math.abs(Controller.getCos(tick, 2)));
			this.buttons[3](Math.abs(Controller.getCos(tick, 3)));
			this.buttons[4](Math.abs(Controller.getCos(tick, 4)));
		}
	}

}

OculusQuestController.FOLDER = `models/oculus-quest`;
