"use client";
import { Suspense, useState, useEffect, useRef } from "react";
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
  const { listView, setListView, checks } = useAppContext();

  const ctx = api.useUtils();
  const router = useRouter();
  const { mutate } = api.base.createBase.useMutation({
    onSuccess: (data) => {
      void ctx.base.getAllBases.invalidate();
      void router.push(`/${data.base.id}/${data.firstTableId}/${data.firstViewId}`);
    },
  });

  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isTutorialOpen');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });
  const [tutorialChecklist, setTutorialChecklist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedChecklist = localStorage.getItem('tutorialChecklist');
      return savedChecklist ? JSON.parse(savedChecklist) : [];
    }
    return [];
  });
  const tutorialRef = useRef<HTMLDivElement>(null);
  const [showChecklist, setShowChecklist] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('showChecklist');
      return savedState ? JSON.parse(savedState) : false;
    }
    return false;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tutorialRef.current &&
        !tutorialRef.current.contains(event.target as Node)
      ) {
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tutorialRef]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorialChecklist', JSON.stringify(tutorialChecklist));
    }
  }, [tutorialChecklist]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isTutorialOpen', JSON.stringify(isTutorialOpen));
    }
  }, [isTutorialOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showChecklist', JSON.stringify(showChecklist));
    }
  }, [showChecklist]);

  const handleChecklistChange = (item: string) => {
    setTutorialChecklist((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleToggleTutorial = () => {
    setIsTutorialOpen(!isTutorialOpen);
    if (isTutorialOpen) {
      setShowChecklist(false);
    }
  };

  return (
    <AuthGuard>
      <div className="">
        <NavBar />
        <Sidebar />
        <SideMenu />
        <div className="lg:pl-24 pr-12 lg:pt-28">
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
        <div className="fixed bottom-0 border-t border-gray-300 bg-white p-2 text-xs text-gray-500 flex justify-between items-center">
          <button
            onClick={handleToggleTutorial}
            className="ml-4 px-3 py-2 bg-violet-500 text-white rounded-md fixed bottom-10 right-4"
          >
            {isTutorialOpen ? "Close" : " Show Demo"}
          </button>
          {isTutorialOpen && (
            <div ref={tutorialRef} className="fixed bottom-20 right-4 w-max max-w-96 bg-white border border-gray-300 shadow-lg rounded-md p-4 grid gap-4 grid-cols-1">
              {showChecklist ? (
                <div className="list-none">
                  <div className="flex flex-col">
                    {checks.map((item) => (
                      <span key={item} className="flex items-start gap-1">
                        <input
                          type="checkbox"
                          checked={tutorialChecklist.includes(item)}
                          onChange={() => handleChecklistChange(item)}
                        />{" "}
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <iframe
                  width="100%"
                  height="200"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              <button
                onClick={() => setShowChecklist(!showChecklist)}
                className=" px-3 py-2 bg-gray-200 text-black rounded-md"
              >
                {showChecklist ? "Show Demo Video" : "What can i test?"}
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
