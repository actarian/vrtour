/* jshint esversion: 6 */
/* global window, document */

import { POINTER_RADIUS, TEST_ENABLED } from '../const';
import Emittable from '../interactive/emittable';
import Menu from '../menu/menu';
// import Controller from './controller/controller';
import OculusQuestController from './controller/oculus-quest-controller';
import Gamepads, { GAMEPAD_HANDS } from './gamepads';

export default class Controllers extends Emittable {

	constructor(renderer, scene, pivot) {
		super();
		this.tick = 0;
		this.controllers_ = {};
		this.gamepads_ = {};
		this.renderer = renderer;
		this.scene = scene;
		this.pivot = pivot;
		this.direction = new THREE.Vector3();
		const text = this.text = this.addText_(pivot);
		const gamepads = this.gamepads = this.addGamepads_();
		this.addTestController_();
	}

	get controller() {
		return this.controller_;
	}

	set controller(controller) {
		if (this.controller_ !== controller) {
			if (this.controller_) {
				this.controller_.active = false;
			}
			this.controller_ = controller;
			controller.active = true;
		}
	}

	get gamepad() {
		return this.gamepad_;
	}

	set gamepad(gamepad) {
		if (this.gamepad_ !== gamepad) {
			this.gamepad_ = gamepad;
			this.controller = this.controllers_[gamepad.index];
		}
	}

	feedback() {
		const gamepad = this.gamepad;
		if (gamepad) {
			gamepad.feedback();
		}
	}

	update() {
		this.gamepads.update(this.tick);
		Object.keys(this.controllers_).forEach(x => this.controllers_[x].update(this.tick));
		this.tick++;
	}

	updateTest(mouse) {
		const controller = this.controller;
		if (controller) {
			controller.rotation.y = -mouse.x * Math.PI;
			controller.rotation.x = mouse.y * Math.PI / 2;
		}
	}

	setRaycaster(raycaster) {
		const controller = this.controller;
		if (controller) {
			const pivot = controller.parent;
			const position = pivot.position;
			const rotation = pivot.getWorldDirection(this.direction).multiplyScalar(-1);
			raycaster.set(position, rotation);
			return raycaster;
		}
	}

	onMenuDown(event) {
		const item = event.item;
		const index = event.index;
		// console.log('Controllers.onMenuDown', item, index);
		if (index === 0 || index === 2) {
			const direction = index === 0 ? -1 : 1;
			const y = this.pivot.rotation.y + Math.PI / 2 * direction;
			// this.pivot.ery = y;
			this.pivot.busy = true;
			TweenMax.to(this.pivot.rotation, 0.7, {
				y,
				ease: Power2.easeInOut,
				onComplete: () => {
					this.pivot.busy = false;
				}
			});
		} else if (index === 1) {
			const panel = this.menu.addPanel();
			if (panel) {
				this.menu.panel = panel;
				this.menu.next();
				this.menu.appear(panel);
			}
		}
	}

	addGamepads_() {
		const gamepads = this.gamepads = new Gamepads((text) => {
			this.setText(text);
		});
		gamepads.on('connect', (gamepad) => {
			// console.log('connect', gamepad);
			this.setText(`connect ${gamepad.hand} ${gamepad.index}`);
			const controller = this.addController_(this.renderer, this.scene, gamepad);
			if (gamepad.hand === GAMEPAD_HANDS.LEFT) {
				this.left = controller;
				const menu = this.menu = new Menu(controller);
				menu.on('down', (event) => {
					this.onMenuDown(event);
				});
			} else {
				this.right = controller;
			}
		});
		gamepads.on('disconnect', (gamepad) => {
			// console.log('disconnect', gamepad);
			this.setText(`disconnect ${gamepad.hand} ${gamepad.index}`);
			this.removeController_(gamepad);
		});
		gamepads.on('hand', (gamepad) => {
			this.gamepad = gamepad;
		});
		gamepads.on('press', (button) => {
			// console.log('press', press);
			this.setText(`press ${button.gamepad.hand} ${button.index}`);
			switch (button.gamepad.hand) {
				case GAMEPAD_HANDS.LEFT:
					// 0 joystick, 1 trigger, 2 grip, 3 X, 4 Y
					switch (button.index) {
						case 1:
							this.menu.exit();
							break;
						case 2:
							this.menu.enter();
							break;
						case 3:
							// this.menu.next();
							break;
					}
					break;
				case GAMEPAD_HANDS.RIGHT:
					// 0 joystick, 1 trigger, 2 grip, 3 A, 4 B
					break;
			}
			const controller = this.controllers_[button.gamepad.index];
			if (controller) {
				controller.press(button.index);
			}
		});
		gamepads.on('release', (button) => {
			// console.log('release', button);
			// this.setText(`release ${button.gamepad.hand} ${button.index}`);
			const controller = this.controllers_[button.gamepad.index];
			if (controller) {
				controller.release(button.index);
			}
		});
		gamepads.on('axis', (axis) => {
			// console.log('axis', axis);
			// this.setText(`axis ${axis.gamepad.hand} ${axis.index} { x:${axis.x}, y:${axis.y} }`);
			// axisup, axisdown, axisleft, axisright
			// this.menu.next();
			const controller = this.controllers_[axis.gamepad.index];
			if (controller) {
				controller.axis[axis.index] = axis;
			}
		});
		gamepads.on('broadcast', (type, event) => {
			this.emit(type, event);
		});
		return gamepads;
	}

	addController_(renderer, scene, gamepad) {
		const index = gamepad.index;
		let controller = this.controllers_[index];
		if (!controller) {
			const pivot = renderer.vr.getController(index);
			controller = new OculusQuestController(pivot, gamepad.hand);
			this.controllers_[index] = controller;
			scene.add(pivot);
		}
		return controller;
	}

	removeController_(gamepad) {
		const controller = this.controllers_[gamepad.index];
		if (controller) {
			const pivot = controller.parent;
			this.scene.remove(pivot);
			controller.parent.remove(controller);
			delete this.controllers_[gamepad.index];
		}
	}

	addTestController_() {
		if (TEST_ENABLED) {
			// const controller = new Controller(this.scene, GAMEPAD_HANDS.RIGHT);
			const controller = new OculusQuestController(this.scene, GAMEPAD_HANDS.RIGHT);
			controller.scale.set(5, 5, 5);
			this.controller = controller;
			this.controllers_[0] = controller;
			/*
			document.addEventListener('mousedown', this.onRightSelectStart);
			document.addEventListener('mouseup', this.onRightSelectEnd);
			const group = new THREE.Group();
			const menu = this.menu = new Menu(group);
			menu.on('down', (event) => {
				this.onMenuDown(event);
			});
			group.rotation.set(Math.PI / 2, 0, 0);
			group.position.set(0, 0, -2);
			group.scale.set(5, 5, 5);
			pivot.add(group);
			*/
		}
	}

	addText_(parent) {
		const loader = new THREE.FontLoader();
		loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
			this.font = font;
			const material = new THREE.MeshBasicMaterial({
				color: 0x111111, // 0x33c5f6,
				transparent: true,
				opacity: 1,
				side: THREE.DoubleSide
			});
			this.fontMaterial = material;
		});
	}

	setText(message) {
		message = message || '1';
		if (this.text) {
			this.text.parent.remove(this.text);
			this.text.geometry.dispose();
		}
		if (this.font) {
			// console.log(this.font.generateShapes);
			const shapes = this.font.generateShapes(message, 5);
			const geometry = new THREE.ShapeBufferGeometry(shapes);
			geometry.computeBoundingBox();
			const x = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
			geometry.translate(x, 0, 0);
			const text = new THREE.Mesh(geometry, this.fontMaterial);
			text.position.set(0, 0, -POINTER_RADIUS);
			this.text = text;
			this.pivot.add(text);
		}
	}

}
