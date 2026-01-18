
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET_KEY = process.env.AUTH_SECRET || "super-secret-key-change-this";
const key = new TextEncoder().encode(SECRET_KEY);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    });
    return payload;
}

export async function getSession() {
    const session = (await cookies()).get("admin_session")?.value;
    if (!session) return null;
    try {
        return await decrypt(session);
    } catch (error) {
        return null;
    }
}

export async function login(email: string, role: string, companyId: string | null) {
    // Create the session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ email, role, companyId, expires });

    // Save the session in a cookie
    (await cookies()).set("admin_session", session, { expires, httpOnly: true });
}

export async function logout() {
    // Destroy the session
    (await cookies()).set("admin_session", "", { expires: new Date(0) });
    redirect("/login");
}
