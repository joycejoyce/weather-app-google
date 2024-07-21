// src/TemperatureChart.jsx
import React from 'react';
import Plot from 'react-plotly.js';

const TemperatureChart = ({ historicalData }) => {
  // Extract dates and temperatures from historicalData
  const dates = historicalData.map(data => data.date);
  const temperatures = historicalData.map(data => data.temperature);

  return (
    <Plot
      data={[
        {
          x: dates,
          y: temperatures,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: 'blue' },
        },
      ]}
      layout={{
        title: 'Past Week Temperature',
        xaxis: { title: 'Date' },
        yaxis: { title: 'Temperature (°C)' },
        autosize: true,
        width: 600, // Adjust width as needed
        height: 400 // Adjust height as needed
      }}
    />
  );
};

export default TemperatureChart;
