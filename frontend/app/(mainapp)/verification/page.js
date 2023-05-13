"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GenericCard } from "@/components/GenericCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Verification = () => {
  const router = useRouter();
  // localState for code
  const [code, setCode] = useState("");

  const goToContacts = () => {
    router.push("/contacts");
  };

  const valueAtPosition = index => {
    if (index > code.length) {
      return "";
    } else {
      return code.charAt(index);
    }
  };

  const updateCodeAtIndex = (value, index) => {
    if (index < code.length) {
      setCode(prev => prev.substring(0, index) + value + prev.substring(index + replacement.length));
    } else {
      setCode(prev => prev + value);
    }
  };

  useEffect(() => {
    const index = code.length;

    if (index >= 6) {
      return;
    }

    document.getElementById(`slot-${index}`).focus();
  }, [code]);

  return (
    <div className="flex flex-col items-center min-h-screen py-6 ">
      <main className="flex flex-col items-center flex-1 px-20 text-center">
        <Image src={"/logo.svg"} width={600} height={200} className={"-mb-20"} alt="logo" />
        <div className="flex items-center justify-center text-left mt-3">
          <GenericCard
            title={"SMS verification"}
            subtitle={"Please insert the code you will receive. The code expires after 5 minutes."}
            footerText={"Done"}
            footerClick={() => goToContacts()}
            disableFooterButton={code.length !== 6}
          >
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                id="slot-0"
                className="text-center"
                type="text"
                maxLength="1"
                value={valueAtPosition(0)}
                onChange={e => updateCodeAtIndex(e.target.value, 0)}
              />
              <Input
                id="slot-1"
                className="text-center"
                type="text"
                maxLength="1"
                value={valueAtPosition(1)}
                onChange={e => updateCodeAtIndex(e.target.value, 1)}
              />
              <Input
                id="slot-2"
                className="text-center"
                type="text"
                maxLength="1"
                value={valueAtPosition(2)}
                onChange={e => updateCodeAtIndex(e.target.value, 2)}
              />
              <Input
                id="slot-3"
                className="text-center"
                type="text"
                maxLength="1"
                value={valueAtPosition(3)}
                onChange={e => updateCodeAtIndex(e.target.value, 3)}
              />
              <Input
                id="slot-4"
                className="text-center"
                type="text"
                maxLength="1"
                value={valueAtPosition(4)}
                onChange={e => updateCodeAtIndex(e.target.value, 4)}
              />
              <Input
                id="slot-5"
                className="text-center"
                type="text"
                maxLength="1"
                value={valueAtPosition(5)}
                onChange={e => updateCodeAtIndex(e.target.value, 5)}
              />
            </div>
          </GenericCard>
        </div>
      </main>
    </div>
  );
};

export default Verification;
