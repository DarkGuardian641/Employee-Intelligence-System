# Import required libraries
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# Load Data
df = pd.read_csv("server/data/Employee_Salary_Dataset.csv")

# Encode Gender
if 'Gender' in df.columns:
    df['Gender'] = LabelEncoder().fit_transform(df['Gender'])  # Male=1, Female=0

# Prepare features and target
X = df[['Experience_Years', 'Age', 'Gender']].values
y = df['Salary'].values

# Optional: Remove outliers (IQR method)
Q1 = df['Salary'].quantile(0.25)
Q3 = df['Salary'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
mask = (df['Salary'] >= lower) & (df['Salary'] <= upper)
X = X[mask]
y = y[mask]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"MAE: {mae}")
print(f"R^2: {r2}")

# Save model
joblib.dump(model, 'server/models/salary_model.pkl')
print("Model saved to salary_model.pkl")
