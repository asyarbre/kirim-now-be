import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShipmentBranchService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userRoleName: string, userId: string) {
    if (userRoleName === 'Super Admin') {
      return this.prisma.shipmentBranchLog.findMany({
        include: {
          shipment: {
            include: {
              shipmentDetail: true,
            },
          },
          branch: true,
          scannedByUser: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    return this.prisma.shipmentBranchLog.findMany({
      where: {
        branchId: userBranch.branchId,
      },
      include: {
        shipment: {
          include: {
            shipmentDetail: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
