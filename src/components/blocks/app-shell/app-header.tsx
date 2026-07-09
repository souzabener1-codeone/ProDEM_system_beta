"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/blocks/app-shell/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/blocks/app-shell/custom-sidebar-trigger";
import { navLinks } from "@/components/blocks/app-shell/app-shared";
import { NavUser } from "@/components/blocks/app-shell/nav-user";
import { SendIcon, BellIcon } from "lucide-react";

const activeItem = navLinks.find((item) => item.isActive);

export function AppHeader() {
	return (
		<header
			className={cn(
				"sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 md:px-6"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-3">
				<Button size="icon-sm" variant="outline">
					<SendIcon className="size-4" />
				</Button>
				<Button aria-label="Notifications" size="icon-sm" variant="outline">
					<BellIcon className="size-4" />
				</Button>
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser />
			</div>
		</header>
	);
}
