export default function JournalPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 px-6 py-16">
      <h1
        className="text-3xl font-bold tracking-[0.25em]"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        JOURNAL
      </h1>
      <p className="text-sm text-muted-foreground">
        Your days, chronicled as lore by your familiar.
      </p>
    </main>
  );
}
