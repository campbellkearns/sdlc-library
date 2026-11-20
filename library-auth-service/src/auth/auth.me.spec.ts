import { UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../jwt-secret";
import { AuthService } from "./auth.service";
import { UsersRepository } from "./users.repository";

describe("AuthService.verify (Lab 1)", () => {
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

  it("refuses a request with no header (W1)", () => {
    expect(() => service.verify(undefined)).toThrow(
      UnauthorizedException,
    );
  });

  it("refuses a header that is not a bearer token (W2)", () => {
    expect(() => service.verify("Basic abc")).toThrow(
      UnauthorizedException,
    );
    expect(() => service.verify("Bearer nonsense")).toThrow(
      UnauthorizedException,
    );
  });

  it("refuses a token signed with another secret (W3)", () => {
    const forged = jwt.sign({ sub: "rosa" }, "other-secret");

    expect(() => service.verify(`Bearer ${forged}`)).toThrow(
      UnauthorizedException,
    );
  });

  it("refuses an expired token (W3)", () => {
    const expired = jwt.sign(
      { sub: "rosa", roles: ["LIBRARIAN"], exp: 1 },
      JWT_SECRET,
    );

    expect(() => service.verify(`Bearer ${expired}`)).toThrow(
      UnauthorizedException,
    );
  });

  it("names the user a good token names (W4)", async () => {
    repo.findByUsername.mockResolvedValue({
      username: "rosa",
      password_hash: await bcrypt.hash("librarian123", 4),
      roles: ["LIBRARIAN"],
    });
    const { accessToken } = await service.login(
      "rosa",
      "librarian123",
    );

    expect(service.verify(`Bearer ${accessToken}`)).toEqual({
      username: "rosa",
      roles: ["LIBRARIAN"],
    });
  });
});
