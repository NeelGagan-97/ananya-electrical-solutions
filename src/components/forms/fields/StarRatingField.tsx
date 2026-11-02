import React, { useState } from 'react';

interface StarRatingFieldProps {
  label: string;
  rating: number;
  onChange: (rating: number) => void;
  error?: string;
  required?: boolean;
}

export const StarRatingField: React.FC<StarRatingFieldProps> = ({
  label,
  rating,
  onChange,
  error,
  required,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starLabels = ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent'];

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="w-full flex flex-col gap-1.5 py-1">
      <div className="flex items-center justify-between text-[13px] font-semibold text-[#0B192C]">
        <span className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </span>
        <span className="text-[11.5px] font-medium text-slate-500">
          {displayRating > 0 ? starLabels[displayRating - 1] : 'Click to rate'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 p-2 bg-[#F8FAFC] rounded-lg border border-slate-200 w-fit">
        {[1, 2, 3, 4, 5].map((starVal) => {
          const isActive = displayRating >= starVal;
          return (
            <button
              type="button"
              key={starVal}
              onClick={() => onChange(starVal)}
              onMouseEnter={() => setHoverRating(starVal)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
              aria-label={`Rate ${starVal} stars`}
            >
              <span
                className={`material-symbols-outlined text-[26px] transition-colors ${
                  isActive ? 'text-[#F59E0B] fill-current font-variation-fill' : 'text-slate-300'
                }`}
              >
                star
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-[11.5px] font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
          <span className="material-symbols-outlined text-[14px]">error</span>
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
};
