/* jshint esversion: 6 */
/* global window, document */

import EmittableMesh from './emittable.mesh';

export default class InteractiveMesh extends EmittableMesh {

	static hittest(raycaster, down) {
		const intersections = raycaster.intersectObjects(InteractiveMesh.items);
		let key, hit = false;
		const hash = {};
		intersections.forEach((intersection, i) => {
			key = intersection.object.id;
			if (i === 0 && InteractiveMesh.lastKey != key) {
				InteractiveMesh.lastKey = key;
				hit = true;
				// haptic feedback
			}
			hash[key] = intersection;
		});
		InteractiveMesh.items.forEach(x => {
			const intersection = hash[x.id]; // intersections.find(i => i.object === x);
			x.intersection = intersection;
			x.over = intersection !== undefined;
			x.down = down;
		});
		return hit;
	}

	constructor(geometry, material) {
		super(geometry, material);
		// this.renderOrder = 10;
		InteractiveMesh.items.push(this);
	}

	get over() {
		return this.over_;
	}
	set over(over) {
		if (over) {
			this.emit('hit', this);
		}
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

}

InteractiveMesh.items = [];
