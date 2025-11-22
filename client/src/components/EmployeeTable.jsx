function EmployeeTable({ employees, onEdit, onDelete, loading }) {
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (employees.length === 0) {
      return <p>No employees found. Add one above!</p>;
    }
  
    return (
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Experience (years)</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.experience_years}</td>
              <td>{emp.age}</td>
              <td>{emp.gender}</td>
              <td>₹{parseFloat(emp.salary).toLocaleString('en-IN')}</td>
              <td>
                <button onClick={() => onEdit(emp)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => onDelete(emp.id)} className="btn-delete">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  export default EmployeeTable;
  