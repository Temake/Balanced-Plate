import React, { useState } from "react";

const MIN_YEAR = 1900;
const MAX_YEAR = new Date().getFullYear();
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export interface CustomCalendarProps {
  value?: string;
  onChange: (date: string | undefined) => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ value, onChange }) => {
  const initialDate = value ? new Date(value) : new Date();
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  // Only allow selection up to today
  const today = new Date();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(Number(e.target.value));
    setSelectedDay(1);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(Number(e.target.value));
    setSelectedDay(1);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const selectedDate = new Date(year, month, day);
    if (
      selectedDate > today ||
      selectedDate < new Date("1900-01-01")
    ) {
      return;
    }

  const yearStr = selectedDate.getFullYear();
  const monthStr = String(selectedDate.getMonth() + 1).padStart(2, "0");
  const dayStr = String(selectedDate.getDate()).padStart(2, "0");
  onChange(`${yearStr}-${monthStr}-${dayStr}`);
  };

  // Generate year options
  const years = [];
  for (let y = MAX_YEAR; y >= MIN_YEAR; y--) {
    years.push(y);
  }

  // Generate day grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const dayButtons = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    dayButtons.push(<div key={"empty-" + i} className="w-8 h-8" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const disabled =
      dateObj > today || dateObj < new Date("1900-01-01");
    dayButtons.push(
      <button
        key={d}
        className={`w-8 h-8 rounded-full mx-1 my-1 text-sm ${
          d === selectedDay &&
          year === initialDate.getFullYear() &&
          month === initialDate.getMonth()
            ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-green-100"
        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        disabled={disabled}
        onClick={() => handleDayClick(d)}
        type="button"
      >
        {d}
      </button>
    );
  }

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-2">
        <select
          value={year}
          onChange={handleYearChange}
          className="border rounded px-2 py-1"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={month}
          onChange={handleMonthChange}
          className="border rounded px-2 py-1"
        >
          {MONTHS.map((m, idx) => (
            <option key={m} value={idx}>{m}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayButtons}
      </div>
    </div>
  );
};

export default CustomCalendar;
