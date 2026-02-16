import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  orgId: string;
  orgName: string;
  coverImage?: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  startDate: Date;
  endDate: Date;
  tags: string[];
  capacity: number;
  rsvpCount: number;
  ticketPrice: number;
  isFree: boolean;
  isPublished: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, index: "text" },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    orgId: { type: String, required: true, index: true },
    orgName: { type: String, required: true },
    coverImage: String,
    location: { type: String, required: true },
    isVirtual: { type: Boolean, default: false },
    virtualLink: String,
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    tags: { type: [String], default: [], index: true },
    capacity: { type: Number, default: 100 },
    rsvpCount: { type: Number, default: 0 },
    ticketPrice: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

EventSchema.index({ title: "text", description: "text", tags: "text" });

export const Event = mongoose.model<IEvent>("Event", EventSchema);
