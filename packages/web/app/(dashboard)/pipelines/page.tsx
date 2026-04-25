import Link from "next/link";
import { ArchiveIcon, ExternalLinkIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { PipelinePicker } from "@/components/PipelinePicker";
import { Button } from "@/components/ui/button";

export default function PipelinesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trabajo"
        title="Pipelines"
        description="Workflows multi-agent listos para ejecutar. Cada uno orquesta varios agents Mastra en cascada con validación por sandbox."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/library">
                <ArchiveIcon /> Library
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="http://localhost:4111" target="_blank" rel="noreferrer">
                <ExternalLinkIcon /> Studio
              </a>
            </Button>
          </>
        }
      />
      <PipelinePicker />
    </>
  );
}
