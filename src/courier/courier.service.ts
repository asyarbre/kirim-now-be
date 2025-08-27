import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';
import { ShipmentStatus } from 'src/common/enum/shipment-status.enum';
import { StorageService } from 'src/common/gcs/storage.service';

@Injectable()
export class CourierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}
  async findAll() {
    const shipments = await this.prisma.shipment.findMany({
      where: {
        paymentStatus: PaymentStatus.PAID,
        deliveryStatus: {
          in: [
            ShipmentStatus.READY_TO_PICKUP,
            ShipmentStatus.WAITING_PICKUP,
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.READY_TO_PICKUP_AT_BRANCH,
            ShipmentStatus.READY_TO_DELIVER,
            ShipmentStatus.ON_THE_WAY_TO_ADDRESS,
            ShipmentStatus.ON_THE_WAY,
            ShipmentStatus.DELIVERED,
          ],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return shipments;
  }

  async pickShipment(trackingNumber: string, userId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        trackingNumber: trackingNumber,
      },
      include: {
        shipmentDetail: true,
        shipmentHistory: true,
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
      select: {
        branchId: true,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    return this.prisma.$transaction(async prisma => {
      const updateShipment = await prisma.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          deliveryStatus: ShipmentStatus.WAITING_PICKUP,
        },
      });

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: updateShipment.id,
          userId: userId,
          branchId: userBranch.branchId,
          status: ShipmentStatus.WAITING_PICKUP,
          description: `Shipment picked up by ${userId}`,
        },
      });

      return updateShipment;
    });
  }

  async pickupShipment(
    trackingNumber: string,
    userId: string,
    pickupProofImage?: Express.Multer.File,
  ) {
    if (!pickupProofImage) {
      throw new UnprocessableEntityException('Pickup proof image is required');
    }

    const shipment = await this.prisma.shipment.findFirst({
      where: {
        trackingNumber: trackingNumber,
      },
      include: {
        shipmentDetail: true,
        shipmentHistory: true,
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
      select: {
        branchId: true,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    return this.prisma.$transaction(async prisma => {
      const updateShipment = await prisma.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          deliveryStatus: ShipmentStatus.PICKED_UP,
        },
      });

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: updateShipment.id,
          userId: userId,
          branchId: userBranch.branchId,
          status: ShipmentStatus.PICKED_UP,
          description: `Shipment picked up by ${userId}`,
        },
      });

      const pickupProofImageUrl = await this.storageService.uploadFile(
        pickupProofImage,
        'pickup-proof-images',
      );

      if (!shipment.shipmentDetail || shipment.shipmentDetail.length === 0) {
        throw new NotFoundException('Shipment detail not found');
      }

      await prisma.shipmentDetail.update({
        where: {
          id: shipment.shipmentDetail[0].id,
        },
        data: {
          pickupProof: pickupProofImageUrl,
        },
      });

      return updateShipment;
    });
  }

  async deliverToBranch(trackingNumber: string, userId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        trackingNumber: trackingNumber,
      },
      include: {
        shipmentDetail: true,
        shipmentHistory: true,
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
      select: {
        branchId: true,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    return this.prisma.$transaction(async prisma => {
      const updateShipment = await prisma.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          deliveryStatus: ShipmentStatus.IN_TRANSIT,
        },
      });

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: updateShipment.id,
          userId: userId,
          branchId: userBranch.branchId,
          status: ShipmentStatus.IN_TRANSIT,
          description: `Shipment picked up by ${userId}`,
        },
      });

      return updateShipment;
    });
  }

  async pickShipmentFromBranch(trackingNumber: string, userId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        trackingNumber: trackingNumber,
      },
      include: {
        shipmentDetail: true,
        shipmentHistory: true,
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
      select: {
        branchId: true,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    return this.prisma.$transaction(async prisma => {
      const updateShipment = await prisma.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          deliveryStatus: ShipmentStatus.READY_TO_DELIVER,
        },
      });

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: updateShipment.id,
          userId: userId,
          branchId: userBranch.branchId,
          status: ShipmentStatus.READY_TO_DELIVER,
          description: `Shipment picked up by ${userId}`,
        },
      });

      return updateShipment;
    });
  }

  async pickupShipmentFromBranch(trackingNumber: string, userId: string) {
    const shipment = await this.prisma.shipment.findFirst({
      where: {
        trackingNumber: trackingNumber,
      },
      include: {
        shipmentDetail: true,
        shipmentHistory: true,
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
      select: {
        branchId: true,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    return this.prisma.$transaction(async prisma => {
      const updateShipment = await prisma.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          deliveryStatus: ShipmentStatus.ON_THE_WAY_TO_ADDRESS,
        },
      });

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: updateShipment.id,
          userId: userId,
          branchId: userBranch.branchId,
          status: ShipmentStatus.ON_THE_WAY_TO_ADDRESS,
          description: `Shipment picked up by ${userId}`,
        },
      });

      return updateShipment;
    });
  }

  async deliverToCustomer(
    trackingNumber: string,
    userId: string,
    receiptProofImage?: Express.Multer.File,
  ) {
    if (!receiptProofImage) {
      throw new UnprocessableEntityException('Pickup proof image is required');
    }

    const shipment = await this.prisma.shipment.findFirst({
      where: {
        trackingNumber: trackingNumber,
      },
      include: {
        shipmentDetail: true,
        shipmentHistory: true,
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const userBranch = await this.prisma.employeeBranch.findFirst({
      where: {
        userId: userId,
      },
      select: {
        branchId: true,
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User branch not found');
    }

    return this.prisma.$transaction(async prisma => {
      const updateShipment = await prisma.shipment.update({
        where: {
          id: shipment.id,
        },
        data: {
          deliveryStatus: ShipmentStatus.DELIVERED,
        },
      });

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: updateShipment.id,
          userId: userId,
          branchId: userBranch.branchId,
          status: ShipmentStatus.DELIVERED,
          description: `Shipment picked up by ${userId}`,
        },
      });

      const receiptProofImageUrl = await this.storageService.uploadFile(
        receiptProofImage,
        'receipt-proof-images',
      );

      if (!shipment.shipmentDetail || shipment.shipmentDetail.length === 0) {
        throw new NotFoundException('Shipment detail not found');
      }

      await prisma.shipmentDetail.update({
        where: {
          id: shipment.shipmentDetail[0].id,
        },
        data: {
          receiptProof: receiptProofImageUrl,
        },
      });

      return updateShipment;
    });
  }
}
