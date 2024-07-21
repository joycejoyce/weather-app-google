// src/Map.jsx
import React, { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';
import config from './config';
import { Typography, Paper, Container, Grid, CircularProgress } from '@mui/material';
import TemperatureChart from './TemperatureChart'; // Import TemperatureChart

const libraries = ['places'];
const mapContainerStyle = {
  height: '100vh',
  width: '600px' // Adjust map width if needed
};
const infoContainerStyle = {
  width: '100%',  // Make the info container take full width of the Grid item
  padding: '20px',
  height: '100vh',
  overflow: 'auto',
  width: '650px'
};
const center = { lat: 23.6978, lng: 120.9605 }; // Center of Taiwan

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.GOOGLE_MAPS_API_KEY,
    libraries
  });

  const onMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
    setLoading(true);

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
  }, []);

  if (loadError) return <Typography variant="h6">Error loading map</Typography>;
  if (!isLoaded) return <CircularProgress />;

  return (
    <Container>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <div style={mapContainerStyle}>
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={center}
              zoom={8}
              onClick={onMapClick}
            >
              {selectedLocation && (
                <Marker position={selectedLocation} />
              )}
            </GoogleMap>
          </div>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper style={infoContainerStyle}>
            {loading ? (
              <CircularProgress />
            ) : selectedLocation ? (
              <>
                <Typography variant="h6">Location Information</Typography>
                <Typography><strong>Latitude:</strong> {selectedLocation.lat}</Typography>
                <Typography><strong>Longitude:</strong> {selectedLocation.lng}</Typography>
                <Typography><strong>Current Temperature:</strong> {weatherData.temperature}°C</Typography>
                {/* <Typography variant="h6">Historical Temperatures for the Past Week:</Typography> */}
                {historicalData.length ? (
                  <TemperatureChart historicalData={historicalData} />
                ) : (
                  <Typography>No historical data available</Typography>
                )}
              </>
            ) : (
              <Typography>Click on the map to get the weather information.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Map;
