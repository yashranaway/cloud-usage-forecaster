"""
Main entry point for the Machine Learning Resource Predictor
"""

import os
import sys

def main():
    print("Machine Learning Resource Predictor")
    print("==================================")
    print("1. Run data processing")
    print("2. Run ARIMA model")
    print("3. Run LSTM model")
    print("4. Run DeepAR model")
    print("5. Exit")
    
    choice = input("Enter your choice (1-5): ")
    
    if choice == "1":
        os.system("python src/data_processor.py")
    elif choice == "2":
        os.system("python models/arima_model.py")
    elif choice == "3":
        os.system("python models/lstm_model.py")
    elif choice == "4":
        print("Running DeepAR model...")
        # Use direct execution instead of os.system for better error handling
        try:
            import importlib.util
            spec = importlib.util.spec_from_file_location("deepar_model", "models/deepar_model.py")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
        except Exception as e:
            print(f"Error running DeepAR model: {e}")
            print("Please check the model file or run with: python models/deepar_model.py")
    elif choice == "5":
        print("Exiting...")
        sys.exit(0)
    else:
        print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()