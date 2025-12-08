'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Option {
  id: number;
  label: string;
}

interface AutocompleteInputProps {
  label: string;
  placeholder: string;
  options: Option[];
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
  icon?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function AutocompleteInput({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  searchValue,
  onSearchChange,
  loading = false,
  icon,
  inputRef,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const localInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLButtonElement[]>([]);

  // Use provided ref or local ref
  const inputReference = inputRef || localInputRef;

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Limit to 4 items
  const displayOptions = filteredOptions.slice(0, 4);

  // Always show search value in input
  const displayValue = searchValue;

  // Reset highlighted index when options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: Option) => {
    onChange(option.id);
    onSearchChange(option.label);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setIsOpen(true);
    inputReference.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < displayOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (displayOptions[highlightedIndex]) {
          handleOptionClick(displayOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Scroll highlighted option into view
  useEffect(() => {
    if (optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          ref={inputReference}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || loading}
          className={`placeholder:text-gray-400 text-gray-900 w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
        />

        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : searchValue && !disabled ? (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            ✕
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {isOpen && !disabled && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {displayOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                Natija topilmadi
              </div>
            ) : (
              <div className="max-h-[240px] overflow-y-auto">
                {displayOptions.map((option, index) => (
                  <button
                    key={option.id}
                    ref={(el) => {
                      if (el) optionsRef.current[index] = el;
                    }}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full px-4 py-3 text-left text-sm text-gray-900 transition-all duration-200 flex items-center gap-2 ${
                      highlightedIndex === index
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                    type="button"
                  >
                    <span className="flex-1">{option.label}</span>
                    {value === option.id && (
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
