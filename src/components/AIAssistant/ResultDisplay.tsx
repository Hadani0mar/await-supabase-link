
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Clock, Copy, Twitter, Facebook, Instagram, RotateCw, ThumbsUp, FileText, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ContentStats } from './types';
import html2pdf from 'html2pdf.js';

interface ResultDisplayProps {
  content: string;
  contentStats: ContentStats | null;
  platform: string;
  onNewContent: () => void;
  isPDF?: boolean;
}

const ResultDisplay = ({ content, contentStats, platform, onNewContent, isPDF = false }: ResultDisplayProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  
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
      case 'instagram':
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

  const generatePDF = async () => {
    if (contentRef.current) {
      setDownloading(true);
      try {
        const element = contentRef.current;
        const opt = {
          margin: [10, 10],
          filename: 'سيرة_ذاتية.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
        toast.success('تم تحميل السيرة الذاتية بنجاح');
      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('حدث خطأ أثناء إنشاء ملف PDF');
      } finally {
        setDownloading(false);
      }
    }
  };

  const getPlatformBadgeClass = (platformName: string) => {
    switch (platformName) {
      case 'حكمة مستقبلية':
        return 'bg-indigo-600 dark:bg-indigo-500';
      case 'تنبؤات فكاهية':
        return 'bg-purple-600 dark:bg-purple-500';
      case 'استشارة مالية':
        return 'bg-emerald-600 dark:bg-emerald-500';
      case 'شرح بأسلوب طفل':
        return 'bg-yellow-600 dark:bg-yellow-500';
      case 'سيرة ذاتية':
        return 'bg-blue-600 dark:bg-blue-500';
      case 'تفسير ديني':
        return 'bg-teal-600 dark:bg-teal-500';
      case 'بحث على الإنترنت':
        return 'bg-cyan-600 dark:bg-cyan-500';
      default:
        return 'bg-gray-600 dark:bg-gray-500';
    }
  };

  return (
    <motion.div 
      className="mt-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-600 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            <span>{contentStats?.estimatedReadTime || "1 دقيقة للقراءة"}</span>
          </Badge>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-400">المحتوى المُنشَأ</h3>
            {platform !== 'عام' && (
              <Badge className={getPlatformBadgeClass(platform)}>
                {platform}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex gap-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={() => copyToClipboard(content)}
              title="نسخ المحتوى"
            >
              <Copy className="h-4 w-4" />
              <span>نسخ</span>
            </Button>
            {isPDF && (
              <Button 
                variant="outline"
                size="sm"
                className="flex gap-1 border-gray-300 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:hover:bg-blue-800/50 dark:text-blue-400"
                onClick={generatePDF}
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري التحميل...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>تحميل PDF</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <div 
          ref={contentRef}
          className={`whitespace-pre-wrap text-right py-4 px-5 bg-white dark:bg-gray-900 rounded-md border-2 border-gray-100 dark:border-gray-700 shadow-inner min-h-[200px] ${isPDF ? 'cv-content' : ''}`}
          dir="rtl"
        >
          {content.split('\n').map((line, i) => (
            <p key={i} className={line.trim() === '' ? 'my-2' : 'mb-2'}>
              {line}
            </p>
          ))}
        </div>
        
        <div className="flex flex-wrap justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            {contentStats && (
              <>
                <Badge variant="outline" className="mr-2 text-xs dark:border-gray-600 dark:text-gray-300">
                  {contentStats.characters} حرفًا
                </Badge>
                <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                  {contentStats.words} كلمة
                </Badge>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <h4 className="text-sm text-gray-500 dark:text-gray-400 ml-2 flex items-center">مشاركة على:</h4>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 bg-[#1DA1F2] text-white border-none hover:bg-[#1a94e0]" 
              onClick={() => shareContent('twitter', content)}
            >
              <Twitter className="h-4 w-4" />
              <span>تويتر</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 bg-[#4267B2] text-white border-none hover:bg-[#365899]" 
              onClick={() => shareContent('facebook', content)}
            >
              <Facebook className="h-4 w-4" />
              <span>فيسبوك</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-1 bg-gradient-to-r from-[#405DE6] via-[#E1306C] to-[#FFDC80] text-white border-none hover:opacity-90" 
              onClick={() => shareContent('instagram', content)}
            >
              <Instagram className="h-4 w-4" />
              <span>انستغرام</span>
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            className="flex gap-2 items-center dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
            onClick={onNewContent}
          >
            <RotateCw className="h-4 w-4" />
            <span>إنشاء محتوى آخر</span>
          </Button>
          <Button
            variant="ghost"
            className="flex gap-2 items-center dark:text-gray-300 dark:hover:bg-gray-800"
            onClick={() => toast.success('تم حفظ المحتوى في السجل')}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>أعجبني</span>
          </Button>
          {isPDF && (
            <Button 
              variant="default"
              className="flex gap-1 bg-blue-600 hover:bg-blue-700"
              onClick={generatePDF}
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري التحميل...</span>
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  <span>تحميل السيرة الذاتية (PDF)</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;
