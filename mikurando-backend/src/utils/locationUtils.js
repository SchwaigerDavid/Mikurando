function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const geocodeAddress = async (address) => {
    try {
        if (!address) return null;

        const query = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mikurando'
            }
        });

        const data = await response.json();


        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }

        return null;

    } catch (error) {
        console.error('Geocoding Error:', error);
        return null;
    }
};

const calculateDeliveryTime = async (lat1, lng1, lat2, lng2) => {
    try {
        const coordinates = `${lng1},${lat1};${lng2},${lat2}`;
        const url = `http://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mikurando'
            }
        });

        if (!response.ok) {
            throw new Error(`OSRM API Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            const durationSeconds = data.routes[0].duration;
            return Math.ceil(durationSeconds / 60); // Sec -> min
        }

        return null;

    } catch (error) {
        console.warn('Routing API failed, using fallback:', error.message);
        return null;
    }
};

module.exports = {
    geocodeAddress,
    calculateDistance,
    calculateDeliveryTime
};