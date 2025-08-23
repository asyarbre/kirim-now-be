import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { StorageService } from 'src/common/gcs/storage.service';

@Injectable()
export class UserAddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly opencageService: OpencageService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createUserAddressDto: CreateUserAddressDto,
    userId: string,
    photo?: Express.Multer.File,
  ) {
    const { lat, lng } = await this.opencageService.geocode(
      createUserAddressDto.address,
    );

    const photoUrl = photo
      ? await this.storageService.uploadFile(photo, 'photos')
      : undefined;

    const userAddress = await this.prisma.userAddresses.create({
      data: {
        userId,
        address: createUserAddressDto.address,
        latitude: lat,
        longitude: lng,
        photo: photoUrl,
        tag: createUserAddressDto.tag,
        label: createUserAddressDto.label,
      },
    });

    return {
      message: 'User address created successfully',
      data: userAddress,
    };
  }

  async findAll(userId: string) {
    const userAddresses = await this.prisma.userAddresses.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        userId: true,
        address: true,
        latitude: true,
        longitude: true,
        photo: true,
        tag: true,
        label: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return {
      message: 'User addresses fetched successfully',
      data: userAddresses,
    };
  }

  async findOne(id: string) {
    const userAddress = await this.prisma.userAddresses.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        address: true,
        latitude: true,
        longitude: true,
        photo: true,
        tag: true,
        label: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!userAddress) {
      throw new NotFoundException('User address not found');
    }

    return {
      message: 'User address fetched successfully',
      data: userAddress,
    };
  }

  async update(
    id: string,
    updateUserAddressDto: UpdateUserAddressDto,
    photo?: Express.Multer.File,
  ) {
    const userAddress = await this.prisma.userAddresses.findUnique({
      where: {
        id,
      },
    });

    if (!userAddress) {
      throw new NotFoundException('User address not found');
    }

    if (updateUserAddressDto.address) {
      const { lat, lng } = await this.opencageService.geocode(
        updateUserAddressDto.address,
      );
      userAddress.latitude = lat;
      userAddress.longitude = lng;
    }

    const photoUrl = photo
      ? await this.storageService.uploadFile(photo, 'photos')
      : undefined;

    const updatedUserAddress = await this.prisma.userAddresses.update({
      where: { id },
      data: {
        ...updateUserAddressDto,
        photo: photoUrl,
      },
    });

    return {
      message: 'User address updated successfully',
      data: updatedUserAddress,
    };
  }

  async remove(id: string) {
    const existingUserAddress = await this.prisma.userAddresses.findUnique({
      where: {
        id,
      },
    });

    if (!existingUserAddress) {
      throw new NotFoundException('User address not found');
    }

    await this.prisma.userAddresses.delete({
      where: { id },
    });

    return {
      message: 'User address deleted successfully',
    };
  }
}
