import { Bot } from 'lucide-react';

export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} bg-[#4285f4] rounded-lg flex items-center justify-center`}>
      <Bot className="h-6 w-6 text-white" />
    </div>
  );
}
