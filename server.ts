import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const voterExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    pageMetadata: {
      type: Type.OBJECT,
      description: 'Header/footer metadata detected on this voter list page if present.',
      properties: {
        panchayatSamiti: {
          type: Type.STRING,
          description: 'Panchayat Samiti, Block, or Assembly Constituency name if visible.',
        },
        gramPanchayat: {
          type: Type.STRING,
          description: 'Gram Panchayat, Village, or Ward area name if visible.',
        },
        wardNo: {
          type: Type.STRING,
          description: 'Ward number if visible in page header.',
        },
        partNo: {
          type: Type.STRING,
          description: 'Part / Bhag Sankhya number if visible.',
        },
        pollingStation: {
          type: Type.STRING,
          description: 'Polling station / Matdan Kendra name and number if visible.',
        },
        roomNo: {
          type: Type.STRING,
          description: 'Room number if visible.',
        },
        defaultAddress: {
          type: Type.STRING,
          description: 'Common locality/mohalla/village address for this page if visible.',
        },
      },
    },
    voters: {
      type: Type.ARRAY,
      description: 'All voter entries found on this page in reading order.',
      items: {
        type: Type.OBJECT,
        properties: {
          serialNo: {
            type: Type.STRING,
            description: 'Voter serial number (क्रम संख्या / Sl. No.).',
          },
          name: {
            type: Type.STRING,
            description: 'Full name of the voter (मतदाता का नाम) in Hindi Devanagari or English as printed.',
          },
          fatherOrHusbandName: {
            type: Type.STRING,
            description: 'Father, Husband, Mother, or Other relative name (पिता / पति का नाम).',
          },
          relationType: {
            type: Type.STRING,
            description: 'Relation type: "father", "husband", "mother", or "other".',
          },
          epic: {
            type: Type.STRING,
            description: 'EPIC / Voter ID number (e.g. UHK1673060 or RJ/12/097/468239).',
          },
          houseNo: {
            type: Type.STRING,
            description: 'House number (मकान नं.) as printed.',
          },
          age: {
            type: Type.STRING,
            description: 'Age in years (आयु) as digits.',
          },
          gender: {
            type: Type.STRING,
            description: 'Normalized gender in Hindi: "पुरुष" for Male, "महिला" for Female, or "अन्य" for Other.',
          },
          address: {
            type: Type.STRING,
            description: 'Locality, Basti, Mohalla, or Street address (पता) if shown on card or page.',
          },
          wardNo: {
            type: Type.STRING,
            description: 'Ward number if shown on the voter box.',
          },
          partNo: {
            type: Type.STRING,
            description: 'Part / Bhag number if shown on the voter box.',
          },
        },
      },
    },
  },
};

async function extractWithRetry(
  ai: GoogleGenAI,
  parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>,
  attempts = 3
) {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          systemInstruction:
            'You are a high-precision bilingual Hindi (Devanagari) and English OCR specialist for Indian Electoral Roll / Voter List PDFs (ECI, CEO State Lists, Panchayat Samiti, Gram Panchayat, Municipal Ward Lists). ' +
            'Carefully read every voter card/row on the page, including faint or scanned text, and preserve exact Devanagari matras, nuktas (e.g. फ़, ज़), and English alphanumeric EPIC codes. ' +
            'Skip deleted/cancelled/blank boxes only if no voter details exist; otherwise extract every voter present. ' +
            'Do not invent or hallucinate voters that are not visible on the page. If the page is only a cover sheet, summary sheet, or map with zero individual voter records, return an empty voters array.',
          responseMimeType: 'application/json',
          responseSchema: voterExtractionSchema,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });
      return response;
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 600 * (i + 1)));
      }
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/extract-voters', async (req: Request, res: Response) => {
    try {
      const { imageBase64, mimeType, extractedText, pageNumber, totalPages } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        extractedText?: string;
        pageNumber?: number;
        totalPages?: number;
      };

      if (!imageBase64 && !extractedText) {
        res.status(400).json({ error: 'Either imageBase64 or extractedText is required.' });
        return;
      }

      const ai = getAiClient();
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }

      const textHint = extractedText && extractedText.trim().length > 20
        ? `\n\nSupplemental PDF text layer (use only if clean Unicode; ignore if garbled legacy font encoding):\n${extractedText.slice(0, 8000)}`
        : '';

      parts.push({
        text:
          `Extract all voter records and any page header metadata from this Voter List page` +
          `${pageNumber ? ` (Page ${pageNumber}${totalPages ? ` of ${totalPages}` : ''})` : ''}. ` +
          `For each voter, extract serialNo (क्रम संख्या), name (मतदाता का नाम), fatherOrHusbandName (पिता/पति का नाम), ` +
          `relationType ("father" | "husband" | "mother" | "other"), epic (EPIC ID), houseNo (मकान नं.), ` +
          `age (आयु), gender ("पुरुष" | "महिला" | "अन्य"), address (पता), wardNo, and partNo.` +
          textHint,
      });

      const response = await extractWithRetry(ai, parts);
      const rawJson = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson);

      res.json({
        pageMetadata: parsed.pageMetadata ?? {},
        voters: Array.isArray(parsed.voters) ? parsed.voters : [],
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to extract voters from page.';
      console.error('OCR extraction error:', error);
      res.status(500).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
