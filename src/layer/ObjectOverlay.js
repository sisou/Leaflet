/*
 * @class ObjectOverlay
 * @aka L.ObjectOverlay
 * @inherits Interactive layer
 *
 * Used to load and display a single image over specific bounds of the map. Extends `Layer`.
 *
 * @example
 *
 * ```js
 * var imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
 * 	imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
 * L.objectOverlay(imageUrl, imageBounds).addTo(map);
 * ```
 */

L.ObjectOverlay = L.Layer.extend({

	// @section
	// @aka ObjectOverlay options
	options: {
		// @option opacity: Number = 1.0
		// The opacity of the image overlay.
		opacity: 1,

		// @option alt: String = ''
		// Text for the `alt` attribute of the image (useful for accessibility).
		alt: '',

		// @option interactive: Boolean = false
		// If `true`, the image overlay will emit [mouse events](#interactive-layer) when clicked or hovered.
		interactive: false,

		// @option attribution: String = null
		// An optional string containing HTML to be shown on the `Attribution control`
		attribution: null,

		// @option crossOrigin: Boolean = false
		// If true, the image will have its crossOrigin attribute set to ''. This is needed if you want to access image pixel data.
		crossOrigin: false,

		// @option type: String = 'image/svg+xml'
		// The mimetype of the object data
		type: 'image/svg+xml'
	},

	initialize: function (url, bounds, options) { // (String, LatLngBounds, Object)
		this._url = url;
		this._bounds = L.latLngBounds(bounds);

		L.setOptions(this, options);
	},

	onAdd: function () {
		if (!this._object) {
			this._initObject();

			if (this.options.opacity < 1) {
				this._updateOpacity();
			}
		}

		if (this.options.interactive) {
			L.DomUtil.addClass(this._object, 'leaflet-interactive');
			this.addInteractiveTarget(this._object);
		}

		this.getPane().appendChild(this._object);
		this._reset();
	},

	onRemove: function () {
		L.DomUtil.remove(this._object);
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._object);
		}
	},

	// @method setOpacity(opacity: Number): this
	// Sets the opacity of the overlay.
	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._object) {
			this._updateOpacity();
		}
		return this;
	},

	setStyle: function (styleOpts) {
		if (styleOpts.opacity) {
			this.setOpacity(styleOpts.opacity);
		}
		return this;
	},

	// @method bringToFront(): this
	// Brings the layer to the top of all overlays.
	bringToFront: function () {
		if (this._map) {
			L.DomUtil.toFront(this._object);
		}
		return this;
	},

	// @method bringToBack(): this
	// Brings the layer to the bottom of all overlays.
	bringToBack: function () {
		if (this._map) {
			L.DomUtil.toBack(this._object);
		}
		return this;
	},

	// @method setUrl(url: String): this
	// Changes the URL of the image.
	setUrl: function (url) {
		this._url = url;

		if (this._object) {
			this._object.data = url;
		}
		return this;
	},

	setBounds: function (bounds) {
		this._bounds = bounds;

		if (this._map) {
			this._reset();
		}
		return this;
	},

	getAttribution: function () {
		return this.options.attribution;
	},

	getEvents: function () {
		var events = {
			zoom: this._reset,
			viewreset: this._reset
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	getBounds: function () {
		return this._bounds;
	},

	getElement: function () {
		return this._object;
	},

	_initObject: function () {
		var obj = this._object = L.DomUtil.create('object',
				'leaflet-object-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''));

		obj.onselectstart = L.Util.falseFn;
		obj.onmousemove = L.Util.falseFn;

		obj.onload = L.bind(this.fire, this, 'load');

		if (this.options.crossOrigin) {
			obj.crossOrigin = '';
		}

		obj.data = this._url;
		obj.type = this.options.type;
		obj.alt = this.options.alt;
	},

	_animateZoom: function (e) {
		var scale = this._map.getZoomScale(e.zoom),
		    offset = this._map._latLngToNewLayerPoint(this._bounds.getNorthWest(), e.zoom, e.center);

		L.DomUtil.setTransform(this._object, offset, scale);
	},

	_reset: function () {
		var object = this._object,
		    bounds = new L.Bounds(
		        this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
		        this._map.latLngToLayerPoint(this._bounds.getSouthEast())),
		    size = bounds.getSize();

		L.DomUtil.setPosition(object, bounds.min);

		// The order of these statements is important!
		// If the width is set first, the object does not recalculate the position of the contained SVG
		object.style.height = size.y + 'px';
		object.style.width  = size.x + 'px';
	},

	_updateOpacity: function () {
		L.DomUtil.setOpacity(this._object, this.options.opacity);
	}
});

// @factory L.objectOverlay(imageUrl: String, bounds: LatLngBounds, options?: ObjectOverlay options)
// Instantiates an image overlay object given the URL of the image and the
// geographical bounds it is tied to.
L.objectOverlay = function (url, bounds, options) {
	return new L.ObjectOverlay(url, bounds, options);
};
