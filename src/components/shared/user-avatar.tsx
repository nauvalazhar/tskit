import { Avatar, AvatarFallback, AvatarImage } from '@/components/selia/avatar';

export function UserAvatar({
  name,
  image,
  ...props
}: { name: string; image?: string } & React.ComponentProps<typeof Avatar>) {
  return (
    <Avatar size="sm" className="shrink-0" {...props}>
      {image && <AvatarImage src={image} alt="Avatar" />}
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
