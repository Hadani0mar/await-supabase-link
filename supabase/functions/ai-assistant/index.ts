
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { prompt, platform = "عام", contentType = "عام" } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No prompt provided" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Processing prompt for ${platform} platform, content type: ${contentType}`);
    
    const systemPrompt = `
    أنت مساعد محترف متخصص في كتابة محتوى وسائل التواصل الاجتماعي باللغة العربية.
    مهمتك هي مساعدة المستخدمين في صياغة محتوى عالي الجودة ومناسب لمنصة ${platform}.
    نوع المحتوى المطلوب هو: ${contentType}.
    
    قم بكتابة محتوى يتناسب مع خصائص المنصة المطلوبة:
    - إذا كان المحتوى لتويتر: اجعله موجزاً ومؤثراً وأضف هاشتاغات مناسبة (لا يتجاوز 280 حرفًا إذا أمكن).
    - إذا كان المحتوى لفيسبوك: اجعله أكثر تفاعلية مع إمكانية إضافة تفاصيل أكثر.
    - إذا كان المحتوى لانستغرام: ركّز على الوصف المرئي واجعله جذاباً بصرياً وأضف هاشتاغات متنوعة.
    - إذا كان المحتوى لواتساب: اجعله مباشراً وشخصياً.
    
    احرص على أن يكون المحتوى:
    - أصيلاً وإبداعياً
    - خالياً من الأخطاء اللغوية والإملائية
    - مناسباً للجمهور المستهدف
    - يحقق الهدف من المنشور (تثقيفي، ترفيهي، تحفيزي، تسويقي، إلخ)
    
    استخدم لغة واضحة ومفهومة، واحرص على إضافة هاشتاغات مناسبة عند الطلب.
    `;
    
    // استخدام نموذج gemini-1.5-flash مع الإعدادات الأمثل للمحتوى العربي
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: prompt }
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            stopSequences: [],
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    const data = await response.json();
    console.log("Received response from Gemini API");

    // Extract the response text from the Gemini API response
    let responseText = "";
    let stats = {
      characters: 0,
      words: 0,
      estimatedReadTime: "0 ثوانٍ"
    };
    
    try {
      if (data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        responseText = data.candidates[0].content.parts[0].text;
        
        // حساب الإحصائيات
        stats.characters = responseText.length;
        stats.words = responseText.split(/\s+/).filter(word => word.length > 0).length;
        const readTimeMinutes = Math.ceil(stats.words / 200); // متوسط سرعة قراءة
        stats.estimatedReadTime = readTimeMinutes <= 1 ? 
          `أقل من دقيقة` : 
          `${readTimeMinutes} دقائق تقريبًا`;
      } else {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        responseText = "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.";
      }
    } catch (error) {
      console.error("Error extracting response:", error);
      responseText = "حدث خطأ أثناء معالجة الاستجابة.";
    }

    return new Response(
      JSON.stringify({ 
        response: responseText, 
        stats: stats,
        platform: platform,
        contentType: contentType
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in AI assistant function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
