"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Remove the generic type argument <ThemeProviderProps> as it is not exported/needed in this version
// or import it if available, but simplest is to just use React.ComponentProps
export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
