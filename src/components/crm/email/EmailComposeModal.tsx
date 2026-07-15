"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useState, useEffect } from "react";
import { Bold, Italic, Underline as UnderlineIcon, List, Link as LinkIcon } from "lucide-react";

interface ContactOption {
  id: string;
  name?: string | null;
  email: string;
}

interface Props {
  open: boolean;
  defaultTo?: string;
  defaultSubject?: string;
  threadId?: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  contacts?: ContactOption[];
  onClose: () => void;
  onSent: () => void;
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-nordic-200 text-nordic-900" : "text-muted-foreground hover:bg-nordic-100 hover:text-nordic-900"
      }`}
    >
      {children}
    </button>
  );
}

export function EmailComposeModal({
  open,
  defaultTo,
  defaultSubject,
  threadId,
  companyId,
  contactId,
  ownerId,
  contacts = [],
  onClose,
  onSent,
}: Props) {
  const [to, setTo] = useState(defaultTo ?? "");
  const [selectedContactId, setSelectedContactId] = useState(contactId ?? "");
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // bodyEmpty i state — useEditor re-renderar inte React vid varje tangenttryck,
  // så knappens disabled måste uppdateras via onUpdate (annars förblir Skicka
  // grå trots ifylld text). break-words så långa länkar aldrig spränger bredden.
  const [bodyEmpty, setBodyEmpty] = useState(true);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "min-h-[140px] text-sm px-3 py-2 focus:outline-none break-words [overflow-wrap:anywhere]",
      },
    },
    onUpdate: ({ editor }) => setBodyEmpty(!editor.getText().trim()),
  });

  useEffect(() => {
    if (!open) return;
    setTo(defaultTo ?? "");
    setSelectedContactId(contactId ?? "");
    setSubject(defaultSubject ?? "");
    setError(null);
    editor?.commands.setContent("");
    setBodyEmpty(true);
  }, [open, defaultTo, defaultSubject, contactId, editor]);

  function handleSelectContact(c: ContactOption) {
    setTo(c.email);
    setSelectedContactId(c.id);
  }

  function handleSetLink() {
    if (!editor) return;
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  }

  async function handleSend() {
    if (!to.trim() || !subject.trim() || !editor) return;
    const html = editor.getHTML();
    const text = editor.getText();
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          body: text,
          html,
          companyId,
          contactId: selectedContactId || contactId,
          ownerId,
          threadId: threadId ?? undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error === "gmail_auth" ? d.message : "Fel vid sändning — kontrollera Gmail-koppling.");
        return;
      }
      onSent();
      onClose();
    } finally {
      setSending(false);
    }
  }

  const hasMultipleContacts = contacts.length > 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !sending && onClose()}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Skriv mejl</DialogTitle>
        </DialogHeader>
        {/* min-w-0 så en lång länk i meddelandet inte tvingar grid-kolumnen
            bredare än modalen (då spräcktes bredden och fälten flöt ut). */}
        <div className="space-y-3 min-w-0">
          {hasMultipleContacts && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Välj kontakt</label>
              <div className="flex flex-wrap gap-1.5">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectContact(c)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      to === c.email
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-input bg-white text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {c.name ?? c.email}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Till</label>
            <Input
              value={to}
              onChange={(e) => { setTo(e.target.value); setSelectedContactId(""); }}
              placeholder="kontakt@foretag.se"
              type="email"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Ämne</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ämnesrad"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Meddelande</label>
            <div className="border rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary-500">
              {/* Toolbar */}
              <div className="flex items-center gap-0.5 px-2 py-1 border-b bg-nordic-50">
                <ToolbarBtn
                  active={editor?.isActive("bold")}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  title="Fetstil (⌘B)"
                >
                  <Bold className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn
                  active={editor?.isActive("italic")}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  title="Kursiv (⌘I)"
                >
                  <Italic className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn
                  active={editor?.isActive("underline")}
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  title="Understruken (⌘U)"
                >
                  <UnderlineIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarBtn
                  active={editor?.isActive("bulletList")}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  title="Punktlista"
                >
                  <List className="h-3.5 w-3.5" />
                </ToolbarBtn>
                <ToolbarBtn
                  active={editor?.isActive("link")}
                  onClick={handleSetLink}
                  title="Länk"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </ToolbarBtn>
              </div>
              {/* Editor */}
              <EditorContent editor={editor} />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={sending}>Avbryt</Button>
          <Button
            onClick={handleSend}
            disabled={sending || !to.trim() || !subject.trim() || bodyEmpty}
            title={bodyEmpty ? "Skriv ett meddelande först" : undefined}
          >
            {sending ? "Skickar…" : "Skicka"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
