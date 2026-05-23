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
    dayButtons.push(<div key={"empty-" + i} className="h-9 w-9" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const disabled =
      dateObj > today || dateObj < new Date("1900-01-01");
    dayButtons.push(
      <button
        key={d}
        className={`m-0 h-9 w-9 rounded-full text-sm font-medium transition-colors ${
          d === selectedDay &&
          year === initialDate.getFullYear() &&
          month === initialDate.getMonth()
            ? "bg-green-500 text-white" : "bg-gray-100 text-gray-900 hover:bg-green-100 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
        disabled={disabled}
        onClick={() => handleDayClick(d)}
        type="button"
      >
        {d}
      </button>
    );
  }

  return (
    <div className="w-[min(20rem,calc(100vw-2rem))] p-4">
      <div className="mb-3 flex gap-2">
        <select
          value={year}
          onChange={handleYearChange}
          className="h-10 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select
          value={month}
          onChange={handleMonthChange}
          className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
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
