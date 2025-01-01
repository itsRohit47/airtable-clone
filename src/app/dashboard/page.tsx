"use client";
import { Suspense } from "react";
import { BaseList } from "@/components/base/base-list";
import AuthGuard from "@/components/auth-guard";
import NavBar from "@/components/dashboard/nav-bar";
import Sidebar from "@/components/dashboard/side-bar";
import SideMenu from "@/components/dashboard/side-menu";
import ThatCard from "@/components/dashboard/that-card";
import { ChevronDown, ListIcon, Grid2X2Icon } from "lucide-react";
import { useAppContext } from "@/components/context";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import clsx from "clsx";

export default function DashboardPage() {
  const { listView, setListView } = useAppContext();
  const ctx = api.useUtils();
  const router = useRouter();
  const { mutate } = api.base.createBase.useMutation({
    onSuccess: (data) => {
      void ctx.base.getAllBases.invalidate();
      void router.push(`/${data.base.id}/${data.firstTableId}/${data.firstViewId}`);
    },
  });
  return (
    <AuthGuard>
      <div className="">
        <NavBar />
        <Sidebar />
        <SideMenu />
        <div className="lg:px-24 lg:pt-28">
          <h1 className="text-3xl font-semibold">Home</h1>
          <br></br>
          <div className="flex w-full flex-wrap items-center justify-between gap-x-5 lg:flex-nowrap">
            <ThatCard
              icon="audio"
              title="Start with Ai"
              description="Turn your process into an app with data and interfaces using AI."
            />
            <ThatCard
              icon="box"
              title="Start with templates"
              description="Select a template to get started and customize as you go."
            />
            <ThatCard
              icon="arrow"
              title="Quickly upload"
              description="Easily migrate your existing projects in just a few minutes."
            />
            <ThatCard
              icon="table"
              title="Start from scratch"
              description="Create a new blank base with custom tables, fields, and views."
              onClick={() => {
                mutate();
              }}
            />
          </div>
          <br></br>
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center gap-x-3">
              <div className="flex cursor-pointer items-center gap-x-2 text-sm hover:text-black">
                <p>Opened by you</p>
                <ChevronDown size={20} />
              </div>
              <div className="flex cursor-pointer items-center gap-x-2 text-sm hover:text-black">
                <p>Show all types</p>
                <ChevronDown size={20} />
              </div>
            </div>
            <div className="flex items-center gap-x-2 text-sm">
              <button
                className={clsx("rounded-full p-2", {
                  "bg-gray-200/50": listView,
                })}
                onClick={() => {
                  setListView(!listView);
                }}
              >
                <ListIcon size={20} />
              </button>
              <button
                className={clsx("rounded-full p-2", {
                  "bg-gray-200/50": !listView,
                })}
                onClick={() => {
                  setListView(!listView);
                }}
              >
                <Grid2X2Icon size={20} />
              </button>
            </div>
          </div>
        </div>
        <br></br>
        <Suspense fallback={<div>Loading bases...</div>}>
          <BaseList />
        </Suspense>
      </div>
    </AuthGuard>
  );
}
