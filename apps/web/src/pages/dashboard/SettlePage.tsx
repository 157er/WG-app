import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchSettlementSuggestions, createSettlementRecord, confirmSettlement } from "../../lib/api";
import { SettlementItem } from "../../components/SettlementItem";
import { Spinner } from "../../components/Spinner";

export default function SettlePage() {
  const { groupId = "" } = useParams();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settlementSuggestions", groupId],
    queryFn: () => fetchSettlementSuggestions(groupId),
  });

  const confirmMutation = useMutation({
    mutationFn: async (payload: { fromUserId: string; toUserId: string; amount: number }) => {
      const settlement = await createSettlementRecord(groupId, payload);
      await confirmSettlement(groupId, settlement.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlementSuggestions", groupId] });
    },
  });

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500">Alles ausgeglichen – entspann dich!</p>;
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <SettlementItem
          key={`${item.fromUserId}-${item.toUserId}`}
          from={item.fromUserId}
          to={item.toUserId}
          amount={item.amount}
          currency="EUR"
          onConfirm={() => confirmMutation.mutate(item)}
        />
      ))}
    </div>
  );
}
