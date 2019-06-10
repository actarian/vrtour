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

	constructor(geometry, material) {
		this.events = {};
		geometry = geometry || new THREE.SphereGeometry(1, 16, 16);
		material = material || new THREE.MeshBasicMaterial({
			color: 0x0000ff,
		});
		super(geometry, material);
	}

	get over() {
		return this.over_;
	}
	set over(intersection) {
		const object = intersection && intersection.object;
		if (this.over_ !== object) {
			this.over_ = object;
			this.emit('over', this);
		}
	}

	get down() {
		return this.down_;
	}
	set down(down) {
		const object = down && this.over;
		if (this.down_ !== object) {
			this.down_ = object;
			this.emit('down', this);
		}
	}

	addListener(type, callback) {
		const event = this.events[type] = this.events[type] || [];
		event.push(callback);
		return () => {
			this.events[type] = event.filter(x => x !== callback);
		}
	}

	removeListener(type, callback) {
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
