
import AIAssistant from "@/components/AIAssistant";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <header className="py-6 px-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">مساعد كتابة المحتوى الاجتماعي</h1>
          <p className="text-sm text-gray-500">بدعم من Google Gemini</p>
        </div>
      </header>
      
      <main className="flex-1 py-8 px-4">
        <AIAssistant />
      </main>
      
      <footer className="py-6 px-4 bg-white border-t">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} مساعد كتابة المحتوى الاجتماعي - جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
};

export default Index;
