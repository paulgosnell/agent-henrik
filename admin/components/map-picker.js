/**
 * Map Picker Component
 * Interactive Leaflet map for selecting destination coordinates
 * Luxury Travel Sweden CMS
 */

class MapPicker {
  constructor() {
    this.map = null;
    this.marker = null;
    this.onChange = null;
    this.latInput = null;
    this.lngInput = null;
  }

  /**
   * Initialize the map picker
   * @param {string} containerId - ID of the map container element
   * @param {number} lat - Initial latitude
   * @param {number} lng - Initial longitude
   * @param {Function} onChange - Callback when coordinates change
   */
  init(containerId, lat = 62.0, lng = 15.0, onChange = null) {
    this.onChange = onChange;

    // Initialize map centered on Sweden
    this.map = L.map(containerId, {
      center: [lat, lng],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Add CartoDB tile layer (clean, modern style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // Add initial marker if coordinates provided
    if (lat && lng) {
      this.setMarker(lat, lng);
    }

    // Handle map clicks to place/move marker
    this.map.on('click', (e) => {
      this.setMarker(e.latlng.lat, e.latlng.lng);
    });

    // Invalidate size after initialization (fixes rendering issues)
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);

    return this;
  }

  /**
   * Bind coordinate inputs for two-way sync
   * @param {HTMLInputElement} latInput - Latitude input element
   * @param {HTMLInputElement} lngInput - Longitude input element
   */
  bindInputs(latInput, lngInput) {
    this.latInput = latInput;
    this.lngInput = lngInput;

    // Update marker when inputs change
    const updateFromInputs = () => {
      const lat = parseFloat(latInput.value);
      const lng = parseFloat(lngInput.value);

      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        this.setMarker(lat, lng, false); // Don't trigger onChange to avoid circular updates
        this.map.setView([lat, lng], this.map.getZoom());
      }
    };

    latInput.addEventListener('change', updateFromInputs);
    latInput.addEventListener('blur', updateFromInputs);
    lngInput.addEventListener('change', updateFromInputs);
    lngInput.addEventListener('blur', updateFromInputs);

    return this;
  }

  /**
   * Set marker at specific coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {boolean} updateInputs - Whether to update bound inputs
   */
  setMarker(lat, lng, updateInputs = true) {
    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Create custom icon
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 32px;
            height: 32px;
            background: #4a9eff;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add new marker
    this.marker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true
    }).addTo(this.map);

    // Handle marker drag
    this.marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      this.updateCoordinates(position.lat, position.lng);
    });

    // Update inputs if bound and requested
    if (updateInputs) {
      this.updateCoordinates(lat, lng);
    }

    return this;
  }

  /**
   * Update coordinate inputs and trigger onChange callback
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   */
  updateCoordinates(lat, lng) {
    // Round to 6 decimal places (sufficient precision for location)
    lat = Math.round(lat * 1000000) / 1000000;
    lng = Math.round(lng * 1000000) / 1000000;

    // Update bound inputs
    if (this.latInput) {
      this.latInput.value = lat;
    }
    if (this.lngInput) {
      this.lngInput.value = lng;
    }

    // Trigger onChange callback
    if (this.onChange) {
      this.onChange(lat, lng);
    }
  }

  /**
   * Get current coordinates
   * @returns {Object} Object with lat and lng properties
   */
  getCoordinates() {
    if (this.marker) {
      const position = this.marker.getLatLng();
      return {
        lat: Math.round(position.lat * 1000000) / 1000000,
        lng: Math.round(position.lng * 1000000) / 1000000
      };
    }
    return null;
  }

  /**
   * Recenter map on marker
   */
  recenter() {
    if (this.marker) {
      const position = this.marker.getLatLng();
      this.map.setView(position, this.map.getZoom());
    }
  }

  /**
   * Destroy the map instance
   */
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  /**
   * Refresh map display (useful after modal opens)
   */
  refresh() {
    if (this.map) {
      this.map.invalidateSize();
      if (this.marker) {
        this.recenter();
      }
    }
  }
}

// Export for use in other scripts
window.MapPicker = MapPicker;

/**
 * Utility function to create and initialize a map picker
 * @param {string} containerId - ID of the map container
 * @param {number} lat - Initial latitude
 * @param {number} lng - Initial longitude
 * @param {Function} onChange - Callback when coordinates change
 * @returns {MapPicker} Initialized MapPicker instance
 */
function initMapPicker(containerId, lat, lng, onChange) {
  const picker = new MapPicker();
  picker.init(containerId, lat, lng, onChange);
  return picker;
}

// Export utility function
window.initMapPicker = initMapPicker;
