import { Button } from "../ui/button";

export const Dropdown = ({className, onClick, children}) => {
  return <Button variant="ghost" className={className} onClick={onClick}>
    {children}
  </Button>;
};
