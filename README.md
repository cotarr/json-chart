# json-chart

Simple 2D line chart to display timestamped data values using a canvas element in a HTML web component.

## Description

- Written as a v1 web component (Custom element).
- Configurable using HTML attributes or javascript object properties.
- Horizontal time axis auto-ranging from hours to years
- Vertical axis minimum, maximum data range is manual configuration only.
- Vertical axis grid line labels are manual configuration only.
- Configurable canvas plot colors
- Configurable values title, subtitle and axis titles
- CSS styles for chart titles and background located outside of canvas element are inherited from parent elements.

## Files

| Files               | Description                        |
| ------------------- | ---------------------------------- |
| src/json-chart.html | HTML template file with inline CSS |
| src/json-chart.js   | Initializing JavaScript.           |

## Try the example Demo page

The following instructions are intended to demonstrate json-chart in a demo web page.

The bash script will use "demo\html\" as a build folder.
The json-chart web component files will be compiled from the "\src\" folder
into the "\demo\html" folder.

Clone the repository from GitHub and change directory to the repository folder.
Change directory to the demo folder.
Examine the `build_demo.sh` script, and if you are comfortable with the script run it.
The script will generate "index.html", "js/main.js", "css/styles.css" located in the "html" folder

```bash
git clone https://github.com/cotarr/json-chart.git
cd json-chart
cd demo
./build_demo.sh
```

To run the demo, open the following file in your browser. It may be opened directly 
from the folder without a server, or opened using VSCode live server.

```
demo/html/index.html
```

To remove the demo build files, run the clean script.
Cleaning is not necessary because the files are included in the .gitignore file.

```bash
cd demo
./clean_demo.sh
```

## How to add the json-chart web component to a page

The json-chart web component must be defined as a custom element so that 
the tags `<json-chart></json-chart>` will be recognized for future use.

This includes 2 parts, the HTML template and initializing JavaScript.
The web component CSS styles are included in the HTML template as inline styles.

- Add the contents of the template file "json-chart.html" into the parent web HTML page.

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body>
  <!-- Insert contents from the file "json-chart.html" starting here -->
  <template id='jsonChartTemplate'>
    <!-- Template contents not shown -->
  </template>
  <!-- End of inserted template -->

  <div>
     <!-- Main content of the web page goes here -->
  </div>
</body></html>
```

The json-chart JavaScript should be run before the web page main JavaScript file executes.
This can be done several ways. 

- Call the initializing script using a script tag

```html
<head>
  <!-- json-chart is called before the main page javascript -->
  <script src="./js/json-chart.js" defer></script>
  <script src="./js/main.js" defer></script>
</head>
```

- Alternate method, bundle the JavaScript into 1 file (see demo folder)

```html
<head>
  <!-- The main.js file has contents of json-chart.js prepended into main.js by a bundling build tool-->
  <script src="./js/main.js" defer></script>
</head>
```

## How to add a chart to the page

There are two different methods to add the web component.

- Method 1 - Insert the "<json-chart>" tag into the html file as html with configuration settings as attributes.
- Method 2 - Programmatically create the "json-chart" element with configuration settings as object properties.

### Method 1 - Insert chart using HTML (Example)

```html
<json-chart id="jsonChartId"
  chart-title="My Chart Title"
  chart-subtitle="My Subtitle"
  vert-axis-min-range="0.0"
  vert-axis-max-range="100.0"
  left-axis-title="Percent"
  left-axis-labels="80,60,40,20"
  left-ruler-width="21"
  bottom-ruler-mode="clock" ></json-chart>
```

### Method 2 - Insert chart programmatically (Example)

```js
  const jsonChartEl = document.createElement('json-chart');
  jsonChartEl.id="jsonChartId"
  jsonChartEl.chartTitle = 'My Chart Title';
  jsonChartEl.chartSubtitle = 'My Subtitle';
  jsonChartEl.vertAxisMinRange = 0.0;
  jsonChartEl.vertAxisMaxRange = 100.0;
  jsonChartEl.leftAxisTitle = 'Percent';
  jsonChartEl.leftRulerLabels = ['80', '60', '40', '20'];
  jsonChartEl.leftRulerWidth = 21;
  jsonChartEl.bottomRulerMode = 'clock';
  document.getElementById('chartEnclosingDiv').appendChild(jsonChartEl)
```

## How to initialize the chart and draw lines

Generate the chart by calling the initializePlugin() method passing 
in the timestamped data as an argument.

```js
const data = [
  [1702218566, 0],
  [1702227206, 10],
  [1702235846, 20],
  [1702244486, 30],
  [1702253126, 40],
  [1702261766, 50],
  [1702270406, 60],
  [1702279046, 70],
  [1702287686, 80],
  [1702296326, 90],
  [1702304966, 100]
]

const jsonChartEl = document.getElementById('jsonChartId);
jsonChartEl.initializePlugin(data);
```

## Reference

### Public Methods

- initializePlugin(data) 

Call this method to create a new canvas element, 
add it to the DOM, and draw the data lines, grid lines and ruler labels.
The argument "data" is an array of timestamped data values (Example shown above).
Each data value is an array of 2 or more elements (array of arrays)
The first element is a timestamp in unix seconds as an integer.
The second element is a floating point number.
Additional elements are optional which can be used to plot multiple lines on one chart.

### Properties and Attributes

|  Object Property        | HTML Attribute             | Type | Description                                |
| ----------------------- | -------------------------- | ---- | ------------------------------------------ | 
| vertAxisMinRange        | vert-axis-min-range        | Req  | Required value to generate plot            |
| vertAxisMaxRange        | vert-axis-max-range        | Req  | Required value to generate plot            |
|                         |                            |      |                                            |
| chartTitle              | chart-title                | Opt  | Chart title centered above cart            |
| chartSubtitle           | chart-subtitle             | Opt  | Sub-title centered below title             |
| verticalPaddingPx       | vertical-padding-px        | Opt  | Set to avoid vertical scroll bar           |
| chartWidthSeconds       | chart-width-seconds        | Opt  | fixed data with of chart                   |
| timestampExpirySeconds  | timestamp-expiry-seconds   | Opt  | Skip line segments when data is missing    |
| plotLineModes           | plot-line-modes            | Opt  | ['line', 'step', 'fill'], "line,step,fill' |
| plotLineColors          | plot-line-colors           | Opt  | ['#ff0000', '#ffffff'], '#ff0000,#ffffff'  |
| canvasGridColor         | canvas-grid-color          | Opt  | Default = '#404040'                        |
| canvasTextColor         | canvas-text-color          | Opt  | Default = '#E0E0E0'                        |
| canvasFillColor         | canvas-fill-color          | Opt  | Default = '#101010'                        |
| canvasRulerFillColor    | canvas-ruler-fill-color    | Opt  | Default = '#404040'                        |
| leftAxisTitle           | left-axis-title            | Opt  | Left of chart rotated vertically           |
| leftRulerWidth          | left-ruler-width           | Opt  | Default=13 for 1 digit number (pixels)     |
| leftRulerLabels         | left-ruler-labels          | Opt  | ['75','50','25'], '75,50,25'               |
| bottomAxisTitle         | bottom-axis-title          | Opt  | Below chart centered horizontally          |
| bottomRulerHeight       | bottom-ruler-height        | Opt  | Default set to left ruler width (pixels)   |
| BottomRulerMode         | bottom-ruler-mode          | Opt  | 'clock' or 'none'                          |
| minimumCanvasHeight     | minimum-canvas-height      | Opt  | Optional to constrain size                 |
| maximumCanvasHeight     | maximum-canvas-height      | Opt  | Optional to constrain size                 |
| minimumCanvasWidth      | minimum-canvas-width       | Opt  | Optional to constrain size                 |
| maximumCanvasWidth      | maximum-canvas-width       | Opt  | Optional to constrain size                 |
| sort                    | sort                       | Opt  | Set "none" to disable sort                 |
