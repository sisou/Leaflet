/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */

L.Handler.MarkerDrag = L.Handler.extend({
	initialize: function (marker) {
		console.log('MarkerDrag initialize');
		this._marker = marker;
	},

	addHooks: function () {
		console.log('MarkerDrag addHooks');

		var icon = this._marker._icon;

		if (!this._draggable) {
			this._draggable = new L.Draggable(icon, icon, true);
		}

		this._draggable.on({
			dragstart: this._onDragStart,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).enable();

		L.DomUtil.addClass(icon, 'leaflet-marker-draggable');
	},

	removeHooks: function () {
		console.log('MarkerDrag removeHooks');

		this._draggable.off({
			dragstart: this._onDragStart,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).disable();

		if (this._marker._icon) {
			L.DomUtil.removeClass(this._marker._icon, 'leaflet-marker-draggable');
		}
	},

	moved: function () {
		console.log('MarkerDrag moved');

		return this._draggable && this._draggable._moved;
	},

	_onDragStart: function () {
		console.log('MarkerDrag _onDragStart');

		this._marker
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart');
	},

	_onDrag: function (e) {
		console.log('MarkerDrag _onDrag');

		var marker = this._marker,
		    shadow = marker._shadow,
		    iconPos = L.DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos);

		// update shadow position
		if (shadow) {
			L.DomUtil.setPosition(shadow, iconPos);
		}

		marker._latlng = latlng;
		e.latlng = latlng;

		marker
		    .fire('move', e)
		    .fire('drag', e);
	},

	_onDragEnd: function (e) {
		console.log('MarkerDrag _onDragEnd');

		this._marker
		    .fire('moveend')
		    .fire('dragend', e);
	}
});
