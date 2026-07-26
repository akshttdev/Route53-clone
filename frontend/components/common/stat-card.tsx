import { Card } from "@/components/ui/card";

interface Props {
  title: string;

  value: React.ReactNode;

  icon?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <div className="mt-3 text-3xl font-bold">
            {value}
          </div>
        </div>

        {icon}
      </div>
    </Card>
  );
}