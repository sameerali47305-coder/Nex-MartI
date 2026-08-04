import { Schema, models, model, type Document, Types } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: "order" | "promo" | "system";
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["order", "promo", "system"], default: "system" },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = models.Notification || model<INotification>("Notification", NotificationSchema);

export default Notification;