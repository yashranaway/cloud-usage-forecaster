#!/bin/bash

# Data fetching script for ML Resource Predictor
wget http://gwa.ewi.tudelft.nl/fileadmin/pds/trace-archives/grid-workloads-archive/datasets/gwa-t-12/rnd.zip

# Extract the zip file to the data directory
unzip rnd.zip -d data