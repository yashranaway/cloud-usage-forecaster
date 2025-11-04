# Cloud Usage Forecaster

A machine learning framework for forecasting cloud computing resource usage with a focus on CPU utilization. It implements multiple predictive models to enable cost‑effective resource allocation decisions and provides a lightweight web dashboard for analysis.

![System Model](system_model.jpg)

## Project Structure

```
├── README.md
├── requirements.txt
├── system_model.jpg
├── src/
│   ├── data_processor.py
│   ├── fetch_data.sh
│   └── main.py
├── models/
│   ├── arima_model.py
│   ├── lstm_model.py
│   └── deepar_model.py
├── data/
│   ├── 2013-7/
│   ├── 2013-8/
│   ├── 2013-9/
│   ├── test/
│   └── train/
├── output/
│   ├── processed_data.csv
│   ├── final_data.csv
│   ├── cpu_autocorrelation.png
│   ├── cpu_analysis.png
│   ├── arima_results.png
│   ├── lstm_results.png
│   ├── vm_data.csv
│   └── vm_capacity.csv
└── raw_data/
```

## Features

1. **Data Processing**: Comprehensive data preprocessing and feature engineering pipeline
2. **Multiple Models**: Implementation of ARIMA, LSTM, and DeepAR-like models
3. **Visualization**: Built-in plotting and analysis capabilities
4. **Modular Design**: Well-organized code structure for easy extension

## Prerequisites

- Python 3.7 or higher
- Required packages listed in [requirements.txt](file:///Users/adityagarud/OS_LAB/ml_resource_predictor/requirements.txt)

## Installation

1. Clone or download this repository
2. Install required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage
Run the main script to access the interactive menu:
```
cd backend
source .venv/bin/activate
python src/main.py
```

Or run individual components:
- Data processing: `python src/data_processor.py`
- ARIMA model: `python models/arima_model.py`
- LSTM model: `python models/lstm_model.py`
- DeepAR model: `python models/deepar_model.py`

Start the frontend server (Bun/Hono):
```
bun install
bun run index.ts
# open http://localhost:3000
```

Docker (optional):
```
docker compose up --build
# open http://localhost:3000
```

## Data Fetching

To fetch the dataset used in this project:
```
chmod +x src/fetch_data.sh
src/fetch_data.sh
```

## Note on Data

The visualizations and results have already been pre-generated using historical cloud computing data. 
All key output files are available in the `output/` directory and can be viewed directly.

For demonstration purposes:
- `output/cpu_analysis.png` - Shows CPU usage vs provisioned capacity
- `output/arima_act_pred.png` - ARIMA model predictions
- `output/lstm_act_pred.png` - LSTM model predictions
- `output/deepar_pred.png` - DeepAR-like model predictions
- `output/deepar_comparison_test.png` - Model performance comparison

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details.