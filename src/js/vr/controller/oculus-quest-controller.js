/* jshint esversion: 6 */
/* global window, document */

import { cm, deg, mm, TEST_ENABLED } from '../../const';
import { GAMEPAD_HANDS } from '../gamepads';
import Controller from './controller';
import { ControllerFragGlsl } from './controller-frag.glsl';

const OFF = new THREE.Color(0x000000);
const ON = new THREE.Color(0x2196f3);

export default class OculusQuestController extends Controller {

	constructor(parent, hand) {
		super(parent, hand);
	}

	addModel(hand) {
		const format = '.fbx'; // '.obj';
		const path = `${OculusQuestController.FOLDER}/${hand}/${hand}`;
		const matcap = new THREE.TextureLoader().load('img/matcap/matcap-04.jpg');
		const texture = new THREE.TextureLoader().load(`${path}.jpg`);
		const material = new THREE.MeshMatcapMaterial({
			color: 0xffffff,
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
					child.material.onBeforeCompile = (shader) => {
						// shader.uniforms.emissive = new THREE.Uniform(new THREE.Color(0x000000));
						shader.uniforms.emissive = new THREE.Uniform(ON);
						shader.uniforms.emissiveIntensity = { value: 0 };
						shader.fragmentShader = ControllerFragGlsl;
						child.shader = shader;
					};
					child.geometry.rotateX(child.rotation.x);
					child.geometry.rotateY(child.rotation.y);
					child.geometry.rotateZ(child.rotation.z);
					child.rotation.set(0, 0, 0);
					const position = child.position.clone();
					// left > 0 joystick, 1 trigger, 2 grip, 3 X, 4 Y
					// right > 0 joystick, 1 trigger, 2 grip, 3 A, 4 B
					switch (child.name) {
						case 'joystick':
							child.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
								const axis = this.axis[0];
								child.rotation.set(axis.y * deg(15), 0, -axis.x * deg(15));
								const value = this.buttons[0].value;
								child.position.set(position.x, position.y - value * mm(2), position.z);
								if (child.shader) {
									child.shader.uniforms.emissiveIntensity.value = value;
									// Controller.mixUniformColor(child.shader.uniforms.emissive, OFF, ON, value);
								}
							};
							break;
						case 'trigger':
							child.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
								const value = this.buttons[1].value;
								child.rotation.set(-value * deg(20), 0, 0);
								if (child.shader) {
									child.shader.uniforms.emissiveIntensity.value = value;
									// Controller.mixUniformColor(child.shader.uniforms.emissive, OFF, ON, value);
								}
							};
							break;
						case 'grip':
							const direction = hand === GAMEPAD_HANDS.RIGHT ? 1 : -1;
							child.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
								const value = this.buttons[2].value;
								child.position.set(position.x + value * mm(2) * direction, position.y, position.z);
								if (child.shader) {
									child.shader.uniforms.emissiveIntensity.value = value;
									// Controller.mixUniformColor(child.shader.uniforms.emissive, OFF, ON, value);
								}
							};
							break;
						case 'buttonX':
						case 'buttonA':
							child.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
								const value = this.buttons[3].value;
								child.position.set(position.x, position.y - value * mm(2), position.z);
								if (child.shader) {
									child.shader.uniforms.emissiveIntensity.value = value;
									// Controller.mixUniformColor(child.shader.uniforms.emissive, OFF, ON, value);
								}
							};
							break;
						case 'buttonY':
						case 'buttonB':
							child.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
								const value = this.buttons[4].value;
								child.position.set(position.x, position.y - value * mm(2), position.z);
								if (child.shader) {
									child.shader.uniforms.emissiveIntensity.value = value;
									// Controller.mixUniformColor(child.shader.uniforms.emissive, OFF, ON, value);
								}
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
			this.axis[0].x = Controller.getCos(tick, 0);
			this.axis[0].y = Controller.getCos(tick, 1);
			this.buttons[1].value = Math.abs(Controller.getCos(tick, 1));
			this.buttons[2].value = Math.abs(Controller.getCos(tick, 2));
			this.buttons[3].value = Math.abs(Controller.getCos(tick, 3));
			this.buttons[4].value = Math.abs(Controller.getCos(tick, 4));
		}
	}

}

OculusQuestController.FOLDER = `models/oculus-quest`;
