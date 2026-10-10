"use client";
// Shared chart styling: one hue for single-series charts, validated blue/orange pair
// for two-series charts, thin rounded bars, recessive grid, hover tooltips.
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts";

export const SERIES = ["#2465ed", "#eb6834"];
const axis = { stroke: "#e5e7eb", tick: { fill: "#6b7280", fontSize: 11 }, tickLine: false };
const tooltipStyle = { contentStyle: { borderRadius: 10, borderColor: "#e5e7eb", fontSize: 12, boxShadow: "0 12px 32px -12px rgba(36,101,237,0.18)" }, cursor: { fill: "rgba(36,101,237,0.06)" } };

export function SimpleBar({ data, x, y, height = 220, layout = "horizontal", valueFormatter, name }) {
  const vertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={vertical ? "vertical" : "horizontal"} margin={{ top: 8, right: 16, bottom: 0, left: vertical ? 8 : -12 }}>
        <CartesianGrid stroke="#f1f2f4" horizontal={!vertical} vertical={vertical} />
        {vertical ? (
          <>
            <XAxis type="number" {...axis} tickFormatter={valueFormatter} allowDecimals={false} />
            <YAxis type="category" dataKey={x} {...axis} width={190} />
          </>
        ) : (
          <>
            <XAxis dataKey={x} {...axis} />
            <YAxis {...axis} tickFormatter={valueFormatter} allowDecimals={false} />
          </>
        )}
        <Tooltip {...tooltipStyle} formatter={(v) => [valueFormatter ? valueFormatter(v) : v, name || y]} />
        <Bar dataKey={y} name={name || y} fill={SERIES[0]} radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={vertical ? 18 : 26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SimpleLine({ data, x, lines, height = 240, valueFormatter, domain }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
        <CartesianGrid stroke="#f1f2f4" vertical={false} />
        <XAxis dataKey={x} {...axis} />
        <YAxis {...axis} tickFormatter={valueFormatter} domain={domain} />
        <Tooltip contentStyle={tooltipStyle.contentStyle} formatter={(v, n) => [v == null ? "–" : valueFormatter ? valueFormatter(v) : v, n]} />
        {lines.length > 1 && <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: "#475569" }} />}
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={SERIES[i]} strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 5 }} connectNulls />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
