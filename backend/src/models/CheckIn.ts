import mongoose, { Schema, Document } from "mongoose";

export interface ICheckIn extends Document {
  eventId: string;
  userId: string;
  ticketId: string;
  method: "qr" | "manual";
  checkedInAt: Date;
  checkedInBy: string;
}

const CheckInSchema = new Schema<ICheckIn>(
  {
    eventId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    ticketId: { type: String, required: true, unique: true },
    method: { type: String, enum: ["qr", "manual"], default: "qr" },
    checkedInAt: { type: Date, default: Date.now },
    checkedInBy: { type: String, required: true },
  },
  { timestamps: true }
);

CheckInSchema.index({ eventId: 1, userId: 1 });

export const CheckIn = mongoose.model<ICheckIn>("CheckIn", CheckInSchema);
