import React from 'react';

interface LikertScaleProps {
  onChange: (value: number) => void;
  selectedValue: number | null;
}

export const LikertScale: React.FC<LikertScaleProps> = ({ onChange, selectedValue }) => {
  const options = [
    { value: 3, label: 'Roziman', color: 'border-green-500 text-green-500', bg: 'bg-green-500', size: 'h-14 w-14' },
    { value: 2, label: '', color: 'border-green-500 text-green-500', bg: 'bg-green-500', size: 'h-11 w-11' },
    { value: 1, label: '', color: 'border-green-500 text-green-500', bg: 'bg-green-500', size: 'h-8 w-8' },
    { value: 0, label: 'Neytral', color: 'border-slate-300 text-slate-400', bg: 'bg-slate-300', size: 'h-6 w-6' },
    { value: -1, label: '', color: 'border-red-500 text-red-500', bg: 'bg-red-500', size: 'h-8 w-8' },
    { value: -2, label: '', color: 'border-red-500 text-red-500', bg: 'bg-red-500', size: 'h-11 w-11' },
    { value: -3, label: 'Rozi emasman', color: 'border-red-500 text-red-500', bg: 'bg-red-500', size: 'h-14 w-14' },
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-8 mb-4">
      <div className="flex justify-between items-center w-full px-2 md:px-10 gap-2 md:gap-4">
        <span className="text-sm font-medium text-green-600 hidden md:block">ROZIMAN</span>
        <div className="flex flex-1 justify-between items-center relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
            
            {options.map((option) => {
              const isSelected = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => onChange(option.value)}
                  className={`
                    rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${option.size}
                    ${isSelected ? option.bg : 'bg-white hover:bg-slate-50'}
                    ${isSelected ? 'border-transparent text-white scale-110 shadow-lg' : option.color}
                  `}
                  title={option.label || `Value ${option.value}`}
                  type="button"
                >
                  {/* Inner dot for unselected state for better visibility */}
                  {!isSelected && (
                    <div className={`rounded-full opacity-0 hover:opacity-100 ${option.value === 0 ? 'bg-slate-300' : option.value > 0 ? 'bg-green-200' : 'bg-red-200'} w-1/2 h-1/2 transition-opacity`} />
                  )}
                </button>
              );
            })}
        </div>
        <span className="text-sm font-medium text-red-600 hidden md:block">ROZI EMASMAN</span>
      </div>
      <div className="flex justify-between w-full mt-2 px-2 md:hidden">
        <span className="text-xs font-bold text-green-600">ROZIMAN</span>
        <span className="text-xs font-bold text-red-600">ROZI EMASMAN</span>
      </div>
    </div>
  );
};