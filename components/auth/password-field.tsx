"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";
import { cn } from "@/lib/utils";

export function PasswordField({ error }: { error?: string[] }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");

  const checks = [
    { label: "At least 8 characters", ok: value.length >= 8 },
    { label: "A letter", ok: /[a-zA-Z]/.test(value) },
    { label: "A number", ok: /[0-9]/.test(value) },
  ];

  return (
    <div className="grid gap-2">
      <Label htmlFor="password">Password</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          required
          autoComplete="new-password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {value.length > 0 ? (
        <ul className="grid gap-1 pt-0.5">
          {checks.map((check) => (
            <li
              key={check.label}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                check.ok ? "text-success" : "text-muted-foreground"
              )}
            >
              {check.ok ? (
                <Check className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <X className="size-3.5 shrink-0" aria-hidden="true" />
              )}
              {check.label}
            </li>
          ))}
        </ul>
      ) : null}
      <FieldError messages={error} />
    </div>
  );
}
