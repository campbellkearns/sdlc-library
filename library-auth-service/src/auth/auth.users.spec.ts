import {
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../jwt-secret";
import { AuthService } from "./auth.service";
import { UsersRepository } from "./users.repository";

function tokenFor(sub: string, roles: string[]) {
  return jwt.sign({ sub, roles }, JWT_SECRET, {
    expiresIn: "15m",
  });
}

describe("AuthService.listUsers (Lab 2)", () => {
  const repo = { findAll: jest.fn(), insert: jest.fn() };
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

  it("answers 401 with no token (R1)", async () => {
    await expect(
      service.listUsers(undefined),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("answers 403 for a reader (R2)", async () => {
    const sam = `Bearer ${tokenFor("sam", ["READER"])}`;

    await expect(service.listUsers(sam)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(repo.findAll).not.toHaveBeenCalled();
  });

  it("lists users and roles for a librarian (R3)", async () => {
    const rows = [
      { username: "rosa", roles: ["LIBRARIAN"] },
      { username: "sam", roles: ["READER"] },
    ];
    repo.findAll.mockResolvedValue(rows);
    const rosa = `Bearer ${tokenFor("rosa", ["LIBRARIAN"])}`;

    await expect(
      service.listUsers(rosa),
    ).resolves.toEqual(rows);
  });
});
