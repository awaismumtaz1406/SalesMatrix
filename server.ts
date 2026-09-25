import express, { Request, Response } from 'express';
import http from 'http';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please ensure your API key is configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Model alias: Nano-Banana -> gemini-3.1-flash-lite-image
const NANO_BANANA_MODEL = 'gemini-3.1-flash-lite-image';
const COPY_TEXT_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_TEXT_MODEL = 'gemini-flash-latest';

// Clean base64 string helper
const parseBase64Image = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2],
    };
  }
  return {
    mimeType: 'image/png',
    data: dataUrl.replace(/^data:image\/[a-z]+;base64,/, ''),
  };
};

// API: Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    model: NANO_BANANA_MODEL,
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API: AI Corporate Sales Analysis
app.post('/api/analyze-data', async (req: Request, res: Response) => {
  try {
    const { summary, question, sampleCount, topCategory, topRegion, topSalesRep } = req.body || {};
    
    let analysis = '';
    try {
      const ai = getGeminiClient();
      const prompt = `You are an elite Chief Revenue Officer & Senior Financial Analyst.
Analyze the following corporate P&L performance dataset:
- Total Sales: $${summary?.totalSales?.toLocaleString()}
- Cost of Goods Sold (COGS): $${summary?.cogs?.toLocaleString()}
- Gross Profit: $${summary?.grossProfit?.toLocaleString()} (Gross Margin: ${summary?.grossMargin?.toFixed(1)}%)
- Operating Expenses (OPEX): $${summary?.operatingExpenses?.toLocaleString()} (${summary?.opexRatio?.toFixed(1)}% of Sales)
- Net Profit: $${summary?.netProfit?.toLocaleString()} (Net Margin: ${summary?.netMargin?.toFixed(1)}%)
- Total Transactions: ${summary?.totalOrders}
- Total Units Sold: ${summary?.totalUnits}
- Average Order Value: $${summary?.avgOrderValue?.toFixed(2)}
- Top Product Category: ${topCategory?.name} ($${topCategory?.sales?.toLocaleString()} - ${topCategory?.share?.toFixed(1)}% share)
- Top Operating Region: ${topRegion?.name} ($${topRegion?.sales?.toLocaleString()} - ${topRegion?.share?.toFixed(1)}% share)
- Top Sales Rep: ${topSalesRep?.name} ($${topSalesRep?.sales?.toLocaleString()} - ${topSalesRep?.deals} deals)
- Sample Transactions Analyzed: ${sampleCount}

User Query: "${question || 'Executive financial briefing analyzing Total Sales, COGS, Gross Profit, Operating Expenses, and Net Profit with tactical optimization recommendations'}"

Format your response as an executive briefing with concise, high-impact bullet points and tactical recommendations. Focus on P&L flow, COGS reduction, OPEX discipline, gross and net margin preservation, regional growth vectors, and quota management.`;

      const response = await ai.models.generateContent({
        model: COPY_TEXT_MODEL,
        contents: prompt,
      });
      analysis = response.text || '';
    } catch (e: any) {
      console.warn('Gemini analyze fallback:', e.message);
      analysis = `### Executive P&L Financial Briefing\n\n` +
        `• **1. Total Sales**: Closed **$${summary?.totalSales?.toLocaleString()}** across **${summary?.totalOrders}** contracts.\n` +
        `• **2. Cost of Goods Sold (COGS)**: **$${summary?.cogs?.toLocaleString()}** representing direct delivery and unit licensing.\n` +
        `• **3. Gross Profit**: **$${summary?.grossProfit?.toLocaleString()}** delivering a **${summary?.grossMargin?.toFixed(1)}%** gross margin.\n` +
        `• **4. Operating Expenses (OPEX)**: **$${summary?.operatingExpenses?.toLocaleString()}** invested across sales, marketing, and distribution.\n` +
        `• **5. Net Profit (Bottom Line)**: Retained **$${summary?.netProfit?.toLocaleString()}** with a **${summary?.netMargin?.toFixed(1)}%** net profit margin.\n\n` +
        `• **Tactical Recommendation**: Maintain current discount discipline under 10% to protect gross margin while optimizing SG&A expenses to scale net bottom-line retention.`;
    }

    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// API: Generate Master Product Anchor Shot
app.post('/api/generate-master', async (req: Request, res: Response) => {
  try {
    const { product } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ error: 'Product details are required' });
    }

    const ai = getGeminiClient();

    const prompt = `A pristine, award-winning studio hero product photograph of "${product.name}", a premium ${product.category}.
Product Description & Form: ${product.description}.
Materials and Finishes: ${Array.isArray(product.materials) ? product.materials.join(', ') : product.materials}.
Color Scheme: Primary color ${product.primaryColor}, secondary color ${product.secondaryColor}, with ${product.accentColor} accent highlights.
Signature Details: ${product.signatureDetails || 'Minimalist elegance, precise geometric contours, subtle debossed branding'}.
Design Aesthetic: ${product.aesthetic || 'Modern minimalist, clean architectural lines'}.
Tagline/Logo concept on product: "${product.tagline || product.name}".
Environment: Floating or standing on a sleek museum-grade pedestal in a high-end minimalist studio with soft directional diffusion lighting, subtle soft shadows, 8k resolution, crisp product photography.
CRITICAL CONSTRAINT: Absolutely NO people, no humans, no faces, no hands, no fingers, no silhouettes. Solely the standalone product in immaculate studio isolation.`;

    const response = await ai.models.generateContent({
      model: NANO_BANANA_MODEL,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
        },
      },
    });

    let generatedImageUrl = '';
    let textResponse = '';

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'Nano-Banana model did not return image data. ' + (textResponse || 'Please try again.'),
      });
    }

    res.json({
      imageUrl: generatedImageUrl,
      promptUsed: prompt,
      textNotes: textResponse,
    });
  } catch (error: any) {
    console.error('Error generating master product image:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate master product shot with Nano-Banana',
    });
  }
});

// Helper for medium prompts
const getMediumPrompt = (
  mediumKey: string,
  product: any,
  aspectRatio: string
) => {
  const materialsList = Array.isArray(product.materials) ? product.materials.join(', ') : product.materials;
  const productDesignSpec = `[PRODUCT DESIGN SPECIFICATIONS:
Name: ${product.name}
Category: ${product.category}
Form & Appearance: ${product.description}
Materials & Texture: ${materialsList}
Palette: Primary ${product.primaryColor}, Secondary ${product.secondaryColor}, Accent ${product.accentColor}
Signature Detailing: ${product.signatureDetails}
Tagline: "${product.tagline || ''}"]`;

  let mediumContext = '';

  switch (mediumKey) {
    case 'billboard':
      mediumContext = `A colossal, high-impact outdoor highway or metropolitan skyline billboard advertisement towering above an open urban road at dusk. The billboard features an epic commercial display of the EXACT same product shown in the reference image. The billboard layout prominently displays the compelling, legible brand tagline: "${product.tagline || product.name}" rendered in bold, modern, crisp architectural typography with high contrast against the sky. Architectural spotlights illuminate the billboard structure against a twilight sky with city building silhouettes. Ultra-photorealistic outdoor perspective shot from a low-angle vehicle vantage point. The tagline text is crisp, clean, and seamlessly integrated into the billboard artwork.`;
      break;

    case 'newspaper':
      mediumContext = `A striking full-page advertisement printed inside a premium broadsheet newspaper (Sunday edition, financial or design paper) laid flat open on a dark oak studio table. The ad prominently displays the EXACT same product shown in the reference image. The advertisement layout features the compelling brand tagline: "${product.tagline || product.name}" printed as a crisp, legible, dignified editorial headline in classic serif typography with high-contrast newsprint black ink. Tactile newsprint paper texture, fine halftone print dot pattern, macro flatlay angle capturing the authentic crinkled newsprint edge and open newspaper fold.`;
      break;

    case 'social_post':
      mediumContext = `A viral, aesthetically pleasing social media feed advertisement and square lifestyle creative for the product. The EXACT same product shown in the reference image is artfully placed alongside complementary minimalist props (such as a smooth travertine slab, architectural geometric pedestal, and casting soft palm/foliage shadows). The creative features a modern graphic overlay badge with the bold, legible brand tagline: "${product.tagline || product.name}" in clean, readable typography complementing the aesthetic. Sunny golden-hour ray of light, immaculate depth of field, top-down 45-degree angle, tailored for an Instagram / Pinterest design feed.`;
      break;

    case 'subway':
      mediumContext = `A large backlit advertising lightbox poster mounted on the polished concrete wall of an ultra-modern, serene underground subway transit terminal. The ad poster prominently features the EXACT same product shown in the reference image, crisp and vibrant under uniform internal illumination. Sleek reflective granite floor, brushed stainless steel architectural elements, atmospheric transit lighting, quiet and empty platform.`;
      break;

    case 'magazine':
      mediumContext = `A double-page spread advertisement inside a glossy high-end architectural and fashion magazine (like Kinfolk or Monocle) resting open on a polished stone surface. The advertisement showcases the EXACT same product from the reference image in high-fashion editorial framing with bespoke Swiss serif typography, generous white space, and rich print gloss reflections.`;
      break;

    case 'retail_vitrine':
      mediumContext = `A luxury boutique flagship store window vitrine display. The EXACT same product from the reference image is elevated on a bespoke illuminated brushed-metal pedestal inside a spotless glass showcase. Warm museum spotlighting, architectural background shelving with soft bokeh, reflections on the ultra-clear glass, high-end gallery retail ambiance.`;
      break;

    case 'digital_kiosk':
      mediumContext = `A tall vertical interactive smart digital advertising kiosk / bus shelter display on an upscale city sidewalk on a rainy evening. The glowing high-resolution digital display screen displays the EXACT same product from the reference image with vibrant color contrast. Wet asphalt reflecting vibrant city lights, rain droplets on the display casing, dramatic vertical framing.`;
      break;

    case 'merch_tote':
      mediumContext = `A heavy organic cotton canvas tote bag merchandise mockup laid flat on a neutral linen backdrop. The tote bag features a high-definition screen-printed artistic graphic and branding illustration of the EXACT same product from the reference image, complete with clean typography and brand mark. Crisp natural daylight, detailed textile weave texture.`;
      break;

    default:
      mediumContext = `A high-end advertising placement showcasing the EXACT same product from the reference image in a premium commercial setting with pristine lighting and bold brand identity.`;
      break;
  }

  const prompt = `Create an authentic, professional advertising campaign image for the medium: ${mediumKey.toUpperCase()}.
${productDesignSpec}

SCENE DESCRIPTION:
${mediumContext}

CRITICAL CONSISTENCY DIRECTIVE:
The product depicted in the advertisement MUST be 100% consistent with the master product reference image and design specifications. Maintain the exact same geometry, body shape, materials, textures, color scheme (${product.primaryColor}, ${product.secondaryColor}, ${product.accentColor}), and distinct design details.

STRICT MANDATORY CONSTRAINT:
Absolutely NO people, no humans, no faces, no hands, no fingers, no pedestrians, no models, no crowd, no silhouettes of people. The scene must have ZERO human presence. Only show the advertising medium, the product, and its architectural/studio environment.`;

  return prompt;
};

// API: Generate Medium Image
app.post('/api/generate-medium', async (req: Request, res: Response) => {
  try {
    const { mediumKey, product, aspectRatio, customPromptAdjustment } = req.body;
    if (!mediumKey || !product) {
      return res.status(400).json({ error: 'Medium key and product details are required' });
    }

    const ai = getGeminiClient();

    const targetAspectRatio = (aspectRatio || '1:1') as '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    let prompt = getMediumPrompt(mediumKey, product, targetAspectRatio);

    if (customPromptAdjustment && typeof customPromptAdjustment === 'string') {
      prompt += `\nADDITIONAL ARTISTIC DIRECTION: ${customPromptAdjustment}`;
    }

    const contentsParts: any[] = [];

    // If masterImage is provided, pass it as reference image for visual consistency!
    if (product.masterImage) {
      const { data, mimeType } = parseBase64Image(product.masterImage);
      contentsParts.push({
        inlineData: {
          data,
          mimeType,
        },
      });
      prompt = `Using the attached image as the authoritative Master Product Reference:\n` + prompt;
    }

    contentsParts.push({
      text: prompt,
    });

    const response = await ai.models.generateContent({
      model: NANO_BANANA_MODEL,
      contents: {
        parts: contentsParts,
      },
      config: {
        imageConfig: {
          aspectRatio: targetAspectRatio,
        },
      },
    });

    let generatedImageUrl = '';
    let textResponse = '';

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!generatedImageUrl) {
      return res.status(500).json({
        error: 'Nano-Banana model did not return image data. ' + (textResponse || 'Please try again.'),
      });
    }

    res.json({
      imageUrl: generatedImageUrl,
      promptUsed: prompt,
      aspectRatio: targetAspectRatio,
    });
  } catch (error: any) {
    console.error(`Error generating image for medium ${req.body.mediumKey}:`, error);
    res.status(500).json({
      error: error.message || `Failed to generate ${req.body.mediumKey} shot with Nano-Banana`,
    });
  }
});

// API: Generate Tailored Ad Copy for a Medium
app.post('/api/generate-copy', async (req: Request, res: Response) => {
  try {
    const { mediumKey, product } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ error: 'Product details required' });
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class creative advertising director. Write specialized advertising copy for "${product.name}" (${product.category}), tailored specifically for the advertising medium: ${mediumKey.toUpperCase()}.
Product details:
- Tagline: ${product.tagline}
- Description: ${product.description}
- Aesthetic: ${product.aesthetic}
- Key details: ${product.signatureDetails}

Output JSON format with these exact keys:
{
  "headline": "Short, punchy, memorable headline for this medium",
  "subheadline": "Supporting subhead (1 sentence)",
  "body": "Compelling ad copy suitable for ${mediumKey}",
  "callToAction": "Clear call to action",
  "tagline": "Refined brand tagline"
}
Ensure the tone matches the medium (e.g. billboard = ultra-concise 4-6 words; newspaper = sophisticated editorial prose; social = engaging and trendy).
Respond ONLY with valid JSON.`;

    const response = await ai.models.generateContent({
      model: COPY_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let copyData = {};
    try {
      copyData = JSON.parse(text);
    } catch {
      copyData = {
        headline: product.name,
        subheadline: product.tagline,
        body: product.description,
        callToAction: 'Discover More',
        tagline: product.tagline,
      };
    }

    res.json(copyData);
  } catch (error: any) {
    console.error('Error generating ad copy:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate ad copy',
    });
  }
});

// API: Generate Compelling Taglines & Placement Tips for Billboard, Newspaper, and Social
app.post('/api/generate-taglines', async (req: Request, res: Response) => {
  const { product, tone } = req.body || {};
  if (!product || !product.name) {
    return res.status(400).json({ error: 'Product name and details are required' });
  }

  try {
    const ai = getGeminiClient();

    const prompt = `You are an elite creative director at a world-class advertising agency.
Generate 5 compelling, memorable, high-impact brand taglines / slogans for the following product:
Product Name: ${product.name}
Category: ${product.category || 'Product'}
Description: ${product.description || ''}
Design Aesthetic: ${product.aesthetic || 'Modern'}
Signature Details: ${product.signatureDetails || ''}
Tone Preference: ${tone || 'diverse mix of minimalist, bold, and luxurious'}

Each tagline must be designed so it can be legibly and beautifully integrated into advertising visuals across three key mediums:
1. Billboard (Needs high contrast, punchy readability at a distance)
2. Broadsheet Newspaper Ad (Editorial sophistication, classic serif typography)
3. Social Media Creative (Hook-driven, modern, bold aesthetic)

STRICT MANDATORY RULE:
No people, models, human faces, or body parts are featured in any ad shots. The tagline should celebrate the object, industrial design, craftsmanship, innovation, or sensory experience.

Respond with a JSON object containing an array of 5 tagline objects with this exact structure:
{
  "taglines": [
    {
      "tagline": "The compelling tagline phrase (3 to 7 words)",
      "style": "Tone / Style name (e.g., Minimalist & Architectural, Bold Provocation, Luxe Precision)",
      "reasoning": "Why this resonates with the product identity",
      "billboardPlacementTip": "How to lay out this tagline on a massive outdoor highway billboard",
      "newspaperPlacementTip": "How to lay out this tagline in a classic newsprint broadsheet ad",
      "socialPlacementTip": "How to lay out this tagline in a modern square feed graphic"
    }
  ]
}

Respond ONLY with valid JSON.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: COPY_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
    } catch (modelErr) {
      console.warn('COPY_TEXT_MODEL failed, attempting fallback model:', modelErr);
      response = await ai.models.generateContent({
        model: FALLBACK_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
    }

    const text = response?.text || '{"taglines": []}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!data || !Array.isArray(data.taglines) || data.taglines.length === 0) {
      data = {
        taglines: [
          {
            tagline: `${product.name}. Designed Beyond Compromise.`,
            style: 'Minimalist & Prestigious',
            reasoning: 'Focuses on singular engineering and pure sculptural form.',
            billboardPlacementTip: 'Upper architectural header in crisp bold sans-serif with high sky contrast.',
            newspaperPlacementTip: 'Centered italic serif subheader below brand name with ink texture.',
            socialPlacementTip: 'Lower third high-contrast frosted badge.',
          },
          {
            tagline: `Pure Form. Infinite Resonance.`,
            style: 'Poetic & Architectural',
            reasoning: 'Highlights the aesthetic materials and acoustic precision.',
            billboardPlacementTip: 'Massive all-caps display across top horizon.',
            newspaperPlacementTip: 'Editorial full-width kicker headline in classic Roman serif.',
            socialPlacementTip: 'Floating center badge overlay with minimal drop-shadow.',
          },
          {
            tagline: `Silence the Noise. Own the Signal.`,
            style: 'Bold & Punchy',
            reasoning: 'Direct, provocative statement celebrating sensory immersion.',
            billboardPlacementTip: 'Bottom high-impact contrast band in heavy grotesque sans.',
            newspaperPlacementTip: 'Editorial sub-deck quote style.',
            socialPlacementTip: 'Punchy diagonal badge or bottom pill callout.',
          },
          {
            tagline: `Crafted in Sound. Defined by Design.`,
            style: 'Luxe Precision',
            reasoning: 'Bridges physical craftsmanship with performance excellence.',
            billboardPlacementTip: 'Top-left corner balanced against the towering product silhouette.',
            newspaperPlacementTip: 'Traditional print advertorial headline.',
            socialPlacementTip: 'Clean centered footer caption.',
          },
          {
            tagline: `The Shape of Pure Audio.`,
            style: 'Modern & Iconic',
            reasoning: 'Ultra-concise, instantly memorable tagline for global recognition.',
            billboardPlacementTip: 'Single-line centered hero typography directly above the product anchor.',
            newspaperPlacementTip: 'Bold serif masthead integration.',
            socialPlacementTip: 'Minimalist sticker-style brand mark overlay.',
          }
        ],
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error in generate-taglines, providing curated brand taglines:', error);
    res.json({
      taglines: [
        {
          tagline: `${product.name || 'Brand'}. Designed Beyond Compromise.`,
          style: 'Minimalist & Prestigious',
          reasoning: 'Focuses on singular engineering and pure form.',
          billboardPlacementTip: 'Upper architectural header in crisp bold sans-serif.',
          newspaperPlacementTip: 'Centered italic serif subheader below brand name.',
          socialPlacementTip: 'Lower third high-contrast frosted badge.',
        },
        {
          tagline: 'Pure Form. Infinite Precision.',
          style: 'Architectural & Modern',
          reasoning: 'Speaks to premium materials and exact industrial tolerances.',
          billboardPlacementTip: 'Massive horizontal header spanning the billboard width.',
          newspaperPlacementTip: 'Classic broadsheet serif typography.',
          socialPlacementTip: 'Clean geometric typography badge.',
        }
      ]
    });
  }
});

// Serve frontend with Vite middlewares in dev, or dist in prod
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for SPA HTML navigation
    app.use('*', async (req, res, next) => {
      if (req.method !== 'GET') return next();
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Brand Builder server running on http://localhost:${PORT}`);
  });
}

startServer();
