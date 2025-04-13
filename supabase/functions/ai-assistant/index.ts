import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Parse request body
    const { prompt, platform, contentType } = await req.json();

    // For our numeric system analysis, we don't need AI - we can perform the calculations ourselves
    // But we keep the API endpoint for consistency and potential future AI-based enhancements
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate basic statistics about the response
    const stats = {
      characters: prompt.length,
      words: prompt.trim().split(/\s+/).length,
      estimatedReadTime: `${Math.max(1, Math.ceil(prompt.trim().split(/\s+/).length / 200))} دقائق للقراءة`
    };

    // In a real application, we might do more complex processing here
    const response = `تحليل للقيمة: ${prompt}\n` + 
      `في النظام ${platform || 'العام'}\n` +
      `نوع المحتوى: ${contentType || 'عام'}\n\n` +
      `يمكن تحويل هذا الرقم إلى الأنظمة المختلفة للحصول على قيم متعددة.`;

    return new Response(
      JSON.stringify({
        response,
        stats,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      },
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message,
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
