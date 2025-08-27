import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Shipment } from 'generated/prisma';
import { ShipmentStatus } from 'src/common/enum/shipment-status.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScanShipmentDto } from 'src/shipment-branch/dto/scan-shipment.dto';

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

  async scanShipment(scanShipmentDto: ScanShipmentDto, userId: string) {
    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
      include: {
        branch: true,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    const shipment = await this.prisma.shipment.findFirst({
      where: {
        trackingNumber: scanShipmentDto.tracking_number,
      },
      include: {
        shipmentDetail: true,
        shipmentHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    await this.validateScanType(
      shipment,
      scanShipmentDto.type,
      userBranch.branch.id,
    );

    const newStatus = this.determineNewStatus(
      scanShipmentDto.type,
      scanShipmentDto.is_ready_to_pickup,
    );

    return await this.prisma.$transaction(async prisma => {
      const branchLog = await prisma.shipmentBranchLog.create({
        data: {
          shipmentId: shipment.id,
          branchId: userBranch.branch.id,
          type: scanShipmentDto.type,
          description: this.getDefaultDescription(
            scanShipmentDto.type,
            userBranch.branch.name,
          ),
          status: newStatus,
          scannedByUserId: userId,
          trackingNumber: shipment.trackingNumber!,
          scanTime: new Date(),
        },
        include: {
          shipment: {
            include: {
              shipmentDetail: true,
            },
          },
          branch: true,
          scannedByUser: true,
        },
      });

      await prisma.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          deliveryStatus: newStatus,
        },
      });

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: shipment.id,
          status: newStatus,
          description: this.getDefaultDescription(
            scanShipmentDto.type,
            userBranch.branch.name,
          ),
          userId: userId,
          branchId: userBranch.branch.id,
        },
      });

      return branchLog;
    });
  }

  private async validateScanType(
    shipment: Shipment,
    scanType: 'IN' | 'OUT',
    branchId: string,
  ) {
    const validStatus = [
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.ARRIVED_AT_BRANCH,
      ShipmentStatus.AT_BRANCH,
      ShipmentStatus.DEPARTED_FROM_BRANCH,
    ];

    if (!validStatus.includes(shipment.deliveryStatus as ShipmentStatus)) {
      throw new BadRequestException(
        `Shipment status must be in ${validStatus.join(', ')} to be scanned ${scanType}`,
      );
    }

    if (scanType === 'OUT') {
      const lastInScan = await this.prisma.shipmentBranchLog.findFirst({
        where: {
          trackingNumber: shipment.trackingNumber || '',
          branchId: branchId,
          type: 'IN',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!lastInScan) {
        throw new BadRequestException(
          `Shipment ${shipment.trackingNumber} has not been scanned in at this branch`,
        );
      }
    }
  }

  private determineNewStatus(scanType: 'IN' | 'OUT', isReadyToPickup: boolean) {
    if (scanType === 'IN' && !isReadyToPickup) {
      return ShipmentStatus.ARRIVED_AT_BRANCH;
    } else if (scanType === 'OUT' && !isReadyToPickup) {
      return ShipmentStatus.DEPARTED_FROM_BRANCH;
    } else {
      return ShipmentStatus.READY_TO_PICKUP_AT_BRANCH;
    }
  }

  private getDefaultDescription(scanType: 'IN' | 'OUT', branchName: string) {
    return scanType === 'IN'
      ? `Shipment arrived at ${branchName}`
      : `Shipment departed from ${branchName}`;
  }
}
