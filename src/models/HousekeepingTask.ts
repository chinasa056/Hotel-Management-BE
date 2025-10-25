import mongoose, { Document, Schema } from 'mongoose';

export interface IHousekeepingTask extends Document {
  room_id: string;
  reservation_id: string | null;
  task_type: string;
  status: string;
  assigned_staff_id: string | null;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}

const HousekeepingTaskSchema: Schema = new Schema({
  room_id: { type: String, required: true },
  reservation_id: { type: String, required: false },
  task_type: { type: String, required: true, enum: ['cleaning', 'maintenance'] },
  status: { type: String, required: true, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  assigned_staff_id: { type: String, required: false },
  due_date: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

HousekeepingTaskSchema.pre('save', function (next) {
  this.updated_at = new Date();
  next();
});

HousekeepingTaskSchema.index({ room_id: 1, status: 1, assigned_staff_id: 1, due_date: 1 });

const HousekeepingTaskModel = mongoose.model<IHousekeepingTask>('HousekeepingTask', HousekeepingTaskSchema);

export default HousekeepingTaskModel;