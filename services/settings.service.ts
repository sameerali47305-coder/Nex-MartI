import { connectDB } from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export async function getSiteSettings() {
  await connectDB();
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  return {
    dealsEndTime: settings.dealsEndTime,
    promoBannerEnabled: settings.promoBannerEnabled,
    promoBannerMessage: settings.promoBannerMessage,
  };
}

export async function updateSiteSettings(input: {
  dealsEndTime?: Date | null;
  promoBannerEnabled?: boolean;
  promoBannerMessage?: string;
}) {
  await connectDB();
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  if (input.dealsEndTime !== undefined) settings.dealsEndTime = input.dealsEndTime;
  if (input.promoBannerEnabled !== undefined) settings.promoBannerEnabled = input.promoBannerEnabled;
  if (input.promoBannerMessage !== undefined) settings.promoBannerMessage = input.promoBannerMessage;
  await settings.save();
  return {
    dealsEndTime: settings.dealsEndTime,
    promoBannerEnabled: settings.promoBannerEnabled,
    promoBannerMessage: settings.promoBannerMessage,
  };
}