"use client";

import { useEffect, useState } from "react";
import ClientOnly from "@/components/clientOnly";
import { useGenericContext } from "@/contexts/GenericContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GenericCard } from "@/components/GenericCard";
import UserSplitAmountCard from "@/components/UserSplitAmountCard";
import { User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SplitBill() {
  const [hasMounted, setHasMounted] = useState(false);
  const { checkedContacts, setCheckedContacts } = useGenericContext([]);
  const { safeAddress } = useGenericContext("");

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

    const params = "?safeAddress=" + safeAddress + "&amount=" + getSplittedAmount() * 100;

    let url = "http://localhost:3000/pay";
    if (isProd) {
      url = "https://" + process.env.VERCEL_URL + "/pay";
    }
    return url + params;
  };

  const onCopyShareLink = async () => {
    await navigator.clipboard.writeText(getShareLink());
  };

  if (!hasMounted) return null;
  return (
    <ClientOnly>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center px-20 text-center">
          <h1 className="text-6xl font-bold mb-6">SLICE</h1>
          <Card className="w-[380px]">
            <CardHeader>
              <CardTitle>Slicing 🔪</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <div className="mb-4 flex justify-between items-center pb-4 last:mb-0 last:pb-0">
                  <div className="space-y-1">
                    <p contact="text-sm font-medium leading-none">Total Amount to Slice</p>
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
        </main>

        <div className="flex items-center justify-center text-center mt-3">
          <GenericCard
            title={"Review 🔍"}
            footerText={sharingLinks ? "Edit" : "Confirm"}
            footerClick={() => setSharingLinks(!sharingLinks)}
          >
            <div>
              <Separator className="mb-6" />
              <UserSplitAmountCard contactName="Myself" amount={getSplittedAmount()} />
              {checkedContacts.map((contactName, index) => (
                <>
                  <UserSplitAmountCard
                    key={index}
                    contactName={contactName}
                    amount={getSplittedAmount()}
                    sharingLinks={sharingLinks}
                    onCopyShareLink={onCopyShareLink}
                  />
                </>
              ))}
              <Separator className="mb-6" />
            </div>
          </GenericCard>
        </div>
      </div>
    </ClientOnly>
  );
}
