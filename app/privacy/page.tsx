import LegalLayout from "@/components/legal/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="July 2026"
      intro="This policy explains what information NexMart collects, how it's used, and the choices you have."
      sections={[
        { id: "information-we-collect", heading: "Information We Collect", body: [
          "When you create an account, we collect your name, email address, and password (stored securely as a hash, never in plain text).",
          "When you place an order, we collect shipping details and order history so we can fulfill and let you track your purchases.",
        ]},
        { id: "how-we-use-it", heading: "How We Use Your Information", body: [
          "To process orders, send order confirmations, and provide customer support.",
          "To send account-related emails, such as email verification codes and password resets.",
          "To send newsletter updates only if you've explicitly subscribed — you can unsubscribe at any time.",
        ]},
        { id: "data-storage", heading: "Data Storage & Security", body: [
          "Your data is stored in a MongoDB Atlas database with restricted network access. Passwords are hashed with bcrypt before storage — we never store or have access to your plain-text password.",
        ]},
        { id: "cookies", heading: "Cookies & Local Storage", body: [
          "We use browser local storage to keep you logged in between visits. We don't use third-party advertising or tracking cookies.",
        ]},
        { id: "your-rights", heading: "Your Rights", body: [
          "You can request access to, correction of, or deletion of your personal data at any time by contacting us through our Contact page.",
        ]},
        { id: "contact", heading: "Contact Us", body: [
          "Questions about this policy? Reach out via our Contact page and we'll respond within 1 business day.",
        ]},
      ]}
    />
  );
}