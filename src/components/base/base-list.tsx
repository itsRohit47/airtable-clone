import { BaseCard } from "./base-card";
import { GetBaseList } from "@/lib/actions/base";
import BaseSkeleton from "../skeletons";
import { Suspense, useState } from "react";
import CreateBaseButton from "../dashboard/create-base-button";
import { useAppContext } from "../context";
import { useRouter } from "next/navigation";
import { Ellipsis, StarIcon } from "lucide-react";
import BaseCardMenu from "./base-card-menu";

export function BaseList() {
  const bases = GetBaseList();
  const { listView } = useAppContext();
  const [clicked, setClicked] = useState(false);
  const [openMoreBaseId, setOpenMoreBaseId] = useState<string | null>(null);
  const router = useRouter();

  return (
    <Suspense fallback={<BaseSkeleton></BaseSkeleton>}>
      <div className="flex w-full flex-col items-start justify-center gap-3 lg:pl-24 lg:pr-12edita" >
        {listView && (bases?.length ?? 0) > 0 && (
          <div className="w-full text-xs">
            <div className="flex w-full gap-3 text-gray-500 border-b pb-2 mb-2">
              <span className="w-full">Name</span>
              <span className="w-full">Type</span>
            </div>
            {bases?.map((base) => (
              <div
                key={base.id}
                onClick={() => router.push(`/${base.id}/${base.tables[0]?.id}/${base.tables[0]?.views[0]?.id}`)}
                className="flex w-full py-2 items-center hover:bg-gray-100 px-2 rounded-md cursor-pointer relative group"
              >
                <div className="flex w-full gap-2 items-center group">
                  <div className={`flex h-full w-max p-1  items-center justify-center rounded-md border bg-gray-500 text-white`}
                  >
                    {base.name.slice(0, 2)}
                  </div>
                  <span className="font-medium">{base.name}</span>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Not implemented yet ( ͡° ͜ʖ ͡°)");
                    }}
                    className="cursor-pointer hidden group-hover:flex"
                  >
                    <StarIcon color="gray" size={16} />
                  </div>
                </div>
                <span className="w-full px-4">Base</span>
                <div className="absolute right-2  hidden gap-x-2 group-hover:flex ">
                  {" "}

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMoreBaseId(openMoreBaseId === base.id ? null : base.id);
                    }}
                    className="cursor-pointer py-4"
                  >
                    <Ellipsis color="gray" size={16} />
                  </div>
                </div>
                {openMoreBaseId === base.id && <BaseCardMenu baseId={base.id} />}
              </div>
            )) ?? <BaseSkeleton />}

          </div>
        )}
        {bases?.length === 0 && (
          <div className="flex w-full flex-col items-center justify-center p-44">
            <div className="text-lg">No bases found</div>
            <p className="text-sm text-gray-500">
              Create a new base to get started or import a base from a CSV
              file.
            </p>
            <CreateBaseButton className="mt-4 rounded-md border bg-white p-2 text-xs text-gray-600 hover:shadow-sm" />
          </div>
        )}
        {!listView && (
          <div className="flex w-full flex-wrap gap-3">
            {bases?.map((base) => (
              <BaseCard
                key={base.id}
                base={{
                  ...base,
                  firsTableId: base.tables[0]?.id ?? "",
                  firstViewId: base.tables[0]?.views[0]?.id ?? "",
                }}
              />
            )) ?? <BaseSkeleton />}
          </div>
        )}
      </div>
    </Suspense>
  );
}
