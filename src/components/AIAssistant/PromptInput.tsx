
import { Textarea } from '@/components/ui/textarea';

interface PromptInputProps {
  prompt: string;
  onChange: (value: string) => void;
  placeholder: string;
  isLoading: boolean;
}

const PromptInput = ({ prompt, onChange, placeholder, isLoading }: PromptInputProps) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-medium mb-3 text-right dark:text-gray-100">ماذا تريد المساعدة به؟</h3>
      <Textarea
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        className="min-h-[150px] text-right dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        dir="rtl"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">أدخل وصفًا دقيقًا للحصول على أفضل النتائج.</p>
    </div>
  );
};

export default PromptInput;
