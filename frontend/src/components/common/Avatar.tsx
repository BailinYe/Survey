import { Avatar as AvatarCN, AvatarFallback, AvatarImage } from "../ui/avatar";

const Avatar = ({className}) => {
  return (
    <AvatarCN className={className}>
      <AvatarImage src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </AvatarCN>
  );
};

export default Avatar;
