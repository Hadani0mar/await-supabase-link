
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
      <div className="mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm max-w-sm text-center">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          variant="outline"
          className="mt-4 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
