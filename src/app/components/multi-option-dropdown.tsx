import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export interface MultiOptionDropdownProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
}

export function MultiOptionDropdown({
    options,
    selected,
    onChange,
    placeholder = 'Search or select categories...',
    className = '',
    disabled = false,
    id: externalId
}: MultiOptionDropdownProps) {
    const generatedId = useId();
    const id = externalId || generatedId;

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Filter options based on user query
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(query.trim().toLowerCase())
    );

    // Reset highlighted index when filtered options change
    useEffect(() => {
        setHighlightedIndex(0);
    }, [query, isOpen]);

    // Scroll highlighted item into view if navigating with keyboard
    useEffect(() => {
        if (isOpen && listRef.current) {
            const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
        setQuery('');
        inputRef.current?.focus();
    };

    const removeOption = (optionToRemove: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        onChange(selected.filter(item => item !== optionToRemove));
        inputRef.current?.focus();
    };

    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
        setQuery('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else {
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else {
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (isOpen && filteredOptions.length > 0) {
                const target = filteredOptions[highlightedIndex];
                if (target) {
                    toggleOption(target);
                }
            } else if (!isOpen) {
                setIsOpen(true);
            }
        } else if (e.key === 'Backspace' && query === '' && selected.length > 0) {
            // Remove the last selected badge on backspace
            removeOption(selected[selected.length - 1]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={containerRef} className={`relative w-full text-left ${className}`}>
            {/* Multi-select input box */}
            <div
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(true);
                        inputRef.current?.focus();
                    }
                }}
                className={`flex flex-wrap items-center gap-1.5 min-h-[44px] px-3 py-1.5 bg-white border rounded-md cursor-text transition-all ${
                    disabled
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-70'
                        : isOpen
                        ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-xs'
                        : 'border-gray-300 hover:border-gray-400 shadow-xs'
                }`}
            >
                {/* Selected Tag Badges */}
                {selected.map(item => (
                    <span
                        key={item}
                        className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded bg-brand-primary text-white text-xs font-semibold shrink-0 select-none shadow-xs transition-transform hover:scale-[1.02]"
                    >
                        <span>{item}</span>
                        <button
                            type="button"
                            aria-label={`Remove ${item}`}
                            onClick={(e) => removeOption(item, e)}
                            className="p-0.5 rounded hover:bg-black/20 active:bg-black/30 transition-colors focus:outline-none"
                        >
                            <X className="w-3 h-3 text-white" />
                        </button>
                    </span>
                ))}

                {/* Inline Search Input */}
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    disabled={disabled}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selected.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[100px] bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none border-none py-1 px-0.5 focus:outline-none focus:ring-0"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    autoComplete="off"
                />

                {/* Right side controls: Clear All & Chevron */}
                <div className="flex items-center gap-1 ml-auto shrink-0 self-center">
                    {selected.length > 0 && !disabled && (
                        <button
                            type="button"
                            title="Clear all selected"
                            aria-label="Clear all selected"
                            onClick={clearAll}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        aria-label="Toggle dropdown"
                        disabled={disabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!disabled) {
                                setIsOpen(!isOpen);
                                if (!isOpen) inputRef.current?.focus();
                            }
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded transition-transform"
                    >
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-brand-primary' : ''
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Dropdown Options List */}
            {isOpen && (
                <ul
                    ref={listRef}
                    role="listbox"
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto py-1 divide-y divide-gray-50 animate-in fade-in-50 zoom-in-95 duration-100"
                >
                    {filteredOptions.length === 0 ? (
                        <li className="px-4 py-3 text-sm text-gray-500 text-center italic select-none">
                            No matching categories
                        </li>
                    ) : (
                        filteredOptions.map((option, index) => {
                            const isSelected = selected.includes(option);
                            const isHighlighted = highlightedIndex === index;

                            return (
                                <li
                                    key={option}
                                    role="option"
                                    aria-selected={isSelected}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    onClick={() => toggleOption(option)}
                                    className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between select-none transition-colors ${
                                        isHighlighted
                                            ? 'bg-brand-primary text-white font-medium'
                                            : isSelected
                                            ? 'bg-amber-50/60 text-brand-primary font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{option}</span>
                                    {isSelected && (
                                        <Check
                                            className={`w-4 h-4 shrink-0 ${
                                                isHighlighted ? 'text-white' : 'text-brand-primary'
                                            }`}
                                        />
                                    )}
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
}
