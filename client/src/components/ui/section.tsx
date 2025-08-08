import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  number?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  sticky?: boolean;
  className?: string;
}

export function Section({ title, number, children, defaultOpen = false, sticky = false, className }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={cn(
      "bg-white rounded-lg border border-slate-200 mb-4",
      sticky && "sticky z-30",
      className
    )}>
      <div className="px-6 py-4 border-b border-slate-200">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-base font-semibold text-slate-900">
            {number && `${number}. `}{title}
          </h2>
          <ChevronDown 
            className={cn(
              "w-5 h-5 text-slate-500 transform transition-transform",
              isOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>
      </div>
      <div className={cn(
        "section-content",
        isOpen && "open"
      )}>
        {children}
      </div>
    </section>
  );
}
