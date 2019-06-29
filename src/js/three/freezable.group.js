/* jshint esversion: 6 */
/* global window, document */

export default class FreezableGroup extends THREE.Group {

	get freezed() {
		return this.freezed_;
	}

	set freezed(freezed) {
		if (this.freezed_ !== freezed) {
			this.freezed_ = freezed;
			this.children.filter(x => x.hasOwnProperty('freezed')).forEach(x => x.freezed = freezed);
		}
	}

	constructor() {
		super();
		this.freezed = false;
	}

	freeze() {
		this.freezed = true;
	}

	unfreeze() {
		this.freezed = false;
	}

}
