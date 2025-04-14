
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const GenerateButton = ({ onClick, isLoading, disabled }: GenerateButtonProps) => {
  return (
    <Button 
      type="button" 
      onClick={onClick}
      disabled={isLoading || disabled} 
      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg py-6 relative overflow-hidden group dark:from-indigo-600 dark:to-purple-700"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>جاري إنشاء المحتوى...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
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
  );
};

export default GenerateButton;
