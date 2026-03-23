"use client";
import { useState } from "react";
import {
  EntityContainer,
  EntityHeader,
  EntitySearch,
  EntityList,
  EntityItem,
  EntityPagination,
  EntityAvatar,
  EntityBadge,
  EmptyView,
} from "@/components/entityComponents";
import { KeyIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteCredential, useSuspenseCredentials } from "../hooks/use-credentials";
import { formatDate, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


export default function CredentialsPage() {
  const { data:credentials } = useSuspenseCredentials()
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const deleteCredential = useDeleteCredential();

  const filteredCredentials = credentials.filter((cred) =>
    cred.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(key);
    toast.info("Credential copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <EntityContainer
      className="flex flex-col overflow-auto w-full h-full"
      header={
        <EntityHeader
          title="Credentials"
          description="Securely manage your API keys and access tokens"
          newButtonLabel="Add Credential"
          onNew={() => router.push("/credentials/create")}
        />
      }
      search={
        <EntitySearch
          value={search}
          onChange={setSearch}
          placeholder="Search credentials..."
        />
      }
      pagination={
        <EntityPagination
          page={page}
          totalPages={2}
          onPageChange={setPage}
        />
      }
    >
      <EntityList
        items={filteredCredentials}
        getKey={(cred) => cred.id}
        emptyView={
          <EmptyView
            title="No credentials found"
            message="Add your first API key or access token"
            onNew={() => console.log("Add credential")}
            newButtonLabel="Add Credential"
          />
        }
        renderItem={(cred) => (
          <EntityItem
            title={cred.type}
            className="flex flex-row h-18 items-center"
            subtitle={`Created ${formatDate(cred.createdAt, "dd MMMM yyyy")} • Last used ${formatDistanceToNow(new Date(cred.updatedAt), {
              addSuffix:true
            })}`}
            image={
              <EntityAvatar
                icon={KeyIcon}
                variant={"default"}
              />
            }
            badge={
              <EntityBadge variant={"success"}>
                {"Active"}
              </EntityBadge>
            }
            actions={
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopy(cred.apiKey);
                  }}
                >
                  {copiedId === cred.id ? (
                    <CheckIcon className="size-4 text-emerald-500" />
                  ) : (
                    <CopyIcon className="size-4" />
                  )}
                </Button>
              </div>
            }
            onEdit={() => router.push(`/credentials/${cred.id}/edit`)}
            onRemove={() => deleteCredential.mutate({id: cred.id})}
          />
        )}
      />
    </EntityContainer>
  );
}
