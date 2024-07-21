// src/Map.jsx
import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import config from './config';
import { Typography, Paper, Container, Grid, CircularProgress, TextField, Button, Box } from '@mui/material';
import TemperatureChart from './TemperatureChart'; // Import TemperatureChart

const libraries = ['places'];
const mapContainerStyle = {
  height: '80vh',
  width: '600px' // Adjust map width if needed
};
const infoContainerStyle = {
  width: '650px',  // Ensure the info container takes full width of the Grid item
  padding: '20px',
  height: '80vh',
  overflow: 'auto'
};
const promptStyle = {
  marginBottom: '20px',
  padding: '10px',
  backgroundColor: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '4px'
};
const titleStyle = {
  marginBottom: '10px',
  fontWeight: 'bold'
};
const center = { lat: 23.6978, lng: 120.9605 }; // Center of Taiwan

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [locationName, setLocationName] = useState(''); // State for location name

  const mapRef = useRef(null); // Create a reference for the map instance

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries
  });

  const onMapLoad = useCallback((map) => {
    mapRef.current = map; // Set the map reference
  }, []);

  const onMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
    setLoading(true);
    await fetchWeatherData(lat, lng);

    // Get location name from lat/lng
    try {
      const reverseGeocodeResponse = await new window.google.maps.Geocoder().geocode({
        location: { lat, lng }
      });
      if (reverseGeocodeResponse.results.length > 0) {
        setLocationName(reverseGeocodeResponse.results[0].formatted_address); // Use formatted_address
      } else {
        setLocationName('Unknown Location');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setLocationName('Unknown Location');
    }
  }, []);

  const fetchWeatherData = async (lat, lng) => {
    try {
      // Fetch current weather
      const currentResponse = await axios.get('http://api.weatherapi.com/v1/current.json', {
        params: {
          key: config.WEATHER_API_KEY,
          q: `${lat},${lng}`
        }
      });
      const currentTemperature = currentResponse.data.current.temp_c;

      // Fetch historical weather data
      const historicalPromises = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];

        return axios.get('http://api.weatherapi.com/v1/history.json', {
          params: {
            key: config.WEATHER_API_KEY,
            q: `${lat},${lng}`,
            dt: formattedDate
          }
        }).then(response => ({
          date: formattedDate,
          temperature: response.data.forecast.forecastday[0].day.avgtemp_c
        }));
      });

      const historicalResponses = await Promise.all(historicalPromises);
      setHistoricalData(historicalResponses);
      setWeatherData({ temperature: currentTemperature });
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (searchLocation) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const results = await geocoder.geocode({ address: searchLocation });
        if (results.results.length > 0) {
          const { lat, lng } = results.results[0].geometry.location;
          setSelectedLocation({ lat: lat(), lng: lng() });
          if (mapRef.current) {
            mapRef.current.panTo({ lat: lat(), lng: lng() });
          }
          await fetchWeatherData(lat(), lng());
          setLocationName(results.results[0].formatted_address); // Use formatted_address
        }
      } catch (error) {
        console.error('Error fetching geocode or place details:', error);
        setLocationName('Unknown Location');
      }
    }
  }, [searchLocation]);

  if (loadError) return <Typography variant="h6">Error loading map</Typography>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Container>
      <Box style={promptStyle}>
        <Typography variant="h6" style={titleStyle}>
          How to use this app
        </Typography>
        <Typography>
          <strong>Click on the map</strong> or <strong>Enter a location name in the search box</strong> and click "Search"<br />
          <strong>The current temperature and historical temperatures for the past week</strong> will be displayed in the right section.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <div style={mapContainerStyle}>
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={center}
              zoom={8}
              onClick={onMapClick}
              onLoad={onMapLoad} // Set the map reference when the map loads
            >
              {selectedLocation && (
                <Marker position={selectedLocation} />
              )}
            </GoogleMap>
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper style={infoContainerStyle}>
            <TextField
              label="Search Location"
              variant="outlined"
              fullWidth
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              style={{ marginBottom: '10px' }}
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Search
            </Button>
            {loading ? (
              <CircularProgress />
            ) : selectedLocation ? (
              <>
                <Typography variant="h6" style={{ color: '#1976d2', marginTop: '20px' }}>
                  Location Information
                </Typography>
                <Typography><strong>Location Name:</strong> {locationName}</Typography>
                <Typography><strong>Latitude:</strong> {selectedLocation.lat}</Typography>
                <Typography><strong>Longitude:</strong> {selectedLocation.lng}</Typography>
                <Typography><strong>Current Temperature:</strong> {weatherData.temperature}°C</Typography>
                <Typography variant="h6" style={{ color: '#1976d2', marginTop: '20px' }}>
                  Historical Temperatures for the Past Week:
                </Typography>
                {historicalData.length ? (
                  <div style={{ width: '100%', height: '400px' }}> {/* Ensure the container is wide enough */}
                    <TemperatureChart historicalData={historicalData} />
                  </div>
                ) : (
                  <Typography>No historical data available</Typography>
                )}
              </>
            ) : (
              <Typography>No location selected. Click on the map or enter a location name in the search box and click "Search".</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Map;
