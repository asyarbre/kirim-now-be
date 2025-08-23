import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OpencageResponse {
  results: Array<{
    geometry: {
      lat: number;
      lng: number;
    };
  }>;
}

@Injectable()
export class OpencageService {
  private readonly apiKeyOpencage: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENCAGE_API_KEY');

    if (!apiKey) {
      throw new BadRequestException('Missing required Opencage API key');
    }

    this.apiKeyOpencage = apiKey;
  }

  async geocode(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          address,
        )}&key=${this.apiKeyOpencage}&limit=1`,
      );

      if (!response.ok) {
        throw new BadRequestException(
          `Geocoding API error: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as OpencageResponse;

      if (!data.results || data.results.length === 0) {
        throw new BadRequestException('No results found for the given address');
      }

      const result = data.results[0];
      const { lat, lng } = result.geometry;

      return { lat, lng };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(
        `Failed to geocode address: ${errorMessage}`,
      );
    }
  }
}
