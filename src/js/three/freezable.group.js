/* jshint esversion: 6 */
/* global window, document */

export default class FreezableMesh extends THREE.Group {

	constructor() {
		super();
		this.freezed = false;
	}

	freeze() {
		if (!this.freezed) {
			this.freezed = true;
			this.children.filter(x => x instanceof FreezableMesh).forEach(x => x.freeze());
		}
	}

	unfreeze() {
		if (this.freezed) {
			this.freezed = false;
			this.children.filter(x => x instanceof FreezableMesh).forEach(x => x.unfreeze());
		}
	}

}
