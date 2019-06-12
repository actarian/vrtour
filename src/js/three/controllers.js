/* jshint esversion: 6 */
/* global window, document */

import { cm, POINTER_RADIUS, TEST_ENABLED } from './const';

export default class Controllers {

	constructor(renderer, scene, pivot) {
		this.events = {};
		this.gamepads = {};
		this.renderer = renderer;
		this.scene = scene;
		this.pivot = pivot;
		this.controllerDirection = new THREE.Vector3();
		this.onLeftSelectStart = this.onLeftSelectStart.bind(this);
		this.onLeftSelectEnd = this.onLeftSelectEnd.bind(this);
		this.onRightSelectStart = this.onRightSelectStart.bind(this);
		this.onRightSelectEnd = this.onRightSelectEnd.bind(this);
		if (TEST_ENABLED) {
			const right = this.right = this.addControllerTest(scene);
			document.addEventListener('mousedown', this.onRightSelectStart);
			document.addEventListener('mouseup', this.onRightSelectEnd);
		} else {
			const left = this.left = this.addControllerLeft(renderer, scene);
			const right = this.right = this.addControllerRight(renderer, scene);
		}
		const text = this.text = this.addText(pivot);
	}

	on(type, callback) {
		const event = this.events[type] = this.events[type] || [];
		event.push(callback);
		return () => {
			this.events[type] = event.filter(x => x !== callback);
		};
	}

	off(type, callback) {
		const event = this.events[type];
		if (event) {
			this.events[type] = event.filter(x => x !== callback);
		}
	}

	emit(type, data) {
		const event = this.events[type];
		if (event) {
			event.forEach(callback => {
				// callback.call(this, data);
				callback(data);
			});
		}
	}

	update() {
		const gamePadLeft = this.findGamepad_(0);
		if (gamePadLeft) {
			const triggerLeft = gamePadLeft ? gamePadLeft.buttons.reduce((p, b, i) => b.pressed ? i : p, -1) : -1;
			if (triggerLeft !== -1) {
				this.onLeftSelectStart(triggerLeft);
			} else {
				this.onLeftSelectEnd();
			}
		}
		const gamePadRight = this.findGamepad_(1);
		if (gamePadRight) {
			const triggerRight = gamePadRight ? gamePadRight.buttons.reduce((p, b, i) => b.pressed ? i : p, -1) : -1;
			if (triggerRight !== -1) {
				this.onRightSelectStart(triggerRight);
			} else {
				this.onRightSelectEnd();
			}
		}
	}

	updateTest(mouse) {
		const controller = this.controller;
		if (controller) {
			controller.rotation.y = -mouse.x * Math.PI;
			controller.rotation.x = mouse.y * Math.PI / 2;
		}
	}

	onLeftSelectStart(id) {
		try {
			// 1 front, 2 side, 3 Y, 4 X, 5?
			this.setText(String(id));
			if (this.controller !== this.left) {
				if (this.controller) {
					this.controller.remove(this.controller.indicator);
				}
				this.controller = this.left;
				this.controller.add(this.controller.indicator);
			}
			this.isControllerSelecting = true;
			this.isControllerSelectionDirty = true;

		} catch (error) {
			this.emit('error', error);
		}
	}

	onLeftSelectEnd() {
		try {
			if (this.controller === this.left) {
				this.isControllerSelecting = false;
				this.isControllerSelectionDirty = false;
			}

		} catch (error) {
			this.emit('error', error);
		}
	}

	onRightSelectStart(id) {
		try {
			// 1 front, 2 side, 3 A, 4 B, 5?
			this.setText(String(id));
			if (this.controller !== this.right) {
				if (this.controller) {
					this.controller.remove(this.controller.indicator);
				}
				this.controller = this.right;
				this.controller.add(this.controller.indicator);
			}
			this.isControllerSelecting = true;
			this.isControllerSelectionDirty = true;
		} catch (error) {
			this.emit('error', error);
		}
	}

	onRightSelectEnd() {
		try {
			if (this.controller === this.right) {
				this.isControllerSelecting = false;
				this.isControllerSelectionDirty = false;
			}

		} catch (error) {
			this.emit('error', error);
		}
	}

	addControllerTest(scene) {
		const controller = new THREE.Group();
		controller.position.set(0, 0, 0);
		const cylinder = controller.cylinder = this.addControllerCylinder(controller, 0);
		scene.add(controller);
		return controller;
	}

	addControllerLeft(renderer, scene) {
		const controller = renderer.vr.getController(0);
		const cylinder = controller.cylinder = this.addControllerCylinder(controller, 0);
		scene.add(controller);
		return controller;
	}

	addControllerRight(renderer, scene) {
		const controller = renderer.vr.getController(1);
		const cylinder = controller.cylinder = this.addControllerCylinder(controller, 1);
		scene.add(controller);
		return controller;
	}

	addControllerCylinder(controller, i) {
		const geometry = new THREE.CylinderBufferGeometry(cm(2), cm(2), cm(12), 24);
		const texture = new THREE.TextureLoader().load('img/matcap.jpg');
		const material = new THREE.MeshMatcapMaterial({
			color: i === 0 ? 0xff0000 : 0x0000ff,
			matcap: texture,
			transparent: true,
			opacity: 1,
		});
		/*
		const material = new THREE.MeshBasicMaterial({
			color: i === 0 ? 0x0000ff : 0xff0000,
			// roughness: 0.2,
			// metalness: 0.1,
		});
		*/
		/*
		const modifier = new THREE.SubdivisionModifier(2);
		const smoothGeometry = modifier.modify(geometry);
		const smoothBufferGeometry = new THREE.BufferGeometry().fromGeometry(smoothGeometry);
		const mesh = new THREE.Mesh(smoothBufferGeometry, material);
		*/
		const mesh = new THREE.Mesh(geometry, material);
		mesh.geometry.rotateX(Math.PI / 2);
		controller.add(mesh);
		//
		const geometryIndicator = new THREE.CylinderBufferGeometry(cm(0.5), cm(0.1), 10, 12);
		const materialIndicator = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			// matcap: texture,
			transparent: true,
			opacity: 0.5,
		});
		const indicator = new THREE.Mesh(geometryIndicator, materialIndicator);
		controller.indicator = indicator;
		indicator.geometry.rotateX(Math.PI / 2);
		indicator.position.set(0, 0, -5);
		// controller.add(indicator);
		//
	}

	addText(parent) {
		const loader = new THREE.FontLoader();
		loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
			this.font = font;
			const material = new THREE.MeshBasicMaterial({
				color: 0x33c5f6,
				transparent: true,
				opacity: 1,
				side: THREE.DoubleSide
			});
			this.fontMaterial = material;
			/*
			const shapes = font.generateShapes('0', 10);
			const geometry = new THREE.ShapeBufferGeometry(shapes);
			geometry.dynamic = true;
			geometry.computeBoundingBox();
			const x = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
			geometry.translate(x, 5, -80);
			// make shape ( N.B. edge view not visible )
			const text = new THREE.Mesh(geometry, material);
			// text.position.set(-10000, -10000, -10000);
			this.text = text;
			parent.add(text);
			*/
			/*
			// make line shape ( N.B. edge view remains visible )
			const matDark = new THREE.LineBasicMaterial({
				color: color,
				side: THREE.DoubleSide
			});
			const holeShapes = [];
			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				if (shape.holes && shape.holes.length > 0) {
					for (let j = 0; j < shape.holes.length; j++) {
						const hole = shape.holes[j];
						holeShapes.push(hole);
					}
				}
			}
			shapes.push.apply(shapes, holeShapes);
			const lineText = new THREE.Object3D();
			for (let i = 0; i < shapes.length; i++) {
				const shape = shapes[i];
				const points = shape.getPoints();
				const geometry = new THREE.BufferGeometry().setFromPoints(points);
				geometry.translate(xMid, 0, 0);
				const lineMesh = new THREE.Line(geometry, matDark);
				lineText.add(lineMesh);
			}
			parent.add(lineText);
			*/
		});
	}

	setText(message) {
		message = message || '1';
		if (this.text) {
			this.text.parent.remove(this.text);
			this.text.geometry.dispose();
		}
		const shapes = this.font.generateShapes(message, 5);
		const geometry = new THREE.ShapeBufferGeometry(shapes);
		// geometry.dynamic = true;
		geometry.computeBoundingBox();
		const x = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
		geometry.translate(x, 0, 0);
		// make shape ( N.B. edge view not visible )
		const text = new THREE.Mesh(geometry, this.fontMaterial);
		text.position.set(0, 0, -POINTER_RADIUS);
		this.text = text;
		this.pivot.add(text);
		/*
		const shapes = this.font.generateShapes(message, 10);
		const geometry = new THREE.ShapeBufferGeometry(shapes);
		geometry.computeBoundingBox();
		const x = -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
		const text = this.text;
		text.geometry.copy(geometry);
		text.geometry.translate(x, 0, 0);
		// text.geometry.position.needsUpdate = true;
		geometry.dispose();
		*/
	}

	findGamepad_(id) {
		let gamepad = this.gamepads[id];
		if (gamepad) {
			return gamepad;
		}
		const gamepads = navigator.getGamepads && navigator.getGamepads();
		if (!gamepads) {
			return undefined;
		}
		for (var i = 0, j = 0, l = gamepads.length; i < l; i++) {
			gamepad = gamepads[i];
			if (gamepad && (
					gamepad.id === 'Daydream Controller' ||
					gamepad.id === 'Gear VR Controller' || gamepad.id === 'Oculus Go Controller' ||
					gamepad.id === 'OpenVR Gamepad' || gamepad.id.startsWith('Oculus Touch') ||
					gamepad.id.startsWith('Spatial Controller')
				)) {
				if (j === id) {
					this.gamepads[id] = gamepad;
					return gamepad;
				}
				j++;
			}
		}
	}

	/*
	testController() {
		if (TEST_ENABLED) {
			if (this.controller) {
				this.controller.position.x = this.mouse.x * 50;
				this.controller.position.y = this.mouse.y * 50;
			}
			this.updateController();
		}
	}
	*/

}