"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/crm/schema";
import { Mail, Phone, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  contacts: Contact[];
  companyId: string;
  onAdd: (contact: Omit<Contact, "id" | "companyId">) => Promise<void>;
  onUpdate: (id: string, data: Partial<Contact>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ContactsList({ contacts, companyId, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", isPrimary: false });

  async function handleAdd() {
    if (!form.name) return;
    await onAdd(form);
    setForm({ name: "", phone: "", email: "", isPrimary: false });
    setAdding(false);
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Kontakter
        </span>
        <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => setAdding(true)}>
          <Plus className="h-3 w-3" /> Lägg till
        </Button>
      </div>

      <div className="space-y-2">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-white border text-sm group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate">{c.name}</span>
                {c.isPrimary && (
                  <Badge className="text-[10px] py-0 px-1 bg-amber-100 text-amber-800">Primär</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-foreground">
                    <Phone className="h-3 w-3" />
                    {c.phone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-foreground">
                    <Mail className="h-3 w-3" />
                    {c.email}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!c.isPrimary && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Markera som primär"
                  onClick={() => onUpdate(c.id, { isPrimary: true })}
                >
                  <Star className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() => onDelete(c.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {adding && (
          <div className="p-3 rounded-lg bg-white border space-y-2">
            <input
              autoFocus
              className="w-full text-sm border rounded px-2 py-1"
              placeholder="Namn *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border rounded px-2 py-1"
                placeholder="Telefon"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <input
                className="flex-1 text-sm border rounded px-2 py-1"
                placeholder="E-post"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Avbryt
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={!form.name}>
                Spara
              </Button>
            </div>
          </div>
        )}

        {contacts.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground italic">Inga kontakter ännu.</p>
        )}
      </div>
    </div>
  );
}
