import {
  ConflictException,
  ForbiddenException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import * as jwt from "jsonwebtoken";
import { isUniqueViolation } from "../database/pg-errors";
import { JWT_SECRET } from "../jwt-secret";
// NEW (not covered in class): logging.
import { logAuthEvent } from "../logger";
import { UsersRepository } from "./users.repository";

const SALT_ROUNDS = 10;

// NEW (not covered in class): seeding rosa and sam
// (SEED_USERS, OnModuleInit and onModuleInit below).
// The same two users as library-auth-stub, so the Library works
// on day one. Passwords are hashed with bcrypt at start-up.
const SEED_USERS = [
  {
    username: "rosa",
    password: "librarian123",
    roles: ["LIBRARIAN"],
  },
  {
    username: "sam",
    password: "reader123",
    roles: ["READER"],
  },
];

export interface Identity {
  username: string;
  roles: string[];
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly users: UsersRepository) {}

  // NEW (not covered in class): runs once at start-up.
  async onModuleInit() {
    for (const seed of SEED_USERS) {
      if (await this.users.findByUsername(seed.username)) {
        continue;
      }
      const hash = await bcrypt.hash(
        seed.password,
        SALT_ROUNDS,
      );
      await this.users.insert(seed.username, hash, seed.roles);
    }
  }

  async register(username: string, password: string) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      await this.users.insert(username, hash, ["READER"]);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException(
          `${username} is already registered`,
        );
      }
      throw err;
    }
    return { username, registered: true };
  }

  async login(username: string, password: string) {
    const user = await this.users.findByUsername(username);
    const matches = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;
    if (!user || !matches) {
      // NEW (not covered in class): log, never the password.
      logAuthEvent("login_failed", username);
      throw new UnauthorizedException(
        "invalid username or password",
      );
    }
    // NEW (not covered in class): log, never the password.
    logAuthEvent("login_success", username);

    const accessToken = jwt.sign(
      { sub: username, roles: user.roles },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "15m" },
    );
    // NEW (not covered in class): why it is not a JWT.
    // Opaque on purpose: not a JWT. Storing it per user would
    // make it revocable. Not built today.
    const refreshToken = randomBytes(32).toString("hex");
    return { accessToken, refreshToken };
  }

  // Lab 1: who does this token name? 401 unless it is good.
  verify(authorization?: string): Identity {
    const prefix = "Bearer ";
    if (!authorization || !authorization.startsWith(prefix)) {
      throw new UnauthorizedException("missing bearer token");
    }
    try {
      const claims = jwt.verify(
        authorization.slice(prefix.length),
        JWT_SECRET,
        { algorithms: ["HS256"] },
      ) as jwt.JwtPayload;
      return {
        username: String(claims.sub),
        roles: claims.roles ?? [],
      };
    } catch {
      throw new UnauthorizedException(
        "invalid or expired token",
      );
    }
  }

  // Lab 2: librarians only. 401 no token, 403 for a reader.
  async listUsers(authorization?: string) {
    const caller = this.verify(authorization);
    if (!caller.roles.includes("LIBRARIAN")) {
      throw new ForbiddenException("librarians only");
    }
    return this.users.findAll();
  }
}
