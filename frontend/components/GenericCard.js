import { Check } from "lucide-react";

import { cn } from "@/utils/tailwindHelpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const GenericCard = ({ className, title, subtitle, footerText, footerClick, children, ...props }) => {
  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
      {footerText && (
        <CardFooter>
          <Button className="w-full" onClick={footerClick}>
            {footerText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
