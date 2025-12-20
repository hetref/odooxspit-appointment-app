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
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }
  let navbarmode = process.env.NEXT_PUBLIC_NAVBAR_MODE || "sidebar"
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <h1>hey</h1>
      </div>
    </>
  )
}
