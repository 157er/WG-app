interface MemberAvatarStackProps {
  members: Array<{ id: string; name?: string | null }>;
}

export function MemberAvatarStack({ members }: MemberAvatarStackProps) {
  return (
    <div className="flex -space-x-2">
      {members.map((member) => (
        <span
          key={member.id}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-xs font-semibold text-white"
          title={member.name ?? "Mitglied"}
        >
          {(member.name ?? "?").slice(0, 2).toUpperCase()}
        </span>
      ))}
    </div>
  );
}
