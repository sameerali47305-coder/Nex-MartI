import { PackageCheck } from "lucide-react";

import ComingSoon from "@/components/ui/ComingSoon";

export default function ShippingPage() {
  return (
    <ComingSoon
      icon={PackageCheck}
      title="Shipping & Returns Coming Soon"
      description="We're documenting our shipping timelines and return process. Check back soon for details."
    />
  );
}