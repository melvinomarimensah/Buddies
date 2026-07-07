"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Category, University } from "@prisma/client";
import {
  upsertUniversityAction,
  deleteUniversityAction,
  upsertCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UniForm = { id?: string; name: string; country: string; city: string; emailDomain: string };
type CatForm = { id?: string; name: string; slug: string; icon: string; type: "PRODUCT" | "SERVICE" };

const EMPTY_UNI: UniForm = { name: "", country: "", city: "", emailDomain: "" };
const EMPTY_CAT: CatForm = { name: "", slug: "", icon: "tag", type: "PRODUCT" };

export function SettingsManager({
  universities,
  categories,
}: {
  universities: University[];
  categories: Category[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <UniversitiesPanel universities={universities} />
      <CategoriesPanel categories={categories} />
    </div>
  );
}

function UniversitiesPanel({ universities }: { universities: University[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<UniForm>(EMPTY_UNI);

  function openAdd() {
    setForm(EMPTY_UNI);
    setOpen(true);
  }
  function openEdit(u: University) {
    setForm({ id: u.id, name: u.name, country: u.country, city: u.city, emailDomain: u.emailDomain });
    setOpen(true);
  }
  function save() {
    startTransition(async () => {
      const result = await upsertUniversityAction(form);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(form.id ? "University updated." : "University added.");
        setOpen(false);
      }
    });
  }
  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteUniversityAction(id);
      if (result?.error) toast.error(result.error);
      else toast.success("University removed.");
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Universities ({universities.length})</h2>
        <Button size="sm" variant="outline" className="rounded-full" onClick={openAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
      <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto">
        {universities.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-secondary/40"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{u.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {u.city}, {u.country} · {u.emailDomain}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(u)}>
                <Pencil className="size-3.5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={() => remove(u.id)}
                disabled={isPending}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit university" : "Add university"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field
              label="Country"
              value={form.country}
              onChange={(v) => setForm({ ...form, country: v })}
            />
            <Field
              label="Email domain"
              value={form.emailDomain}
              onChange={(v) => setForm({ ...form, emailDomain: v })}
              placeholder="school.edu"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={save} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CategoriesPanel({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CatForm>(EMPTY_CAT);

  function openAdd() {
    setForm(EMPTY_CAT);
    setOpen(true);
  }
  function openEdit(c: Category) {
    setForm({ id: c.id, name: c.name, slug: c.slug, icon: c.icon, type: c.type });
    setOpen(true);
  }
  function save() {
    startTransition(async () => {
      const result = await upsertCategoryAction(form);
      if (result?.error) toast.error(result.error);
      else {
        toast.success(form.id ? "Category updated." : "Category added.");
        setOpen(false);
      }
    });
  }
  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result?.error) toast.error(result.error);
      else toast.success("Category removed.");
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Categories ({categories.length})</h2>
        <Button size="sm" variant="outline" className="rounded-full" onClick={openAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
      <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto">
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-secondary/40"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate font-medium">{c.name}</span>
              <Badge variant="outline" className="shrink-0">
                {c.type === "PRODUCT" ? "Product" : "Service"}
              </Badge>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(c)}>
                <Pencil className="size-3.5" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive"
                onClick={() => remove(c.id)}
                disabled={isPending}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field
              label="Slug"
              value={form.slug}
              onChange={(v) => setForm({ ...form, slug: v })}
              placeholder="textbooks"
            />
            <Field
              label="Icon (lucide name)"
              value={form.icon}
              onChange={(v) => setForm({ ...form, icon: v })}
              placeholder="book-open"
            />
            <div className="space-y-1.5">
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value as "PRODUCT" | "SERVICE" })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={save} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
