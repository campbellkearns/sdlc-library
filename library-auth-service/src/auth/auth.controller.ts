import {
  Body,
  Controller,
  HttpCode,
  Post,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { RegisterDto } from "./register.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new reader" })
  @ApiResponse({ status: 201, description: "Registered" })
  @ApiResponse({ status: 409, description: "Username taken" })
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.username, dto.password);
  }

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Log in and get tokens" })
  @ApiResponse({ status: 200, description: "Tokens issued" })
  @ApiResponse({ status: 401, description: "Bad credentials" })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.username, dto.password);
  }
}
