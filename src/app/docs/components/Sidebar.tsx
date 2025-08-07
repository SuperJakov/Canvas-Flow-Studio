"use client";
import Link from "next/link";
import { ChevronRight, MessageSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "~/components/ui/sidebar";

// Types for documentation structure
export interface DocSection {
  title: string;
  slug: string;
}

export interface DocChapter {
  title: string;
  slug: string;
  sections: DocSection[];
}

interface DocsSidebarProps {
  chapters: DocChapter[];
  activeChapter: string;
  activeSection: string;
}

export default function DocsSidebar({
  chapters,
  activeChapter,
  activeSection,
}: DocsSidebarProps) {
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar className="pt-16 md:pt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chapters.map((chapter) => (
                <SidebarMenuItem key={chapter.slug}>
                  <SidebarMenuButton
                    asChild
                    className="font-bold text-wrap transition"
                  >
                    <Link
                      href={`/docs/${chapter.slug}/${chapter.sections[0]?.slug ?? ""}`}
                      prefetch={true}
                      className="break-words whitespace-normal"
                      onClick={handleLinkClick}
                    >
                      {chapter.title}
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    {chapter.sections.map((section) => (
                      <SidebarMenuSubItem key={section.slug}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={
                            activeChapter === chapter.slug &&
                            activeSection === section.slug
                          }
                          className="text-wrap"
                        >
                          <Link
                            href={`/docs/${chapter.slug}/${section.slug}`}
                            aria-current={
                              activeChapter === chapter.slug &&
                              activeSection === section.slug
                                ? "page"
                                : undefined
                            }
                            className="break-words whitespace-normal"
                            onClick={handleLinkClick}
                          >
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">{section.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto p-4">
        <Button className="w-full" variant={"ghost"} id="feedback-button">
          {/* Posthog will activate survey */}
          <MessageSquare className="mr-2 h-4 w-4" />
          Feedback
        </Button>
      </div>
    </Sidebar>
  );
}
