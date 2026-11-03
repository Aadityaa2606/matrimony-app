import { membershipAmountPaise } from "@/lib/razorpay";
import { FeaturesCarousel } from "./FeaturesCarousel";

export default function FeaturesPage() {
  return <FeaturesCarousel amount={membershipAmountPaise() / 100} />;
}
