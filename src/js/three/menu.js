/* jshint esversion: 6 */
/* global window, document */

import { POINT_RADIUS } from './const';
import { InteractiveMesh } from './interactive.mesh';

const SIZE = 8;
const RADIUS = POINT_RADIUS - 0.1;
const ARC = SIZE / RADIUS;
const PY = 50;
const RY = Math.PI - 0.5;
const FROM = 0;
const TO = 1;

export class Menu {

	constructor(parent) {
		this.parent = parent;
		this.py = PY;
		this.ry = RY;
		const mesh = this.mesh = this.addMesh(parent);
	}

	addMesh(parent) {
		const mesh = new THREE.Group();
		mesh.position.set(0, PY, 0);
		const arc = this.arc = this.addArc(mesh);
		this.items = [
			new MenuItem(mesh, 0),
			new MenuItem(mesh, 1)
		];
		this.items.forEach((x, index) => {
			x.on('over', () => {
				x.material.color.setHex(0xffcc00);
				x.material.needsUpdate = true;
			});
			x.on('out', () => {
				x.material.color.setHex(0x111111);
				x.material.needsUpdate = true;
			});
			x.on('down', () => {
				const direction = index === 1 ? 1 : -1;
				const y = this.parent.rotation.y + Math.PI / 2 * direction;
				TweenMax.to(this.parent.rotation, 0.6, { y });
			});
		});
		this.materials = this.items.map(x => x.material);
		this.materials.unshift(arc.material);
		parent.add(mesh);
		return mesh;
	}

	addArc(parent) {
		const geometry = new THREE.CylinderGeometry(POINT_RADIUS, POINT_RADIUS, 8, 32, 1, true, FROM, TO);
		geometry.scale(-1, 1, 1);
		// geometry.rotateY(Math.PI);
		const material = new THREE.MeshBasicMaterial({
			color: 0x161616,
			transparent: true,
			opacity: 0,
		});
		const arc = new THREE.Mesh(geometry, material);
		// arc.renderOrder = 100;
		// arc.position.set(0, 20, 0);
		// arc.lookAt(this.origin);
		parent.add(arc);
		return arc;
	}

	update(cameraDirection) {
		const y = Math.atan2(cameraDirection.x, cameraDirection.z) - this.parent.rotation.y + Math.PI - this.ry;
		this.mesh.rotation.set(0, y, 0);
	}

	get active() {
		return this.active_;
	}
	set active(active) {
		if (this.active_ !== active) {
			this.active_ = active;
			const mesh = this.mesh;
			const materials = this.materials;
			// console.log(materials);
			const from = { value: materials[0].opacity };
			TweenMax.to(from, 0.3, {
				value: active ? 1 : 0,
				onUpdate: () => {
					mesh.position.y = this.py - 30 * from.value;
					materials.forEach(x => {
						x.opacity = from.value;
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

	constructor(parent, index) {
		const texture = MenuItem.getTexture(index);
		const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, SIZE, 1, 1, true, index ? 1 - ARC : 0, ARC);
		geometry.scale(-1, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0x363636,
			map: texture,
			transparent: true,
			opacity: 0,
		});
		super(geometry, material);
		// this.renderOrder = 100;
		// this.rotation.set(0, -0.5, 0);
		// this.position.set(0, 0, 0);
		// this.lookAt(this.origin);
		parent.add(this);
	}

}
