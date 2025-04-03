import React, { useState, ReactNode } from 'react';
import { HiChevronDown, HiChevronRight } from 'react-icons/hi';

export interface Step {
  title: string;
  content: ReactNode;
}

interface StepsListProps {
  steps: Step[];
  defaultOpenStep?: number;
}

const StepsList: React.FC<StepsListProps> = ({ steps, defaultOpenStep = 0 }) => {
  const [openStep, setOpenStep] = useState<number>(defaultOpenStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setOpenStep(openStep === index ? -1 : index);
  };

  const markStepComplete = (index: number) => {
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(index);
    setCompletedSteps(newCompletedSteps);
    
    // Open next step if available
    if (index < steps.length - 1) {
      setOpenStep(index + 1);
    }
  };

  const markStepIncomplete = (index: number) => {
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.delete(index);
    setCompletedSteps(newCompletedSteps);
  };

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
        >
          <div 
            className={`px-4 py-3 flex justify-between items-center cursor-pointer ${
              openStep === index ? 'bg-blue-50' : 'bg-white'
            }`}
            onClick={() => toggleStep(index)}
          >
            <div className="flex items-center">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  completedSteps.has(index) 
                    ? 'bg-green-500 text-white' 
                    : index === openStep 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                }`}
              >
                {completedSteps.has(index) ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <h3 className={`font-medium ${openStep === index ? 'text-blue-800' : 'text-gray-800'}`}>
                {step.title}
              </h3>
            </div>
            <div>
              {openStep === index ? (
                <HiChevronDown className="h-5 w-5 text-blue-500" />
              ) : (
                <HiChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          
          {openStep === index && (
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <div className="mr-9">
                {step.content}
                
                <div className="mt-4 flex justify-between">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenStep(index - 1);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      הקודם
                    </button>
                  )}
                  
                  <div className="flex space-x-2 space-x-reverse">
                    {completedSteps.has(index) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markStepIncomplete(index);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none mr-2"
                      >
                        סמן כלא הושלם
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markStepComplete(index);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-green-500 text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600 focus:outline-none mr-2"
                      >
                        סמן כהושלם
                      </button>
                    )}
                    
                    {index < steps.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenStep(index + 1);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none"
                      >
                        הבא
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepsList;
