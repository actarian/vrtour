/* jshint esversion: 6 */
/* global window, document */

import EmittableMesh from './emittable.mesh';

export default class InteractiveMesh extends EmittableMesh {

	static hittest(raycaster, down) {
		const intersections = raycaster.intersectObjects(InteractiveMesh.items);
		InteractiveMesh.items.forEach(x => {
			const intersection = intersections.find(i => i.object === x);
			x.intersection = intersection;
			x.over = intersection !== undefined;
			x.down = down;
		});
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
