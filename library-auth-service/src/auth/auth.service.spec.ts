import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../jwt-secret";
import { AuthService } from "./auth.service";
import { UsersRepository } from "./users.repository";

describe("AuthService.login", () => {
  const repo = { findByUsername: jest.fn(), insert: jest.fn() };
  let service: AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  async function rosa() {
    return {
      username: "rosa",
      password_hash: await bcrypt.hash("librarian123", 4),
      roles: ["LIBRARIAN"],
    };
  }

  it("rejects a wrong password", async () => {
    repo.findByUsername.mockResolvedValue(await rosa());

    await expect(
      service.login("rosa", "wrong-password"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects an unknown user the same way", async () => {
    repo.findByUsername.mockResolvedValue(undefined);

    await expect(
      service.login("nobody", "whatever-123"),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("issues a token carrying sub and roles", async () => {
    repo.findByUsername.mockResolvedValue(await rosa());

    const { accessToken, refreshToken } = await service.login(
      "rosa",
      "librarian123",
    );

    const claims = jwt.verify(
      accessToken,
      JWT_SECRET,
    ) as jwt.JwtPayload;
    expect(claims.sub).toBe("rosa");
    expect(claims.roles).toEqual(["LIBRARIAN"]);
    expect(refreshToken).not.toEqual(accessToken);
  });
});
