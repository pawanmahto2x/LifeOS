import { Schema, model, Document, Model, Types } from 'mongoose';
import { IJournalAnalysis, IDataConnection } from '../types/journal-analysis.types';

export interface IJournalAnalysisDocument
  extends Omit<IJournalAnalysis, '_id' | 'userId' | 'journalId'>, Document {
  userId: Types.ObjectId;
  journalId: Types.ObjectId;
}
export type JournalAnalysisModelType = Model<IJournalAnalysisDocument>;

const DataConnectionSchema = new Schema<IDataConnection>(
  {
    observation: { type: String, required: true },
    journalMention: { type: String, required: true },
    recordedData: { type: String, required: true },
    metric: { type: String, required: true },
    comparison: { type: String },
  },
  { _id: false },
);

const journalAnalysisSchema = new Schema<IJournalAnalysisDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    journalId: { type: Schema.Types.ObjectId, ref: 'Journal', required: true, index: true },
    themes: { type: [String], required: true },
    extractedMood: { type: String, default: null },
    extractedEnergy: { type: String, enum: ['high', 'medium', 'low', null], default: null },
    keyPhrases: { type: [String], required: true },
    dataConnections: { type: [DataConnectionSchema], required: true, default: [] },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false },
);

journalAnalysisSchema.index({ userId: 1, journalId: 1 }, { unique: true });
journalAnalysisSchema.index({ userId: 1, analyzedAt: -1 });

export const JournalAnalysis = model<IJournalAnalysisDocument, JournalAnalysisModelType>(
  'JournalAnalysis',
  journalAnalysisSchema,
);
