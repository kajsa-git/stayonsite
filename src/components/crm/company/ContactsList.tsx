"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/lib/crm/schema";
import { isValidEmail, isValidPhoneNumber } from "@/lib/contact";
import { PhoneActions } from "@/components/crm/PhoneActions";
import { Check, Mail, Pencil, Phone, Plus, Star, Trash2, X } from "lucide-react";
import { useState } from "react";

interface Props {
  contacts: Contact[];
  companyId: string;
  onAdd: (contact: Omit<Contact, "id" | "companyId">) => Promise<void>;
  onUpdate: (id: string, data: Partial<Contact>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type Fields = { name: string; phone: string; email: string };

function validate({ name, phone, email }: Fields): string | null {
  if (!name.trim()) return "Namn krävs.";
  if (email.trim() && !isValidEmail(email.trim())) return "Ogiltig e-postadress.";
  if (phone.trim() && !isValidPhoneNumber(phone.trim())) return "Ogiltigt telefonnummer.";
  return null;
}

const FIELD_CLS = "w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function ContactsList({ contacts, companyId, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", isPrimary: false });
  const [addError, setAddError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Fields>({ name: "", phone: "", email: "" });
  const [editError, setEditError] = useState<string | null>(null);

  async function handleAdd() {
    const err = validate(form);
    if (err) {
      setAddError(err);
      return;
    }
    await onAdd({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      isPrimary: form.isPrimary,
    });
    setForm({ name: "", phone: "", email: "", isPrimary: false });
    setAddError(null);
    setAdding(false);
  }

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setEditForm({ name: c.name ?? "", phone: c.phone ?? "", email: c.email ?? "" });
    setEditError(null);
  }

  async function handleEditSave(id: string) {
    const err = validate(editForm);
    if (err) {
      setEditError(err);
      return;
    }
    await onUpdate(id, {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
    });
    setEditingId(null);
    setEditError(null);
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
        {contacts.map((c) =>
          editingId === c.id ? (
            <div key={c.id} className="p-3 rounded-lg bg-white border space-y-2">
              <input
                autoFocus
                className={FIELD_CLS}
                placeholder="Namn *"
                value={editForm.name}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, name: e.target.value }));
                  if (editError) setEditError(null);
                }}
              />
              <div className="flex gap-2">
                <input
                  className={FIELD_CLS}
                  placeholder="Telefon"
                  value={editForm.phone}
                  onChange={(e) => {
                    setEditForm((f) => ({ ...f, phone: e.target.value }));
                    if (editError) setEditError(null);
                  }}
                />
                <input
                  className={FIELD_CLS}
                  placeholder="E-post"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm((f) => ({ ...f, email: e.target.value }));
                    if (editError) setEditError(null);
                  }}
                />
              </div>
              {editError && <p className="text-xs text-destructive">{editError}</p>}
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                  Avbryt
                </Button>
                <Button size="sm" onClick={() => handleEditSave(c.id)} disabled={!editForm.name.trim()}>
                  Spara
                </Button>
              </div>
            </div>
          ) : (
            <div
              key={c.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-white border text-sm group hover:border-nordic-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium truncate">{c.name}</span>
                  {c.isPrimary && (
                    <Badge className="text-[10px] py-0 px-1 bg-amber-100 text-amber-800">Primär</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-nordic-600 mt-0.5">
                  {c.phone && (
                    <span className="flex items-center gap-1.5">
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded">
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </a>
                      <PhoneActions phone={c.phone} />
                    </span>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded min-w-0">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {confirmDeleteId === c.id ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-destructive mr-1">Ta bort?</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    title="Bekräfta borttagning"
                    onClick={async () => {
                      await onDelete(c.id);
                      setConfirmDeleteId(null);
                    }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    title="Avbryt"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
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
                    className="h-6 w-6"
                    title="Redigera kontakt"
                    onClick={() => startEdit(c)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    title="Ta bort kontakt"
                    onClick={() => setConfirmDeleteId(c.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )
        )}

        {adding && (
          <div className="p-3 rounded-lg bg-white border space-y-2">
            <input
              autoFocus
              className={FIELD_CLS}
              placeholder="Namn *"
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                if (addError) setAddError(null);
              }}
            />
            <div className="flex gap-2">
              <input
                className={FIELD_CLS}
                placeholder="Telefon"
                value={form.phone}
                onChange={(e) => {
                  setForm((f) => ({ ...f, phone: e.target.value }));
                  if (addError) setAddError(null);
                }}
              />
              <input
                className={FIELD_CLS}
                placeholder="E-post"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (addError) setAddError(null);
                }}
              />
            </div>
            {addError && <p className="text-xs text-destructive">{addError}</p>}
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAdding(false);
                  setAddError(null);
                  setForm({ name: "", phone: "", email: "", isPrimary: false });
                }}
              >
                Avbryt
              </Button>
              <Button size="sm" onClick={handleAdd} disabled={!form.name.trim()}>
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
