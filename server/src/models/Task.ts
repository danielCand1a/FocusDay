import { Schema, model, Document, Types } from 'mongoose';

export type DayKey = 'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D';
export type TaskType = 'positive' | 'avoidance';
export type TaskStatus = 'active' | 'paused';

export interface ITask extends Document {
  userId: Types.ObjectId;
  name: string;
  type: TaskType;
  days: DayKey[];
  time?: string;
  alarm: boolean;
  status: TaskStatus;
  createdAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    type: {
      type: String,
      enum: ['positive', 'avoidance'],
      required: true,
      default: 'positive',
    },
    days: {
      type: [String],
      enum: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'A task must have at least one day',
      },
    },
    time: {
      type: String,
      match: /^\d{2}:\d{2}$/,
    },
    alarm: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default model<ITask>('Task', taskSchema);
