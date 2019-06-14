/* jshint esversion: 6 */
/* global window, document */

import { ORIGIN, POINT_RADIUS } from './const';
import EmittableGroup from './emittable.group';
import InteractiveMesh from './interactive.mesh';

const SIZE = 8;
const RADIUS = POINT_RADIUS - 0.1;
const ARC = SIZE / RADIUS;
const PY = 50;
const RY = Math.PI - 0.5;
const FROM = 0;
const TO = 1;

export default class Menu extends EmittableGroup {

	constructor(parent) {
		super();
		const panel = this.panel = this.addPanel(this);
		const count = 12;
		const items = this.items = new Array(count).fill(null).map((x, i) => {
			const item = new MenuItem(panel, {}, i, count);
			item.on('over', () => {
				item.material.color.setHex(0xff0000);
				item.material.opacity = 0.1;
				item.material.needsUpdate = true;
			});
			item.on('out', () => {
				item.material.color.setHex(0xffffff);
				item.material.opacity = 1.0;
				item.material.needsUpdate = true;
			});
			return item;
		});
		this.lookAt(ORIGIN);
		parent.add(this);
	}

	addPanel(parent) {
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/menu.png');
		const geometry = new THREE.PlaneGeometry(10, 20, 1, 2);
		// geometry.rotateY(Math.PI);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: texture,
			transparent: true,
			opacity: 0.8,
			// side: THREE.DoubleSide
		});
		const plane = new THREE.Mesh(geometry, material);
		plane.renderOrder = 1;
		plane.position.set(0, 0, -20);
		parent.add(plane);
		return plane;
	}

	temp() {
		this.py = PY;
		this.ry = RY;
		const arc = this.arc = this.addArc(this);
		this.items = [
			new MenuItem(this, 0),
			new MenuItem(this, 1)
		];
		this.items.forEach((x, index) => {
			x.on('over', () => {
				x.material.color.setHex(0xffffff);
				x.material.opacity = 0.8;
				x.material.needsUpdate = true;
			});
			x.on('out', () => {
				x.material.color.setHex(0xffffff);
				x.material.opacity = 0.5;
				x.material.needsUpdate = true;
			});
			x.on('down', () => {
				x.material.color.setHex(0x33c5f5);
				x.material.opacity = 1;
				x.material.needsUpdate = true;
				const direction = index === 1 ? 1 : -1;
				const y = this.parent.rotation.y + Math.PI / 2 * direction;
				// this.parent.ery = y;
				this.parent.busy = true;
				TweenMax.to(this.parent.rotation, 0.6, {
					y,
					onComplete: () => {
						this.parent.busy = false;
					}
				});
			});
		});
		this.materials = this.items.map(x => x.material);
		this.materials.unshift(arc.material);
	}

	addArc(parent) {
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/menu.png');
		const geometry = new THREE.CylinderGeometry(POINT_RADIUS, POINT_RADIUS, 8, 32, 1, true, FROM, TO);
		geometry.scale(-1, 1, 1);
		// geometry.rotateY(Math.PI);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: texture,
			transparent: true,
			opacity: 0,
		});
		const arc = new THREE.Mesh(geometry, material);
		// arc.renderOrder = 100;
		// arc.position.set(0, 20, 0);
		// arc.lookAt(ORIGIN);
		parent.add(arc);
		return arc;
	}

	update(cameraDirection) {
		const y = Math.atan2(cameraDirection.x, cameraDirection.z) - this.parent.rotation.y + Math.PI - this.ry;
		this.rotation.set(0, y, 0);
	}

	get active() {
		return this.active_;
	}
	set active(active) {
		if (this.active_ !== active) {
			this.active_ = active;
			const materials = this.materials;
			// console.log(materials);
			const from = { value: materials[0].opacity };
			TweenMax.to(from, 0.3, {
				value: active ? 1 : 0,
				onUpdate: () => {
					this.position.y = this.py - 30 * from.value;
					materials.forEach((x, i) => {
						x.opacity = i === 0 ? from.value * 0.8 : from.value * 0.5;
						x.needsUpdate = true;
					});
				}
			});
		}
	}
}

export class MenuItem extends InteractiveMesh {

	static getTexture(index) {
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

	constructor(parent, item, index, total) {
		const size = 2;
		const gutter = 0.2;
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/menu-item.png');
		const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			map: texture,
			transparent: true,
			opacity: 0.8,
			// side: THREE.DoubleSide
		});
		super(geometry, material);
		this.item = item;
		this.index = index;
		// this.renderOrder = 100;
		// this.rotation.set(0, -0.5, 0);
		// this.position.set(0, 0, 0);
		// this.lookAt(ORIGIN);
		const d = (size + gutter);
		const cols = 3;
		const rows = Math.ceil(total / cols);
		const sx = -cols * d / 2;
		const sy = -rows * d / 2;
		const r = Math.floor(index / cols);
		const c = index - r * cols;
		this.position.set(sx + d * c, sy + d * r, 1);
		parent.add(this);
	}

}
