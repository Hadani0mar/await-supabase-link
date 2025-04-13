
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowRightLeft, Copy, RotateCw, Binary, Hash, Info, AlertCircle,
  RefreshCcw, ChevronRight, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";

interface ConversionResult {
  binary: string;
  decimal: string;
  octal: string;
  hexadecimal: string;
  bits: number;
  isValid: boolean;
}

const NumericSystemAnalyzer = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState('10');
  const [results, setResults] = useState<ConversionResult | null>(null);
  const [history, setHistory] = useState<Array<{input: string, base: string, results: ConversionResult, timestamp: Date}>>([]);
  const [activeTab, setActiveTab] = useState('converter');
  const [isCalculating, setIsCalculating] = useState(false);
  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Load history from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('conversionHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
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

  // Save history to local storage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('conversionHistory', JSON.stringify(history));
    }
  }, [history]);

  const analyzeNumber = () => {
    if (!inputValue.trim()) {
      toast.error('الرجاء إدخال قيمة للتحويل');
      return;
    }

    setIsCalculating(true);

    // Simulate calculation time (can be removed in production)
    setTimeout(() => {
      try {
        // Convert input to decimal first
        let decimalValue: number;
        
        switch (inputBase) {
          case '2':  // Binary
            decimalValue = parseInt(inputValue, 2);
            break;
          case '8':  // Octal
            decimalValue = parseInt(inputValue, 8);
            break;
          case '10': // Decimal
            decimalValue = parseInt(inputValue, 10);
            break;
          case '16': // Hexadecimal
            decimalValue = parseInt(inputValue, 16);
            break;
          default:
            throw new Error('نظام عددي غير معروف');
        }

        if (isNaN(decimalValue)) {
          throw new Error('قيمة غير صالحة للنظام العددي المحدد');
        }

        // Convert decimal to all other systems
        const result: ConversionResult = {
          binary: decimalValue.toString(2),
          decimal: decimalValue.toString(10),
          octal: decimalValue.toString(8),
          hexadecimal: decimalValue.toString(16).toUpperCase(),
          bits: decimalValue.toString(2).length,
          isValid: true
        };

        setResults(result);

        // Add to history
        setHistory(prev => [{
          input: inputValue,
          base: inputBase,
          results: result,
          timestamp: new Date()
        }, ...prev.slice(0, 19)]);  // Keep only last 20 items

        toast.success('تم التحويل بنجاح');
        setActiveTab('results');
      } catch (error) {
        console.error('Conversion error:', error);
        toast.error(`خطأ في التحويل: ${error instanceof Error ? error.message : 'قيمة غير صالحة'}`);
        
        setResults({
          binary: '',
          decimal: '',
          octal: '',
          hexadecimal: '',
          bits: 0,
          isValid: false
        });
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(`تم نسخ ${label} إلى الحافظة`);
      },
      () => {
        toast.error('فشل في نسخ المحتوى');
      }
    );
  };

  const clearHistory = () => {
    if (confirm('هل أنت متأكد من حذف سجل التحويلات بالكامل؟')) {
      setHistory([]);
      localStorage.removeItem('conversionHistory');
      toast.success('تم محو السجل بنجاح');
    }
  };

  const loadFromHistory = (item: {input: string, base: string, results: ConversionResult}) => {
    setInputValue(item.input);
    setInputBase(item.base);
    setResults(item.results);
    setActiveTab('results');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getBaseIcon = (base: string) => {
    switch (base) {
      case '2': return <Binary className="h-4 w-4" />;
      case '8': return <span className="font-mono">8</span>;
      case '16': return <span className="font-mono">16</span>;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  const getBaseName = (base: string) => {
    switch (base) {
      case '2': return 'ثنائي';
      case '8': return 'ثماني';
      case '10': return 'عشري';
      case '16': return 'ست عشري';
      default: return 'غير معروف';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex flex-col h-full max-w-4xl mx-auto"
      >
        <Card className="shadow-2xl border-2 overflow-hidden bg-slate-800 border-slate-700 relative">
          <motion.div 
            className="absolute -right-8 -top-8 w-16 h-16 bg-blue-700/20 rounded-full blur-xl"
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
            className="absolute -left-8 -bottom-8 w-16 h-16 bg-cyan-700/20 rounded-full blur-xl"
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
          
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 pb-6 relative z-10">
            <motion.div variants={slideUp}>
              <div className="flex items-center justify-center mb-4">
                <Binary className="h-8 w-8 text-blue-400 mr-2" />
                <CardTitle className="text-3xl font-bold text-center">محلل الأنظمة العددية</CardTitle>
              </div>
              <CardDescription className="text-gray-300 text-center text-lg mt-2">
                تحويل وتحليل سريع بين الأنظمة الثنائية والعشرية والثمانية والست عشرية
              </CardDescription>
            </motion.div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-3 bg-slate-700/30 mb-2 mx-auto w-fit">
                <TabsTrigger value="converter" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <ArrowRightLeft className="h-4 w-4 mr-1" />
                  <span>المحول</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Info className="h-4 w-4 mr-1" />
                  <span>النتائج</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="text-slate-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <RefreshCcw className="h-4 w-4 mr-1" />
                  <span>السجل</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent className="p-6 relative z-10">
            <TabsContent value="converter">
              <motion.div 
                className="space-y-4"
                variants={slideUp}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-3 text-right">اختر نظام الإدخال:</h3>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {[
                      { value: '2', label: 'ثنائي (Binary)', icon: Binary },
                      { value: '8', label: 'ثماني (Octal)', icon: () => <span className="font-mono">8</span> },
                      { value: '10', label: 'عشري (Decimal)', icon: Hash },
                      { value: '16', label: 'ست عشري (Hex)', icon: () => <span className="font-mono">0x</span> },
                    ].map((system) => {
                      const IconComponent = system.icon;
                      return (
                        <motion.button
                          key={system.value}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                            inputBase === system.value 
                              ? `bg-blue-600 text-white border-blue-500` 
                              : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                          } transition-all duration-200`}
                          onClick={() => setInputBase(system.value)}
                        >
                          <IconComponent size={18} />
                          <span>{system.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600 mb-6">
                  <h3 className="text-lg font-medium text-white mb-3 text-right">أدخل الرقم للتحويل:</h3>
                  <div className="relative">
                    <Label 
                      htmlFor="number-input" 
                      className="absolute top-3 right-3 px-2 py-0.5 bg-slate-800 text-blue-300 rounded text-xs z-10"
                    >
                      {getBaseName(inputBase)}
                    </Label>
                    <Input
                      id="number-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={inputBase === '16' ? "مثال: 1A3F" : inputBase === '2' ? "مثال: 10101" : "أدخل رقم للتحويل..."}
                      disabled={isCalculating}
                      className="min-h-[50px] text-right bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <p>حروف A-F مسموح بها للنظام الست عشري</p>
                    <p className="text-right">
                      {inputBase === '2' && "0 و 1 فقط"}
                      {inputBase === '8' && "0-7 فقط"}
                      {inputBase === '10' && "0-9 فقط"}
                      {inputBase === '16' && "0-9, A-F فقط"}
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={analyzeNumber}
                  disabled={isCalculating || !inputValue.trim()} 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg py-6 relative overflow-hidden group"
                >
                  {isCalculating ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>جاري التحليل...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Binary className="h-5 w-5" />
                      <span>تحليل وتحويل</span>
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
              </motion.div>
            </TabsContent>
            
            <TabsContent value="results">
              {results ? (
                <motion.div 
                  className="mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline" className="flex items-center gap-1 border-slate-500">
                        <Info className="h-3 w-3" />
                        <span>{results.bits} بت</span>
                      </Badge>
                      <h3 className="text-xl font-bold text-blue-300">نتائج التحليل</h3>
                      <Badge 
                        className={`
                          ${inputBase === '2' ? 'bg-blue-800' : ''}
                          ${inputBase === '8' ? 'bg-purple-800' : ''}
                          ${inputBase === '10' ? 'bg-green-800' : ''}
                          ${inputBase === '16' ? 'bg-orange-800' : ''}
                        `}
                      >
                        {getBaseName(inputBase)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4 mt-6">
                      {/* Binary Result */}
                      <div className="bg-slate-800 rounded-md border border-slate-600 p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(results.binary, "النظام الثنائي")}
                            className="text-slate-300 hover:text-white"
                          >
                            <Copy size={14} />
                          </Button>
                          <h4 className="font-medium text-blue-300 flex items-center gap-1">
                            <Binary size={16} />
                            <span>النظام الثنائي (Binary)</span>
                          </h4>
                        </div>
                        <p className="font-mono text-right py-2 text-white break-all">{results.binary || "غير صالح"}</p>
                      </div>
                      
                      {/* Decimal Result */}
                      <div className="bg-slate-800 rounded-md border border-slate-600 p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(results.decimal, "النظام العشري")}
                            className="text-slate-300 hover:text-white"
                          >
                            <Copy size={14} />
                          </Button>
                          <h4 className="font-medium text-green-300 flex items-center gap-1">
                            <Hash size={16} />
                            <span>النظام العشري (Decimal)</span>
                          </h4>
                        </div>
                        <p className="font-mono text-right py-2 text-white">{results.decimal || "غير صالح"}</p>
                      </div>
                      
                      {/* Octal Result */}
                      <div className="bg-slate-800 rounded-md border border-slate-600 p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(results.octal, "النظام الثماني")}
                            className="text-slate-300 hover:text-white"
                          >
                            <Copy size={14} />
                          </Button>
                          <h4 className="font-medium text-purple-300 flex items-center gap-1">
                            <span className="font-mono text-sm">8</span>
                            <span>النظام الثماني (Octal)</span>
                          </h4>
                        </div>
                        <p className="font-mono text-right py-2 text-white">{results.octal || "غير صالح"}</p>
                      </div>
                      
                      {/* Hexadecimal Result */}
                      <div className="bg-slate-800 rounded-md border border-slate-600 p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(results.hexadecimal, "النظام الست عشري")}
                            className="text-slate-300 hover:text-white"
                          >
                            <Copy size={14} />
                          </Button>
                          <h4 className="font-medium text-orange-300 flex items-center gap-1">
                            <span className="font-mono text-sm">0x</span>
                            <span>النظام الست عشري (Hex)</span>
                          </h4>
                        </div>
                        <p className="font-mono text-right py-2 text-white">{results.hexadecimal || "غير صالح"}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        className="flex gap-2 items-center border-slate-500 text-slate-300 hover:text-white"
                        onClick={() => setActiveTab('converter')}
                      >
                        <RotateCw className="h-4 w-4" />
                        <span>تحويل رقم آخر</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">لا توجد نتائج بعد</h3>
                  <p className="text-sm max-w-sm text-center">
                    انتقل إلى المحول لإدخال رقم وتحويله بين الأنظمة العددية المختلفة.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-slate-600 text-slate-300"
                    onClick={() => setActiveTab('converter')}
                  >
                    البدء في التحويل
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-200">سجل التحويلات السابقة</h3>
                {history.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearHistory}
                    className="text-slate-300"
                  >
                    محو السجل
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[350px] pr-3">
                {history.length > 0 ? (
                  <motion.div layout className="space-y-3">
                    <AnimatePresence>
                      {history.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="bg-slate-700 border border-slate-600 rounded-lg p-3 hover:bg-slate-600 transition-colors cursor-pointer"
                          onClick={() => loadFromHistory(item)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`
                                  ${item.base === '2' ? 'bg-blue-800' : ''}
                                  ${item.base === '8' ? 'bg-purple-800' : ''}
                                  ${item.base === '10' ? 'bg-green-800' : ''}
                                  ${item.base === '16' ? 'bg-orange-800' : ''}
                                `}
                              >
                                {getBaseName(item.base)}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-1" dir="ltr">
                              <span>{formatDate(item.timestamp)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-blue-300 text-sm">
                              <ChevronRight className="h-4 w-4" />
                              <span>{item.results.bits} بت</span>
                            </div>
                            <p className="text-sm text-right font-mono text-white" dir="ltr">
                              {item.input}
                            </p>
                          </div>
                          <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                            <div className="text-blue-300">
                              <span className="text-slate-400">ثنائي:</span> {item.results.binary.substring(0, 8)}{item.results.binary.length > 8 ? '...' : ''}
                            </div>
                            <div className="text-green-300">
                              <span className="text-slate-400">عشري:</span> {item.results.decimal}
                            </div>
                            <div className="text-purple-300">
                              <span className="text-slate-400">ثماني:</span> {item.results.octal}
                            </div>
                            <div className="text-orange-300">
                              <span className="text-slate-400">ست عشري:</span> {item.results.hexadecimal}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <RefreshCcw className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">لا يوجد سجل للتحويلات</h3>
                    <p className="text-sm max-w-sm text-center">
                      عندما تقوم بتحويل الأرقام، ستظهر هنا لتتمكن من الرجوع إليها لاحقًا.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default NumericSystemAnalyzer;
