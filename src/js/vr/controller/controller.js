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
		this.buttons = new Array(10).fill({ value: 0 });
		this.axis = new Array(2).fill(new THREE.Vector2());
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
		const geometry = new THREE.CylinderBufferGeometry(mm(1), mm(0.5), cm(30), 5); // 10, 12
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
		TweenMax.to(this.buttons[index], 0.3, {
			value: 1,
			ease: Power2.easeOut,
			/*
			onUpdate: () => {
				if (typeof this.buttons[index] === 'function') {
					this.buttons[index](this.tween.value);
				}
			}
			*/
		});
	}

	release(index) {
		TweenMax.to(this.buttons[index], 0.3, {
			value: 0,
			ease: Power2.easeOut,
			/*
			onUpdate: () => {
				if (typeof this.buttons[index] === 'function') {
					this.buttons[index](this.tween.value);
				}
			}
			*/
		});
	}

	move(axis) {
		this.axis[axis.index] = axis;
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

	static mixUniformColor(uniform, a, b, value) {
		uniform.value.r = a.r + (b.r - a.r) * value;
		uniform.value.g = a.g + (b.g - a.g) * value;
		uniform.value.b = a.b + (b.b - a.b) * value;
	}
}
