/*
 * Leaflet.markercluster 1.4.1+master.37ab9a2,
 * Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
 * https://github.com/Leaflet/Leaflet.markercluster
 * (c) 2012-2017, Dave Leaver, smartrak
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
			(factory((global.Leaflet = global.Leaflet || {}, global.Leaflet.markercluster = global.Leaflet.markercluster || {})));
}(this, ((exports) => {
	'use strict';

	/*
	 * L.MarkerClusterGroup extends L.FeatureGroup by clustering the markers contained within
	 */

	const MarkerClusterGroup = L.MarkerClusterGroup = L.FeatureGroup.extend({

		options: {
			maxClusterRadius: 24, // A cluster will cover at most this many pixels from its center
			iconCreateFunction: null,
			clusterPane: L.Marker.prototype.options.pane,

			spiderfyOnEveryZoom: true,
			spiderfyOnMaxZoom: true,
			showCoverageOnHover: true,
			zoomToBoundsOnClick: false,
			singleMarkerMode: false,

			disableClusteringAtZoom: 1,

			// Setting this to false prevents the removal of any clusters outside of the viewpoint, which
			// is the default behaviour for performance reasons.
			removeOutsideVisibleBounds: true,

			// Set to false to disable all animations (zoom and spiderfy).
			// If false, option animateAddingMarkers below has no effect.
			// If L.DomUtil.TRANSITION is falsy, this option has no effect.
			animate: true,

			// Whether to animate adding markers after adding the MarkerClusterGroup to the map
			// If you are adding individual markers set to true, if adding bulk markers leave false for massive performance gains.
			animateAddingMarkers: false,

			// Increase to increase the distance away that spiderfied markers appear from the center
			spiderfyDistanceMultiplier: 1,

			// Make it possible to specify a polyline options on a spider leg
			spiderLegPolylineOptions: {
				weight: 1.5,
				color: '#222',
				opacity: 0.5
			},

			// When bulk adding layers, adds markers in chunks. Means addLayers may not add all the layers in the call, others will be loaded during setTimeouts
			chunkedLoading: true,
			chunkInterval: 200, // Process markers for a maximum of ~ n milliseconds (then trigger the chunkProgress callback)
			chunkDelay: 50, // At the end of each interval, give n milliseconds back to system/browser
			chunkProgress: null, // Progress callback: function(processed, total, elapsed) (e.g. for a progress indicator)

			// Options to pass to the L.Polygon constructor
			polygonOptions: {},

			spiderfyShapePositions (map, childMarkers, centerPt) {
				const distanceFromCenter = 35;
					const markerDistance = 45;
					const lineLength = markerDistance * (childMarkers.length - 1);
					const lineStart = centerPt.y - lineLength / 2;
					const res = [];
					let i;
				res.length = childMarkers.length;
				for (i = childMarkers.length - 1; i >= 0; i--) {
					const childCenter = map.latLngToLayerPoint(childMarkers[i]._latlng);
					res[i] = new L.Point(childCenter.x, childCenter.y);
				}

				return res;
			},

			iconCreateFunction (cluster) {
				const childMarkers = cluster.getAllChildMarkers();
				const icon_src = childMarkers[0].options.icon.options.iconUrl;
				const childClassNameTemp = childMarkers[0].options.icon.options.className.split("_");
				const childClassName = childClassNameTemp[0].split("-");
				let doneNum = 0;
				for (let i = 0; i < cluster.getChildCount(); i++) {
					const key = childClassName[1] + "_" + childMarkers[i].feature.id;
					if (localStorage.getItem(key)) {
						doneNum++;
					}
				}

				const childCount = cluster.getChildCount();
				const svgTipFill = (doneNum / childCount == 1) ? "00EBF4" : "E6E6E6";
				const doneIcon = (doneNum / childCount == 1) ? "_done" : "";
				const suffix = (childClassName[1] == 1 || childClassName[1] == 2 || childClassName[1] == 26 || childClassName[1] == 27 || childClassName[1] == 111 || childClassName[1] == 150 || childClassName[1] == 271 || childClassName[1] == 198 || childClassName[1] == 196 || childClassName[1] == 290 || childClassName[1] == 288) ? ".svg" : ".png";
				return L.divIcon({
					html:
						`
						<svg class="clusterSvg" width="100%" height="100%" viewBox="0 0 602 602"
						version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
							<title>
								loc_empty
							</title>
							<defs>
								<filter x="-2.9%" y="-7.3%" width="105.8%" height="114.6%" filterUnits="objectBoundingBox"
								id="filter-1">
									<feGaussianBlur stdDeviation="2" in="SourceGraphic">
									</feGaussianBlur>
								</filter>
							</defs>
							<g transform="translate(50.000000, 0.000000)" id="页面-1" stroke="none"
							stroke-width="1" fill="none" fill-rule="evenodd">
								<ellipse id="椭圆形备份-28" fill-opacity="0.304797" fill="#000000" filter="url(#filter-1)"
								cx="250" cy="561" rx="104" ry="41">
								</ellipse>
								<g id="聚合loc_empty" transform="translate(0.000000, -192.000000)">
									<path d="M80.4892622,272.514212 C126.897924,226.081047 192.094372,198.4578 263.339979,202.366075 C326.687754,205.840896 383.495162,233.893848 424.393579,277.164433 C465.061024,320.19065 490,378.259293 490,442.15716 C490,497.895388 471.02198,549.196422 439.18382,589.948036 C407.31516,630.738689 362.555651,660.952757 311.042132,674.470903 L311.042132,674.470903 L261.313072,733.818659 C260.73242,734.512516 260.090182,735.152415 259.394211,735.730531 C256.207951,738.377233 252.250546,739.481886 248.42803,739.128297 C244.605514,738.774709 240.917888,736.96288 238.271185,733.77662 L238.271185,733.77662 L189.074183,674.550301 C139.72648,661.571612 96.5965129,633.334801 65.0383548,595.188251 C33.2951275,556.817995 13.256946,508.427261 10.3637613,455.467941 C6.46924546,384.176835 34.0834423,318.944534 80.4892622,272.514212 Z"
									id="Stroke-1备份-2" stroke-opacity="0.403190559" stroke="#000000" stroke-width="20"
									fill="#FFFFFF">
									</path>
									<path class="svgTip" d="M250,237 C363.770658,237 456,329.285289 456,443.124962 C456,542.227366 386.10434,624.994861 292.948613,644.763565 L250,696 L207.053382,644.763988 C113.896658,624.996042 44,542.228073 44,443.124962 C44,329.285289 136.229342,237 250,237 Z M250,259.013345 C148.379606,259.013345 66,341.442924 66,443.124962 C66,544.807 148.379606,627.236578 250,627.236578 C351.620394,627.236578 434,544.807 434,443.124962 C434,341.442924 351.620394,259.013345 250,259.013345 Z"
									id="形状结合备份-3" fill=#${svgTipFill}>
									</path>
									<circle id="donut-graph" class="svgCircle" transform="translate(693,194)rotate(90)"
									r="195" cy="443" cx="250" stroke-width="20" stroke="#00EBF4" stroke-linejoin="round"
									stroke-linecap="round" fill="none" stroke-dasharray="1230" stroke-dashoffset="${(1230 - ((doneNum / childCount) * 1230))}"
									/>
								</g>
							</g>
						</svg>
						<b>${doneNum}/${childCount}</b>
						<img class='clusterImg' src='${icon_src}'>
					`,
					className: "clusterIcon",
					iconSize: [36 + childCount / 3, 36 + childCount / 3], // Size of the icon
					iconAnchor: [(36 + childCount / 3) / 2, 36 + childCount / 3 * 0.95]
				});
			}
		},

		initialize (options) {
			L.Util.setOptions(this, options);
			if (!this.options.iconCreateFunction) {
				this.options.iconCreateFunction = this._defaultIconCreateFunction;
			}

			this._featureGroup = L.featureGroup();
			this._featureGroup.addEventParent(this);

			this._nonPointGroup = L.featureGroup();
			this._nonPointGroup.addEventParent(this);

			this._inZoomAnimation = 0;
			this._needsClustering = [];
			this._needsRemoving = []; // Markers removed while we aren't on the map need to be kept track of
			// The bounds of the currently shown area (from _getExpandedVisibleBounds) Updated on zoom/move
			this._currentShownBounds = null;

			this._queue = [];

			this._childMarkerEventHandlers = {
				'dragstart': this._childMarkerDragStart,
				'move': this._childMarkerMoved,
				'dragend': this._childMarkerDragEnd,
			};

			// Hook the appropriate animation methods.
			const animate = L.DomUtil.TRANSITION && this.options.animate;
			L.extend(this, animate ? this._withAnimation : this._noAnimation);
			// Remember which MarkerCluster class to instantiate (animated or not).
			this._markerCluster = animate ? L.MarkerCluster : L.MarkerClusterNonAnimated;
		},

		addLayer (layer) {

			if (layer instanceof L.LayerGroup) {
				return this.addLayers([layer]);
			}

			// Don't cluster non point data
			if (!layer.getLatLng) {
				this._nonPointGroup.addLayer(layer);
				this.fire('layeradd', {
					layer
				});
				return this;
			}

			if (!this._map) {
				this._needsClustering.push(layer);
				this.fire('layeradd', {
					layer
				});
				return this;
			}

			if (this.hasLayer(layer)) {
				return this;
			}


			// If we have already clustered we'll need to add this one to a cluster

			if (this._unspiderfy) {
				this._unspiderfy();
			}

			this._addLayer(layer, this._maxZoom);
			this.fire('layeradd', {
				layer
			});

			// Refresh bounds and weighted positions.
			this._topClusterLevel._recalculateBounds();

			this._refreshClustersIcons();

			// Work out what is visible
			let visibleLayer = layer;
				const currentZoom = this._zoom;
			if (layer.__parent) {
				while (visibleLayer.__parent._zoom >= currentZoom) {
					visibleLayer = visibleLayer.__parent;
				}
			}

			if (this._currentShownBounds.contains(visibleLayer.getLatLng())) {
				if (this.options.animateAddingMarkers) {
					this._animationAddLayer(layer, visibleLayer);
				} else {
					this._animationAddLayerNonAnimated(layer, visibleLayer);
				}
			}

			return this;
		},

		removeLayer (layer) {

			if (layer instanceof L.LayerGroup) {
				return this.removeLayers([layer]);
			}

			// Non point layers
			if (!layer.getLatLng) {
				this._nonPointGroup.removeLayer(layer);
				this.fire('layerremove', {
					layer
				});
				return this;
			}

			if (!this._map) {
				if (!this._arraySplice(this._needsClustering, layer) && this.hasLayer(layer)) {
					this._needsRemoving.push({
						layer,
						latlng: layer._latlng
					});
				}

				this.fire('layerremove', {
					layer
				});
				return this;
			}

			if (!layer.__parent) {
				return this;
			}

			if (this._unspiderfy) {
				this._unspiderfy();
				this._unspiderfyLayer(layer);
			}

			// Remove the marker from clusters
			this._removeLayer(layer, true);
			this.fire('layerremove', {
				layer
			});

			// Refresh bounds and weighted positions.
			this._topClusterLevel._recalculateBounds();

			this._refreshClustersIcons();

			layer.off(this._childMarkerEventHandlers, this);

			if (this._featureGroup.hasLayer(layer)) {
				this._featureGroup.removeLayer(layer);
				if (layer.clusterShow) {
					layer.clusterShow();
				}
			}

			return this;
		},

		// Takes an array of markers and adds them in bulk
		addLayers (layersArray, skipLayerAddEvent) {
			if (!L.Util.isArray(layersArray)) {
				return this.addLayer(layersArray);
			}

			const fg = this._featureGroup;
				const npg = this._nonPointGroup;
				const chunked = this.options.chunkedLoading;
				const {chunkInterval} = this.options;
				const {chunkProgress} = this.options;
				let l = layersArray.length;
				let offset = 0;
				let originalArray = true;
				let m;

			if (this._map) {
				const started = (new Date()).getTime();
				var process = L.bind(function () {
					const start = (new Date()).getTime();
					for (; offset < l; offset++) {
						if (chunked && offset % 200 === 0) {
							// Every couple hundred markers, instrument the time elapsed since processing started:
							const elapsed = (new Date()).getTime() - start;
							if (elapsed > chunkInterval) {
								break; // Been working too hard, time to take a break :-)
							}
						}

						m = layersArray[offset];

						// Group of layers, append children to layersArray and skip.
						// Side effects:
						// - Total increases, so chunkProgress ratio jumps backward.
						// - Groups are not included in this group, only their non-group child layers (hasLayer).
						// Changing array length while looping does not affect performance in current browsers:
						// http://jsperf.com/for-loop-changing-length/6
						if (m instanceof L.LayerGroup) {
							if (originalArray) {
								layersArray = layersArray.slice();
								originalArray = false;
							}

							this._extractNonGroupLayers(m, layersArray);
							l = layersArray.length;
							continue;
						}

						// Not point data, can't be clustered
						if (!m.getLatLng) {
							npg.addLayer(m);
							if (!skipLayerAddEvent) {
								this.fire('layeradd', {
									layer: m
								});
							}

							continue;
						}

						if (this.hasLayer(m)) {
							continue;
						}

						this._addLayer(m, this._maxZoom);
						if (!skipLayerAddEvent) {
							this.fire('layeradd', {
								layer: m
							});
						}

						// If we just made a cluster of size 2 then we need to remove the other marker from the map (if it is) or we never will
						if (m.__parent) {
							if (m.__parent.getChildCount() === 2) {
								const markers = m.__parent.getAllChildMarkers();
									const otherMarker = markers[0] === m ? markers[1] : markers[0];
								fg.removeLayer(otherMarker);
							}
						}
					}

					if (chunkProgress) {
						// Report progress and time elapsed:
						chunkProgress(offset, l, (new Date()).getTime() - started);
					}

					// Completed processing all markers.
					if (offset === l) {

						// Refresh bounds and weighted positions.
						this._topClusterLevel._recalculateBounds();

						this._refreshClustersIcons();

						this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds);
					} else {
						setTimeout(process, this.options.chunkDelay);
					}
				}, this);

				process();
			} else {
				const needsClustering = this._needsClustering;

				for (; offset < l; offset++) {
					m = layersArray[offset];

					// Group of layers, append children to layersArray and skip.
					if (m instanceof L.LayerGroup) {
						if (originalArray) {
							layersArray = layersArray.slice();
							originalArray = false;
						}

						this._extractNonGroupLayers(m, layersArray);
						l = layersArray.length;
						continue;
					}

					// Not point data, can't be clustered
					if (!m.getLatLng) {
						npg.addLayer(m);
						continue;
					}

					if (this.hasLayer(m)) {
						continue;
					}

					needsClustering.push(m);
				}
			}

			return this;
		},

		// Takes an array of markers and removes them in bulk
		removeLayers (layersArray) {
			let i; let m;
				let l = layersArray.length;
				const fg = this._featureGroup;
				const npg = this._nonPointGroup;
				let originalArray = true;

			if (!this._map) {
				for (i = 0; i < l; i++) {
					m = layersArray[i];

					// Group of layers, append children to layersArray and skip.
					if (m instanceof L.LayerGroup) {
						if (originalArray) {
							layersArray = layersArray.slice();
							originalArray = false;
						}

						this._extractNonGroupLayers(m, layersArray);
						l = layersArray.length;
						continue;
					}

					this._arraySplice(this._needsClustering, m);
					npg.removeLayer(m);
					if (this.hasLayer(m)) {
						this._needsRemoving.push({
							layer: m,
							latlng: m._latlng
						});
					}

					this.fire('layerremove', {
						layer: m
					});
				}

				return this;
			}

			if (this._unspiderfy) {
				this._unspiderfy();

				// Work on a copy of the array, so that next loop is not affected.
				const layersArray2 = layersArray.slice();
					let l2 = l;
				for (i = 0; i < l2; i++) {
					m = layersArray2[i];

					// Group of layers, append children to layersArray and skip.
					if (m instanceof L.LayerGroup) {
						this._extractNonGroupLayers(m, layersArray2);
						l2 = layersArray2.length;
						continue;
					}

					this._unspiderfyLayer(m);
				}
			}

			for (i = 0; i < l; i++) {
				m = layersArray[i];

				// Group of layers, append children to layersArray and skip.
				if (m instanceof L.LayerGroup) {
					if (originalArray) {
						layersArray = layersArray.slice();
						originalArray = false;
					}

					this._extractNonGroupLayers(m, layersArray);
					l = layersArray.length;
					continue;
				}

				if (!m.__parent) {
					npg.removeLayer(m);
					this.fire('layerremove', {
						layer: m
					});
					continue;
				}

				this._removeLayer(m, true, true);
				this.fire('layerremove', {
					layer: m
				});

				if (fg.hasLayer(m)) {
					fg.removeLayer(m);
					if (m.clusterShow) {
						m.clusterShow();
					}
				}
			}

			// Refresh bounds and weighted positions.
			this._topClusterLevel._recalculateBounds();

			this._refreshClustersIcons();

			// Fix up the clusters and markers on the map
			this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds);

			return this;
		},

		// Removes all layers from the MarkerClusterGroup
		clearLayers () {
			// Need our own special implementation as the LayerGroup one doesn't work for us

			// If we aren't on the map (yet), blow away the markers we know of
			if (!this._map) {
				this._needsClustering = [];
				this._needsRemoving = [];
				delete this._gridClusters;
				delete this._gridUnclustered;
			}

			if (this._noanimationUnspiderfy) {
				this._noanimationUnspiderfy();
			}

			// Remove all the visible layers
			this._featureGroup.clearLayers();
			this._nonPointGroup.clearLayers();

			this.eachLayer(function (marker) {
				marker.off(this._childMarkerEventHandlers, this);
				delete marker.__parent;
			}, this);

			if (this._map) {
				// Reset _topClusterLevel and the DistanceGrids
				this._generateInitialClusters();
			}

			return this;
		},

		// Override FeatureGroup.getBounds as it doesn't work
		getBounds () {
			const bounds = new L.LatLngBounds();

			if (this._topClusterLevel) {
				bounds.extend(this._topClusterLevel._bounds);
			}

			for (let i = this._needsClustering.length - 1; i >= 0; i--) {
				bounds.extend(this._needsClustering[i].getLatLng());
			}

			bounds.extend(this._nonPointGroup.getBounds());

			return bounds;
		},

		// Overrides LayerGroup.eachLayer
		eachLayer (method, context) {
			const markers = this._needsClustering.slice();
				const needsRemoving = this._needsRemoving;
				let thisNeedsRemoving; let i; let j;

			if (this._topClusterLevel) {
				this._topClusterLevel.getAllChildMarkers(markers);
			}

			for (i = markers.length - 1; i >= 0; i--) {
				thisNeedsRemoving = true;

				for (j = needsRemoving.length - 1; j >= 0; j--) {
					if (needsRemoving[j].layer === markers[i]) {
						thisNeedsRemoving = false;
						break;
					}
				}

				if (thisNeedsRemoving) {
					method.call(context, markers[i]);
				}
			}

			this._nonPointGroup.eachLayer(method, context);
		},

		// Overrides LayerGroup.getLayers
		getLayers () {
			const layers = [];
			this.eachLayer((l) => {
				layers.push(l);
			});
			return layers;
		},

		// Overrides LayerGroup.getLayer, WARNING: Really bad performance
		getLayer (id) {
			let result = null;

			id = parseInt(id, 10);

			this.eachLayer((l) => {
				if (L.stamp(l) === id) {
					result = l;
				}
			});

			return result;
		},

		// Returns true if the given layer is in this MarkerClusterGroup
		hasLayer (layer) {
			if (!layer) {
				return false;
			}

			let i; let anArray = this._needsClustering;

			for (i = anArray.length - 1; i >= 0; i--) {
				if (anArray[i] === layer) {
					return true;
				}
			}

			anArray = this._needsRemoving;
			for (i = anArray.length - 1; i >= 0; i--) {
				if (anArray[i].layer === layer) {
					return false;
				}
			}

			return Boolean(layer.__parent && layer.__parent._group === this) || this._nonPointGroup.hasLayer(layer);
		},

		// Zoom down to show the given layer (spiderfying if necessary) then calls the callback
		zoomToShowLayer (layer, callback) {

			if (typeof callback !== 'function') {
				callback = function () { };
			}

			var showMarker = function () {
				if ((layer._icon || layer.__parent._icon) && !this._inZoomAnimation) {
					this._map.off('moveend', showMarker, this);
					this.off('animationend', showMarker, this);

					if (layer._icon) {
						callback();
					} else if (layer.__parent._icon) {
						this.once('spiderfied', callback, this);
						layer.__parent.spiderfy();
					}
				}
			};

			if (layer._icon && this._map.getBounds().contains(layer.getLatLng())) {
				// Layer is visible ond on screen, immediate return
				callback();
			} else if (layer.__parent._zoom < Math.round(this._map._zoom)) {
				// Layer should be visible at this zoom level. It must not be on screen so just pan over to it
				this._map.on('moveend', showMarker, this);
				this._map.panTo(layer.getLatLng());
			} else {
				this._map.on('moveend', showMarker, this);
				this.on('animationend', showMarker, this);
				layer.__parent.zoomToBounds();
			}
		},

		// Overrides FeatureGroup.onAdd
		onAdd (map) {
			this._map = map;
			let i; let l; let layer;

			if (!isFinite(this._map.getMaxZoom())) {
				throw "Map has no maxZoom specified";
			}

			this._featureGroup.addTo(map);
			this._nonPointGroup.addTo(map);

			if (!this._gridClusters) {
				this._generateInitialClusters();
			}

			this._maxLat = map.options.crs.projection.MAX_LATITUDE;

			// Restore all the positions as they are in the MCG before removing them
			for (i = 0, l = this._needsRemoving.length; i < l; i++) {
				layer = this._needsRemoving[i];
				layer.newlatlng = layer.layer._latlng;
				layer.layer._latlng = layer.latlng;
			}

			// Remove them, then restore their new positions
			for (i = 0, l = this._needsRemoving.length; i < l; i++) {
				layer = this._needsRemoving[i];
				this._removeLayer(layer.layer, true);
				layer.layer._latlng = layer.newlatlng;
			}

			this._needsRemoving = [];

			// Remember the current zoom level and bounds
			this._zoom = Math.round(this._map._zoom);
			this._currentShownBounds = this._getExpandedVisibleBounds();

			this._map.on('zoomend', this._zoomEnd, this);
			this._map.on('moveend', this._moveEnd, this);

			if (this._spiderfierOnAdd) { // TODO FIXME: Not sure how to have spiderfier add something on here nicely
				this._spiderfierOnAdd();
			}

			this._bindEvents();

			// Actually add our markers to the map:
			l = this._needsClustering;
			this._needsClustering = [];
			this.addLayers(l, true);
		},

		// Overrides FeatureGroup.onRemove
		onRemove (map) {
			map.off('zoomend', this._zoomEnd, this);
			map.off('moveend', this._moveEnd, this);

			this._unbindEvents();

			// In case we are in a cluster animation
			this._map._mapPane.className = this._map._mapPane.className.replace(' leaflet-cluster-anim', '');

			if (this._spiderfierOnRemove) { // TODO FIXME: Not sure how to have spiderfier add something on here nicely
				this._spiderfierOnRemove();
			}

			delete this._maxLat;

			// Clean up all the layers we added to the map
			this._hideCoverage();
			this._featureGroup.remove();
			this._nonPointGroup.remove();

			this._featureGroup.clearLayers();

			this._map = null;
		},

		getVisibleParent (marker) {
			let vMarker = marker;
			while (vMarker && !vMarker._icon) {
				vMarker = vMarker.__parent;
			}

			return vMarker || null;
		},

		// Remove the given object from the given array
		_arraySplice (anArray, obj) {
			for (let i = anArray.length - 1; i >= 0; i--) {
				if (anArray[i] === obj) {
					anArray.splice(i, 1);
					return true;
				}
			}
		},

		/**
		 * Removes a marker from all _gridUnclustered zoom levels, starting at the supplied zoom.
		 * @param marker to be removed from _gridUnclustered.
		 * @param z integer bottom start zoom level (included)
		 * @private
		 */
		_removeFromGridUnclustered (marker, z) {
			const map = this._map;
				const gridUnclustered = this._gridUnclustered;
				const minZoom = Math.floor(this._map.getMinZoom());

			for (; z >= minZoom; z--) {
				if (!gridUnclustered[z].removeObject(marker, map.project(marker.getLatLng(), z))) {
					break;
				}
			}
		},

		_childMarkerDragStart (e) {
			e.target.__dragStart = e.target._latlng;
		},

		_childMarkerMoved (e) {
			if (!this._ignoreMove && !e.target.__dragStart) {
				const isPopupOpen = e.target._popup && e.target._popup.isOpen();

				this._moveChild(e.target, e.oldLatLng, e.latlng);

				if (isPopupOpen) {
					e.target.openPopup();
				}
			}
		},

		_moveChild (layer, from, to) {
			layer._latlng = from;
			this.removeLayer(layer);

			layer._latlng = to;
			this.addLayer(layer);
		},

		_childMarkerDragEnd (e) {
			const dragStart = e.target.__dragStart;
			delete e.target.__dragStart;
			if (dragStart) {
				this._moveChild(e.target, dragStart, e.target._latlng);
			}
		},


		// Internal function for removing a marker from everything.
		// dontUpdateMap: set to true if you will handle updating the map manually (for bulk functions)
		_removeLayer (marker, removeFromDistanceGrid, dontUpdateMap) {
			const gridClusters = this._gridClusters;
				const gridUnclustered = this._gridUnclustered;
				const fg = this._featureGroup;
				const map = this._map;
				const minZoom = Math.floor(this._map.getMinZoom());

			// Remove the marker from distance clusters it might be in
			if (removeFromDistanceGrid) {
				this._removeFromGridUnclustered(marker, this._maxZoom);
			}

			// Work our way up the clusters removing them as we go if required
			let cluster = marker.__parent;
				const markers = cluster._markers;
				let otherMarker;

			// Remove the marker from the immediate parents marker list
			this._arraySplice(markers, marker);

			while (cluster) {
				cluster._childCount--;
				cluster._boundsNeedUpdate = true;

				if (cluster._zoom < minZoom) {
					// Top level, do nothing
					break;
				} else if (removeFromDistanceGrid && cluster._childCount <= 1) { // Cluster no longer required
					// We need to push the other marker up to the parent
					otherMarker = cluster._markers[0] === marker ? cluster._markers[1] : cluster._markers[0];

					// Update distance grid
					gridClusters[cluster._zoom].removeObject(cluster, map.project(cluster._cLatLng, cluster._zoom));
					gridUnclustered[cluster._zoom].addObject(otherMarker, map.project(otherMarker.getLatLng(), cluster._zoom));

					// Move otherMarker up to parent
					this._arraySplice(cluster.__parent._childClusters, cluster);
					cluster.__parent._markers.push(otherMarker);
					otherMarker.__parent = cluster.__parent;

					if (cluster._icon) {
						// Cluster is currently on the map, need to put the marker on the map instead
						fg.removeLayer(cluster);
						if (!dontUpdateMap) {
							fg.addLayer(otherMarker);
						}
					}
				} else {
					cluster._iconNeedsUpdate = true;
				}

				cluster = cluster.__parent;
			}

			delete marker.__parent;
		},

		_isOrIsParent (el, oel) {
			while (oel) {
				if (el === oel) {
					return true;
				}

				oel = oel.parentNode;
			}

			return false;
		},

		// Override L.Evented.fire
		fire (type, data, propagate) {
			if (data && data.layer instanceof L.MarkerCluster) {
				// Prevent multiple clustermouseover/off events if the icon is made up of stacked divs (Doesn't work in ie <= 8, no relatedTarget)
				if (data.originalEvent && this._isOrIsParent(data.layer._icon, data.originalEvent.relatedTarget)) {
					return;
				}

				type = 'cluster' + type;
			}

			L.FeatureGroup.prototype.fire.call(this, type, data, propagate);
		},

		// Override L.Evented.listens
		listens (type, propagate) {
			return L.FeatureGroup.prototype.listens.call(this, type, propagate) || L.FeatureGroup.prototype.listens.call(this, 'cluster' + type, propagate);
		},

		// Default functionality
		_defaultIconCreateFunction (cluster) {
			const childCount = cluster.getChildCount();

			let c = ' marker-cluster-';
			if (childCount < 10) {
				c += 'small';
			} else if (childCount < 100) {
				c += 'medium';
			} else {
				c += 'large';
			}

			return new L.DivIcon({
				html: '<div><span>' + childCount + '</span></div>',
				className: 'marker-cluster' + c,
				iconSize: new L.Point(40, 40)
			});
		},

		_bindEvents () {
			const map = this._map;
				const {spiderfyOnMaxZoom} = this.options;
				const {showCoverageOnHover} = this.options;
				const {zoomToBoundsOnClick} = this.options;
				const {spiderfyOnEveryZoom} = this.options;

			// Zoom on cluster click or spiderfy if we are at the lowest level
			if (spiderfyOnMaxZoom || zoomToBoundsOnClick || spiderfyOnEveryZoom) {
				this.on('clusterclick', this._zoomOrSpiderfy, this);
			}

			// Show convex hull (boundary) polygon on mouse over
			if (showCoverageOnHover) {
				this.on('clustermouseover', this._showCoverage, this);
				this.on('clustermouseout', this._hideCoverage, this);
				map.on('zoomend', this._hideCoverage, this);
			}
		},

		_zoomOrSpiderfy (e) {
			const cluster = e.layer;
				let bottomCluster = cluster;

			while (bottomCluster._childClusters.length === 1) {
				bottomCluster = bottomCluster._childClusters[0];
			}

			if (bottomCluster._zoom === this._maxZoom &&
				bottomCluster._childCount === cluster._childCount &&
				this.options.spiderfyOnMaxZoom) {

				// All child markers are contained in a single cluster from this._maxZoom to this cluster.
				cluster.spiderfy();
			} else if (this.options.zoomToBoundsOnClick) {
				cluster.zoomToBounds();
			}

			if (this.options.spiderfyOnEveryZoom) {
				cluster.spiderfy();
			}

			// Focus the map again for keyboard users.
			if (e.originalEvent && e.originalEvent.keyCode === 13) {
				this._map._container.focus();
			}
		},

		_showCoverage (e) {
			const map = this._map;
			if (this._inZoomAnimation) {
				return;
			}

			if (this._shownPolygon) {
				map.removeLayer(this._shownPolygon);
			}

			if (e.layer.getChildCount() > 2 && e.layer !== this._spiderfied) {
				this._shownPolygon = new L.Polygon(e.layer.getConvexHull(), this.options.polygonOptions);
				map.addLayer(this._shownPolygon);
			}
		},

		_hideCoverage () {
			if (this._shownPolygon) {
				this._map.removeLayer(this._shownPolygon);
				this._shownPolygon = null;
			}
		},

		_unbindEvents () {
			const {spiderfyOnMaxZoom} = this.options;
				const {showCoverageOnHover} = this.options;
				const {zoomToBoundsOnClick} = this.options;
				const {spiderfyOnEveryZoom} = this.options;
				const map = this._map;

			if (spiderfyOnMaxZoom || zoomToBoundsOnClick || spiderfyOnEveryZoom) {
				this.off('clusterclick', this._zoomOrSpiderfy, this);
			}

			if (showCoverageOnHover) {
				this.off('clustermouseover', this._showCoverage, this);
				this.off('clustermouseout', this._hideCoverage, this);
				map.off('zoomend', this._hideCoverage, this);
			}
		},

		_zoomEnd () {
			if (!this._map) { // May have been removed from the map by a zoomEnd handler
				return;
			}

			this._mergeSplitClusters();

			this._zoom = Math.round(this._map._zoom);
			this._currentShownBounds = this._getExpandedVisibleBounds();
		},

		_moveEnd () {
			if (this._inZoomAnimation) {
				return;
			}

			const newBounds = this._getExpandedVisibleBounds();

			this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, newBounds);
			this._topClusterLevel._recursivelyAddChildrenToMap(null, Math.round(this._map._zoom), newBounds);

			this._currentShownBounds = newBounds;

		},

		_generateInitialClusters () {
			let maxZoom = Math.ceil(this._map.getMaxZoom());
				const minZoom = Math.floor(this._map.getMinZoom());
				const radius = this.options.maxClusterRadius;
				let radiusFn = radius;

			// If we just set maxClusterRadius to a single number, we need to create
			// a simple function to return that number. Otherwise, we just have to
			// use the function we've passed in.
			if (typeof radius !== "function") {
				radiusFn = function () {
					return radius;
				};
			}

			if (this.options.disableClusteringAtZoom !== null) {
				maxZoom = this.options.disableClusteringAtZoom - 1;
			}

			this._maxZoom = maxZoom;
			this._gridClusters = {};
			this._gridUnclustered = {};

			// Set up DistanceGrids for each zoom
			for (let zoom = maxZoom; zoom >= minZoom; zoom--) {
				this._gridClusters[zoom] = new L.DistanceGrid(radiusFn(zoom));
				this._gridUnclustered[zoom] = new L.DistanceGrid(radiusFn(zoom));
			}

			// Instantiate the appropriate L.MarkerCluster class (animated or not).
			this._topClusterLevel = new this._markerCluster(this, minZoom - 1);
		},

		// Zoom: Zoom to start adding at (Pass this._maxZoom to start at the bottom)
		_addLayer (layer, zoom) {
			const gridClusters = this._gridClusters;
				const gridUnclustered = this._gridUnclustered;
				const minZoom = Math.floor(this._map.getMinZoom());
				let markerPoint; let z;

			if (this.options.singleMarkerMode) {
				this._overrideMarkerIcon(layer);
			}

			layer.on(this._childMarkerEventHandlers, this);

			// Find the lowest zoom level to slot this one in
			for (; zoom >= minZoom; zoom--) {
				markerPoint = this._map.project(layer.getLatLng(), zoom); // Calculate pixel position

				// Try find a cluster close by
				let closest = gridClusters[zoom].getNearObject(markerPoint);
				if (closest) {
					closest._addChild(layer);
					layer.__parent = closest;
					return;
				}

				// Try find a marker close by to form a new cluster with
				closest = gridUnclustered[zoom].getNearObject(markerPoint);
				if (closest) {
					const parent = closest.__parent;
					if (parent) {
						this._removeLayer(closest, false);
					}

					// Create new cluster with these 2 in it

					const newCluster = new this._markerCluster(this, zoom, closest, layer);
					gridClusters[zoom].addObject(newCluster, this._map.project(newCluster._cLatLng, zoom));
					closest.__parent = newCluster;
					layer.__parent = newCluster;

					// First create any new intermediate parent clusters that don't exist
					let lastParent = newCluster;
					for (z = zoom - 1; z > parent._zoom; z--) {
						lastParent = new this._markerCluster(this, z, lastParent);
						gridClusters[z].addObject(lastParent, this._map.project(closest.getLatLng(), z));
					}

					parent._addChild(lastParent);

					// Remove closest from this zoom level and any above that it is in, replace with newCluster
					this._removeFromGridUnclustered(closest, zoom);

					return;
				}

				// Didn't manage to cluster in at this zoom, record us as a marker here and continue upwards
				gridUnclustered[zoom].addObject(layer, markerPoint);
			}

			// Didn't get in anything, add us to the top
			this._topClusterLevel._addChild(layer);
			layer.__parent = this._topClusterLevel;

		},

		/**
		 * Refreshes the icon of all "dirty" visible clusters.
		 * Non-visible "dirty" clusters will be updated when they are added to the map.
		 * @private
		 */
		_refreshClustersIcons () {
			this._featureGroup.eachLayer((c) => {
				if (c instanceof L.MarkerCluster && c._iconNeedsUpdate) {
					c._updateIcon();
				}
			});
		},

		// Enqueue code to fire after the marker expand/contract has happened
		_enqueue (fn) {
			this._queue.push(fn);
			if (!this._queueTimeout) {
				this._queueTimeout = setTimeout(L.bind(this._processQueue, this), 300);
			}
		},
		_processQueue () {
			for (let i = 0; i < this._queue.length; i++) {
				this._queue[i].call(this);
			}

			this._queue.length = 0;
			clearTimeout(this._queueTimeout);
			this._queueTimeout = null;
		},

		// Merge and split any existing clusters that are too big or small
		_mergeSplitClusters () {
			const mapZoom = Math.round(this._map._zoom);

			// In case we are starting to split before the animation finished
			this._processQueue();

			if (this._zoom < mapZoom && this._currentShownBounds.intersects(this._getExpandedVisibleBounds())) { // Zoom in, split
				this._animationStart();
				// Remove clusters now off screen
				this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, this._getExpandedVisibleBounds());

				this._animationZoomIn(this._zoom, mapZoom);

			} else if (this._zoom > mapZoom) { // Zoom out, merge
				this._animationStart();

				this._animationZoomOut(this._zoom, mapZoom);
			} else {
				this._moveEnd();
			}
		},

		// Gets the maps visible bounds expanded in each direction by the size of the screen (so the user cannot see an area we do not cover in one pan)
		_getExpandedVisibleBounds () {
			if (!this.options.removeOutsideVisibleBounds) {
				return this._mapBoundsInfinite;
			}

 if (L.Browser.mobile) {
				return this._checkBoundsMaxLat(this._map.getBounds());
			}

			return this._checkBoundsMaxLat(this._map.getBounds().pad(1)); // Padding expands the bounds by its own dimensions but scaled with the given factor.
		},

		/**
		 * Expands the latitude to Infinity (or -Infinity) if the input bounds reach the map projection maximum defined latitude
		 * (in the case of Web/Spherical Mercator, it is 85.0511287798 / see https://en.wikipedia.org/wiki/Web_Mercator#Formulas).
		 * Otherwise, the removeOutsideVisibleBounds option will remove markers beyond that limit, whereas the same markers without
		 * this option (or outside MCG) will have their position floored (ceiled) by the projection and rendered at that limit,
		 * making the user think that MCG "eats" them and never displays them again.
		 * @param bounds L.LatLngBounds
		 * @returns {L.LatLngBounds}
		 * @private
		 */
		_checkBoundsMaxLat (bounds) {
			const maxLat = this._maxLat;

			if (maxLat !== undefined) {
				if (bounds.getNorth() >= maxLat) {
					bounds._northEast.lat = Infinity;
				}

				if (bounds.getSouth() <= -maxLat) {
					bounds._southWest.lat = -Infinity;
				}
			}

			return bounds;
		},

		// Shared animation code
		_animationAddLayerNonAnimated (layer, newCluster) {
			if (newCluster === layer) {
				this._featureGroup.addLayer(layer);
			} else if (newCluster._childCount === 2) {
				newCluster._addToMap();

				const markers = newCluster.getAllChildMarkers();
				this._featureGroup.removeLayer(markers[0]);
				this._featureGroup.removeLayer(markers[1]);
			} else {
				newCluster._updateIcon();
			}
		},

		/**
		 * Extracts individual (i.e. non-group) layers from a Layer Group.
		 * @param group to extract layers from.
		 * @param output {Array} in which to store the extracted layers.
		 * @returns {*|Array}
		 * @private
		 */
		_extractNonGroupLayers (group, output) {
			const layers = group.getLayers();
				let i = 0;
				let layer;

			output = output || [];

			for (; i < layers.length; i++) {
				layer = layers[i];

				if (layer instanceof L.LayerGroup) {
					this._extractNonGroupLayers(layer, output);
					continue;
				}

				output.push(layer);
			}

			return output;
		},

		/**
		 * Implements the singleMarkerMode option.
		 * @param layer Marker to re-style using the Clusters iconCreateFunction.
		 * @returns {L.Icon} The newly created icon.
		 * @private
		 */
		_overrideMarkerIcon (layer) {
			const icon = layer.options.icon = this.options.iconCreateFunction({
				getChildCount () {
					return 1;
				},
				getAllChildMarkers () {
					return [layer];
				}
			});

			return icon;
		}
	});

	// Constant bounds used in case option "removeOutsideVisibleBounds" is set to false.
	L.MarkerClusterGroup.include({
		_mapBoundsInfinite: new L.LatLngBounds(new L.LatLng(-Infinity, -Infinity), new L.LatLng(Infinity, Infinity))
	});

	L.MarkerClusterGroup.include({
		_noAnimation: {
			// Non Animated versions of everything
			_animationStart () {
				// Do nothing...
			},
			_animationZoomIn (previousZoomLevel, newZoomLevel) {
				this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel);
				this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds());

				// We didn't actually animate, but we use this event to mean "clustering animations have finished"
				this.fire('animationend');
			},
			_animationZoomOut (previousZoomLevel, newZoomLevel) {
				this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel);
				this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds());

				// We didn't actually animate, but we use this event to mean "clustering animations have finished"
				this.fire('animationend');
			},
			_animationAddLayer (layer, newCluster) {
				this._animationAddLayerNonAnimated(layer, newCluster);
			}
		},

		_withAnimation: {
			// Animated versions here
			_animationStart () {
				this._map._mapPane.className += ' leaflet-cluster-anim';
				this._inZoomAnimation++;
			},

			_animationZoomIn (previousZoomLevel, newZoomLevel) {
				const bounds = this._getExpandedVisibleBounds();
					const fg = this._featureGroup;
					const minZoom = Math.floor(this._map.getMinZoom());
					let i;

				this._ignoreMove = true;

				// Add all children of current clusters to map and remove those clusters from map
				this._topClusterLevel._recursively(bounds, previousZoomLevel, minZoom, (c) => {
					let startPos = c._latlng;
						const markers = c._markers;
						let m;

					if (!bounds.contains(startPos)) {
						startPos = null;
					}

					if (c._isSingleParent() && previousZoomLevel + 1 === newZoomLevel) { // Immediately add the new child and remove us
						fg.removeLayer(c);
						c._recursivelyAddChildrenToMap(null, newZoomLevel, bounds);
					} else {
						// Fade out old cluster
						c.clusterHide();
						c._recursivelyAddChildrenToMap(startPos, newZoomLevel, bounds);
					}

					// Remove all markers that aren't visible any more
					// TODO: Do we actually need to do this on the higher levels too?
					for (i = markers.length - 1; i >= 0; i--) {
						m = markers[i];
						if (!bounds.contains(m._latlng)) {
							fg.removeLayer(m);
						}
					}

				});

				this._forceLayout();

				// Update opacities
				this._topClusterLevel._recursivelyBecomeVisible(bounds, newZoomLevel);
				// TODO Maybe? Update markers in _recursivelyBecomeVisible
				fg.eachLayer((n) => {
					if (!(n instanceof L.MarkerCluster) && n._icon) {
						n.clusterShow();
					}
				});

				// Update the positions of the just added clusters/markers
				this._topClusterLevel._recursively(bounds, previousZoomLevel, newZoomLevel, (c) => {
					c._recursivelyRestoreChildPositions(newZoomLevel);
				});

				this._ignoreMove = false;

				// Remove the old clusters and close the zoom animation
				this._enqueue(function () {
					// Update the positions of the just added clusters/markers
					this._topClusterLevel._recursively(bounds, previousZoomLevel, minZoom, (c) => {
						fg.removeLayer(c);
						c.clusterShow();
					});

					this._animationEnd();
				});
			},

			_animationZoomOut (previousZoomLevel, newZoomLevel) {
				this._animationZoomOutSingle(this._topClusterLevel, previousZoomLevel - 1, newZoomLevel);

				// Need to add markers for those that weren't on the map before but are now
				this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds());
				// Remove markers that were on the map before but won't be now
				this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel, this._getExpandedVisibleBounds());
			},

			_animationAddLayer (layer, newCluster) {
				const me = this;
					const fg = this._featureGroup;

				fg.addLayer(layer);
				if (newCluster !== layer) {
					if (newCluster._childCount > 2) { // Was already a cluster

						newCluster._updateIcon();
						this._forceLayout();
						this._animationStart();

						layer._setPos(this._map.latLngToLayerPoint(newCluster.getLatLng()));
						layer.clusterHide();

						this._enqueue(() => {
							fg.removeLayer(layer);
							layer.clusterShow();

							me._animationEnd();
						});

					} else { // Just became a cluster
						this._forceLayout();

						me._animationStart();
						me._animationZoomOutSingle(newCluster, this._map.getMaxZoom(), this._zoom);
					}
				}
			}
		},

		// Private methods for animated versions.
		_animationZoomOutSingle (cluster, previousZoomLevel, newZoomLevel) {
			const bounds = this._getExpandedVisibleBounds();
				const minZoom = Math.floor(this._map.getMinZoom());

			// Animate all of the markers in the clusters to move to their cluster center point
			cluster._recursivelyAnimateChildrenInAndAddSelfToMap(bounds, minZoom, previousZoomLevel + 1, newZoomLevel);

			const me = this;

			// Update the opacity (If we immediately set it they won't animate)
			this._forceLayout();
			cluster._recursivelyBecomeVisible(bounds, newZoomLevel);

			// TODO: Maybe use the transition timing stuff to make this more reliable
			// When the animations are done, tidy up
			this._enqueue(function () {

				// This cluster stopped being a cluster before the timeout fired
				if (cluster._childCount === 1) {
					const m = cluster._markers[0];
					// If we were in a cluster animation at the time then the opacity and position of our child could be wrong now, so fix it
					this._ignoreMove = true;
					m.setLatLng(m.getLatLng());
					this._ignoreMove = false;
					if (m.clusterShow) {
						m.clusterShow();
					}
				} else {
					cluster._recursively(bounds, newZoomLevel, minZoom, (c) => {
						c._recursivelyRemoveChildrenFromMap(bounds, minZoom, previousZoomLevel + 1);
					});
				}

				me._animationEnd();
			});
		},

		_animationEnd () {
			if (this._map) {
				this._map._mapPane.className = this._map._mapPane.className.replace(' leaflet-cluster-anim', '');
			}

			this._inZoomAnimation--;
			this.fire('animationend');
		},

		// Force a browser layout of stuff in the map
		// Should apply the current opacity and location to all elements so we can update them again for an animation
		_forceLayout () {
			// In my testing this works, infact offsetWidth of any element seems to work.
			// Could loop all this._layers and do this for each _icon if it stops working

			L.Util.falseFn(document.body.offsetWidth);
		}
	});

	L.markerClusterGroup = function (map, options) {
		return new L.MarkerClusterGroup(map, options);
	};

	const MarkerCluster = L.MarkerCluster = L.Marker.extend({
		options: L.Icon.prototype.options,

		initialize (group, zoom, a, b) {

			L.Marker.prototype.initialize.call(this, a ? (a._cLatLng || a.getLatLng()) : new L.LatLng(0, 0), {
				icon: this,
				pane: group.options.clusterPane
			});

			this._group = group;
			this._zoom = zoom;

			this._markers = [];
			this._childClusters = [];
			this._childCount = 0;
			this._iconNeedsUpdate = true;
			this._boundsNeedUpdate = true;

			this._bounds = new L.LatLngBounds();

			if (a) {
				this._addChild(a);
			}

			if (b) {
				this._addChild(b);
			}
		},

		// Recursively retrieve all child markers of this cluster
		getAllChildMarkers (storageArray, ignoreDraggedMarker) {
			storageArray = storageArray || [];

			for (let i = this._childClusters.length - 1; i >= 0; i--) {
				this._childClusters[i].getAllChildMarkers(storageArray);
			}

			for (let j = this._markers.length - 1; j >= 0; j--) {
				if (ignoreDraggedMarker && this._markers[j].__dragStart) {
					continue;
				}

				storageArray.push(this._markers[j]);
			}

			return storageArray;
		},

		// Returns the count of how many child markers we have
		getChildCount () {
			return this._childCount;
		},

		// Zoom to the minimum of showing all of the child markers, or the extents of this cluster
		zoomToBounds (fitBoundsOptions) {
			let childClusters = this._childClusters.slice();
				const map = this._group._map;
				const boundsZoom = map.getBoundsZoom(this._bounds);
				let zoom = this._zoom + 1;
				const mapZoom = map.getZoom();
				let i;

			// Calculate how far we need to zoom down to see all of the markers
			while (childClusters.length > 0 && boundsZoom > zoom) {
				zoom++;
				let newClusters = [];
				for (i = 0; i < childClusters.length; i++) {
					newClusters = newClusters.concat(childClusters[i]._childClusters);
				}

				childClusters = newClusters;
			}

			if (boundsZoom > zoom) {
				this._group._map.setView(this._latlng, zoom);
			} else if (boundsZoom <= mapZoom) { // If fitBounds wouldn't zoom us down, zoom us down instead
				this._group._map.setView(this._latlng, mapZoom + 1);
			} else {
				this._group._map.fitBounds(this._bounds, fitBoundsOptions);
			}
		},

		getBounds () {
			const bounds = new L.LatLngBounds();
			bounds.extend(this._bounds);
			return bounds;
		},

		_updateIcon () {
			this._iconNeedsUpdate = true;
			if (this._icon) {
				this.setIcon(this);
			}
		},

		// Cludge for Icon, we pretend to be an icon for performance
		createIcon () {
			if (this._iconNeedsUpdate) {
				this._iconObj = this._group.options.iconCreateFunction(this);
				this._iconNeedsUpdate = false;
			}

			return this._iconObj.createIcon();
		},
		createShadow () {
			return this._iconObj.createShadow();
		},


		_addChild (new1, isNotificationFromChild) {

			this._iconNeedsUpdate = true;

			this._boundsNeedUpdate = true;
			this._setClusterCenter(new1);

			if (new1 instanceof L.MarkerCluster) {
				if (!isNotificationFromChild) {
					this._childClusters.push(new1);
					new1.__parent = this;
				}

				this._childCount += new1._childCount;
			} else {
				if (!isNotificationFromChild) {
					this._markers.push(new1);
				}

				this._childCount++;
			}

			if (this.__parent) {
				this.__parent._addChild(new1, true);
			}
		},

		/**
		 * Makes sure the cluster center is set. If not, uses the child center if it is a cluster, or the marker position.
		 * @param child L.MarkerCluster|L.Marker that will be used as cluster center if not defined yet.
		 * @private
		 */
		_setClusterCenter (child) {
			if (!this._cLatLng) {
				// When clustering, take position of the first point as the cluster center
				this._cLatLng = child._cLatLng || child._latlng;
			}
		},

		/**
		 * Assigns impossible bounding values so that the next extend entirely determines the new bounds.
		 * This method avoids having to trash the previous L.LatLngBounds object and to create a new one, which is much slower for this class.
		 * As long as the bounds are not extended, most other methods would probably fail, as they would with bounds initialized but not extended.
		 * @private
		 */
		_resetBounds () {
			const bounds = this._bounds;

			if (bounds._southWest) {
				bounds._southWest.lat = Infinity;
				bounds._southWest.lng = Infinity;
			}

			if (bounds._northEast) {
				bounds._northEast.lat = -Infinity;
				bounds._northEast.lng = -Infinity;
			}
		},

		_recalculateBounds () {
			const markers = this._markers;
				const childClusters = this._childClusters;
				let latSum = 0;
				let lngSum = 0;
				const totalCount = this._childCount;
				let i; let child; let childLatLng; let childCount;

			// Case where all markers are removed from the map and we are left with just an empty _topClusterLevel.
			if (totalCount === 0) {
				return;
			}

			// Reset rather than creating a new object, for performance.
			this._resetBounds();

			// Child markers.
			for (i = 0; i < markers.length; i++) {
				childLatLng = markers[i]._latlng;

				this._bounds.extend(childLatLng);

				latSum += childLatLng.lat;
				lngSum += childLatLng.lng;
			}

			// Child clusters.
			for (i = 0; i < childClusters.length; i++) {
				child = childClusters[i];

				// Re-compute child bounds and weighted position first if necessary.
				if (child._boundsNeedUpdate) {
					child._recalculateBounds();
				}

				this._bounds.extend(child._bounds);

				childLatLng = child._wLatLng;
				childCount = child._childCount;

				latSum += childLatLng.lat * childCount;
				lngSum += childLatLng.lng * childCount;
			}

			this._latlng = this._wLatLng = new L.LatLng(latSum / totalCount, lngSum / totalCount);

			// Reset dirty flag.
			this._boundsNeedUpdate = false;
		},

		// Set our markers position as given and add it to the map
		_addToMap (startPos) {
			if (startPos) {
				this._backupLatlng = this._latlng;
				this.setLatLng(startPos);
			}

			this._group._featureGroup.addLayer(this);
		},

		_recursivelyAnimateChildrenIn (bounds, center, maxZoom) {
			this._recursively(bounds, this._group._map.getMinZoom(), maxZoom - 1,
				(c) => {
					const markers = c._markers;
						let i; let m;
					for (i = markers.length - 1; i >= 0; i--) {
						m = markers[i];

						// Only do it if the icon is still on the map
						if (m._icon) {
							m._setPos(center);
							m.clusterHide();
						}
					}
				},
				(c) => {
					const childClusters = c._childClusters;
						let j; let cm;
					for (j = childClusters.length - 1; j >= 0; j--) {
						cm = childClusters[j];
						if (cm._icon) {
							cm._setPos(center);
							cm.clusterHide();
						}
					}
				}
			);
		},

		_recursivelyAnimateChildrenInAndAddSelfToMap (bounds, mapMinZoom, previousZoomLevel, newZoomLevel) {
			this._recursively(bounds, newZoomLevel, mapMinZoom,
				(c) => {
					c._recursivelyAnimateChildrenIn(bounds, c._group._map.latLngToLayerPoint(c.getLatLng()).round(), previousZoomLevel);

					// TODO: depthToAnimateIn affects _isSingleParent, if there is a multizoom we may/may not be.
					// As a hack we only do a animation free zoom on a single level zoom, if someone does multiple levels then we always animate
					if (c._isSingleParent() && previousZoomLevel - 1 === newZoomLevel) {
						c.clusterShow();
						c._recursivelyRemoveChildrenFromMap(bounds, mapMinZoom, previousZoomLevel); // Immediately remove our children as we are replacing them. TODO previousBounds not bounds
					} else {
						c.clusterHide();
					}

					c._addToMap();
				}
			);
		},

		_recursivelyBecomeVisible (bounds, zoomLevel) {
			this._recursively(bounds, this._group._map.getMinZoom(), zoomLevel, null, (c) => {
				c.clusterShow();
			});
		},

		_recursivelyAddChildrenToMap (startPos, zoomLevel, bounds) {
			this._recursively(bounds, this._group._map.getMinZoom() - 1, zoomLevel,
				(c) => {
					if (zoomLevel === c._zoom) {
						return;
					}

					// Add our child markers at startPos (so they can be animated out)
					for (let i = c._markers.length - 1; i >= 0; i--) {
						const nm = c._markers[i];

						if (!bounds.contains(nm._latlng)) {
							continue;
						}

						if (startPos) {
							nm._backupLatlng = nm.getLatLng();

							nm.setLatLng(startPos);
							if (nm.clusterHide) {
								nm.clusterHide();
							}
						}

						c._group._featureGroup.addLayer(nm);
					}
				},
				(c) => {
					c._addToMap(startPos);
				}
			);
		},

		_recursivelyRestoreChildPositions (zoomLevel) {
			// Fix positions of child markers
			for (let i = this._markers.length - 1; i >= 0; i--) {
				const nm = this._markers[i];
				if (nm._backupLatlng) {
					nm.setLatLng(nm._backupLatlng);
					delete nm._backupLatlng;
				}
			}

			if (zoomLevel - 1 === this._zoom) {
				// Reposition child clusters
				for (let j = this._childClusters.length - 1; j >= 0; j--) {
					this._childClusters[j]._restorePosition();
				}
			} else {
				for (let k = this._childClusters.length - 1; k >= 0; k--) {
					this._childClusters[k]._recursivelyRestoreChildPositions(zoomLevel);
				}
			}
		},

		_restorePosition () {
			if (this._backupLatlng) {
				this.setLatLng(this._backupLatlng);
				delete this._backupLatlng;
			}
		},

		// ExceptBounds: If set, don't remove any markers/clusters in it
		_recursivelyRemoveChildrenFromMap (previousBounds, mapMinZoom, zoomLevel, exceptBounds) {
			let m; let i;
			this._recursively(previousBounds, mapMinZoom - 1, zoomLevel - 1,
				(c) => {
					// Remove markers at every level
					for (i = c._markers.length - 1; i >= 0; i--) {
						m = c._markers[i];
						if (!exceptBounds || !exceptBounds.contains(m._latlng)) {
							c._group._featureGroup.removeLayer(m);
							if (m.clusterShow) {
								m.clusterShow();
							}
						}
					}
				},
				(c) => {
					// Remove child clusters at just the bottom level
					for (i = c._childClusters.length - 1; i >= 0; i--) {
						m = c._childClusters[i];
						if (!exceptBounds || !exceptBounds.contains(m._latlng)) {
							c._group._featureGroup.removeLayer(m);
							if (m.clusterShow) {
								m.clusterShow();
							}
						}
					}
				}
			);
		},

		// Run the given functions recursively to this and child clusters
		// boundsToApplyTo: a L.LatLngBounds representing the bounds of what clusters to recurse in to
		// zoomLevelToStart: zoom level to start running functions (inclusive)
		// zoomLevelToStop: zoom level to stop running functions (inclusive)
		// runAtEveryLevel: function that takes an L.MarkerCluster as an argument that should be applied on every level
		// runAtBottomLevel: function that takes an L.MarkerCluster as an argument that should be applied at only the bottom level
		_recursively (boundsToApplyTo, zoomLevelToStart, zoomLevelToStop, runAtEveryLevel, runAtBottomLevel) {
			const childClusters = this._childClusters;
				const zoom = this._zoom;
				let i; let c;

			if (zoomLevelToStart <= zoom) {
				if (runAtEveryLevel) {
					runAtEveryLevel(this);
				}

				if (runAtBottomLevel && zoom === zoomLevelToStop) {
					runAtBottomLevel(this);
				}
			}

			if (zoom < zoomLevelToStart || zoom < zoomLevelToStop) {
				for (i = childClusters.length - 1; i >= 0; i--) {
					c = childClusters[i];
					if (c._boundsNeedUpdate) {
						c._recalculateBounds();
					}

					if (boundsToApplyTo.intersects(c._bounds)) {
						c._recursively(boundsToApplyTo, zoomLevelToStart, zoomLevelToStop, runAtEveryLevel, runAtBottomLevel);
					}
				}
			}
		},

		// Returns true if we are the parent of only one cluster and that cluster is the same as us
		_isSingleParent () {
			// Don't need to check this._markers as the rest won't work if there are any
			return this._childClusters.length > 0 && this._childClusters[0]._childCount === this._childCount;
		}
	});

	/*
	 * Extends L.Marker to include two extra methods: clusterHide and clusterShow.
	 *
	 * They work as setOpacity(0) and setOpacity(1) respectively, but
	 * don't overwrite the options.opacity
	 *
	 */

	L.Marker.include({
		clusterHide () {
			const backup = this.options.opacity;
			this.setOpacity(0);
			this.options.opacity = backup;
			return this;
		},

		clusterShow () {
			return this.setOpacity(this.options.opacity);
		}
	});

	L.DistanceGrid = function (cellSize) {
		this._cellSize = cellSize;
		this._sqCellSize = cellSize * cellSize;
		this._grid = {};
		this._objectPoint = {};
	};

	L.DistanceGrid.prototype = {

		addObject (obj, point) {
			const x = this._getCoord(point.x);
				const y = this._getCoord(point.y);
				const grid = this._grid;
				const row = grid[y] = grid[y] || {};
				const cell = row[x] = row[x] || [];
				const stamp = L.Util.stamp(obj);

			this._objectPoint[stamp] = point;

			cell.push(obj);
		},

		updateObject (obj, point) {
			this.removeObject(obj);
			this.addObject(obj, point);
		},

		// Returns true if the object was found
		removeObject (obj, point) {
			const x = this._getCoord(point.x);
				const y = this._getCoord(point.y);
				const grid = this._grid;
				const row = grid[y] = grid[y] || {};
				const cell = row[x] = row[x] || [];
				let i; let len;

			delete this._objectPoint[L.Util.stamp(obj)];

			for (i = 0, len = cell.length; i < len; i++) {
				if (cell[i] === obj) {

					cell.splice(i, 1);

					if (len === 1) {
						delete row[x];
					}

					return true;
				}
			}

		},

		eachObject (fn, context) {
			let i; let j; let k; let len; let row; let cell; let removed;
				const grid = this._grid;

			for (i in grid) {
				row = grid[i];

				for (j in row) {
					cell = row[j];

					for (k = 0, len = cell.length; k < len; k++) {
						removed = fn.call(context, cell[k]);
						if (removed) {
							k--;
							len--;
						}
					}
				}
			}
		},

		getNearObject (point) {
			const x = this._getCoord(point.x);
				const y = this._getCoord(point.y);
				let i; let j; let k; let row; let cell; let len; let obj; let dist;
				const objectPoint = this._objectPoint;
				let closestDistSq = this._sqCellSize;
				let closest = null;

			for (i = y - 1; i <= y + 1; i++) {
				row = this._grid[i];
				if (row) {

					for (j = x - 1; j <= x + 1; j++) {
						cell = row[j];
						if (cell) {

							for (k = 0, len = cell.length; k < len; k++) {
								obj = cell[k];
								dist = this._sqDist(objectPoint[L.Util.stamp(obj)], point);
								if (dist < closestDistSq ||
									dist <= closestDistSq && closest === null) {
									closestDistSq = dist;
									closest = obj;
								}
							}
						}
					}
				}
			}

			return closest;
		},

		_getCoord (x) {
			const coord = Math.floor(x / this._cellSize);
			return isFinite(coord) ? coord : x;
		},

		_sqDist (p, p2) {
			const dx = p2.x - p.x;
				const dy = p2.y - p.y;
			return dx * dx + dy * dy;
		}
	};

	/* Copyright (c) 2012 the authors listed at the following URL, and/or
	the authors of referenced articles or incorporated external code:
	http://en.literateprograms.org/Quickhull_(Javascript)?action=history&offset=20120410175256

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	Retrieved from: http://en.literateprograms.org/Quickhull_(Javascript)?oldid=18434
	*/

	(function () {
		L.QuickHull = {

			/*
			 * @param {Object} cpt a point to be measured from the baseline
			 * @param {Array} bl the baseline, as represented by a two-element
			 *   array of latlng objects.
			 * @returns {Number} an approximate distance measure
			 */
			getDistant (cpt, bl) {
				const vY = bl[1].lat - bl[0].lat;
					const vX = bl[0].lng - bl[1].lng;
				return (vX * (cpt.lat - bl[0].lat) + vY * (cpt.lng - bl[0].lng));
			},

			/*
			 * @param {Array} baseLine a two-element array of latlng objects
			 *   representing the baseline to project from
			 * @param {Array} latLngs an array of latlng objects
			 * @returns {Object} the maximum point and all new points to stay
			 *   in consideration for the hull.
			 */
			findMostDistantPointFromBaseLine (baseLine, latLngs) {
				let maxD = 0;
					let maxPt = null;
					const newPoints = [];
					let i; let pt; let d;

				for (i = latLngs.length - 1; i >= 0; i--) {
					pt = latLngs[i];
					d = this.getDistant(pt, baseLine);

					if (d > 0) {
						newPoints.push(pt);
					} else {
						continue;
					}

					if (d > maxD) {
						maxD = d;
						maxPt = pt;
					}
				}

				return {
					maxPoint: maxPt,
					newPoints
				};
			},


			/*
			 * Given a baseline, compute the convex hull of latLngs as an array
			 * of latLngs.
			 *
			 * @param {Array} latLngs
			 * @returns {Array}
			 */
			buildConvexHull (baseLine, latLngs) {
				let convexHullBaseLines = [];
					const t = this.findMostDistantPointFromBaseLine(baseLine, latLngs);

				if (t.maxPoint) { // If there is still a point "outside" the base line
					convexHullBaseLines =
						convexHullBaseLines.concat(
							this.buildConvexHull([baseLine[0], t.maxPoint], t.newPoints)
						);
					convexHullBaseLines =
						convexHullBaseLines.concat(
							this.buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints)
						);
					return convexHullBaseLines;
				}  // If there is no more point "outside" the base line, the current base line is part of the convex hull

					return [baseLine[0]];

			},

			/*
			 * Given an array of latlngs, compute a convex hull as an array
			 * of latlngs
			 *
			 * @param {Array} latLngs
			 * @returns {Array}
			 */
			getConvexHull (latLngs) {
				// Find first baseline
				let maxLat = false;
					let minLat = false;
					let maxLng = false;
					let minLng = false;
					let maxLatPt = null;
					let minLatPt = null;
					let maxLngPt = null;
					let minLngPt = null;
					let maxPt = null;
					let minPt = null;
					let i;

				for (i = latLngs.length - 1; i >= 0; i--) {
					const pt = latLngs[i];
					if (maxLat === false || pt.lat > maxLat) {
						maxLatPt = pt;
						maxLat = pt.lat;
					}

					if (minLat === false || pt.lat < minLat) {
						minLatPt = pt;
						minLat = pt.lat;
					}

					if (maxLng === false || pt.lng > maxLng) {
						maxLngPt = pt;
						maxLng = pt.lng;
					}

					if (minLng === false || pt.lng < minLng) {
						minLngPt = pt;
						minLng = pt.lng;
					}
				}

				if (minLat !== maxLat) {
					minPt = minLatPt;
					maxPt = maxLatPt;
				} else {
					minPt = minLngPt;
					maxPt = maxLngPt;
				}

				const ch = [].concat(this.buildConvexHull([minPt, maxPt], latLngs),
					this.buildConvexHull([maxPt, minPt], latLngs));
				return ch;
			}
		};
	}());

	L.MarkerCluster.include({
		getConvexHull () {
			const childMarkers = this.getAllChildMarkers();
				const points = [];
				let p; let i;

			for (i = childMarkers.length - 1; i >= 0; i--) {
				p = childMarkers[i].getLatLng();
				points.push(p);
			}

			return L.QuickHull.getConvexHull(points);
		}
	});

	// This code is 100% based on https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
	// Huge thanks to jawj for implementing it first to make my job easy :-)

	L.MarkerCluster.include({

		_2PI: Math.PI * 2,
		_circleFootSeparation: 25, // Related to circumference of circle
		_circleStartAngle: 0,

		_spiralFootSeparation: 28, // Related to size of spiral (experiment!)
		_spiralLengthStart: 11,
		_spiralLengthFactor: 5,

		_circleSpiralSwitchover: 9, // Show spiral instead of circle from this marker count upwards.
		// 0 -> always spiral; Infinity -> always circle

		spiderfy () {
			if (this._group._spiderfied === this || this._group._inZoomAnimation) {
				return;
			}

			const childMarkers = this.getAllChildMarkers(null, true);
				const group = this._group;
				const map = group._map;
				const center = map.latLngToLayerPoint(this._latlng);
				let positions;

			this._group._unspiderfy();
			this._group._spiderfied = this;

			// TODO Maybe: childMarkers order by distance to center

			if (this._group.options.spiderfyShapePositions) {
				positions = this._group.options.spiderfyShapePositions(map, childMarkers, center);
			} else if (childMarkers.length >= this._circleSpiralSwitchover) {
				positions = this._generatePointsSpiral(childMarkers.length, center);
			} else {
				center.y += 10; // Otherwise circles look wrong => hack for standard blue icon, renders differently for other icons.
				positions = this._generatePointsCircle(childMarkers.length, center);
			}

			this._animationSpiderfy(childMarkers, positions);
		},

		unspiderfy (zoomDetails) {
			/// <param Name="zoomDetails">Argument from zoomanim if being called in a zoom animation or null otherwise</param>
			if (this._group._inZoomAnimation) {
				return;
			}

			this._animationUnspiderfy(zoomDetails);

			this._group._spiderfied = null;
		},

		_generatePointsCircle (count, centerPt) {
			const circumference = this._group.options.spiderfyDistanceMultiplier * this._circleFootSeparation * (2 + count);
				let legLength = circumference / this._2PI; // Radius from circumference
				const angleStep = this._2PI / count;
				const res = [];
				let i; let angle;

			legLength = Math.max(legLength, 35); // Minimum distance to get outside the cluster icon.

			res.length = count;

			for (i = 0; i < count; i++) { // Clockwise, like spiral.
				angle = this._circleStartAngle + i * angleStep;
				res[i] = new L.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle))._round();
			}

			return res;
		},

		_generatePointsSpiral (count, centerPt) {
			const {spiderfyDistanceMultiplier} = this._group.options;
				let legLength = spiderfyDistanceMultiplier * this._spiralLengthStart;
				const separation = spiderfyDistanceMultiplier * this._spiralFootSeparation;
				const lengthFactor = spiderfyDistanceMultiplier * this._spiralLengthFactor * this._2PI;
				let angle = 0;
				const res = [];
				let i;

			res.length = count;

			// Higher index, closer position to cluster center.
			for (i = count; i >= 0; i--) {
				// Skip the first position, so that we are already farther from center and we avoid
				// being under the default cluster icon (especially important for Circle Markers).
				if (i < count) {
					res[i] = new L.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle))._round();
				}

				angle += separation / legLength + i * 0.0005;
				legLength += lengthFactor / angle;
			}

			return res;
		},

		_noanimationUnspiderfy () {
			const group = this._group;
				const map = group._map;
				const fg = group._featureGroup;
				const childMarkers = this.getAllChildMarkers(null, true);
				let m; let i;

			group._ignoreMove = true;

			this.setOpacity(1);
			for (i = childMarkers.length - 1; i >= 0; i--) {
				m = childMarkers[i];

				fg.removeLayer(m);

				if (m._preSpiderfyLatlng) {
					m.setLatLng(m._preSpiderfyLatlng);
					delete m._preSpiderfyLatlng;
				}

				if (m.setZIndexOffset) {
					m.setZIndexOffset(0);
				}

				if (m._spiderLeg) {
					map.removeLayer(m._spiderLeg);
					delete m._spiderLeg;
				}
			}

			group.fire('unspiderfied', {
				cluster: this,
				markers: childMarkers
			});
			group._ignoreMove = false;
			group._spiderfied = null;
		}
	});

	// Non Animated versions of everything
	L.MarkerClusterNonAnimated = L.MarkerCluster.extend({
		_animationSpiderfy (childMarkers, positions) {
			const group = this._group;
				const map = group._map;
				const fg = group._featureGroup;
				const legOptions = this._group.options.spiderLegPolylineOptions;
				let i; let m; let leg; let newPos;

			group._ignoreMove = true;

			// Traverse in ascending order to make sure that inner circleMarkers are on top of further legs. Normal markers are re-ordered by newPosition.
			// The reverse order trick no longer improves performance on modern browsers.
			for (i = 0; i < childMarkers.length; i++) {
				newPos = map.layerPointToLatLng(positions[i]);
				m = childMarkers[i];

				// Add the leg before the marker, so that in case the latter is a circleMarker, the leg is behind it.
				leg = new L.Polyline([this._latlng, newPos], legOptions);
				map.addLayer(leg);
				m._spiderLeg = leg;

				// Now add the marker.
				m._preSpiderfyLatlng = m._latlng;
				m.setLatLng(newPos);
				if (m.setZIndexOffset) {
					m.setZIndexOffset(1000000); // Make these appear on top of EVERYTHING
				}

				fg.addLayer(m);
			}

			this.setOpacity(0.3);

			group._ignoreMove = false;
			group.fire('spiderfied', {
				cluster: this,
				markers: childMarkers
			});
		},

		_animationUnspiderfy () {
			this._noanimationUnspiderfy();
		}
	});

	// Animated versions here
	L.MarkerCluster.include({

		_animationSpiderfy (childMarkers, positions) {
			const me = this;
				const group = this._group;
				const map = group._map;
				const fg = group._featureGroup;
				const thisLayerLatLng = this._latlng;
				const thisLayerPos = map.latLngToLayerPoint(thisLayerLatLng);
				const svg = L.Path.SVG;
				const legOptions = L.extend({}, this._group.options.spiderLegPolylineOptions); // Copy the options so that we can modify them for animation.
				let finalLegOpacity = legOptions.opacity;
				let i; let m; let leg; let legPath; let legLength; let newPos;

			if (finalLegOpacity === undefined) {
				finalLegOpacity = L.MarkerClusterGroup.prototype.options.spiderLegPolylineOptions.opacity;
			}

			if (svg) {
				// If the initial opacity of the spider leg is not 0 then it appears before the animation starts.
				legOptions.opacity = 0;

				// Add the class for CSS transitions.
				legOptions.className = (legOptions.className || '') + ' leaflet-cluster-spider-leg';
			} else {
				// Make sure we have a defined opacity.
				legOptions.opacity = finalLegOpacity;
			}

			group._ignoreMove = true;

			// Add markers and spider legs to map, hidden at our center point.
			// Traverse in ascending order to make sure that inner circleMarkers are on top of further legs. Normal markers are re-ordered by newPosition.
			// The reverse order trick no longer improves performance on modern browsers.
			for (i = 0; i < childMarkers.length; i++) {
				m = childMarkers[i];

				newPos = map.layerPointToLatLng(positions[i]);

				// Add the leg before the marker, so that in case the latter is a circleMarker, the leg is behind it.
				leg = new L.Polyline([thisLayerLatLng, newPos], legOptions);
				map.addLayer(leg);
				m._spiderLeg = leg;

				// Explanations: https://jakearchibald.com/2013/animated-line-drawing-svg/
				// In our case the transition property is declared in the CSS file.
				if (svg) {
					legPath = leg._path;
					legLength = legPath.getTotalLength() + 0.1; // Need a small extra length to avoid remaining dot in Firefox.
					legPath.style.strokeDasharray = legLength; // Just 1 length is enough, it will be duplicated.
					legPath.style.strokeDashoffset = legLength;
				}

				// If it is a marker, add it now and we'll animate it out
				if (m.setZIndexOffset) {
					m.setZIndexOffset(1000000); // Make normal markers appear on top of EVERYTHING
				}

				if (m.clusterHide) {
					m.clusterHide();
				}

				// Vectors just get immediately added
				fg.addLayer(m);

				if (m._setPos) {
					m._setPos(thisLayerPos);
				}
			}

			group._forceLayout();
			group._animationStart();

			// Reveal markers and spider legs.
			for (i = childMarkers.length - 1; i >= 0; i--) {
				newPos = map.layerPointToLatLng(positions[i]);
				m = childMarkers[i];

				// Move marker to new position
				m._preSpiderfyLatlng = m._latlng;
				m.setLatLng(newPos);

				if (m.clusterShow) {
					m.clusterShow();
				}

				// Animate leg (animation is actually delegated to CSS transition).
				if (svg) {
					leg = m._spiderLeg;
					legPath = leg._path;
					legPath.style.strokeDashoffset = 0;
					// LegPath.style.strokeOpacity = finalLegOpacity;
					leg.setStyle({
						opacity: finalLegOpacity
					});
				}
			}

			this.setOpacity(0.3);

			group._ignoreMove = false;

			setTimeout(() => {
				group._animationEnd();
				group.fire('spiderfied', {
					cluster: me,
					markers: childMarkers
				});
			}, 200);
		},

		_animationUnspiderfy (zoomDetails) {
			const me = this;
				const group = this._group;
				const map = group._map;
				const fg = group._featureGroup;
				const thisLayerPos = zoomDetails ? map._latLngToNewLayerPoint(this._latlng, zoomDetails.zoom, zoomDetails.center) : map.latLngToLayerPoint(this._latlng);
				const childMarkers = this.getAllChildMarkers(null, true);
				const svg = L.Path.SVG;
				let m; let i; let leg; let legPath; let legLength; let nonAnimatable;

			group._ignoreMove = true;
			group._animationStart();

			// Make us visible and bring the child markers back in
			this.setOpacity(1);
			for (i = childMarkers.length - 1; i >= 0; i--) {
				m = childMarkers[i];

				// Marker was added to us after we were spiderfied
				if (!m._preSpiderfyLatlng) {
					continue;
				}

				// Close any popup on the marker first, otherwise setting the location of the marker will make the map scroll
				m.closePopup();

				// Fix up the location to the real one
				m.setLatLng(m._preSpiderfyLatlng);
				delete m._preSpiderfyLatlng;

				// Hack override the location to be our center
				nonAnimatable = true;
				if (m._setPos) {
					m._setPos(thisLayerPos);
					nonAnimatable = false;
				}

				if (m.clusterHide) {
					m.clusterHide();
					nonAnimatable = false;
				}

				if (nonAnimatable) {
					fg.removeLayer(m);
				}

				// Animate the spider leg back in (animation is actually delegated to CSS transition).
				if (svg) {
					leg = m._spiderLeg;
					legPath = leg._path;
					legLength = legPath.getTotalLength() + 0.1;
					legPath.style.strokeDashoffset = legLength;
					leg.setStyle({
						opacity: 0
					});
				}
			}

			group._ignoreMove = false;

			setTimeout(() => {
				// If we have only <= one child left then that marker will be shown on the map so don't remove it!
				let stillThereChildCount = 0;
				for (i = childMarkers.length - 1; i >= 0; i--) {
					m = childMarkers[i];
					if (m._spiderLeg) {
						stillThereChildCount++;
					}
				}


				for (i = childMarkers.length - 1; i >= 0; i--) {
					m = childMarkers[i];

					if (!m._spiderLeg) { // Has already been unspiderfied
						continue;
					}

					if (m.clusterShow) {
						m.clusterShow();
					}

					if (m.setZIndexOffset) {
						m.setZIndexOffset(0);
					}

					if (stillThereChildCount > 1) {
						fg.removeLayer(m);
					}

					map.removeLayer(m._spiderLeg);
					delete m._spiderLeg;
				}

				group._animationEnd();
				group.fire('unspiderfied', {
					cluster: me,
					markers: childMarkers
				});
			}, 200);
		}
	});


	L.MarkerClusterGroup.include({
		// The MarkerCluster currently spiderfied (if any)
		_spiderfied: null,

		unspiderfy () {
			this._unspiderfy.apply(this, arguments);
		},

		_spiderfierOnAdd () {
			this._map.on('click', this._unspiderfyWrapper, this);

			if (this._map.options.zoomAnimation) {
				this._map.on('zoomstart', this._unspiderfyZoomStart, this);
			}

			// Browsers without zoomAnimation or a big zoom don't fire zoomstart
			this._map.on('zoomend', this._noanimationUnspiderfy, this);

			if (!L.Browser.touch) {
				this._map.getRenderer(this);
				// Needs to happen in the pageload, not after, or animations don't work in webkit
				//  http://stackoverflow.com/questions/8455200/svg-animate-with-dynamically-added-elements
				// Disable on touch browsers as the animation messes up on a touch zoom and isn't very noticable
			}
		},

		_spiderfierOnRemove () {
			this._map.off('click', this._unspiderfyWrapper, this);
			this._map.off('zoomstart', this._unspiderfyZoomStart, this);
			this._map.off('zoomanim', this._unspiderfyZoomAnim, this);
			this._map.off('zoomend', this._noanimationUnspiderfy, this);

			// Ensure that markers are back where they should be
			// Use no animation to avoid a sticky leaflet-cluster-anim class on mapPane
			this._noanimationUnspiderfy();
		},

		// On zoom start we add a zoomanim handler so that we are guaranteed to be last (after markers are animated)
		// This means we can define the animation they do rather than Markers doing an animation to their actual location
		_unspiderfyZoomStart () {
			if (!this._map) { // May have been removed from the map by a zoomEnd handler
				return;
			}

			this._map.on('zoomanim', this._unspiderfyZoomAnim, this);
		},

		_unspiderfyZoomAnim (zoomDetails) {
			// Wait until the first zoomanim after the user has finished touch-zooming before running the animation
			if (L.DomUtil.hasClass(this._map._mapPane, 'leaflet-touching')) {
				return;
			}

			this._map.off('zoomanim', this._unspiderfyZoomAnim, this);
			this._unspiderfy(zoomDetails);
		},

		_unspiderfyWrapper () {
			/// <summary>_unspiderfy but passes no arguments</summary>
			this._unspiderfy();
			this.refreshClusters();
		},

		_unspiderfy (zoomDetails) {
			if (this._spiderfied) {
				this._spiderfied.unspiderfy(zoomDetails);
			}
		},

		_noanimationUnspiderfy () {
			if (this._spiderfied) {
				this._spiderfied._noanimationUnspiderfy();
			}
		},

		// If the given layer is currently being spiderfied then we unspiderfy it so it isn't on the map anymore etc
		_unspiderfyLayer (layer) {
			if (layer._spiderLeg) {
				this._featureGroup.removeLayer(layer);

				if (layer.clusterShow) {
					layer.clusterShow();
				}

				// Position will be fixed up immediately in _animationUnspiderfy
				if (layer.setZIndexOffset) {
					layer.setZIndexOffset(0);
				}

				this._map.removeLayer(layer._spiderLeg);
				delete layer._spiderLeg;
			}
		}
	});

	/**
	 * Adds 1 public method to MCG and 1 to L.Marker to facilitate changing
	 * markers' icon options and refreshing their icon and their parent clusters
	 * accordingly (case where their iconCreateFunction uses data of childMarkers
	 * to make up the cluster icon).
	 */


	L.MarkerClusterGroup.include({
		/**
		 * Updates the icon of all clusters which are parents of the given marker(s).
		 * In singleMarkerMode, also updates the given marker(s) icon.
		 * @param layers L.MarkerClusterGroup|L.LayerGroup|Array(L.Marker)|Map(L.Marker)|
		 * L.MarkerCluster|L.Marker (optional) list of markers (or single marker) whose parent
		 * clusters need to be updated. If not provided, retrieves all child markers of this.
		 * @returns {L.MarkerClusterGroup}
		 */
		refreshClusters (layers) {
			if (!layers) {
				layers = this._topClusterLevel.getAllChildMarkers();
			} else if (layers instanceof L.MarkerClusterGroup) {
				layers = layers._topClusterLevel.getAllChildMarkers();
			} else if (layers instanceof L.LayerGroup) {
				layers = layers._layers;
			} else if (layers instanceof L.MarkerCluster) {
				layers = layers.getAllChildMarkers();
			} else if (layers instanceof L.Marker) {
				layers = [layers];
			} // Else: must be an Array(L.Marker)|Map(L.Marker)

			this._flagParentsIconsNeedUpdate(layers);
			this._refreshClustersIcons();

			// In case of singleMarkerMode, also re-draw the markers.
			if (this.options.singleMarkerMode) {
				this._refreshSingleMarkerModeMarkers(layers);
			}

			return this;
		},

		/**
		 * Simply flags all parent clusters of the given markers as having a "dirty" icon.
		 * @param layers Array(L.Marker)|Map(L.Marker) list of markers.
		 * @private
		 */
		_flagParentsIconsNeedUpdate (layers) {
			let id; let parent;

			// Assumes layers is an Array or an Object whose prototype is non-enumerable.
			for (id in layers) {
				// Flag parent clusters' icon as "dirty", all the way up.
				// Dumb process that flags multiple times upper parents, but still
				// much more efficient than trying to be smart and make short lists,
				// at least in the case of a hierarchy following a power law:
				// http://jsperf.com/flag-nodes-in-power-hierarchy/2
				parent = layers[id].__parent;
				while (parent) {
					parent._iconNeedsUpdate = true;
					parent = parent.__parent;
				}
			}
		},

		/**
		 * Re-draws the icon of the supplied markers.
		 * To be used in singleMarkerMode only.
		 * @param layers Array(L.Marker)|Map(L.Marker) list of markers.
		 * @private
		 */
		_refreshSingleMarkerModeMarkers (layers) {
			let id; let layer;

			for (id in layers) {
				layer = layers[id];

				// Make sure we do not override markers that do not belong to THIS group.
				if (this.hasLayer(layer)) {
					// Need to re-create the icon first, then re-draw the marker.
					layer.setIcon(this._overrideMarkerIcon(layer));
				}
			}
		}
	});

	L.Marker.include({
		/**
		 * Updates the given options in the marker's icon and refreshes the marker.
		 * @param options map object of icon options.
		 * @param directlyRefreshClusters boolean (optional) true to trigger
		 * MCG.refreshClustersOf() right away with this single marker.
		 * @returns {L.Marker}
		 */
		refreshIconOptions (options, directlyRefreshClusters) {
			const {icon} = this.options;

			L.setOptions(icon, options);

			this.setIcon(icon);

			// Shortcut to refresh the associated MCG clusters right away.
			// To be used when refreshing a single marker.
			// Otherwise, better use MCG.refreshClusters() once at the end with
			// the list of modified markers.
			if (directlyRefreshClusters && this.__parent) {
				this.__parent._group.refreshClusters(this);
			}

			return this;
		}
	});

	exports.MarkerClusterGroup = MarkerClusterGroup;
	exports.MarkerCluster = MarkerCluster;

})));
// # sourceMappingURL=leaflet.markercluster-src.js.map
