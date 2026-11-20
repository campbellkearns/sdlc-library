import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
} from "@nestjs/common";
// NEW (not covered in class): OpenAPI decorators.
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { RegisterDto } from "./register.dto";

// NEW (not covered in class): OpenAPI docs.
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  // NEW (not covered in class): OpenAPI docs for this route.
  @ApiOperation({ summary: "Register a new reader" })
  @ApiResponse({ status: 201, description: "Registered" })
  @ApiResponse({ status: 409, description: "Username taken" })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.username, dto.password);
  }

  @Post("login")
  @HttpCode(200)
  // NEW (not covered in class): OpenAPI docs for this route.
  @ApiOperation({ summary: "Log in and get tokens" })
  @ApiResponse({ status: 200, description: "Tokens issued" })
  @ApiResponse({ status: 401, description: "Bad credentials" })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.username, dto.password);
  }

  @Get("me")
  @ApiOperation({ summary: "Who does this token name?" })
  @ApiResponse({ status: 200, description: "Who it names" })
  @ApiResponse({ status: 401, description: "No or bad token" })
  me(@Headers("authorization") authorization?: string) {
    return this.auth.verify(authorization);
  }

  @Get("users")
  @ApiOperation({ summary: "List users (librarians only)" })
  @ApiResponse({ status: 200, description: "The user list" })
  @ApiResponse({ status: 401, description: "No or bad token" })
  @ApiResponse({ status: 403, description: "Not a librarian" })
  users(@Headers("authorization") authorization?: string) {
    return this.auth.listUsers(authorization);
  }
}
