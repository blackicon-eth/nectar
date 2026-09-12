import ArticleForm from "@/components/ArticleForm";
import WalletGate from "@/components/WalletGate";

export default function WritePage() {
  return (
    <WalletGate
      title="Connect to start writing"
      description="Your wallet identifies you as the author and anchors your publication to the Nectar network."
    >
      <ArticleForm />
    </WalletGate>
  );
}
