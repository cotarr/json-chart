#!/bin/bash
#
# THis is a script to build a demo web page to demonstrate the use of the json-chart web component.
#
# The script must be run from the "demo" folder.
#
# Demo page source files:
#   demo/demo-src/fragments/index-part1.html
#   demo/demo-src/fragments/index.part2.html
#   demo/demo-src/css/styles.css
#   demo/demo-src/js/main.js
#
# Web component source files
#   src/json-chart.html
#   src/json-chart.js
#
#

if [ ! -e "demo_src" ] ; then
  echo "This must be run from the demo/ folder."
  exit 1
fi

echo "Building json-chart demo page"

if [ ! -e "html" ] ; then
  echo "Creating folders"
  mkdir html
fi

if [ ! -e "html/js" ] ; then
  mkdir html/js
fi

if [ ! -e "html/css" ] ; then
  mkdir html/css
fi

# Three HTML files "index-part1.html", "json-chart.html", and "index-part2.html"
# will be concatenated into one HTML file: "index.html".

cat demo_src/fragments/index-part1.html ../src/json-chart.html demo_src/fragments/index-part2.html > html/index.html

# Two JavaScript files "json-chart.js" , "main.js" will be concatenated into one
# JavaScript file: "main.js"

cat ../src/json-chart.js demo_src/js/main.js > html/js/main.js

# Copy the main page CSS file

cp demo_src/css/styles.css html/css/styles.css

# Contents of "html" folder after running the build script
#   demo/html/index.html
#   demo/html/css/styles.css
#   demo/html/js/main.js
#

if [ -f "html/index.html" ] && [ -f "html/js/main.js" ] && [ -f "html/css/styles.css" ] ; then
  echo "Success"
  exit 0
else
  echo "Error occurred building demo page"
  exit 1
fi
