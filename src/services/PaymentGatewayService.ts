import axios, { AxiosInstance } from 'axios';
import ConfigService from './ConfigService';
import InternalServerError from '../error/InternalServerError';
import { logger } from '../utils/logger';

interface PaystackTransaction {
  reference: string;
  authorization_url: string;
  status: string;
}

class PaymentGatewayService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async initializeTransaction(
    amount: number,
    email: string,
    metadata: { reservationId: string }
  ): Promise<PaystackTransaction> {
    try {
      const secretKey = await ConfigService.getConfig('PAYSTACK_SECRET_KEY');
      const response = await this.axiosInstance.post(
        '/transaction/initialize',
        { amount: amount * 100, email, metadata }, // Paystack expects amount in kobo
        { headers: { Authorization: `Bearer ${secretKey}` } }
      );
      return response.data.data;
    } catch (error) {
      logger.error('Error initializing Paystack transaction:', error);
      throw new InternalServerError('Failed to initialize payment', error as Error);
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackTransaction> {
    try {
      const secretKey = await ConfigService.getConfig('PAYSTACK_SECRET_KEY');
      const response = await this.axiosInstance.get(`/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });
      return response.data.data;
    } catch (error) {
      logger.error(`Error verifying transaction ${reference}:`, error);
      throw new InternalServerError('Failed to verify payment', error as Error);
    }
  }
}

export default new PaymentGatewayService();