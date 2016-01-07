#!/usr/bin/env bash

jake build
rm dist/leaflet.js
rm dist/leaflet-src.map
mv dist/leaflet-src.js dist/leaflet-src.txt
