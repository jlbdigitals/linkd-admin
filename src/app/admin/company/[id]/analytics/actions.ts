"use server";

import { prisma } from "@/lib/prisma";

export async function getCompanyAnalytics(companyId: string) {
    const employees = await prisma.employee.findMany({
        where: { companyId },
        include: {
            _count: {
                select: { clickLogs: true }
            },
            clickLogs: {
                orderBy: { createdAt: "desc" },
                take: 100 // Last 100 interactions
            }
        }
    });

    const totalViews = await prisma.clickLog.count({
        where: {
            employee: { companyId },
            interactionType: "VIEW"
        }
    });

    const totalClicks = await prisma.clickLog.count({
        where: {
            employee: { companyId },
            interactionType: "CLICK"
        }
    });

    // Group clicks by button type
    const clicksByType = await prisma.clickLog.groupBy({
        by: ['buttonType'],
        where: {
            employee: { companyId },
            interactionType: "CLICK"
        },
        _count: {
            _all: true
        }
    });

    return {
        employees,
        totalViews,
        totalClicks,
        clicksByType
    };
}

export async function getEmployeeAnalytics(employeeId: string) {
    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
            company: true
        }
    });

    if (!employee) return null;

    const totalViews = await prisma.clickLog.count({
        where: {
            employeeId,
            interactionType: "VIEW"
        }
    });

    const totalClicks = await prisma.clickLog.count({
        where: {
            employeeId,
            interactionType: "CLICK"
        }
    });

    const clicksByType = await prisma.clickLog.groupBy({
        by: ['buttonType'],
        where: {
            employeeId,
            interactionType: "CLICK"
        },
        _count: {
            _all: true
        }
    });

    const recentActivity = await prisma.clickLog.findMany({
        where: { employeeId },
        orderBy: { createdAt: "desc" },
        take: 50
    });

    return {
        employee,
        totalViews,
        totalClicks,
        clicksByType,
        recentActivity
    };
}
