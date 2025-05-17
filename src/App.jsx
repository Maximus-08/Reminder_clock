import React, { useState, useEffect } from "react";
import "./App.css";
import "./styles.css";

const coreActivities = [
  { label: "Sleep", key: "sleepTime", default: 8 },
  { label: "Chores", key: "choreTime", default: 1 },
  { label: "Travel", key: "travelTime", default: 1 },
  { label: "Work/School", key: "workTime", default: 8 },
  { label: "Miscellaneous", key: "miscTime", default: 2 },
];

function pad(n) {
  return n.toString().padStart(2, "0");
}

function getLocalDateTimeValue(date) {
  const pad2 = n => n.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad2(date.getMonth() + 1) +
    "-" +
    pad2(date.getDate()) +
    "T" +
    pad2(date.getHours()) +
    ":" +
    pad2(date.getMinutes())
  );
}

function getTimeUnits(targetDate) {
  const now = new Date();
  let diff = targetDate - now;
  if (diff < 0) diff = 0;

  let years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
  let tempDate = new Date(now);

  // Years
  while (true) {
    let next = new Date(tempDate);
    next.setFullYear(next.getFullYear() + 1);
    if (next > targetDate) break;
    tempDate = next;
    years++;
  }
  // Months
  while (true) {
    let next = new Date(tempDate);
    next.setMonth(next.getMonth() + 1);
    if (next > targetDate) break;
    tempDate = next;
    months++;
  }
  // Days
  let remainingMs = targetDate - tempDate;
  let remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  weeks = Math.floor(remainingDays / 7);
  days = remainingDays % 7;
  let remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  let remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

  hours = remainingHours;
  minutes = remainingMinutes;
  seconds = remainingSeconds;

  return { years, months, weeks, days, hours, minutes, seconds };
}

function getArcPercents(units) {
  return {
    years: Math.min((units.years / 10) * 100, 100),
    months: (units.months / 12) * 100,
    weeks: (units.weeks / 4) * 100,
    days: (units.days / 7) * 100,
    hours: (units.hours / 24) * 100,
    minutes: (units.minutes / 60) * 100,
    seconds: (units.seconds / 60) * 100,
  };
}

function getArcClipPath(percent) {
  const angle = (percent / 100) * 360;
  if (percent <= 0) return "polygon(50% 50%, 50% 0%)";
  if (percent >= 100) return "none";
  const points = ["50% 50%", "50% 0%"];
  const steps = Math.ceil(angle / 3.75);
  for (let i = 1; i <= steps; i++) {
    const a = (i * 3.75) * Math.PI / 180;
    const x = 50 + 50 * Math.sin(a);
    const y = 50 - 50 * Math.cos(a);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(",")})`;
}

const arcConfigs = [
  { class: "years", color: "rgba(255,50,50,0.7)", bg: "rgba(255,50,50,0.1)", top: 0, left: 0, size: 16 },
  { class: "months", color: "rgba(255,150,50,0.7)", bg: "rgba(255,150,50,0.1)", top: 24, left: 24, size: 14 },
  { class: "weeks", color: "rgba(255,255,50,0.7)", bg: "rgba(255,255,50,0.1)", top: 44, left: 44, size: 12 },
  { class: "days", color: "rgba(50,255,50,0.7)", bg: "rgba(50,255,50,0.1)", top: 62, left: 62, size: 10 },
  { class: "hours", color: "rgba(50,150,255,0.7)", bg: "rgba(50,150,255,0.1)", top: 78, left: 78, size: 8 },
  { class: "minutes", color: "rgba(150,50,255,0.7)", bg: "rgba(150,50,255,0.1)", top: 92, left: 92, size: 8 },
  { class: "seconds", color: "rgba(255,50,150,0.7)", bg: "rgba(255,50,150,0.1)", top: 104, left: 104, size: 8 },
];

// --- ClockDisplay (main screen) ---
function ClockDisplay({ units, now }) {
  const arcPercent = getArcPercents(units);

  return (
    <>
      <div className="polar-clock">
        <div className="polar-numbers"></div>
        {/* Arc backgrounds */}
        {arcConfigs.map(cfg => (
          <div
            key={cfg.class + "-bg"}
            className={`arc-background ${cfg.class}-background`}
            style={{
              border: `${cfg.size}px solid ${cfg.bg}`,
              top: cfg.top,
              left: cfg.left,
              width: `calc(100% - ${2 * cfg.top}px)`,
              height: `calc(100% - ${2 * cfg.left}px)`,
              position: "absolute",
              borderRadius: "50%",
              boxSizing: "border-box",
            }}
          />
        ))}
        {/* Progress arcs */}
        {arcConfigs.map(cfg => (
          <div
            key={cfg.class + "-arc"}
            className={`clock-arc ${cfg.class}-arc`}
            style={{
              position: "absolute",
              top: cfg.top,
              left: cfg.left,
              width: `calc(100% - ${2 * cfg.top}px)`,
              height: `calc(100% - ${2 * cfg.left}px)`,
              pointerEvents: "none",
            }}
          >
            <div
              className={`arc-progress ${cfg.class}-progress`}
              style={{
                border: `${cfg.size}px solid ${cfg.color}`,
                borderRadius: "50%",
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                boxSizing: "border-box",
                clipPath: getArcClipPath(arcPercent[cfg.class]),
                transition: "clip-path 0.5s cubic-bezier(.4,2,.6,1)",
              }}
            />
          </div>
        ))}
        {/* Time Remaining */}
        <div className="time-remaining-outer">
          <div className="time-remaining-title">Time Remaining</div>
          <div className="time-remaining-row">
            <div className="time-remaining-unit">
              <div className="time-remaining-value">{units.years}</div>
              <div className="time-remaining-label">Years</div>
            </div>
            <div className="time-remaining-unit">
              <div className="time-remaining-value">{units.months}</div>
              <div className="time-remaining-label">Months</div>
            </div>
            <div className="time-remaining-unit">
              <div className="time-remaining-value">{units.weeks}</div>
              <div className="time-remaining-label">Weeks</div>
            </div>
            <div className="time-remaining-unit">
              <div className="time-remaining-value">{units.days}</div>
              <div className="time-remaining-label">Days</div>
            </div>
            <div className="time-remaining-unit">
              <div className="time-remaining-value">{pad(units.hours)}</div>
              <div className="time-remaining-label">Hours</div>
            </div>
            <div className="time-remaining-unit">
              <div className="time-remaining-value">{pad(units.minutes)}</div>
              <div className="time-remaining-label">Min</div>
            </div>
            <div className="time-remaining-unit">
              <div className="time-remaining-value">{pad(units.seconds)}</div>
              <div className="time-remaining-label">Sec</div>
            </div>
          </div>
        </div>
      </div>
      <div className="clock-bottom-bar">
        {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}{" "}
        {now.toLocaleTimeString()}
      </div>
    </>
  );
}

// --- WidgetClock (widget mode) ---
function WidgetClock({ units }) {
  const arcPercent = getArcPercents(units);

  return (
    <div className="polar-clock" style={{
      position: "relative",
      width: 340,
      height: 340,
      aspectRatio: "1/1",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="polar-numbers"></div>
      {/* Arc backgrounds */}
      {arcConfigs.map(cfg => (
        <div
          key={cfg.class + "-bg"}
          className={`arc-background ${cfg.class}-background`}
          style={{
            border: `${cfg.size}px solid ${cfg.bg}`,
            top: cfg.top * 340 / 500,
            left: cfg.left * 340 / 500,
            width: `calc(100% - ${2 * cfg.top * 340 / 500}px)`,
            height: `calc(100% - ${2 * cfg.left * 340 / 500}px)`,
            position: "absolute",
            borderRadius: "50%",
            boxSizing: "border-box",
          }}
        />
      ))}
      {/* Progress arcs */}
      {arcConfigs.map(cfg => (
        <div
          key={cfg.class + "-arc"}
          className={`clock-arc ${cfg.class}-arc`}
          style={{
            position: "absolute",
            top: cfg.top * 340 / 500,
            left: cfg.left * 340 / 500,
            width: `calc(100% - ${2 * cfg.top * 340 / 500}px)`,
            height: `calc(100% - ${2 * cfg.left * 340 / 500}px)`,
            pointerEvents: "none",
          }}
        >
          <div
            className={`arc-progress ${cfg.class}-progress`}
            style={{
              border: `${cfg.size * 340 / 500}px solid ${cfg.color}`,
              borderRadius: "50%",
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              boxSizing: "border-box",
              clipPath: getArcClipPath(arcPercent[cfg.class]),
              transition: "clip-path 0.5s cubic-bezier(.4,2,.6,1)",
            }}
          />
        </div>
      ))}
      {/* Time Remaining */}
      <div className="widget-time-remaining-outer">
        <div className="widget-time-remaining-title">Time Remaining</div>
        <div className="widget-time-remaining-row">
          <div className="widget-time-remaining-unit">
            <div className="widget-time-remaining-value">{units.years}</div>
            <div className="widget-time-remaining-label">Years</div>
          </div>
          <div className="widget-time-remaining-unit">
            <div className="widget-time-remaining-value">{units.months}</div>
            <div className="widget-time-remaining-label">Months</div>
          </div>
          <div className="widget-time-remaining-unit">
            <div className="widget-time-remaining-value">{units.weeks}</div>
            <div className="widget-time-remaining-label">Weeks</div>
          </div>
          <div className="widget-time-remaining-unit">
            <div className="widget-time-remaining-value">{units.days}</div>
            <div className="widget-time-remaining-label">Days</div>
          </div>
          <div className="widget-time-remaining-unit">
            <div className="widget-time-remaining-value">{pad(units.hours)}</div>
            <div className="widget-time-remaining-label">Hours</div>
          </div>
          <div className="widget-time-remaining-unit">
            <div className="widget-time-remaining-value">{pad(units.minutes)}</div>
            <div className="widget-time-remaining-label">Min</div>
          </div>
          <div className="widget-time-remaining-unit">
            <div className="widget-time-remaining-value">{pad(units.seconds)}</div>
            <div className="widget-time-remaining-label">Sec</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setSeconds(0, 0);
    return d;
  });
  const [activities, setActivities] = useState(() =>
    Object.fromEntries(coreActivities.map(a => [a.key, a.default]))
  );
  const [customActivities, setCustomActivities] = useState([]);
  const [widgetMode, setWidgetMode] = useState(false);
  const [units, setUnits] = useState(getTimeUnits(targetDate));
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setUnits(getTimeUnits(targetDate));
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    document.title = widgetMode
      ? "Polar Clock Widget"
      : "Polar Clock Countdown Timer";
  }, [widgetMode]);

  const handleCoreChange = (key, value) => {
    setActivities(a => ({ ...a, [key]: value }));
  };
  const addCustom = () => {
    setCustomActivities(ca => [...ca, { name: "", hours: 1 }]);
  };
  const updateCustom = (idx, field, value) => {
    setCustomActivities(ca =>
      ca.map((c, i) => (i === idx ? { ...c, [field]: value } : c))
    );
  };
  const removeCustom = idx => {
    setCustomActivities(ca => ca.filter((_, i) => i !== idx));
  };

  const totalDailyCommitted =
    Object.values(activities).reduce((a, b) => a + Number(b || 0), 0) +
    customActivities.reduce((a, c) => a + Number(c.hours || 0), 0);
  const dailyAvailable = Math.max(0, 24 - totalDailyCommitted);

  const totalDays =
    units.years * 365 + units.months * 30 + units.weeks * 7 + units.days;
  const totalHours =
    totalDays * 24 + units.hours + units.minutes / 60 + units.seconds / 3600;
  const availableHours =
    totalDays * dailyAvailable + Math.min(units.hours, dailyAvailable);
  const availableDays = Math.floor(availableHours / 24);
  const remainingAvailableHours = Math.floor(availableHours % 24);
  const percentageAvailable =
    totalHours > 0 ? (availableHours / totalHours) * 100 : 0;

  if (widgetMode) {
    return (
      <div
        className="widget-clock-container"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          minHeight: "100vh",
          minWidth: "100vw",
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#1a0926",
          zIndex: 9999,
        }}
      >
        <button
          style={{
            position: "fixed",
            top: 32,
            right: 48,
            zIndex: 10000,
            background: "#222",
            color: "#fff",
            borderRadius: 6,
            border: "none",
            padding: "8px 18px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.1em",
            boxShadow: "0 2px 8px #000a",
          }}
          onClick={() => setWidgetMode(false)}
        >
          Exit Widget
        </button>
        <div
          className="widget-clock-inner"
          style={{
            width: 400,
            height: 400,
            background: "#181c2a",
            borderRadius: 24,
            boxShadow: "0 2px 16px #000a",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WidgetClock units={units} />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="date-setup">
        <h2 className="setup-title">Set Target Date for Countdown</h2>
        <input
          type="datetime-local"
          value={getLocalDateTimeValue(targetDate)}
          onChange={e => {
            const val = e.target.value;
            if (val) {
              const [date, time] = val.split("T");
              const [year, month, day] = date.split("-").map(Number);
              const [hour = 0, minute = 0] = (time || "00:00").split(":").map(Number);
              setTargetDate(new Date(year, month - 1, day, hour, minute));
            }
          }}
        />
      </div>

      <div className="daily-activities">
        <h2 className="setup-title">Daily Activities Time (hours per day)</h2>
        <div className="activities-form">
          {coreActivities.map(a => (
            <div className="activity-input" key={a.key}>
              <label>{a.label}:</label>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={activities[a.key]}
                onChange={e => handleCoreChange(a.key, +e.target.value)}
              />
            </div>
          ))}
          {customActivities.map((c, idx) => (
            <div className="activity-input" key={idx}>
              <input
                type="text"
                placeholder="Custom"
                value={c.name}
                style={{ width: 80 }}
                onChange={e => updateCustom(idx, "name", e.target.value)}
              />
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={c.hours}
                onChange={e => updateCustom(idx, "hours", +e.target.value)}
              />
              <button
                type="button"
                className="removeActivityBtn"
                onClick={() => removeCustom(idx)}
                title="Remove Activity"
                style={{ display: "flex", alignItems: "center", fontSize: "1.3em" }}
              >
                <span role="img" aria-label="delete" style={{ color: "#ff5555" }}>🗑️</span>
              </button>
            </div>
          ))}
          <button id="addActivityBtn" type="button" onClick={addCustom}>
            <i className="fa fa-plus"></i> Add Activity
          </button>
          <div className="total-daily-time">
            <span>Total daily committed hours: </span>
            <span id="totalDailyHours">{totalDailyCommitted.toFixed(1)}</span>
            <span> / 24</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right", margin: "10px 0" }}>
        <button
          id="widgetModeBtn"
          title="Show only the clock for widget/home screen"
          onClick={() => setWidgetMode(true)}
        >
          <i className="fa fa-desktop"></i> Widget Mode
        </button>
      </div>

      <div className="main-content">
        <div className="clock-container" style={{
          width: 500,
          height: 500,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <ClockDisplay units={units} now={now} />
        </div>
      </div>

      <div className="time-legend">
        <div className="legend-title">Time Units</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color years-color"></div>
            <span>Years</span>
          </div>
          <div className="legend-item">
            <div className="legend-color months-color"></div>
            <span>Months</span>
          </div>
          <div className="legend-item">
            <div className="legend-color weeks-color"></div>
            <span>Weeks</span>
          </div>
          <div className="legend-item">
            <div className="legend-color days-color"></div>
            <span>Days</span>
          </div>
          <div className="legend-item">
            <div className="legend-color hours-color"></div>
            <span>Hours</span>
          </div>
          <div className="legend-item">
            <div className="legend-color minutes-color"></div>
            <span>Minutes</span>
          </div>
          <div className="legend-item">
            <div className="legend-color seconds-color"></div>
            <span>Seconds</span>
          </div>
        </div>
      </div>

      <div className="countdown-info" id="countdown-info">
        Target: {targetDate.toLocaleString()}
      </div>

      <div className="available-time-info">
        <h3>Real Available Time</h3>
        {totalDailyCommitted > 24 && (
          <div style={{ color: "#ff5555", fontWeight: "bold", marginBottom: 10 }}>
            Warning: Your daily committed hours exceed 24 hours ({totalDailyCommitted.toFixed(1)} hrs/day)!
          </div>
        )}
        <div>Your daily committed time: {totalDailyCommitted.toFixed(1)} hrs/day</div>
        <div>Your daily available time: {dailyAvailable.toFixed(1)} hrs/day</div>
        <div style={{ marginTop: 10 }}>
          Total countdown time: {totalDays} days, {units.hours} hrs
        </div>
        <div style={{ fontWeight: "bold", color: "#6fbbdf", marginTop: 5 }}>
          Real available time: {availableDays} days, {remainingAvailableHours} hrs
        </div>
        <div style={{ marginTop: 10 }}>
          Only <span style={{ color: "#6fbbdf", fontWeight: "bold" }}>{percentageAvailable.toFixed(1)}%</span> of your countdown time is actually available for focused work
        </div>
      </div>
    </div>
  );
}

export default App;
