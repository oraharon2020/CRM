import React, { useState } from 'react';
import { HiClipboardCopy, HiCheck, HiRefresh } from 'react-icons/hi';

interface WebhookGeneratorProps {
  baseUrl: string;
  path: string;
  apiKeyParam?: string;
  additionalParams?: Record<string, string>;
  label?: string;
  onGenerate?: (url: string) => void;
}

const WebhookGenerator: React.FC<WebhookGeneratorProps> = ({
  baseUrl,
  path,
  apiKeyParam = 'api_key',
  additionalParams = {},
  label = 'Webhook URL',
  onGenerate
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    // Generate a random API key on component mount
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  });
  
  const [copied, setCopied] = useState(false);

  const generateWebhookUrl = () => {
    let url = `${baseUrl}${path}?${apiKeyParam}=${apiKey}`;
    
    // Add additional parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(value)}`;
    });
    
    return url;
  };

  const webhookUrl = generateWebhookUrl();

  const regenerateApiKey = () => {
    const newApiKey = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);
    setApiKey(newApiKey);
    
    if (onGenerate) {
      onGenerate(generateWebhookUrl());
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex items-stretch flex-grow">
          <input
            type="text"
            value={webhookUrl}
            readOnly
            className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 bg-gray-50"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            {copied ? (
              <HiCheck className="h-5 w-5 text-green-500" />
            ) : (
              <HiClipboardCopy className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-none text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          העתק
        </button>
        <button
          type="button"
          onClick={regenerateApiKey}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <HiRefresh className="h-4 w-4 ml-1" />
          חדש
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        השתמש ב-URL זה בהגדרות ה-Webhook של האינטגרציה שלך.
      </p>
    </div>
  );
};

export default WebhookGenerator;
