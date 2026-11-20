import { IsNotEmpty, IsString } from "class-validator";
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
