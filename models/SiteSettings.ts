import { Schema, model, models, Document } from "mongoose";

export interface ISiteSettings extends Document {
  dealsEndTime: Date | null;
  promoBannerEnabled: boolean;
  promoBannerMessage: string;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    dealsEndTime: { type: Date, default: null },
    promoBannerEnabled: { type: Boolean, default: false },
    promoBannerMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default models.SiteSettings || model<ISiteSettings>("SiteSettings", siteSettingsSchema);