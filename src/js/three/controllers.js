/* jshint esversion: 6 */
/* global window, document */

import { cm, mm, POINTER_RADIUS, TEST_ENABLED } from './const';
import Emittable from './emittable';
import Menu from './menu';

const GAMEPAD = {
	LEFT: 1,
	RIGHT: 0,
};

export default class Controllers extends Emittable {

	constructor(renderer, scene, pivot) {
		super();
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
			const group = new THREE.Group();
			const menu = this.menu = new Menu(group);
			menu.on('down', (event) => {
				this.onMenuDown(event);
			});
			group.rotation.set(Math.PI / 2, 0, 0);
			group.position.set(0, 0, -2);
			group.scale.set(5, 5, 5);
			pivot.add(group);
		} else {
			const left = this.left = this.addController(renderer, scene, GAMEPAD.LEFT);
			const right = this.right = this.addController(renderer, scene, GAMEPAD.RIGHT);
			const menu = this.menu = new Menu(left || right);
			menu.on('down', (event) => {
				this.onMenuDown(event);
			});
		}
		const text = this.text = this.addText(pivot);
	}

	onMenuDown(event) {
		const item = event.item;
		const index = event.index;
		console.log('Controllers.onMenuDown', item, index);
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

	hapticFeedback() {
		const gamepad = this.findGamepad_(this.controller.index);
		if (gamepad) {
			// console.log('start');
			/*
			if (Tone.context.state === 'running') {
				const feedback = this.feedback = (this.feedback || new Tone.Player('audio/feedback.mp3').toMaster());
				feedback.start();
			}
			*/
			return; // !!! care for battery
			const actuators = gamepad.hapticActuators;
			if (actuators && actuators.length) {
				return actuators[0].pulse(0.1, 50);
			} else {
				return Promise.reject();
			}
		}
	}

	update() {
		const gamePadLeft = this.findGamepad_(GAMEPAD.LEFT);
		if (gamePadLeft) {
			const triggerLeft = gamePadLeft ? gamePadLeft.buttons.reduce((p, b, i) => b.pressed ? i : p, -1) : -1;
			if (triggerLeft !== -1) {
				this.onLeftSelectStart(triggerLeft, gamePadLeft);
			} else {
				this.onLeftSelectEnd();
			}
		}
		const gamePadRight = this.findGamepad_(GAMEPAD.RIGHT);
		if (gamePadRight) {
			const triggerRight = gamePadRight ? gamePadRight.buttons.reduce((p, b, i) => b.pressed ? i : p, -1) : -1;
			if (triggerRight !== -1) {
				this.onRightSelectStart(triggerRight, gamePadRight);
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

	onLeftSelectStart(id, gamepad) {
		try {
			if (this.left.button !== id) {
				this.left.button = id;
				// 0 trigger, 1 front, 2 side, 3 Y, 4 X
				switch (id) {
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
				this.setText((gamepad ? gamepad.id : '') + ' ' + String(id));
				this.isControllerSelecting = true;
				this.isControllerSelectionDirty = true;
			}
			if (this.controller !== this.left) {
				if (this.controller) {
					this.controller.remove(this.controller.indicator);
				}
				this.controller = this.left;
				this.controller.add(this.controller.indicator);
			}
		} catch (error) {
			this.emit('error', error);
		}
	}

	onLeftSelectEnd() {
		try {
			this.left.button = undefined;
			if (this.controller === this.left) {
				this.isControllerSelecting = false;
				this.isControllerSelectionDirty = false;
			}
		} catch (error) {
			this.emit('error', error);
		}
	}

	onRightSelectStart(id, gamepad) {
		try {
			if (this.right.button !== id) {
				this.right.button = id;
				// 1 front, 2 side, 3 A, 4 B, 5?
				this.setText((gamepad ? gamepad.id : '') + ' ' + String(id));
				this.isControllerSelecting = true;
				this.isControllerSelectionDirty = true;
			}
			if (this.controller !== this.right) {
				if (this.controller) {
					this.controller.remove(this.controller.indicator);
				}
				this.controller = this.right;
				this.controller.add(this.controller.indicator);
			}
		} catch (error) {
			this.emit('error', error);
		}
	}

	onRightSelectEnd() {
		try {
			this.right.button = undefined;
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
		controller.index = 0;
		const cylinder = controller.cylinder = this.addControllerModel(controller, GAMEPAD.RIGHT);
		controller.scale.set(5, 5, 5);
		scene.add(controller);
		return controller;
	}

	addController(renderer, scene, index) {
		const controller = renderer.vr.getController(index);
		if (controller) {
			controller.index = index;
			const cylinder = controller.cylinder = this.addControllerModel(controller, index);
			scene.add(controller);
		}
		return controller;
	}

	addControllerModel(controller, index) {
		const mesh = new THREE.Group();
		const texture = new THREE.TextureLoader().load('img/matcap.jpg');
		const material = new THREE.MeshMatcapMaterial({
			color: index === GAMEPAD.RIGHT ? 0x991111 : 0x111199,
			matcap: texture,
			transparent: true,
			opacity: 1,
		});
		const loader = new THREE.OBJLoader();
		loader.load(
			index === GAMEPAD.RIGHT ?
			'models/oculus_quest_controller_right/oculus_quest_controller_right.obj' :
			'models/oculus_quest_controller_left/oculus_quest_controller_left.obj',
			(object) => {
				const x = index === GAMEPAD.RIGHT ? -cm(1) : cm(1);
				object.traverse((child) => {
					// console.log(child);
					if (child instanceof THREE.Mesh) {
						child.material = material;
						child.geometry.translate(x, 0, 0);
					}
				});
				mesh.add(object);
			},
			(xhr) => {
				// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
			},
			(error) => {
				console.log('An error happened');
			}
		);
		this.addControllerIndicator(controller);
		controller.add(mesh);
		return mesh;
	}

	addControllerCylinder(controller, index) {
		const geometry = new THREE.CylinderBufferGeometry(cm(2), cm(2), cm(12), 24);
		const texture = new THREE.TextureLoader().load('img/matcap.jpg');
		const material = new THREE.MeshMatcapMaterial({
			color: index === 1 ? 0x991111 : 0x111199,
			matcap: texture,
			transparent: true,
			opacity: 1,
		});
		/*
		const material = new THREE.MeshBasicMaterial({
			color: i === 0 ? 0x111199 : 0x991111,
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
		this.addControllerIndicator(controller);
		//
		return mesh;
	}

	addControllerIndicator(controller) {
		const geometryIndicator = new THREE.CylinderBufferGeometry(mm(2), mm(1), cm(30), 5); // 10, 12
		const materialIndicator = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			// matcap: texture,
			transparent: true,
			opacity: 0.5,
		});
		const indicator = new THREE.Mesh(geometryIndicator, materialIndicator);
		controller.indicator = indicator;
		indicator.geometry.rotateX(Math.PI / 2);
		indicator.position.set(0, 0, -cm(18.5));
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
		// !!! fix
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

	/*
	// axes
	function gameLoop() {
		if(navigator.webkitGetGamepads) {
			var gp = navigator.webkitGetGamepads()[0];
		} else {
			var gp = navigator.getGamepads()[0];
		}

		if(gp.axes[0] != 0) {
			b -= gp.axes[0];
		} else if(gp.axes[1] != 0) {
			a += gp.axes[1];
		} else if(gp.axes[2] != 0) {
			b += gp.axes[2];
		} else if(gp.axes[3] != 0) {
			a -= gp.axes[3];
		}

		ball.style.left = a*2 + "px";
		ball.style.top = b*2 + "px";

		var start = rAF(gameLoop);
	};
	*/
}
