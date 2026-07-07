"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Package, Wrench } from "lucide-react";
import type { Category } from "@prisma/client";
import { createListingSchema, type CreateListingInput } from "@/lib/validations/listing";
import { createListingAction, updateListingAction } from "@/lib/actions/listings";
import { LISTING_CONDITIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUpload } from "@/components/listings/image-upload";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STEPS = ["Type", "Details", "Photos", "Review"] as const;

export function SellWizard({
  categories,
  mode = "create",
  listingId,
  defaultValues,
}: {
  categories: Category[];
  mode?: "create" | "edit";
  listingId?: string;
  defaultValues?: Partial<CreateListingInput>;
}) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      type: defaultValues?.type ?? "PRODUCT",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      categoryId: defaultValues?.categoryId ?? "",
      price: defaultValues?.price ?? 0,
      condition: defaultValues?.condition ?? "",
      availability: defaultValues?.availability ?? "",
      images: defaultValues?.images ?? [],
    },
  });

  const type = form.watch("type");
  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type]
  );

  async function goNext() {
    const fieldsByStep: Record<number, (keyof CreateListingInput)[]> = {
      0: ["type"],
      1: ["title", "description", "categoryId", "price", "condition", "availability"],
      2: ["images"],
      3: [],
    };
    const valid = await form.trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSubmit(values: CreateListingInput) {
    startTransition(async () => {
      const result =
        mode === "edit" && listingId
          ? await updateListingAction(listingId, values)
          : await createListingAction(values);

      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={cn(
                "h-1.5 w-full rounded-full",
                index <= step ? "bg-primary" : "bg-border"
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                index === step ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 0 ? (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold">What are you listing?</h1>
                <p className="mt-1 text-muted-foreground">
                  Pick whichever fits — you can&apos;t switch this later.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    { value: "PRODUCT", label: "A product", icon: Package, hint: "Textbooks, furniture, electronics, and more." },
                    { value: "SERVICE", label: "A service", icon: Wrench, hint: "Tutoring, rides, moving help, and more." },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => form.setValue("type", option.value, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-start gap-3 rounded-2xl border-2 p-6 text-left transition-colors",
                      type === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <option.icon className="size-6" aria-hidden="true" />
                    </span>
                    <span className="font-semibold">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold">Tell us the details</h1>
                <p className="mt-1 text-muted-foreground">
                  Be specific — clear listings get messaged faster.
                </p>
              </div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Yamaha FG800 acoustic guitar" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder="Condition, why you're selling, what's included…"
                        {...field}
                      />
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(event) => field.onChange(event.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {type === "PRODUCT" ? (
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          <option value="" disabled>
                            Select condition
                          </option>
                          {LISTING_CONDITIONS.map((condition) => (
                            <option key={condition} value={condition}>
                              {condition}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <FormControl>
                        <Input placeholder="Weekday evenings, by appointment…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold">Add photos</h1>
                <p className="mt-1 text-muted-foreground">
                  Listings with clear, well-lit photos get more messages.
                </p>
              </div>
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold">Review &amp; publish</h1>
                <p className="mt-1 text-muted-foreground">
                  Double check everything looks right before it goes live.
                </p>
              </div>
              <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{form.getValues("title") || "Untitled listing"}</h2>
                  <Badge variant="secondary">{type === "PRODUCT" ? "Product" : "Service"}</Badge>
                </div>
                <p className="font-display text-2xl font-bold text-primary">
                  {formatPrice(Math.round((form.getValues("price") || 0) * 100))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {form.getValues("description") || "No description yet."}
                </p>
                {form.getValues("images").length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {form.getValues("images").map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={url}
                        src={url}
                        alt=""
                        className="aspect-square w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between pt-4">
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack} className="rounded-full">
                Back
              </Button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} className="rounded-full">
                Continue
              </Button>
            ) : (
              <Button type="submit" disabled={isPending} className="rounded-full">
                {isPending
                  ? "Publishing…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Publish listing"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
