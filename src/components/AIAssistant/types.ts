
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  platform?: string;
  contentType?: string;
  timestamp: Date;
}

export interface ContentStats {
  characters: number;
  words: number;
  estimatedReadTime: string;
}

export interface PlatformType {
  name: string;
  icon: any;
  color: string;
  instructions: string;
}

export interface ContentType {
  value: string;
  label: string;
  instructions: string;
}

export interface ErrorResponse {
  error: string;
  response?: string;
  stats?: ContentStats;
}
