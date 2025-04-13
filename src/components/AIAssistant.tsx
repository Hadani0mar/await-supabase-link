
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { 
  Facebook, Twitter, Instagram, Copy, Share2, Send, MessageSquarePlus,
  Loader2, BookOpenCheck, Sparkles, Clock, AlignJustify, History,
  ChevronDown, Settings, Save, Heart, RotateCw, BookOpen, ThumbsUp,
  WhatsApp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  platform?: string;
  contentType?: string;
  timestamp: Date;
}

interface ContentStats {
  characters: number;
  words: number;
  estimatedReadTime: string;
}

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('عام');
  const [contentType, setContentType] = useState('عام');
  const [history, setHistory] = useState<Message[]>([]);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  const contentRef = useRef<HTMLDivElement>(null);
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };
  
  // استرجاع السجل من التخزين المحلي عند تحميل المكون
  useEffect(() => {
    const savedHistory = localStorage.getItem('contentHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // تحويل التواريخ النصية إلى كائنات Date
        const formattedHistory = parsedHistory.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(formattedHistory);
      } catch (e) {
        console.error('Failed to parse history from localStorage', e);
      }
    }
  }, []);

  // حفظ السجل في التخزين المحلي عند تغييره
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('contentHistory', JSON.stringify(history));
    }
  }, [history]);

  const generateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setGeneratedContent('');

    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { 
          prompt: prompt.trim(),
          platform,
          contentType
        },
      });

      if (error) {
        console.error('Error calling AI assistant function:', error);
        toast.error('حدث خطأ أثناء الاتصال بالمساعد الذكي');
        throw new Error(error.message);
      }

      const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
      toast.success(`تم إنشاء المحتوى بنجاح خلال ${generationTime} ثانية`);

      setGeneratedContent(data.response || 'عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.');
      setContentStats(data.stats || null);
      
      // إضافة إلى السجل
      const newMessage: Message = {
        role: 'assistant',
        content: data.response,
        platform: platform,
        contentType: contentType,
        timestamp: new Date()
      };
      
      setHistory(prev => [newMessage, ...prev.slice(0, 19)]);  // الاحتفاظ بآخر 20 رسالة فقط
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('فشل في الحصول على استجابة من المساعد الذكي');
      
      setGeneratedContent('عذراً، حدث خطأ أثناء محاولة معالجة طلبك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
      setActiveTab('result');
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
    { name: 'عام', icon: MessageSquarePlus, color: 'bg-gray-600' },
    { name: 'تويتر', icon: Twitter, color: 'bg-[#1DA1F2]' },
    { name: 'فيسبوك', icon: Facebook, color: 'bg-[#4267B2]' },
    { name: 'انستغرام', icon: Instagram, color: 'bg-gradient-to-r from-[#405DE6] via-[#E1306C] to-[#FFDC80]' },
    { name: 'واتساب', icon: Whatsapp, color: 'bg-[#25D366]' }
  ];

  const contentTypes = [
    { value: 'عام', label: 'محتوى عام' },
    { value: 'تسويقي', label: 'محتوى تسويقي' },
    { value: 'تحفيزي', label: 'محتوى تحفيزي' },
    { value: 'تعليمي', label: 'محتوى تعليمي' },
    { value: 'ترفيهي', label: 'محتوى ترفيهي' },
    { value: 'إخباري', label: 'محتوى إخباري' },
    { value: 'اقتباسات', label: 'اقتباسات وحكم' },
    { value: 'قصصي', label: 'محتوى قصصي' }
  ];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit'
    }).format(date);
  };

  const loadFromHistory = (message: Message) => {
    setGeneratedContent(message.content);
    if (message.platform) setPlatform(message.platform);
    if (message.contentType) setContentType(message.contentType);
    setActiveTab('result');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col h-full max-w-4xl mx-auto"
      >
        <Card className="shadow-xl border-2 overflow-hidden bg-white relative">
          <motion.div 
            className="absolute -right-8 -top-8 w-16 h-16 bg-indigo-200 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute -left-8 -bottom-8 w-16 h-16 bg-purple-200 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-6 relative z-10">
            <motion.div variants={slideUp}>
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300 mr-2" />
                <CardTitle className="text-3xl font-bold text-center">مساعد كتابة المحتوى الاجتماعي</CardTitle>
              </div>
              <CardDescription className="text-gray-100 text-center text-lg mt-2">
                ابتكر محتوى إبداعي لمنصات التواصل الاجتماعي بذكاء اصطناعي متقدم
              </CardDescription>
            </motion.div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-3 bg-white/20 mb-2 mx-auto w-fit">
                <TabsTrigger value="create" className="text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                  <MessageSquarePlus className="h-4 w-4 mr-1" />
                  <span>إنشاء محتوى</span>
                </TabsTrigger>
                <TabsTrigger value="result" className="text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                  <BookOpenCheck className="h-4 w-4 mr-1" />
                  <span>النتيجة</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600">
                  <History className="h-4 w-4 mr-1" />
                  <span>السجل</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-6 relative z-10">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="create">
                <motion.form 
                  onSubmit={generateContent} 
                  className="space-y-4"
                  variants={slideUp}
                >
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3 text-right">اختر منصة التواصل الاجتماعي:</h3>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {platforms.map((p) => {
                        const IconComponent = p.icon;
                        return (
                          <TooltipProvider key={p.name}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                                    platform === p.name 
                                      ? `${p.color} text-white border-transparent` 
                                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                  } transition-all duration-200`}
                                  onClick={() => setPlatform(p.name)}
                                >
                                  <IconComponent size={18} />
                                  <span>{p.name}</span>
                                </motion.button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>إنشاء محتوى مخصص لـ {p.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-700 mb-3 text-right">اختر نوع المحتوى:</h3>
                      <Select
                        value={contentType}
                        onValueChange={setContentType}
                      >
                        <SelectTrigger className="w-full text-right" dir="rtl">
                          <SelectValue placeholder="اختر نوع المحتوى" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3 text-right">ماذا تريد أن أكتب لك؟</h3>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="أدخل وصفًا لما تريد... (مثال: اكتب لي تغريدة عن أهمية الذكاء الاصطناعي في التسويق)"
                      disabled={isLoading}
                      className="min-h-[150px] text-right"
                      dir="rtl"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right">أدخل وصفًا دقيقًا للحصول على أفضل النتائج.</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading || !prompt.trim()} 
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg py-6 relative overflow-hidden group"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>جاري إنشاء المحتوى...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.15, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="h-5 w-5" />
                        </motion.div>
                        <span>إنشاء المحتوى</span>
                      </div>
                    )}
                    <motion.div 
                      className="absolute inset-0 bg-white opacity-10"
                      initial={{ scale: 0, x: '100%' }}
                      animate={{ scale: 1, x: '-100%' }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    />
                  </Button>
                </motion.form>
              </TabsContent>
              
              <TabsContent value="result">
                {generatedContent ? (
                  <motion.div 
                    className="mt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    ref={contentRef}
                  >
                    <div className="bg-gray-50 p-5 rounded-lg border shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{contentStats?.estimatedReadTime}</span>
                        </Badge>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-indigo-700">المحتوى المُنشَأ</h3>
                          {platform !== 'عام' && (
                            <Badge className={`
                              ${platform === 'تويتر' ? 'bg-[#1DA1F2]' : ''}
                              ${platform === 'فيسبوك' ? 'bg-[#4267B2]' : ''}
                              ${platform === 'انستغرام' ? 'bg-gradient-to-r from-[#405DE6] via-[#E1306C] to-[#FFDC80]' : ''}
                              ${platform === 'واتساب' ? 'bg-[#25D366]' : ''}
                            `}>
                              {platform}
                            </Badge>
                          )}
                        </div>
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
                      
                      <div className="whitespace-pre-wrap text-right py-4 px-5 bg-white rounded-md border-2 border-gray-100 shadow-inner min-h-[200px]" dir="rtl">
                        {generatedContent.split('\n').map((line, i) => (
                          <p key={i} className={line.trim() === '' ? 'my-2' : 'mb-2'}>
                            {line}
                          </p>
                        ))}
                      </div>
                      
                      <div className="flex flex-wrap justify-between items-center mt-4 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          {contentStats && (
                            <>
                              <Badge variant="outline" className="mr-2 text-xs">
                                {contentStats.characters} حرفًا
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {contentStats.words} كلمة
                              </Badge>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                          <h4 className="text-sm text-gray-500 ml-2 flex items-center">مشاركة على:</h4>
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
                            className="flex gap-1 bg-gradient-to-r from-[#405DE6] via-[#E1306C] to-[#FFDC80] text-white border-none hover:opacity-90" 
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
                            <Whatsapp className="h-4 w-4" />
                            <span>واتساب</span>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          className="flex gap-2 items-center"
                          onClick={() => setActiveTab('create')}
                        >
                          <RotateCw className="h-4 w-4" />
                          <span>إنشاء محتوى آخر</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex gap-2 items-center"
                          onClick={() => toast.success('تم حفظ المحتوى في السجل')}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>أعجبني</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">لا يوجد محتوى حاليًا</h3>
                    <p className="text-sm max-w-sm text-center">
                      انتقل إلى قسم "إنشاء محتوى" لتوليد محتوى جديد أو اختر من محفوظاتك السابقة.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab('create')}
                    >
                      إنشاء محتوى جديد
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">سجل المحتوى السابق</h3>
                  {history.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if(confirm('هل أنت متأكد من حذف سجل المحتوى بالكامل؟')) {
                          setHistory([]);
                          localStorage.removeItem('contentHistory');
                          toast.success('تم محو السجل بنجاح');
                        }
                      }}
                    >
                      محو السجل
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="h-[350px] pr-3">
                  {history.length > 0 ? (
                    <motion.div layout className="space-y-3">
                      <AnimatePresence>
                        {history.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => loadFromHistory(message)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                {message.platform && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.platform}
                                  </Badge>
                                )}
                                {message.contentType && message.contentType !== 'عام' && (
                                  <Badge variant="secondary" className="text-xs">
                                    {message.contentType}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span dir="ltr">{formatDate(message.timestamp)}</span>
                              </div>
                            </div>
                            <p className="text-sm text-right line-clamp-2" dir="rtl">
                              {message.content}
                            </p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                      <History className="h-12 w-12 mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-1">لا يوجد سجل للمحتوى</h3>
                      <p className="text-sm max-w-sm text-center">
                        عندما تقوم بإنشاء محتوى، سيتم حفظه هنا تلقائيًا.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistant;
