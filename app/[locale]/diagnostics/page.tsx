"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { AppSidebar } from "@/app/[locale]/dashboard/components/app-sidebar";
import { SiteHeader } from "@/app/[locale]/dashboard/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";

export default function DiagnosticsPage() {
  const router = useRouter();
  const t = useTranslations("pages");
  const td = useTranslations("diagnostics");
  const [testType, setTestType] = useState("sip");
  const [target, setTarget] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<
    { type: string; target: string; result: string; timestamp: string; details: string }[]
  >([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) router.push("/login");
  }, [router]);

  const runTest = () => {
    if (!target) {
      toast.error("请输入测试目标");
      return;
    }
    setRunning(true);
    setTimeout(() => {
      const success = Math.random() > 0.3;
      const result = {
        type: testType,
        target,
        result: success ? "Success" : "Failed",
        timestamp: new Date().toLocaleString(),
        details: success ? "测试成功完成" : "连接超时",
      };
      setResults((prev) => [result, ...prev]);
      setRunning(false);
      toast[success ? "success" : "error"](
        `${td(testType as "sipTest" | "registerTest" | "callTest" | "networkTest")}: ${result.result === "Success" ? td("success") : td("failed")}`,
      );
    }, 2000);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={t("diagnostics")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6 grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{td("runTest")}</CardTitle>
                    <CardDescription>选择测试类型并运行诊断</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>{td("testType")}</Label>
                      <Select value={testType} onValueChange={setTestType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sip">{td("sipTest")}</SelectItem>
                          <SelectItem value="register">{td("registerTest")}</SelectItem>
                          <SelectItem value="call">{td("callTest")}</SelectItem>
                          <SelectItem value="network">{td("networkTest")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>{td("target")}</Label>
                      <Input
                        placeholder="输入测试目标 (IP/号码/域名)"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                      />
                    </div>
                    <Button onClick={runTest} disabled={running}>
                      {running ? (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PlayIcon className="mr-2 h-4 w-4" />
                      )}
                      {running ? td("running") : td("runTest")}
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>测试结果</CardTitle>
                    <CardDescription>最近的诊断测试结果</CardDescription>
                  </CardHeader>
                  <CardContent className="max-h-96 overflow-auto">
                    {results.length ? (
                      results.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b py-2 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            {r.result === "Success" ? (
                              <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-medium">{r.type}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{r.target}</div>
                            <div className="text-xs text-muted-foreground">{r.timestamp}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        {td("noResults")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
