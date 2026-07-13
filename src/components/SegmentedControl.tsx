import { View, Text } from '@tarojs/components';

interface Option {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <View className={`inline-flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 ${className}`}>
      {options.map((opt) => (
        <View
          key={opt.key}
          className={`px-4 py-1.5 rounded-md text-sm font-medium text-center transition-colors ${
            value === opt.key
              ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => onChange(opt.key)}
        >
          <Text>{opt.label}</Text>
        </View>
      ))}
    </View>
  );
}