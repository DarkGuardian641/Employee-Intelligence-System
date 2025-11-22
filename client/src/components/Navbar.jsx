import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>🏢  PredictMyPay - Employee Salary Intelligence</h2>
        </div>
        <ul className="navbar-links">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>
              Employees
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink to="/predict" className={({ isActive }) => isActive ? 'active' : ''}>
              Predict
            </NavLink>
          </li>
          {/* NEW SEARCH LINK */}
          <li>
            <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
              AI Search
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;