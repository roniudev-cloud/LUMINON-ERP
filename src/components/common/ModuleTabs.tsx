"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ModuleTabsProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  defaultTab?: string;
  className?: string;
}

/**
 * Lazy-mounting, keep-mounted tabs component.
 * Once a tab is opened, its content stays mounted (no re-render on switch back).
 * Does NOT reload route — purely client-side state.
 */
export function ModuleTabs({ tabs, defaultTab, className }: ModuleTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(
    new Set([defaultTab || tabs[0]?.id || ""])
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setMountedTabs((prev) => new Set([...prev, value]));
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className={className}>
      <TabsList className="w-full flex overflow-x-auto scrollbar-hide justify-start border-b rounded-none bg-transparent p-0 pb-px mb-4">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id} 
            className="flex-none whitespace-nowrap px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} forceMount={mountedTabs.has(tab.id) ? true : undefined}>
          <div className={activeTab === tab.id ? "block" : "hidden"}>
            {mountedTabs.has(tab.id) && tab.content}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
