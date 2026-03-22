import { ArrowBigUp } from "lucide-react";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
        <span className="text-3xl font-bold border-8 border-b-olive-400">SurvUp</span>
        <ArrowBigUp className="text-blue-500 inline-block w-12 h-12" />
    </div>
  );
};

export default Logo;
