# -*- coding: utf-8 -*-
"""
This script implements an ARIMA model for CPU usage prediction.
"""

# Import necessary libraries and modules
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from math import sqrt
import statsmodels.api as sm
import warnings
import os
import sys

# Add parent directory to path to import from src
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

print("Loading data for ARIMA model...")

# Load the preprocessed data
# Try different locations for the data file
try:
    scaled_df = pd.read_csv('../df_scaled.csv')
    print("Loaded data from parent directory")
except FileNotFoundError:
    try:
        scaled_df = pd.read_csv('../output/df_scaled.csv')
        print("Loaded data from output directory")
    except FileNotFoundError:
        scaled_df = pd.read_csv('output/df_scaled.csv')
        print("Loaded data from local output directory")

print("Available columns:", scaled_df.columns.tolist())

# ARIMA (AutoRegressive Integrated Moving Average) modeling

# Check if required column exists
if 'CPU usage [%]' in scaled_df.columns:
    # Splitting the data into training and testing sets
    X = scaled_df['CPU usage [%]']
    size = int(len(X) * 0.66)
    train, test = X[0:size].reset_index(drop=True), X[size:len(X)].reset_index(drop=True)
    history = [x for x in train]
    predictions = list()

    print(f"Training samples: {len(train)}, Testing samples: {len(test)}")

    # Training and predicting with ARIMA model (limited iterations for demo)
    print("Training ARIMA model...")
    max_predictions = min(10, len(test))  # Limit predictions for faster execution
    for t in range(max_predictions):
        model = sm.tsa.arima.ARIMA(history, order=(2,0,0))  # Simplified order for faster execution
        model_fit = model.fit()
        output = model_fit.forecast()
        yhat = output[0]
        predictions.append(yhat)
        obs = test[t]
        history.append(obs)
        print(f'Predicted={yhat:.3f}, Expected={obs:.3f}')

    # Evaluating the ARIMA model
    if len(predictions) > 0:
        mse = mean_squared_error(test[:len(predictions)], predictions)
        mae = mean_absolute_error(test[:len(predictions)], predictions)
        rmse = sqrt(mse)
        r2 = r2_score(test[:len(predictions)], predictions)
        print('Test MSE: %.3f' % mse)
        print('Test MAE: %.3f' % mae)
        print('Test RMSE: %.3f' % rmse)
        print('Test R2 score: %.3f' % r2)

        # Plotting the actual vs predicted CPU usage
        sns.set_style("whitegrid")
        test_list = list(test[:len(predictions)])
        predictions_list = list(predictions)
        range_values = range(len(test_list))
        plt.figure(figsize=(12, 6))
        plt.plot(range_values, test_list, label='Actual', color='b')
        plt.plot(range_values, predictions_list, label='Predicted', color='r')
        plt.legend(loc='upper left')
        plt.title('ARIMA: Actual vs Predicted CPU usage [%]')
        plt.ylabel('CPU usage [%]')
        plt.xlabel('Index')
        plt.grid(True)
        plt.savefig('output/arima_results.png')
        print("ARIMA results saved to output/arima_results.png")
        plt.show()
    else:
        print("No predictions were made.")
else:
    print("Required column 'CPU usage [%]' not found in the dataset.")

print("ARIMA model execution completed.")