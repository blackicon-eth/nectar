import SubscriptionsView from "@/components/SubscriptionsView";
import WalletGate from "@/components/WalletGate";

export const metadata = {
  title: "Subscriptions",
};

export default function SubscriptionsPage() {
  return (
    <WalletGate
      title="Connect to view your subscriptions"
      description="Connect your wallet and sign in to see the creators you support and the writing they publish for patrons."
      autoSignIn
    >
      <SubscriptionsView />
    </WalletGate>
  );
}
