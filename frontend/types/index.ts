import { LucideIcon } from "lucide-react"

export interface SubMenuItem {
  title: string
  url: string
}

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
  subItems?: SubMenuItem[]
  roles?: ("owner" | "manager" | "employee")[]
}

export interface MenuSectiontype {
  label: string
  items: MenuItem[]
  roles?: ("owner" | "manager" | "employee")[]
}
