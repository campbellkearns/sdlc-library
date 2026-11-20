import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import * as jwt from "jsonwebtoken";
import { isUniqueViolation } from "../database/pg-errors";
import { JWT_SECRET } from "../jwt-secret";
import { logAuthEvent } from "../logger";
import { UsersRepository } from "./users.repository";

const SALT_ROUNDS = 10;

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

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly users: UsersRepository) {}

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
      logAuthEvent("login_failed", username);
      throw new UnauthorizedException(
        "invalid username or password",
      );
    }
    logAuthEvent("login_success", username);

    const accessToken = jwt.sign(
      { sub: username, roles: user.roles },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "15m" },
    );
    // Opaque on purpose: not a JWT. Storing it per user would
    // make it revocable. Not built today.
    const refreshToken = randomBytes(32).toString("hex");
    return { accessToken, refreshToken };
  }
}
