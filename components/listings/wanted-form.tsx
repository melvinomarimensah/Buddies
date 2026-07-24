"use client";

import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Package, Wrench } from "lucide-react";
import type { Category } from "@prisma/client";
import { createWantedSchema, type CreateWantedInput } from "@/lib/validations/listing";
import { createWantedAction } from "@/lib/actions/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function WantedForm({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateWantedInput>({
    resolver: zodResolver(createWantedSchema),
    defaultValues: {
      type: "PRODUCT",
      title: "",
      description: "",
      categoryId: "",
      budget: 0,
    },
  });

  const type = form.watch("type");
  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  function onSubmit(values: CreateWantedInput) {
    startTransition(async () => {
      const result = await createWantedAction(values);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Post a request</h1>
        <p className="mt-1 text-muted-foreground">
          Tell your campus what you&apos;re looking for, and people who have it can reach out.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-2">
            <FormLabel>What are you after?</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "PRODUCT", label: "An item", icon: Package },
                  { value: "SERVICE", label: "A service", icon: Wrench },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    form.setValue("type", option.value, { shouldValidate: true });
                    form.setValue("categoryId", "");
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-colors",
                    type === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <option.icon className="size-4 text-primary" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What are you looking for?</FormLabel>
                <FormControl>
                  <Input placeholder="Mini fridge for my dorm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="" disabled>
                      Choose a category
                    </option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Leave 0 if it's flexible"
                    {...field}
                    onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Condition you'd accept, timing, why you need it…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Posting…" : "Post request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
