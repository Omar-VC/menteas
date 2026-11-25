import { Badge } from "../ui/Badge";

export interface EstadoPagoProps {
  estado: "pagado" | "pendiente" | "adelantado";
}

const variantes: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pagado: { label: "Pagado", variant: "default" },
  pendiente: { label: "Pendiente", variant: "destructive" },
  adelantado: { label: "Adelantado", variant: "secondary" },
};

export function EstadoPago({ estado }: EstadoPagoProps) {
  const v = variantes[estado];
  return (
    <Badge variant={v.variant} className="whitespace-nowrap">
      {v.label}
    </Badge>
  );
}