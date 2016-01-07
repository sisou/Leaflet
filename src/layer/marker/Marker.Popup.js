/*
 * Popup extension to L.Marker, adding popup-related methods.
 */

L.Marker.include({
	_getPopupAnchor: function () {
		console.log('markerpopup _getPopupanchor');
		return this.options.icon.options.popupAnchor || [0, 0];
	}
});
