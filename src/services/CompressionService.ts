import { promisify } from 'util';
import { brotliCompress, brotliDecompress, constants } from 'zlib';
import { logger } from '../utils/logger';

const compress = promisify(brotliCompress);
const decompress = promisify(brotliDecompress);

class CompressionService {
  async compress(data: string | null | undefined): Promise<string | null> {
    if (!data) return null;
    try {
      const buffer = Buffer.from(data, 'utf-8');
      const compressedBuffer = await compress(buffer, {
        params: { [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY },
      });
      return compressedBuffer.toString('base64');
    } catch (error) {
      logger.error('Compression failed:', error);
      throw error;
    }
  }

  async decompress(compressedData: string | null | undefined): Promise<string | null> {
    if (!compressedData) return null;
    try {
      const buffer = Buffer.from(compressedData, 'base64');
      const decompressedBuffer = await decompress(buffer);
      return decompressedBuffer.toString('utf-8');
    } catch (error) {
      logger.warn('Decompression failed, returning as plain text:', error);
      return compressedData; // Fallback for uncompressed data
    }
  }
}

export default new CompressionService();