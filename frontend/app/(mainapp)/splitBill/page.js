"use client";

import { useEffect, useState } from "react";
import ClientOnly from "@/components/clientOnly";
import { useCheckedContacts } from "@/contexts/CheckedContactsContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GenericCard } from "@/components/GenericCard";
import { User } from "lucide-react";

export default function SplitBill() {
  const [hasMounted, setHasMounted] = useState(false);
  const { checkedContacts, setCheckedContacts } = useCheckedContacts([]);

  if (checkedContacts.length === 0) {
    setCheckedContacts(["foo", "bar"]);
  }

  /**************************************
   *
   * Render UI
   *
   **************************************/

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const onGenerateSharinLinks = () => {
    console.log("Generate sharing links");
  };

  if (!hasMounted) return null;
  return (
    <ClientOnly>
      <div className="flex items-center justify-center py-2">
        <main className="flex items-center justify-center text-center">
          <GenericCard
            title={"Split the bill"}
            subtitle={"Choose an amount for each person"}
            footerText={"Get sharing link"}
            footerClick={() => onGenerateSharinLinks()}
          >
            <div>
              {checkedContacts.map((contactName, index) => (
                <div key={index} className="mb-4 flex justify-between items-center pb-4 last:mb-0 last:pb-0">
                  <User />
                  <div className="space-y-1">
                    <p contact="text-sm font-medium leading-none">{contactName}</p>
                  </div>

                  <Input
                    className="w-24"
                    type="email"
                    placeholder="Amount"
                    onChange={e => console.log(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </GenericCard>
        </main>
      </div>
    </ClientOnly>
  );
}
