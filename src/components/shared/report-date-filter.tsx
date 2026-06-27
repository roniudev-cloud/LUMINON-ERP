"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

export function ReportDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Helper to get default from date
  const getDefaultFrom = () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    return startOfMonth.toISOString().split("T")[0];
  };

  // Helper to get default to date
  const getDefaultTo = () => {
    return new Date().toISOString().split("T")[0];
  };

  const urlFrom = searchParams.get("from") || getDefaultFrom();
  const urlTo = searchParams.get("to") || getDefaultTo();

  const [prevUrlFrom, setPrevUrlFrom] = useState(urlFrom);
  const [prevUrlTo, setPrevUrlTo] = useState(urlTo);
  const [fromDate, setFromDate] = useState(urlFrom);
  const [toDate, setToDate] = useState(urlTo);

  if (urlFrom !== prevUrlFrom) {
    setPrevUrlFrom(urlFrom);
    setFromDate(urlFrom);
  }
  if (urlTo !== prevUrlTo) {
    setPrevUrlTo(urlTo);
    setToDate(urlTo);
  }

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (fromDate) params.set("from", fromDate);
    else params.delete("from");
    
    if (toDate) params.set("to", toDate);
    else params.delete("to");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 bg-card p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center gap-2 mr-2 text-muted-foreground">
        <Calendar className="w-5 h-5" />
        <span className="font-medium text-sm hidden sm:inline-block">Lọc thời gian</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 flex-1 w-full sm:flex sm:w-auto">
        <div className="space-y-1">
          <Label htmlFor="from-date" className="text-xs">Từ ngày</Label>
          <Input 
            id="from-date"
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full sm:w-[150px] h-9"
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="to-date" className="text-xs">Đến ngày</Label>
          <Input 
            id="to-date"
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full sm:w-[150px] h-9"
          />
        </div>
      </div>

      <div className="flex gap-2 w-full sm:w-auto pt-1 sm:pt-0">
        <Button onClick={handleApply} className="w-full sm:w-auto h-9" size="sm">
          Áp dụng
        </Button>
        {(searchParams.get("from") || searchParams.get("to")) && (
          <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto h-9" size="sm">
            Xóa lọc
          </Button>
        )}
      </div>
    </div>
  );
}
