export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-nordic-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-4 w-full max-w-sm text-center">
        <div className="text-2xl font-semibold text-nordic-900">Väntar på godkännande</div>
        <p className="text-sm text-muted-foreground">
          Ditt konto behöver godkännas av en administratör. Kontakta Kajsa.
        </p>
      </div>
    </div>
  );
}
