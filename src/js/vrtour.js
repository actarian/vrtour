/* jshint esversion: 6 */
/* global window, document, TweenMax, THREE, WEBVR */

import html2canvas from 'html2canvas';
import DragListener from './shared/drag.listener';
import VR, { VR_MODE } from './shared/vr';

THREE.Euler.prototype.add = function(euler) {
	this.set(this.x + euler.x, this.y + euler.y, this.z + euler.z, this.order);
	return this;
};

export function cm(value) {
	return value / 100;
}

const shaderPoint = {
	vertexShader: `
	attribute float size;
	attribute vec4 ca;
	varying vec4 vColor;
	void main() {
		vColor = ca;
		vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
		gl_PointSize = size * (400.0 / -mvPosition.z);
		gl_Position = projectionMatrix * mvPosition;
	}
	`,
	fragmentShader: `
	uniform vec3 color;
	uniform sampler2D texture;
	varying vec4 vColor;
	void main() {
		vec4 textureColor = texture2D(texture, gl_PointCoord);
		// if (textureColor.a < 0.5) discard;
		gl_FragColor = textureColor * vec4(color * vColor.xyz, 1.0);
		// float depth = gl_FragCoord.z / gl_FragCoord.w;
		gl_FragColor = vec4(vec3(1.0), gl_FragColor.w);
	}
	`,
};

class VRTour {

	constructor() {
		this.mouse = { x: 0, y: 0 };
		this.parallax = { x: 0, y: 0 };
		this.size = { width: 0, height: 0, aspect: 0 };
		this.isUserInteracting = false;
		this.longitude = 0;
		this.latitude = 0;
		this.direction = 1;
		this.speed = 1;
		this.inertia = new THREE.Vector3(0, 0, 0);
		this.origin = new THREE.Vector3(0, 0, 0);
		this.init();
	}

	get index() {
		return this.index_;
	}
	set index(index) {
		this.index_ = index;
		this.view = this.views[index];
	}

	get view() {
		return this.view_;
	}
	set view(view) {
		this.onInitView(this.view_, view);
		this.view_ = view;
	}

	load(jsonUrl) {
		try {
			fetch(jsonUrl).then(response => response.json()).then(response => {
				this.views = response.views;
				this.index = 0;
			});
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	init() {
		const body = document.querySelector('body');
		const section = document.querySelector('.vrtour');
		const container = section.querySelector('.vrtour__container');
		const debugInfo = section.querySelector('.debug__info');
		const debugSave = section.querySelector('.debug__save');
		// const shadow = section.querySelector('.vrtour__shadow');
		// const title = section.querySelector('.vrtour__headline .title');
		// const abstract = section.querySelector('.vrtour__headline .abstract');
		// Dom.detect(body);
		// body.classList.add('ready');
		this.body = body;
		this.section = section;
		this.container = container;
		this.debugInfo = debugInfo;
		this.debugSave = debugSave;
		this.onWindowResize = this.onWindowResize.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onSave = this.onSave.bind(this);
		this.onLeftSelectStart = this.onLeftSelectStart.bind(this);
		this.onLeftSelectEnd = this.onLeftSelectEnd.bind(this);
		this.onRightSelectStart = this.onRightSelectStart.bind(this);
		this.onRightSelectEnd = this.onRightSelectEnd.bind(this);
		// this.shadow = shadow;
		// this.title = title;
		// this.abstract = abstract;
		this.initRenderer();
	}

	initRenderer() {
		const scene = this.scene = this.addScene();
		const camera = this.camera = this.addCamera();
		const environment = this.environment = this.addEnvironment(scene);
		const floor = this.floor = this.addFloor(scene);
		const ceil = this.ceil = this.addCeil(scene);
		// renderer
		const renderer = this.renderer = this.addRenderer();
		// this.container.appendChild(WEBVR.createButton(renderer, { referenceSpaceType: 'local' }));
		const vr = this.vr = this.addVR(renderer, this.container);
		/*
		const unsubscribe = vr.addListener('error', (error) => {
			this.debugInfo.innerHTML = error;
		});
		*/
		// unsubscribe();
		// controllers

		/*
		const controller = new THREE.Group();
		controller.position.set(0.4, 0, -0.4);
		this.addControllerCylinder(controller, 0);
		this.scene.add(controller);
		*/

		console.log('vr.mode', vr.mode);
		if (vr.mode !== VR_MODE.NONE) {
			const left = this.left = this.addControllerLeft(renderer, scene);
			const right = this.right = this.addControllerRight(renderer, scene);
			const pointer = this.pointer = this.addPointer(scene);
			// hands
			// const hands = this.hands = this.addHands();
		} else {
			const dragListener = this.dragListener = this.addDragListener();
		}
		// raycaster
		const raycaster = this.raycaster = new THREE.Raycaster();
		window.addEventListener('resize', this.onWindowResize, false);
		document.addEventListener('mousemove', this.onMouseMove, false);
		document.addEventListener('wheel', this.onMouseWheel, false);
		this.container.addEventListener('click', this.onClick, false);
		this.debugSave.addEventListener('click', this.onSave, false);
		this.section.classList.add('init');
		this.onWindowResize();
	}

	addScene() {
		const scene = new THREE.Scene();
		// scene.background = new THREE.Color(0x000000);
		// scene.background = new THREE.Color(0x404040);
		// scene.fog = new THREE.Fog(scene.background, 10, 700);
		return scene;
	}

	addCamera() {
		const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1100);
		// camera.layers.enable(1);
		// camera.position.set(0, 0, 0);
		camera.target = new THREE.Vector3(0, 0, 0);
		return camera;
	}

	addRenderer() {
		const renderer = new THREE.WebGLRenderer({
			alpha: false,
			antialias: true,
		});
		this.renderer = renderer;
		// renderer.shadowMap.enabled = true;
		renderer.setClearColor(0x000000, 1);
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.vr.enabled = true;
		// container.innerHTML = '';
		this.container.appendChild(renderer.domElement);
		return renderer;
	}

	addVR(renderer, container) {
		const vr = new VR(renderer, { referenceSpaceType: 'local' }, (error) => {
			this.debugInfo.innerHTML = error;
		});
		container.appendChild(vr.element);
		return vr;
	}

	addEnvironment(parent) {
		const group = new THREE.Group();
		const geometry = new THREE.SphereBufferGeometry(500, 72, 72);
		// const geometry = new THREE.IcosahedronBufferGeometry(500, 4);
		// console.log(geometry);
		// invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0x000000,
			// depthTest: false,
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
		const geometry = new THREE.PlaneGeometry(300, 300, 3, 3);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/floor.jpg');
		const textureAlpha = loader.load('img/floor-alpha.jpg');
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			alphaMap: textureAlpha,
			alphaTest: 0.5,
			// blending: THREE.AdditiveBlending,
			// depthTest: true,
			transparent: true
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.y = -300;
		mesh.rotation.x = -Math.PI / 2;
		parent.add(mesh);
		return mesh;
	}

	addCeil(parent) {
		const geometry = new THREE.PlaneGeometry(200, 200, 3, 3);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/ceil.jpg');
		const textureAlpha = loader.load('img/ceil-alpha.jpg');
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			alphaMap: textureAlpha,
			alphaTest: 0.5,
			// blending: THREE.AdditiveBlending,
			// depthTest: true,
			transparent: true
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.y = 400;
		mesh.rotation.x = Math.PI / 2;
		parent.add(mesh);
		return mesh;
	}

	addPointer(parent) {
		const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/pin.jpg');
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			// transparent: true
		});
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = 100000;
		parent.add(mesh);
		return mesh;
	}

	addControllerLeft(renderer, scene) {
		const controller = renderer.vr.getController(0);
		const cylinder = controller.cylinder = this.addControllerCylinder(controller, 0);
		controller.addEventListener('selectstart', this.onLeftSelectStart);
		controller.addEventListener('selectend', this.onLeftSelectEnd);
		scene.add(controller);
		return controller;
	}

	addControllerRight(renderer, scene) {
		const controller = renderer.vr.getController(1);
		const cylinder = controller.cylinder = this.addControllerCylinder(controller, 1);
		controller.addEventListener('selectstart', this.onRightSelectStart);
		controller.addEventListener('selectend', this.onRightSelectEnd);
		scene.add(controller);
		return controller;
	}

	addControllerCylinder(controller, i) {
		// pointer
		const geometry = new THREE.CylinderGeometry(cm(2), cm(2), cm(12), 24);
		const texture = new THREE.TextureLoader().load('https://cdn.glitch.com/7ae766be-18fb-4945-ad9d-8cc3be027694%2FBazC_SkinMat.jpg?1558678160164');
		const material = new THREE.MeshMatcapMaterial({
			color: i === 0 ? 0xff0000 : 0x0000ff,
			matcap: texture
		});
		/*
		const material = new THREE.MeshBasicMaterial({
			color: i === 0 ? 0x0000ff : 0xff0000,
			// roughness: 0.2,
			// metalness: 0.1,
		});
		*/
		/*
		const modifier = new THREE.SubdivisionModifier(2);
		const smoothGeometry = modifier.modify(geometry);
		const smoothBufferGeometry = new THREE.BufferGeometry().fromGeometry(smoothGeometry);
		const mesh = new THREE.Mesh(smoothBufferGeometry, material);
		*/
		const mesh = new THREE.Mesh(geometry, material);
		// mesh.geometry.rotateZ(-Math.PI / 2);
		// mesh.geometry.rotateY(Math.PI);
		controller.add(mesh);
	}

	addHands() {
		const hands = [];
		const left = this.left;
		const right = this.right;
		const file = 'https://cdn.glitch.com/7ae766be-18fb-4945-ad9d-8cc3be027694%2Fhand.obj?1558677422910';
		const loader = new THREE.OBJLoader();
		loader.load(file, (group) => {
			const texture = new THREE.TextureLoader().load('https://cdn.glitch.com/7ae766be-18fb-4945-ad9d-8cc3be027694%2FBazC_SkinMat.jpg?1558678160164');
			const hand = group.children[0];
			hand.geometry.rotateZ(-Math.PI / 2);
			hand.geometry.rotateY(Math.PI);
			hand.geometry.translate(1, -0.2, 0.25);
			hand.geometry.scale(0.1, 0.1, 0.1);
			hand.material = new THREE.MeshMatcapMaterial({ matcap: texture });
			hand.scale.x = -1;
			const leftHand = hand.clone();
			right.add(leftHand);
			hands.push(leftHand);
			hand.scale.x = 1;
			// const bills = this.addBillsToHand(hand);
			const rightHand = hand.clone();
			left.add(rightHand);
			hands.push(rightHand);
		});
		return hands;
	}

	addDragListener() {
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
		return dragListener;
	}

	removePoints() {
		/*
		if (this.points) {
			this.points.remove();
			delete this.points;
		}
		*/
	}

	addPoints(parent) {
		const loader = new THREE.TextureLoader();
		const geometry = new THREE.BufferGeometry();
		// hack fix
		const vertices = [];
		vertices.push(0, -10000, 0);
		vertices.push(0, 10000, 0);
		geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		// hack fix
		const colors = new Array(100 * 3).fill(0);
		const colorsAttribute = new THREE.Float32BufferAttribute(colors, 3);
		const sizes = new Array(100).fill(10);
		geometry.addAttribute('color', colorsAttribute);
		geometry.addAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
		geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
		/*
		const material = new THREE.PointsMaterial({
			size: 15,
			map: loader.load('img/pin.png'),
			vertexColors: THREE.VertexColors,
			blending: THREE.AdditiveBlending,
			depthTest: true,
			transparent: true
		});
		*/
		/*
		const material = new THREE.ShaderMaterial({
			uniforms: {
				color: { value: new THREE.Color(0xffffff) },
				texture: { value: loader.load('img/pin.png') }
			},
			vertexColors: THREE.VertexColors,
			blending: THREE.AdditiveBlending,
			depthTest: true,
			transparent: true,
			vertexShader: shaderPoint.vertexShader,
			fragmentShader: shaderPoint.fragmentShader,
			alphaTest: 0.9
		});
		*/
		const material = new THREE.ShaderMaterial({
			uniforms: {
				amplitude: { value: 1.0 },
				color: { value: new THREE.Color(0xffffff) },
				texture: { value: loader.load('img/pin.png') }
			},
			vertexShader: shaderPoint.vertexShader,
			fragmentShader: shaderPoint.fragmentShader,
			transparent: true
		});
		// materials[i].color.setHSL(1, 0, 0);
		const points = new THREE.Points(geometry, material);
		points.vertices = vertices;
		points.colors = colors;
		points.colorsAttribute = colorsAttribute;
		points.scale.set(0.95, 0.95, 0.95);
		parent.add(points);
		return points;
	}

	addPoint(position, i) {
		const points = this.points;
		const geometry = points.geometry;
		const vertices = points.vertices;
		const index = vertices.length / 3;
		vertices.push(position.x, position.y, position.z);
		geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const colorsAttribute = points.colorsAttribute;
		colorsAttribute.setXYZ(index, 0, 0, 0);
		points.material.needsUpdate = true;
		// console.log(index, 'start');
		const from = { opacity: 0 };
		TweenMax.to(from, 0.5, {
			opacity: 1,
			delay: 0.1 * i,
			onUpdate: () => {
				// console.log(index, from.opacity);
				colorsAttribute.setXYZ(index, from.opacity, from.opacity, from.opacity);
				colorsAttribute.needsUpdate = true;
				points.material.needsUpdate = true;
			},
			onCompleted: () => {
				// console.log(index, 'completed');
			}
		});
	}

	removePoint(i) {
		return new Promise((resolve, reject) => {
			const points = this.points;
			const geometry = points.geometry;
			const vertices = points.vertices;
			const index = vertices.length / 3;
			const colorsAttribute = points.colorsAttribute;
			colorsAttribute.setXYZ(index, 1, 1, 1);
			points.material.needsUpdate = true;
			// console.log(index, 'start');
			const from = { opacity: 1 };
			TweenMax.to(from, 0.5, {
				opacity: 0,
				delay: 0.0 * i,
				onUpdate: () => {
					// console.log(index, from.opacity);
					colorsAttribute.setXYZ(index, from.opacity, from.opacity, from.opacity);
					colorsAttribute.needsUpdate = true;
					points.material.needsUpdate = true;
				},
				onCompleted: () => {
					// console.log(index, 'completed');
					vertices.splice(vertices.length - 3, 3);
					geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
					resolve();
				}
			});
		});
	}

	createPoint(intersection) {
		// console.log(intersection);
		const position = intersection.point.clone();
		this.addPoint(position, 0);
		this.view.points.push({
			id: 2,
			position: position.toArray(),
			type: 1,
			name: 'Point 2',
			key: 'POINT2',
		});
		// p.multiplyScalar(1);
		/*
		const positions = new Float32Array([...geometry.attributes.position.array, p.x, p.y, p.z]);
		const attribute = new THREE.BufferAttribute(positions, 3);
		attribute.dynamic = true;
		geometry.addAttribute('position', attribute);
		positions.needsUpdate = true;
		geometry.setDrawRange(0, positions.length);
		geometry.verticesNeedUpdate = true;
		geometry.elementsNeedUpdate = true;
		// geometry.computeVertexNormals();
		console.log(geometry);
		*/
		/*
		geometry.vertices.push(p);
		// geometry.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()));
		geometry.verticesNeedUpdate = true;
		geometry.elementsNeedUpdate = true;
		geometry.computeVertexNormals();
		*/
		// console.log(p);
	}

	onInitView(previous, current) {
		// console.log(previous, current);
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
				TweenMax.to(this.environment.sphere.material, 0.4, {
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
						if (this.environment.sphere.material.map) {
							this.environment.sphere.material.map.dispose();
						}
						*/
						if (view.camera) {
							this.latitude = view.camera.latitude;
							this.longitude = view.camera.longitude;
						}
						const material = this.environment.sphere.material;
						material.opacity = 0;
						material.color.setHex(0xffffff);
						// texture.minFilter = THREE.NearestMipMapNearestFilter;
						// texture.magFilter = THREE.LinearMipMapLinearFilter;
						material.map = texture;
						material.map.needsUpdate = true;
						material.needsUpdate = true;
						TweenMax.to(material, 0.6, {
							opacity: 1,
							delay: 0.1,
							onCompleted: () => {
								resolve(view);
							}
						});
					});
				}, 100);
			} else {
				reject(view);
			}
		});
	}

	onEnterPoints(view) {
		if (!this.points) {
			const points = this.points = this.addPoints(this.scene);
		}
		view.points.forEach((point, i) => this.addPoint(new THREE.Vector3(...point.position), i));
	}

	onExitPoints(view) {
		if (view) {
			return Promise.all(view.points.map((point, i) => this.removePoint(i)));
		} else {
			return Promise.resolve();
		}
	}

	// events

	onLeftSelectStart() {
		try {
			this.controller = this.left;
			this.isControllerSelecting = true;
			this.isControllerSelectionDirty = true;
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onLeftSelectEnd() {
		try {
			this.isControllerSelecting = false;
			this.isControllerSelectionDirty = false;
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onRightSelectStart() {
		try {
			this.controller = this.right;
			this.isControllerSelecting = true;
			this.isControllerSelectionDirty = true;
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onRightSelectEnd() {
		try {
			this.isControllerSelecting = false;
			this.isControllerSelectionDirty = false;
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onWindowResize() {
		try {
			const container = this.container,
				renderer = this.renderer,
				camera = this.camera;
			const size = this.size;
			size.width = container.offsetWidth;
			size.height = container.offsetHeight;
			size.aspect = size.width / size.height;
			if (renderer) {
				renderer.setSize(size.width, size.height);
			}
			if (camera) {
				camera.aspect = size.width / size.height;
				camera.updateProjectionMatrix();
			}
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onMouseMove(event) {
		try {
			const w2 = this.container.offsetWidth / 2;
			const h2 = this.container.offsetHeight / 2;
			this.mouse = {
				x: (event.clientX - w2) / w2,
				y: -(event.clientY - h2) / h2,
			};
			// console.log('onMouseMove', this.mouse);
			/*
			var attributes = geometry.attributes;
			raycaster.setFromCamera( mouse, camera );
			intersects = raycaster.intersectObject( points );
			if ( intersects.length > 0 ) {
				if ( INTERSECTED != intersects[ 0 ].index ) {
					attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
					INTERSECTED = intersects[ 0 ].index;
					attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE * 1.25;
					attributes.size.needsUpdate = true;
				}
			} else if ( INTERSECTED !== null ) {
				attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
				attributes.size.needsUpdate = true;
				INTERSECTED = null;
			}
			*/
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onMouseWheel(event) {
		try {
			const camera = this.camera;
			const fov = camera.fov + event.deltaY * 0.01;
			camera.fov = THREE.Math.clamp(fov, 30, 75);
			camera.updateProjectionMatrix();
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onClick(event) {
		try {
			const raycaster = this.raycaster;
			// update the picking ray with the camera and mouse position
			raycaster.setFromCamera(this.mouse, this.camera);
			// calculate objects intersecting the picking ray
			if (event.shiftKey) {
				const intersections = raycaster.intersectObjects(this.environment.children);
				if (intersections) {
					const intersection = intersections.find(x => x !== undefined);
					this.createPoint(intersection);
				}
				// console.log(intersections);
				/*
				for (var i = 0; i < intersects.length; i++ ) {
					console.log(intersections[i])
					intersects[i].object.material.color.set( 0xff0000 );
				}
				*/
			} else if (this.points) {
				raycaster.params.Points.threshold = 10.0;
				const intersections = raycaster.intersectObjects([this.points]);
				if (intersections) {
					const intersection = intersections.find(x => x !== undefined);
					if (intersection) {
						const index = intersection.index;
						const point = intersection.point;
						const debugInfo = `${index} => {${point.x}, ${point.y}, ${point.z}}`;
						// console.log(index, point, debugInfo);
						this.debugInfo.innerHTML = debugInfo;
						this.index = (this.index + 1) % this.views.length;
					}
				}
			}
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	onSave(event) {
		try {
			this.view.camera = {
				latitude: this.latitude,
				longitude: this.longitude,
			};
			this.saveData({ views: this.views }, 'vr.json');
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	// animation

	doParallax() {
		// parallax
		const parallax = this.parallax;
		parallax.x += (this.mouse.x - parallax.x) / 8;
		parallax.y += (this.mouse.y - parallax.y) / 8;
		// this.light1.position.set(parallax.x * 5.0, 6.0 + parallax.y * 2.0, 4.0);
		// this.light2.position.set(parallax.x * -5.0, -6.0 - parallax.y * 2.0, 4.0);
		/*
		const size = this.size;
		const sx = size.width < 1024 ? 0 : -3;
		const sy = size.width < 1024 ? -2 : 0;
		this.tour.position.x = sx + parallax.x * 0.2;
		this.tour.position.y = sy + parallax.y * 0.2;
		*/
		//
		/*
		const titleXy = {
			x: -50 + 0.5 * -parallax.x,
			y: -50 + 0.5 * -parallax.y,
		};
		TweenMax.set(this.title, {
			transform: 'translateX(' + titleXy.x + '%) translateY(' + titleXy.y + '%)'
		});
		*/
		/*
		const shadowXy = {
			x: -50 + 3 * -parallax.x,
			y: -50 + 3 * -parallax.y,
		};
		TweenMax.set(this.shadow, {
			transform: 'translateX(' + shadowXy.x + '%) translateY(' + shadowXy.y + '%)'
		});
		*/
	}

	animate() {
		const renderer = this.renderer;
		renderer.setAnimationLoop(() => {
			this.render();
		});
	}

	render(delta) {
		if (this.vr.mode !== VR_MODE.NONE) {
			this.updateControllers();
		} else {
			this.updateCamera();
		}
		const renderer = this.renderer;
		renderer.render(this.scene, this.camera);
		// this.doParallax();
	}

	updateControllers() {
		try {
			const controller = this.controller;
			if (controller) {
				const raycaster = this.raycaster;
				raycaster.set(controller.position, controller.rotation.normalize());
				let intersections = raycaster.intersectObjects(this.environment.children);
				if (intersections) {
					const intersection = intersections.find(x => x !== undefined);
					this.pointer.position.set(intersection.point);
					this.pointer.lookAt(this.origin);
				}
				if (this.isControllerSelectionDirty && this.points) {
					raycaster.params.Points.threshold = 10.0;
					intersections = raycaster.intersectObjects([this.points]);
					if (intersections) {
						const intersection = intersections.find(x => x !== undefined);
						if (intersection) {
							this.isControllerSelectionDirty = false;
							const index = intersection.index;
							const point = intersection.point;
							const debugInfo = `${index} => {${point.x}, ${point.y}, ${point.z}}`;
							// console.log(index, point, debugInfo);
							this.debugInfo.innerHTML = debugInfo;
							this.index = (this.index + 1) % this.views.length;
						}
					}
				}
			}
		} catch (error) {
			this.debugInfo.innerHTML = error;
		}
	}

	updateCamera() {
		const camera = this.camera;
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
		camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 500 * Math.cos(phi);
		camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
		camera.lookAt(camera.target);
		this.latitude = latitude;
		this.longitude = longitude;
		this.speed = speed;
		this.inertia = inertia;
		/*
		// distortion
		camera.position.copy( camera.target ).negate();
		*/
	}

	// utils

	saveData(data, filename = 'console.json') {
		if (!data) {
			console.error('Console.save: No data');
			return;
		}
		if (typeof data === 'object') {
			data = JSON.stringify(data, undefined, 4);
		}
		const blob = new Blob([data], { type: 'text/json' });
		const event = document.createEvent('MouseEvents');
		const anchor = document.createElement('a');
		anchor.download = filename;
		anchor.href = window.URL.createObjectURL(blob);
		anchor.dataset.downloadurl = ['text/json', anchor.download, anchor.href].join(':');
		event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		anchor.dispatchEvent(event);
		// this.getSnapshot();
	}

	getSnapshot() {
		html2canvas(document.querySelector('.page')).then(canvas => {
			document.body.appendChild(canvas);
		});
	}

}

const tour = new VRTour();

// window.onload = () => {
tour.animate();
tour.load('data/vr.json');
// };

/*
let camera;
if (USE_ORTHO) {
	const width = 10;
	const height = width / this.container.offsetWidth * this.container.offsetHeight;
	camera = new THREE.OrthographicCamera(-width, width, height, -height, 0.01, 1000);
} else {
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
}
// const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.01, 1000);
camera.position.set(0, 5.0, 12.0);
camera.up = new THREE.Vector3(0, 0, -1);
camera.lookAt(new THREE.Vector3(0, 0, 0));
this.camera = camera;
*/

/*
const ambient = new THREE.AmbientLight(0x222222);
scene.add(ambient);
this.ambient = ambient;
*/

/*
// color : Integer, intensity : Float, distance : Number, decay : Float
const light = new THREE.PointLight(0xffffff, 1000, 1000, 1);
light.position.set(0, 0, 0);
scene.add(light);
this.light = light;
*/

/*
let light1;
light1 = new THREE.DirectionalLight(0xffffff, 4.0);
// light1.castShadow = true;
// light1.shadowCameraVisible = true;
// light1.mapSize.width = 2048;
// light1.mapSize.height = 2048;
scene.add(light1);
this.light1 = light1;
if (SHOW_HELPERS) {
	const light1Helper = new THREE.DirectionalLightHelper(light1, 1);
	scene.add(light1Helper);
}
const light2 = new THREE.DirectionalLight(0xffffff, 4.0);
scene.add(light2);
this.light2 = light2;
if (SHOW_HELPERS) {
	const light2Helper = new THREE.DirectionalLightHelper(light2, 1);
	scene.add(light2Helper);
}
*/
