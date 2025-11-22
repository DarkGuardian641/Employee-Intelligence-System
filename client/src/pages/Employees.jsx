import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Employees.css'

const API_BASE = "http://localhost:5000/api";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    experience_years: '',
    age: '',
    gender: 'Male',
    position: '',
    department: 'Tech',
    location: 'Pune',
    job_role: '',
    salary: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Filter states
  const [filterCategory, setFilterCategory] = useState('id');
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterCategory, filterValue, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/employees`);
      const sortedEmployees = response.data.sort((a, b) => a.id - b.id);
      setEmployees(sortedEmployees);
      setFilteredEmployees(sortedEmployees);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch employees");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!filterValue) {
      setFilteredEmployees(employees);
      return;
    }

    let filtered = [...employees];

    switch (filterCategory) {
      case 'id':
        filtered = filtered.filter(emp => 
          emp.id.toString().includes(filterValue)
        );
        break;
      case 'name':
        filtered = filtered.filter(emp => 
          emp.name.toLowerCase().includes(filterValue.toLowerCase())
        );
        break;
      case 'experience':
        filtered = filtered.filter(emp => 
          emp.experience_years.toString().includes(filterValue)
        );
        break;
      case 'age':
        filtered = filtered.filter(emp => 
          emp.age.toString().includes(filterValue)
        );
        break;
      case 'gender':
        filtered = filtered.filter(emp => 
          emp.gender.toLowerCase() === filterValue.toLowerCase()
        );
        break;
      case 'department':
        filtered = filtered.filter(emp => 
          emp.department.toLowerCase() === filterValue.toLowerCase()
        );
        break;
      case 'location':
        filtered = filtered.filter(emp => 
          emp.location.toLowerCase().includes(filterValue.toLowerCase())
        );
        break;
      case 'salary':
        filtered = filtered.filter(emp => 
          emp.salary.toString().includes(filterValue)
        );
        break;
      default:
        filtered = employees;
    }

    setFilteredEmployees(filtered);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setFilterValue('');
  };

  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  const clearFilter = () => {
    setFilterCategory('id');
    setFilterValue('');
    setFilteredEmployees(employees);
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API_BASE}/employees`, {
        name: formData.name,
        experience_years: parseFloat(formData.experience_years),
        age: parseInt(formData.age),
        gender: formData.gender,
        position: formData.position,
        department: formData.department,
        location: formData.location,
        job_role: formData.job_role,
        salary: parseFloat(formData.salary)
      });
      
      setFormData({ 
        name: '',
        experience_years: '', 
        age: '', 
        gender: 'Male', 
        position: '',
        department: 'Tech',
        location: 'Pune',
        job_role: '',
        salary: '' 
      });
      fetchEmployees();
      alert('Employee added successfully!');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add employee");
      console.error(err);
    }
  };

  const updateEmployee = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.put(`${API_BASE}/employees/${editingId}`, {
        name: formData.name,
        experience_years: parseFloat(formData.experience_years),
        age: parseInt(formData.age),
        gender: formData.gender,
        position: formData.position,
        department: formData.department,
        location: formData.location,
        job_role: formData.job_role,
        salary: parseFloat(formData.salary)
      });
      
      setFormData({ 
        name: '',
        experience_years: '', 
        age: '', 
        gender: 'Male', 
        position: '',
        department: 'Tech',
        location: 'Pune',
        job_role: '',
        salary: '' 
      });
      setEditingId(null);
      fetchEmployees();
      alert('Employee updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update employee");
      console.error(err);
    }
  };

  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    setError(null);
    try {
      await axios.delete(`${API_BASE}/employees/${id}`);
      fetchEmployees();
      alert('Employee deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete employee");
      console.error(err);
    }
  };

  const startEdit = (employee) => {
    setFormData({
      name: employee.name,
      experience_years: employee.experience_years,
      age: employee.age,
      gender: employee.gender,
      position: employee.position,
      department: employee.department,
      location: employee.location,
      job_role: employee.job_role,
      salary: employee.salary
    });
    setEditingId(employee.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData({ 
      name: '',
      experience_years: '', 
      age: '', 
      gender: 'Male', 
      position: '',
      department: 'Tech',
      location: 'Pune',
      job_role: '',
      salary: '' 
    });
    setEditingId(null);
  };

  return (
    <div className="employees-container">
      <h1>Employee Management</h1>
      
      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="employee-top-section">
        {/* Employee Form - Add/Edit */}
        <div className="form-section-wide">
          <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
          <form onSubmit={editingId ? updateEmployee : addEmployee}>
            <div className="form-row">
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="experience_years"
                placeholder="Experience"
                value={formData.experience_years}
                onChange={handleInputChange}
                step="0.1"
                min="0"
                max="50"
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleInputChange}
                min="18"
                max="100"
                required
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-row">
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
              >
                <option value="Tech">Tech</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
              </select>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kochi">Kochi</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Jaipur">Jaipur</option>
              </select>
              <input
                type="text"
                name="job_role"
                placeholder="Job Role"
                value={formData.job_role}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="number"
                name="salary"
                placeholder="Salary (₹)"
                value={formData.salary}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Employee' : 'Add Employee'}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <h2>Filter Employees</h2>
          <div className="filter-controls">
            <select 
              value={filterCategory} 
              onChange={handleFilterCategoryChange}
              className="filter-select"
            >
              <option value="id">Filter by ID</option>
              <option value="name">Filter by Name</option>
              <option value="experience">Filter by Experience</option>
              <option value="age">Filter by Age</option>
              <option value="gender">Filter by Gender</option>
              <option value="department">Filter by Department</option>
              <option value="location">Filter by Location</option>
              <option value="salary">Filter by Salary</option>
            </select>

            {filterCategory === 'gender' ? (
              <select 
                value={filterValue} 
                onChange={handleFilterValueChange}
                className="filter-input"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : filterCategory === 'department' ? (
              <select 
                value={filterValue} 
                onChange={handleFilterValueChange}
                className="filter-input"
              >
                <option value="">Select Department</option>
                <option value="Tech">Tech</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Support">Support</option>
              </select>
            ) : (
              <input
                type="text"
                placeholder={`Enter ${filterCategory}...`}
                value={filterValue}
                onChange={handleFilterValueChange}
                className="filter-input"
              />
            )}

            <button onClick={clearFilter} className="btn-secondary">
              Clear Filter
            </button>
          </div>
          <p className="filter-result">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>
      </div>

      {/* Employee List */}
      <div className="employee-list-full">
        <h2>Employee List ({filteredEmployees.length})</h2>
        
        {loading ? (
          <p className="loading-text">Loading employees...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="empty-text">
            {filterValue ? 'No employees match your filter criteria.' : 'No employees found. Add your first employee above!'}
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Experience</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Job Role</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.experience_years} yrs</td>
                    <td>{emp.age}</td>
                    <td>{emp.gender}</td>
                    <td>{emp.position}</td>
                    <td>{emp.department}</td>
                    <td>{emp.location}</td>
                    <td>{emp.job_role}</td>
                    <td>₹{parseFloat(emp.salary).toLocaleString('en-IN')}</td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => startEdit(emp)} 
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteEmployee(emp.id)} 
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Employees;
