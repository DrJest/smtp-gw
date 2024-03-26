import { simpleParser } from "mailparser";
import { SMTPServerDataStream, SMTPServerSession } from "smtp-server";
import { DB } from "./db.service";
import { createGraphTransport } from "./graphTransport.service";

const transporter = createGraphTransport();
const db = new DB();

export async function onConnect(session: SMTPServerSession, callback: (err?: Error | null | undefined) => void) {
  callback();
}

export async function onAuth(auth: any, session: SMTPServerSession, callback: (err: Error | null | undefined, response?: any) => void) {
  try {
    const user = await db.login(auth.username, auth.password);
    if (user) {
      const allowed_senders = user.allowed_senders?.split(",");
      if (!allowed_senders?.length || allowed_senders.includes(auth.username)) {
        return callback(null, { user });
      }
      return callback(new Error("User not allowed to send email"));
    }
    return callback(new Error("Invalid username or password"));
  } catch (err: any) {
    return callback(err);
  }
}

export async function onData(stream: SMTPServerDataStream, session: SMTPServerSession, callback: (err?: Error | null | undefined) => void) {
  let mail = "";
  stream.on("data", (chunk) => {
    mail += chunk.toString("utf8");
  });
  stream.on("end", async () => {
    const rctpTo = session.envelope.rcptTo.map((a) => a.address);
    const data = await simpleParser(mail);
    const to = (data.to as any)?.value.map((a: any) => a.address) || [];
    const cc = (data.cc as any)?.value.map((a: any) => a.address) || [];
    const bcc = (data.bcc as any)?.value.map((a: any) => a.address) || [];
    for (const address of rctpTo) {
      if (!to.includes(address) && !cc.includes(address) && !bcc.includes(address)) {
        bcc.push(address);
      }
    }
    const mailOptions = {
      from: data.from?.text || "",
      to,
      cc,
      bcc,
      subject: data.subject || "",
      text: data.text || "",
      html: data.html || "",
      attachments: data.attachments || [],
      replyTo: data.replyTo?.text || "",
    };
    await transporter.sendMail(mailOptions);
    callback();
  });
}