/* jshint esversion: 6 */
/* global window, document */

import { POINT_RADIUS } from './const';

const SIZE = 8;
const RADIUS = POINT_RADIUS - 0.1;
const ARC = SIZE / RADIUS;
const PY = 50;
const RY = Math.PI - 0.5;
const FROM = 0;
const TO = 1;

export class InteractiveMesh extends THREE.Mesh {

	static items = [];

	static hittest(raycaster, down) {
		const intersections = raycaster.intersectObjects(InteractiveMesh.items);
		const intersection = intersections.length ? intersections[0] : null;
		const object = intersection && intersection.object;
		InteractiveMesh.items.forEach(x => {
			x.intersection = intersection;
			x.over = x === object;
			x.down = down;
		});
	}

	constructor(geometry, material) {
		geometry = geometry || new THREE.BoxGeometry(5, 5, 5);
		material = material || new THREE.MeshBasicMaterial({
			color: 0xff00ff,
			// opacity: 1,
			// transparent: true,
		});
		super(geometry, material);
		// this.renderOrder = 10;
		this.events = {};
		InteractiveMesh.items.push(this);
	}

	get over() {
		return this.over_;
	}
	set over(over) {
		if (this.over_ !== over) {
			this.over_ = over;
			if (over) {
				this.emit('over', this);
			} else {
				this.emit('out', this);
			}
		}
	}

	get down() {
		return this.down_;
	}
	set down(down) {
		down = down && this.over;
		if (this.down_ !== down) {
			this.down_ = down;
			if (down) {
				this.emit('down', this);
			} else {
				this.emit('up', this);
			}
		}
	}

	on(type, callback) {
		const event = this.events[type] = this.events[type] || [];
		event.push(callback);
		return () => {
			this.events[type] = event.filter(x => x !== callback);
		}
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

	/*
	setRaycaster(raycaster, selecting) {
		this.raycaster = raycaster;
		this.selecting = selecting;
		const intersections = raycaster.intersectObjects(this);
		const intersection = intersections.length ? intersections[0] : null;
		this.over = intersection;
		this.down = intersection;
	}

	update(cameraDirection) {
		const y = Math.atan2(cameraDirection.x, cameraDirection.z) - this.parent.rotation.y + Math.PI - this.ry;
		this.mesh.rotation.set(0, y, 0);
	}
	*/

}
