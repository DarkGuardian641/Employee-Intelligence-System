import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Analytics.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = "http://localhost:5000/api";

function Analytics() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE}/employees`);
      setEmployees(response.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Average Salary by Gender
  const getSalaryByGender = () => {
    const maleEmployees = employees.filter(emp => emp.gender === 'Male');
    const femaleEmployees = employees.filter(emp => emp.gender === 'Female');

    const maleAvgSalary = maleEmployees.length > 0
      ? maleEmployees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0) / maleEmployees.length
      : 0;

    const femaleAvgSalary = femaleEmployees.length > 0
      ? femaleEmployees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0) / femaleEmployees.length
      : 0;

    return {
      labels: ['Male', 'Female'],
      datasets: [{
        label: 'Average Salary',
        data: [maleAvgSalary, femaleAvgSalary],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 2
      }]
    };
  };

  // 2. Department Distribution (Pie)
  const getDepartmentDistribution = () => {
    const deptCounts = {};
    employees.forEach(emp => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });

    return {
      labels: Object.keys(deptCounts),
      datasets: [{
        label: 'Employees by Department',
        data: Object.values(deptCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
        ],
        borderWidth: 1
      }]
    };
  };

  // 3. Average Salary by Department
  const getSalaryByDepartment = () => {
    const deptSalaries = {};
    const deptCounts = {};

    employees.forEach(emp => {
      if (!deptSalaries[emp.department]) {
        deptSalaries[emp.department] = 0;
        deptCounts[emp.department] = 0;
      }
      deptSalaries[emp.department] += parseFloat(emp.salary);
      deptCounts[emp.department]++;
    });

    const avgSalaries = {};
    Object.keys(deptSalaries).forEach(dept => {
      avgSalaries[dept] = deptSalaries[dept] / deptCounts[dept];
    });

    return {
      labels: Object.keys(avgSalaries),
      datasets: [{
        label: 'Average Salary by Department',
        data: Object.values(avgSalaries),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2
      }]
    };
  };

  // 4. Employees by Location
  const getLocationDistribution = () => {
    const locationCounts = {};
    employees.forEach(emp => {
      locationCounts[emp.location] = (locationCounts[emp.location] || 0) + 1;
    });

    return {
      labels: Object.keys(locationCounts),
      datasets: [{
        label: 'Employees by Location',
        data: Object.values(locationCounts),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2
      }]
    };
  };

  // 5. Salary by Experience (Line)
  const getSalaryByExperience = () => {
    const sortedEmps = [...employees].sort((a, b) => a.experience_years - b.experience_years);
    return {
      labels: sortedEmps.map(emp => `${emp.experience_years}y`),
      datasets: [{
        label: 'Salary',
        data: sortedEmps.map(emp => parseFloat(emp.salary)),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
      }]
    };
  };

  // 6. Gender Ratio (Doughnut)
  const getGenderRatio = () => {
    const maleCount = employees.filter(emp => emp.gender === 'Male').length;
    const femaleCount = employees.filter(emp => emp.gender === 'Female').length;

    return {
      labels: ['Male', 'Female'],
      datasets: [{
        label: 'Gender Ratio',
        data: [maleCount, femaleCount],
        backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }]
    };
  };

  // 7. Age Distribution
  const getAgeDistribution = () => {
    const ageBrackets = { '<25': 0, '25-30': 0, '30-35': 0, '35-40': 0, '40+': 0 };
    employees.forEach(emp => {
      const age = emp.age;
      if (age < 25) ageBrackets['<25']++;
      else if (age < 30) ageBrackets['25-30']++;
      else if (age < 35) ageBrackets['30-35']++;
      else if (age < 40) ageBrackets['35-40']++;
      else ageBrackets['40+']++;
    });

    return {
      labels: Object.keys(ageBrackets),
      datasets: [{
        label: 'Number of Employees',
        data: Object.values(ageBrackets),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 2
      }]
    };
  };

  // 8. Average Salary by Location
  const getSalaryByLocation = () => {
    const locationSalaries = {};
    const locationCounts = {};

    employees.forEach(emp => {
      if (!locationSalaries[emp.location]) {
        locationSalaries[emp.location] = 0;
        locationCounts[emp.location] = 0;
      }
      locationSalaries[emp.location] += parseFloat(emp.salary);
      locationCounts[emp.location]++;
    });

    const avgSalaries = {};
    Object.keys(locationSalaries).forEach(loc => {
      avgSalaries[loc] = locationSalaries[loc] / locationCounts[loc];
    });

    return {
      labels: Object.keys(avgSalaries),
      datasets: [{
        label: 'Average Salary by Location',
        data: Object.values(avgSalaries),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    layout: {
      padding: 0
    }
  };

  return (
    <div className="analytics-container">
      <h1>Analytics Dashboard</h1>
      {loading ? (
        <p>Loading analytics...</p>
      ) : employees.length === 0 ? (
        <p>No data available. Add employees to see analytics.</p>
      ) : (
        <div className="charts-grid">
          {/* Row 1 */}
          <div className="chart-card">
            <h2>Average Salary by Gender</h2>
            <div className="chart-wrapper">
              <Bar data={getSalaryByGender()} options={chartOptions} />
            </div>
          </div>
          
          <div className="chart-card">
            <h2>Department Distribution</h2>
            <div className="chart-wrapper pie-chart">
              <Pie data={getDepartmentDistribution()} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h2>Average Salary by Department</h2>
            <div className="chart-wrapper">
              <Bar data={getSalaryByDepartment()} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h2>Employees by Location</h2>
            <div className="chart-wrapper">
              <Bar data={getLocationDistribution()} options={chartOptions} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="chart-card">
            <h2>Salary by Experience</h2>
            <div className="chart-wrapper">
              <Line data={getSalaryByExperience()} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h2>Gender Ratio</h2>
            <div className="chart-wrapper pie-chart">
              <Doughnut data={getGenderRatio()} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h2>Age Distribution</h2>
            <div className="chart-wrapper">
              <Bar data={getAgeDistribution()} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h2>Average Salary by Location</h2>
            <div className="chart-wrapper">
              <Bar data={getSalaryByLocation()} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
