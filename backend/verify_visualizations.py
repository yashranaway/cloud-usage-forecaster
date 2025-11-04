#!/usr/bin/env python3
"""
Verification script for ML Resource Predictor visualizations
"""

import os
import pandas as pd

def check_files():
    """Check if all required files exist and provide information about them"""
    
    print("="*60)
    print("ML RESOURCE PREDICTOR - VISUALIZATION VERIFICATION")
    print("="*60)
    
    # Check output directory
    output_dir = "output"
    if not os.path.exists(output_dir):
        print("Error: Output directory not found!")
        return False
    
    # List all files in output directory
    files = os.listdir(output_dir)
    print(f"Found {len(files)} files in output directory:")
    
    # Categorize files
    csv_files = [f for f in files if f.endswith('.csv')]
    png_files = [f for f in files if f.endswith('.png')]
    other_files = [f for f in files if not f.endswith(('.csv', '.png'))]
    
    print(f"\nCSV Files ({len(csv_files)}):")
    for f in csv_files:
        size = os.path.getsize(os.path.join(output_dir, f))
        print(f"  {f} ({size/1024:.1f} KB)")
    
    print(f"\nVisualization Files ({len(png_files)}):")
    key_visualizations = {
        'cpu_analysis.png': 'CPU Usage vs Capacity Analysis',
        'arima_act_pred.png': 'ARIMA Model Predictions',
        'lstm_act_pred.png': 'LSTM Model Predictions',
        'deepar_pred.png': 'DeepAR Model Predictions',
        'deepar_comparison_test.png': 'Model Comparison'
    }
    
    for f in png_files:
        size = os.path.getsize(os.path.join(output_dir, f))
        description = key_visualizations.get(f, 'Other visualization')
        status = "✓" if f in key_visualizations else " "
        print(f"  {status} {f} ({size/1024:.1f} KB) - {description}")
    
    if other_files:
        print(f"\nOther Files ({len(other_files)}):")
        for f in other_files:
            size = os.path.getsize(os.path.join(output_dir, f))
            print(f"  {f} ({size/1024:.1f} KB)")
    
    # Check key visualizations
    print("\n" + "="*60)
    print("KEY VISUALIZATION STATUS")
    print("="*60)
    
    all_good = True
    for filename, description in key_visualizations.items():
        filepath = os.path.join(output_dir, filename)
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f"✓ {filename} - {description} ({size/1024:.1f} KB)")
        else:
            print(f"✗ {filename} - MISSING!")
            all_good = False
    
    # Check processed data
    print("\n" + "="*60)
    print("PROCESSED DATA STATUS")
    print("="*60)
    
    processed_data_file = os.path.join(output_dir, 'processed_data.csv')
    if os.path.exists(processed_data_file):
        # Read sample of data
        df = pd.read_csv(processed_data_file)
        print(f"✓ Processed data file found")
        print(f"  Rows: {len(df):,}")
        print(f"  Columns: {len(df.columns)}")
        print(f"  Column names: {list(df.columns)}")
    else:
        print("✗ Processed data file not found!")
        all_good = False
    
    return all_good

def main():
    """Main function"""
    print("Verifying ML Resource Predictor components...")
    
    success = check_files()
    
    print("\n" + "="*60)
    if success:
        print("✅ ALL CHECKS PASSED - READY FOR PRESENTATION")
        print("\nTo present to your instructor:")
        print("1. Run: ./present_ml_to_instructor.sh")
        print("2. Or manually view files in the output/ directory")
        print("3. Key files to show:")
        print("   - output/cpu_analysis.png (problem identification)")
        print("   - output/arima_act_pred.png (statistical model)")
        print("   - output/lstm_act_pred.png (deep learning model)")
        print("   - output/deepar_pred.png (probabilistic model)")
        print("   - output/deepar_comparison_test.png (model comparison)")
    else:
        print("❌ SOME CHECKS FAILED - PLEASE REVIEW FILES")
    
    print("="*60)

if __name__ == "__main__":
    main()