import { MapPin } from "lucide-react";

import ComingSoon from "@/components/ui/ComingSoon";

export default function TrackOrderPage() {
  return (
    <ComingSoon
      icon={MapPin}
      title="Order Tracking Coming Soon"
      description="Once order tracking is live, you'll be able to see real-time status right here. Check back soon."
    />
  );
}