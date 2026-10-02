import { Schema, model, Types, Model } from 'mongoose';
import { AIProvider } from '../types/ai.types';

export interface AISettingsDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  provider: AIProvider;
  encryptedApiKey?: string;
  baseUrl?: string;
  model: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type AISettingsModelType = Model<AISettingsDocument>;

const AISettingsSchema = new Schema<AISettingsDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    provider: {
      type: String,
      enum: ['openai', 'gemini', 'claude', 'groq', 'openrouter', 'ollama', 'huggingface'],
      required: true,
    },
    encryptedApiKey: { type: String, required: false },
    baseUrl: { type: String, required: false },
    model: { type: String, required: true, trim: true },
    isEnabled: { type: Boolean, default: true, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes per Backend-Schema.md Section 5.17
AISettingsSchema.index({ userId: 1 }, { unique: true });
AISettingsSchema.index({ userId: 1, provider: 1 });

export const AISettings = model<AISettingsDocument, AISettingsModelType>(
  'AISettings',
  AISettingsSchema,
  'ai_settings',
);
