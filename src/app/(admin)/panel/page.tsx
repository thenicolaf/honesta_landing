import { AdminPageHeader } from "../_components/AdminPageHeader";
import { Card } from "@/shared/ui";

export default function PanelPage() {
  return (
    <div>
      <AdminPageHeader title="Admin Panel" />
      <Card className="p-6 border border-heading/10">
        <p className="font-body font-light text-earth/60 text-sm">
          Добро пожаловать в панель администратора. Разделы появятся здесь.
        </p>
      </Card>
    </div>
  );
}
