import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { XenditService } from 'src/common/xendit/xendit.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueService } from 'src/queue/queue.service';
import { CreateShipmentDto } from 'src/shipments/dto/create-shipment.dto';
import { UpdateShipmentDto } from 'src/shipments/dto/update-shipment.dto';
import * as turf from '@turf/turf';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';
import { ConfigService } from '@nestjs/config';
import { XenditWebhookDto } from 'src/shipments/dto/xendit-webhook.dto';
import { QrcodeService } from 'src/common/qrcode/qrcode.service';
import { ShipmentStatus } from 'src/common/enum/shipment-status.enum';
import { PdfService, ShipmentPdfData } from 'src/common/pdf/pdf.service';

type DeliveryType = 'same_day' | 'next_day' | 'reguler';

interface CreateShipmentResponse {
  shipment: any;
  payment: any;
  invoice: any;
}

@Injectable()
export class ShipmentsService {
  private readonly frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
    private openCageService: OpencageService,
    private xenditService: XenditService,
    private configService: ConfigService,
    private qrcodeService: QrcodeService,
    private pdfService: PdfService,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new BadRequestException(
        'FRONTEND_URL is not defined in configuration',
      );
    }
    this.frontendUrl = frontendUrl;
  }

  async create(
    createShipmentDto: CreateShipmentDto,
  ): Promise<CreateShipmentResponse> {
    const { lat, lng } = await this.openCageService.geocode(
      createShipmentDto.destination_address,
    );

    const userAddress = await this.prisma.userAddresses.findFirst({
      where: {
        id: createShipmentDto.pickup_address_id,
      },
      include: {
        user: true,
      },
    });

    if (!userAddress || !userAddress.longitude || !userAddress.latitude) {
      throw new NotFoundException('Pickup address not found');
    }

    const fromAddress = turf.point([lng, lat]);
    const toAddress = turf.point([userAddress.longitude, userAddress.latitude]);
    const options = { units: 'kilometers' as turf.Units };
    const distance = turf.distance(fromAddress, toAddress, options);

    const shipmentCost = this.calculateShipmentCost(
      createShipmentDto.weight,
      distance,
      createShipmentDto.delivery_type as DeliveryType,
    );

    const shipment = await this.prisma.$transaction(async prisma => {
      const newShipment = await prisma.shipment.create({
        data: {
          paymentStatus: PaymentStatus.PENDING,
          distance: distance,
          price: shipmentCost.totalPrice,
        },
      });

      await prisma.shipmentDetail.create({
        data: {
          userId: userAddress.userId,
          shipmentId: newShipment.id,
          pickupAddressId: createShipmentDto.pickup_address_id,
          destinationAddress: createShipmentDto.destination_address,
          recipientName: createShipmentDto.recipient_name,
          recipientPhone: createShipmentDto.recipient_phone,
          weight: createShipmentDto.weight,
          packageType: createShipmentDto.package_type,
          deliveryType: createShipmentDto.delivery_type as DeliveryType,
          destinationLatitude: lat,
          destinationLongitude: lng,
          basePrice: shipmentCost.basePrice,
          weightPrice: shipmentCost.weightPrice,
          distancePrice: shipmentCost.distancePrice,
        },
      });

      return newShipment;
    });

    const invoice = await this.xenditService.createInvoice({
      externalId: `INV-${Date.now()}-${shipment.id}`,
      amount: shipmentCost.totalPrice,
      payerEmail: userAddress.user.email,
      description: `Shipment #${shipment.id} from ${userAddress.address} to ${createShipmentDto.destination_address}`,
      successRedirectUrl: `${this.frontendUrl}/shipments/${shipment.id}`,
      invoiceDuration: 86400,
    });

    const payment = await this.prisma.$transaction(async prisma => {
      const createPayment = await prisma.payment.create({
        data: {
          shipmentId: shipment.id,
          externalId: invoice.externalId,
          invoiceId: invoice.id,
          status: invoice.status,
          invoiceUrl: invoice.invoiceUrl,
          expirationDate: invoice.expiryDate,
        },
      });

      // Get first available branch or create a default one
      const defaultBranch = await prisma.branch.findFirst();
      if (!defaultBranch) {
        throw new InternalServerErrorException(
          'No branch available for shipment processing',
        );
      }

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: shipment.id,
          branchId: defaultBranch.id,
          userId: userAddress.userId,
          status: PaymentStatus.PENDING,
          description: `Shipment #${shipment.id} created with total price ${shipmentCost.totalPrice}`,
        },
      });

      return createPayment;
    });

    try {
      await this.queueService.addEmailJob({
        type: 'payment-notification',
        to: userAddress.user.email,
        shipmentId: shipment.id,
        amount: shipmentCost.totalPrice,
        paymentUrl: invoice.invoiceUrl,
        expiryDate: invoice.expiryDate,
      });
    } catch {
      throw new InternalServerErrorException(
        'Failed to send payment notification',
      );
    }

    try {
      await this.queueService.addPaymentExpiredJob(
        {
          paymentId: payment.id,
          shipmentId: shipment.id,
          externalId: invoice.externalId,
        },
        invoice.expiryDate,
      );
    } catch {
      throw new InternalServerErrorException(
        'Failed to add payment expired job',
      );
    }

    return {
      shipment,
      payment,
      invoice,
    };
  }

  async findAll(userId: string) {
    const shipments = await this.prisma.shipment.findMany({
      where: {
        shipmentDetail: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        shipmentDetail: true,
        payment: true,
        shipmentHistory: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Shipments fetched successfully',
      data: shipments,
    };
  }

  async findOne(id: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: {
        id: id,
      },
      include: {
        shipmentDetail: true,
        payment: true,
        shipmentHistory: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return {
      message: 'Shipment fetched successfully',
      data: shipment,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateShipmentDto: UpdateShipmentDto) {
    return `This action updates a #${id} shipment`;
  }

  remove(id: number) {
    return `This action removes a #${id} shipment`;
  }

  private calculateShipmentCost(
    weight: number,
    distance: number,
    deliveryType: DeliveryType,
  ): {
    totalPrice: number;
    basePrice: number;
    weightPrice: number;
    distancePrice: number;
  } {
    const baseRates: Record<DeliveryType, number> = {
      same_day: 15000,
      next_day: 10000,
      reguler: 5000,
    };

    const weightRates: Record<DeliveryType, number> = {
      same_day: 1000,
      next_day: 500,
      reguler: 250,
    };

    const distanceRates: Record<
      DeliveryType,
      { tier1: number; tier2: number; tier3: number }
    > = {
      same_day: {
        tier1: 6000,
        tier2: 10000,
        tier3: 15000,
      },
      next_day: {
        tier1: 4000,
        tier2: 6000,
        tier3: 10000,
      },
      reguler: {
        tier1: 2000,
        tier2: 4000,
        tier3: 6000,
      },
    };

    const basePrice = baseRates[deliveryType] || baseRates.reguler;
    const weightRate = weightRates[deliveryType] || weightRates.reguler;
    const distanceRate = distanceRates[deliveryType] || distanceRates.reguler;

    const weightKg = Math.ceil(weight / 1000); // Convert weight to kg
    const weightPrice = weightKg * weightRate;

    let distancePrice = 0;
    if (distance <= 50) {
      distancePrice = distanceRate.tier1;
    } else if (distance <= 100) {
      distancePrice = distanceRate.tier2;
    } else {
      const extraDistance = Math.ceil((distance - 100) / 100); // Calculate extra distance in km
      distancePrice = distanceRate.tier3 + extraDistance * distanceRate.tier3;
    }

    const totalPrice = basePrice + weightPrice + distancePrice;

    const minimumPrice = 10000;

    const finalPrice = Math.max(totalPrice, minimumPrice);

    return { totalPrice: finalPrice, basePrice, weightPrice, distancePrice };
  }

  async handlePaymentWebhook(
    xenditWebhookDto: XenditWebhookDto,
  ): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        externalId: xenditWebhookDto.external_id,
      },
      include: {
        shipment: {
          include: {
            shipmentDetail: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    await this.prisma.$transaction(async prisma => {
      await prisma.payment.update({
        where: {
          id: payment.id,
        },
        data: {
          status: xenditWebhookDto.status,
          paymentMethod: xenditWebhookDto.payment_method,
        },
      });

      if (
        xenditWebhookDto.status === 'PAID' ||
        xenditWebhookDto.status === 'SETTLED'
      ) {
        const trackingNumber = `KN${xenditWebhookDto.id}`;
        const qrCode = await this.qrcodeService.generateQrCode(trackingNumber);

        await prisma.shipment.update({
          where: {
            id: payment.shipmentId,
          },
          data: {
            trackingNumber: trackingNumber,
            deliveryStatus: ShipmentStatus.READY_TO_PICKUP,
            paymentStatus: xenditWebhookDto.status,
            qrCodeImage: qrCode,
          },
        });

        await prisma.shipmentHistory.create({
          data: {
            shipmentId: payment.shipmentId,
            status: ShipmentStatus.READY_TO_PICKUP,
            description: `Payment ${xenditWebhookDto.status} for shipment with tracking number ${trackingNumber}`,
            userId: payment.shipment.shipmentDetail[0].user.id,
          },
        });

        try {
          await this.queueService.cancelPaymentExpiredJob(payment.id);
        } catch {
          throw new InternalServerErrorException(
            'Failed to cancel payment expired job',
          );
        }

        try {
          const userEmail = payment.shipment.shipmentDetail[0].user.email;
          if (userEmail) {
            await this.queueService.addEmailJob({
              type: 'payment-success',
              to: userEmail,
              shipmentId: payment.shipmentId,
              amount: payment.shipment.price || xenditWebhookDto.amount,
              trackingNumber: payment.shipment.trackingNumber || undefined,
            });
          }
        } catch {
          throw new InternalServerErrorException(
            'Failed to send payment success email',
          );
        }
      }
    });
  }

  async generateShipmentPdf(shipmentId: string): Promise<Buffer> {
    const shipment = await this.prisma.shipment.findUnique({
      where: {
        id: shipmentId,
      },
      include: {
        shipmentDetail: {
          include: {
            user: true,
            pickupAddress: true,
          },
        },
        payment: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipmentId} not found`);
    }

    const shipmentDetail = shipment.shipmentDetail[0];
    if (!shipmentDetail) {
      throw new NotFoundException(
        `Shipment detail with ID ${shipmentId} not found`,
      );
    }

    const pdfData: ShipmentPdfData = {
      trackingNumber: shipment.trackingNumber || '',
      shipmentId: shipment.id,
      createdAt: shipment.createdAt,
      deliveryType: shipmentDetail.deliveryType,
      packageType: shipmentDetail.packageType,
      weight: shipmentDetail.weight || 0,
      price: shipment.price || 0,
      paymentStatus: shipment.paymentStatus,
      distance: shipment.distance || 0,
      basePrice: shipmentDetail.basePrice || 0,
      weightPrice: shipmentDetail.weightPrice || 0,
      distancePrice: shipmentDetail.distancePrice || 0,
      deliveryStatus: shipment.deliveryStatus || '',
      senderName: shipmentDetail.user.name,
      senderEmail: shipmentDetail.user.email,
      senderPhone: shipmentDetail.user.phoneNumber,
      pickupAddress: shipmentDetail.pickupAddress.address,
      recipientName: shipmentDetail.recipientName || '',
      recipientPhone: shipmentDetail.recipientPhone || '',
      destinationAddress: shipmentDetail.destinationAddress,
      qrCodePath: shipment.qrCodeImage || '',
    };

    return this.pdfService.generateShipmentPdf(pdfData);
  }
}
