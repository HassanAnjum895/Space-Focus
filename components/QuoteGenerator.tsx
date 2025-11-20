import React, { useState, useEffect } from 'react';
import { getInspirationalQuote } from '../services/geminiService';

const QuoteGenerator: React.FC = () => {
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNewQuote = async () => {
    setLoading(true);
    const q = await getInspirationalQuote();
    setQuote(q);
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch
    fetchNewQuote();
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[200px]">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"></div>

      <div className="z-10 max-w-lg">
        <div className="mb-4 text-indigo-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto opacity-50" fill="currentColor" viewBox="0 0 24 24">
             <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9C9.00005 14.6568 9.40351 13.3468 10.1533 12.2226C10.903 11.0983 11.9619 10.2159 13.1814 9.69877C14.4009 9.18162 15.7195 8.66294 17.017 9.22222V5C15.3179 4.17252 13.527 3.86924 11.7683 4.26856C10.0096 4.66787 8.39201 5.74514 7.19387 7.31601C5.99573 8.88688 5.29187 10.8537 5.20323 12.8811C5.1146 14.9085 5.64667 16.872 6.709 18.436L14.017 21ZM20.017 21L20.017 18C20.017 16.8954 19.1216 16 18.017 16H15C15.0001 14.6568 15.4035 13.3468 16.1533 12.2226C16.903 11.0983 17.9619 10.2159 19.1814 9.69877C20.4009 9.18162 21.7195 8.66294 23.017 9.22222V5C21.3179 4.17252 19.527 3.86924 17.7683 4.26856C16.0096 4.66787 14.392 5.74514 13.1939 7.31601C11.9957 8.88688 11.2919 10.8537 11.2032 12.8811C11.1146 14.9085 11.6467 16.872 12.709 18.436L20.017 21Z" />
          </svg>
        </div>
        
        <div className="min-h-[80px] flex items-center justify-center">
          {loading ? (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          ) : (
            <p className="text-lg md:text-xl font-light text-white leading-relaxed tracking-wide">
              {quote}
            </p>
          )}
        </div>

        <button
          onClick={fetchNewQuote}
          disabled={loading}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-xs uppercase tracking-[0.2em] text-indigo-100 rounded-full border border-white/20 transition-all hover:scale-105 disabled:opacity-50"
        >
          New Signal
        </button>
      </div>
    </div>
  );
};

export default QuoteGenerator;