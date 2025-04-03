import React, { useState } from 'react';
import { HiChevronDown, HiChevronUp, HiClipboard, HiCheck } from 'react-icons/hi';

const InstallationInstructions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  const codeSnippets = [
    {
      title: 'קוד HTML',
      language: 'html',
      code: `<form id="lead-form" action="https://your-api-endpoint.com/api/leads" method="POST">
  <input type="text" name="name" placeholder="שם מלא" required>
  <input type="email" name="email" placeholder="אימייל" required>
  <input type="tel" name="phone" placeholder="טלפון" required>
  <input type="hidden" name="source" value="website">
  <button type="submit">שלח</button>
</form>`
    },
    {
      title: 'קוד JavaScript',
      language: 'javascript',
      code: `document.getElementById('lead-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  
  fetch('https://your-api-endpoint.com/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'YOUR_API_KEY_HERE'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    // Handle success
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle error
  });
});`
    },
    {
      title: 'קוד PHP',
      language: 'php',
      code: `<?php
// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $apiKey = 'YOUR_API_KEY_HERE';
  $apiEndpoint = 'https://your-api-endpoint.com/api/leads';
  
  $data = [
    'name' => $_POST['name'] ?? '',
    'email' => $_POST['email'] ?? '',
    'phone' => $_POST['phone'] ?? '',
    'source' => $_POST['source'] ?? 'website'
  ];
  
  $options = [
    'http' => [
      'header' => "Content-type: application/json\r\nX-API-Key: $apiKey\r\n",
      'method' => 'POST',
      'content' => json_encode($data)
    ]
  ];
  
  $context = stream_context_create($options);
  $result = file_get_contents($apiEndpoint, false, $context);
  
  if ($result === FALSE) {
    // Handle error
  } else {
    // Handle success
  }
}
?>`
    }
  ];
  
  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-right"
      >
        <h3 className="text-md font-medium text-gray-900">הוראות התקנה</h3>
        {isOpen ? (
          <HiChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <HiChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-4">
            כדי לחבר את הטפסים שלך למערכת, השתמש באחד מקטעי הקוד הבאים:
          </p>
          
          <div className="space-y-4">
            {codeSnippets.map((snippet, index) => (
              <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{snippet.title}</span>
                  <button
                    onClick={() => handleCopyCode(snippet.code, index)}
                    className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                  >
                    {copiedIndex === index ? (
                      <>
                        <HiCheck className="h-4 w-4 ml-1 text-green-500" />
                        הועתק
                      </>
                    ) : (
                      <>
                        <HiClipboard className="h-4 w-4 ml-1" />
                        העתק קוד
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-gray-800 overflow-x-auto">
                  <pre className="text-xs text-gray-100 whitespace-pre-wrap">
                    <code>{snippet.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">טיפים להתקנה:</h4>
            <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
              <li>החלף את <code className="bg-blue-100 px-1 rounded">https://your-api-endpoint.com/api/leads</code> בכתובת ה-API האמיתית שלך</li>
              <li>החלף את <code className="bg-blue-100 px-1 rounded">YOUR_API_KEY_HERE</code> במפתח ה-API שלך</li>
              <li>התאם את שדות הטופס לפי הצורך</li>
              <li>אם אתה משתמש במערכת ניהול תוכן כמו WordPress, השתמש בתוסף המתאים במקום</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationInstructions;
