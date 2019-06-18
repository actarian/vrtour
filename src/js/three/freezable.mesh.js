/* jshint esversion: 6 */
/* global window, document */

export default class FreezableMesh extends THREE.Mesh {

	constructor(geometry, material) {
		geometry = geometry || new THREE.BoxGeometry(5, 5, 5);
		material = material || new THREE.MeshBasicMaterial({
			color: 0xff00ff,
			// opacity: 1,
			// transparent: true,
		});
		super(geometry, material);
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
