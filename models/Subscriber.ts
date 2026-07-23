import { Schema, models, model, type Document } from "mongoose";

export interface ISubscriber extends Document {
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Subscriber = models.Subscriber || model<ISubscriber>("Subscriber", SubscriberSchema);

export default Subscriber;
