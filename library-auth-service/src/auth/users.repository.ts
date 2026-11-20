import { Inject, Injectable } from "@nestjs/common";
import { Pool } from "pg";
import { PG_POOL } from "../database/database.module";

export interface User {
  username: string;
  password_hash: string;
  roles: string[];
}

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByUsername(
    username: string,
  ): Promise<User | undefined> {
    const result = await this.pool.query<User>(
      `SELECT username, password_hash, roles
         FROM users WHERE username = $1`,
      [username],
    );
    return result.rows[0];
  }

  async findAll(): Promise<Pick<User, "username" | "roles">[]> {
    const result = await this.pool.query(
      "SELECT username, roles FROM users ORDER BY id",
    );
    return result.rows;
  }

  async insert(
    username: string,
    passwordHash: string,
    roles: string[],
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO users (username, password_hash, roles)
       VALUES ($1, $2, $3)`,
      [username, passwordHash, roles],
    );
  }
}
