
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlatformType } from './types';

interface PlatformSelectorProps {
  platforms: PlatformType[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

const PlatformSelector = ({ platforms, selectedPlatform, onSelectPlatform }: PlatformSelectorProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3 text-right">اختر نوع المساعدة:</h3>
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
                      selectedPlatform === p.name 
                        ? `${p.color} text-white border-transparent` 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700'
                    } transition-all duration-200`}
                    onClick={() => onSelectPlatform(p.name)}
                  >
                    <IconComponent size={18} />
                    <span>{p.name}</span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  <p dir="rtl" className="max-w-xs text-sm">{p.instructions}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSelector;
