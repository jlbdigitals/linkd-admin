import { AdminHeader } from "@/components/AdminHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Panel | Linkd",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <AdminHeader />
            <main className="flex-1 space-y-4 p-8 pt-6">
                {children}
            </main>
        </div>
    );
}
