import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { StorageService } from 'src/common/gcs/storage.service';

@Injectable()
export class EmployeeBranchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private async validateUniqueEmailUser(
    email: string,
    excludeUserId?: string,
  ): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new BadRequestException('Email already exists');
    }
  }

  private async validateBranchExists(branchId: string): Promise<void> {
    const existingBranch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!existingBranch) {
      throw new NotFoundException('Branch not found');
    }
  }

  private async validateRoleExists(roleId: string): Promise<void> {
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!existingRole) {
      throw new NotFoundException('Role not found');
    }
  }

  async create(
    createEmployeeBranchDto: CreateEmployeeBranchDto,
    avatar?: Express.Multer.File,
  ) {
    await Promise.all([
      this.validateUniqueEmailUser(createEmployeeBranchDto.email),
      this.validateBranchExists(createEmployeeBranchDto.branch_id),
      this.validateRoleExists(createEmployeeBranchDto.role_id),
    ]);

    return this.prisma.$transaction(async prisma => {
      let avatarUrl: string | undefined;
      if (avatar) {
        avatarUrl = await this.storageService.uploadFile(avatar, 'avatars');
      }

      const user = await prisma.user.create({
        data: {
          name: createEmployeeBranchDto.name,
          email: createEmployeeBranchDto.email,
          phoneNumber: createEmployeeBranchDto.phone_number,
          password: await bcrypt.hash(createEmployeeBranchDto.password, 10),
          avatar: avatarUrl,
          roleId: createEmployeeBranchDto.role_id,
        },
      });

      const employeeBranch = await prisma.employeeBranch.create({
        data: {
          userId: user.id,
          branchId: createEmployeeBranchDto.branch_id,
          type: createEmployeeBranchDto.type,
        },
        select: {
          id: true,
          userId: true,
          branchId: true,
          type: true,
          user: {
            select: {
              name: true,
              email: true,
              phoneNumber: true,
              avatar: true,
            },
          },
          branch: {
            select: {
              name: true,
              address: true,
              phoneNumber: true,
            },
          },
        },
      });

      return {
        message: 'Employee branch created successfully',
        data: employeeBranch,
      };
    });
  }

  async findAll() {
    const employeeBranches = await this.prisma.employeeBranch.findMany({
      select: {
        id: true,
        userId: true,
        branchId: true,
        type: true,
        user: {
          select: {
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        branch: {
          select: {
            name: true,
            address: true,
            phoneNumber: true,
          },
        },
      },
    });
    return {
      message: 'Employee branches fetched successfully',
      data: employeeBranches,
    };
  }

  async findOne(id: string) {
    const employeeBranch = await this.prisma.employeeBranch.findUnique({
      where: { id },
      include: {
        user: true,
        branch: true,
      },
    });
    if (!employeeBranch) {
      throw new NotFoundException('Employee branch not found');
    }
    return {
      message: 'Employee branch fetched successfully',
      data: employeeBranch,
    };
  }

  async update(
    id: string,
    updateEmployeeBranchDto: UpdateEmployeeBranchDto,
    avatar?: Express.Multer.File,
  ) {
    const existingEmployeeBranch = await this.prisma.employeeBranch.findUnique({
      where: { id },
    });
    if (!existingEmployeeBranch) {
      throw new NotFoundException('Employee branch not found');
    }

    const validationPromises: Promise<void>[] = [];
    if (updateEmployeeBranchDto.email) {
      validationPromises.push(
        this.validateUniqueEmailUser(
          updateEmployeeBranchDto.email,
          existingEmployeeBranch.userId,
        ),
      );
    }
    if (updateEmployeeBranchDto.branch_id) {
      validationPromises.push(
        this.validateBranchExists(updateEmployeeBranchDto.branch_id),
      );
    }
    if (updateEmployeeBranchDto.role_id) {
      validationPromises.push(
        this.validateRoleExists(updateEmployeeBranchDto.role_id),
      );
    }

    return this.prisma.$transaction(async prisma => {
      await Promise.all(validationPromises);

      let avatarUrl: string | undefined;
      if (avatar) {
        avatarUrl = await this.storageService.uploadFile(avatar, 'avatars');
      }

      await prisma.user.update({
        where: { id: existingEmployeeBranch.userId },
        data: {
          name: updateEmployeeBranchDto.name,
          email: updateEmployeeBranchDto.email,
          phoneNumber: updateEmployeeBranchDto.phone_number,
          avatar: avatarUrl,
          ...(updateEmployeeBranchDto.password && {
            password: await bcrypt.hash(updateEmployeeBranchDto.password, 10),
          }),
          roleId: updateEmployeeBranchDto.role_id,
        },
      });
      await prisma.employeeBranch.update({
        where: { id },
        data: {
          branchId: updateEmployeeBranchDto.branch_id,
          type: updateEmployeeBranchDto.type,
        },
      });

      return {
        message: 'Employee branch updated successfully',
      };
    });
  }

  async remove(id: string) {
    const existingEmployeeBranch = await this.prisma.employeeBranch.findUnique({
      where: { id },
    });
    if (!existingEmployeeBranch) {
      throw new NotFoundException('Employee branch not found');
    }

    return this.prisma.$transaction(async prisma => {
      // Delete the employee branch record
      await prisma.employeeBranch.delete({
        where: { id },
      });

      // Delete the associated user
      await prisma.user.delete({
        where: { id: existingEmployeeBranch.userId },
      });

      return {
        message: 'Employee branch deleted successfully',
      };
    });
  }
}
