import { NextApiRequest, NextApiResponse } from 'next';
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ProcessedQuery {
  query: string;
  model_formula?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { query, analysisType } = req.body;

      // Process query with Anthropic API
      const completion = await anthropic.completions.create({
        model: "claude-2",
        prompt: `Analyze this ${analysisType} query: ${query}`,
        max_tokens_to_sample: 300,
      });

      // Process Anthropic response and prepare data for R backend
      const processedQuery = processAnthropicResponse(completion.completion, analysisType);

      // Determine which R endpoint to call based on analysisType
      let rEndpoint = 'perform_meta_analysis';
      if (analysisType === 'sem') {
        rEndpoint = 'perform_sem_meta_analysis';
      }

      // Send request to R backend
      const rResponse = await fetch(`http://localhost:8000/${rEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedQuery),
      });

      const result = await rResponse.json();

      // Process the result based on analysisType
      const processedResult = processResult(result, analysisType);

      res.status(200).json(processedResult);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function processResult(result: any, analysisType: string) {
  if (analysisType === 'sem') {
    return {
      summary: result.summary,
      forestPlot: result.forest_plot,
      funnelPlot: result.funnel_plot,
      fitIndices: result.fit_indices
    };
  } else {
    return {
      summary: result.summary,
      heterogeneity: result.heterogeneity,
      forestPlot: result.forest_plot,
      funnelPlot: result.funnel_plot,
      biasTest: result.bias_test,
      trimfill: result.trimfill,
      powerAnalysis: result.power_analysis,
      outlierAnalysis: result.outlier_analysis,
      goshAnalysis: result.gosh_analysis,
      nnt: result.nnt,
      robSummary: result.rob_summary,
      subgroupAnalysis: result.subgroup_analysis,
      fsn: result.fsn,
      modelFormula: result.model_formula
    };
  }
}

function processAnthropicResponse(response: string, analysisType: string): ProcessedQuery {
  // Process the Anthropic response here
  // This function should extract relevant information from the Anthropic response
  // and format it in a way that's suitable for the R backend
  if (analysisType === 'sem') {
    // Extract model formula from the response
    const modelFormulaMatch = response.match(/model formula: (.+)/i);
    const modelFormula = modelFormulaMatch ? modelFormulaMatch[1] : '';
    return {
      query: response,
      model_formula: modelFormula
    };
  } else {
    return { query: response };
  }
}