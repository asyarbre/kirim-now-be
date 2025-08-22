import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    const branch = await this.prisma.branch.create({
      data: createBranchDto,
    });

    return {
      message: 'Branch created successfully',
      data: branch,
    };
  }

  async findAll() {
    const branches = await this.prisma.branch.findMany();

    return {
      message: 'Branches fetched successfully',
      data: branches,
    };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return {
      message: 'Branch fetched successfully',
      data: branch,
    };
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.prisma.branch.update({ where: { id }, data: updateBranchDto });

    return {
      message: 'Branch updated successfully',
    };
  }

  async remove(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.prisma.branch.delete({ where: { id } });

    return {
      message: 'Branch deleted successfully',
    };
  }
}
