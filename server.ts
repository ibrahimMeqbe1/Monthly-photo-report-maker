import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Initialize Google GenAI securely with User-Agent telemetry header
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is missing.");
  }

  // API Route: AI Slide Deck Generator
  app.post("/api/ai/generate-report", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API client is not initialized. Please verify your GEMINI_API_KEY." });
      }

      const { prompt, tone = "official", organization = "وزارة الاقتصاد الوطني" } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required and must be a string." });
      }

      const systemInstruction = `أنت خبير محترف وموجز في صياغة التقارير الإدارية والحكومية الفلسطينية.
مهمتك هي صياغة الأنشطة وتوزيعها على هيكل شرائح (slides) مصورة فائقة التركيز والاختصار لإنتاج فيديو تقرير شهري متحرك سريع وعملي للغاية.

قواعد جوهرية للسرعة والعملية:
١. يجب أن تولّد حزمة شرائح قصيرة وموجزة للغاية (بين ٣ إلى ٥ شرائح كحد أقصى):
   - شريحة مقدمة (intro) واحدة.
   - شريحة فاصل قسم (section) واحدة لتقسيم المحاور.
   - شريحة أو شريحتين أحداث (event) للأخبار والفعاليات الرئيسية فقط.
   - شريحة خاتمة (closing) إحصائية واحدة تلخص الأرقام.
٢. لا تقم أبداً بتكرار الشرائح أو كتابة نصوص طويلة وحشو بلا فائدة. اجعل العبارات رنانة ومختصرة جداً (٣ إلى ٧ كلمات للعنوان).
٣. استخدم الأرقام العربية المشرقية (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩) في كل الأرقام والتواريخ والنسب والشرائح.
٤. تأكد من جودة وسرعة الصياغة.`;

      const userPrompt = `قم بصياغة تقرير مختصر وسريع (من ٣ إلى ٥ شرائح كحد أقصى) حول الموضوع التالي:
"${prompt}"
المؤسسة المعنية: ${organization}
نبرة الكتابة: ${tone === "official" ? "رسمي حكومي رصين" : tone === "exciting" ? "إعلامي مشوق وحماسي" : "موجز وبسيط ومباشر"}

يرجى إرجاع هيكل البيانات كـ JSON مصفوفة من الشرائح بالتنسيق المطلوب تماماً وبأسرع وقت.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1, // Low temperature for maximum generation speed and determinism
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              slides: {
                type: Type.ARRAY,
                description: "قائمة الشرائح الإبداعية للتقرير المصور",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "نوع الشريحة: intro, section, event, closing",
                    },
                    duration: {
                      type: Type.NUMBER,
                      description: "مدة عرض الشريحة بالثواني (بين ٦ إلى ١٠ ثوانٍ لجعلها مريحة وبطيئة وبليغة للقراءة)",
                    },
                    // Intro properties
                    ministryName: { type: Type.STRING, description: "اسم الوزارة أو المؤسسة الراعية" },
                    mainTitle: { type: Type.STRING, description: "العنوان الرئيسي المبتكر للتقرير" },
                    monthBadge: { type: Type.STRING, description: "شارة الشهر والسنة (مثال: تموز ٢٠٢٦)" },
                    emblemText: { type: Type.STRING, description: "اختصار لاسم المؤسسة لعرضه كأحرف شعار إن لم تتوفر صورة شعار (من ٢-٤ أحرف)" },
                    // Section properties
                    stageNumber: { type: Type.STRING, description: "رقم المرحلة أو القسم بالأرقام المشرقية (مثال: ٠١، ٠٢)" },
                    stageTitle: { type: Type.STRING, description: "عنوان المحور الإداري أو القسم" },
                    stageSubtitle: { type: Type.STRING, description: "وصف بليغ جداً ومختصر للمرحلة" },
                    // Event properties
                    catLabel: { type: Type.STRING, description: "تصنيف النشاط القصير (مثل: نشاط ميداني، جولة تفتيشية)" },
                    title: { type: Type.STRING, description: "عنوان الحدث البارز بكلمات قوية ومحفزة" },
                    location: { type: Type.STRING, description: "موقع حدوث الفعالية" },
                    day: { type: Type.STRING, description: "رقم اليوم بالأرقام المشرقية (مثل: ١٤)" },
                    month: { type: Type.STRING, description: "اسم الشهر (مثل: تموز)" },
                    // Closing properties
                    heading: { type: Type.STRING, description: "عنوان التلخيص الإحصائي أو عبارة الخاتمة الشاملة" },
                    stats: {
                      type: Type.ARRAY,
                      description: "مجموعة أرقام إحصائية تعبر عن حجم الإنجاز (بين ٢ إلى ٤ عناصر كحد أقصى)",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          n: { type: Type.STRING, description: "الرقم الإحصائي مع الوحدة إن وجدت بالأرقام المشرقية (مثال: ٢٥+، ٩٥٪، ١٠)" },
                          l: { type: Type.STRING, description: "وصف المعيار أو النسبة الإحصائية باختصار شديد جداً (مثل: منشأة تمت زيارتها، لقاء رسمي)" }
                        },
                        required: ["n", "l"]
                      }
                    }
                  },
                  required: ["type", "duration"]
                }
              }
            },
            required: ["slides"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response returned from Gemini AI.");
      }

      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("❌ Error generating AI report:", error);
      res.status(500).json({ error: error.message || "حدث خطأ أثناء توليد التقرير بالذكاء الاصطناعي." });
    }
  });

  // API Route: AI Text Refiner / Polisher
  app.post("/api/ai/refine-text", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API client is not initialized." });
      }

      const { text, type, tone = "official" } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required and must be a string." });
      }

      let systemPrompt = "أنت مدقق لغوي وكاتب محتوى إعلامي رفيع المستوى.";
      if (tone === "official") {
        systemPrompt += " قم بإعادة صياغة النص بأسلوب رسمي، حكومي، رصين، وأنيق جداً وبمفردات بليغة وقصيرة تناسب شاشات التقرير.";
      } else if (tone === "exciting") {
        systemPrompt += " قم بإعادة صياغة النص بأسلوب إعلامي مشوق، نابض بالحياة وحماسي يجذب الانتباه ويعزز مشاعر الفخر والإنجاز.";
      } else {
        systemPrompt += " قم بإعادة صياغة النص ليكون بسيطاً ومختصراً ومباشراً جداً، مع الحفاظ على الفائدة والوضوح التام.";
      }

      systemPrompt += " استخدم دائماً الأرقام المشرقية (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩) إن احتوى النص على أرقام وتواريخ.";
      systemPrompt += " يرجى إرجاع النص الجديد المصاغ مباشرة دون أي مقدمات أو تعليقات خارجية.";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `يرجى إعادة صياغة هذا النص لعنوان أو وصف في تقرير شهري: "${text}"`,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      res.json({ refinedText: response.text?.trim() || text });
    } catch (error: any) {
      console.error("❌ Error refining text:", error);
      res.status(500).json({ error: error.message || "حدث خطأ أثناء صياغة النص." });
    }
  });

  // Serve static assets and handle routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 [Full-Stack Server] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
