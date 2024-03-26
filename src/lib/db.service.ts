import bcrypt from 'bcrypt';
import path from 'path';
import { Database } from 'sqlite3';

const saltRounds = 10;

export class DB {
  private db: Database;

  constructor() {
    const p = process.env.DB_PATH || path.join(__dirname, '..', '..', 'db.sqlite');
    this.db = new Database(p, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      }
    });
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        const username = process.env.DEFAULT_USERNAME || 'admin';
        const password = bcrypt.hashSync(process.env.DEFAULT_PASSWORD || 'admin', saltRounds);
        this.db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT UNIQUE, password TEXT, allowed_senders TEXT)');
        this.db.run('INSERT INTO users (name, password) VALUES (?, ?)', ['admin', password], (err) => {
          if (err) {
            console.log('User already exists');
          }
        });
        Promise.resolve();
      });
    });
  }

  async login(name: string, password: string) {
    const data = await new Promise<any>((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE name = ?', [name], (err, row) => {
        if (err) {
          console.log('Error getting user:', err)
          reject(err);
        }
        resolve(row);
      });
    });
    if (!data) {
      return null;
    }
    return bcrypt.compareSync(password, data.password) ? data : null;
  }
}