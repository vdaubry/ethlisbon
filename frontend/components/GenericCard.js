import { Loader2 } from "lucide-react";

import { cn } from "@/utils/tailwindHelpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const GenericCard = ({
  className,
  title,
  subtitle,
  footerText,
  footerClick,
  children,
  loadingFooterButton = false,
  disableFooterButton = false,
  ...props
}) => {
  const buttonContent = () => {
    if (loadingFooterButton) {
      return (
        <Button className="w-full" onClick={footerClick} disabled={disableFooterButton}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      );
    } else {
      return (
        <Button className="w-full" onClick={footerClick} disabled={disableFooterButton}>
          {footerText}
        </Button>
      );
    }
  };
  return (
    <Card className={cn("w-[380px]", className)} {...props}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4">{children}</CardContent>
      {footerText && <CardFooter>{buttonContent()}</CardFooter>}
    </Card>
  );
};
