import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(roleName: string, userId: string) {
    if (roleName === 'Super Admin') {
      return this.prisma.shipment.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
        },
        include: {
          shipmentDetail: {
            include: {
              user: true,
              pickupAddress: true,
            },
          },
          shipmentHistory: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return this.prisma.shipment.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        shipmentHistory: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        shipmentDetail: {
          include: {
            user: true,
            pickupAddress: true,
          },
        },
        shipmentHistory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: {
        id: id,
      },
      include: {
        shipmentDetail: {
          include: {
            user: true,
            pickupAddress: true,
          },
        },
        shipmentHistory: true,
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }
}
