"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react";
import { toast } from "sonner";

export default function LicensePage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const tl = useTranslations("license");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);

  const licenseInfo = {
    licenseKey: "PBX-PRO-2024-XXXX-XXXX-XXXX",
    product: "PBX Professional Edition",
    expiryDate: "2025-12-31",
    status: "Active",
    features: ["IVR", "Conference", "Recording", "CRM Integration", "Mobile App"],
    daysRemaining: 290,
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("license")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <KeyIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{tl("licenseKey")}</CardTitle>
                        <CardDescription className="font-mono">
                          {licenseInfo.licenseKey}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{tl("product")}</span>
                        <span className="font-medium">{licenseInfo.product}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{tl("expiryDate")}</span>
                        <span className="font-medium">{licenseInfo.expiryDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{tl("status")}</span>
                        {licenseInfo.status === "Active" ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">{tl("active")}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                            <span className="text-red-600">{tl("expired")}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          {tl("daysRemaining", { days: licenseInfo.daysRemaining })}
                        </span>
                        <Badge variant="secondary">{licenseInfo.daysRemaining} 天</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>{tl("features")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {licenseInfo.features.map((feature) => (
                          <Badge key={feature} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-6 flex gap-4">
                  <Button onClick={() => toast.success(tl("addLicense"))}>
                    {tl("addLicense")}
                  </Button>
                  <Button variant="outline" onClick={() => toast.info(tl("renewLicense"))}>
                    {tl("renewLicense")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
