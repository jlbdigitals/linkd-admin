
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
    // Check if accessing admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
        const cookieStore = await cookies();
        const session = cookieStore.get("admin_session")?.value;

        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            const payload = await decrypt(session);
            if (!payload?.email || !payload?.role) {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            const role = payload.role;
            const companyId = payload.companyId;

            // Rule: Super Admin can access everything
            if (role === "SUPER_ADMIN") {
                return NextResponse.next();
            }

            // Rule: Company Admin can only access their company's routes
            if (role === "COMPANY_ADMIN") {
                // Check if trying to access root /admin (Company list) -> Deny
                if (request.nextUrl.pathname === "/admin") {
                    // Redirect to their own dashboard
                    if (companyId) {
                        return NextResponse.redirect(new URL(`/admin/company/${companyId}`, request.url));
                    } else {
                        return NextResponse.redirect(new URL("/login", request.url));
                    }
                }

                // Check if accessing another company's dashboard
                // Path pattern: /admin/company/[id]
                const match = request.nextUrl.pathname.match(/\/admin\/company\/([^\/]+)/);
                if (match) {
                    const requestedCompanyId = match[1];
                    if (requestedCompanyId !== companyId) {
                        // Deny/Redirect to own dashboard
                        if (companyId) {
                            return NextResponse.redirect(new URL(`/admin/company/${companyId}`, request.url));
                        } else {
                            return NextResponse.redirect(new URL("/login", request.url));
                        }
                    }
                }
            }

            return NextResponse.next();
        } catch (e) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
