import { Avatar as AvatarComponent, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarProps {
  src?: string | null
  alt: string
  className?: string
}

export default function Avatar({ src, alt, className }: AvatarProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <AvatarComponent className={className}>
      <AvatarImage src={src || ""} alt={alt} />
      <AvatarFallback>{getInitials(alt)}</AvatarFallback>
    </AvatarComponent>
  )
}
