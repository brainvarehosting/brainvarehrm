import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@brainvare.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@brainvare.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Admin' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  lastName: string;
}

export class AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    employeeId?: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
    isSuperAdmin: boolean;
  };
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
