import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PwaInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Check if the device is macOS
    const macOS = /Mac/.test(navigator.userAgent) && !ios;
    setIsMacOS(macOS);

    // Check if the browser is Chrome
    const chrome = /Chrome/.test(navigator.userAgent) && !/Edge|Edg/.test(navigator.userAgent);
    setIsChrome(chrome);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the saved prompt since it can't be used again
    setInstallPrompt(null);
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Don't show anything if there's no install prompt and it's not iOS/macOS
  if (!installPrompt && !isIOS && !isMacOS) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 max-w-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-2 text-right">התקנת האפליקציה</h3>
      
      {isChrome && installPrompt && (
        <button
          onClick={handleInstallClick}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2"
        >
          התקן את האפליקציה
        </button>
      )}
      
      {(isIOS || isMacOS) && (
        <>
          <button
            onClick={toggleInstructions}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-2"
          >
            {showInstructions ? 'הסתר הנחיות' : 'הצג הנחיות התקנה'}
          </button>
          
          {showInstructions && (
            <div className="mt-2 text-sm text-right">
              <p className="mb-2 font-bold">הנחיות להתקנה ב-Safari:</p>
              {isIOS && (
                <ol className="list-decimal list-inside space-y-1">
                  <li>לחץ על כפתור השיתוף <span className="inline-block w-5 h-5 bg-gray-200 rounded-sm text-center">↑</span> בתחתית המסך</li>
                  <li>גלול מטה ולחץ על "הוסף למסך הבית" (Add to Home Screen)</li>
                  <li>לחץ על "הוסף" בפינה הימנית העליונה</li>
                </ol>
              )}
              {isMacOS && (
                <ol className="list-decimal list-inside space-y-1">
                  <li>לחץ על תפריט "File" בשורת התפריטים</li>
                  <li>בחר באפשרות "Add to Dock" או "Add Bookmark"</li>
                  <li>לחץ על "Add"</li>
                </ol>
              )}
            </div>
          )}
        </>
      )}
      
      <button
        onClick={() => document.querySelector('.fixed')?.remove()}
        className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </div>
  );
};

export default PwaInstallPrompt;
