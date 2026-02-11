"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
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
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useState } from "react";
// Import to edit species dialog
import EditSpeciesDialog from "./edit-species-dialog";
// Import delete species dialog
import DeleteSpeciesDialog from "./delete-species-dialog";

type Species = Database["public"]["Tables"]["species"]["Row"];

// SpeciesCard tracks sessionID to see which user created it
export default function SpeciesCard({ species, sessionId }: { species: Species; sessionId?: string }) {
  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="relative m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}

      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>

      {/* Detailed view dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full">Learn More</Button>
        </DialogTrigger>

        <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{species.scientific_name}</DialogTitle>
            <DialogDescription>
              Detailed information about {species.scientific_name}. Click &quot;Close&quot; when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <div className="grid w-full gap-4">
            <div>
              <p className="text-sm font-medium">Common Name</p>
              <p className="text-base">{species.common_name ?? "—"}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Kingdom</p>
              <p className="text-base">{species.kingdom}</p>
            </div>

            <div>
              <p className="text-sm font-medium">Total Population</p>
              <p className="text-base">
                {species.total_population !== null && species.total_population !== undefined
                  ? species.total_population.toLocaleString()
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="whitespace-pre-wrap text-base">{species.description ?? "—"}</p>
            </div>

            <div className="flex">
              <DialogClose asChild>
                <Button type="button" className="ml-1 mr-1 flex-auto">
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* If current user is the author, show Edit button */}
      {sessionId && species.author === sessionId ? (
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between">
        <EditSpeciesDialog species={species} />
        <DeleteSpeciesDialog species={species} />
        </div>
      ) : null}
    </div>
  );
}
