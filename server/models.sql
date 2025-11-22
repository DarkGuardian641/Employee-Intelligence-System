CREATE DATABASE IF NOT EXISTS company_db;
USE company_db;

DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  experience_years DECIMAL(4,1) NOT NULL,
  age INT NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL,
  position VARCHAR(100) NOT NULL,
  department ENUM('HR', 'Tech', 'Finance', 'Operations', 'Marketing', 'Sales', 'Support') NOT NULL,
  location VARCHAR(50) NOT NULL,
  job_role VARCHAR(100) NOT NULL,
  salary DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department),
  INDEX idx_location (location),
  INDEX idx_position (position),
  INDEX idx_name (name)
);

-- Sample data with Indian cities
INSERT INTO employees (name, experience_years, age, gender, position, department, location, job_role, salary) VALUES
('Rajesh Kumar', 5.5, 28, 'Male', 'Senior Developer', 'Tech', 'Pune', 'Full Stack Developer', 850000),
('Priya Sharma', 3.2, 25, 'Female', 'HR Manager', 'HR', 'Mumbai', 'Human Resources', 650000),
('Amit Patel', 8.0, 35, 'Male', 'Tech Lead', 'Tech', 'Bangalore', 'Backend Developer', 1200000),
('Sneha Reddy', 2.5, 24, 'Female', 'Marketing Executive', 'Marketing', 'Hyderabad', 'Digital Marketing', 500000),
('Vikram Singh', 10.5, 40, 'Male', 'Finance Manager', 'Finance', 'Delhi', 'Financial Analyst', 1500000),
('Anjali Desai', 4.0, 27, 'Female', 'Software Engineer', 'Tech', 'Pune', 'Frontend Developer', 750000),
('Karthik Iyer', 6.5, 32, 'Male', 'Sales Manager', 'Sales', 'Chennai', 'Sales Executive', 900000),
('Meera Nair', 1.5, 23, 'Female', 'Junior Developer', 'Tech', 'Kochi', 'Full Stack Developer', 450000),
('Arjun Mehta', 7.0, 33, 'Male', 'Operations Head', 'Operations', 'Mumbai', 'Operations Manager', 1100000),
('Divya Pillai', 3.8, 26, 'Female', 'Support Engineer', 'Support', 'Bangalore', 'Customer Support', 550000);
