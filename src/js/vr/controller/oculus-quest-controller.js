/* jshint esversion: 6 */
/* global window, document */

import { cm, deg, mm } from '../../const';
import { GAMEPAD_HANDS } from '../gamepads';
import Controller from './controller';

const OFF = new THREE.Color(0xcccccc);
const ON = new THREE.Color(0xffffff);

export default class OculusQuestController extends Controller {

	constructor(parent, hand) {
		super(parent, hand);
	}

	addModel(hand) {
		const path = `${OculusQuestController.FOLDER}/${hand}/${hand}`;
		const matcap = new THREE.TextureLoader().load('img/matcap.jpg');
		const texture = new THREE.TextureLoader().load(`${path}.png`)
		const material = new THREE.MeshMatcapMaterial({
			color: OFF, // hand === GAMEPAD_HANDS.RIGHT ? 0xffeeee : 0xeeeeff, // 0x991111 : 0x111199,
			map: texture,
			matcap: matcap,
			transparent: true,
			opacity: 1,
		});
		const mesh = new THREE.Group();
		const loader = new THREE.OBJLoader();
		let i = 0;
		loader.load(`${path}.obj`, (object) => {
			const x = hand === GAMEPAD_HANDS.RIGHT ? -cm(1) : cm(1);
			object.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.material = material.clone();
					// 0 joystick, 1 trigger, 2 grip, 3 Y, 4 X
					// 0 joystick, 1 trigger, 2 grip, 3 A, 4 B
					function onButton(value) {
						child.position.set(0, -value * mm(5), 0);
						child.material.color.set(OFF.lerp(ON, value));
					};
					switch (child.name) {
						case 'joystick':
							this.buttons[0] = onButton;
							this.move = function(axis) {
								child.rotation.set(axis.y * deg(20), 0, axis.x * deg(20));
							}
							break;
						case 'trigger':
							this.buttons[1] = function(value) {
								child.rotation.set(-value * deg(10), 0, 0);
								child.material.color.set(OFF.lerp(ON, value));
							};
							break;
						case 'grip':
							this.buttons[1] = function(value) {
								child.position.set(-value * mm(5), 0, 0);
								child.material.color.set(OFF.lerp(ON, value));
							};
							break;
						case 'buttonY':
						case 'buttonA':
							this.buttons[3] = onButton;
							break;
						case 'buttonX':
						case 'buttonB':
							this.buttons[4] = onButton;
							break;
						default:
					}
					i++;
				}
			});
			mesh.add(object);
		}, (xhr) => {
			this.progress = xhr.loaded / xhr.total;
		}, (error) => {
			console.log(`OculusQuestController.addModel not found ${path}.obj`);
		});
		return mesh;
	}

	addRay(hand) {
		const geometry = new THREE.CylinderBufferGeometry(mm(2), mm(1), cm(30), 5); // 10, 12
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

}

OculusQuestController.FOLDER = `models/oculus-quest`;
