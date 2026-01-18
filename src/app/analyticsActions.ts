"use server";

import { prisma } from "@/lib/prisma";

export async function recordInteraction(employeeId: string, interactionType: "VIEW" | "CLICK", buttonType?: string) {
    try {
        await prisma.clickLog.create({
            data: {
                employeeId,
                interactionType,
                buttonType
            }
        });
    } catch (error) {
        console.error("Failed to record interaction:", error);
    }
}
