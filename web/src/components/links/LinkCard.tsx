"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Globe, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Link as LinkItem } from "@/types/links";

export default function LinkCard({ link }: { link: LinkItem }) {
  const displayImage = link.og_image;
  const displayDesc = link.description;
  const displayTitle = link.title || "No Title";
  const displayDate = link.saved_at;

  return (
    <Card className="group hover:shadow-md transition-all duration-300 hover:border-primary/50 overflow-hidden flex flex-col h-full bg-card/80 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row h-full px-6">
        <div className="relative w-full md:w-[280px] shrink-0">
          <div className="aspect-video w-full h-full relative">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={displayTitle}
                width={500}
                height={500}
                className="w-full h-full object-cover transition-transform duration-500 absolute inset-0 rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (
                    e.target as HTMLImageElement
                  ).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-muted/50 absolute inset-0 rounded-lg">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
            <div className="hidden w-full h-full absolute inset-0 items-center justify-center text-muted-foreground/30 bg-muted/50">
              <ImageIcon className="w-10 h-10" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col min-w-0 gap-1">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{link.domain}</span>
                </div>
              </div>
              <div
                className="text-xs text-muted-foreground flex items-center"
                title={`保存日: ${displayDate}`}
              >
                {format(new Date(displayDate), "yyyy/MM/dd")}
              </div>
            </div>
            <CardTitle className="text-lg leading-snug whitespace-normal wrap-break-word group-hover:text-primary transition-colors">
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block whitespace-normal wrap-break-word hover:underline decoration-primary/50 underline-offset-4"
              >
                {displayTitle}
              </Link>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {displayDesc && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {displayDesc}
              </p>
            )}
            {link.note && (
              <div className="bg-secondary/50 p-2.5 rounded-md text-xs text-secondary-foreground/90 italic border border-secondary mt-1">
                {link.note}
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
