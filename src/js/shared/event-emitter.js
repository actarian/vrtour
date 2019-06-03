/* jshint esversion: 6 */
/* global window, document */

export default class EventEmitter {

	constructor() {
		this.events = {};
	}

	addListener(eventName, fn) {
		if (!this.events[eventName]) {
			this.events[eventName] = [];
		}
		this.events[eventName].push(fn);
		return () => {
			this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
		}
	}

	emit(eventName, data) {
		const event = this.events[eventName];
		if (event) {
			event.forEach(callback => {
				callback.call(null, data);
			});
		}
	}

}
