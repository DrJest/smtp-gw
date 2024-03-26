import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { SMTPServer } from "smtp-server";
import { onAuth, onConnect, onData } from "./lib/mail.service";

dotenv.config({ path: path.join(__dirname, '.env') });

const authOptional = false;
const authMethods = ['PLAIN', 'LOGIN', 'XOAUTH2'];

const server25 = new SMTPServer({
  onConnect,
  onAuth,
  disabledCommands: ['STARTTLS'],
  authMethods,
  secure: false,
  authOptional,
  name: process.env.HOSTNAME,
  onData
});

server25.listen(25, () => {
  console.log("SMTP server started on port 25");
});

const server465 = new SMTPServer({
  onConnect,
  secure: true,
  authOptional,
  authMethods,
  onAuth,
  key: readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
  name: process.env.HOSTNAME,
  onData
});

server465.listen(465, () => {
  console.log("SMTP server started on port 465");
});

const server587 = new SMTPServer({
  onConnect,
  secure: false,
  authOptional,
  authMethods,
  onAuth,
  key: readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
  name: process.env.HOSTNAME,
  onData
});

server587.listen(587, () => {
  console.log("SMTP server started on port 587");
});
