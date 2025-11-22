import { useState } from 'react';
import axios from 'axios';
import '../styles/Predict.css';

const API_BASE = "http://localhost:5000/api";

function Predict() {
  const [predictData, setPredictData] = useState({
    experience_years: '',
    age: '',
    gender: 'Male',
    position: 'Junior',
    job_role: 'Frontend Engineer',
    location: 'Pune'
  });
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handlePredictChange = (e) => {
    setPredictData({
      ...predictData,
      [e.target.name]: e.target.value
    });
  };

  const predictSalary = async (e) => {
    e.preventDefault();
    setError(null);
    setPrediction(null);

    try {
      // Send all 6 features to the backend
      const response = await axios.post(`${API_BASE}/predict`, {
        experience_years: parseFloat(predictData.experience_years),
        age: parseInt(predictData.age),
        gender: predictData.gender,
        position: predictData.position,
        job_role: predictData.job_role,
        location: predictData.location
      });

      const predictedValue = Math.floor(response.data.prediction);
      setPrediction(predictedValue);
      
      // Update history with the new prediction
      setHistory([
        {
          ...predictData,
          prediction: predictedValue,
          date: new Date().toLocaleDateString('en-IN')
        },
        ...history
      ]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to predict salary");
      console.error(err);
    }
  };

  return (
    <div className="predict-bg">
      <h1 className="big-blue-title center">Salary Prediction</h1>
      <h4 className="subtitle center">Enter Employee Details</h4>
      <form onSubmit={predictSalary} className="predict-form center">
        <div className="form-row center">
          <input
            type="number"
            name="experience_years"
            placeholder="Experience (years)"
            value={predictData.experience_years}
            onChange={handlePredictChange}
            required
            step="0.1"
            min="0"
            max="50"
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={predictData.age}
            onChange={handlePredictChange}
            required
            min="18"
            max="100"
          />
          <select
            name="gender"
            value={predictData.gender}
            onChange={handlePredictChange}
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select
            name="position"
            value={predictData.position}
            onChange={handlePredictChange}
            required
          >
            <option value="Intern">Intern</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
            <option value="Lead">Lead</option>
            <option value="Manager">Manager</option>
            <option value="Director">Director</option>
          </select>
          <select
            name="job_role"
            value={predictData.job_role}
            onChange={handlePredictChange}
            required
          >
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Frontend Engineer">Frontend Engineer</option>
            <option value="Full Stack Engineer">Full Stack Engineer</option>
            <option value="ML Engineer">ML Engineer</option>
            <option value="QA Engineer">QA Engineer</option>
            <option value="SRE">SRE</option>
          </select>
          <select
            name="location"
            value={predictData.location}
            onChange={handlePredictChange}
            required
          >
            <option value="Bengal">Bengal</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Chennai">Chennai</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Gurgaon">Gurgaon</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Noida">Noida</option>
            <option value="Pune">Pune</option>
          </select>
        </div>
        <button className="btn-predict center" type="submit">Predict Salary</button>
      </form>
      {error && <div className="error-box center">{error}</div>}

      <div className="result-label center">Prediction Result</div>
      <div className="predicted-rupee center">
        Predicted Rs:{' '}
        {prediction !== null ? (
          <span className="predicted-amount">{`₹${Number(prediction).toLocaleString('en-IN', { maximumFractionDigits: 0})}`}</span>
        ) : (
          <span className="predicted-placeholder">-</span>
        )}
      </div>

      <div className="history-header center">Prediction History</div>
      <div className="history-table-wrapper center">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Experience</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Position</th>
              <th>Job Role</th>
              <th>Location</th>
              <th>Predicted Salary</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={8}>No predictions yet.</td>
              </tr>
            ) : (
              history.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td>{row.experience_years}</td>
                  <td>{row.age}</td>
                  <td>{row.gender}</td>
                  <td>{row.position}</td>
                  <td>{row.job_role}</td>
                  <td>{row.location}</td>
                  <td>₹{Number(row.prediction).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Predict;
