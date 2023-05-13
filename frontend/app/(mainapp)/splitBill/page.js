"use client";

import { useEffect, useState } from "react";
import ClientOnly from "@/components/clientOnly";
import { useCheckedContacts } from "@/contexts/GenericContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GenericCard } from "@/components/GenericCard";
import UserSplitAmountCard from "@/components/UserSplitAmountCard";
import { User } from "lucide-react";

export default function SplitBill() {
  const [hasMounted, setHasMounted] = useState(false);
  const { checkedContacts, setCheckedContacts } = useCheckedContacts([]);
  const [totalAmount, setTotalAmount] = useState(30);
  const [sharingLinks, setSharingLinks] = useState(false);

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

  const getSplittedAmount = () => {
    return totalAmount / (checkedContacts.length + 1);
  };

  const getShareLink = () => {
    const isProd = process.env.VERCEL_ENV === "production";

    let url = "http://localhost:3000/pay";

    if (isProd) {
      url = "https://" + process.env.VERCEL_URL + "/pay";
    }
    return url;
  };

  const onCopyShareLink = async () => {
    await navigator.clipboard.writeText(getShareLink());
  };

  if (!hasMounted) return null;
  return (
    <ClientOnly>
      <main className="py-2">
        <div className="flex items-center justify-center text-center">
          <Card className="w-[380px]">
            <CardHeader>
              <CardTitle>Describe your bill</CardTitle>
              <CardDescription>Total amount</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <div className="mb-4 flex justify-between items-center pb-4 last:mb-0 last:pb-0">
                  <div className="space-y-1">
                    <p contact="text-sm font-medium leading-none">Total bill amount</p>
                  </div>

                  <Input
                    className="w-24"
                    type="email"
                    placeholder="30$"
                    onChange={e => setTotalAmount(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-center text-center mt-3">
          <GenericCard
            title={"Split the bill"}
            subtitle={"Choose an amount for each person"}
            footerText={sharingLinks ? "Edit splitted amounts" : "Get sharing links"}
            footerClick={() => setSharingLinks(!sharingLinks)}
          >
            <div>
              <UserSplitAmountCard contactName="Myself" amount={getSplittedAmount()} />
              {checkedContacts.map((contactName, index) => (
                <UserSplitAmountCard
                  key={index}
                  contactName={contactName}
                  amount={getSplittedAmount()}
                  sharingLinks={sharingLinks}
                  onCopyShareLink={onCopyShareLink}
                />
              ))}
            </div>
          </GenericCard>
        </div>
      </main>
    </ClientOnly>
  );
}
