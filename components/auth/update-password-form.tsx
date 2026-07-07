"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations/auth";
import { updatePasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "" },
  });

  function onSubmit(values: UpdatePasswordInput) {
    setFormError(null);
    const formData = new FormData();
    formData.set("password", values.password);

    startTransition(async () => {
      const result = await updatePasswordAction(null, formData);
      if (!result) return;
      if (result.error) setFormError(result.error);
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof UpdatePasswordInput, { message: messages?.[0] });
        });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose something you haven&apos;t used before.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
