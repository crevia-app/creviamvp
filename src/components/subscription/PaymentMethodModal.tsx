import { CreditCard, Smartphone, X, ArrowRight } from "lucide-react";

const USD_TO_KES = 130;

interface Props {
  planKey: "pro" | "business";
  amount: number;
  billingCycle: "monthly" | "yearly";
  onSelect: (method: "card" | "mobile_money") => void;
  onClose: () => void;
}

const PLAN_META = {
  pro:      { label: "Pro",      seats: null },
  business: { label: "Business", seats: "3 seats" },
};

export const PaymentMethodModal = ({ planKey, amount, billingCycle, onSelect, onClose }: Props) => {
  const { label, seats } = PLAN_META[planKey];
  const periodLabel = billingCycle === "yearly" ? "yr" : "mo";
  const kesAmount   = Math.round(amount * USD_TO_KES).toLocaleString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-background rounded-2xl shadow-2xl p-6 border border-border">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h2 className="font-vollkorn text-xl font-bold mb-1">Choose Payment Method</h2>
        <p className="text-sm text-muted-foreground font-poppins mb-6">
          Upgrading to <span className="font-semibold text-foreground">{label}</span>
          {" "}— ${amount}/{periodLabel}{seats ? ` · ${seats}` : ""}
        </p>

        {/* Option A — Card */}
        <button
          onClick={() => onSelect("card")}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-bronze/60 hover:bg-bronze/5 transition-all group mb-3 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-poppins font-semibold text-sm text-foreground">Credit / Debit Card</p>
            <p className="text-xs text-muted-foreground">Visa · Mastercard · Verve</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-poppins font-bold text-sm text-foreground">${amount}</p>
            <p className="text-xs text-muted-foreground">Billed in USD</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-bronze transition-colors flex-shrink-0" />
        </button>

        {/* Option B — Mobile Money */}
        <button
          onClick={() => onSelect("mobile_money")}
          className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-bronze/60 hover:bg-bronze/5 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-poppins font-semibold text-sm text-foreground">Mobile Money</p>
            <span className="inline-block text-xs font-poppins font-semibold px-2 py-0.5 rounded-full bg-bronze/15 text-bronze mb-1">
              Popular in Kenya
            </span>
            <p className="text-xs text-muted-foreground">M-Pesa · Airtel Money · MTN</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-poppins font-bold text-sm text-foreground">KES {kesAmount}</p>
            <p className="text-xs text-muted-foreground">≈ ${amount} · Billed in KES</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-bronze transition-colors flex-shrink-0" />
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground font-poppins mt-5">
          Secured by <span className="font-semibold text-foreground">Paystack</span> · Cancel anytime
        </p>
      </div>
    </div>
  );
};
