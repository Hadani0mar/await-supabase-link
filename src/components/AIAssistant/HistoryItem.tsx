
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';
import { Message } from './types';

interface HistoryItemProps {
  message: Message;
  onClick: () => void;
  formatDate: (date: Date) => string;
}

const HistoryItem = ({ message, onClick, formatDate }: HistoryItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {message.platform && (
            <Badge variant="outline" className="text-xs dark:border-gray-600">
              {message.platform}
            </Badge>
          )}
          {message.contentType && message.contentType !== 'عام' && (
            <Badge variant="secondary" className="text-xs dark:bg-gray-700">
              {message.contentType}
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span dir="ltr">{formatDate(message.timestamp)}</span>
        </div>
      </div>
      <p className="text-sm text-right line-clamp-2 dark:text-gray-300" dir="rtl">
        {message.content}
      </p>
    </motion.div>
  );
};

export default HistoryItem;
