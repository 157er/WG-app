import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requestMagicLink } from "../lib/api";
import { Button } from "@wg-split/ui";
import { useTranslation } from "react-i18next";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (data) => {
    setMessage(null);
    try {
      const response = await requestMagicLink(data);
      setMessage(response.token ? `Dev Token: ${response.token}` : t("login.success"));
    } catch (error) {
      setMessage("Etwas ist schiefgegangen. Bitte versuch es später erneut.");
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900">{t("login.headline")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("login.description")}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {t("login.cta")}
          </Button>
        </form>
        {message && <p className="mt-4 rounded-md bg-indigo-50 p-3 text-sm text-indigo-700">{message}</p>}
      </div>
    </div>
  );
}
