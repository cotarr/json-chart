// main.js
//
// This file contains javascript intended to represent the main javascript in
// a typical web page. When the web page loads, a function is called to insert 
// the web component into the DOM and initialize it.
// -----------------------------------------------------------------------------

/**
 * Function to create example chart and insert the chart into the example web page.
 */
const insertChart = () => {
  const jsonChartEl = document.createElement('json-chart');

  const pointCount = 24;
  const chartWidthSeconds = 1 * 24 * 3600;
  const timestampExpirySeconds = Math.floor(3 * chartWidthSeconds / pointCount);

  // Choose this experimentally to constrain height for desired page vertical layout
  jsonChartEl.verticalPaddingPx = 220;
  
  // The vertical range is a required configuration
  jsonChartEl.vertAxisMinRange = 0.0;
  jsonChartEl.vertAxisMaxRange = 100.0;

  jsonChartEl.chartWidthSeconds = chartWidthSeconds;
  jsonChartEl.timestampExpirySeconds = timestampExpirySeconds;

  jsonChartEl.chartTitle = 'The Chart Title';
  jsonChartEl.chartSubtitle = 'Chart Sub-title Text';

  // If a vertical ruler is desired, it must be generated manually.
  jsonChartEl.leftAxisTitle = 'Percent (0-100)';
  jsonChartEl.leftRulerLabels = ['80', '60', '40', '20'];
  jsonChartEl.leftRulerWidth = 21;

  jsonChartEl.plotLineModes = ['line', 'step'];
  jsonChartEl.plotLineColors = ['#ffdd00', '#00ffff'];

  jsonChartEl.bottomRulerMode = 'clock';

  document.getElementById('chartEnclosingDiv').appendChild(jsonChartEl)

  //
  // This code generates dummy data for making a line plot of 2 lines
  //
  const timeNow = parseInt(Date.now() / 1000); // seconds
  const dataPoints = [];
  const yIncrement = 100 / pointCount;
  const xIncrement = Math.floor(chartWidthSeconds / pointCount);
  const startTime = timeNow - (xIncrement * pointCount);
  for (let i = 0; i < pointCount + 1; i++) {
    // Timestamp (unix seconds as integer, type number)
    const tempData = [startTime + (i * xIncrement)];
    // Data 1 (type number)
    tempData.push(i * yIncrement);
    // Data 2 (type number)
    tempData.push(i * yIncrement * 0.5);
    dataPoints.push(tempData);
  }
  // console.log(JSON.stringify(dataPoints, null, 2));

  //
  // Generate the chart and plot the data
  //
  jsonChartEl.initializePlugin(dataPoints);
} // insertChart()

// Call function to insert chart.
insertChart();
