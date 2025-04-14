
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversionResult {
  binary: string;
  decimal: string;
  octal: string;
  hexadecimal: string;
  bits: number;
  isValid: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body safely
    const requestData = await req.json().catch(error => {
      console.error("JSON parse error:", error);
      throw new Error(`Invalid JSON: ${error.message}`);
    });
    
    const { prompt, platform, contentType } = requestData;

    // Validate inputs
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid input: prompt must be a string');
    }

    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    let response = "";
    let result = null;
    
    // Check if it's a numeric conversion request
    if (platform === 'binary' || platform === 'decimal' || platform === 'octal' || platform === 'hexadecimal') {
      try {
        // Determine which base we're converting from
        let decimalValue: number;
        const cleanInput = prompt.replace(/\s+/g, '');
        
        switch (platform) {
          case 'binary':  // Binary
            decimalValue = parseInt(cleanInput, 2);
            break;
          case 'octal':  // Octal
            decimalValue = parseInt(cleanInput, 8);
            break;
          case 'decimal': // Decimal
            decimalValue = parseInt(cleanInput, 10);
            break;
          case 'hexadecimal': // Hexadecimal
            decimalValue = parseInt(cleanInput, 16);
            break;
          default:
            decimalValue = parseInt(cleanInput, 10);
        }
        
        if (isNaN(decimalValue)) {
          throw new Error('قيمة غير صالحة للنظام العددي المحدد');
        }

        // Convert decimal to all other systems
        result = {
          binary: decimalValue.toString(2),
          decimal: decimalValue.toString(10),
          octal: decimalValue.toString(8),
          hexadecimal: decimalValue.toString(16).toUpperCase(),
          bits: decimalValue.toString(2).length,
          isValid: true
        };

        // Generate an analysis response
        response = `تحليل للقيمة: ${prompt}\n` +
          `في النظام ${platform || 'العشري'}\n` +
          `القيمة بالنظام الثنائي: ${result.binary}\n` +
          `القيمة بالنظام العشري: ${result.decimal}\n` +
          `القيمة بالنظام الثماني: ${result.octal}\n` +
          `القيمة بالنظام السادس عشر: ${result.hexadecimal}\n` +
          `عدد البتات: ${result.bits}`;
      } catch (error) {
        console.error("Conversion error:", error);
        response = `القيمة المدخلة غير صالحة للنظام ${platform || 'العشري'}`;
        result = {
          binary: '',
          decimal: '',
          octal: '',
          hexadecimal: '',
          bits: 0,
          isValid: false
        };
      }
    } else {
      // Handle the new multi-function assistant
      response = generateAssistantResponse(prompt, platform, contentType);
    }

    // Generate stats about the input
    const stats = {
      characters: prompt.length,
      words: prompt.trim().split(/\s+/).length,
      estimatedReadTime: `${Math.max(1, Math.ceil(prompt.trim().split(/\s+/).length / 200))} دقائق للقراءة`,
      bits: result?.bits || 0
    };

    return new Response(
      JSON.stringify({
        response,
        stats,
        result
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      },
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      },
    );
  }
});

// توليد محتوى المساعد الذكي حسب النوع المحدد
function generateAssistantResponse(prompt: string, platform: string, contentType: string): string {
  switch (platform) {
    case 'حكمة مستقبلية':
      return generateFutureWisdom(prompt);
    case 'تنبؤات فكاهية':
      return generateHumorousPredictions(prompt);
    case 'استشارة مالية':
      return generateFinancialAdvice(prompt);
    case 'شرح بأسلوب طفل':
      return explainLikeChild(prompt);
    case 'سيرة ذاتية':
      return generateResume(prompt);
    case 'تفسير ديني':
      return generateReligiousExplanation(prompt, contentType);
    default:
      // استجابة عامة
      return `مرحبًا! أنا المساعد الذكي الخاص بك. إليك استجابتي لطلبك حول "${prompt}":\n\n` +
        `${prompt} هو موضوع مهم يستحق التفكير. يمكنني تقديم المزيد من التفاصيل إذا حددت نوع المساعدة المطلوبة مثل حكمة مستقبلية، تنبؤات فكاهية، استشارة مالية، أو غيرها من الخيارات المتاحة.`;
  }
}

function generateFutureWisdom(topic: string): string {
  return `حكمة من عام 2150 بشأن "${topic}":\n\n` +
    `في مستقبلنا المتقدم، أدركنا أن "${topic}" هو أحد المفاتيح الأساسية للتوازن الإنساني. ` +
    `لقد علمتنا تجارب القرن الماضي أن الحكمة الحقيقية في هذا الموضوع تكمن في التوازن بين التقدم التكنولوجي والقيم الإنسانية الأصيلة. ` +
    `\n\nلم نعد نرى "${topic}" كما كنتم ترونه في عصركم، بل أصبح جزءًا متكاملاً من منظومة الوعي الجمعي. ` +
    `\n\nتذكر دائمًا: "الأفكار التي تبدو مستحيلة اليوم، ستكون بديهية غدًا."`;
}

function generateHumorousPredictions(input: string): string {
  return `تنبؤات فكاهية غير منطقية لحياتك بناءً على معلومات "${input}":\n\n` +
    `1. خلال السنة القادمة، ستجد نفسك في موقف غريب حيث سيطلب منك شرح نظرية آينشتاين النسبية لقط غاضب. ستنجح بشكل مذهل!\n\n` +
    `2. ستخترع بالصدفة نوعًا جديدًا من الطعام يجمع بين البيتزا والكعك، وسيصبح الطعام الأكثر شهرة في العالم.\n\n` +
    `3. ستصبح خبيرًا عالميًا في الرقص على الماء، رغم أنك لم تحاول ذلك من قبل.\n\n` +
    `4. ستتلقى رسالة من كائن فضائي يطلب نصائحك حول كيفية صنع الشاي المثالي.\n\n` +
    `5. سيكتشف العلماء أن لديك جينًا نادرًا يجعلك قادرًا على فهم لغة النباتات، لكنك ستستخدم هذه القدرة فقط للاستماع لشكاوى نباتات منزلك.`;
}

function generateFinancialAdvice(situation: string): string {
  return `استشارة مالية بخصوص "${situation}":\n\n` +
    `بناءً على الوضع المالي الذي وصفته، إليك بعض النصائح المالية الحكيمة:\n\n` +
    `1. تحليل الوضع الحالي: يبدو أن الخطوة الأولى هي تقييم دقيق لإيراداتك ومصروفاتك الشهرية، وتحديد مجالات يمكن ترشيد الإنفاق فيها.\n\n` +
    `2. إنشاء ميزانية مرنة: حاول تخصيص 50% من دخلك للضروريات، 30% للرغبات، و20% للادخار والاستثمار.\n\n` +
    `3. إنشاء صندوق طوارئ: احرص على تجميع مبلغ يعادل مصروف 3-6 أشهر للحالات الطارئة.\n\n` +
    `4. البدء بالاستثمار: حتى المبالغ الصغيرة يمكن أن تنمو مع الوقت بفضل الفائدة المركبة. ابحث عن خيارات منخفضة المخاطر للبداية.\n\n` +
    `5. تنويع مصادر الدخل: فكر في طرق إضافية لزيادة دخلك من خلال مهارات يمكنك تقديمها.\n\n` +
    `تذكر: الاستقرار المالي رحلة وليس وجهة، والخطوات الصغيرة المستمرة هي مفتاح النجاح.`;
}

function explainLikeChild(concept: string): string {
  return `تفسير "${concept}" بأسلوب طفل:\n\n` +
    `تخيل معي يا صديقي الصغير!\n\n` +
    `"${concept}" هو مثل لعبة ممتعة نلعبها مع الأشياء من حولنا. ` +
    `عندما تبني برجًا من المكعبات، وترى كيف يمكن أن يقف ويكون قويًا، أنت تستخدم نفس الفكرة! ` +
    `\n\nتخيل أن لديك حلوى وتريد مشاركتها مع أصدقائك بالتساوي. عندما تقسمها، أنت تستخدم "${concept}" أيضًا! ` +
    `\n\nالأمر سهل مثل لعبة الغميضة، أليس كذلك؟ كل ما عليك فعله هو النظر حولك واكتشاف كيف يعمل العالم!`;
}

function generateResume(qualifications: string): string {
  return `السيرة الذاتية المهنية (CV)\n\n` +
    `المؤهلات والخبرات المهنية:\n${qualifications}\n\n` +
    `الملخص المهني:\n` +
    `مهني متميز ذو خبرة متنوعة ومهارات متقدمة، يسعى لتوظيف خبراته في بيئة عمل تنافسية. يتميز بالقدرة على التعامل مع التحديات وإيجاد حلول مبتكرة، مع التركيز على تحقيق أهداف المؤسسة.\n\n` +
    `المهارات الأساسية:\n` +
    `• مهارات تواصل استثنائية وقدرة على العمل ضمن فريق\n` +
    `• إدارة المشاريع واتخاذ القرارات الاستراتيجية\n` +
    `• حل المشكلات المعقدة بأساليب مبتكرة\n` +
    `• إتقان التكنولوجيا الحديثة وأدوات التحليل\n` +
    `• القدرة على العمل تحت الضغط وإدارة الوقت بكفاءة\n\n` +
    `الإنجازات المهنية:\n` +
    `• تطوير استراتيجيات أدت إلى تحسين كفاءة العمل بنسبة 30%\n` +
    `• قيادة فريق عمل متعدد التخصصات لتنفيذ مشاريع رئيسية\n` +
    `• تقليص التكاليف التشغيلية مع الحفاظ على جودة المخرجات\n\n` +
    `التعليم والشهادات:\n` +
    `• شهادة جامعية في مجال التخصص\n` +
    `• دورات متقدمة في مجالات القيادة والإدارة\n` +
    `• شهادات مهنية معتمدة في المجال\n\n` +
    `اللغات:\n` +
    `• العربية: اللغة الأم\n` +
    `• الإنجليزية: مستوى متقدم\n\n` +
    `لمزيد من المعلومات والتواصل:\n` +
    `البريد الإلكتروني: example@email.com\n` +
    `الهاتف: +123456789`;
}

function generateReligiousExplanation(text: string, contentType: string): string {
  if (contentType === 'تفسير حديث') {
    return `تفسير الحديث الشريف:\n\n"${text}"\n\n` +
      `شرح الحديث وفق المنهج السلفي:\n\n` +
      `يشير هذا الحديث الشريف إلى مفهوم أساسي في الدين الإسلامي، حيث يوضح لنا الرسول صلى الله عليه وسلم أهمية العمل الصالح والنية الحسنة. ` +
      `\n\nالمعاني الرئيسية في هذا الحديث:\n` +
      `1. أهمية الإخلاص في العبادة والأعمال\n` +
      `2. الربط بين العمل الظاهر والنية الباطنة\n` +
      `3. تأكيد على مسؤولية المسلم عن أفعاله\n\n` +
      `قال الإمام ابن القيم رحمه الله: "القلوب أوعية الإيمان، والألسن ترجمان ما في القلوب، والأعضاء جنود القلب، فإذا طاب القلب طابت الجوارح كلها".\n\n` +
      `وقد جاء في صحيح البخاري عن عمر بن الخطاب رضي الله عنه أن النبي صلى الله عليه وسلم قال: "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى"، وهذا يؤكد المعنى المستفاد من هذا الحديث.`;
  } else if (contentType === 'تفسير قرآن') {
    return `تفسير الآية الكريمة:\n\n"${text}"\n\n` +
      `تفسير الآية وفق المنهج السلفي:\n\n` +
      `هذه الآية الكريمة تحمل معاني عظيمة تتعلق بالإيمان والعمل الصالح. ويمكن شرح معانيها كما يلي:\n\n` +
      `المعاني اللغوية:\n` +
      `- تحليل ألفاظ الآية وجذورها اللغوية\n` +
      `- بيان المعنى الظاهر والدلالات اللفظية\n\n` +
      `المعاني الإجمالية:\n` +
      `1. الدعوة إلى التأمل في آيات الله في الكون\n` +
      `2. التذكير بنعم الله على العباد والشكر عليها\n` +
      `3. الحث على الاستقامة على منهج الله\n\n` +
      `أقوال المفسرين:\n` +
      `قال الإمام ابن كثير رحمه الله: "... (اقتباس من تفسير ابن كثير) ...".\n` +
      `وقال الإمام السعدي رحمه الله: "... (اقتباس من تفسير السعدي) ...".\n\n` +
      `الأحكام المستفادة من الآية:\n` +
      `1. وجوب تدبر القرآن الكريم\n` +
      `2. أهمية العمل بما جاء في كتاب الله\n` +
      `3. ضرورة تجديد الإيمان بالتفكر في آيات الله`;
  } else {
    return `تفسير النص الديني:\n\n"${text}"\n\n` +
      `التفسير وفق المنهج السلفي:\n\n` +
      `هذا النص الديني يحمل معاني عميقة تتعلق بالإيمان والعمل الصالح. إن الفهم الصحيح للنصوص الدينية يتطلب الرجوع إلى فهم السلف الصالح وعلماء الأمة المعتبرين.\n\n` +
      `النقاط الرئيسية في هذا النص:\n\n` +
      `1. أهمية الإخلاص في العبادة والاستقامة على طريق الحق\n` +
      `2. الدعوة إلى التمسك بالكتاب والسنة وفهمهما على منهج السلف\n` +
      `3. ضرورة الحذر من البدع والمحدثات في الدين\n\n` +
      `قال شيخ الإسلام ابن تيمية رحمه الله: "أصل الدين وقاعدته أمران: أن نعبد الله وحده لا نشرك به شيئًا، وأن نعبده بما شرع لا بالبدع".\n\n` +
      `وقد أجمع علماء السلف على أهمية الفهم الصحيح للنصوص الشرعية، بعيدًا عن التأويلات المنحرفة أو التفسيرات المخالفة لما كان عليه النبي صلى الله عليه وسلم وصحابته الكرام.`;
  }
}
