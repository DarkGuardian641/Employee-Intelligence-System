import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib


df = pd.read_csv("server/data/data.csv")

# Store original dataframe for later predictions
df_original = df.copy()

# Encode Gender
if 'Gender' in df.columns:
    le_gender = LabelEncoder()
    df['Gender'] = le_gender.fit_transform(df['Gender'])
    joblib.dump(le_gender, 'server/models/gender_encoder.pkl')

# Encode Position
position_map = {
    'Intern': 0,
    'Junior': 1,
    'Senior': 2,
    'Lead': 3,
    'Manager': 4,
    'Director': 5
}
df['Position_Encoded'] = df['Position'].map(position_map)
df['Position_Encoded'] = df['Position_Encoded'].fillna(1)

# Encode Job_Role
if 'Job_Role' in df.columns:
    le_job_role = LabelEncoder()
    df['Job_Role'] = le_job_role.fit_transform(df['Job_Role'])
    joblib.dump(le_job_role, 'server/models/job_role_encoder.pkl')

# Encode Location
if 'Location' in df.columns:
    le_location = LabelEncoder()
    df['Location'] = le_location.fit_transform(df['Location'])
    joblib.dump(le_location, 'server/models/location_encoder.pkl')


feature_cols = ['Experience_Years', 'Age', 'Gender', 'Position_Encoded', 'Job_Role', 'Location']
X = df[feature_cols].values
y = df['Salary'].values


Q1 = df['Salary'].quantile(0.25)
Q3 = df['Salary'].quantile(0.75)
IQR = Q3 - Q1
lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR
mask = (df['Salary'] >= lower) & (df['Salary'] <= upper)
X = X[mask]
y = y[mask]


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
model.fit(X_train, y_train)


y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)


print("-" * 30)
print("Model Performance:")
print(f"Mean Absolute Error: {mae:.2f}")
print(f"R^2 Score: {r2:.4f}")
print("-" * 30)


model_filename = 'server/models/salary_model.pkl'
joblib.dump(model, model_filename)
print(f"Model saved to {model_filename}")


# Predict on all original data
df_predict = df_original.copy()
df_predict['Gender'] = le_gender.transform(df_predict['Gender'])
df_predict['Position_Encoded'] = df_predict['Position'].map(position_map)
df_predict['Position_Encoded'] = df_predict['Position_Encoded'].fillna(1)
df_predict['Job_Role'] = le_job_role.transform(df_predict['Job_Role'])
df_predict['Location'] = le_location.transform(df_predict['Location'])

X_all = df_predict[feature_cols].values
predicted_salaries = model.predict(X_all)

df_original['Predicted_Salary'] = predicted_salaries
df_original['Difference'] = df_original['Salary'] - predicted_salaries
df_original['Percentage_Error'] = (abs(df_original['Difference']) / df_original['Salary']) * 100

# Save predictions
df_original.to_csv('server/data/salary_predictions.csv', index=False)
print(f"All predictions saved to server/data/salary_predictions.csv")


new_employee = np.array([[5, 28, 1, 2, 3, 9]]) 
predicted_salary = model.predict(new_employee)
print(f"Predicted Salary for sample input (Senior, 5yr exp): {predicted_salary[0]:.2f}")
