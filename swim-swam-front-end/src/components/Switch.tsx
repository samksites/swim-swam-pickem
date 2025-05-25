
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"



const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-700 data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName


type SwitchWithLabelProps = {
    label: string;
}

/**
 * SwitchWithLabel component to display a switch with a label.
 * @param {SwitchWithLabelProps} props - The properties for the SwitchWithLabel component.
 * @returns {JSX.Element} The rendered SwitchWithLabel component.
 */
const SwitchWithLabel: React.FC<SwitchWithLabelProps> = (props) => {
    return (
        <div className="flex items-center flex-col w-60 mb-12">
            <label htmlFor="switch" className="mb-4 text-s text-white">
                {props.label}
            </label>
            <Switch id="switch" />
        </div>
    )
}

export default  SwitchWithLabel 
