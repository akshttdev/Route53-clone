interface Props {
  title: string;

  description?: string;

  children: React.ReactNode;
}

export function Section({
  title,
  description,
  children,
}: Props) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}