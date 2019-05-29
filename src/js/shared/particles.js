/* jshint esversion: 6 */

export function addParticles(parent) {
	const cities = [
		[43.9096538, 12.8399805], // pesaro
		[41.8519772, 12.2347364], // rome
		[51.5287718, -0.2416791], // london
		[55.6713812, 12.4537393], // copenaghen
		[40.6976637, -74.1197623], // new york
		[19.3911668, -99.4238221], // mexico city
		[39.9390731, 116.11726], // beijing
		[31.2243084, 120.9162376], // shangai
	];
	const texture = new THREE.CanvasTexture(createSprite());
	const geometry = new THREE.Geometry();
	const material = new THREE.PointsMaterial({
		size: 0.07,
		map: texture,
		vertexColors: THREE.VertexColors,
		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true
	});
	const particles = new THREE.Points(geometry, material);
	const points = cities.map((x) => {
		return calcPosFromLatLonRad(x[0], x[1], 0.5);
	}).forEach((point, i) => {
		const vertex = new THREE.Vector3();
		vertex.x = point.x;
		vertex.y = point.y;
		vertex.z = point.z;
		geometry.vertices.push(vertex);
		geometry.colors.push(new THREE.Color(0, 0, 0));
	});
	geometry.mergeVertices();
	geometry.verticesNeedUpdate = true;
	particles.geometry = geometry;
	parent.add(particles);
	return particles;
}

function createSprite() {
	const canvas = document.createElement('canvas');
	canvas.width = 128;
	canvas.height = 128;
	const ctx = canvas.getContext('2d');
	const gradient = ctx.createRadialGradient(
		canvas.width / 2,
		canvas.height / 2,
		0,
		canvas.width / 2,
		canvas.height / 2,
		canvas.width / 2
	);
	gradient.addColorStop(0, 'rgba(255,255,255,1)');
	gradient.addColorStop(0.2, 'rgba(255,255,255,1)');
	gradient.addColorStop(0.22, 'rgba(255,255,255,.2)');
	gradient.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	return canvas;
}

function calcPosFromLatLonRad(lat, lon, radius) {
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lon + 180) * (Math.PI / 180);
	const x = -((radius) * Math.sin(phi) * Math.cos(theta));
	const z = ((radius) * Math.sin(phi) * Math.sin(theta));
	const y = ((radius) * Math.cos(phi));
	return new THREE.Vector3(x, y, z);
}
