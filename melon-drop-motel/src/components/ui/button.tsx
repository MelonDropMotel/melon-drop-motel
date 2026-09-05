import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-none font-display tracking-[0.14em] uppercase transition-[transform,box-shadow,background-color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-bg shadow-border hover:brightness-110",
        ghost:
          "bg-transparent text-fg shadow-border hover:shadow-border-hover hover:text-primary",
        rec: "bg-primary text-bg",
      },
      size: {
        sm: "h-11 px-4 text-lg",
        md: "h-12 px-5 text-xl",
        lg: "h-14 px-6 text-2xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: Props) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
