# ML Resource Predictor - Instructor Guide

## Project Overview

This component demonstrates how Machine Learning can be used for efficient resource allocation in cloud computing environments. Rather than relying solely on reactive scheduling algorithms, this approach uses predictive models to forecast future resource needs based on historical usage patterns.

## Key Components

### 1. Data Processing Pipeline
- **Location**: `src/data_processor.py`
- **Function**: Processes raw CPU usage data from cloud VMs
- **Features**: Time-based features, lag features, statistical transformations

### 2. Predictive Models
- **ARIMA Model**: `models/arima_model.py` - Statistical time series forecasting
- **LSTM Model**: `models/lstm_model.py` - Deep learning approach
- **DeepAR-like Model**: `models/deepar_model.py` - Probabilistic forecasting

### 3. Visualization & Analysis
- **Location**: `output/` directory
- **Content**: Performance visualizations, model comparisons, insights

## How to Present This Component

### Quick Start
Run the presentation script from the main directory:
```bash
./present_ml_to_instructor.sh
```

### Manual Presentation
1. **Navigate to the directory**:
   ```bash
   cd ml_resource_predictor
   ```

2. **Show the system architecture**:
   - File: `system_model.jpg`
   - Shows overall data flow from cloud VMs through ML pipeline

3. **Explain the problem with traditional approaches**:
   - Show: `output/cpu_analysis.png`
   - Demonstrates over/under provisioning issues

4. **Present each model's approach**:
   - ARIMA: `output/arima_act_pred.png`
   - LSTM: `output/lstm_act_pred.png`
   - DeepAR: `output/deepar_pred.png`

5. **Compare model performance**:
   - Show: `output/deepar_comparison_test.png`

## Understanding the Data Flow

### Input
- Historical CPU usage data from cloud VMs
- Located in `data/` directory
- CSV format with timestamps and resource metrics

### Processing
- Feature engineering in `src/data_processor.py`
- Creates time-based features (hour, day, month, weekday/weekend)
- Generates lag features (previous time step values)
- Handles missing data and normalization

### Models
1. **ARIMA**: Traditional statistical approach
   - Finds patterns in time series data
   - Good for linear trends and seasonality

2. **LSTM**: Deep learning neural network
   - Captures complex, non-linear patterns
   - Remembers long-term dependencies

3. **DeepAR-like**: Probabilistic forecasting
   - Provides prediction confidence intervals
   - Handles uncertainty quantification

### Output
- Predictions of future CPU usage
- Confidence intervals for uncertainty
- Performance metrics for evaluation
- Visualizations for analysis

## Key Visualizations to Show

1. **`system_model.jpg`**: Overall architecture
2. **`output/cpu_analysis.png`**: Problem identification
3. **`output/arima_act_pred.png`**: ARIMA predictions
4. **`output/lstm_act_pred.png`**: LSTM predictions
5. **`output/deepar_pred.png`**: DeepAR-like predictions with uncertainty
6. **`output/deepar_comparison_test.png`**: Model performance comparison

## Running the Components

### Interactive Menu
```bash
cd ml_resource_predictor
source .venv/bin/activate
python src/main.py
```

### Individual Components
```bash
# Data processing
python src/data_processor.py

# Individual models
python models/arima_model.py
python models/lstm_model.py
python models/deepar_model.py
```

## Educational Value

This component demonstrates:
1. **Real-world application** of ML in cloud computing
2. **Multiple approaches** to time series forecasting
3. **Importance of visualization** in model evaluation
4. **Trade-offs** between different ML techniques
5. **Proactive vs reactive** resource management

## Connection to Cloud Computing Concepts

- **Auto-scaling**: Predictions inform scaling decisions
- **Cost optimization**: Reduce over-provisioning
- **Performance management**: Prevent under-provisioning
- **Energy efficiency**: Optimize resource utilization
- **Capacity planning**: Long-term resource allocation strategies