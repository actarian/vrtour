(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = _interopRequireDefault(require("./utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Dom =
/*#__PURE__*/
function () {
  function Dom() {
    _classCallCheck(this, Dom);
  }

  _createClass(Dom, null, [{
    key: "detect",
    value: function detect(node) {
      var userAgent = navigator.userAgent.toLowerCase();
      var explorer = userAgent.indexOf('msie') > -1;
      var firefox = userAgent.indexOf('firefox') > -1;
      var opera = userAgent.toLowerCase().indexOf('op') > -1;
      var chrome = userAgent.indexOf('chrome') > -1;
      var safari = userAgent.indexOf('safari') > -1;

      if (chrome && safari) {
        safari = false;
      }

      if (chrome && opera) {
        chrome = false;
      }

      var android = userAgent.match(/android/i);
      var blackberry = userAgent.match(/blackberry/i);
      var ios = userAgent.match(/iphone|ipad|ipod/i);
      var operamini = userAgent.match(/opera mini/i);
      var iemobile = userAgent.match(/iemobile/i) || navigator.userAgent.match(/wpdesktop/i);
      var mobile = android || blackberry || ios || operamini || iemobile;
      var overscroll = navigator.platform === 'MacIntel' && typeof navigator.getBattery === 'function';
      var classList = {
        chrome: chrome,
        explorer: explorer,
        firefox: firefox,
        safari: safari,
        opera: opera,
        android: android,
        blackberry: blackberry,
        ios: ios,
        operamini: operamini,
        iemobile: iemobile,
        mobile: mobile,
        overscroll: overscroll
      };
      Object.assign(Dom, classList);
      Object.keys(classList).forEach(function (x) {
        if (classList[x]) {
          node.classList.add(x);
        }
      });

      var onTouchStart = function onTouchStart() {
        document.removeEventListener('touchstart', onTouchStart);
        Dom.touch = true;
        node.classList.add('touch');
      };

      document.addEventListener('touchstart', onTouchStart);

      var onMouseDown = function onMouseDown() {
        document.removeEventListener('mousedown', onMouseDown);
        Dom.mouse = true;
        node.classList.add('mouse');
      };

      document.addEventListener('mousedown', onMouseDown);

      var onScroll = function onScroll() {
        var now = _utils.default.now();

        if (Dom.lastScrollTime) {
          var diff = now - Dom.lastScrollTime;

          if (diff < 5) {
            document.removeEventListener('scroll', onScroll);
            Dom.fastscroll = true;
            node.classList.add('fastscroll');
            console.log('scroll', diff);
          }
        }

        Dom.lastScrollTime = now;
      };

      document.addEventListener('scroll', onScroll);
    }
  }, {
    key: "fragmentFirstElement",
    value: function fragmentFirstElement(fragment) {
      return Array.prototype.slice.call(fragment.children).find(function (x) {
        return x.nodeType === Node.ELEMENT_NODE;
      });
    }
  }, {
    key: "fragmentFromHTML",
    value: function fragmentFromHTML(html) {
      return document.createRange().createContextualFragment(html);
    }
  }, {
    key: "scrollTop",
    value: function scrollTop() {
      return document && document.defaultView ? document.defaultView.pageYOffset : 0;
    }
  }]);

  return Dom;
}();

exports.default = Dom;

},{"./utils":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* jshint esversion: 6 */

/* global window, document, TweenMax, ThreeJs */
var DragListener =
/*#__PURE__*/
function () {
  function DragListener(target, downCallback, moveCallback, upCallback) {
    _classCallCheck(this, DragListener);

    this.target = target || document;

    this.downCallback = downCallback || function (e) {
      console.log('DragListener.downCallback not setted', e);
    };

    this.moveCallback = moveCallback || function (e) {
      console.log('DragListener.moveCallback not setted', e);
    };

    this.upCallback = upCallback || function (e) {
      console.log('DragListener.upCallback not setted', e);
    };

    this.dragging = false;
    this.init();
  }

  _createClass(DragListener, [{
    key: "init",
    value: function init() {
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.target.addEventListener('mousedown', this.onMouseDown, false);
      this.target.addEventListener('touchstart', this.onTouchStart, false);
    }
  }, {
    key: "onDown",
    value: function onDown(down) {
      this.down = down; // this.position ? { x: down.x - this.position.x, y: down.y - this.position.y } : down;

      this.strength = {
        x: 0,
        y: 0
      };
      this.distance = this.distance || {
        x: 0,
        y: 0
      };
      this.speed = {
        x: 0,
        y: 0
      };
      this.downCallback(this);
    }
  }, {
    key: "onDrag",
    value: function onDrag(position) {
      this.dragging = true;
      var target = this.target;
      var distance = {
        x: position.x - this.down.x,
        y: position.y - this.down.y
      };
      var strength = {
        x: distance.x / window.innerWidth * 2,
        y: distance.y / window.innerHeight * 2
      };
      var speed = {
        x: this.speed.x + (strength.x - this.strength.x) * 0.1,
        y: this.speed.y + (strength.y - this.strength.y) * 0.1
      };
      this.position = position;
      this.distance = distance;
      this.strength = strength;
      this.speed = speed;
      this.moveCallback({
        position: position,
        distance: distance,
        strength: strength,
        speed: speed,
        target: target
      });
    }
  }, {
    key: "onUp",
    value: function onUp() {
      this.dragging = false;
      this.upCallback(this);
    }
  }, {
    key: "onMouseDown",
    value: function onMouseDown(e) {
      this.target.removeEventListener('touchstart', this.onTouchStart);
      this.onDown({
        x: e.clientX,
        y: e.clientY
      });
      this.addMouseListeners();
    }
  }, {
    key: "onMouseMove",
    value: function onMouseMove(e) {
      this.onDrag({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, {
    key: "onMouseUp",
    value: function onMouseUp(e) {
      this.removeMouseListeners();
      this.onDrag({
        x: e.clientX,
        y: e.clientY
      });
      this.onUp();
    }
  }, {
    key: "onTouchStart",
    value: function onTouchStart(e) {
      this.target.removeEventListener('mousedown', this.onMouseDown);

      if (e.touches.length > 1) {
        e.preventDefault();
        this.onDown({
          x: e.touches[0].pageX,
          y: e.touches[0].pageY
        });
        this.addTouchListeners();
      }
    }
  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
      if (e.touches.length > 0) {
        e.preventDefault();
        this.onDrag({
          x: e.touches[0].pageX,
          y: e.touches[0].pageY
        });
      }
    }
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
      this.removeTouchListeners();
      this.onDrag(this.position);
      this.onUp();
    }
  }, {
    key: "addMouseListeners",
    value: function addMouseListeners() {
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('mouseup', this.onMouseUp, false);
    }
  }, {
    key: "addTouchListeners",
    value: function addTouchListeners() {
      document.addEventListener('touchend', this.onTouchEnd, false);
      document.addEventListener('touchmove', this.onTouchMove, false);
    }
  }, {
    key: "removeMouseListeners",
    value: function removeMouseListeners() {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }, {
    key: "removeTouchListeners",
    value: function removeTouchListeners() {
      document.removeEventListener('touchend', this.onTouchEnd);
      document.removeEventListener('touchmove', this.onTouchMove);
    }
  }]);

  return DragListener;
}();

exports.default = DragListener;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* jshint esversion: 6 */

/* global window, document */
var Utils =
/*#__PURE__*/
function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: "now",
    value: function now() {
      return Date.now ? Date.now() : new Date().getTime();
    }
  }, {
    key: "performanceNow",
    value: function performanceNow() {
      return performance ? performance.timing.navigationStart + performance.now() : Utils.now();
    }
  }, {
    key: "throttle",
    value: function throttle(callback, wait, options) {
      var context = null,
          result = null,
          args = null,
          timeout = null;
      var previous = 0;

      if (!options) {
        options = {};
      }

      var later = function later() {
        previous = options.leading === false ? 0 : Utils.now();
        timeout = null;
        result = callback.apply(context, args);

        if (!timeout) {
          context = args = null;
        }
      };

      return function () {
        context = this;
        args = arguments;
        var now = Utils.now();

        if (!previous && options.leading === false) {
          previous = now;
        }

        var remaining = wait - (now - previous);

        if (remaining <= 0 || remaining > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }

          previous = now;
          result = callback.apply(context, args);

          if (!timeout) {
            context = args = null;
          }
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }

        return result;
      };
    }
  }, {
    key: "debounce",
    value: function debounce(callback) {
      var _this = this,
          _arguments = arguments;

      var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
      var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var timeout;
      return function () {
        var context = _this,
            args = _arguments;

        var later = function later() {
          timeout = null;

          if (!immediate) {
            callback.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;

        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);

        if (callNow) {
          callback.apply(context, args);
        }
      };
    }
  }]);

  return Utils;
}();

exports.default = Utils;

},{}],4:[function(require,module,exports){
"use strict";

var _dom = _interopRequireDefault(require("./shared/dom"));

var _drag = _interopRequireDefault(require("./shared/drag.listener"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

THREE.Euler.prototype.add = function (euler) {
  this.set(this.x + euler.x, this.y + euler.y, this.z + euler.z, this.order);
  return this;
};

var USE_ORTHO = false;
var SHOW_HELPERS = false;

var VRTour =
/*#__PURE__*/
function () {
  function VRTour() {
    _classCallCheck(this, VRTour);

    this.mouse = {
      x: 0,
      y: 0
    };
    this.parallax = {
      x: 0,
      y: 0
    };
    this.size = {
      width: 0,
      height: 0,
      aspect: 0
    };
    this.isUserInteracting = false;
    this.lon = 0;
    this.lat = 0;
    this.phi = 0;
    this.theta = 0;
    this.direction = 1;
    this.speed = 1;
  }

  _createClass(VRTour, [{
    key: "init",
    value: function init() {
      var _this = this;

      var body = document.querySelector('body');
      var section = document.querySelector('.vrtour');
      var container = section.querySelector('.vrtour__container'); // const shadow = section.querySelector('.vrtour__shadow');

      var title = section.querySelector('.vrtour__headline .title');
      var abstract = section.querySelector('.vrtour__headline .abstract');

      _dom.default.detect(body);

      body.classList.add('ready');
      var tourTextureSrc = container.getAttribute('texture');
      var loader = new THREE.TextureLoader();
      loader.crossOrigin = '';
      loader.load(tourTextureSrc, function (texture) {
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(2, 2);
        _this.tourTexture = texture;

        _this.createScene();
      });
      this.body = body;
      this.section = section;
      this.container = container; // this.shadow = shadow;

      this.title = title;
      this.abstract = abstract;
      this.loader = loader;
    }
  }, {
    key: "createScene",
    value: function createScene() {
      var _this2 = this;

      var renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      renderer.shadowMap.enabled = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer = renderer; // container.innerHTML = '';

      this.container.appendChild(renderer.domElement);
      var scene = new THREE.Scene();
      this.scene = scene;
      /*
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.1); // new THREE.Fog(0x000000, 0, 10);
      this.scene = scene;
      */

      var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1100); // camera.position.set(0, 0, 0);

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
      		texture: { value: new THREE.TextureLoader().load("textures/sprites/disc.png") }
      	},
      	vertexShader: document.getElementById('vertexshader').textContent,
      	fragmentShader: document.getElementById('fragmentshader').textContent,
      	alphaTest: 0.9
      });
      // const particles = new THREE.Points(geometry, material);
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
      	map: THREE.ImageUtils.loadTexture("http://matthewachase.com/tru-dat-boo.png"),
      	blending: THREE.AdditiveBlending,
      	transparent: true,
      	depthTest: false
            });
            const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      this.particles = particles;
            */
      // const PARTICLE_SIZE = 20;

      var raycaster = new THREE.Raycaster();
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

      var rotation = new THREE.Euler(0.0, 0.0, 0.0, 'XYZ');
      var environment = this.addEnvironment(scene, rotation, this.tourTexture);
      this.environment = environment;
      var pod = this.addPod(scene);
      this.pod = pod;
      var particles = this.addParticles(scene);
      this.particles = particles;
      /*
      const particleRef = new THREE.Vector3(0.0, 0.0, 1.0);
      this.particleRef = particleRef;
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
      const particles = addParticles(tour);
      this.particles = particles;
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

      var lon, lat;
      var dragListener = new _drag.default(this.container, function (event) {
        lon = _this2.lon;
        lat = _this2.lat;
      }, function (event) {
        _this2.lon = -event.distance.x * 0.1 + lon;
        _this2.lat = event.distance.y * 0.1 + lat;
        _this2.direction = event.distance.x ? event.distance.x / Math.abs(event.distance.x) * -1 : 1;
        console.log('lon', _this2.lon, 'lat', _this2.lat, 'direction', _this2.direction);
      }, function (event) {
        _this2.speed = Math.abs(event.strength.x) * 100;
        console.log('speed', _this2.speed);
      });
      this.dragListener = dragListener;
      this.onWindowResize = this.onWindowResize.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseWheel = this.onMouseWheel.bind(this);
      this.onClick = this.onClick.bind(this);
      window.addEventListener('resize', this.onWindowResize, false);
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('wheel', this.onMouseWheel, false);
      this.container.addEventListener('click', this.onClick, false);
      this.section.classList.add('init');
      this.play();
      this.onWindowResize();
    }
  }, {
    key: "addEnvironment",
    value: function addEnvironment(parent, rotation, texture) {
      var group = new THREE.Group(); //

      var geometry = new THREE.SphereBufferGeometry(500, 60, 40); // invert the geometry on the x-axis so that all of the faces point inward

      geometry.scale(-1, 1, 1);
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        // transparent: true,
        // opacity: 1.0,
        depthTest: false
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

      var sphere = new THREE.Mesh(geometry, material); // sphere.castShadow = false;
      // sphere.receiveShadow = true;

      group.add(sphere);
      group.sphere = sphere; //

      group.rotation.set(rotation.x, rotation.y, rotation.z);
      parent.add(group);
      return group;
    }
  }, {
    key: "addPod",
    value: function addPod(parent) {
      var geometry = new THREE.PlaneGeometry(300, 300, 3, 3);
      var textureLoader = new THREE.TextureLoader();
      var texture = textureLoader.load('img/pod.jpg');
      var textureAlpha = textureLoader.load('img/pod-alpha.jpg'); // assuming you want the texture to repeat in both directions:
      // texture.wrapS = THREE.RepeatWrapping;
      // texture.wrapT = THREE.RepeatWrapping;
      // how many times to repeat in each direction; the default is (1,1),
      // which is probably why your example wasn't working
      // texture.repeat.set( 4, 4 );

      var material = new THREE.MeshBasicMaterial({
        map: texture,
        alphaMap: textureAlpha,
        // blending: THREE.AdditiveBlending,
        // depthTest: true,
        transparent: true
      });
      var mesh = new THREE.Mesh(geometry, material); // mesh.material.side = THREE.DoubleSide;
      // mesh.position.x = 0;

      mesh.position.y = -300; // rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
      // Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.

      mesh.rotation.x = -Math.PI / 2;
      parent.add(mesh);
      return mesh;
    }
  }, {
    key: "addParticles",
    value: function addParticles(parent) {
      var geometry = new THREE.BufferGeometry();
      var vertices = [];
      var textureLoader = new THREE.TextureLoader();
      var sprite1 = textureLoader.load('img/pin.png'); // hack fix

      vertices.push(0, -10000, 0);
      vertices.push(0, 10000, 0); // hack fix

      geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      var material = new THREE.PointsMaterial({
        size: 20,
        map: sprite1,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: false
      }); // materials[i].color.setHSL(1, 0, 0);

      var particles = new THREE.Points(geometry, material);
      parent.add(particles);
      particles.vertices = vertices;
      return particles;
    }
  }, {
    key: "enter",
    value: function enter() {// this.tourCubesAppearAnimation();
    }
  }, {
    key: "tourCubesAppearAnimation",
    value: function tourCubesAppearAnimation(factor, duration, delay) {
      var _this3 = this;

      var cubes = this.tour.cubes;
      factor = factor || 1.5;
      duration = duration || 1.4;
      delay = delay || 0.01;
      cubes.forEach(function (cube, i) {
        var position = cube.position_;
        cube.position.set(position.x * factor, position.y * factor, position.z * factor);
        TweenMax.to(cube.position, duration, {
          x: position.x,
          y: position.y,
          z: position.z,
          delay: i * delay,
          ease: Elastic.easeOut
        });
        TweenMax.to(cube.material, duration * 0.2, {
          opacity: 1,
          delay: i * delay,
          ease: Sine.easeInOut
        });
      });
      setTimeout(function () {
        _this3.randomRotateVRTourRows(_this3.tour.rows);

        TweenMax.set(_this3.title, {
          transform: 'translate3d(0,80px,0)'
        });
        TweenMax.to(_this3.title, 0.4, {
          transform: 'translate3d(0,0,0)',
          opacity: 1,
          delay: 1,
          ease: Sine.easeInOut
        });
        TweenMax.set(_this3.abstract, {
          transform: 'translate3d(0,80px,0)'
        });
        TweenMax.to(_this3.abstract, 0.4, {
          transform: 'translate3d(0,0,0)',
          opacity: 1,
          delay: 1.2,
          ease: Sine.easeInOut
        });
      }, delay * cubes.length + duration);
    }
  }, {
    key: "tourCubesWaveAnimation",
    value: function tourCubesWaveAnimation(cubes, factor, duration, delay) {
      factor = factor || 1.5;
      duration = duration || 1.4;
      delay = delay || 0.01;
      cubes.forEach(function (cube, i) {
        var position = cube.position_;
        TweenMax.to(cube.position, 0.3, {
          x: position.x * factor,
          y: position.y * factor,
          z: position.z * factor,
          delay: i * delay,
          ease: Sine.easeOut,
          onComplete: function onComplete() {
            TweenMax.to(cube.position, duration, {
              x: position.x,
              y: position.y,
              z: position.z,
              ease: Elastic.easeOut
            });
          }
        });
      });
    }
  }, {
    key: "randomRotateVRTourRows",
    value: function randomRotateVRTourRows(rows) {
      var _this4 = this;

      // console.log(rows);
      var dir = Math.random() > 0.5 ? 1 : -1;
      var row = rows[Math.floor(Math.random() * rows.length)];
      var rotation = row.rotation;
      TweenMax.to(rotation, 0.5, {
        y: rotation.y + dir * Math.PI / 2,
        delay: 1,
        ease: Sine.easeInOut,
        onComplete: function onComplete() {
          _this4.randomRotateVRTourRows(rows);
        }
      });
    }
  }, {
    key: "onMouseMove",
    value: function onMouseMove(event) {
      var w2 = this.container.offsetWidth / 2;
      var h2 = this.container.offsetHeight / 2;
      this.mouse = {
        x: (event.clientX - w2) / w2,
        y: -(event.clientY - h2) / h2
      }; // console.log('onMouseMove', this.mouse);

      /*
      var attributes = geometry.attributes;
      raycaster.setFromCamera( mouse, camera );
      intersects = raycaster.intersectObject( particles );
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
  }, {
    key: "onClick",
    value: function onClick(event) {
      var _this5 = this;

      if (!event.shiftKey) {
        return;
      } // this.tourCubesWaveAnimation(this.tour.cubes);


      var raycaster = this.raycaster; // update the picking ray with the camera and mouse position

      raycaster.setFromCamera(this.mouse, this.camera); // calculate objects intersecting the picking ray

      var intersections = raycaster.intersectObjects(this.environment.children);

      if (intersections) {
        intersections.forEach(function (intersection) {
          console.log(intersection);
          var particles = _this5.particles;
          console.log(_this5.particles);
          var geometry = particles.geometry;
          var p = intersection.point.clone(); // p.multiplyScalar(1);

          /*
          const positions = new Float32Array([...particles.geometry.attributes.position.array, p.x, p.y, p.z]);
          const attribute = new THREE.BufferAttribute(positions, 3);
          attribute.dynamic = true;
          geometry.addAttribute('position', attribute);
          positions.needsUpdate = true;
          particles.geometry.setDrawRange(0, positions.length);
          particles.geometry.verticesNeedUpdate = true;
          particles.geometry.elementsNeedUpdate = true;
          // particles.geometry.computeVertexNormals();
                      console.log(particles.geometry);
                      */

          particles.vertices.push(p.x, p.y, p.z);
          particles.vertices.needsUpdate = true;
          particles.geometry.addAttribute('position', new THREE.Float32BufferAttribute(particles.vertices, 3));
          /*
          geometry.vertices.push(p);
          // geometry.colors.push(new THREE.Color(Math.random(), Math.random(), Math.random()));
          geometry.verticesNeedUpdate = true;
          geometry.elementsNeedUpdate = true;
          geometry.computeVertexNormals();
          */
          // console.log(p);
        });
      }

      console.log(intersections);
      /*
      for (var i = 0; i < intersects.length; i++ ) {
      	console.log(intersections[i])
      	intersects[i].object.material.color.set( 0xff0000 );
      }
      */
    }
  }, {
    key: "onWindowResize",
    value: function onWindowResize() {
      var container = this.container,
          renderer = this.renderer,
          camera = this.camera;
      var size = this.size;
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
  }, {
    key: "onMouseWheel",
    value: function onMouseWheel(event) {
      var camera = this.camera;
      var fov = camera.fov + event.deltaY * 0.01;
      camera.fov = THREE.Math.clamp(fov, 30, 75);
      camera.updateProjectionMatrix();
    }
  }, {
    key: "doParallax",
    value: function doParallax() {
      // parallax
      var parallax = this.parallax;
      parallax.x += (this.mouse.x - parallax.x) / 8;
      parallax.y += (this.mouse.y - parallax.y) / 8; // this.light1.position.set(parallax.x * 5.0, 6.0 + parallax.y * 2.0, 4.0);
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
  }, {
    key: "render",
    value: function render(delta) {
      /*
      if (!this.dragListener.dragging) {
      	this.tourRotation.y += this.tourSpeedRotation.y;
      	this.tourSpeedRotation.y += (0.002 - this.tourSpeedRotation.y) / 50;
      }
      this.tour.rotation.copy(this.tourRotation).add(this.tourDragRotation);
      */

      /*
      this.particles.geometry.vertices.forEach((vertex, i) => {
      	const local = this.tour.localToWorld(vertex.clone());
      	const distance = local.distanceTo(this.particleRef);
      	const s = Math.max(0, Math.min(1, (1 - distance))) * 5;
      	this.particles.geometry.colors[i] = new THREE.Color(s, s, s);
      	this.particles.geometry.colorsNeedUpdate = true;
      });
      */
      this.updateCamera();
      this.renderer.render(this.scene, this.camera);
      this.doParallax();
    }
  }, {
    key: "updateCamera",
    value: function updateCamera() {
      var camera = this.camera;
      var direction = this.direction;
      var speed = this.speed;
      var lat = this.lat;
      var lon = this.lon;
      var phi = this.phi;
      var theta = this.theta;

      if (this.dragListener.dragging === false) {
        lon += 0.01 * direction * speed;
        speed = Math.max(1, speed * 0.98);
      }

      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.Math.degToRad(90 - lat);
      theta = THREE.Math.degToRad(lon);
      camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
      camera.target.y = 500 * Math.cos(phi);
      camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
      camera.lookAt(camera.target);
      this.lat = lat;
      this.lon = lon;
      this.phi = phi;
      this.theta = theta;
      this.speed = speed;
      /*
      // distortion
      camera.position.copy( camera.target ).negate();
      */
    }
  }, {
    key: "play",
    value: function play() {
      var _this6 = this;

      var clock = new THREE.Clock();

      var loop = function loop(time) {
        var delta = clock.getDelta();

        _this6.render(delta);

        window.requestAnimationFrame(loop);
      };

      loop();
    }
  }]);

  return VRTour;
}();

var tour = new VRTour();

window.onload = function () {
  tour.init();
  setTimeout(function () {
    console.log(tour.tour);
    tour.enter();
  }, 1000);
};

},{"./shared/dom":1,"./shared/drag.listener":2}]},{},[4]);
//# sourceMappingURL=vrtour.js.map
