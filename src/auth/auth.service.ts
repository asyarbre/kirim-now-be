import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (
      loginDto.password &&
      !bcrypt.compareSync(loginDto.password, user.password)
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.roleId,
    };

    const accessToken = this.jwtService.sign(payload);
    return { access_token: accessToken };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const role = await this.prisma.role.findFirst({
      where: { key: 'customer' },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phoneNumber: registerDto.phone_number,
        roleId: role.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        roleId: true,
      },
    });

    return {
      message: 'User registered successfully',
      user,
    };
  }
}
