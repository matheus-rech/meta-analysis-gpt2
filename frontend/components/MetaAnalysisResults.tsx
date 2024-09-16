import React from 'react';

interface MetaAnalysisResultsProps {
  results: {
    summary: any;
    heterogeneity: number;
    forestPlot: string;
    funnelPlot: string;
    biasTest: any;
    trimfill: any;
    powerAnalysis: any;
    outlierAnalysis: any;
    goshAnalysis: {
      plot: string;
      results: any;
    };
    nnt?: any;
    robSummary?: any;
    subgroupAnalysis?: any;
    sucra?: any;
    fsn?: any;
    modelFormula?: string;
  };
}

const MetaAnalysisResults: React.FC<MetaAnalysisResultsProps> = ({ results }) => {
  return (
    <div>
      <h2>Meta-Analysis Results</h2>
      <h3>Summary</h3>
      <pre>{JSON.stringify(results.summary, null, 2)}</pre>
      
      <h3>Heterogeneity</h3>
      <p>I² = {results.heterogeneity.toFixed(2)}%</p>
      
      <h3>Forest Plot</h3>
      <img src={`data:image/png;base64,${results.forestPlot}`} alt="Forest Plot" />
      
      <h3>Funnel Plot</h3>
      <img src={`data:image/png;base64,${results.funnelPlot}`} alt="Funnel Plot" />
      
      <h3>Publication Bias Test</h3>
      <pre>{JSON.stringify(results.biasTest, null, 2)}</pre>
      
      <h3>Trim and Fill Analysis</h3>
      <pre>{JSON.stringify(results.trimfill, null, 2)}</pre>
      
      <h3>Power Analysis</h3>
      <pre>{JSON.stringify(results.powerAnalysis, null, 2)}</pre>
      
      <h3>Outlier Analysis</h3>
      <pre>{JSON.stringify(results.outlierAnalysis, null, 2)}</pre>
      
      <h3>GOSH Analysis</h3>
      <img src={`data:image/png;base64,${results.goshAnalysis.plot}`} alt="GOSH Plot" />
      <pre>{JSON.stringify(results.goshAnalysis.results, null, 2)}</pre>
      
      {results.nnt && (
        <>
          <h3>Number Needed to Treat</h3>
          <pre>{JSON.stringify(results.nnt, null, 2)}</pre>
        </>
      )}
      
      {results.robSummary && (
        <>
          <h3>Risk of Bias Summary</h3>
          <pre>{JSON.stringify(results.robSummary, null, 2)}</pre>
        </>
      )}
      
      {results.subgroupAnalysis && (
        <>
          <h3>Subgroup Analysis</h3>
          <pre>{JSON.stringify(results.subgroupAnalysis, null, 2)}</pre>
        </>
      )}
      
      {results.sucra && (
        <>
          <h3>SUCRA (Surface Under the Cumulative Ranking curve)</h3>
          <pre>{JSON.stringify(results.sucra, null, 2)}</pre>
        </>
      )}
      
      {results.fsn && (
        <>
          <h3>Fail-Safe N</h3>
          <pre>{JSON.stringify(results.fsn, null, 2)}</pre>
        </>
      )}
      
      {results.modelFormula && (
        <>
          <h3>Model Formula</h3>
          <pre>{results.modelFormula}</pre>
        </>
      )}
    </div>
  );
};

export default MetaAnalysisResults;