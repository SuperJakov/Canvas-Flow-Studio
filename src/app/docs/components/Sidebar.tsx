import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
  return (
    <Sidebar className="pt-10">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chapters.map((chapter) => (
                <SidebarMenuItem key={chapter.slug}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeChapter === chapter.slug}
                    className="text-wrap"
                  >
                    <Link
                      href={`/docs/${chapter.slug}/${chapter.sections[0]?.slug ?? ""}`}
                      prefetch={true}
                      className="break-words whitespace-normal"
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
    </Sidebar>
  );
}
