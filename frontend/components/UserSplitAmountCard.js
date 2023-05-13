import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const UserSplitAmountCard = ({ key, contactName, amount, sharingLinks, onCopyShareLink }) => {
  return (
    <div key={key} className="mb-3 flex justify-between items-center pb-4 last:mb-0 last:pb-0">
      <User />
      <div className="space-y-1">
        <p contact="text-sm font-medium leading-none">{contactName}</p>
      </div>
      <p className="text-sm font-medium leading-none">${amount}</p>
      {onCopyShareLink && (
        <Button onClick={() => onCopyShareLink()} disabled={!sharingLinks}>
          Copy link
        </Button>
      )}
      {!onCopyShareLink && <div style={{ width: "5.7rem" }}></div>}
    </div>
  );
};

export default UserSplitAmountCard;
