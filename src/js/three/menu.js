/* jshint esversion: 6 */
/* global window, document */

import EventEmitter from '../shared/event-emitter';
import { POINT_RADIUS } from './const';

const SIZE = 8;
const RADIUS = POINT_RADIUS - 0.1;
const ARC = SIZE / RADIUS;
const PY = 50;
const RY = Math.PI - 0.5;
const FROM = 0;
const TO = 1;

export class Menu extends EventEmitter {

	constructor(parent, onError) {
		super();
		this.parent = parent;
		if (onError) {
			// console.log(onError);
			this.addListener('error', onError);
		}
		this.py = PY;
		this.ry = RY;
		const mesh = this.mesh = this.addMesh(parent);
	}

	addMesh(parent) {
		const mesh = new THREE.Group();
		mesh.position.set(0, PY, 0);
		const arc = this.arc = this.addArc(mesh);
		this.items = [new MenuItem(mesh, 0), new MenuItem(mesh, 1)];
		this.meshes = this.items.map(x => x.mesh);
		this.materials = this.meshes.map(x => x.material);
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

	setRaycaster(raycaster, selecting) {
		this.raycaster = raycaster;
		this.selecting = selecting;
		// raycaster.params.Points.threshold = 10.0;
		const intersections = raycaster.intersectObjects(this.meshes);
		// console.log(intersections);
		const intersection = intersections.length ? intersections[0] : null;
		this.hovered = intersection;
		this.selected = intersection;
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

	get hovered() {
		return this.hovered_;
	}
	set hovered(intersection) {
		const object = intersection && intersection.object;
		if (this.hovered_ !== object) {
			this.hovered_ = object;
			this.meshes.forEach(x => {
				x.material.color.setHex(x === object ? 0xffcc00 : 0x111111);
				x.material.needsUpdate = true;
			});
		}
	}

	get selected() {
		return this.selected_;
	}
	set selected(intersection) {
		const object = intersection && this.selecting ? intersection.object : null;
		if (this.selected_ !== object) {
			this.selected_ = object;
			const index = this.meshes.reduce((p, x, i) => x === object ? i : p, -1);
			this.emit('selectItem', index);
			if (index !== -1) {
				const direction = index === 1 ? 1 : -1;
				const y = this.parent.rotation.y + Math.PI / 2 * direction;
				TweenMax.to(this.parent.rotation, 0.6, { y });
			}
			/*
			if (object !== null) {
				// console.log(object.geometry);
				// const selected = intersection.selected;
				const direction = intersection.faceIndex > object.geometry.faces.length / 2 ? 1 : -1;
				const y = this.parent.rotation.y + Math.PI / 2 * direction;
				TweenMax.to(this.parent.rotation, 0.6, { y });
				// console.log(object, direction, y);
				// latitude
			}
			*/
		}
	}

}

export class MenuItem extends EventEmitter {

	constructor(parent, index, onError) {
		super();
		if (onError) {
			// console.log(onError);
			this.addListener('error', onError);
		}
		const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, SIZE, 1, 1, true, index ? 1 - ARC : 0, ARC);
		geometry.scale(-1, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0x363636,
			transparent: true,
			opacity: 0,
		});
		const mesh = new THREE.Mesh(geometry, material);
		// mesh.renderOrder = 100;
		// mesh.rotation.set(0, -0.5, 0);
		// mesh.position.set(0, 0, 0);
		// mesh.lookAt(this.origin);
		parent.add(mesh);
		this.mesh = mesh;
	}

}
