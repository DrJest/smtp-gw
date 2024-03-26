import axios from 'axios';

export function createGraphTransport() {
  return {
    getToken: async function () {
      const params = new URLSearchParams();
      params.append('client_id', process.env.MAIL_SERVICE_GRAPH_CLIENT_ID || '');
      params.append('client_secret', process.env.MAIL_SERVICE_GRAPH_CLIENT_SECRET || '');
      params.append('scope', 'https://graph.microsoft.com/.default');
      params.append('grant_type', 'client_credentials');
      const url = `https://login.microsoftonline.com/${process.env.MAIL_SERVICE_GRAPH_TENANT_ID}/oauth2/v2.0/token`;
      let { data } = await axios.post(url, params);
      return data.access_token;
    },
    sendMail: async function ({
      to,
      from,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
      replyTo
    }: {
      to: string | string[],
      from: string,
      cc?: string | string[],
      bcc?: string | string[],
      subject: string,
      text: string,
      html: string,
      attachments: any,
      replyTo?: string | string[]
    }) {
      const token = await this.getToken();
      const url = `https://graph.microsoft.com/v1.0/users/${process.env.MAIL_SERVICE_GRAPH_USER_FROM}/sendMail`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const data: any = {
        subject,
        body: html ? {
          contentType: 'HTML',
          content: html
        } : {
          contentType: 'Text',
          content: text
        },
        toRecipients: (Array.isArray(to) ? to : [to]).map((t: string) => ({ emailAddress: { address: t } })),
        from: { emailAddress: { address: from } }
      };
      if (cc) {
        data.ccRecipients = (Array.isArray(cc) ? cc : [cc]).map((t: string) => ({ emailAddress: { address: t } }));
      }
      if (bcc) {
        data.bccRecipients = (Array.isArray(bcc) ? bcc : [bcc]).map((t: string) => ({ emailAddress: { address: t } }));
      }
      if (replyTo) {
        data.replyTo = (Array.isArray(replyTo) ? replyTo : [replyTo]).map((t: string) => ({ emailAddress: { address: t } }));
      }
      if (attachments) {
        data.attachments = attachments.map((a: any) => ({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: a.filename,
          contentBytes: a.content.toString('base64')
        }));
      }
      let response
      try {
        response = await axios.post(url, {
          message: data,
          saveToSentItems: false
        }, { headers });
      }
      catch (e: any) {
        console.log(e.response.data.error)
        return;
      }
      return response.data;
    }
  }
}