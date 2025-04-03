import React, { useState } from 'react';
import { HiClipboardCopy, HiCheck } from 'react-icons/hi';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'text', 
  title,
  showLineNumbers = false
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCode = () => {
    if (!showLineNumbers) {
      return <pre className="whitespace-pre-wrap break-words">{code}</pre>;
    }

    const lines = code.split('\n');
    return (
      <pre className="whitespace-pre">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-gray-500 w-8 text-right select-none mr-4">{i + 1}</span>
            <span>{line}</span>
          </div>
        ))}
      </pre>
    );
  };

  return (
    <div className="bg-gray-100 rounded-md overflow-hidden">
      {title && (
        <div className="bg-gray-200 px-4 py-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{title}</span>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">{language}</span>
            <div className="relative">
              <button
                onClick={copyToClipboard}
                className="p-1 rounded hover:bg-gray-300 focus:outline-none"
                title="העתק לקליפבורד"
              >
                {copied ? (
                  <HiCheck className="h-5 w-5 text-green-500" />
                ) : (
                  <HiClipboardCopy className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {copied && (
                <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg">
                  הועתק!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={`p-4 text-sm font-mono overflow-x-auto ${!title ? 'relative' : ''}`}>
        {!title && (
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 focus:outline-none"
            title="העתק לקליפבורד"
          >
            {copied ? (
              <HiCheck className="h-5 w-5 text-green-500" />
            ) : (
              <HiClipboardCopy className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
        {renderCode()}
      </div>
    </div>
  );
};

export default CodeBlock;
