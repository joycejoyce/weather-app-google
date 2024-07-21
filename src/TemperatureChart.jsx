// src/TemperatureChart.jsx
import React from 'react';
import Plot from 'react-plotly.js';

const TemperatureChart = ({ historicalData }) => {
  const dates = historicalData.map(data => data.date);
  const temperatures = historicalData.map(data => data.temperature);

  const config = {
    displayModeBar: false, // Hide the toolbar
  };

  return (
    <Plot
      data={[
        {
          x: dates,
          y: temperatures,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { size: 8 },
        },
      ]}
      layout={{
        xaxis: {
          title: 'Date',
          titlefont: { size: 14 },
          tickangle: -45,
          tickformat: '%b %d', // Format to show abbreviated month and day
          automargin: true, // Ensure x-axis labels fit well
        },
        yaxis: {
          title: 'Temperature (°C)',
          titlefont: { size: 14 },
          automargin: true, // Ensure y-axis labels fit well
        },
        margin: {
          l: 60, // Space between the left edge and the chart
          r: 20, // Space between the right edge and the chart
          b: 60, // Space between the bottom edge and the chart
          t: 20, // Space between the top edge and the chart
        },
        width: 600, // Set chart width
        height: 400, // Set chart height
      }}
      config={config} // Apply the config object
    />
  );
};

export default TemperatureChart;
