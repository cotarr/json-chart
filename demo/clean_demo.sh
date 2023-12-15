#!/bin/bash
#
# This is a script to remove the build files created by "build_demo.sh".
# This should be run from the "demo" folder in the repository.
#

if [ ! -e "demo_src" ] ; then
  echo "This must be run from the demo/ folder."
  exit 1
fi

if [ -e "html" ] ; then
  echo "Removing files for json-chart demo page"
  rm -Rv html
  echo "Done"
  exit 0
else
  echo "Demo page files were not found."
fi
