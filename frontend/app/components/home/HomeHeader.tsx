import React from "react";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Link } from "react-router";
import { LayoutList } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

function HomeHeader() {
  return (
    <header
      className={cn(
        "flex flex-row items-center justify-between gap-3 w-full px-6 py-4",
        "border border-border/60 bg-card/40 backdrop-blur-sm",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] md:px-24",
      )}
    >
      <Link
        to="/"
        className="flex flex-row items-center gap-3 no-underline text-foreground hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl"
      >
        <span
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            "bg-primary/20 text-primary",
            "ring-1 ring-primary/30",
          )}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 22 }} />
        </span>
        <div className="flex flex-col items-start gap-0.5">
          <span className="font-semibold text-lg tracking-tight text-foreground">
            DAIL
          </span>
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            Assistant
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/all" className="inline-flex items-center gap-2">
            <LayoutList className="size-4" aria-hidden />
            All cases
          </Link>
        </Button>
      </div>
    </header>
  );
}

export default HomeHeader;
