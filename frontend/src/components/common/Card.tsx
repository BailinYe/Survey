import { twMerge } from "tailwind-merge";

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={twMerge(`w-full max-w-md rounded-lg bg-white p-6 shadow-md ${className || ""}`)}>
        {children}
    </div>
  );
}

export default Card;

// import { twMerge } from "tailwind-merge";
// import type { HTMLAttributes, ReactNode } from "react";
//
// type CardProps = HTMLAttributes<HTMLDivElement> & {
//   children: ReactNode;
// };
//
// const Card = ({ children, className, ...props }: CardProps) => {
//   return (
//       <div
//           {...props}
//           className={twMerge(
//               `w-full max-w-md rounded-lg bg-white p-6 shadow-md ${className || ""}`,
//           )}
//       >
//         {children}
//       </div>
//   );
// };
//
// export default Card;