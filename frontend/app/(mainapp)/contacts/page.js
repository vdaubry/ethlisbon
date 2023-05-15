"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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
  { name: "Filipe Macedo", phone: "555-555-5555" },
  { name: "Francisco Leal", phone: "444-444-4444" },
  { name: "Vincent Daubry", phone: "222-222-2222" },
  { name: "Pedro Pereira", phone: "666-666-6666" },
  { name: "Vitalik", phone: "777-777-7777" },
  { name: "Nuno Reis", phone: "888-888-8888" }
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
      setCheckedContacts([]);
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
      setCheckedContacts(prev => [...prev, contactName]);
    } else {
      setCheckedContacts(checkedContacts.filter(name => name !== contactName));
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-2">
      <main className="flex flex-col items-center flex-1 px-20 text-center">
        <Image src={"/logo.svg"} width={600} height={200} className={"-mb-20"} alt="logo" />
        <GenericCard
          title={"gm [name] 👋"}
          subtitle={"Who do you want to split the bill with?"}
          footerText={"Slice it!"}
          footerClick={() => onSplitBill()}
        >
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="email"
              placeholder="Email, Lens, WorldID, etc.."
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
