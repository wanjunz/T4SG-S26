"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function DeleteSpeciesDialog({ species }: { species: Species }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  {/* communciate with supabase to delete from database */}
  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("species").delete().eq("id", species.id);

      if (error) {
        return toast({
          title: "Something went wrong.",
          description: error.message,
          variant: "destructive",
        });
      }

      setOpen(false);
      router.refresh();

      return toast({
        title: "Species deleted",
        description: `${species.scientific_name} was deleted.`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* icon trigger (trash) */}
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Delete species"
          title="Delete"
          className="rounded-full bg-background/90 p-2 text-foreground shadow hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>

      {/* delete message */}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Delete species?</DialogTitle>
          <DialogDescription>
            This will permanently delete <span className="font-medium">{species.scientific_name}</span>. This action
            can’t be undone. Are you sure?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-auto"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>

          <DialogClose asChild>
            <Button type="button" className="flex-auto" variant="secondary" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
