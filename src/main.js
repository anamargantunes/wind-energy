import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

let coords = [55.68425837121026, 12.593041555270815];
let map = L.map('map').setView(coords, 17);
let circles = []; // Array to store all circles
let turbineMarkers = []; // Array to store {marker, color} for icon refresh
let locationMarker; // Store the location marker

const bladeData = {
    'tab-1': { name: 'V236',          diameter: 236, color: '#f03' },
    'tab-2': { name: 'SG 14-222 DD',  diameter: 222, color: '#30f' },
    'tab-3': { name: 'Haliade-X',     diameter: 220, color: '#3f0' },
    'tab-4': { name: 'Dongfang 26MW', diameter: 310, color: '#00f' }
};

function createTurbineIcon(color) {
    const size = parseInt(document.getElementById('icon-size').value);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-0.9496 -0.8052 32.8893 32.2877">
        <g transform="rotate(20.595337,16.735006,11.935507)">
            <!-- Blade 1 -->
            <path
                style="fill:#ffffff;stroke:${color};stroke-width:0.4;stroke-linecap:square;stroke-linejoin:round;"
                d="m 16.344341,14.943398 c -0.186792,-0.90283 -0.373585,-1.80566 -0.638211,-2.615101 -0.264626,-0.809442 -0.607071,-1.525464 -0.669334,-2.241509 -0.06226,-0.716044 0.155658,-1.432068 0.48255,-2.568404 0.326891,-1.136337 0.762732,-2.69291 1.074055,-4.031601 0.311322,-1.338691 0.498111,-2.459423 0.700472,-2.957534 0.202361,-0.498112 0.42028,-0.373587 0.466976,1.16748 0.0467,1.541068 -0.07783,4.498557 -0.217924,6.911311 -0.140096,2.412754 -0.295753,4.280641 -0.451414,6.148567"
                transform="rotate(-3.3542788,14.010862,12.070419)" />
            <!-- Blade 2 -->
            <path
                style="fill:#ffffff;stroke:${color};stroke-width:0.4;stroke-linecap:square;stroke-linejoin:round;"
                d="m 16.344341,14.943398 c -0.186792,-0.90283 -0.373585,-1.80566 -0.638211,-2.615101 -0.264626,-0.809442 -0.607071,-1.525464 -0.669334,-2.241509 -0.06226,-0.716044 0.155658,-1.432068 0.48255,-2.568404 0.326891,-1.136337 0.762732,-2.69291 1.074055,-4.031601 0.311322,-1.338691 0.498111,-2.459423 0.700472,-2.957534 0.202361,-0.498112 0.42028,-0.373587 0.466976,1.16748 0.0467,1.541068 -0.07783,4.498557 -0.217924,6.911311 -0.140096,2.412754 -0.295753,4.280641 -0.451414,6.148567"
                transform="rotate(117.6948,16.744044,15.839179)" />
            <!-- Blade 3 -->
            <path
                style="fill:#ffffff;stroke:${color};stroke-width:0.4;stroke-linecap:square;stroke-linejoin:round;"
                d="m 16.344341,14.943398 c -0.186792,-0.90283 -0.373585,-1.80566 -0.638211,-2.615101 -0.264626,-0.809442 -0.607071,-1.525464 -0.669334,-2.241509 -0.06226,-0.716044 0.155658,-1.432068 0.48255,-2.568404 0.326891,-1.136337 0.762732,-2.69291 1.074055,-4.031601 0.311322,-1.338691 0.498111,-2.459423 0.700472,-2.957534 0.202361,-0.498112 0.42028,-0.373587 0.466976,1.16748 0.0467,1.541068 -0.07783,4.498557 -0.217924,6.911311 -0.140096,2.412754 -0.295753,4.280641 -0.451414,6.148567"
                transform="rotate(-122.1165,16.667168,15.544076)" />
            <!-- Hub -->
            <circle
                style="fill:#ffffff;stroke:${color};stroke-width:0.4;stroke-linecap:square;stroke-linejoin:round;"
                cx="16.771407" cy="15.557316" r="1.2443389" />
        </g>
    </svg>`;
    return L.divIcon({ html: svg, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Function to update location marker
function updateLocationMarker(coords) {
    if (locationMarker) {
        map.removeLayer(locationMarker);
    }
    locationMarker = L.marker(coords)
        .bindPopup('Selected Location')
        .addTo(map)
        .openPopup();
}

// Function to update location
function updateLocation(newCoords) {
    coords = newCoords;
    map.setView(coords, 17);

    // Update input field
    const coordsInput = document.getElementById('coordinates');
    coordsInput.value = coords.join(', ');

    // Update the location marker
    updateLocationMarker(coords);
}

// Initialize the location marker at the starting position
updateLocationMarker(coords);

// Function to add current blade selection to map
function addCurrentBlade() {
    const selectedTab = document.querySelector('input[name="tabgroupB"]:checked').id;
    const diameter = selectedTab === 'tab-5'
        ? parseFloat(document.getElementById('custom-diameter').value)
        : bladeData[selectedTab].diameter;
    const color = document.getElementById('color-' + selectedTab).value;
    const name = selectedTab === 'tab-5'
        ? (document.getElementById('custom-name').value || 'Custom')
        : bladeData[selectedTab].name;

    if (locationMarker) {
        map.removeLayer(locationMarker);
        locationMarker = null;
    }

    const marker = L.marker(coords, { icon: createTurbineIcon(color) })
        .bindPopup(name)
        .addTo(map);

    const circle = L.circle(coords, {
        color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: diameter / 2
    }).addTo(map);

    circles.push(marker, circle);
    turbineMarkers.push({ marker, color });
}

// Function to clear all blades
function clearBlades() {
    circles.forEach(circle => map.removeLayer(circle));
    circles = [];
    turbineMarkers = [];
}

// Add click event listener to map
map.on('click', function (e) {
    updateLocation([e.latlng.lat, e.latlng.lng]);
});

// listen to the search button and updates the coords array
const searchButton = document.getElementById('search');
searchButton.addEventListener('click', () => {
    const coordsInput = document.querySelector('input[type="text"]');
    try {
        const newCoords = coordsInput.value.split(',').map(coord => parseFloat(coord));
        updateLocation(newCoords);
    } catch (error) {
        console.log(error);
        alert('Invalid coordinates');
    }
});

// Add place search functionality
const searchPlaceButton = document.getElementById('search-place');
const placeInput = document.getElementById('place-search');

searchPlaceButton.addEventListener('click', async () => {
    const place = placeInput.value;
    if (!place) return;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const location = data[0];
            updateLocation([parseFloat(location.lat), parseFloat(location.lon)]);
        } else {
            alert('Place not found');
        }
    } catch (error) {
        console.error(error);
        alert('Error searching for place');
    }
});

// Also allow pressing Enter to search
placeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPlaceButton.click();
    }
});

// Icon size slider
const iconSizeSlider = document.getElementById('icon-size');
const iconSizeLabel = document.getElementById('icon-size-value');
iconSizeSlider.addEventListener('input', () => {
    iconSizeLabel.textContent = iconSizeSlider.value + 'px';
    turbineMarkers.forEach(({ marker, color }) => marker.setIcon(createTurbineIcon(color)));
});

// Add current location functionality
const currentLocationButton = document.getElementById('current-location');

// Remove the disabled attribute
currentLocationButton.removeAttribute('disabled');

currentLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    currentLocationButton.setAttribute('disabled', '');
    currentLocationButton.textContent = 'Loading...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            // Success callback
            const newCoords = [position.coords.latitude, position.coords.longitude];
            updateLocation(newCoords);

            // Reset button
            currentLocationButton.removeAttribute('disabled');
            currentLocationButton.textContent = 'Current';
        },
        (error) => {
            // Error callback
            let message = 'Error getting your location: ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Position unavailable';
                    break;
                case error.TIMEOUT:
                    message += 'Request timed out';
                    break;
                default:
                    message += 'Unknown error';
            }
            alert(message);

            // Reset button
            currentLocationButton.removeAttribute('disabled');
            currentLocationButton.textContent = 'Current';
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
});

// Expose functions needed by inline HTML onclick attributes
window.addCurrentBlade = addCurrentBlade;
window.clearBlades = clearBlades;
