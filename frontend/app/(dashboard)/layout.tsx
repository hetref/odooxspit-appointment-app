"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/sidebar"
import { Separator } from "@/components/ui/separator"
// import { PageTransition } from "@/components/page-transition"
import { Loader2 } from "lucide-react"
import Navbar from "@/components/dashboard/navbar";
// import {Navbar} from "@/components/navbar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <h1>hey</h1>
      </div>
    </>
  )
}
