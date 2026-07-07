import {
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  Utensils,
  Dumbbell,
  Bike,
  Music2,
  Ticket,
  Gift,
  GraduationCap,
  Truck,
  Wrench,
  Camera,
  FileText,
  Car,
  PawPrint,
  Sparkles,
  CalendarDays,
  Tag,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  laptop: Laptop,
  sofa: Sofa,
  shirt: Shirt,
  utensils: Utensils,
  dumbbell: Dumbbell,
  bike: Bike,
  music: Music2,
  ticket: Ticket,
  gift: Gift,
  "graduation-cap": GraduationCap,
  truck: Truck,
  wrench: Wrench,
  camera: Camera,
  "file-text": FileText,
  car: Car,
  "paw-print": PawPrint,
  sparkles: Sparkles,
  calendar: CalendarDays,
};

export function getCategoryIcon(name: string): LucideIcon {
  return ICONS[name] ?? Tag;
}
