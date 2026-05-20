import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import "../../src/styles/calendar.css"

export default function AppointmentCalendar({ events, onEventClick }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "18px"
        }}
      >
        <LegendItem color="#2196f3" label="Agendado" />
        <LegendItem color="#4caf50" label="Confirmado" />
        <LegendItem color="#ff9800" label="Pendente" />
        <LegendItem color="#f44336" label="Cancelado" />
        <LegendItem color="#9e9e9e" label="Concluído" />
        <LegendItem color="#616161" label="Horário bloqueado" />
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          padding: "16px",
          border: "1px solid #e5e7eb"
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={ptBrLocale}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay"
          }}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia"
          }}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          }}
          events={events}
          height="auto"
          dayMaxEvents={3}
          eventClick={(info) => {
            if (onEventClick) {
              onEventClick(info.event);
            }
          }}
        />
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#f8f9fc",
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid #e5e7eb",
        fontSize: "14px",
        color: "#444"
      }}
    >
      <span
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "999px",
          background: color,
          display: "inline-block"
        }}
      />
      <span>{label}</span>
    </div>
  );
}