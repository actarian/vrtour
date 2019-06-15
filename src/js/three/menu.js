/* jshint esversion: 6 */
/* global window, document */

import { cm, mm } from './const';
import EmittableGroup from './emittable.group';
import InteractiveMesh from './interactive.mesh';

export default class Menu extends EmittableGroup {

	constructor(parent) {
		super();
		const panel = this.panel = this.addPanel(this);
		const count = 15;
		const items = this.items = new Array(count).fill(null).map((x, i) => {
			const item = new MenuItem(panel, {}, i, count);
			item.on('over', () => {
				item.material.color.setHex(0xff0000);
				item.material.opacity = 1.0;
				item.material.needsUpdate = true;
			});
			item.on('out', () => {
				item.material.color.setHex(0xffffff);
				item.material.opacity = 1.0;
				item.material.needsUpdate = true;
			});
			return item;
		});
		// this.lookAt(ORIGIN);
		parent.add(this);
	}

	addPanel(parent) {
		const panel = new THREE.Group();
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/menu.png');
		const geometry = new THREE.PlaneGeometry(cm(10), cm(20), 1, 2);
		// geometry.rotateY(Math.PI);
		const material = new THREE.MeshBasicMaterial({
			// color: 0xffffff,
			map: texture,
			transparent: true,
			opacity: 0.8,
			// blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
		});
		const plane = new THREE.Mesh(geometry, material);
		plane.renderOrder = 90;
		// plane.position.set(0, 0, -20);
		plane.position.set(0, cm(3), -cm(17));
		plane.rotation.set(-Math.PI / 2, 0, 0);
		panel.add(plane);
		parent.add(panel);
		return panel;
	}

	next() {
		const r = Math.PI * 2 / 3;
		const z = Math.ceil(this.rotation.z / r) * r + r;
		TweenMax.to(this.rotation, 0.6, {
			z,
			onComplete: () => {}
		});
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

	constructor(parent, item, index, total) {
		const size = mm(25);
		const gutter = mm(8);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/menu-item.png');
		const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			// color: 0xffffff,
			map: texture,
			transparent: true,
			// opacity: 0.8,
			// blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide
		});
		super(geometry, material);
		this.item = item;
		this.index = index;
		this.renderOrder = 100;
		// this.rotation.set(0, -0.5, 0);
		// this.position.set(0, 0, 0);
		// this.lookAt(ORIGIN);
		const d = (size + gutter);
		const cols = 3;
		const rows = Math.ceil(total / cols);
		const sx = size / 2 - (cols * d - gutter) / 2;
		const sy = size / 2 - (rows * d - gutter) / 2;
		const r = Math.floor(index / cols);
		const c = index - r * cols;
		this.position.set(sx + d * c, sy + d * r, mm(4));
		parent.add(this);
	}

}
