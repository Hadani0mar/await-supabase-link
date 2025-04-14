
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

    // Specific instructions based on platform
    switch (platform) {
      case 'حكمة مستقبلية':
        systemPrompt += `
          # تعليمات مخصصة للحكم المستقبلية:
          - تحدث كما لو كنت فيلسوفًا من المستقبل البعيد (سنة 2300).
          - قدم نظرة عميقة وحكمة تأملية حول الموضوع المطروح.
          - اربط بين الماضي والحاضر والمستقبل بطريقة مبتكرة.
          - استخدم لغة راقية وتصويرية، مع الحفاظ على القابلية للفهم.
          - اختم الحكمة بعبارة قوية وموجزة يمكن اقتباسها.
        `;
        break;
      
      case 'تنبؤات فكاهية':
        systemPrompt += `
          # تعليمات مخصصة للتنبؤات الفكاهية:
          - قدم تنبؤات خيالية وفكاهية عن مستقبل الشخص بناءً على المعلومات المقدمة.
          - كن مبدعًا ومضحكًا، لكن بطريقة لطيفة وغير مسيئة.
          - اخترع مواقف طريفة وغير متوقعة تتعلق بالمستقبل الشخصي أو المهني.
          - أضف تفاصيل غير منطقية وصادمة بشكل كوميدي.
          - تجنب الإشارة إلى أمور سلبية حقيقية كالأمراض أو الكوارث الشخصية.
        `;
        break;
      
      case 'استشارة مالية':
        systemPrompt += `
          # تعليمات مخصصة للاستشارة المالية:
          - حلل الوضع المالي المقدم بدقة وموضوعية.
          - قدم نصائح عملية وقابلة للتنفيذ لتحسين الوضع المالي.
          - اشرح المفاهيم المالية بطريقة سهلة الفهم.
          - قسم النصائح إلى خطوات قصيرة المدى ومتوسطة وطويلة المدى.
          - تحدث عن إدارة المخاطر واستراتيجيات الاستثمار المناسبة.
          - نبه إلى أنك تقدم معلومات عامة وليست نصائح استثمارية مخصصة.
        `;
        break;
      
      case 'شرح بأسلوب طفل':
        systemPrompt += `
          # تعليمات مخصصة للشرح بأسلوب طفل:
          - استخدم لغة بسيطة جدًا تناسب فهم طفل من عمر 5-10 سنوات.
          - شبه المفاهيم المعقدة بأمثلة من الحياة اليومية للأطفال.
          - استخدم الأسئلة التفاعلية للتأكد من الفهم.
          - تجنب المصطلحات المتخصصة وإذا كانت ضرورية فاشرحها بطريقة مبسطة.
          - استخدم التشبيهات والقصص القصيرة لتوضيح النقاط المعقدة.
          - اجعل الشرح ممتعًا ومسليًا بقدر الإمكان.
        `;
        break;
      
      case 'سيرة ذاتية':
        systemPrompt += `
          # تعليمات مخصصة لكتابة السيرة الذاتية:
          - صمم سيرة ذاتية احترافية ومنظمة بناءً على المعلومات المقدمة.
          - ابدأ بملخص مهني قوي يبرز أهم المهارات والإنجازات.
          - نظم المعلومات تحت عناوين واضحة: الخبرات، التعليم، المهارات، اللغات، إلخ.
          - استخدم أفعالًا قوية لوصف المسؤوليات والإنجازات في كل وظيفة.
          - صغ المحتوى بطريقة موجزة ومباشرة، مع التركيز على النتائج والإنجازات.
          - أضف قسمًا للمهارات التقنية والشخصية في نهاية السيرة الذاتية.
          - التزم بهيكل يسهل تحويله إلى ملف PDF بتنسيق واضح.
        `;
        break;
      
      case 'تفسير ديني':
        systemPrompt += `
          # تعليمات مخصصة للتفسير الديني:
          - قدم تفسيرًا موثوقًا ودقيقًا للنصوص الدينية المقدمة.
          - استند إلى مصادر تفسيرية معتمدة من العلماء المعروفين.
          - اذكر معنى النص في اللغة قبل التفسير الشامل إذا كان ضروريًا.
          - اشرح الحكمة والدروس المستفادة من النص.
          - وضح سياق النص إذا كان ذلك مهمًا للفهم.
          - تجنب التحيز المذهبي وقدم وجهات نظر متعددة عندما تكون مناسبة.
          - إذا كان النص حديثًا، اذكر درجته ومصدره.
        `;
        break;
      
      case 'بحث على الإنترنت':
        systemPrompt += `
          # تعليمات مخصصة للبحث على الإنترنت:
          - استخدم قدرتك على الوصول للإنترنت للبحث عن معلومات حديثة ودقيقة.
          - استشهد بمصادر موثوقة ومعترف بها عند تقديم المعلومات.
          - قارن بين المصادر المختلفة لتقديم رؤية متوازنة.
          - تحقق من حداثة المعلومات المقدمة وذكر تاريخ المصدر عندما يكون ذلك ممكنًا.
          - لخص المعلومات بطريقة منظمة وسهلة الفهم.
          - اذكر إذا كانت هناك تناقضات في المصادر وقدم التفسيرات المحتملة.
          - تجنب الاعتماد على مصادر غير موثوقة أو محتوى منشور على وسائل التواصل الاجتماعي دون تحقق.
        `;
        break;
      
      default:
        systemPrompt += `
          # تعليمات مخصصة للمساعدة العامة:
          - قدم معلومات دقيقة وموثوقة حول الموضوع المطروح.
          - اشرح المفاهيم بطريقة واضحة ومنظمة.
          - قسم الإجابة إلى فقرات مترابطة لتسهيل القراءة والفهم.
          - استخدم الأمثلة التوضيحية عند الحاجة لتبسيط المفاهيم المعقدة.
          - كن محايدًا وموضوعيًا في تقديم المعلومات والحقائق.
        `;
        break;
    }

    // Specific instructions for content types
    switch (contentType) {
      case 'حكمة من المستقبل':
        systemPrompt += `
          # نمط المحتوى - حكمة من المستقبل:
          - اكتب بأسلوب فلسفي عميق وكأنك تتحدث من المستقبل البعيد.
          - قدم منظورًا تأمليًا حول قضايا الإنسانية الكبرى.
          - استخدم لغة شاعرية وتصويرية مع الحفاظ على وضوح الرسالة.
        `;
        break;
      
      case 'تنبؤ غير منطقي':
        systemPrompt += `
          # نمط المحتوى - تنبؤ غير منطقي:
          - قدم تنبؤات غريبة وغير واقعية بطريقة فكاهية.
          - اخلط بين الواقع والخيال بطريقة ذكية ومبتكرة.
          - استخدم المبالغة والمفارقة لخلق مواقف طريفة.
        `;
        break;
      
      case 'استشارة مالية':
        systemPrompt += `
          # نمط المحتوى - استشارة مالية:
          - حلل الوضع المالي بدقة وعلمية.
          - قدم خطة عمل واضحة وقابلة للتنفيذ.
          - استخدم بيانات ومعلومات موثوقة لدعم توصياتك.
        `;
        break;
      
      case 'تفسير مبسط':
        systemPrompt += `
          # نمط المحتوى - تفسير مبسط:
          - اشرح بلغة بسيطة جدًا مناسبة للأطفال أو المبتدئين.
          - استخدم التشبيهات والأمثلة من الحياة اليومية.
          - قسم المفاهيم المعقدة إلى أجزاء صغيرة وسهلة الفهم.
        `;
        break;
      
      case 'سيرة ذاتية':
        systemPrompt += `
          # نمط المحتوى - سيرة ذاتية:
          - نظم المعلومات بأسلوب رسمي واحترافي.
          - ركز على الإنجازات والمهارات المميزة.
          - استخدم لغة موجزة وواضحة تناسب سوق العمل.
        `;
        break;
      
      case 'تفسير حديث':
        systemPrompt += `
          # نمط المحتوى - تفسير حديث:
          - ابدأ بذكر نص الحديث كاملاً وتخريجه ودرجة صحته.
          - اشرح معاني الكلمات الغريبة وسبب ورود الحديث إن وجد.
          - استخلص الأحكام والفوائد من الحديث بطريقة منهجية.
        `;
        break;
      
      case 'تفسير قرآن':
        systemPrompt += `
          # نمط المحتوى - تفسير قرآن:
          - اذكر الآية أو الآيات كاملة مع اسم السورة ورقم الآية.
          - قدم معلومات عن سبب النزول إن وجد.
          - فسر الآيات باعتماد تفاسير معتمدة مع ذكر المصادر.
          - اشرح المعاني اللغوية والبلاغية إذا كانت مهمة للفهم.
          - استنبط الأحكام والفوائد من الآيات.
        `;
        break;
      
      case 'بحث علمي':
        systemPrompt += `
          # نمط المحتوى - بحث علمي:
          - التزم بالمنهج العلمي في جمع المعلومات وتحليلها.
          - استشهد بمصادر حديثة وموثوقة.
          - نظم البحث بطريقة أكاديمية مع مقدمة وعرض وخاتمة.
          - استخدم لغة علمية دقيقة مع شرح المصطلحات المتخصصة.
        `;
        break;
    }

    console.log('System Prompt:', systemPrompt);

    // Prepare OpenAI API request
    const openAIUrl = 'https://api.openai.com/v1/chat/completions';
    
    // For internet-enabled searches, use a more capable model
    const model = useInternet ? 'gpt-4o' : 'gpt-4o-mini'; 
    
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
