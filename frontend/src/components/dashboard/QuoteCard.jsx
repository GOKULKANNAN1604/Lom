import React, { useEffect, useState } from 'react';
import quotes from '../../data/quotes.json';

const QuoteCard = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    // Deterministic quote per day based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    const idx = day % quotes.length;
    setQuote(quotes[idx]);
  }, []);

  return (
    <div className="mt-4 p-4 bg-white/[0.04] border border-white/[0.06] rounded-2xl shadow-lg backdrop-blur-md text-center">
      <p className="italic text-primary">“{quote.text}”</p>
      <p className="mt-2 text-sm text-muted">— {quote.author}</p>
    </div>
  );
};

export default QuoteCard;
