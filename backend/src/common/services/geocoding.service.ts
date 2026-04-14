import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class GeocodingService {
  async autocomplete(
    query: string,
    options: { lat?: number; lng?: number; countryCode?: string } = {},
  ) {
    const text = query?.trim();
    if (!text || text.length < 3) return [];

    const runSearch = async (
      withLocationBias: boolean,
      withCountry: boolean,
    ) => {
      const params = new URLSearchParams({
        format: 'json',
        q: text,
        limit: '6',
        addressdetails: '1',
      });

      if (withCountry && options.countryCode) {
        params.append('countrycodes', options.countryCode.toLowerCase());
      }

      if (
        withLocationBias &&
        typeof options.lat === 'number' &&
        typeof options.lng === 'number'
      ) {
        const delta = 0.25;
        const left = (options.lng - delta).toFixed(6);
        const right = (options.lng + delta).toFixed(6);
        const top = (options.lat + delta).toFixed(6);
        const bottom = (options.lat - delta).toFixed(6);
        params.append('viewbox', `${left},${top},${right},${bottom}`);
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'todocasa/1.0 contacto@todocasa.app',
          },
        },
      );

      if (!response.ok) {
        throw new BadRequestException('Error consultando geocoding');
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    };

    let data = await runSearch(true, true);
    if (!data.length) data = await runSearch(false, true);
    if (!data.length) data = await runSearch(false, false);

    return data.map((item: any) => {
      const parts = String(item.display_name ?? '')
        .split(',')
        .map((p: string) => p.trim())
        .filter(Boolean);

      return {
        direccion: parts.slice(0, 3).join(', ') || item.display_name,
        direccionCompleta: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });
  }

  async geocode(direccion: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      direccion
    )}&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'todocasa/1.0 contacto@todocasa.app',
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Error consultando geocoding');
    }

    const data = await response.json();

    if (!data.length) {
      throw new BadRequestException('Dirección no encontrada');
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  }
}
