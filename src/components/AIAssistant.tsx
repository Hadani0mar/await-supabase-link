
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Facebook, Twitter, Instagram, Copy, Share2, Send, MessageSquarePlus } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحبًا! أنا مساعدك في كتابة محتوى وسائل التواصل الاجتماعي. يمكنك أن تطلب مني كتابة منشورات، تغريدات، اقتباسات تقنية، أو أي محتوى آخر لمختلف منصات التواصل الاجتماعي.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [platform, setPlatform] = useState('عام');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    const userMessage: Message = { role: 'user', content: prompt };
    
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

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

      const botMessage: Message = {
        role: 'assistant',
        content: data.response || 'عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.'
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('فشل في الحصول على استجابة من المساعد الذكي');
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'عذراً، حدث خطأ أثناء محاولة معالجة طلبك. يرجى المحاولة مرة أخرى.'
        }
      ]);
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
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 gap-4">
      <Card className="flex-1 flex flex-col shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-purple-700 to-blue-500 text-white rounded-t-lg pb-4">
          <CardTitle className="text-2xl font-bold text-center">مساعد كتابة المحتوى</CardTitle>
          <CardDescription className="text-gray-100 text-center">
            احصل على محتوى إبداعي لمنصات التواصل الاجتماعي المختلفة
          </CardDescription>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {platforms.map((p) => (
              <Button
                key={p.name}
                variant={platform === p.name ? "secondary" : "outline"}
                size="sm"
                className={`flex gap-2 ${platform === p.name ? 'bg-white text-primary' : 'bg-white/20 text-white hover:bg-white/30'}`}
                onClick={() => setPlatform(p.name)}
              >
                <p.icon size={16} />
                <span>{p.name}</span>
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-6 overflow-hidden">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap" dir="auto">{message.content}</p>
                    
                    {message.role === 'assistant' && message.content && message.content !== messages[0].content && (
                      <div className="flex mt-2 gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => copyToClipboard(message.content)}
                          title="نسخ المحتوى"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => shareContent('twitter', message.content)}
                          title="مشاركة على تويتر"
                        >
                          <Twitter className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => shareContent('facebook', message.content)}
                          title="مشاركة على فيسبوك"
                        >
                          <Facebook className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => shareContent('whatsapp', message.content)}
                          title="مشاركة على واتساب"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <Separator />
        
        <CardFooter className="p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2 flex-col">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب هنا ما تريد (مثال: اكتب لي تغريدة عن أهمية الذكاء الاصطناعي في التسويق)..."
              disabled={isLoading}
              className="flex-1 min-h-[80px] text-right"
              dir="rtl"
            />
            <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full">
              {isLoading ? 'جاري الإرسال...' : <><Send className="ml-2 h-4 w-4" /> إرسال</>}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIAssistant;
