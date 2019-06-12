/* jshint esversion: 6 */
/* global window, document */

import { PANEL_RADIUS, POINT_RADIUS, ROOM_RADIUS, TEST_ENABLED } from './const';
import EmittableGroup from './emittable.group';

export default class Views extends EmittableGroup {

	constructor(parent) {
		super();
		this.views_ = [];
		this.origin = new THREE.Vector3();
		const room = this.room = this.addRoom(this);
		const floor = this.floor = this.addFloor(this);
		const ceil = this.ceil = this.addCeil(this);
		const points = this.points = this.addPoints(this);
		const panel = this.panel = this.addPanel(this);
		parent.add(this);
	}

	get views() {
		return this.views_;
	}
	set views(views) {
		this.views_ = views;
		this.index = 0;
	}

	get view() {
		return this.view_;
	}
	set view(view) {
		this.onInitView(this.view_, view);
		this.view_ = view;
	}

	get index() {
		return this.index_;
	}
	set index(index) {
		this.index_ = index;
		this.view = this.views[index];
	}

	// !!!

	get over() {
		return this.over_;
	}
	set over(intersection) {
		const object = intersection ? intersection.object : null;
		if (this.over_ !== object) {
			this.over_ = object;
			if (object !== null) {
				this.onEnterPanel(object.position.clone());
			} else {
				this.onExitPanel();
			}
			const tweens = this.points.children.map((x, index) => {
				const from = { scale: x.scale.x };
				return TweenMax.to(from, 0.25, {
					scale: x === object ? 3 : 1,
					delay: 0,
					onUpdate: () => {
						x.scale.set(from.scale, from.scale, from.scale);
					},
					onCompleted: () => {
						// console.log(index, 'completed');
					}
				});
			});
		}
	}

	get down() {
		return this.down_;
	}
	set down(intersection) {
		const object = intersection && this.controllers.isControllerSelecting ? intersection.object : null;
		if (this.down_ !== object) {
			this.down_ = object;
			if (object !== null) {
				const position = object.position;
				// const debugInfo = `down => {${position.x}, ${position.y}, ${position.z}}`;
				// this.debugInfo.innerHTML = debugInfo;
				// console.log(this.views.length);
				// this.pivot.index = (this.pivot.index + 1) % this.pivot.views.length;
				// console.log(index, point, debugInfo);
			}
		}
	}

	hittest(raycaster) {
		let point;
		// raycaster.params.Points.threshold = 10.0;
		const intersections = raycaster.intersectObjects(this.points.children);
		const intersection = intersections.length ? intersections[0] : null;
		this.over = intersection;
		this.down = intersection;
	}

	// !!!

	onInitView(previous, current) {
		// console.log(previous, current);
		this.onExitPanel();
		this.onExitPoints(previous).then(() => {
			// console.log(this.points.vertices);
			this.onExitView(previous).then(() => {
				// if (!previous) {
				this.onEnterView(current).then(() => {
					this.onEnterPoints(current);
					// console.log(this.points.vertices);
				});
				// }
			});
		});
	}

	onExitView(view) {
		return new Promise((resolve, reject) => {
			if (view) {
				TweenMax.to(this.room.sphere.material, 0.4, {
					opacity: 0,
					delay: 0.0,
					onCompleted: () => {
						setTimeout(() => {
							resolve(view);
						}, 250);
					}
				});
			} else {
				resolve(view);
			}
		});
	}

	onEnterView(view) {
		return new Promise((resolve, reject) => {
			if (view) {
				setTimeout(() => {
					// const tourTextureSrc = container.getAttribute('texture');
					const loader = new THREE.TextureLoader();
					loader.crossOrigin = '';
					loader.load(view.image, (texture) => {
						/*
						// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
						// texture.repeat.set(2, 2);
						this.tourTexture = texture;
						this.createScene();
						*/
						/*
						if (this.room.sphere.material.map) {
							this.room.sphere.material.map.dispose();
						}
						*/
						const material = this.room.sphere.material;
						material.opacity = 0;
						material.color.setHex(0xffffff);
						// texture.minFilter = THREE.NearestMipMapNearestFilter;
						// texture.magFilter = THREE.LinearMipMapLinearFilter;
						material.map = texture;
						material.map.needsUpdate = true;
						material.needsUpdate = true;
						TweenMax.to(material, 0.6, {
							opacity: TEST_ENABLED ? 0.5 : 1,
							delay: 0.1,
							onCompleted: () => {
								resolve(view);
							}
						});
						this.emit('onEnterView', view);
					});
				}, 100);
			} else {
				reject(view);
			}
		});
	}

	onEnterPoints(view) {
		view.points.forEach((point, i) => this.addPoint(this.points, new THREE.Vector3(...point.position), i));
	}

	onExitPoints(view) {
		if (view) {
			return Promise.all(view.points.map((point, i) => this.removePoint(i)));
		} else {
			return Promise.resolve();
		}
	}

	onEnterPanel(point) {
		this.getPanelInfoById('#panel').then(info => {
			if (info) {
				const panel = this.panel;
				panel.material.map = info.map;
				panel.material.opacity = 0;
				// panel.material.alphaMap = info.alphaMap;
				panel.material.needsUpdate = true;
				// const scale = info.width / 256;
				// panel.geometry.scale(scale, scale, scale);
				// panel.geometry.verticesNeedUpdate = true;
				const position = point.normalize().multiplyScalar(PANEL_RADIUS);
				panel.position.set(position.x, position.y + 30 + 30, position.z);
				panel.lookAt(this.origin);
				this.add(panel);
				const from = { value: 1 };
				TweenMax.to(from, 0.2, {
					value: 0,
					delay: 0.2,
					onUpdate: () => {
						panel.position.set(position.x, position.y + 30 + 30 * from.value, position.z);
						panel.lookAt(this.origin);
						panel.material.opacity = 1 - from.value;
						panel.material.needsUpdate = true;
					}
				});
				// console.log('getPanelInfoById', panel.position);
			}
		});
	}

	onExitPanel() {
		const panel = this.panel;
		if (panel && panel.parent) {
			panel.parent.remove(panel);
		}
	}

	//

	addRoom(parent) {
		const group = new THREE.Group();
		const geometry = new THREE.SphereBufferGeometry(ROOM_RADIUS, 72, 72);
		// const geometry = new THREE.IcosahedronBufferGeometry(ROOM_RADIUS, 4);
		// console.log(geometry);
		// invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0x000000,
			depthTest: false,
			transparent: true,
			opacity: 0.0,
			// wireframe: true
		});
		/*
		const material = new THREE.MeshStandardMaterial({
			color: '#fefefe',
			roughness: 0.9,
			metalness: 0.1,
			roughnessMap: texture,
			map: texture,
			transparent: true,
			opacity: 0,
			// premultipliedAlpha: true,
		});
		*/
		const sphere = new THREE.Mesh(geometry, material);
		// sphere.castShadow = false;
		// sphere.receiveShadow = true;
		group.renderOrder = -1;
		group.add(sphere);
		group.sphere = sphere;
		//
		/*
		const rotation = new THREE.Euler(0.0, 0.0, 0.0, 'XYZ');
		group.rotation.set(rotation.x, rotation.y, rotation.z);
		*/
		parent.add(group);
		return group;
	}

	addFloor(parent) {
		const geometry = new THREE.PlaneGeometry(ROOM_RADIUS / 5 * 3, ROOM_RADIUS / 5 * 3, 3, 3);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/floor.jpg');
		const textureAlpha = loader.load('img/floor-alpha.jpg');
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			alphaMap: textureAlpha,
			// alphaTest: 0.5,
			// blending: THREE.AdditiveBlending,
			// depthTest: true,
			transparent: true
		});
		/*
		material.blending = THREE.AdditiveBlending;
		*/
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.y = -ROOM_RADIUS / 5 * 3;
		mesh.rotation.x = -Math.PI / 2;
		parent.add(mesh);
		return mesh;
	}

	addCeil(parent) {
		const geometry = new THREE.PlaneGeometry(ROOM_RADIUS / 5 * 2, ROOM_RADIUS / 5 * 2, 3, 3);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/ceil.jpg');
		const textureAlpha = loader.load('img/ceil-alpha.jpg');
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			alphaMap: textureAlpha,
			// alphaTest: 0.5,
			// blending: THREE.AdditiveBlending,
			// depthTest: true,
			transparent: true
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.y = ROOM_RADIUS / 5 * 4;
		mesh.rotation.x = Math.PI / 2;
		parent.add(mesh);
		return mesh;
	}

	addPanel(parent) {
		const geometry = new THREE.PlaneBufferGeometry(PANEL_RADIUS / 2.5, PANEL_RADIUS / 2.5, 3, 3);
		const material = new THREE.MeshBasicMaterial({
			transparent: true,
			opacity: 1,
			// side: THREE.DoubleSide,
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(100000, 100000, 100000);
		// parent.add(mesh);
		return mesh;
	}

	addPoints(parent) {
		const points = new THREE.Group();
		parent.add(points);
		return points;
	}

	removePoints() {
		/*
		if (this.points) {
			this.points.remove();
			delete this.points;
		}
		*/
	}

	addPoint(parent, position, i) {
		// console.log('addPoint', parent, position, i);
		// size 2 about 20 cm radius
		const geometry = new THREE.PlaneBufferGeometry(2, 2, 2, 2);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/pin.jpg');
		const material = new THREE.MeshBasicMaterial({
			alphaMap: texture,
			transparent: true,
			opacity: 0,
		});
		const point = new THREE.Mesh(geometry, material);
		position = position.normalize().multiplyScalar(POINT_RADIUS);
		point.position.set(position.x, position.y, position.z);
		point.lookAt(this.origin);
		parent.add(point);
		const from = { opacity: 0 };
		TweenMax.to(from, 0.5, {
			opacity: 1,
			delay: 0.1 * i,
			onUpdate: () => {
				// console.log(index, from.opacity);
				point.material.opacity = from.opacity;
				point.material.needsUpdate = true;
			},
			onCompleted: () => {
				// console.log(index, 'completed');
			}
		});
		return point;
		// console.log(index, 'start');
	}

	removePoint(i) {
		return new Promise((resolve, reject) => {
			const point = this.points.children[i];
			const from = { opacity: 1 };
			TweenMax.to(from, 0.5, {
				opacity: 0,
				delay: 0.0 * i,
				onUpdate: () => {
					// console.log(index, from.opacity);
					point.material.opacity = from.opacity;
					point.material.needsUpdate = true;
				},
				onCompleted: () => {
					this.points.remove(point);
					resolve();
				}
			});
		});
	}

	createPoint(intersection) {
		const position = intersection.point.clone();
		this.addPoint(this.points, position, 0);
		this.view.points.push({
			id: 2,
			position: position.toArray(),
			type: 1,
			name: 'Point 2',
			key: 'POINT2',
		});
	}

}