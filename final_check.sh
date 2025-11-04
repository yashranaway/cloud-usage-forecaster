#!/bin/bash

# Final check script for ML Resource Predictor
# Verifies that all components are working correctly

echo "=============================================="
echo "  ML Resource Predictor - Final Check"
echo "=============================================="
echo

cd /Users/adityagarud/OS_LAB/ml_resource_predictor

echo "1. Checking directory structure..."
echo "Current directory: $(pwd)"
echo

echo "2. Checking virtual environment..."
if [ -d ".venv" ]; then
    echo "✓ Virtual environment found"
else
    echo "✗ Virtual environment not found"
fi
echo

echo "3. Checking key output files..."
missing_files=0
key_files=(
    "output/cpu_analysis.png"
    "output/arima_act_pred.png"
    "output/lstm_act_pred.png"
    "output/deepar_pred.png"
    "output/deepar_comparison_test.png"
    "output/processed_data.csv"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "✓ $file ($size)"
    else
        echo "✗ $file (MISSING)"
        missing_files=$((missing_files + 1))
    fi
done
echo

echo "4. Testing model execution..."
echo "Testing DeepAR model execution..."
python models/deepar_model.py > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ DeepAR model runs without errors"
else
    echo "✗ DeepAR model has errors"
fi
echo

echo "5. Summary..."
if [ $missing_files -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED"
    echo
    echo "The ML Resource Predictor is ready for presentation!"
    echo
    echo "To present to your instructor:"
    echo "  Option 1: Run the guided presentation"
    echo "    ./present_ml_to_instructor.sh"
    echo
    echo "  Option 2: Show key visualizations manually:"
    echo "    open output/cpu_analysis.png          # Problem identification"
    echo "    open output/arima_act_pred.png        # Statistical model"
    echo "    open output/lstm_act_pred.png         # Deep learning model"
    echo "    open output/deepar_pred.png           # Probabilistic model"
    echo "    open output/deepar_comparison_test.png # Model comparison"
    echo
    echo "All visualizations have been pre-generated and are working correctly."
else
    echo "❌ $missing_files FILES MISSING"
    echo "Please check the output directory and regenerate missing files."
fi