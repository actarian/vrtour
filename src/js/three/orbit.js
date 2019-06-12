/* jshint esversion: 6 */
/* global window, document */

import DragListener from '../shared/drag.listener';

export default class Orbit {

	constructor() {
		this.longitude = 0;
		this.latitude = 0;
		this.direction = 1;
		this.speed = 1;
		this.inertia = new THREE.Vector3();
	}

	setOrientation(orientation) {
		if (orientation) {
			this.longitude = orientation.longitude;
			this.latitude = orientation.latitude;
		}
	}

	getOrientation() {
		return {
			latitude: this.latitude,
			longitude: this.longitude,
		};
	}

	setDragListener(container) {
		let longitude, latitude;
		const dragListener = new DragListener(this.container, (event) => {
			longitude = this.longitude;
			latitude = this.latitude;
		}, (event) => {
			this.longitude = -event.distance.x * 0.1 + longitude;
			this.latitude = event.distance.y * 0.1 + latitude;
			this.direction = event.distance.x ? (event.distance.x / Math.abs(event.distance.x) * -1) : 1;
			// console.log('longitude', this.longitude, 'latitude', this.latitude, 'direction', this.direction);
		}, (event) => {
			this.speed = Math.abs(event.strength.x) * 100;
			// console.log('speed', this.speed);
		});
		dragListener.move = () => {};
		this.dragListener = dragListener;
		return dragListener;
	}

	update() {
		const direction = this.direction;
		const inertia = this.inertia;
		let speed = this.speed;
		let latitude = this.latitude;
		let longitude = this.longitude;
		if (this.dragListener && this.dragListener.dragging === false) {
			// longitude += 0.01 * direction * speed;
			speed = Math.max(1, speed * 0.98);
			inertia.multiplyScalar(0.98);
		}
		latitude = Math.max(-85, Math.min(85, latitude));
		const phi = THREE.Math.degToRad(90 - latitude);
		const theta = THREE.Math.degToRad(longitude);
		this.phi = phi;
		this.theta = theta;
		this.latitude = latitude;
		this.longitude = longitude;
		this.speed = speed;
		this.inertia = inertia;
	}

}
