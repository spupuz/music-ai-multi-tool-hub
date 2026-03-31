import React from 'react';

export interface WikiTopic {
  id: string;
  title: string;
  category: string;
  content: React.ReactElement;
  keywords: string[];
}
