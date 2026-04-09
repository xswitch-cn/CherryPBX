"use client";

import { useState } from "react";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/services/auth";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const t = useTranslations("login");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    login({ username, password })
      .then((obj) => {
        if (obj.success) {
          localStorage.setItem("isLoggedIn", "true");
          router.push("/dashboard");
        } else {
          setError(obj.errorCode || t("loginFailed"));
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">{t("username")}</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={t("usernamePlaceholder")}
                  required
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {t("forgotPassword")}
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                />
              </Field>
              {error && (
                <Field>
                  <p className="text-sm text-red-500 text-center">{error}</p>
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t("loggingIn") : t("loginButton")}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
