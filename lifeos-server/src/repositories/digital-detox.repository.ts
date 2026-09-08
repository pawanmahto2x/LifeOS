import { DigitalDetoxSettings, DigitalDetoxSettingsDocument } from '../models/digital-detox.model';
import { IUpdateDigitalDetoxSettingsDto } from '../types/digital-detox.types';

export class DigitalDetoxRepository {
  async findByUserId(userId: string): Promise<DigitalDetoxSettingsDocument | null> {
    return DigitalDetoxSettings.findOne({ userId }).exec();
  }

  async upsertSettings(
    userId: string,
    data: IUpdateDigitalDetoxSettingsDto,
  ): Promise<DigitalDetoxSettingsDocument> {
    return DigitalDetoxSettings.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...data,
          userId,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    ).exec();
  }
}
