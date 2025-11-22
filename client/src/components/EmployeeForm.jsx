// Reusable Components 

function EmployeeForm({ formData, onChange, onSubmit, onCancel, isEditing }) {
    return (
      <div className="form-section">
        <h2>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-row">
            <input
              type="number"
              name="experience_years"
              placeholder="Experience (years)"
              value={formData.experience_years}
              onChange={onChange}
              step="0.1"
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={onChange}
              required
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={onChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="number"
              name="salary"
              placeholder="Salary"
              value={formData.salary}
              onChange={onChange}
              step="0.01"
              required
            />
          </div>
          <div className="button-group">
            <button type="submit" className="btn-primary">
              {isEditing ? 'Update' : 'Add'} Employee
            </button>
            {isEditing && (
              <button type="button" onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
  
  export default EmployeeForm;
  