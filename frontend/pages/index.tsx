import React, { useState } from 'react';
import MetaAnalysisResults from '../components/MetaAnalysisResults';

export default function Home() {
  const [query, setQuery] = useState('');
  const [analysisType, setAnalysisType] = useState('standard');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/meta-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, analysisType }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred while processing your request.');
    }
  };

  return (
    <div>
      <h1>MetaGPT</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your meta-analysis query here"
        />
        <select value={analysisType} onChange={(e) => setAnalysisType(e.target.value)}>
          <option value="standard">Standard Meta-Analysis</option>
          <option value="network">Network Meta-Analysis</option>
          <option value="sem">SEM Meta-Analysis</option>
        </select>
        <button type="submit">Submit</button>
      </form>
      {error && <div className="error">{error}</div>}
      {results && <MetaAnalysisResults results={results} />}
    </div>
  );
}