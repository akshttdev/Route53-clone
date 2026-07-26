interface Props {
  title: string;

  description?: string;

  actions?: React.ReactNode;
}

export function PageTitle({
  title,
  description,
  actions,
}: Props) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {actions}
    </div>
  );
}