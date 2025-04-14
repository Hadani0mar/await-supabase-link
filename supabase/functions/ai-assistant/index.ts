
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  prompt: string;
  platform: string;
  contentType: string;
  instructions?: string;
  useInternet?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get environment vars
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    
    const { prompt, platform, contentType, instructions, useInternet } = await req.json() as RequestBody;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Calculate word count for the prompt
    const wordCount = prompt.trim().split(/\s+/).length;
    
    // Construct a detailed system prompt with instructions
    let systemPrompt = `
      أنت مساعد ذكي متخصص، يتمتع بقدرات تحليلية عالية ومعرفة واسعة. واجبك الرئيسي هو تقديم محتوى دقيق وعالي الجودة وفقاً للتعليمات.
      
      # تعليمات عامة:
      - استخدم اللغة العربية الفصحى السهلة.
      - قدم إجابات شاملة ومنظمة ومباشرة.
      - التزم بالحياد وعدم التحيز في جميع إجاباتك.
      - استشهد بالمصادر عند الضرورة، خاصةً للمعلومات العلمية.
      
      # المنصة: ${platform}
      # نوع المحتوى: ${contentType}
      
      # تعليمات خاصة:
      ${instructions || 'اجب على السؤال بأفضل طريقة ممكنة.'}
      
      ${useInternet ? 'أنت قادر على البحث في الإنترنت للحصول على معلومات محدثة ودقيقة. استخدم هذه القدرة لإثراء إجاباتك بالمعلومات الأحدث والأكثر دقة، مع ذكر المصادر.' : ''}
    `;

    // Specific instructions based on platform and content type
    if (platform === 'سيرة ذاتية') {
      systemPrompt += `
        # تعليمات إضافية لكتابة السيرة الذاتية:
        - نظم السيرة الذاتية بتنسيق مهني مع عناوين واضحة للأقسام.
        - ابدأ بملخص مهني قوي يبرز الخبرات والمهارات الرئيسية.
        - رتب الخبرات من الأحدث إلى الأقدم.
        - استخدم أفعال قوية لوصف المسؤوليات والإنجازات.
        - أضف أقساماً للتعليم، والمهارات، واللغات، والشهادات إن وجدت.
        - لا تضف معلومات شخصية غير ضرورية.
      `;
    } else if (platform === 'تفسير ديني') {
      systemPrompt += `
        # تعليمات إضافية للتفسير الديني:
        - التزم بالمنهج الوسطي المعتدل في التفسير.
        - استند إلى المصادر الموثوقة والتفاسير المعتمدة.
        - اذكر آراء العلماء المختلفة إن وجدت.
        - وضح الدروس المستفادة والحكم من النصوص.
        - تجنب القطع في المسائل الخلافية.
      `;
    }

    // Specific instructions for internet search
    if (useInternet) {
      systemPrompt += `
        # تعليمات البحث في الإنترنت:
        - تحقق من حداثة المعلومات وموثوقيتها.
        - قم بذكر المصادر التي استعنت بها في بحثك.
        - قارن بين المعلومات من مصادر مختلفة للتأكد من دقتها.
        - قدم النتائج بطريقة منظمة وسهلة الفهم.
      `;
    }

    console.log('System Prompt:', systemPrompt);

    // Prepare OpenAI API request
    const openAIUrl = 'https://api.openai.com/v1/chat/completions';
    
    // For internet-enabled searches, use a more capable model
    const model = useInternet ? 'gpt-4-turbo' : 'gpt-3.5-turbo'; 
    
    const openAIOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: "system", 
            content: systemPrompt
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0
      })
    };

    // Call OpenAI API
    const response = await fetch(openAIUrl, openAIOptions);
    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      throw new Error(data.error?.message || 'Failed to get response from AI');
    }

    const aiResponse = data.choices[0].message.content;

    // Calculate content statistics
    const contentWords = aiResponse.trim().split(/\s+/).length;
    const contentChars = aiResponse.length;
    const readingTimeMin = Math.ceil(contentWords / 200); // Assuming average reading speed of 200 words per minute
    
    const responseData = {
      response: aiResponse,
      stats: {
        characters: contentChars,
        words: contentWords,
        estimatedReadTime: `${readingTimeMin} دقيقة للقراءة`
      }
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
