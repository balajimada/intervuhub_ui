import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function CompanyPicker({
  value,
  onChange,
  allowCreate = true,
  placeholder = "Search companies…",
  id,
}: {
  value: { id: string; name: string } | null;
  onChange: (company: { id: string; name: string } | null) => void;
  allowCreate?: boolean;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const companies = useQuery({
    queryKey: ["companies", search],
    queryFn: () => api.listCompanies({ search, pageSize: 20 }),
  });

  const create = useMutation({
    mutationFn: () => api.createCompany({ name, code }),
    onSuccess: (company) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      onChange({ id: company.id, name: company.name });
      setCreateOpen(false);
      setOpen(false);
      setName("");
      setCode("");
      toast.success(
        company.status === "Approved"
          ? `${company.name} added.`
          : `${company.name} submitted — pending admin approval, but you can use it now.`,
      );
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Could not add the company.";
      setFormError(message);
      if (error instanceof ApiError && error.status === 401)
        toast.error("Sign in to add a company.");
    },
  });

  const submitCreate = () => {
    setFormError(null);
    if (name.trim().length < 2) return setFormError("Company name must be at least 2 characters.");
    if (name.trim().length > 100) return setFormError("Company name must be under 100 characters.");
    if (!/^[A-Za-z0-9-]{2,15}$/.test(code.trim()))
      return setFormError("Code must be 2-15 letters, numbers or hyphens.");
    create.mutate();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value ? value.name : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type a company name…"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {companies.isLoading ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Searching…
                </div>
              ) : null}
              {!companies.isLoading && (companies.data?.items.length ?? 0) === 0 ? (
                <CommandEmpty>No companies matched.</CommandEmpty>
              ) : null}
              <CommandGroup>
                {value ? (
                  <CommandItem
                    value="__clear"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    <span className="text-muted-foreground">Clear selection</span>
                  </CommandItem>
                ) : null}
                {companies.data?.items.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={company.id}
                    onSelect={() => {
                      onChange({ id: company.id, name: company.name });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.id === company.id ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="truncate">{company.name}</span>
                    <Badge variant="outline" className="ml-auto shrink-0 text-[10px]">
                      {company.code}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {allowCreate && isAuthenticated ? (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setName(search);
                    setCreateOpen(true);
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" aria-hidden />
                  Can&apos;t find it? Add a new company
                </Button>
              </div>
            ) : null}
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a company</DialogTitle>
            <DialogDescription>
              New companies are reviewed by an admin. You can start using it right away.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company name</Label>
              <Input
                id="company-name"
                value={name}
                maxLength={100}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Technologies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-code">Short code</Label>
              <Input
                id="company-code"
                value={code}
                maxLength={15}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. ACME"
              />
            </div>
            {formError ? (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitCreate} disabled={create.isPending}>
              {create.isPending ? "Adding…" : "Add company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
