// pages/api/search.js
import OpenAI from 'openai';
import { SerpAPI } from 'serpapi';

// Initialize APIs
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serp = new SerpAPI(process.env.SERPAPI_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dominantColor, category, gender, type } = req.body;

    // 1. Generate AI product image with DALL-E 3
    const prompt = `Professional studio product photo of ${gender}'s ${type}, 
      solid color RGB(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}), 
      minimalist white background, no text, 8K resolution, realistic lighting`;

    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    const aiImageUrl = dalleResponse.data[0].url;

    // 2. Reverse image search via Google Lens (SerpAPI)
    const shoppingResults = await serp.search({
      engine: "google_lens",
      url: aiImageUrl,
      hl: "en",
      gl: "us",
    });

    // 3. Filter and format results (example structure - adapt to actual API response)
    const products = shoppingResults.visual_matches?.map(item => ({
      title: item.title || 'No title',
      link: item.link || '#',
      source: item.source || 'Unknown',
      price: item.price?.replace('$', '') || 'Price unavailable',
      image: item.thumbnail || '/placeholder-product.jpg',
      matchScore: calculateColorMatch(dominantColor, item.dominant_color), // Implement your color matching logic
    })) || [];

    // 4. Return affiliate-ready results
    res.status(200).json({
      success: true,
      products: products.slice(0, 6), // Return top 6 matches
      aiPreview: aiImageUrl, // Optional: For debugging
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Failed to generate matches',
      details: error.message,
    });
  }
}

// Helper function to calculate color match score (simplified example)
function calculateColorMatch(targetColor, itemColor) {
  if (!itemColor) return '0%';
  
  // Simple RGB delta - replace with CIEDE2000 for better accuracy
  const deltaR = Math.abs(targetColor.r - itemColor.r);
  const deltaG = Math.abs(targetColor.g - itemColor.g);
  const deltaB = Math.abs(targetColor.b - itemColor.b);
  
  const avgDelta = (deltaR + deltaG + deltaB) / 3;
  const matchScore = 100 - Math.min(avgDelta / 2.55, 100); // Convert to percentage
  
  return `${Math.round(matchScore)}%`;
}
