import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { StorageService } from 'src/common/gcs/storage.service';

interface MulterFile {
  mimetype: string;
  size: number;
  buffer: Buffer;
  originalname: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
    avatar?: unknown,
  ) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Prepare update data
    const updateData: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
      avatar?: string;
      updatedAt?: Date;
    } = {};

    // Validate and prepare name update
    if (updateProfileDto.name !== undefined) {
      updateData.name = updateProfileDto.name.trim();
    }

    // Validate and prepare phone number update
    if (updateProfileDto.phoneNumber !== undefined) {
      // Normalize phone number format
      let normalizedPhone = updateProfileDto.phoneNumber.replace(/\s/g, '');
      if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '+62' + normalizedPhone.substring(1);
      } else if (normalizedPhone.startsWith('62')) {
        normalizedPhone = '+' + normalizedPhone;
      } else if (!normalizedPhone.startsWith('+62')) {
        normalizedPhone = '+62' + normalizedPhone;
      }

      const phoneExists = await this.prisma.user.findFirst({
        where: {
          phoneNumber: normalizedPhone,
          NOT: { id },
        },
      });

      if (phoneExists) {
        throw new ConflictException(
          'Phone number is already in use by another user',
        );
      }

      updateData.phoneNumber = normalizedPhone;
    }

    // Validate and prepare password update
    if (updateProfileDto.password !== undefined) {
      // Check if new password is different from current password
      const isSamePassword = await bcrypt.compare(
        updateProfileDto.password,
        existingUser.password,
      );

      if (isSamePassword) {
        throw new BadRequestException(
          'New password must be different from current password',
        );
      }

      const saltRounds = 12;
      updateData.password = await bcrypt.hash(
        updateProfileDto.password,
        saltRounds,
      );
    }

    // Handle avatar upload
    if (avatar && this.isValidMulterFile(avatar)) {
      try {
        // Validate file type
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedMimeTypes.includes(avatar.mimetype)) {
          throw new BadRequestException(
            'Invalid file type. Only JPEG, JPG, PNG, and WebP files are allowed',
          );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (avatar.size > maxSize) {
          throw new BadRequestException('File size must be less than 5MB');
        }

        // Upload new avatar
        const avatarUrl = await this.storageService.uploadFile(
          avatar as Express.Multer.File,
          'avatars',
        );
        updateData.avatar = avatarUrl;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException('Failed to upload avatar');
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No valid fields provided for update');
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    try {
      // Update user in database
      await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      return {
        message: 'Profile updated successfully',
      };
    } catch {
      throw new BadRequestException('Failed to update profile');
    }
  }

  private isValidMulterFile(file: unknown): file is MulterFile {
    return (
      typeof file === 'object' &&
      file !== null &&
      'mimetype' in file &&
      'size' in file &&
      'buffer' in file &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof (file as any).mimetype === 'string' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof (file as any).size === 'number' &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (file as any).buffer instanceof Buffer
    );
  }
}
