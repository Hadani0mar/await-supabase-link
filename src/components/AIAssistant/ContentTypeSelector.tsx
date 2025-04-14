
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentType } from './types';

interface ContentTypeSelectorProps {
  contentTypes: ContentType[];
  selectedContentType: string;
  onSelectContentType: (contentType: string) => void;
}

const ContentTypeSelector = ({ contentTypes, selectedContentType, onSelectContentType }: ContentTypeSelectorProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3 text-right">اختر نوع المحتوى:</h3>
      <Select value={selectedContentType} onValueChange={onSelectContentType}>
        <SelectTrigger className="w-full text-right" dir="rtl">
          <SelectValue placeholder="اختر نوع المحتوى" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800">
          {contentTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="text-right" dir="rtl">{type.label}</div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ContentTypeSelector;
