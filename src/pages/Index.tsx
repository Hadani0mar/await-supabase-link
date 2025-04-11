
import AIAssistant from "@/components/AIAssistant";
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, AlertCircle, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <header className="py-6 px-4 bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">مساعد كتابة المحتوى الاجتماعي</h1>
          </div>
          <p className="text-sm font-medium text-indigo-500">بدعم من Google Gemini</p>
        </div>
      </header>
      
      <main className="py-8 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">أنشئ محتوى احترافي بنقرة واحدة</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            مساعدك الذكي لكتابة محتوى جذاب ومؤثر لجميع منصات التواصل الاجتماعي باللغة العربية
          </p>
        </motion.div>

        <AIAssistant />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">محتوى إبداعي</h3>
              <p className="text-gray-600 text-sm">توليد محتوى أصلي وإبداعي مخصص لمنصتك المفضلة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Megaphone className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">متوافق مع المنصات</h3>
              <p className="text-gray-600 text-sm">محتوى مخصص لكل منصة اجتماعية تناسب جمهورك المستهدف</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">سهل الاستخدام</h3>
              <p className="text-gray-600 text-sm">واجهة بسيطة وسهلة تمكنك من إنشاء المحتوى بسرعة ومشاركته</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <footer className="py-6 px-4 bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600">&copy; {new Date().getFullYear()} مساعد كتابة المحتوى الاجتماعي - جميع الحقوق محفوظة</p>
          <div className="flex justify-center gap-3 mt-2">
            <a href="#" className="text-xs text-indigo-600 hover:underline">الشروط والأحكام</a>
            <a href="#" className="text-xs text-indigo-600 hover:underline">سياسة الخصوصية</a>
            <a href="#" className="text-xs text-indigo-600 hover:underline">اتصل بنا</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
