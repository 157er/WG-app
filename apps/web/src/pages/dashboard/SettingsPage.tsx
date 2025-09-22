import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Button, Card } from "@wg-split/ui";
import { fetchGroupDetail, api } from "../../lib/api";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { groupId = "" } = useParams();
  const queryClient = useQueryClient();
  const { data: group } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => fetchGroupDetail(groupId),
  });
  const [name, setName] = useState(group?.name ?? "");

  useEffect(() => {
    if (group?.name) {
      setName(group.name);
    }
  }, [group?.name]);

  const updateMutation = useMutation({
    mutationFn: () => api.patch(`/groups/${groupId}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    },
  });

  return (
    <div className="space-y-6">
      <Card title="Gruppenname" description="Passe die Bezeichnung deiner WG an">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Button type="button" onClick={() => updateMutation.mutate()} loading={updateMutation.isLoading}>
            Speichern
          </Button>
        </div>
      </Card>
      <Card title="Mitglieder" description="Rollen und Zugänge">
        <ul className="divide-y divide-slate-200">
          {group?.members.map((member) => (
            <li key={member.userId} className="flex items-center justify-between py-3 text-sm">
              <span>{member.user?.name ?? member.userId}</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                {member.role}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
