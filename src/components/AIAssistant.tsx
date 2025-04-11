
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنك سؤالي عن أي شيء مثل كتابة محتوى، ترجمة نصوص، تلخيص معلومات، أو تقديم اقتراحات.'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

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
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt: prompt.trim() },
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

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 gap-4">
      <Card className="flex-1 flex flex-col shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-purple-700 to-blue-500 text-white rounded-t-lg pb-6">
          <CardTitle className="text-2xl font-bold text-center">المساعد الذكي</CardTitle>
          <CardDescription className="text-gray-100 text-center">
            استخدم الذكاء الاصطناعي لمساعدتك في كتابة المحتوى، الترجمة، تلخيص المعلومات والمزيد
          </CardDescription>
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
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap" dir="auto">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <Separator />
        
        <CardFooter className="p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              disabled={isLoading}
              className="flex-1 text-right"
              dir="rtl"
            />
            <Button type="submit" disabled={isLoading || !prompt.trim()}>
              {isLoading ? 'جاري الإرسال...' : 'إرسال'}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIAssistant;
