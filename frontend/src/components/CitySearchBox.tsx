'use client';

import { useEffect, useReducer, useRef } from 'react';
import { Search, XCircle, MapPin } from 'lucide-react';
import { City } from '@/lib/types';
import { Button } from '@/components/ui/Button';

interface CitySearchBoxProps {
  onCitySelect: (city: City) => void;
  selectedCity: City | null;
  onClear: () => void;
}

type Mode = 'idle' | 'typing' | 'selected' | 'suggestions_loading' | 'suggestions_ready';

type Action =
  | { type: 'INPUT_CHANGED'; text: string; source: 'user' | 'programmatic' }
  | { type: 'SUGGESTIONS_REQUEST'; requestId: number }
  | { type: 'SUGGESTIONS_SUCCESS'; requestId: number; suggestions: City[] }
  | { type: 'SUGGESTIONS_ERROR'; requestId: number; message: string }
  | { type: 'SUGGESTIONS_ABORT' }
  | { type: 'DROPDOWN_OPEN' }
  | { type: 'DROPDOWN_CLOSE' }
  | { type: 'HIGHLIGHT_NEXT' }
  | { type: 'HIGHLIGHT_PREV' }
  | { type: 'CITY_SELECTED'; city: City }
  | { type: 'CLEAR_SELECTED' }
  | { type: 'RESET_ERROR' };

interface State {
  inputText: string;
  selectedCity: City | null;
  mode: Mode;
  dropdownOpen: boolean;
  highlightedIndex: number;
  suggestions: City[];
  error: { scope: 'suggestions'; message: string } | null;
  requestId: number;
}

const initialState: State = {
  inputText: '',
  selectedCity: null,
  mode: 'idle',
  dropdownOpen: false,
  highlightedIndex: -1,
  suggestions: [],
  error: null,
  requestId: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INPUT_CHANGED': {
      const inputText = action.text;
      if (action.source === 'user') {
        return {
          ...state,
          inputText,
          selectedCity: null,
          mode: inputText.length >= 2 ? 'typing' : 'idle',
          dropdownOpen: inputText.length >= 2,
          suggestions: inputText.length < 2 ? [] : state.suggestions,
          error: null,
        };
      }
      return { ...state, inputText };
    }
    case 'SUGGESTIONS_REQUEST':
      return {
        ...state,
        requestId: action.requestId,
        mode: 'suggestions_loading',
        error: null,
      };
    case 'SUGGESTIONS_SUCCESS':
      if (action.requestId !== state.requestId) return state;
      if (state.selectedCity) return state;
      if (state.mode !== 'suggestions_loading') return state;
      return {
        ...state,
        suggestions: action.suggestions,
        mode: 'suggestions_ready',
        dropdownOpen: true,
        highlightedIndex: action.suggestions.length ? 0 : -1,
      };
    case 'SUGGESTIONS_ERROR':
      if (action.requestId !== state.requestId) return state;
      return {
        ...state,
        error: { scope: 'suggestions', message: action.message },
        mode: 'typing',
      };
    case 'SUGGESTIONS_ABORT':
      return {
        ...state,
        mode: state.inputText.length >= 2 ? 'typing' : 'idle',
      };
    case 'DROPDOWN_OPEN':
      return { ...state, dropdownOpen: true };
    case 'DROPDOWN_CLOSE':
      return { ...state, dropdownOpen: false };
    case 'HIGHLIGHT_NEXT':
      return {
        ...state,
        highlightedIndex:
          state.suggestions.length === 0
            ? -1
            : (state.highlightedIndex + 1) % state.suggestions.length,
      };
    case 'HIGHLIGHT_PREV':
      return {
        ...state,
        highlightedIndex:
          state.suggestions.length === 0
            ? -1
            : (state.highlightedIndex - 1 + state.suggestions.length) % state.suggestions.length,
      };
    case 'CITY_SELECTED':
      return {
        ...state,
        selectedCity: action.city,
        inputText: action.city.label || action.city.name,
        mode: 'selected',
        dropdownOpen: false,
        suggestions: [],
        error: null,
        highlightedIndex: -1,
        requestId: state.requestId + 1,
      };
    case 'CLEAR_SELECTED':
      return {
        ...state,
        selectedCity: null,
        inputText: '',
        mode: 'idle',
        dropdownOpen: false,
        suggestions: [],
        highlightedIndex: -1,
        error: null,
      };
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function CitySearchBox({ onCitySelect, selectedCity, onClear }: CitySearchBoxProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Sync external selectedCity to local state
  useEffect(() => {
    if (selectedCity) {
      if (controllerRef.current) controllerRef.current.abort();
      dispatch({ type: 'CITY_SELECTED', city: selectedCity });
    }
  }, [selectedCity]);

  // Fetch suggestions only in allowed states
  useEffect(() => {
    if (state.selectedCity !== null) return;
    if (state.inputText.length < 2) return;
    if (state.mode !== 'typing') return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    const requestId = state.requestId + 1;
    debounceRef.current = window.setTimeout(async () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const controller = new AbortController();
      controllerRef.current = controller;

      dispatch({ type: 'SUGGESTIONS_REQUEST', requestId });
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(state.inputText)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list: City[] = Array.isArray(json) ? json : json.cities ?? [];
        dispatch({ type: 'SUGGESTIONS_SUCCESS', requestId, suggestions: list });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          dispatch({ type: 'SUGGESTIONS_ERROR', requestId, message: 'Falha ao buscar sugestões' });
        }
      } finally {
        controllerRef.current = null;
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [state.inputText, state.selectedCity, state.mode, state.requestId]);

  // Close on outside click
  useEffect(() => {
    const onDocDown = (e: MouseEvent | PointerEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        dispatch({ type: 'DROPDOWN_CLOSE' });
      }
    };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('touchstart', onDocDown);
    document.addEventListener('pointerdown', onDocDown);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('touchstart', onDocDown);
      document.removeEventListener('pointerdown', onDocDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={state.inputText}
          onChange={(e) => dispatch({ type: 'INPUT_CHANGED', text: e.target.value, source: 'user' })}
          onKeyDown={(e) => {
            if (e.key === 'Escape') dispatch({ type: 'DROPDOWN_CLOSE' });
            if (e.key === 'ArrowDown') dispatch({ type: 'HIGHLIGHT_NEXT' });
            if (e.key === 'ArrowUp') dispatch({ type: 'HIGHLIGHT_PREV' });
          }}
          placeholder="Buscar cidade..."
          className="w-full pl-10 pr-12 py-3 rounded-lg bg-background text-foreground placeholder:text-muted-foreground border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          autoComplete="off"
        />
        {state.inputText && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              aria-label="Limpar"
              className="p-2 rounded-md"
              onClick={() => {
                dispatch({ type: 'CLEAR_SELECTED' });
                onClear();
              }}
            >
              <XCircle className="w-6 h-6 text-foreground" />
            </Button>
          </div>
        )}
      </div>

      {state.dropdownOpen && state.suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg z-100 max-h-60 overflow-y-auto">
          {state.suggestions.map((city, idx) => (
            <button
              key={`${city.latitude}-${city.longitude}`}
              onPointerDown={(e) => {
                e.preventDefault();
                if (controllerRef.current) controllerRef.current.abort();
                dispatch({ type: 'CITY_SELECTED', city });
                onCitySelect(city);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 border-b border-border/60 last:border-b-0 ${
                idx === state.highlightedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
              }`}
            >
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{city.name}</div>
                <div className="text-sm text-muted-foreground truncate">{city.label}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {state.mode === 'suggestions_loading' && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border border-input rounded-lg shadow-lg z-100 p-4">
          <div className="text-center text-muted-foreground">Buscando cidades...</div>
        </div>
      )}
    </div>
  );
}
