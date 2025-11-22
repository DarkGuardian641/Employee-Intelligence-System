import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import avatarImg from '../assets/image.png';

const API_BASE = "http://localhost:5000/api";

function getCalendarMatrix(year, month) {
  const result = [];
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  let d = 1 - startDay;
  for (let w = 0; w < 6; w++) {
    let week = [];
    for (let i = 0; i < 7; i++, d++) {
      const date = new Date(year, month, d);
      week.push({
        day: date.getDate(),
        thisMonth: date.getMonth() === month,
        today: date.toDateString() === new Date().toDateString()
      });
    }
    result.push(week);
    if (d > 31 && week.every(day => !day.thisMonth)) break;
  }
  return result;
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    avgSalary: 0,
    avgExperience: 0
  });
  const [topEmployees, setTopEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [calendar, setCalendar] = useState(getCalendarMatrix(new Date().getFullYear(), new Date().getMonth()));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/employees`);
      const employees = response.data;
      let sorted = [];
      if (employees.length > 0) {
        const totalSalary = employees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0);
        const totalExp = employees.reduce((sum, emp) => sum + parseFloat(emp.experience_years), 0);
        sorted = [...employees].sort((a, b) => b.salary - a.salary).slice(0, 5);
        setStats({
          totalEmployees: employees.length,
          avgSalary: (totalSalary / employees.length).toFixed(2),
          avgExperience: (totalExp / employees.length).toFixed(1)
        });
      }
      setTopEmployees(sorted);
    } catch (err) {
      setTopEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const addTask = e => {
    e.preventDefault();
    if (taskInput.trim() === '') return;
    setTasks([...tasks, { text: taskInput, completed: false }]);
    setTaskInput('');
  };

  const toggleTask = idx => {
    setTasks(tasks => tasks.map((t, i) =>
      i === idx ? { ...t, completed: !t.completed } : t
    ));
  };

  const user = {
    name: "Atharva Shubada Baikar",
    empId: 1093,
    img: avatarImg
  };

  const calendarHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="dashboard-root">
      <div className="dashboard-content-wrapper">
        <div className="dashboard-row">
          <div className="dashboard-col" style={{ flex: 1.17 }}>
            <div className="profile-banner-card">
              <img className="avatar-img" src={user.img} alt={user.name} />
              <div className="profile-details">
                <span className="profile-name">{user.name}</span>
                <span className="profile-empid">Employee ID: {user.empId}</span>
              </div>
            </div>
            <div className="stats-cards-row">
              <div className="stat-card">
                <h3>Total Employees</h3>
                <div className="stat-value">{stats.totalEmployees}</div>
              </div>
              <div className="stat-card">
                <h3>Average Salary</h3>
                <div className="stat-value">₹{parseFloat(stats.avgSalary).toLocaleString('en-IN')}</div>
              </div>
              <div className="stat-card">
                <h3>Average Experience</h3>
                <div className="stat-value">{stats.avgExperience} years</div>
              </div>
            </div>
          </div>
          <div className="employees-card">
            <h3>Top 5 Employees</h3>
            <ul className="top-employees-list">
              {topEmployees.length === 0 ? <li>No data available.</li> :
                topEmployees.map(emp => (
                  <li key={emp.id}>
                    <span className="emp-name">{emp.name}</span>
                    <span className="emp-role">{emp.department}</span>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        <div className="bottom-row">
          <div className="tasks-section">
            <h3>Tasks Overview</h3>
            <form className="add-task-form" onSubmit={addTask}>
              <input
                type="text"
                value={taskInput}
                onChange={e => setTaskInput(e.target.value)}
                placeholder="Add a new task..."
              />
              <button type="submit">Add</button>
            </form>
            <ul className="added-tasks-list">
              {tasks.length === 0 ? (
                <li className="empty-tasks">No tasks added.</li>
              ) : (
                tasks.map((task, idx) => (
                  <li key={idx} onClick={() => toggleTask(idx)} className={task.completed ? 'completed' : ''}>
                    <span>{task.text}</span>
                    <span className="mark">{task.completed ? "✓" : ""}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="calendar-section">
            <h3>Weekly Calendar</h3>
            <table className="calendar-table">
              <thead>
                <tr>
                  {calendarHeader.map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendar.map((week, i) => (
                  <tr key={i}>
                    {week.map((day, j) => (
                      <td key={j}>
                        {day.thisMonth ? (
                          <span className={day.today ? "calendar-today" : ""}>
                            {day.day}
                          </span>
                        ) : (
                          ''
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
