// json-chart.js v1.0.2
//
//       HTML Canvas layout
//
//       Axis scale numbers are text within the chart
//       Canvas coordinate 0, 0 is upper left
//       Titles are outside canvas coded as HTML element textContent.
//
//                 Title
//               Sub-title
//      X ---
//  Y   -----------------------------------
//  |   |   |         .         .         |
//  |   |   |         .         .         |
//      | 3 | . . . . . . . . . . . . . . |
//      |   |         .         .         |
//    A |   |         .         .         |
//    x |   |         .         .         |
//    i | 2 | . . . . . . . . . . . . . . |
//    s |   |         .         .         |
//      |   |         .         .         |
//    T |   |         .         .         |
//    i | 1 | . . . . . . . . . . . . . . |
//    t |   |         .         .         |
//    l |   |         .         .         |
//    e |   |         .         .         |
//      |   | . . . . . . . . . . . . . . |
//      |           10:00     11:00       |
//      |           Apr 8     Apr 8       |
//      -----------------------------------
//                   Axis title
//
//
// Function wrapper to limit name-space scope of variable and function names.
(function () {
  /**
   *  json-chart V1 Web component
   */
  window.customElements.define('json-chart', class extends HTMLElement {
    constructor () {
      super();
      const template = document.getElementById('jsonChartTemplate');
      const templateContent = template.content;
      this.attachShadow({ mode: 'open' })
        .appendChild(templateContent.cloneNode(true));
      this.dataArray = [];
      this.dataSubmitTimestamp = null;
      this.widthBreakpoint = 500;
      this.monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May',
        'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    // Getters and Setters

    get chartTitle () {
      return this.getAttribute('chart-title');
    }

    set chartTitle (val) {
      if (val) {
        this.setAttribute('chart-title', val);
      } else {
        this.removeAttribute('chart-title');
      }
    }

    get chartSubtitle () {
      return this.getAttribute('chart-subtitle');
    }

    set chartSubtitle (val) {
      if (val) {
        this.setAttribute('chart-subtitle', val);
      } else {
        this.removeAttribute('chart-subtitle');
      }
    }

    //
    // By default, the canvas element will be created to fill
    // the available vertical space returned from window.innerHeight.
    // To achieve page layout, the verticalPaddingPx may be optionally
    // set to a non-zero value to reduce the vertical size of the canvas
    // element by this amount. For example, if the page has a header bar
    // at the top, the size of the canvas can be reduced by the
    // height of the header bar allowing both header bar and
    // canvas element to fill the page without scrolling.
    //
    get verticalPaddingPx () {
      if (this.hasAttribute('vertical-padding-px')) {
        return parseInt(this.getAttribute('vertical-padding-px'));
      } else {
        return null;
      }
    }

    set verticalPaddingPx (val) {
      this.setAttribute('vertical-padding-px', val.toString());
    }

    get vertAxisMinRange () {
      if (this.hasAttribute('vert-axis-min-range')) {
        return parseFloat(this.getAttribute('vert-axis-min-range'));
      } else {
        return null;
      }
    }

    set vertAxisMinRange (val) {
      this.setAttribute('vert-axis-min-range', val.toString());
    }

    get vertAxisMaxRange () {
      if (this.hasAttribute('vert-axis-max-range')) {
        return parseFloat(this.getAttribute('vert-axis-max-range'));
      } else {
        return null;
      }
    }

    set vertAxisMaxRange (val) {
      this.setAttribute('vert-axis-max-range', val.toString());
    }

    get chartWidthSeconds () {
      if (this.hasAttribute('chart-width-seconds')) {
        return parseInt(this.getAttribute('chart-width-seconds'));
      } else {
        return null;
      }
    }

    // Set property null to remove attribute)
    set chartWidthSeconds (val) {
      if (val) {
        this.setAttribute('chart-width-seconds', val.toString());
      } else {
        this.removeAttribute('chart-width-seconds');
      }
    }

    get timestampExpirySeconds () {
      if (this.hasAttribute('timestamp-expiry-seconds')) {
        return parseInt(this.getAttribute('timestamp-expiry-seconds'));
      } else {
        return null;
      }
    }

    // Set property null to remove attribute)
    set timestampExpirySeconds (val) {
      if (val) {
        this.setAttribute('timestamp-expiry-seconds', val.toString());
      } else {
        this.removeAttribute('timestamp-expiry-seconds');
      }
    }

    // As object: ["line", "step", "fill"]
    // As attribute "line,step,fill"
    get plotLineModes () {
      let modesArray = null;
      if (this.hasAttribute('plot-line-modes')) {
        const modesStr = this.getAttribute('plot-line-modes').toLowerCase();
        if ((modesStr) && (modesStr.length > 0)) {
          modesArray = modesStr.split(',');
        }
      }
      // console.log('modesArray', JSON.stringify(modesArray));
      return modesArray;
    }

    set plotLineModes (val) {
      let modesStr = null;
      if ((val) && (Array.isArray(val)) && (val.length > 0)) {
        modesStr = '';
        for (let i = 0; i < val.length; i++) {
          if (i > 0) modesStr += ',';
          modesStr += val[i];
        }
      }
      if (modesStr) {
        this.setAttribute('plot-line-modes', modesStr);
      } else {
        this.removeAttribute('plot-line-modes');
      }
    }

    // Format, as object: ["#ffffff", "#ffffff"]
    // Format, as attribute:  "#ffffff,#ffffff"
    get plotLineColors () {
      let colorsArray = null;
      if (this.hasAttribute('plot-line-colors')) {
        const colorsStr = this.getAttribute('plot-line-colors').toLowerCase();
        if ((colorsStr) && (colorsStr.length > 0)) {
          colorsArray = colorsStr.split(',');
        }
      }
      // console.log('colorsArray', JSON.stringify(colorsArray));
      return colorsArray;
    }

    set plotLineColors (val) {
      let colorsStr = null;
      if ((val) && (Array.isArray(val)) && (val.length > 0)) {
        colorsStr = '';
        for (let i = 0; i < val.length; i++) {
          if (i > 0) colorsStr += ',';
          colorsStr += val[i];
        }
      }
      if (colorsStr) {
        this.setAttribute('plot-line-colors', colorsStr);
      } else {
        this.removeAttribute('plot-line-colors');
      }
    }

    get canvasGridColor () {
      return this.getAttribute('canvas-grid-color');
    }

    // Format '#ffffff'
    set canvasGridColor (val) {
      if (val) {
        this.setAttribute('canvas-grid-color', val);
      } else {
        this.removeAttribute('canvas-grid-color');
      }
    }

    get canvasTextColor () {
      return this.getAttribute('canvas-text-color');
    }

    // Format '#ffffff'
    set canvasTextColor (val) {
      if (val) {
        this.setAttribute('canvas-text-color', val);
      } else {
        this.removeAttribute('canvas-text-color');
      }
    }

    get canvasFillColor () {
      return this.getAttribute('canvas-fill-color');
    }

    // Format '#ffffff'
    set canvasFillColor (val) {
      if (val) {
        this.setAttribute('canvas-fill-color', val);
      } else {
        this.removeAttribute('canvas-fill-color');
      }
    }

    get canvasRulerFillColor () {
      return this.getAttribute('canvas-ruler-fill-color');
    }

    // Format '#ffffff'
    set canvasRulerFillColor (val) {
      if (val) {
        this.setAttribute('canvas-ruler-fill-color', val);
      } else {
        this.removeAttribute('canvas-ruler-fill-color');
      }
    }

    get leftAxisTitle () {
      return this.getAttribute('left-axis-title');
    }

    set leftAxisTitle (val) {
      if (val) {
        this.setAttribute('left-axis-title', val);
      } else {
        this.removeAttribute('left-axis-title');
      }
    }

    get leftRulerWidth () {
      if (this.hasAttribute('left-ruler-width')) {
        return parseInt(this.getAttribute('left-ruler-width'));
      } else {
        return null;
      }
    }

    set leftRulerWidth (val) {
      if (val) {
        this.setAttribute('left-ruler-width', val.toString());
      } else {
        this.removeAttribute('left-ruler-width');
      }
    }

    //
    // This array of vertical labels is used to fill the left
    // ruler with equally spaced text labels and grid lines.
    // The top and bottom label must not be included.
    // For example a vertical axis ranging from 0 to 8 would have
    // values "1", "2", "3", "4", "5", "6", "7".
    // Labels for the top and bottom axis, 0 and 8, are not included
    //
    get leftRulerLabels () {
      let labelArray = null;
      const labelStr = this.getAttribute('left-ruler-labels');
      if ((labelStr) && (labelStr.length > 0) && (labelStr.indexOf(',') >= 0)) {
        labelArray = labelStr.split(',');
      }
      // console.log('labelArray', JSON.stringify(labelArray));
      return labelArray;
    }

    set leftRulerLabels (val) {
      let labelStr = null;
      if ((Array.isArray(val)) && (val.length > 1)) {
        labelStr = '';
        for (let i = 0; i < val.length; i++) {
          if (i > 0) labelStr += ',';
          labelStr += val[i];
        }
      }
      if (labelStr) {
        this.setAttribute('left-ruler-labels', labelStr);
      } else {
        this.removeAttribute('left-ruler-labels');
      }
    }

    // Generated automatically by clock mode unless override here
    get bottomAxisTitle () {
      return this.getAttribute('bottom-axis-title');
    }

    set bottomAxisTitle (val) {
      if (val) {
        this.setAttribute('bottom-axis-title', val);
      } else {
        this.removeAttribute('bottom-axis-title');
      }
    }

    get bottomRulerHeight () {
      if (this.hasAttribute('bottom-ruler-height')) {
        return parseInt(this.getAttribute('bottom-ruler-height'));
      } else {
        return null;
      }
    }

    set bottomRulerHeight (val) {
      if (val) {
        this.setAttribute('bottom-ruler-height', val.toString());
      } else {
        this.removeAttribute('bottom-ruler-height');
      }
    }

    get bottomRulerMode () {
      if (this.hasAttribute('bottom-ruler-mode')) {
        return this.getAttribute('bottom-ruler-mode');
      } else {
        return null;
      }
    }

    set bottomRulerMode (val) {
      if (val) {
        this.setAttribute('bottom-ruler-mode', val);
      } else {
        this.removeAttribute('bottom-ruler-mode');
      }
    }

    get minimumCanvasHeight () {
      if (this.hasAttribute('minimum-canvas-height')) {
        return parseInt(this.getAttribute('minimum-canvas-height'));
      } else {
        return null;
      }
    }

    set minimumCanvasHeight (val) {
      if (val) {
        this.setAttribute('minimum-canvas-height', val.toString());
      } else {
        this.removeAttribute('minimum-canvas-height');
      }
    }

    get maximumCanvasHeight () {
      if (this.hasAttribute('maximum-canvas-height')) {
        return parseInt(this.getAttribute('maximum-canvas-height'));
      } else {
        return null;
      }
    }

    set maximumCanvasHeight (val) {
      if (val) {
        this.setAttribute('maximum-canvas-height', val.toString());
      } else {
        this.removeAttribute('maximum-canvas-height');
      }
    }

    get minimumCanvasWidth () {
      if (this.hasAttribute('minimum-canvas-width')) {
        return parseInt(this.getAttribute('minimum-canvas-width'));
      } else {
        return null;
      }
    }

    set minimumCanvasWidth (val) {
      if (val) {
        this.setAttribute('minimum-canvas-width', val.toString());
      } else {
        this.removeAttribute('minimum-canvas-width');
      }
    }

    get maximumCanvasWidth () {
      if (this.hasAttribute('maximum-canvas-width')) {
        return parseInt(this.getAttribute('maximum-canvas-width'));
      } else {
        return null;
      }
    }

    set maximumCanvasWidth (val) {
      if (val) {
        this.setAttribute('maximum-canvas-width', val.toString());
      } else {
        this.removeAttribute('maximum-canvas-width');
      }
    }

    get sort () {
      if (this.hasAttribute('sort')) {
        return this.getAttribute('sort');
      } else {
        return null;
      }
    }

    set sort (val) {
      if ((val) || (val.toLowerCase() === 'none')) {
        this.setAttribute('sort', val);
      } else {
        this.removeAttribute('sort');
      }
    }

    // NOT USED, placeholder if needed
    //
    // static get observedAttributes() {
    //   // console.log('get observedAttributes');
    //   return ['attribute-name'];
    // }

    // attributeChangedCallback (name, oldVal, newVal) {
    //   // console.log('attributeChangedCallback ' + name + ' ' + oldVal + ' ' + newVal);
    //   if (name === 'attribute-name') {
    //     this.buildChart();
    //   }
    // }

    /**
     * _calcVerticalCanvasCoordFromIndex - Calculate horizontal pixel coordinate on canvas
     * @param {number} dataIndex - Index into this.dataArray (integer 0 to this.dataArray.length-1)
     * @param {object} canvasMap - Map of layout coordinates of browser canvas element
     * @returns {number} Returns integer horizontal (X) pixel coordinate or returns -1 on error.
     */
    _calcVerticalCanvasCoordFromIndex (dataIndex, canvasMap) {
      if (this.dataArray.length > 0) {
        // Each array entry is [time, data1] or [time, data1, data2] or [time, data1, data2, ...]
        if ((dataIndex >= 0) && (dataIndex < this.dataArray.length)) {
          // It is assumed that right side of chart will be current time from system clock
          // index [0] is timestamp in Unix seconds,  [1], [2]... are data
          const xTimestampSeconds = this.dataArray[dataIndex][0];
          // interpolate coordinates to convert real value to pixel position
          const x = Math.floor(canvasMap.leftRulerWidthPx +
            ((canvasMap.canvasWidthPx - canvasMap.leftRulerWidthPx) *
            ((xTimestampSeconds - canvasMap.timeRangeAtLeft) /
            (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft))));
          return x;
        } else {
          throw new Error('Index out of range');
          // return -1; // error
        }
      } else {
        return -1; // empty array
      }
    }; // _calcVerticalCanvasCoordFromIndex()

    /**
     * _calcHorizontalCanvasCoordFromIndex - Calculate vertical pixel coordinate on canvas
     * @param {number} dataIndex - Index into this.dataArray (integer 0 to this.dataArray.length-1)
     * @param {number} pointIndex - Data point index [0]=timestamp, [1]=data(1), [2]=data(2)...)
     * @param {object} canvasMap - Map of layout coordinates of browser canvas element
     * @returns {number} Returns integer vertical (Y) pixel coordinate or returns -1 on error.
     */
    _calcHorizontalCanvasCoordFromIndex (dataIndex, pointIndex, canvasMap) {
      if (this.dataArray.length > 0) {
        // Each array entry is [time, data1] or [time, data1, data2] or [time, data1, data2, ...]
        // The dataIndex is to select data1 or data2 value at index 1 or 2 for horizontal position
        if ((dataIndex >= 0) && (dataIndex < this.dataArray.length)) {
          // pointIndex [0] is timestamp,  [1], [2]... are data
          const yData = this.dataArray[dataIndex][pointIndex];
          // interpolate coordinates to convert real value to pixel position
          let y = parseInt((canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) -
            ((canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) *
            ((yData - canvasMap.dataRangeAtBottom) /
            (canvasMap.dataRangeAtTop - canvasMap.dataRangeAtBottom))));
          if (y < 0) {
            y = 0;
          }
          if (y > canvasMap.canvasHeightPx) {
            y = canvasMap.canvasHeightPx;
          }
          return y;
        } else {
          throw new Error('Index out of range');
          // return -1; // error
        }
      } else {
        return -1; // empty array
      }
    }; // _calcHorizontalCanvasCoordFromIndex

    /**
     * Draws left ruler and horizontal grid lines into canvas
     * @param {object} context - Browser chart context
     * @param {object} canvasMap - Object contains pay layout coordinates for canvas
     * @param {string[]} leftRulerLabelArray - Array of strings to form left ruler grid labels
     */
    _generateLeftRuler (context, canvasMap, leftRulerLabelArray) {
      if (canvasMap.leftRulerWidthPx > 0) {
        context.fillStyle = '#404040';
        if (this.hasAttribute('canvas-ruler-fill-color')) {
          context.fillStyle = this.getAttribute('canvas-ruler-fill-color');
        }
        // 0, 0, W, H
        context.fillRect(0, 0, canvasMap.leftRulerWidthPx, canvasMap.canvasHeightPx);
      }
      if (leftRulerLabelArray.length > 0) {
        // Vertical axis labels (Array of strings)
        const leftRulerLabelCount = leftRulerLabelArray.length + 1;
        const leftRulerTextPaddingLeftPx = 3;
        const rightGridLinePaddingPx = 2;
        const leftRulerTopLabelY = ((canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) /
          leftRulerLabelCount) + 4; // add 4 for font height / 2
        const vertAxisGridLineStepPx = (canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) /
          leftRulerLabelCount;
        const vertAxisGridTopLineCoordY =
          (canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) /
          leftRulerLabelCount + 0;
        const vertAxisGridLineRight = canvasMap.canvasWidthPx - rightGridLinePaddingPx;
        const vertAxisGridLineSpacing = (canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) /
          leftRulerLabelCount;

        // Draw left ruler text labels into canvas
        context.font = canvasMap.rulerFont;
        context.fillStyle = '#e0e0e0';
        if (this.hasAttribute('canvas-text-color')) {
          context.fillStyle = this.getAttribute('canvas-text-color');
        }
        for (let i = 0; i < leftRulerLabelArray.length; i++) {
          context.fillText(leftRulerLabelArray[i], leftRulerTextPaddingLeftPx,
            leftRulerTopLabelY + (i * vertAxisGridLineStepPx));
        }
        // Draw left ruler horizontal grid lines into canvas
        context.strokeStyle = '#404040';
        if (this.hasAttribute('canvas-grid-color')) {
          context.strokeStyle = this.getAttribute('canvas-grid-color');
        }
        for (let i = 0; i < leftRulerLabelArray.length; i++) {
          context.beginPath();
          context.moveTo(canvasMap.leftRulerWidthPx,
            vertAxisGridTopLineCoordY + (vertAxisGridLineSpacing * i));
          context.lineTo(vertAxisGridLineRight,
            vertAxisGridTopLineCoordY + vertAxisGridLineSpacing * i);
          context.stroke();
        }
      }
    }; //  _generateLeftRuler()

    /**
     * Function used to box fill lower ruler area for appearance purposes (without ruler)
     * @param {object} context - Browser chart context
     * @param {object} canvasMap - Object contains pay layout coordinates for canvas
     */
    _generateBottomRulerWithoutContent (context, canvasMap) {
      if (canvasMap.bottomRulerHeightPx > 0) {
        context.fillStyle = '#404040';
        if (this.hasAttribute('canvas-ruler-fill-color')) {
          context.fillStyle = this.getAttribute('canvas-ruler-fill-color');
        }
        context.fillRect(0,
          (canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx),
          canvasMap.canvasWidthPx, canvasMap.canvasHeightPx);
      }
    };

    /**
     * Generate bottom ruler and grid lines, auto-scale, showing unix date/time
     * of data point timestamps.
     * @param {object} context - Browser chart context
     * @param {object} canvasMap - Object contains pay layout coordinates for canvas
     */
    _generateBottomRulerUsingSystemClock (context, canvasMap) {
      // console.log('canvasMap', JSON.stringify(canvasMap, null, 2));
      let intervalUnitLabel = 'Data Timestamp';
      let previousJsTime;
      let previousTime;
      let prevInterval;
      let previousXpx;
      let upperStr;
      let lowerStr;

      const secondsPerPixel = Math.floor(
        (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft) / canvasMap.canvasWidthPx);
      let mode = 'hours';
      if (secondsPerPixel > 862) mode = 'days';
      if (secondsPerPixel > 26000) mode = 'months';
      // console.log('secondsPerPixel', secondsPerPixel, 'mode', mode);

      if (mode === 'hours') {
        function hourSpacingPx (interval) {
          let count = Math.floor(
            (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft) /
            (interval * 3600));
          if (count < 1) count = 1;
          const widthPx = Math.floor(canvasMap.canvasWidthPx / count);
          // console.log('widthPx', widthPx);
          return widthPx;
        }
        prevInterval = 1;
        if (hourSpacingPx(prevInterval) < 50) prevInterval = 2;
        if (hourSpacingPx(prevInterval) < 50) prevInterval = 3;
        if (hourSpacingPx(prevInterval) < 50) prevInterval = 6;
        if (hourSpacingPx(prevInterval) < 50) prevInterval = 12;
        if (hourSpacingPx(prevInterval) < 50) prevInterval = 24;

        previousJsTime = new Date(canvasMap.chartCreateTimestamp * 1000);
        previousJsTime.setMilliseconds(0);
        previousJsTime.setSeconds(0);
        previousJsTime.setMinutes(0);
        previousJsTime.setHours(
          Math.floor(previousJsTime.getHours() / prevInterval) * prevInterval);
        previousTime = Math.floor(previousJsTime.getTime() / 1000);
        previousXpx = Math.floor(canvasMap.canvasWidthPx -
          ((canvasMap.canvasWidthPx - canvasMap.leftRulerWidthPx) *
          ((canvasMap.timeRangeAtRight - previousTime) /
          (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft))));
        // console.log('previousJsTime', previousJsTime, 'previousTime', previousTime,
        //   'previousXpx', previousXpx);
      }

      if (mode === 'days') {
        function daySpacingPx (interval) {
          let count = Math.floor(
            (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft) /
            (interval * 24 * 3600));
          if (count < 1) count = 1;
          const widthPx = Math.floor(canvasMap.canvasWidthPx / count);
          // console.log('widthPx', widthPx);
          return widthPx;
        }
        prevInterval = 1;
        if (daySpacingPx(prevInterval) < 50) prevInterval = 2;
        if (daySpacingPx(prevInterval) < 50) prevInterval = 4;
        if (daySpacingPx(prevInterval) < 50) prevInterval = 7;
        if (daySpacingPx(prevInterval) < 50) prevInterval = 15;

        previousJsTime = new Date(canvasMap.chartCreateTimestamp * 1000);
        previousJsTime.setMilliseconds(0);
        previousJsTime.setSeconds(0);
        previousJsTime.setMinutes(0);
        previousJsTime.setHours(0);
        let nextDate = Math.floor(previousJsTime.getDate() / prevInterval) * prevInterval;
        if (nextDate === 0) nextDate = prevInterval;
        previousJsTime.setDate(nextDate);
        previousTime = Math.floor(previousJsTime.getTime() / 1000);
        previousXpx = Math.floor(canvasMap.canvasWidthPx -
          ((canvasMap.canvasWidthPx - canvasMap.leftRulerWidthPx) *
          ((canvasMap.timeRangeAtRight - previousTime) /
          (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft))));
        // console.log('previousJsTime', previousJsTime, 'previousTime', previousTime,
        //   'previousXpx', previousXpx);
      }

      if (mode === 'months') {
        function monthSpacingPx (interval) {
          // 365.25 / 12 = average days per month
          let count = Math.floor(
            (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft) /
            (interval * (365.25 / 12) * 24 * 3600));
          if (count < 1) count = 1;
          // console.log('interval', interval, 'count', count);
          const widthPx = Math.floor(canvasMap.canvasWidthPx / count);
          // console.log('widthPx', widthPx);
          return widthPx;
        }
        prevInterval = 1;
        if (monthSpacingPx(prevInterval) < 50) prevInterval = 2;
        if (monthSpacingPx(prevInterval) < 50) prevInterval = 3;
        if (monthSpacingPx(prevInterval) < 50) prevInterval = 6;
        if (monthSpacingPx(prevInterval) < 50) prevInterval = 12;
        if (monthSpacingPx(prevInterval) < 50) prevInterval = 24;
        if (monthSpacingPx(prevInterval) < 50) prevInterval = 48;

        previousJsTime = new Date(canvasMap.chartCreateTimestamp * 1000);
        previousJsTime.setMilliseconds(0);
        previousJsTime.setSeconds(0);
        previousJsTime.setMinutes(0);
        previousJsTime.setHours(0);
        previousJsTime.setDate(1);
        const nextMonth = Math.floor(previousJsTime.getMonth() / prevInterval) * prevInterval;
        previousJsTime.setMonth(nextMonth);
        previousTime = Math.floor(previousJsTime.getTime() / 1000);
        previousXpx = Math.floor(canvasMap.canvasWidthPx -
          ((canvasMap.canvasWidthPx - canvasMap.leftRulerWidthPx) *
          ((canvasMap.timeRangeAtRight - previousTime) /
          (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft))));
        // console.log('previousJsTime', previousJsTime, 'previousTime', previousTime,
        //   'previousXpx', previousXpx);
      }

      if (this.hasAttribute('bottom-axis-title')) {
        intervalUnitLabel = this.getAttribute('bottom-axis-title');
      }

      if (canvasMap.bottomRulerHeightPx > 0) {
        context.fillStyle = '#404040';
        if (this.hasAttribute('canvas-ruler-fill-color')) {
          context.fillStyle = this.getAttribute('canvas-ruler-fill-color');
        }
        context.fillRect(0,
          (canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx),
          canvasMap.canvasWidthPx, canvasMap.canvasHeightPx);
      }

      // console.log('intervalSeconds', intervalSeconds);
      const bottomRulerTextPaddingBottomPx1 = 18;
      const bottomRulerTextPaddingBottomPx2 = 5;
      let bottomRulerTextOffsetLeftPx1 = 0;
      let bottomRulerTextOffsetLeftPx2 = 0;

      this.shadowRoot.getElementById('bottomRulerTitleId').textContent = intervalUnitLabel;

      while (previousTime > canvasMap.timeRangeAtLeft) {
        // console.log('previousJsTime', previousJsTime, 'previousTime', previousTime,
        //   'previousXpx', previousXpx);

        // ----------------------------------
        // Draw vertical grid lines on chart
        // ----------------------------------
        context.strokeStyle = '#404040';
        if (this.hasAttribute('canvas-grid-color')) {
          context.strokeStyle = this.getAttribute('canvas-grid-color');
        }
        context.beginPath();
        context.moveTo(previousXpx, 0);
        context.lineTo(previousXpx, (canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx));
        context.stroke();

        // -------------------------------------------
        // Build text string for bottom ruler labels
        // -------------------------------------------
        if (mode === 'hours') {
          upperStr = previousJsTime.getHours().toString() + ':00';
          if (previousJsTime.getHours() < 10) upperStr = '0' + upperStr;
          lowerStr = this.monthArray[previousJsTime.getMonth()] + ' ' +
            previousJsTime.getDate();
          bottomRulerTextOffsetLeftPx1 = -15;
          bottomRulerTextOffsetLeftPx2 = bottomRulerTextOffsetLeftPx1 - 5;
          if (previousJsTime.getDate() < 10) {
            bottomRulerTextOffsetLeftPx2 = bottomRulerTextOffsetLeftPx1 - 0;
          }
        } else if ((mode === 'days') || (mode === 'months')) {
          upperStr = this.monthArray[previousJsTime.getMonth()] + ' ' +
            previousJsTime.getDate();
          lowerStr = previousJsTime.getFullYear();
          bottomRulerTextOffsetLeftPx1 = -18;
          bottomRulerTextOffsetLeftPx2 = bottomRulerTextOffsetLeftPx1 + 5;
          if (previousJsTime.getDate() < 10) {
            bottomRulerTextOffsetLeftPx1 = bottomRulerTextOffsetLeftPx1 + 4;
          }
        } else {
          upperStr = '^';
          lowerStr = '';
          bottomRulerTextOffsetLeftPx1 = -3;
          bottomRulerTextOffsetLeftPx2 = bottomRulerTextOffsetLeftPx1 - 0;
        }

        // ------------------------------
        // Draw text into bottom ruler
        // ------------------------------
        // console.log(previousXpx - canvasMap.leftRulerWidthPx);
        if ((previousXpx + bottomRulerTextOffsetLeftPx1 > 25) &&
          (previousXpx < canvasMap.canvasWidthPx - 25)) {
          context.font = canvasMap.rulerFont;
          context.fillStyle = '#E0E0E0';
          if (this.hasAttribute('canvas-text-color')) {
            context.fillStyle = this.getAttribute('canvas-text-color');
          }
          context.fillText(upperStr,
            previousXpx + bottomRulerTextOffsetLeftPx1,
            (canvasMap.canvasHeightPx - bottomRulerTextPaddingBottomPx1));
          context.fillText(lowerStr,
            previousXpx + bottomRulerTextOffsetLeftPx2,
            (canvasMap.canvasHeightPx - bottomRulerTextPaddingBottomPx2));
        }

        // -----------------------------------------
        // Increment time/date value to next value
        // -----------------------------------------
        if (mode === 'hours') {
          previousJsTime.setHours(previousJsTime.getHours() - prevInterval);
        } else if (mode === 'days') {
          previousJsTime.setDate(previousJsTime.getDate() - prevInterval);
        } else if (mode === 'months') {
          previousJsTime.setMonth(previousJsTime.getMonth() - prevInterval);
        } else {
          previousTime = canvasMap.timeRangeAtLeft - 1;
          throw new Error('Forced exit infinite loop');
        }
        previousTime = Math.floor(previousJsTime.getTime() / 1000);
        previousXpx = Math.floor(canvasMap.canvasWidthPx -
          ((canvasMap.canvasWidthPx - canvasMap.leftRulerWidthPx) *
          ((canvasMap.timeRangeAtRight - previousTime) /
          (canvasMap.timeRangeAtRight - canvasMap.timeRangeAtLeft))));
      };
    }; // _generateBottomRulerUsingSystemClock ()

    /**
     * Create canvas element and draw the chart
     * Uses this.dataArray[] as data source, must be populated before call.
     */
    buildChart () {
      const canvasMap = {
        chartCreateTimestamp: this.dataSubmitTimestamp,
        rulerFont: '12px arial',
        verticalPadding: 0,
        canvasWidthPx: 0,
        canvasHeightPx: 0,
        leftRulerWidthPx: 0,
        bottomRulerHeightPx: 0,
        dataRangeAtBottom: 0,
        dataRangeAtTop: 0,
        timeRangeAtLeft: 0,
        timeRangeAtRight: 0
      };

      // Case of build called without data timestamp, use clock
      if (canvasMap.chartCreateTimestamp == null) {
        canvasMap.chartCreateTimestamp = Math.floor(Date.now() / 1000);
      }

      // size to page, allow room for buttons and title
      // This is provided by the parent web page to define the height of the canvas
      if (this.hasAttribute('vertical-padding-px')) {
        canvasMap.verticalPadding = parseInt(this.getAttribute('vertical-padding-px'));
      }

      // -------------------------------------------
      // Parse data from web component attributes
      // -------------------------------------------

      // By default, each chart point is connected to the previous with a line segment.
      // If a gap in available data exists, this provides a method
      // to discontinue the plot line, leaving a black space over this missing data
      let timestampErrorExpiry = null;
      if (this.hasAttribute('timestamp-expiry-seconds')) {
        timestampErrorExpiry = parseInt(this.getAttribute('timestamp-expiry-seconds'));
      }

      // vertical range in real floating point values
      canvasMap.dataRangeAtBottom = this.getAttribute('vert-axis-min-range');
      canvasMap.dataRangeAtTop = this.getAttribute('vert-axis-max-range');

      let leftRulerLabelArray = [];
      try {
        const labelStr = this.getAttribute('left-ruler-labels');
        if ((labelStr) && (labelStr.length > 0) && (labelStr.indexOf(',') >= 0)) {
          leftRulerLabelArray = labelStr.split(',');
        }
        if ((!(Array.isArray(leftRulerLabelArray))) || leftRulerLabelArray.length < 2) {
          // throw new Error('left-ruler-labels deserialization error');
          leftRulerLabelArray = [];
        }
      } catch (err) {
        const errStr = err.message || err.toString() || 'Error';
        console.log(err);
        console.log(this.getAttribute('left-ruler-labels'));
      }

      let plotLineModes = null;
      if (this.hasAttribute('plot-line-modes')) {
        const temp = this.getAttribute('plot-line-modes').toLowerCase();
        if ((temp) && (temp.length > 0)) {
          plotLineModes = temp.split(',');
        }
      }

      let plotLineColors = null;
      if (this.hasAttribute('plot-line-colors')) {
        const temp = this.getAttribute('plot-line-colors');
        if ((temp) && (temp.length > 0)) {
          plotLineColors = temp.split(',');
        }
      }

      // ----------------------
      // Set Title and Footer
      // ----------------------
      this.shadowRoot.getElementById('chartTitle').textContent =
        // window.innerHeight;
        this.getAttribute('chart-title');
      this.shadowRoot.getElementById('chartSubtitle').textContent =
        this.getAttribute('chart-subtitle');
      // Later code will measure size of left title to calculate canvas size
      this.shadowRoot.getElementById('leftAxisTitleId').textContent =
        this.getAttribute('left-axis-title');
      // the bottom axis title may be overwritten by the bottom ruler
      this.shadowRoot.getElementById('bottomRulerTitleId').textContent =
        this.getAttribute('bottom-axis-title');

      // -------------------------------------------------
      // setup browser canvas object and render graph
      // -------------------------------------------------

      //
      // Canvas Width Calculation
      //
      const webComponentEl = this.shadowRoot.getElementById('elemContainer');
      const webComponentWidth = webComponentEl.getBoundingClientRect().width;
      const leftAxisTitleEl = this.shadowRoot.getElementById('leftAxisTitleId');
      const leftAxisTitleWidthPx = leftAxisTitleEl.getBoundingClientRect().width;
      canvasMap.canvasWidthPx = webComponentWidth - leftAxisTitleWidthPx - 5;

      if (this.hasAttribute('minimum-canvas-width')) {
        const minimumCanvasWidthPx = parseInt(this.getAttribute('minimum-canvas-width'));
        if (canvasMap.canvasWidthPx < minimumCanvasWidthPx) {
          canvasMap.canvasWidthPx = minimumCanvasWidthPx;
        }
      }

      if (this.hasAttribute('maximum-canvas-width')) {
        const maximumCanvasWidthPx = parseInt(this.getAttribute('maximum-canvas-width'));
        if (canvasMap.canvasWidthPx > maximumCanvasWidthPx) {
          canvasMap.canvasWidthPx = maximumCanvasWidthPx;
        }
      }

      canvasMap.canvasHeightPx = window.innerHeight - canvasMap.verticalPadding;

      if (this.hasAttribute('minimum-canvas-height')) {
        const minimumCanvasHeightPx = parseInt(this.getAttribute('minimum-canvas-height'));
        if (canvasMap.canvasHeightPx < minimumCanvasHeightPx) {
          canvasMap.canvasHeightPx = minimumCanvasHeightPx;
        }
      }

      if (this.hasAttribute('maximum-canvas-height')) {
        const maximumCanvasHeightPx = parseInt(this.getAttribute('maximum-canvas-height'));
        if (canvasMap.canvasHeightPx > maximumCanvasHeightPx) {
          canvasMap.canvasHeightPx = maximumCanvasHeightPx;
        }
      }
      // console.log('canvas(W,H): ' + canvasMap.canvasWidthPx + ' x ' + canvasMap.canvasHeightPx);

      //
      // Initialize Canvas
      //
      const canvasElement = this.shadowRoot.getElementById('canvasElementId');
      const context = canvasElement.getContext('2d');

      canvasElement.setAttribute('width', canvasMap.canvasWidthPx);
      canvasElement.setAttribute('height', canvasMap.canvasHeightPx);

      context.fillStyle = '#101010';
      if (this.hasAttribute('canvas-fill-color')) {
        context.fillStyle = this.getAttribute('canvas-fill-color');
      }
      // 0, 0, W, H
      context.fillRect(0, 0, canvasMap.canvasWidthPx, canvasMap.canvasHeightPx);

      if (leftRulerLabelArray.length > 0) {
        // Default value for 1 digit number on left ruler
        canvasMap.leftRulerWidthPx = 13;
      }
      if (this.hasAttribute('left-ruler-width')) {
        canvasMap.leftRulerWidthPx = parseInt(this.getAttribute('left-ruler-width'));
      }

      if (leftRulerLabelArray.length > 0) {
        canvasMap.bottomRulerHeightPx = canvasMap.leftRulerWidthPx;
      }
      if (this.hasAttribute('bottom-ruler-mode')) {
        if (this.getAttribute('bottom-ruler-mode').toLowerCase() === 'clock') {
          canvasMap.bottomRulerHeightPx = 33;
        }
      }
      if (this.hasAttribute('bottom-ruler-height')) {
        canvasMap.bottomRulerHeightPx = parseInt(this.getAttribute('bottom-ruler-height'));
      }

      canvasMap.timeRangeAtRight = canvasMap.chartCreateTimestamp;
      // default to be overwritten
      canvasMap.timeRangeAtLeft = canvasMap.chartCreateTimestamp;
      if ((this.dataArray) && (this.dataArray.length >= 0) && (this.dataArray[0].length > 0)) {
        canvasMap.timeRangeAtLeft = this.dataArray[0][0];
      }
      if (this.hasAttribute('chart-width-seconds')) {
        canvasMap.timeRangeAtLeft = canvasMap.timeRangeAtRight -
          parseInt(this.getAttribute('chart-width-seconds'));
      }

      // console.log(JSON.stringify(canvasMap, null, 2));

      this._generateLeftRuler(context, canvasMap, leftRulerLabelArray);

      if (this.hasAttribute('bottom-ruler-mode')) {
        if (this.getAttribute('bottom-ruler-mode').toLowerCase() === 'clock') {
          this._generateBottomRulerUsingSystemClock(context, canvasMap);
        } else if (this.getAttribute('bottom-ruler-mode').toLowerCase() === 'none') {
          this._generateBottomRulerWithoutContent(context, canvasMap);
        } else {
          this._generateBottomRulerWithoutContent(context, canvasMap);
        }
      } else {
        this._generateBottomRulerWithoutContent(context, canvasMap);
      };

      // plot the data
      if (this.dataArray.length >= 4) {
        let pointIndex = 1;

        // Loop through each point in data array using h as index variable
        for (let h = 0; h < (this.dataArray[0].length - 1); h++) {
          // Loop to draw each line segment from previous point [i-1] to current point [i]
          for (let i = 1; i < this.dataArray.length; i++) {
            //
            // Range Check Time in seconds within chart x axis range
            //
            if ((this.dataArray[i][0] >= canvasMap.timeRangeAtLeft) &&
              (this.dataArray[i][0] <= canvasMap.timeRangeAtRight)) {
              // leave blank gaps for outage greater than limit, or don't skip if null
              if ((!timestampErrorExpiry) ||
                (this.dataArray[i][0] - this.dataArray[i - 1][0] <= timestampErrorExpiry)) {
                const x1 = this._calcVerticalCanvasCoordFromIndex(i - 1, canvasMap);
                const x2 = this._calcVerticalCanvasCoordFromIndex(i, canvasMap);
                const y1 = this._calcHorizontalCanvasCoordFromIndex(i - 1, pointIndex, canvasMap);
                const y2 = this._calcHorizontalCanvasCoordFromIndex(i, pointIndex, canvasMap);
                // console.log('x1 ' + x1 + ' y1 ' + y1 +' x2 ' + x2 + ' y2 ' + y2);
                //
                // range check that x,y pixel coordinates inside plot area
                //
                if (
                  (x1 >= canvasMap.leftRulerWidthPx) && (x2 >= canvasMap.leftRulerWidthPx) &&
                  (x1 <= canvasMap.canvasWidthPx) && (x2 <= canvasMap.canvasWidthPx) &&
                  (y1 <= canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) &&
                  (y2 <= canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx) &&
                  (y1 >= 0) && (y2 >= 0)
                ) {
                  let lineColor = '#FFFFFF';
                  if ((plotLineColors) && (plotLineColors.length >= pointIndex)) {
                    lineColor = plotLineColors[pointIndex - 1];
                  }

                  context.lineWidth = 1;

                  let lineMode = 'line';
                  if ((plotLineModes) && (plotLineModes.length >= pointIndex)) {
                    lineMode = plotLineModes[pointIndex - 1];
                  }
                  if (lineMode === 'line') {
                    context.strokeStyle = lineColor;
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y2);
                    context.stroke();
                  }
                  if (lineMode === 'step') {
                    context.strokeStyle = lineColor;
                    context.beginPath();
                    context.moveTo(x1, y1);
                    context.lineTo(x2, y1);
                    context.lineTo(x2, y2);
                    context.stroke();
                  }
                  if (lineMode === 'fill') {
                    context.fillStyle = lineColor;
                    // context.fillRect(x, y, width, height)
                    context.fillRect(
                      x1, y1, (x2 - x1),
                      (canvasMap.canvasHeightPx - canvasMap.bottomRulerHeightPx - y1));
                  }
                }
              }
            }
          } // next i
          pointIndex += 1;
        } // next h
      } // chart array length
    } // buildChart

    //
    // Each timestamped data entry is an array.
    // Element 0 is timestamp in unix seconds
    // Element 1 is data set #1
    // Element 2 (optional, is data set #2)
    //
    // [ timestamp, data1, data2, ... ]
    //
    // Example chartData array:
    //
    // [
    //   [
    //     1701375087,
    //     0
    //   ],
    //   [
    //     1701411087,
    //     4.1
    //   ],
    //   [
    //     1701447087,
    //     8.3
    //   ],
    //   [
    //     1701483087,
    //     12.5
    //   ],
    //   ...
    // ]

    /**
     * Web component initializer function.
     * @param {array} chartData - Array of timestamped data values (see example)
     */
    initializePlugin (chartData) {
      // console.log('chartData', JSON.stringify(chartData, null, 2));
      //
      // Show blank chart while waiting for download
      //
      // TODO sort and range check
      //
      this.dataArray = [];
      this.dataSubmitTimestamp = Math.floor(Date.now() / 1000);

      let sort = true;
      if ((this.hasAttribute('sort')) &&
        (this.getAttribute('sort').toLowerCase() === 'none')) {
        sort = false;
      }

      if (sort) {
        if ((Array.isArray(chartData)) && (chartData.length > 1)) {
          //
          // Sort by timestamp
          //
          const idx = [];
          for (let i = 0; i < chartData.length; i++) {
            idx[i] = i;
          }
          let searchDone = false;
          while (!searchDone) {
            searchDone = true;
            for (let i = 0; i < chartData.length - 1; i++) {
              if (chartData[idx[i]][0] > chartData[idx[i + 1]][0]) {
                searchDone = false;
                const temp = idx[i];
                idx[i] = idx[i + 1];
                idx[i + 1] = temp;
              }
            } // next i
          } // while()
          //
          // (Deep) copy indexed sorted array
          //
          this.dataArray = [];
          for (let i = 0; i < chartData.length; i++) {
            this.dataArray.push(chartData[idx[i]]);
          }
        } // if isArray()
      } else {
        // Case of not sorted
        this.dataArray = [];
        for (let i = 0; i < chartData.length; i++) {
          this.dataArray.push(chartData[i]);
        }
      }
      this.buildChart();
    } // initializePlugin

    connectedCallback () {
      window.addEventListener('resize', function (event) {
        // console.log('resize event height ' + event.currentTarget.outerHeight);
        this.buildChart();
      }.bind(this));
    } // connectedCallback()
  }); // customElements.define('json-chart')
})(); // namespace scope wrapper
