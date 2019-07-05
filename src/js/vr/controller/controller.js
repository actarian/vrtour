/* jshint esversion: 6 */
/* global window, document */

import { cm, mm } from '../../const';
import { GAMEPAD_HANDS } from '../gamepads';

export default class Controller extends THREE.Group {

	get active() {
		return this.active_;
	}

	set active(active) {
		if (this.active_ !== active) {
			this.active_ = active;
			if (active) {
				this.add(this.ray);
			} else {
				this.remove(this.ray);
			}
		}
	}

	constructor(parent, hand) {
		super();
		this.ready = false;
		this.buttons = [];
		this.tween = { value: 0 };
		this.parent = parent;
		this.hand = hand;
		const model = this.model = this.addModel(hand);
		const ray = this.ray = this.addRay(hand);
		this.add(model);
		parent.add(this);
	}

	addModel(hand) {
		const geometry = new THREE.CylinderBufferGeometry(cm(2), cm(2), cm(12), 24);
		geometry.rotateX(Math.PI / 2);
		const texture = new THREE.TextureLoader().load('img/matcap.jpg');
		const material = new THREE.MeshMatcapMaterial({
			color: this.hand === GAMEPAD_HANDS.RIGHT ? 0x991111 : 0x111199,
			matcap: texture,
			// transparent: true,
			// opacity: 1,
		});
		const mesh = new THREE.Mesh(geometry, material);
		this.ready = true;
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
		mesh.position.set(0, 0, -cm(18.5));
		return mesh;
	}

	update(tick) {

	}

	press(index) {
		TweenMax.to(this.tween, 0.4, {
			value: 1,
			ease: Power2.easeOut,
			onUpdate: () => {
				if (typeof this.buttons[index] === 'function') {
					this.buttons[index](this.tween.value);
				}
			}
		});
	}

	release(index) {
		TweenMax.to(this.tween, 0.4, {
			value: 0,
			ease: Power2.easeOut,
			onUpdate: () => {
				if (typeof this.buttons[index] === 'function') {
					this.buttons[index](this.tween.value);
				}
			}
		});
	}

	move(axis) {

	}

	static getCos(tick, i = 0) {
		return Math.cos(i + tick * 0.1);
	}

	static mixColor(color, a, b, value) {
		return color.setRGB(
			a.r + (b.r - a.r) * value,
			a.g + (b.g - a.g) * value,
			a.b + (b.b - a.b) * value
		);
	}
}
