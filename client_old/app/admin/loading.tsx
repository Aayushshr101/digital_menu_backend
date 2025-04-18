import { Loader2 } from "lucide-react"

export default function AdminLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-medium">Loading...</h2>
                <p className="text-sm text-muted-foreground">Please wait while we prepare your dashboard</p>
            </div>
        </div>
    )
}

