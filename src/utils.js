'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var getScrollElement = exports.getScrollElement = function getScrollElement(el) {
	var coordinate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'y';

	coordinate = coordinate.toUpperCase();
	var parent = el.parentNode;
	var attr = 'overflow' + coordinate;
	var value = void 0;
	while (parent.tagName !== 'HTML' && parent.tagName !== 'body' && parent.nodeType === 1) {
		value = getStyle(parent, attr);
		if (value === 'auto' || value === 'scroll') {
			return parent;
		}
		parent = parent.parentNode;
	}
	return window;
};

var getStyle = exports.getStyle = function getStyle(el, attr) {
	return window.getComputedStyle(el, null)[attr];
};