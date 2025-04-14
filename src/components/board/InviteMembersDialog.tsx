"use client";

import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Check, Copy, UserRoundPlus } from "lucide-react";
import { useId, useRef, useState } from "react";

export function InviteMembersDialog() {
  const id = useId();
  const [emails, setEmails] = useState(["", ""]);
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);

  const addEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleCopy = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 
                       bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 
                       hover:scale-[1.02] shadow-sm hover:shadow group">
          <UserRoundPlus className="w-5 h-5 group-hover:text-primary-500 transition-colors" />
          <span className="font-medium">Invitar participantes</span>
        </button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          lastInputRef.current?.focus();
        }}
      >
        <div className="flex flex-col gap-2">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full 
                     border border-gray-200 dark:border-gray-700"
            aria-hidden="true"
          >
            <UserRoundPlus className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <DialogHeader>
            <DialogTitle>Invitar miembros</DialogTitle>
            <DialogDescription>
              Invita a tus compañeros de equipo a colaborar.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Invitar por email
              </label>
              <div className="space-y-3">
                {emails.map((email, index) => (
                  <Input
                    key={index}
                    id={`team-email-${index + 1}`}
                    placeholder="nombre@empresa.com"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    ref={index === emails.length - 1 ? lastInputRef : undefined}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={addEmail}
              className="text-sm text-primary-500 dark:text-primary-400 hover:underline"
            >
              + Añadir otro
            </button>
          </div>
          <button
            type="button"
            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg 
                     hover:bg-primary-600 transition-colors"
          >
            Enviar invitaciones
          </button>
        </form>

        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

        <div className="space-y-2">
          <label
            htmlFor={id}
            className="text-sm font-medium text-gray-900 dark:text-white"
          >
            Invitar por enlace
          </label>
          <div className="relative">
            <Input
              ref={inputRef}
              id={id}
              className="pr-9"
              type="text"
              defaultValue="https://perfecttext.app/invite/87689"
              readOnly
            />
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopy}
                    className="absolute inset-y-0 right-0 flex h-full w-9 items-center justify-center 
                             rounded-r-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 
                             dark:hover:text-gray-300 transition-colors"
                    aria-label={copied ? "Copiado" : "Copiar al portapapeles"}
                    disabled={copied}
                  >
                    <div
                      className={cn(
                        "transition-all",
                        copied ? "scale-100 opacity-100" : "scale-0 opacity-0"
                      )}
                    >
                      <Check className="text-green-500" size={16} />
                    </div>
                    <div
                      className={cn(
                        "absolute transition-all",
                        copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                      )}
                    >
                      <Copy size={16} />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent className="px-2 py-1 text-xs">
                  Copiar al portapapeles
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}