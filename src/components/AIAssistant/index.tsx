
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Calculator, BookOpen, History as HistoryIcon, MessageSquarePlus, Loader2 } from 'lucide-react';
import { Message, ContentStats } from './types';
import { PLATFORMS, CONTENT_TYPES, getPlaceholderForPlatform } from './constants';
import PlatformSelector from './PlatformSelector';
import ContentTypeSelector from './ContentTypeSelector';
import PromptInput from './PromptInput';
import GenerateButton from './GenerateButton';
import ResultDisplay from './ResultDisplay';
import HistoryItem from './HistoryItem';
import EmptyState from './EmptyState';
import ThemeToggle from './ThemeToggle';
import './styles.css';

const AIAssistant = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [platform, setPlatform] = useState('عام');
  const [contentType, setContentType] = useState('عام');
  const [history, setHistory] = useState<Message[]>([]);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [activeTab, setActiveTab] = useState('create');
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };
  
  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('contentHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert string dates to Date objects
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

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('contentHistory', JSON.stringify(history));
    }
  }, [history]);

  // Fix the type mismatch in generateContent
  const generateContent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setGeneratedContent('');

    try {
      const startTime = Date.now();
      
      // Get the selected platform and content type instructions
      const platformObj = PLATFORMS.find(p => p.name === platform);
      const contentTypeObj = CONTENT_TYPES.find(ct => ct.value === contentType);
      
      // Prepare instructions for the AI
      let instructions = "أجب بدقة ووضوح على الطلب التالي.";
      if (platformObj) instructions += " " + platformObj.instructions;
      if (contentTypeObj) instructions += " " + contentTypeObj.instructions;
      
      // Include internet search capability for the "بحث على الإنترنت" platform
      const shouldUseInternet = platform === 'بحث على الإنترنت';
      
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          platform,
          contentType,
          instructions,
          useInternet: shouldUseInternet
        }),
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
      
      // Add to history
      const newMessage: Message = {
        role: 'assistant',
        content: data.response,
        platform: platform,
        contentType: contentType,
        timestamp: new Date()
      };
      
      setHistory(prev => [newMessage, ...prev.slice(0, 19)]);  // Keep only the last 20 messages
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast.error('فشل في الحصول على استجابة من المساعد الذكي');
      
      setGeneratedContent('عذراً، حدث خطأ أثناء محاولة معالجة طلبك. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
      setActiveTab('result');
    }
  };

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

  // Check if current content is a CV
  const isCV = platform === 'سيرة ذاتية' || contentType === 'سيرة ذاتية';

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col h-full max-w-4xl mx-auto p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <Link to="/" className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            <Calculator className="h-5 w-5" />
            <span>العودة إلى الرئيسية</span>
          </Link>
          <ThemeToggle />
        </div>
        
        <Card className="shadow-xl border-2 overflow-hidden bg-white dark:bg-gray-900 dark:border-gray-800 relative">
          <motion.div 
            className="absolute -right-8 -top-8 w-16 h-16 bg-indigo-200 dark:bg-indigo-700/30 rounded-full blur-xl"
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
            className="absolute -left-8 -bottom-8 w-16 h-16 bg-purple-200 dark:bg-purple-700/30 rounded-full blur-xl"
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
          
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white pb-6 relative z-10 dark:from-indigo-800 dark:to-purple-800">
            <motion.div variants={slideUp}>
              <div className="flex items-center justify-center mb-4">
                <motion.div 
                  className="h-8 w-8 text-yellow-300 mr-2"
                  animate={{ 
                    rotate: [0, 5, -5, 5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <span className="shimmer-effect">✨</span>
                </motion.div>
                <CardTitle className="text-3xl font-bold text-center">المساعد الذكي المتعدد الوظائف</CardTitle>
              </div>
              <CardDescription className="text-gray-100 dark:text-gray-300 text-center text-lg mt-2">
                المساعد الذكي يوفر مجموعة من الأدوات التفاعلية التي تساعد المستخدمين في مجالات متنوعة. 
                يقدم مساعدات فريدة تشمل التحليل الشخصي، التنبؤات المستقبلية، الاستشارات المالية،
                وتحويل الأفكار إلى مشاريع عملية، بالإضافة إلى توفير تفسيرات دينية مع إمكانية تصدير السير الذاتية كملفات PDF.
              </CardDescription>
            </motion.div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-3 bg-white/20 dark:bg-black/20 mb-2 mx-auto w-fit">
                <TabsTrigger value="create" className="text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-indigo-300">
                  <MessageSquarePlus className="h-4 w-4 mr-1" />
                  <span>إنشاء محتوى</span>
                </TabsTrigger>
                <TabsTrigger value="result" className="text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-indigo-300">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>النتيجة</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-white data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-indigo-300">
                  <HistoryIcon className="h-4 w-4 mr-1" />
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
                  <PlatformSelector 
                    platforms={PLATFORMS} 
                    selectedPlatform={platform} 
                    onSelectPlatform={setPlatform}
                  />

                  <ContentTypeSelector 
                    contentTypes={CONTENT_TYPES}
                    selectedContentType={contentType}
                    onSelectContentType={setContentType}
                  />

                  <PromptInput 
                    prompt={prompt} 
                    onChange={setPrompt}
                    placeholder={getPlaceholderForPlatform(platform)}
                    isLoading={isLoading}
                  />
                  
                  <GenerateButton 
                    onClick={generateContent} 
                    isLoading={isLoading}
                    disabled={!prompt.trim()} 
                  />
                </motion.form>
              </TabsContent>
              
              <TabsContent value="result">
                {generatedContent ? (
                  <ResultDisplay 
                    content={generatedContent} 
                    contentStats={contentStats} 
                    platform={platform}
                    onNewContent={() => setActiveTab('create')}
                    isPDF={isCV}
                  />
                ) : (
                  <EmptyState
                    icon={<BookOpen className="h-12 w-12" />} 
                    title="لا يوجد محتوى حاليًا"
                    description="انتقل إلى قسم 'إنشاء محتوى' لتوليد محتوى جديد أو اختر من محفوظاتك السابقة."
                    actionLabel="إنشاء محتوى جديد"
                    onAction={() => setActiveTab('create')}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="history">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold dark:text-white">سجل المحتوى السابق</h3>
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
                      className="dark:text-gray-300 dark:hover:bg-gray-800"
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
                          <HistoryItem 
                            key={index}
                            message={message}
                            onClick={() => loadFromHistory(message)}
                            formatDate={formatDate}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <EmptyState
                      icon={<HistoryIcon className="h-12 w-12" />} 
                      title="لا يوجد سجل للمحتوى"
                      description="عندما تقوم بإنشاء محتوى، سيتم حفظه هنا تلقائيًا."
                      actionLabel={undefined}
                      onAction={undefined}
                    />
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
