import DashboardView from "@/components/DashboardView";
import WalletGate from "@/components/WalletGate";

export default function DashboardPage() {
  return (
    <WalletGate
      title="Connect to open your desk"
      description="Connect your wallet to view your publication metrics, articles, and contributor activity."
    >
      <DashboardView />
    </WalletGate>
  );
}
