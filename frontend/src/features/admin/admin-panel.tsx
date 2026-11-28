"use client";

import { useState } from "react";
import SpotManagement from "./streetspots/spot-management";
import UserManagement from "./users/user-management";

const tabs = [
  "User management",
  "Article management",
  "Event management",
  "Skatepark management",
  "Spot management",
] as const;

type AdminTab = (typeof tabs)[number];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("User management");

  return (
    <div className="min-h-screen w-full bg-main-background flex flex-col items-center pb-20">
      <div className="w-full max-w-[1300px] mt-10 sm:mt-20 flex flex-col md:flex-row items-start px-2 gap-4">
        <aside className="flex flex-row md:flex-col w-full md:w-60 border rounded-lg overflow-hidden shrink-0 md:sticky md:top-24">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium w-full transition-colors ${
                activeTab === tab
                  ? "bg-gray-200 text-gray-800"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </aside>

        <main className="flex-1 md:ml-8 w-full">
          {activeTab === "Spot management" && <SpotManagement />}
          {activeTab === "User management" && <UserManagement />}
        </main>
      </div>
    </div>
  );
}
