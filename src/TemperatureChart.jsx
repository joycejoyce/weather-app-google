// src/TemperatureChart.jsx
import React from 'react';
import Plot from 'react-plotly.js';

const TemperatureChart = ({ historicalData }) => {
  const dates = historicalData.map(data => data.date);
  const temperatures = historicalData.map(data => data.temperature);

  return (
    <Plot
      data={[
        {
          x: dates,
          y: temperatures,
          type: 'scatter',
          mode: 'lines+markers+text',
          marker: { size: 10 }, // Bigger markers
          text: temperatures,
          textposition: 'top center', // Label every data point
          line: { color: '#007bff' }, // Line color
          textfont: {
            size: 12, // Font size for labels
            color: '#000' // Label color
          }
        }
      ]}
      layout={{
        xaxis: { title: 'Date' },
        yaxis: { title: 'Temperature (°C)' },
        autosize: true,
        width: 600,  // Set width
        height: 400  // Set height
      }}
    />
  );
};

export default TemperatureChart;
