import { IsNotEmpty, IsString } from "class-validator";
// NEW (not covered in class): OpenAPI, each @ApiProperty.
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "rosa" })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: "librarian123" })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
