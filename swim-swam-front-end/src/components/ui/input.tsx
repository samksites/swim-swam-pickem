import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

type SwimmerInputProps = {
    name: string;
    css?: string;
}

const SwimmerInput: React.FC<SwimmerInputProps> = (props) => {
  const [name, setName] = React.useState(props.name);
  const [time, setTime] = React.useState(""); // raw digits

  // Format time as user types: mm:ss.hh
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digit characters
    let value = e.target.value.replace(/\D/g, "");

    const firstNonZero = value.search(/[^0]/);
    if (firstNonZero !== -1) {
      value = value.slice(firstNonZero);
      value = value.padStart(6, "0");
    } else {
      value = "000000";
    }

    // Limit to 6 digits (mmsshh)
    value = value.slice(0, 6);

    // Format as mm:ss.hh
    let formatted = value;
    if (value.length > 4) {
      formatted = `${value.slice(0, 2)}:${value.slice(2, 4)}.${value.slice(4, 6)}`;
    } else if (value.length > 2) {
      formatted = `${value.slice(0, 2)}.${value.slice(2, 4)}`;
    } else {
      formatted = value;
    }

    setTime(formatted);
  };

  return (
    <div className={`flex flex-col gap-2 ${props.css ?? ""}`}>
        <div className="flex flex-row justify-start items-center h-8 bg-blue-400 rounded-md ml-0.5 mr-0.5">
          <h3 className="text-center font-bold ml-0.5 mr-0.5">
            1.
          </h3>
        
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Swimmer Name"
              style={{ height: "20px", width: "200px", background: "white", borderRadius: 0, marginRight: "4px" }}
            />
            <div className="flex flex-row">
            <Input
              type="text"
              value={time}
              onChange={handleTimeChange}
              placeholder="00:00.00"
              maxLength={9}
              style={{ direction: "rtl", textAlign: "right", width: "85px", height: "20px", background: "white", borderRadius: 0 }}
            />
            </div>
      </div>
    </div>
  );
}

export { Input, SwimmerInput }
