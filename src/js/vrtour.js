/* jshint esversion: 6 */
/* global window, document, TweenMax, THREE, WEBVR */

import Dom from './shared/dom';
import DragListener from './shared/drag.listener';

THREE.Euler.prototype.add = function(euler) {
	this.set(this.x + euler.x, this.y + euler.y, this.z + euler.z, this.order);
	return this;
};

const USE_ORTHO = false;
const SHOW_HELPERS = false;

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
		this.init();
		fetch(jsonUrl).then(response => response.json()).then(response => {
			// console.log(response);
			this.views = response.views;
			this.index = 0;
		});
	}

	init() {
		const body = document.querySelector('body');
		const section = document.querySelector('.vrtour');
		const container = section.querySelector('.vrtour__container');
		const debugInfo = section.querySelector('.debug__info');
		const debugSave = section.querySelector('.debug__save');
		// const shadow = section.querySelector('.vrtour__shadow');
		const title = section.querySelector('.vrtour__headline .title');
		const abstract = section.querySelector('.vrtour__headline .abstract');
		Dom.detect(body);
		body.classList.add('ready');
		this.body = body;
		this.section = section;
		this.container = container;
		this.debugInfo = debugInfo;
		this.debugSave = debugSave;
		// this.shadow = shadow;
		this.title = title;
		this.abstract = abstract;
		this.initRenderer();
	}

	initRenderer() {
		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
		renderer.shadowMap.enabled = true;
		renderer.vr.enabled = true;
		renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer = renderer;
		// container.innerHTML = '';
		this.container.appendChild(renderer.domElement);
		this.container.appendChild(WEBVR.createButton(renderer, { referenceSpaceType: 'local' }));
		this.container.querySelector('[href]').setAttribute('target', '_blank');

		const scene = new THREE.Scene();
		this.scene = scene;

		/*
		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x000000, 0.1); // new THREE.Fog(0x000000, 0, 10);
		this.scene = scene;
		*/

		const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1100);
		camera.layers.enable(1);
		// camera.position.set(0, 0, 0);
		camera.target = new THREE.Vector3(0, 0, 0);
		this.camera = camera;

		/*
		var vertex;
		var color = new THREE.Color();
		for ( var i = 0, l = vertices.length; i < l; i ++ ) {
			vertex = vertices[ i ];
			vertex.toArray( positions, i * 3 );
			color.setHSL( 0.01 + 0.1 * ( i / l ), 1.0, 0.5 );
			color.toArray( colors, i * 3 );
			sizes[ i ] = PARTICLE_SIZE * 0.5;
		}
		*/

		/*
		const positions = new Float32Array(0 * 3);
		const colors = new Float32Array(0 * 3);
		const sizes = new Float32Array(0);

		const geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
		geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
		var material = new THREE.ShaderMaterial({
			uniforms: {
				color: { value: new THREE.Color(0xffffff) },
				texture: { value: new THREE.TextureLoader().load('textures/sprites/disc.png') }
			},
			vertexShader: document.getElementById('vertexshader').textContent,
			fragmentShader: document.getElementById('fragmentshader').textContent,
			alphaTest: 0.9
		});
		// const points = new THREE.Points(geometry, material);
		*/
		// const geometry = new THREE.Geometry();
		/*
		const geometry = new THREE.BufferGeometry();
		const positions = new Float32Array(0 * 3);
		geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		const material = new THREE.PointsMaterial({
			size: 5,
			vertexColors: THREE.VertexColors,
			depthTest: false,
		});
		const material = new THREE.PointsMaterial({
			size: 50,
			map: THREE.ImageUtils.loadTexture('http://matthewachase.com/tru-dat-boo.png'),
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthTest: false
        });
        const points = new THREE.Points(geometry, material);
		scene.add(points);
		this.points = points;
        */

		// const PARTICLE_SIZE = 20;

		const raycaster = new THREE.Raycaster();
		this.raycaster = raycaster;

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

		const rotation = new THREE.Euler(0.0, 0.0, 0.0, 'XYZ');
		const environment = this.addEnvironment(scene, rotation);
		this.environment = environment;

		const floor = this.addFloor(scene);
		this.floor = floor;

		const ceil = this.addCeil(scene);
		this.ceil = ceil;

		const points = this.addPoints(this.scene);
		this.points = points;

		/*
		const pointRef = new THREE.Vector3(0.0, 0.0, 1.0);
		this.pointRef = pointRef;
		*/
		// const shadow = this.addShadow(scene);
		/*
		const tourRotation = new THREE.Euler(0.0, Math.PI * 1.2, 0.0, 'XYZ');
		const tourDragRotation = new THREE.Euler(0, 0, 0, 'XYZ');
		const tourStartDragRotation = new THREE.Euler(0, 0, 0, 'XYZ');
		const tourSpeedRotation = new THREE.Euler(0, 0, 0, 'XYZ');
		const tour = this.addVRTour(scene, tourRotation, this.tourTexture);
		this.tourRotation = tourRotation;
		this.tourDragRotation = tourDragRotation;
		this.tourStartDragRotation = tourStartDragRotation;
		this.tourSpeedRotation = tourSpeedRotation;
		this.tourRotation = tourRotation;
		this.tour = tour;
		*/
		/*
		const points = addPoints(tour);
		this.points = points;
		*/
		/*
		const dragListener = new DragListener(this.container, (e) => {
			tourStartDragRotation.copy(tourDragRotation);
		}, (e) => {
			tourDragRotation.copy(tourStartDragRotation).add(new THREE.Euler(0, Math.PI * e.strength.x, 0, 'XYZ'));
			tourSpeedRotation.set(0, 0.1, 0, 'XYZ');
		}, (e) => {
			tourSpeedRotation.set(0, Math.PI * e.speed.x, 0, 'XYZ');
		});
		this.dragListener = dragListener;
		*/
		let longitude, latitude;
		const dragListener = new DragListener(this.container, (event) => {
			longitude = this.longitude;
			latitude = this.latitude;
		}, (event) => {
			this.longitude = -event.distance.x * 0.1 + longitude;
			this.latitude = event.distance.y * 0.1 + latitude;
			this.direction = event.distance.x ? (event.distance.x / Math.abs(event.distance.x) * -1) : 1;
			console.log('longitude', this.longitude, 'latitude', this.latitude, 'direction', this.direction);
		}, (event) => {
			this.speed = Math.abs(event.strength.x) * 100;
			console.log('speed', this.speed);
		});
		this.dragListener = dragListener;
		this.onWindowResize = this.onWindowResize.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onSave = this.onSave.bind(this);
		window.addEventListener('resize', this.onWindowResize, false);
		document.addEventListener('mousemove', this.onMouseMove, false);
		document.addEventListener('wheel', this.onMouseWheel, false);
		this.container.addEventListener('click', this.onClick, false);
		this.debugSave.addEventListener('click', this.onSave, false);
		this.section.classList.add('init');
		this.onWindowResize();
		this.animate();
		// this.play();
	}

	addEnvironment(parent, rotation) {
		const group = new THREE.Group();
		//
		var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
		// invert the geometry on the x-axis so that all of the faces point inward
		geometry.scale(-1, 1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffffff,
			// transparent: true,
			// opacity: 1.0,
			depthTest: false,
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
		group.rotation.set(rotation.x, rotation.y, rotation.z);
		parent.add(group);
		return group;
	}

	addFloor(parent) {
		const geometry = new THREE.PlaneGeometry(300, 300, 3, 3);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/floor.jpg');
		const textureAlpha = loader.load('img/floor-alpha.jpg');
		// assuming you want the texture to repeat in both directions:
		// texture.wrapS = THREE.RepeatWrapping;
		// texture.wrapT = THREE.RepeatWrapping;
		// how many times to repeat in each direction; the default is (1,1),
		// which is probably why your example wasn't working
		// texture.repeat.set( 4, 4 );
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			alphaMap: textureAlpha,
			// blending: THREE.AdditiveBlending,
			// depthTest: true,
			transparent: true
		});
		const mesh = new THREE.Mesh(geometry, material);
		// mesh.material.side = THREE.DoubleSide;
		// mesh.position.x = 0;
		mesh.position.y = -300;
		// rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
		// Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.
		mesh.rotation.x = -Math.PI / 2;
		parent.add(mesh);
		return mesh;
	}

	addCeil(parent) {
		const geometry = new THREE.PlaneGeometry(200, 200, 3, 3);
		const loader = new THREE.TextureLoader();
		const texture = loader.load('img/ceil.jpg');
		const textureAlpha = loader.load('img/ceil-alpha.jpg');
		// assuming you want the texture to repeat in both directions:
		// texture.wrapS = THREE.RepeatWrapping;
		// texture.wrapT = THREE.RepeatWrapping;
		// how many times to repeat in each direction; the default is (1,1),
		// which is probably why your example wasn't working
		// texture.repeat.set( 4, 4 );
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			alphaMap: textureAlpha,
			// blending: THREE.AdditiveBlending,
			// depthTest: true,
			transparent: true
		});
		const mesh = new THREE.Mesh(geometry, material);
		// mesh.material.side = THREE.DoubleSide;
		// mesh.position.x = 0;
		mesh.position.y = 400;
		// rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
		// Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.
		mesh.rotation.x = Math.PI / 2;
		parent.add(mesh);
		return mesh;
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
		// hack fix
		const vertices = [];
		vertices.push(0, -10000, 0);
		vertices.push(0, 10000, 0);
		// hack fix
		const geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		const material = new THREE.PointsMaterial({
			size: 20,
			map: loader.load('img/pin.png'),
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: false
		});
		// materials[i].color.setHSL(1, 0, 0);
		const points = new THREE.Points(geometry, material);
		points.vertices = vertices;
		parent.add(points);
		return points;
	}

	addPoint(position) {
		const points = this.points;
		const geometry = points.geometry;
		const vertices = points.vertices;
		vertices.push(position.x, position.y, position.z);
		vertices.needsUpdate = true;
		points.material.needsUpdate = true;
		geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	}

	createPoint(intersection) {
		console.log(intersection);
		const position = intersection.point.clone();
		this.addPoint(position);
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
		this.view.points.push({
			id: 2,
			position: position.toArray(),
			type: 1,
			name: 'Point 2',
			key: 'POINT2',
		});
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
		if (previous) {
			this.onExitView(previous).then(() => {
				this.onEnterView(current);
			});
		} else {
			this.onEnterView(current);
		}
	}

	onEnterView(view) {
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
			this.environment.sphere.material.map = texture;
			this.environment.sphere.material.map.needsUpdate = true;
			this.environment.sphere.material.needsUpdate = true;
			console.log(texture, this.environment.sphere.material.map);

			view.points.forEach(point => this.addPoint(new THREE.Vector3(...point.position)));

			if (view.camera) {
				this.latitude = view.camera.latitude;
				this.longitude = view.camera.longitude;
			}
		});
	}

	onSave(event) {
		this.view.camera = {
			latitude: this.latitude,
			longitude: this.longitude,
		};
		this.saveData(this.views, 'vr.json');
	}

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
	}

	enter() {
		// this.tourCubesAppearAnimation();
	}

	tourCubesAppearAnimation(factor, duration, delay) {
		const cubes = this.tour.cubes;
		factor = factor || 1.5;
		duration = duration || 1.4;
		delay = delay || 0.01;
		cubes.forEach((cube, i) => {
			const position = cube.position_;
			cube.position.set(position.x * factor, position.y * factor, position.z * factor);
			TweenMax.to(cube.position, duration, {
				x: position.x,
				y: position.y,
				z: position.z,
				delay: i * delay,
				ease: Elastic.easeOut,
			});
			TweenMax.to(cube.material, duration * 0.2, {
				opacity: 1,
				delay: i * delay,
				ease: Sine.easeInOut,
			});
		});
		setTimeout(() => {
			this.randomRotateVRTourRows(this.tour.rows);
			TweenMax.set(this.title, { transform: 'translate3d(0,80px,0)' });
			TweenMax.to(this.title, 0.4, {
				transform: 'translate3d(0,0,0)',
				opacity: 1,
				delay: 1,
				ease: Sine.easeInOut,
			});
			TweenMax.set(this.abstract, { transform: 'translate3d(0,80px,0)' });
			TweenMax.to(this.abstract, 0.4, {
				transform: 'translate3d(0,0,0)',
				opacity: 1,
				delay: 1.2,
				ease: Sine.easeInOut,
			});
		}, delay * cubes.length + duration);
	}

	tourCubesWaveAnimation(cubes, factor, duration, delay) {
		factor = factor || 1.5;
		duration = duration || 1.4;
		delay = delay || 0.01;
		cubes.forEach((cube, i) => {
			const position = cube.position_;
			TweenMax.to(cube.position, 0.3, {
				x: position.x * factor,
				y: position.y * factor,
				z: position.z * factor,
				delay: i * delay,
				ease: Sine.easeOut,
				onComplete: () => {
					TweenMax.to(cube.position, duration, {
						x: position.x,
						y: position.y,
						z: position.z,
						ease: Elastic.easeOut,
					});
				}
			});
		});
	}

	randomRotateVRTourRows(rows) {
		// console.log(rows);
		const dir = Math.random() > 0.5 ? 1 : -1;
		const row = rows[Math.floor(Math.random() * rows.length)];
		const rotation = row.rotation;
		TweenMax.to(rotation, 0.5, {
			y: rotation.y + dir * Math.PI / 2,
			delay: 1,
			ease: Sine.easeInOut,
			onComplete: () => {
				this.randomRotateVRTourRows(rows);
			}
		});
	}

	onMouseMove(event) {
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
	}

	onClick(event) {
		// this.tourCubesWaveAnimation(this.tour.cubes);
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
			console.log(intersections);
			/*
			for (var i = 0; i < intersects.length; i++ ) {
				console.log(intersections[i])
				intersects[i].object.material.color.set( 0xff0000 );
			}
			*/
		} else {
			raycaster.params.Points.threshold = 10.0;
			const intersections = raycaster.intersectObjects([this.points]);
			if (intersections) {
				const intersection = intersections.find(x => x !== undefined);
				if (intersection) {
					const index = intersection.index;
					const point = intersection.point;
					const debugInfo = `${index} => {${point.x}, ${point.y}, ${point.z}}`;
					console.log(index, point, debugInfo);
					this.debugInfo.innerHTML = debugInfo;
				}
			}
		}
	}

	onWindowResize() {
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
	}

	onMouseWheel(event) {
		const camera = this.camera;
		const fov = camera.fov + event.deltaY * 0.01;
		camera.fov = THREE.Math.clamp(fov, 30, 75);
		camera.updateProjectionMatrix();
	}

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

	render(delta) {
		/*
		if (!this.dragListener.dragging) {
			this.tourRotation.y += this.tourSpeedRotation.y;
			this.tourSpeedRotation.y += (0.002 - this.tourSpeedRotation.y) / 50;
		}
		this.tour.rotation.copy(this.tourRotation).add(this.tourDragRotation);
		*/
		/*
		this.points.geometry.vertices.forEach((vertex, i) => {
			const local = this.tour.localToWorld(vertex.clone());
			const distance = local.distanceTo(this.pointRef);
			const s = Math.max(0, Math.min(1, (1 - distance))) * 5;
			this.points.geometry.colors[i] = new THREE.Color(s, s, s);
			this.points.geometry.colorsNeedUpdate = true;
		});
		*/
		this.updateCamera();
		this.renderer.render(this.scene, this.camera);
		this.doParallax();
	}

	updateCamera() {
		const camera = this.camera;
		const direction = this.direction;
		const inertia = this.inertia;
		let speed = this.speed;
		let latitude = this.latitude;
		let longitude = this.longitude;
		if (this.dragListener.dragging === false) {
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

	play() {
		const clock = new THREE.Clock();
		const loop = (time) => {
			const delta = clock.getDelta();
			this.render(delta);
			window.requestAnimationFrame(loop);
		};
		loop();
	}

	animate() {
		this.renderer.setAnimationLoop(() => {
			this.render();
		});
	}

}

var tour = new VRTour();

window.onload = () => {
	tour.load('data/vr.json');
	setTimeout(() => {
		console.log(tour.tour);
		tour.enter();
	}, 1000);
};
