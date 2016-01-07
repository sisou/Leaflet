/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

L.Marker = L.Layer.extend({

	options: {
		pane: 'markerPane',
		nonBubblingEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

		icon: new L.Icon.Default(),
		// title: '',
		// alt: '',
		interactive: true,
		// draggable: false,
		keyboard: true,
		zIndexOffset: 0,
		opacity: 1,
		// riseOnHover: false,
		riseOffset: 250
	},

	initialize: function (latlng, options) {
		console.log('marker initialize');

		L.setOptions(this, options);
		this._latlng = L.latLng(latlng);
	},

	onAdd: function (map) {
		console.log('marker onadd');

		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;

		this._initIcon();
		this.update();
	},

	onRemove: function () {
		console.log('marker onremove');

		if (this.dragging && this.dragging.enabled()) {
			this.options.draggable = true;
			this.dragging.removeHooks();
		}

		this._removeIcon();
		this._removeShadow();
	},

	getEvents: function () {
		console.log('marker getevents');

		var events = {
			zoom: this.update,
			viewreset: this.update
		};

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom;
		}

		return events;
	},

	getLatLng: function () {
		console.log('marker getlatlng');

		return this._latlng;
	},

	setLatLng: function (latlng) {
		console.log('marker setlatlng');

		var oldLatLng = this._latlng;
		this._latlng = L.latLng(latlng);
		this.update();
		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng});
	},

	setZIndexOffset: function (offset) {
		console.log('marker setzindexoffset');

		this.options.zIndexOffset = offset;
		return this.update();
	},

	setIcon: function (icon) {
		console.log('marker seticon');


		this.options.icon = icon;

		if (this._map) {
            console.log('marker seticon this._map');

			this._initIcon();
			this.update();
		}

		if (this._popup) {
            console.log('marker seticon this._popup');

			this.bindPopup(this._popup, this._popup.options);
		}

		return this;
	},

	getElement: function () {
		console.log('marker getelement');

		return this._icon;
	},

	update: function () {
		console.log('marker update');


		if (this._icon) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round();
			this._setPos(pos);
		}

		return this;
	},

	_initIcon: function () {
		console.log('marker _initicon');

		var options = this.options,
		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide');

		var icon = options.icon.createIcon(this._icon),
		    addIcon = false;

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
            console.log('marker _initicon icon !== this._icon');

			if (this._icon) {
				this._removeIcon();
			}
			addIcon = true;
			console.log(addIcon);

			if (options.title) {
                console.log('marker _initicon icon !== this._icon options.title');
				icon.title = options.title;
			}
			if (options.alt) {
                console.log('marker _initicon icon !== this._icon options.title');
				icon.alt = options.alt;
			}
		}

		L.DomUtil.addClass(icon, classToAdd);

		if (options.keyboard) {
			icon.tabIndex = '0';
		}

		this._icon = icon;

		if (options.riseOnHover) {
            console.log('marker _initicon options.riseOnHover');

			this.on({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			});
		}

		var newShadow = options.icon.createShadow(this._shadow),
		    addShadow = false;

		if (newShadow !== this._shadow) {
			this._removeShadow();
			addShadow = true;
		}

		if (newShadow) {
			L.DomUtil.addClass(newShadow, classToAdd);
		}
		this._shadow = newShadow;


		if (options.opacity < 1) {
			this._updateOpacity();
		}


		if (addIcon) {
			console.log('marker _initicon addIcon');
			this.getPane().appendChild(this._icon);
		}
		this._initInteraction();
		if (newShadow && addShadow) {
			this.getPane('shadowPane').appendChild(this._shadow);
		}
	},

	_removeIcon: function () {
		console.log('marker _removeicon');

		if (this.options.riseOnHover) {
			this.off({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			});
		}

		L.DomUtil.remove(this._icon);
		this.removeInteractiveTarget(this._icon);

		this._icon = null;
	},

	_removeShadow: function () {
		console.log('marker _removeshadow');

		if (this._shadow) {
			L.DomUtil.remove(this._shadow);
		}
		this._shadow = null;
	},

	_setPos: function (pos) {
		console.log('marker _setpos');

		L.DomUtil.setPosition(this._icon, pos);

		if (this._shadow) {
			L.DomUtil.setPosition(this._shadow, pos);
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	},

	_updateZIndex: function (offset) {
		console.log('marker _updatezindex');

		this._icon.style.zIndex = this._zIndex + offset;
	},

	_animateZoom: function (opt) {
		console.log('marker _animatezoom');

		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPos(pos);
	},

	_initInteraction: function () {
		console.log('marker _initinteraction');

		if (!this.options.interactive) { return; }

		L.DomUtil.addClass(this._icon, 'leaflet-interactive');

		this.addInteractiveTarget(this._icon);

		if (L.Handler.MarkerDrag) {
			var draggable = this.options.draggable;
			if (this.dragging) {
				draggable = this.dragging.enabled();
				this.dragging.disable();
			}

			this.dragging = new L.Handler.MarkerDrag(this);

			if (draggable) {
				this.dragging.enable();
			}
		}
	},

	setOpacity: function (opacity) {
		console.log('marker setopacity');


		this.options.opacity = opacity;
		if (this._map) {
			this._updateOpacity();
		}

		return this;
	},

	_updateOpacity: function () {
		console.log('marker _updateopacity');

		var opacity = this.options.opacity;

		L.DomUtil.setOpacity(this._icon, opacity);

		if (this._shadow) {
			L.DomUtil.setOpacity(this._shadow, opacity);
		}
	},

	_bringToFront: function () {
		console.log('marker _bringToFront');

		this._updateZIndex(this.options.riseOffset);
	},

	_resetZIndex: function () {
		console.log('marker _resetZIndex');

		this._updateZIndex(0);
	}
});

L.marker = function (latlng, options) {
	return new L.Marker(latlng, options);
};
