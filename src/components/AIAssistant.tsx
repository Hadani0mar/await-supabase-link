
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Facebook, Twitter, Instagram, Copy, Share2, Send, MessageSquarePlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('عام');
  const contentRef = useRef<HTMLDivElement>(null);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const generateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setGeneratedContent('');

    try {
      const enhancedPrompt = `أنت خبير بكتابة المحتوى لوسائل التواصل الاجتماعي. اكتب محتوى ${platform !== 'عام' ? `مناسب لمنصة ${platform}` : ''}: ${prompt.trim()}`;
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt: enhancedPrompt },
      });

      if (error) {
        console.error('Error calling AI assistant function:', error);
        toast.error('حدث خطأ أثناء الاتصال بالمساعد الذكي');
        throw new Error(error.message);
      }

      setGeneratedContent(data.response || 'عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.');
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('فشل في الحصول على استجابة من المساعد الذكي');
      
      setGeneratedContent('عذراً، حدث خطأ أثناء محاولة معالجة طلبك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        toast.success('تم نسخ المحتوى إلى الحافظة');
      },
      () => {
        toast.error('فشل في نسخ المحتوى');
      }
    );
  };

  const shareContent = (platform: string, content: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(content)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(content)}`;
        break;
      case 'telegram':
        shareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(content)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct web share API, we can just copy the content
        copyToClipboard(content);
        toast.info('تم نسخ المحتوى. افتح تطبيق انستغرام والصق المحتوى هناك.');
        return;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'مشاركة المحتوى',
            text: content,
            url: window.location.href
          }).catch(() => {
            toast.error('فشل في مشاركة المحتوى');
          });
          return;
        } else {
          toast.info('مشاركة المحتوى غير متاحة في هذا المتصفح');
          return;
        }
    }
    
    window.open(shareUrl, '_blank');
  };

  const platforms = [
    { name: 'عام', icon: MessageSquarePlus },
    { name: 'تويتر', icon: Twitter },
    { name: 'فيسبوك', icon: Facebook },
    { name: 'انستغرام', icon: Instagram }
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 gap-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Card className="shadow-xl border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white pb-6">
            <motion.div variants={slideUp}>
              <CardTitle className="text-3xl font-bold text-center">مساعد كتابة المحتوى الاجتماعي</CardTitle>
              <CardDescription className="text-gray-100 text-center text-lg mt-2">
                ابتكر محتوى إبداعي لمنصات التواصل الاجتماعي بنقرة واحدة
              </CardDescription>
            </motion.div>
            
            <motion.div 
              className="flex flex-wrap justify-center gap-2 mt-4"
              variants={slideUp}
            >
              {platforms.map((p) => (
                <Button
                  key={p.name}
                  variant={platform === p.name ? "secondary" : "outline"}
                  size="sm"
                  className={`flex gap-2 ${platform === p.name ? 'bg-white text-indigo-600 font-bold' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  onClick={() => setPlatform(p.name)}
                >
                  <p.icon size={16} />
                  <span>{p.name}</span>
                </Button>
              ))}
            </motion.div>
          </CardHeader>
          
          <CardContent className="p-6">
            <motion.form 
              onSubmit={generateContent} 
              className="space-y-4"
              variants={slideUp}
            >
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-700 mb-2 text-right">ماذا تريد أن أكتب لك؟</h3>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="أدخل وصفًا لما تريد... (مثال: اكتب لي تغريدة عن أهمية الذكاء الاصطناعي في التسويق)"
                  disabled={isLoading}
                  className="min-h-[100px] text-right"
                  dir="rtl"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || !prompt.trim()} 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg py-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>جاري إنشاء المحتوى...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="ml-2 h-5 w-5" />
                    <span>إنشاء المحتوى</span>
                  </div>
                )}
              </Button>
            </motion.form>

            {generatedContent && (
              <motion.div 
                className="mt-8 border-t pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                ref={contentRef}
              >
                <div className="bg-gray-50 p-5 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-indigo-700">المحتوى المُنشَأ</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="flex gap-1 border-gray-300"
                        onClick={() => copyToClipboard(generatedContent)}
                        title="نسخ المحتوى"
                      >
                        <Copy className="h-4 w-4" />
                        <span>نسخ</span>
                      </Button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-right py-3 px-4 bg-white rounded border" dir="rtl">
                    {generatedContent}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 mt-4">
                    <h4 className="w-full text-right text-sm text-gray-500 mb-1">مشاركة على:</h4>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex gap-1 bg-[#1DA1F2] text-white border-none hover:bg-[#1a94e0]" 
                      onClick={() => shareContent('twitter', generatedContent)}
                    >
                      <Twitter className="h-4 w-4" />
                      <span>تويتر</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex gap-1 bg-[#4267B2] text-white border-none hover:bg-[#365899]" 
                      onClick={() => shareContent('facebook', generatedContent)}
                    >
                      <Facebook className="h-4 w-4" />
                      <span>فيسبوك</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex gap-1 bg-gradient-to-r from-[#405DE6] via-[#E1306C] to-[#FFDC80] text-white border-none" 
                      onClick={() => shareContent('instagram', generatedContent)}
                    >
                      <Instagram className="h-4 w-4" />
                      <span>انستغرام</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex gap-1 bg-[#25D366] text-white border-none hover:bg-[#128C7E]" 
                      onClick={() => shareContent('whatsapp', generatedContent)}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>واتساب</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AIAssistant;
