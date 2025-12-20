
import { MenuSectiontype } from "@/types"
import {
  LayoutDashboard,
  Package,
  Warehouse,
  TruckIcon,
  History,
  Settings,
  ChevronDown,
  User2,
  LogOut,
  Receipt,
  Users,
  MapPin,
  PackagePlus,
  FolderKanban,
  Building2,
  UserCog,
  type LucideIcon,
} from "lucide-react"

export const menuSections: MenuSectiontype[] = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        title: "Company",
        url: "/dashboard/company",
        icon: Building2,
        roles: ["owner"],
      },
      {
        title: "Employees",
        url: "/dashboard/employees",
        icon: UserCog,
        roles: ["owner", "manager"],
      },
      {
        title: "Account",
        url: "/dashboard/account",
        icon: User2,
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Moves",
        url: "/dashboard/moves",
        icon: TruckIcon,
      },
      {
        title: "Receipts",
        url: "/dashboard/receipts",
        icon: Receipt,
      },
    ],
  },
  {
    label: "Stock Management",
    items: [
      {
        title: "Products",
        url: "/dashboard/products",
        icon: Package,
        subItems: [
          {
            title: "All Products",
            url: "/dashboard/products",
          },
        ],
      },
      {
        title: "Inventory",
        url: "/dashboard/inventory",
        icon: FolderKanban,
      },
      {
        title: "Warehouses",
        url: "/dashboard/warehouse",
        icon: Warehouse,
        roles: ["owner", "manager"],
      },
      {
        title: "Locations",
        url: "/dashboard/warehouse-locations",
        icon: MapPin,
      },
      {
        title: "Vendors",
        url: "/dashboard/vendors",
        icon: Users,
        roles: ["owner", "manager"],
      },
    ],
  },
  {
    label: "History",
    items: [
      {
        title: "Move History",
        url: "/dashboard/move-history",
        icon: History,
      },
    ],
  },
]
