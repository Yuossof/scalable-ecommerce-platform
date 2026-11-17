import { resend } from "./resend.lib.js";
import { ISendEmailParams } from "./types.js";

export async function sendMail(data: ISendEmailParams) {
    return await resend.emails.send({
        from: data.from || "Nothing",
        to: data.to,
        subject: data.subject,
        html: data.html,
    });
}
