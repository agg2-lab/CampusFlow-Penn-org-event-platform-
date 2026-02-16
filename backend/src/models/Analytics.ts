import mongoose, { Schema, Document } from "mongoose";

export interface IAnalyticsSnapshot extends Document {
  eventId: string;
  orgId: string;
  date: Date;
  totalRSVPs: number;
  totalCheckIns: number;
  checkInRate: number;
  peakCheckInHour?: number;
  ticketRevenue: number;
  uniqueVisitors: number;
  dropOffCount: number;
  conversionRate: number;
}

const AnalyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    eventId: { type: String, required: true, index: true },
    orgId: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now },
    totalRSVPs: { type: Number, default: 0 },
    totalCheckIns: { type: Number, default: 0 },
    checkInRate: { type: Number, default: 0 },
    peakCheckInHour: Number,
    ticketRevenue: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    dropOffCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AnalyticsSnapshot = mongoose.model<IAnalyticsSnapshot>(
  "AnalyticsSnapshot",
  AnalyticsSnapshotSchema
);
