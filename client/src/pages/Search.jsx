import { useState } from 'react';
import axios from 'axios';
import '../styles/Search.css';

const API_BASE = "http://localhost:5000/api";

function Search() {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);
  const [searchInfo, setSearchInfo] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(false);
    setResults([]);
    setSearchInfo(null);

    try {
      const response = await axios.post(`${API_BASE}/search`, { 
        prompt,
        explain: false 
      });
      
      console.log('✅ Search response:', response.data);
      
      if (response.data.success) {
        setResults(response.data.results || []);
        setSearchInfo({
          query: response.data.query,
          count: response.data.count,
          sql: response.data.generated_sql
        });
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err) {
      console.error("❌ Search failed:", err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to fetch search results. Please try again.");
      }
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="search-bg">
      <div className="search-container">
        <h1 className="search-title">AI Employee Search</h1>
        <p className="search-subtitle">
          Find the right talent using natural language. <br />
          <small>Try: "female employees" or "salary below 6 lakh"</small>
        </p>

        {/* Search Input Section */}
        <form onSubmit={handleSearch} className="search-box-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Describe the employee you are looking for..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn-search" 
            disabled={loading || !prompt.trim()}
          >
            {loading ? <div className="loader"></div> : 'Search'}
          </button>
        </form>

        {/* Search Info */}
        {searchInfo && (
          <div className="search-info">
            Found <strong>{searchInfo.count}</strong> employee{searchInfo.count !== 1 ? 's' : ''} for "{searchInfo.query}"
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-box center">
            ⚠️ {error}
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="results-grid">
            {results.map((emp) => (
              <div key={emp.id} className="employee-card">
                {emp.match_score && (
                  <div className="match-badge">
                    ⚡ {emp.match_score}% Match
                  </div>
                )}
                
                <div className="card-header">
                  <h3>{emp.name}</h3>
                  <span className="card-role">{emp.position} • {emp.job_role}</span>
                </div>

                <div className="card-body">
                  <div className="info-item">
                    <span className="label">👤 Gender</span>
                    <span className="value">{emp.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">🏢 Department</span>
                    <span className="value">{emp.department}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">📍 Location</span>
                    <span className="value">{emp.location}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">⏱️ Experience</span>
                    <span className="value">{emp.experience_years} Years</span>
                  </div>
                  <div className="info-item">
                    <span className="label">💰 Salary</span>
                    <span className="value">₹{Number(emp.salary).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">🎂 Age</span>
                    <span className="value">{emp.age} years</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searched && results.length === 0 && !loading && !error && (
          <div className="no-results">
            <p>No matching employees found for your query.</p>
            <p className="hint">Try different keywords or broaden your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
