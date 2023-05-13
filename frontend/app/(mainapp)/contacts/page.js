"use client";

import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount, useEnsName } from "wagmi";
import getSafeAuth from "@/utils/safeAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenericCard } from "@/components/GenericCard";
import { Switch } from "@/components/ui/switch";

import { useGenericContext } from "@/contexts/GenericContext";

const ContactList = [
  { name: "John Doe", phone: "555-555-5555" },
  { name: "Jane Smith", phone: "444-444-4444" },
  { name: "Bob Johnson", phone: "333-333-3333" },
  { name: "Alice Williams", phone: "222-222-2222" },
  { name: "Charlie Brown", phone: "111-111-1111" }
  // { name: "Emily Davis", phone: "666-666-6666" },
  // { name: "Frank Miller", phone: "777-777-7777" },
  // { name: "Grace Lee", phone: "888-888-8888" },
  // { name: "Harry Wilson", phone: "999-999-9999" },
  // { name: "Ivy Thomas", phone: "000-000-0000" }
];

export default function Split() {
  const router = useRouter();
  // web3
  const [safeAuth, setSafeAuth] = useState();
  const [userAddress, setUserAddress] = useState(null);
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address: userAddress });

  // local state
  const [searchQuery, setSearchQuery] = useState(null);

  // Shared state
  const { checkedContacts, setCheckedContacts } = useGenericContext([]);

  useEffect(() => {
    (async () => {
      const safeAuthKit = await getSafeAuth();
      setSafeAuth(safeAuthKit);

      const response = await safeAuthKit.signIn();
      setUserAddress(response.eoa);
    })();
  }, []);

  useEffect(() => {
    if (address) {
      setUserAddress(address);
    }
  }, [address, isConnected]);

  const prettyfyUserAddress = () => {
    if (!userAddress) return "";

    return `${userAddress.slice(0, 5)}...${userAddress.slice(-3)}`;
  };

  const onSplitBill = () => {
    router.push("/splitBill");
  };

  const name = () => ensName || prettyfyUserAddress();

  const onCheckedChange = async (contactName, checked) => {
    if (checked) {
      setCheckedContacts([...checkedContacts, contactName]);
    } else {
      setCheckedContacts(checkedContacts.filter(name => name !== contactName));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-20 text-center">
        <GenericCard
          title={name() || "Welcome"}
          subtitle={"Add your friends to split with"}
          footerText={"Split the bill"}
          footerClick={() => onSplitBill()}
        >
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="email"
              placeholder="Search for friends.."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </div>
          <div>
            {ContactList.map((contact, index) => (
              <div key={index} className="mb-4 flex justify-between items-center pb-4 last:mb-0 last:pb-0">
                <User />
                <div className="space-y-1">
                  <p contact="text-sm font-medium leading-none">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.phone}</p>
                </div>
                <Switch
                  id={`${contact.name}`}
                  onCheckedChange={checked => {
                    onCheckedChange(contact.name, checked);
                  }}
                />
              </div>
            ))}
          </div>
        </GenericCard>
      </main>
    </div>
  );
}
