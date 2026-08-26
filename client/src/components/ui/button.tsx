import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8D51FB]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1E2A] disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:shrink-0" +
" hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
           // @replit: no hover, and add primary border
           "bg-primary text-primary-foreground border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        outline:
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          " border [border-color:var(--button-outline)] shadow-xs active:shadow-none ",
        secondary:
          // @replit border, no hover, no shadow, secondary border.
          "border bg-secondary text-secondary-foreground border border-secondary-border ",
        // @replit no hover, transparent border
        ghost: "border border-transparent",
        link: "text-primary underline-offset-4 hover:underline",
        gamePrimary: "rounded-2xl border border-[#9f72ff] bg-[#8D51FB] text-white shadow-[0_4px_0_#5f2fc2,0_12px_28px_rgba(141,81,251,.22)] hover:bg-[#9a63ff] active:translate-y-1 active:shadow-none",
        gameSecondary: "rounded-2xl border border-[#454F66] bg-[#1D293D] text-[#EEF2F6] shadow-[0_4px_0_#0F172B] hover:border-[#5d697d] hover:bg-[#243249] active:translate-y-1 active:shadow-none",
        gameSuccess: "rounded-2xl border border-[#21d59a] bg-[#02BB7D] text-white shadow-[0_4px_0_#067a56,0_12px_26px_rgba(2,187,125,.18)] hover:bg-[#09ca89] active:translate-y-1 active:shadow-none",
        gameDanger: "rounded-2xl border border-[#ff5a7d] bg-[#FE2559] text-white shadow-[0_4px_0_#a50f37,0_12px_26px_rgba(254,37,89,.18)] hover:bg-[#ff3b69] active:translate-y-1 active:shadow-none",
        gameInfo: "rounded-2xl border border-[#5b9cff] bg-[#2C7EFC] text-white shadow-[0_4px_0_#1753aa] hover:bg-[#438cff] active:translate-y-1 active:shadow-none",
      },
      size: {
        // @replit changed sizes
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-11 w-11",
        game: "min-h-12 rounded-2xl px-5 py-3 text-sm font-black",
        gameLg: "min-h-14 rounded-2xl px-7 py-4 text-base font-black sm:text-lg",
        gameIcon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
