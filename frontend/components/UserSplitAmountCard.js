import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyToClipboard } from "react-copy-to-clipboard";

const UserSplitAmountCard = ({ contactName, amount, sharingLinks, onCopyShareLink }) => {
  return (
    <div className="mb-4 flex justify-between items-center pb-4 last:mb-0 last:pb-0">
      <User />
      <div className="space-y-1">
        <p contact="text-sm font-medium leading-none">{contactName}</p>
      </div>
      {sharingLinks ? (
        <Button type="submit" onClick={() => onCopyShareLink()}>
          Copy link
        </Button>
      ) : (
        <Input
          value={amount + " $"}
          className="w-24"
          type="email"
          placeholder="Amount"
          onChange={e => console.log(e.target.value)}
        />
      )}
    </div>
  );
};

export default UserSplitAmountCard;
