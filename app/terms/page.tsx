import LegalLayout from "@/components/legal/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="July 2026"
      intro="These terms govern your use of NexMart. By creating an account or placing an order, you agree to them."
      sections={[
        { id: "accounts", heading: "Accounts", body: [
          "You must provide accurate information when registering and verify your email address before you can log in.",
          "You're responsible for keeping your password secure. Let us know immediately if you suspect unauthorized access to your account.",
        ]},
        { id: "orders", heading: "Orders & Pricing", body: [
          "All prices are listed in USD and may change without notice. We reserve the right to limit quantities or refuse an order at our discretion.",
          "Stock levels are shown at time of browsing and may change before checkout completes.",
        ]},
        { id: "shipping-returns", heading: "Shipping & Returns", body: [
          "Estimated delivery times are shown at checkout. Delays caused by carriers are outside our control.",
          "Items may be returned within 10 days of delivery in original condition — see our Shipping & Returns page for details.",
        ]},
        { id: "acceptable-use", heading: "Acceptable Use", body: [
          "Don't use NexMart for fraudulent transactions, to scrape or resell listings without permission, or to attempt to disrupt the platform's normal operation.",
        ]},
        { id: "liability", heading: "Limitation of Liability", body: [
          "NexMart is provided \"as is\". We aren't liable for indirect damages arising from use of the platform, to the fullest extent permitted by law.",
        ]},
        { id: "changes", heading: "Changes to These Terms", body: [
          "We may update these terms occasionally. Continued use of NexMart after changes means you accept the updated terms.",
        ]},
      ]}
    />
  );
}