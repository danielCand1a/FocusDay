import { Schema, model, Document, Types } from 'mongoose';

export type LogStatus = 'completed' | 'failed';

export interface ITrackingLog extends Document {
  userId: Types.ObjectId;
  taskId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  status: LogStatus;
  createdAt: Date;
}

const trackingLogSchema = new Schema<ITrackingLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    status: {
      type: String,
      enum: ['completed', 'failed'],
      required: true,
    },
  },
  { timestamps: true }
);

// One log per task per day
trackingLogSchema.index({ taskId: 1, date: 1 }, { unique: true });

export default model<ITrackingLog>('TrackingLog', trackingLogSchema);
