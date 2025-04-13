
import NumericSystemAnalyzer from "@/components/NumericSystemAnalyzer";
import { motion } from 'framer-motion';
import { Calculator, ChevronDown, Cpu, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <header className="py-6 px-4 bg-slate-800 shadow-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              محلل الأنظمة العددية
            </h1>
          </div>
          <p className="text-sm font-medium text-blue-300">تحليل متقدم للأنظمة الرقمية</p>
        </div>
      </header>
      
      <main className="py-8 px-4 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-center text-white mb-3">حلل وحول بين الأنظمة العددية المختلفة</h2>
          <p className="text-center text-gray-300 max-w-2xl mx-auto">
            أداة احترافية لتحليل وتحويل الأنظمة العددية المختلفة مثل الثنائي والعشري والثماني والسادس عشر
          </p>
        </motion.div>

        <NumericSystemAnalyzer />
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          <Card className="bg-slate-800 shadow-lg hover:shadow-xl transition-shadow border-slate-700">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-blue-900/50 rounded-full flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-100">تحليل سريع</h3>
              <p className="text-gray-400 text-sm">تحليل فوري للأرقام بين جميع الأنظمة العددية المختلفة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 shadow-lg hover:shadow-xl transition-shadow border-slate-700">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-cyan-900/50 rounded-full flex items-center justify-center mb-4">
                <Cpu className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-100">دقة عالية</h3>
              <p className="text-gray-400 text-sm">دقة متناهية في تحويل وتحليل الأرقام بين مختلف الأنظمة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 shadow-lg hover:shadow-xl transition-shadow border-slate-700">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-12 w-12 bg-emerald-900/50 rounded-full flex items-center justify-center mb-4">
                <ChevronDown className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-100">سهل الاستخدام</h3>
              <p className="text-gray-400 text-sm">واجهة بسيطة تمكنك من تحويل الأرقام بين الأنظمة بسهولة</p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <footer className="py-6 px-4 bg-slate-900 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-gray-300">&copy; {new Date().getFullYear()}</span>
            <span className="text-gray-300 flex items-center">
              Bn0mar
              <CheckCircle2 className="h-4 w-4 text-blue-500 ml-1" aria-label="Verified Account" />
            </span>
          </div>
          <div className="flex justify-center gap-3 mt-2">
            <a href="#" className="text-xs text-blue-400 hover:underline">الشروط والأحكام</a>
            <a href="#" className="text-xs text-blue-400 hover:underline">سياسة الخصوصية</a>
            <a href="#" className="text-xs text-blue-400 hover:underline">اتصل بنا</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
