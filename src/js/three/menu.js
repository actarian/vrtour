/* jshint esversion: 6 */
/* global window, document */

import { cm, mm } from './const';
import EmittableGroup from './emittable.group';
import InteractiveMesh from './interactive.mesh';

export default class Menu extends EmittableGroup {

	constructor(parent) {
		super();
		const panels = this.panels = [];
		const count = 15;
		const items = new Array(count).fill({});
		const panel = this.panel = new MenuPanel(this, items);
		this.position.set(0, 0, -cm(2));
		/*
		panel.items.forEach(x => {
			x.on('over', () => {
				x.material.color.setHex(0xff0000);
				x.material.opacity = 1.0;
				x.material.needsUpdate = true;
			});
			x.on('out', () => {
				x.material.color.setHex(0xffffff);
				x.material.opacity = 1.0;
				x.material.needsUpdate = true;
			});
		});
		*/
		// this.lookAt(ORIGIN);
		this.parent_ = parent;
		// parent.add(this);
	}

	toggle() {
		if (this.active) {
			this.exit();
		} else {
			this.enter();
		}
	}

	enter() {
		if (this.active) {
			return;
		}
		this.active = true;
		this.parent_.add(this);
		const opacity = (x, value) => {
			x.material.opacity = value;
			x.material.needsUpdate = true;
		};
		const from = { value: this.panel.plane.material.opacity };
		TweenMax.to(from, 0.7, {
			value: 1,
			ease: Expo.easeInOut,
			onUpdate: () => {
				this.position.z = -cm(2) * (1 - from.value);
				opacity(this.panel.plane, from.value * 0.8);
				this.panel.items.forEach(x => opacity(x, from.value));
			},
			onComplete: () => {}
		});
	}

	exit() {
		if (!this.active) {
			return;
		}
		this.active = false;
		const opacity = (x, value) => {
			x.material.opacity = value;
			x.material.needsUpdate = true;
		};
		const from = { value: this.panel.plane.material.opacity };
		TweenMax.to(from, 0.7, {
			value: 0,
			ease: Expo.easeInOut,
			onUpdate: () => {
				this.position.z = -cm(2) * (1 - from.value);
				opacity(this.panel.plane, from.value * 0.8);
				this.panel.items.forEach(x => opacity(x, from.value));
			},
			onComplete: () => {
				this.parent_.remove(this);
			}
		});
	}

	prev() {

	}

	next() {
		const r = Math.PI * 2 / 3;
		const z = Math.ceil(this.rotation.z / r) * r + r;
		TweenMax.to(this.rotation, 0.7, {
			z,
			ease: Expo.easeInOut,
			onComplete: () => {}
		});
	}

}

export class MenuPanel extends EmittableGroup {

	static getLoader() {
		return this.loader || (this.loader = new THREE.TextureLoader());
	}

	static getTexture() {
		return this.texture || (this.texture = this.getLoader().load('img/menu.png'));
	}

	constructor(parent, items) {
		super();
		const map = MenuPanel.getTexture();
		const geometry = new THREE.PlaneGeometry(cm(10), cm(20), 1, 2);
		// geometry.rotateY(Math.PI);
		const material = new THREE.MeshBasicMaterial({
			// color: 0xffffff,
			map: map,
			transparent: true,
			opacity: 0,
			// blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
		});
		const plane = new THREE.Mesh(geometry, material);
		plane.renderOrder = 90;
		// plane.position.set(0, 0, -20);
		plane.position.set(0, cm(3), -cm(17));
		plane.rotation.set(-Math.PI / 2, 0, 0);
		this.plane = plane;
		// this.addItems(plane, items);
		this.items = items.map((item, index) => new MenuItem(plane, item, index, items.length));
		this.add(plane);
		parent.add(this);
	}

}

export class MenuItem extends InteractiveMesh {

	static getTexture_(index) {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		canvas.width = canvas.height = 64;
		ctx.fillStyle = '#ffffff';
		/*
		ctx.textAlign = 'center';
		ctx.font = '30px sans';
		ctx.fillText(index ? '>' : '<', 32, 32);
		*/
		ctx.beginPath();
		ctx.moveTo(32 - 10, 32 - 10);
		ctx.lineTo(32 + 10, 32);
		ctx.lineTo(32 - 10, 32 - 10);
		ctx.fill();
		const texture = new THREE.CanvasTexture(canvas);
		// CanvasTexture( canvas : HTMLElement, mapping : Constant, wrapS : Constant, wrapT : Constant, magFilter : Constant, minFilter : Constant, format : Constant, type : Constant, anisotropy : Number )
		return texture;
	}

	static getLoader() {
		return this.loader || (this.loader = new THREE.TextureLoader());
	}

	static getTexture(item, index) {
		return this.texture || (this.texture = this.getLoader().load('img/menu-item.png'));
	}

	constructor(parent, item, index, total) {
		const size = mm(25);
		const gutter = mm(8);
		const map = MenuItem.getTexture(item, index);
		const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			// color: 0xffffff,
			map: map,
			transparent: true,
			opacity: 0,
			// blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide
		});
		super(geometry, material);
		this.item = item;
		this.index = index;
		this.renderOrder = 100;
		// this.rotation.set(0, -0.5, 0);
		// this.position.set(0, 0, 0);
		// this.lookAt(ORIGIN);
		const d = (size + gutter);
		const cols = 3;
		const rows = Math.ceil(total / cols);
		const sx = size / 2 - (cols * d - gutter) / 2;
		const sy = size / 2 - (rows * d - gutter) / 2;
		const r = Math.floor(index / cols);
		const c = index - r * cols;
		this.position.set(sx + d * c, sy + d * r, 0);
		// !!!
		const from = { value: 0 };
		this.on('over', () => {
			TweenMax.to(from, 0.7, {
				value: 1,
				ease: Expo.easeInOut,
				onUpdate: () => {
					this.position.z = mm(4) * (1 - from.value);
					this.material.opacity = from.value;
					this.material.needsUpdate = true;
				},
			});
		});
		this.on('out', () => {
			TweenMax.to(from, 0.7, {
				value: 0,
				ease: Expo.easeInOut,
				onUpdate: () => {
					this.position.z = mm(4) * (1 - from.value);
					this.material.opacity = from.value;
					this.material.needsUpdate = true;
				},
			});
		});
		parent.add(this);
	}

}
