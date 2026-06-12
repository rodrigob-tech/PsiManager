import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";

import "/src/styles/calendar.css";

const STATUS_CONFIG = {
  scheduled: {
    label: "Agendado",
    color: "#3498db",
    backgroundColor: "rgba(52, 152, 219, 0.18)",
  },
  confirmed: {
    label: "Confirmado",
    color: "#18bc9c",
    backgroundColor: "rgba(24, 188, 156, 0.18)",
  },
  pending: {
    label: "Pendente",
    color: "#f39c12",
    backgroundColor: "rgba(243, 156, 18, 0.20)",
  },
  canceled: {
    label: "Cancelado",
    color: "#e74c3c",
    backgroundColor: "rgba(231, 76, 60, 0.18)",
  },
  done: {
    label: "Concluído",
    color: "#95a5a6",
    backgroundColor: "rgba(149, 165, 166, 0.20)",
  },
};

const DEFAULT_DURATION_MINUTES = 60;

export default function AppointmentCalendar({
  appointments = [],
  events = [],
  onEventClick,
}) {
  const calendarEvents = buildCalendarEvents(appointments, events);

  return (
    
    <div >
      <div className="calendar-legend mb-3">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <LegendItem
            key={status}
            color={config.color}
            label={config.label}
          />
        ))}
      </div>

      <div className="premium-card p-3">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            bootstrap5Plugin,
          ]}
          themeSystem="bootstrap5"
          locale={ptBrLocale}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
          }}
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: "08:00",
            endTime: "18:00",
          }}
          hiddenDays={[0, 6]}
          allDaySlot={false}
          nowIndicator
          editable={false}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          events={calendarEvents}
          height="auto"
          dayMaxEvents={3}
          eventClick={(info) => {
            if (info.event.display === "background") return;

            if (onEventClick) {
              onEventClick(info.event);
            }
          }}
        />
      </div>
    </div>
  );
}

function buildCalendarEvents(appointments, fallbackEvents) {
  if (appointments?.length) {
    return appointments.flatMap((appointment) => {
      const start = new Date(appointment.date);
      const end = new Date(
        start.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000
      );

      const status = appointment.status || "scheduled";
      const config = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;

      const title = `${appointment.patient?.name || "Paciente"} · ${
        appointment.space?.name || "Espaço"
      }`;

      const commonExtendedProps = {
        appointment,
        appointmentId: appointment.id,
        status,
        patientId: appointment.patientId,
        spaceId: appointment.spaceId,
        psychologistId: appointment.psychologistId,
      };

      return [
        {
          id: appointment.id,
          title,
          start,
          end,
          backgroundColor: config.color,
          borderColor: config.color,
          textColor: "#ffffff",
          extendedProps: commonExtendedProps,
        },
        {
          id: `${appointment.id}-background`,
          start,
          end,
          display: "background",
          backgroundColor: config.backgroundColor,
          extendedProps: commonExtendedProps,
        },
      ];
    });
  }

  return fallbackEvents;
}

function LegendItem({ color, label }) {
  return (
    <div className="calendar-legend-item">
      <span
        className="calendar-legend-dot"
        style={{
          background: color,
        }}
      />
      <span>{label}</span>
    </div>
  );
}