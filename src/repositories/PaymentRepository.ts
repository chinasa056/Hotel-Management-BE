import { Model } from 'mongoose';
import { IPayment, IPaymentAttributes } from '../interfaces/payment';
import { Payment } from '../models/PaymentModel';

class PaymentRepository {
  private model: Model<IPayment>;

  constructor() {
    this.model = Payment;
  }

  async createPayment(paymentData: IPaymentAttributes): Promise<IPayment> {
    return await this.model.create(paymentData);
  }

  async findPaymentByReference(reference: string): Promise<IPayment | null> {
    return await this.model.findOne({ reference });
  }

  async updatePayment(reference: string, updates: Partial<IPayment>): Promise<IPayment | null> {
    return await this.model.findOneAndUpdate({ reference }, updates, { new: true });
  }
}

export default PaymentRepository;