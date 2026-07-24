"use client";

import Link from "next/link";
import { Hand, LogOut, MessageCircle, PlusCircle, Store, User as UserIcon } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UserMenuProps = {
  fullName: string;
  username: string;
  avatarUrl: string | null;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ fullName, username, avatarUrl }: UserMenuProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Messages"
      >
        <Link href="/messages">
          <MessageCircle className="size-5" aria-hidden="true" />
        </Link>
      </Button>
      <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
        <Link href="/sell/new">
          <PlusCircle className="size-4" aria-hidden="true" />
          Sell
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={`Open menu for ${fullName}`}
          >
            <Avatar className="size-8">
              <AvatarImage src={avatarUrl ?? undefined} alt="" />
              <AvatarFallback>{initials(fullName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{fullName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/u/${username}`}>
              <UserIcon className="size-4" aria-hidden="true" />
              View profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages">
              <MessageCircle className="size-4" aria-hidden="true" />
              Messages
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <Store className="size-4" aria-hidden="true" />
              My account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="sm:hidden">
            <Link href="/sell/new">
              <PlusCircle className="size-4" aria-hidden="true" />
              Sell something
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wanted/new">
              <Hand className="size-4" aria-hidden="true" />
              Post a request
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild variant="destructive">
            <form action={signOutAction} className="w-full">
              <button type="submit" className="flex w-full items-center gap-2">
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
