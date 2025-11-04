# -*- coding: utf-8 -*-
"""Data Processing and Analysis

# Data Preparation

# Data Preprocessing and Feature Engineering
"""

# Set local directory for data
import os
log_dir = ".."

# Import packages
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import glob
from pandas import read_csv
from datetime import datetime
from pandas.plotting import autocorrelation_plot
from dateutil.relativedelta import relativedelta
from scipy.optimize import minimize
import statsmodels.formula.api as smf
import statsmodels.tsa.api as smt
import statsmodels.api as sm
import scipy.stats as scs
from sklearn.linear_model import LassoCV, RidgeCV
from itertools import product
try:
    from tqdm import tqdm_notebook
except ImportError:
    # Fallback if tqdm_notebook is not available
    from tqdm import tqdm as tqdm_notebook
import matplotlib.dates as mdates
# %matplotlib inline

import warnings
warnings.filterwarnings('ignore')

# Import required packages
import os
import glob
import pandas as pd

print("Loading existing processed data...")

# Load the preprocessed data directly
# Try to load from current directory first, then from output directory
try:
    concatenated_df = pd.read_csv('./df_scaled.csv')
    print("Loaded data from current directory")
except FileNotFoundError:
    try:
        concatenated_df = pd.read_csv('../df_scaled.csv')
        print("Loaded data from parent directory")
    except FileNotFoundError:
        concatenated_df = pd.read_csv('output/df_scaled.csv')
        print("Loaded data from output directory")

# Display the first few rows of the DataFrame
print("First few rows of the data:")
print(concatenated_df.head())

# Save concatenated data
# Use absolute path from current directory
concatenated_df.to_csv('output/processed_data.csv', index=False)

"""Read the CSV directly if its already there in the working directory

"""

concatenated_df = pd.read_csv('output/processed_data.csv')

# Date Feature Engineering (if timestamp column exists)
if 'Timestamp [ms]' in concatenated_df.columns:
    try:
        # Try to convert timestamp, but handle errors
        concatenated_df['Timestamp'] = pd.to_datetime(concatenated_df['Timestamp [ms]'], unit='s', errors='coerce')
        concatenated_df.apply(pd.to_numeric, errors='ignore')

        # Date Feature Engineering
        concatenated_df['weekday'] = concatenated_df['Timestamp'].dt.dayofweek
        concatenated_df['weekend'] = ((concatenated_df.weekday) // 5 == 1).astype(float)
        concatenated_df['month']=concatenated_df.Timestamp.dt.month
        concatenated_df['day']=concatenated_df.Timestamp.dt.day
        concatenated_df.set_index('Timestamp',inplace=True)
    except Exception as e:
        print(f"Error processing timestamp data: {e}")
        print("Continuing without timestamp processing...")

# Other Feature Engineering (if required columns exist)
if 'CPU usage [%]' in concatenated_df.columns:
    concatenated_df["CPU usage prev"] = concatenated_df['CPU usage [%]'].shift(1)
    concatenated_df["CPU_diff"] = concatenated_df['CPU usage [%]'] - concatenated_df["CPU usage prev"]
    
if 'Network received throughput [KB/s]' in concatenated_df.columns:
    concatenated_df["received_prev"] = concatenated_df['Network received throughput [KB/s]'].shift(1)
    concatenated_df["received_diff"] = concatenated_df['Network received throughput [KB/s]']- concatenated_df["received_prev"]
    
if 'Network transmitted throughput [KB/s]' in concatenated_df.columns:
    concatenated_df["transmitted_prev"] = concatenated_df['Network transmitted throughput [KB/s]'].shift(1)
    concatenated_df["transmitted_diff"] = concatenated_df['Network transmitted throughput [KB/s]']- concatenated_df["transmitted_prev"]

concatenated_df = concatenated_df.fillna(method='ffill')

print("Data shape:", concatenated_df.shape)
print("Data processed successfully!")

concatenated_df.head()

"""Optional step, storing for quick loading if required later."""

# concatenated_df.to_csv(log_dir + '/output/featured_data.csv', index=False)

# concatenated_df = pd.read_csv(log_dir + '/output/featured_data.csv')

hourlydat = concatenated_df.resample('H').sum()

hourlydat.to_csv('output/final_data.csv')
print("Final data saved to output/final_data.csv")
hourlydat.head()

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

# Set the seaborn style
sns.set_style("whitegrid")

# Check if required column exists before plotting
if 'CPU usage [MHZ]' in hourlydat.columns:
    plt.figure(figsize=(12,6))
    pd.plotting.autocorrelation_plot(hourlydat['CPU usage [MHZ]'])

    # Add necessary titles and labels
    plt.title('Autocorrelation of CPU Usage')
    plt.xlabel('Lag')
    plt.ylabel('Autocorrelation')

    # Save with correct path
    plt.savefig('output/cpu_autocorrelation.png')
    print("Autocorrelation plot saved to output/cpu_autocorrelation.png")
    # Show the plot
    plt.show()

"""# CPU Capacity Provisioning and Usage Analysis"""

# Check if required columns exist
if 'CPU usage [MHZ]' in hourlydat.columns and 'CPU capacity provisioned [MHZ]' in hourlydat.columns:
    overprovision = pd.DataFrame(hourlydat['CPU usage [MHZ]'])
    overprovision['CPU capacity provisioned'] = pd.DataFrame(hourlydat['CPU capacity provisioned [MHZ]'])

    import matplotlib.pyplot as plt
    import seaborn as sns
    import pandas as pd

    # Apply seaborn styles
    sns.set_style("whitegrid")

    # Create a larger figure
    fig, ax = plt.subplots(figsize=(12, 6))

    # Plot the CPU usage
    sns.lineplot(x=overprovision.index, y='CPU usage [MHZ]', data=overprovision, ax=ax, label='CPU usage [MHZ]', color='steelblue', linewidth=2.5)

    # Plot the CPU capacity provisioned
    sns.lineplot(x=overprovision.index, y='CPU capacity provisioned', data=overprovision, ax=ax, label='CPU capacity provisioned [MHZ]', color='tomato', linewidth=2.5)

    # Set titles and labels
    ax.set_title('CPU Capacity and Usage Comparison')
    ax.set_ylabel((r'CPU [MHz]  $e^{7}$'))
    ax.set_xlabel('Date')

    ax.legend(loc='best')

    # Set the font size of the tick labels
    # ax.tick_params(labelsize=1)

    # Format the y-axis
    ax.ticklabel_format(axis='y', style='sci', scilimits=(1,6))

    # Save and show the figure with correct path
    plt.savefig('output/cpu_analysis.png')
    print("CPU analysis plot saved to output/cpu_analysis.png")
    plt.show()

print("Data processing completed successfully!")