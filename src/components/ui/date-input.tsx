import * as React from "react"
import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
    ({ className, error, ...props }, ref) => {
        const inputRef = React.useRef<HTMLInputElement>(null);

        const handleIconClick = () => {
            if (inputRef.current) {
                inputRef.current.showPicker();
            }
        };

        return (
            <div className="relative">
                <input
                    type="date"
                    ref={(node) => {
                        if (typeof ref === 'function') {
                            ref(node);
                        } else if (ref) {
                            ref.current = node;
                        }
                        inputRef.current = node;
                    }}
                    className={cn(
                        "w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-black pr-10",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        error && "border-red-500",
                        className
                    )}
                    {...props}
                />
                <button
                    type="button"
                    onClick={handleIconClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <Calendar className="h-5 w-5 text-gray-500" />
                </button>
            </div>
        )
    }
)

DateInput.displayName = "DateInput"

export { DateInput } 