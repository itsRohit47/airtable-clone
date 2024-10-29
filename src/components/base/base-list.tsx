"use client";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { BaseCard } from "./base-card";
import { api } from "@/trpc/react";
import { GetBaseList } from "@/lib/actions/base";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

export function BaseList() {
  const bases = GetBaseList();
  const ctx = api.useUtils();
  const { mutate } = api.base.createBase.useMutation({
    onSuccess: () => {
      void ctx.base.getAllBases.invalidate();
      toast({
        title: "Base created",
        description: "Successfully created a new base",
        action: (
          <ToastAction
            onClick={() => {
              void ctx.base.getAllBases.invalidate();
            }}
            altText={""}
          >
            Refresh
          </ToastAction>
        ),
      });
    },
    onMutate: () => {
      toast({
        title: "Creating base",
        description: "Please wait...",
      });
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col items-center justify-center gap-3">
        <div className="grid gap-y-3">
          {bases?.map((base) => <BaseCard key={base.id} base={base} />) ?? (
            <div>Loading bases...</div>
          )}
          {bases?.length === 0 && <div>No bases found. Create one!</div>}
        </div>

        <Button
          onClick={() => {
            mutate();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Base
        </Button>
      </div>
    </div>
  );
}
