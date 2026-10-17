"use client";

import { useEffect, useId, useRef, useState } from "react";
import { getUI, setUI, useUI, type CardVariant } from "@/lib/store";
import { getLenis, scrollToSection } from "@/lib/scroll";
import { Emblem } from "./Emblem";

function useModal(kind: "account" | "login", open: boolean) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      getLenis()?.stop();
    } else if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      if (getUI().dialog === kind) setUI({ dialog: null });
      if (!getUI().dialog) getLenis()?.start();
    };
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close(); // backdrop click
    };
    d.addEventListener("close", onClose);
    d.addEventListener("click", onClick);
    return () => {
      d.removeEventListener("close", onClose);
      d.removeEventListener("click", onClick);
    };
  }, [kind]);
  return ref;
}

const dialogClass =
  "glass m-auto w-[min(560px,calc(100vw-2rem))] max-h-[calc(100svh-2rem)] overflow-y-auto rounded-[28px] p-0 text-ivory shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop:bg-ink/70 backdrop:backdrop-blur-sm open:animate-[dialog-in_0.5s_cubic-bezier(0.16,1,0.3,1)]";

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Close" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-line text-mist transition-colors hover:text-ivory">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" /></svg>
    </button>
  );
}

function Field({ label, error, children, id }: { label: string; error?: string; children: React.ReactNode; id: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="eyebrow !text-[0.66rem]">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="text-xs text-ember">{error}</p>}
    </div>
  );
}

const inputClass =
  "h-12 rounded-2xl border border-line bg-white/[0.03] px-4 text-[0.95rem] text-ivory placeholder:text-faint outline-none transition-colors focus:border-gold aria-[invalid=true]:border-ember";

export function AccountDialog() {
  const open = useUI((s) => s.dialog === "account");
  const selected = useUI((s) => s.variant);
  const ref = useModal("account", open);
  const uid = useId();
  const [done, setDone] = useState<null | { name: string; card: CardVariant }>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [card, setCard] = useState<CardVariant>(selected);

  useEffect(() => {
    if (open) {
      setDone(null);
      setErrors({});
      setCard(selected);
    }
  }, [open, selected]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const region = String(f.get("region") || "");
    const consent = f.get("consent") === "on";
    const next: Record<string, string> = {};
    if (name.length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = "Please enter a valid email address.";
    if (!region) next.region = "Please choose a region.";
    if (!consent) next.consent = "Please confirm you understand ASIA is a concept.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = e.currentTarget.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }
    // Nothing is transmitted or stored: ASIA is a fictional brand.
    setDone({ name: name.split(" ")[0], card });
    setUI({ variant: card });
  };

  return (
    <dialog ref={ref} className={dialogClass} aria-labelledby={`${uid}-title`}>
      <div className="relative p-7 sm:p-10">
        <CloseButton onClick={() => ref.current?.close()} />
        {!done ? (
          <form onSubmit={submit} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 pr-10">
              <Emblem size={28} className="text-gold" />
              <h2 id={`${uid}-title`} className="text-3xl font-extralight tracking-tight">Open an ASIA account</h2>
              <p className="text-sm leading-relaxed text-mist">
                A preview of onboarding for a fictional bank. Nothing you type here is sent or stored.
              </p>
            </div>
            <Field label="Full name" id={`${uid}-name`} error={errors.name}>
              <input id={`${uid}-name`} name="name" autoComplete="name" className={inputClass} placeholder="Your name" aria-invalid={!!errors.name} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
            </Field>
            <Field label="Email" id={`${uid}-email`} error={errors.email}>
              <input id={`${uid}-email`} name="email" type="email" autoComplete="email" className={inputClass} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined} />
            </Field>
            <Field label="Home region" id={`${uid}-region`} error={errors.region}>
              <select id={`${uid}-region`} name="region" defaultValue="" className={`${inputClass} appearance-none`} aria-invalid={!!errors.region} aria-describedby={errors.region ? `${uid}-region-err` : undefined}>
                <option value="" disabled>Choose a region</option>
                <option>East Asia</option>
                <option>Southeast Asia</option>
                <option>Central Asia</option>
                <option>South Asia</option>
                <option>Middle East</option>
                <option>Europe</option>
                <option>Americas</option>
                <option>Elsewhere</option>
              </select>
            </Field>
            <fieldset className="flex flex-col gap-3">
              <legend className="eyebrow mb-3 !text-[0.66rem]">Card</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {(["black", "gold", "signature"] as const).map((v) => (
                  <button key={v} type="button" role="radio" aria-checked={card === v} onClick={() => setCard(v)} className="chip-toggle capitalize">
                    <span className={`h-3 w-3 rounded-full ${v === "black" ? "bg-[#1d1c20] ring-1 ring-white/30" : v === "gold" ? "bg-gold" : "bg-[#7a1426]"}`} />
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-mist">
                <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[#d2ad72]" aria-invalid={!!errors.consent} />
                I understand ASIA is a fictional concept and no real account will be created.
              </label>
              {errors.consent && <p role="alert" className="text-xs text-ember">{errors.consent}</p>}
            </div>
            <button type="submit" className="btn btn-primary mt-2 w-full">
              Continue
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-start gap-5 py-4" role="status">
            <Emblem size={36} className="text-gold" />
            <h2 id={`${uid}-title`} className="text-3xl font-extralight tracking-tight">
              Welcome, {done.name}.
            </h2>
            <p className="text-sm leading-relaxed text-mist">
              This is where your ASIA {done.card[0].toUpperCase() + done.card.slice(1)} journey would begin. ASIA is a design concept, so no account
              was created and no data left your browser.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="btn btn-primary flex-1"
                onClick={() => {
                  ref.current?.close();
                  setTimeout(() => scrollToSection("card"), 50);
                }}
              >
                See your card
              </button>
              <button type="button" className="btn btn-ghost flex-1" onClick={() => ref.current?.close()}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

export function LoginDialog() {
  const open = useUI((s) => s.dialog === "login");
  const ref = useModal("login", open);
  const uid = useId();
  return (
    <dialog ref={ref} className={dialogClass} aria-labelledby={`${uid}-title`}>
      <div className="relative flex flex-col gap-5 p-7 sm:p-10">
        <CloseButton onClick={() => ref.current?.close()} />
        <Emblem size={28} className="text-gold" />
        <h2 id={`${uid}-title`} className="pr-10 text-3xl font-extralight tracking-tight">Member access</h2>
        <p className="text-sm leading-relaxed text-mist">
          ASIA is a fictional bank created as a design concept, so there is no account to sign in to. You can explore the app experience
          instead.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn btn-primary flex-1"
            onClick={() => {
              ref.current?.close();
              setTimeout(() => scrollToSection("experience"), 50);
            }}
          >
            Preview the app
          </button>
          <button type="button" className="btn btn-ghost flex-1" onClick={() => setUI({ dialog: "account" })}>
            Open an account
          </button>
        </div>
      </div>
    </dialog>
  );
}
