
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
    // Parse request body
    const requestData = await req.json().catch(error => {
      throw new Error(`Invalid JSON: ${error.message}`);
    });
    
    const { prompt, platform, contentType } = requestData;

    // Validate inputs
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid input: prompt must be a string');
    }

    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    // Convert input to numeric system analysis
    let result: ConversionResult;
    
    try {
      // Determine which base we're converting from
      let decimalValue: number;
      
      switch (platform) {
        case 'binary':  // Binary
          decimalValue = parseInt(prompt.replace(/\s+/g, ''), 2);
          break;
        case 'octal':  // Octal
          decimalValue = parseInt(prompt.replace(/\s+/g, ''), 8);
          break;
        case 'decimal': // Decimal
        default:
          decimalValue = parseInt(prompt.replace(/\s+/g, ''), 10);
          break;
        case 'hexadecimal': // Hexadecimal
          decimalValue = parseInt(prompt.replace(/\s+/g, ''), 16);
          break;
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
    } catch (error) {
      result = {
        binary: '',
        decimal: '',
        octal: '',
        hexadecimal: '',
        bits: 0,
        isValid: false
      };
    }

    // Generate stats about the input
    const stats = {
      characters: prompt.length,
      words: prompt.trim().split(/\s+/).length,
      estimatedReadTime: `${Math.max(1, Math.ceil(prompt.trim().split(/\s+/).length / 200))} دقائق للقراءة`,
      bits: result.bits
    };

    // Generate an analysis response
    const response = result.isValid 
      ? `تحليل للقيمة: ${prompt}\n` +
        `في النظام ${platform || 'العشري'}\n` +
        `القيمة بالنظام الثنائي: ${result.binary}\n` +
        `القيمة بالنظام العشري: ${result.decimal}\n` +
        `القيمة بالنظام الثماني: ${result.octal}\n` +
        `القيمة بالنظام السادس عشر: ${result.hexadecimal}\n` +
        `عدد البتات: ${result.bits}`
      : `القيمة المدخلة غير صالحة للنظام ${platform || 'العشري'}`;

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
